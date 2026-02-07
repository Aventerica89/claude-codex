import type { Node, Edge } from '@xyflow/react'
import type {
  BrainItem,
  BrainItemType,
  AgentItem,
  SkillItem,
} from '@/lib/generated/types'
import type { ERNodeData } from '@/components/dashboard/graph/ERNode'

export type RelationshipType =
  | 'uses'
  | 'requires'
  | 'extends'
  | 'calls'
  | 'depends_on'
  | 'references'

interface DetectedRelationship {
  fromId: string
  toId: string
  type: RelationshipType
  strength: number
}

const EDGE_STYLES: Record<RelationshipType, {
  stroke: string
  strokeDasharray?: string
  label: string
}> = {
  uses: { stroke: '#8b5cf6', label: 'uses' },
  requires: { stroke: '#ef4444', label: 'requires' },
  extends: { stroke: '#3b82f6', label: 'extends' },
  calls: { stroke: '#f59e0b', label: 'calls' },
  depends_on: { stroke: '#ec4899', label: 'depends on' },
  references: {
    stroke: '#6b7280',
    strokeDasharray: '5 5',
    label: 'references',
  },
}

/**
 * Transform all brain data items into React Flow nodes and edges.
 * Runs entirely client-side - no DB needed.
 */
export function transformBrainData(items: BrainItem[]): {
  nodes: Node[]
  edges: Edge[]
} {
  const nodes = items.map((item) => itemToNode(item))
  const relationships = detectRelationships(items)
  const edges = relationships.map((rel, i) => relationshipToEdge(rel, i))

  return { nodes, edges }
}

function itemToNode(item: BrainItem): Node {
  const { meta1Label, meta1Value, meta2Label, meta2Value } =
    getMetadata(item)

  const data: ERNodeData = {
    label: item.name,
    itemType: item.type,
    category: item.category,
    meta1Label,
    meta1Value,
    meta2Label,
    meta2Value,
    isHighlighted: false,
    isSelected: false,
  }

  return {
    id: item.id,
    type: 'erNode',
    position: { x: 0, y: 0 }, // assigned by dagre layout
    data,
  }
}

function getMetadata(item: BrainItem): {
  meta1Label: string
  meta1Value: string
  meta2Label: string
  meta2Value: string
} {
  switch (item.type) {
    case 'command':
      return {
        meta1Label: 'Category',
        meta1Value: item.category || 'General',
        meta2Label: 'Tags',
        meta2Value: item.tags.slice(0, 3).join(', ') || 'none',
      }
    case 'agent': {
      const agent = item as AgentItem
      return {
        meta1Label: 'Model',
        meta1Value: agent.model || 'default',
        meta2Label: 'Tools',
        meta2Value: `${agent.tools.length} tools`,
      }
    }
    case 'skill': {
      const skill = item as SkillItem
      return {
        meta1Label: 'Kind',
        meta1Value: skill.kind || 'core',
        meta2Label: 'Tags',
        meta2Value: item.tags.slice(0, 3).join(', ') || 'none',
      }
    }
    case 'rule':
      return {
        meta1Label: 'Category',
        meta1Value: item.category || 'General',
        meta2Label: 'Tags',
        meta2Value: item.tags.slice(0, 3).join(', ') || 'none',
      }
  }
}

/**
 * Client-side relationship detection.
 * Mirrors the server-side logic from relationships.ts but works on BrainItem[].
 */
function detectRelationships(items: BrainItem[]): DetectedRelationship[] {
  const relationships: DetectedRelationship[] = []
  const seen = new Set<string>()

  const addRelationship = (
    fromId: string,
    toId: string,
    type: RelationshipType,
    strength: number
  ) => {
    const key = `${fromId}->${toId}:${type}`
    if (seen.has(key) || fromId === toId) return
    seen.add(key)
    relationships.push({ fromId, toId, type, strength })
  }

  // Build lookup maps
  const bySlug = new Map<string, BrainItem>()
  const byName = new Map<string, BrainItem>()
  for (const item of items) {
    bySlug.set(item.slug.toLowerCase(), item)
    byName.set(item.name.toLowerCase(), item)
  }

  for (const item of items) {
    const content = item.content.toLowerCase()

    // 1. Explicit keyword patterns
    detectExplicitRefs(content, item, items, addRelationship)

    // 2. Command invocations (/command-name)
    detectCommandCalls(content, item, bySlug, addRelationship)

    // 3. Agent name mentions in non-agent content
    detectAgentMentions(content, item, items, addRelationship)

    // 4. Skill name mentions
    detectSkillMentions(content, item, items, addRelationship)
  }

  return relationships
}

function detectExplicitRefs(
  content: string,
  item: BrainItem,
  allItems: BrainItem[],
  add: (from: string, to: string, type: RelationshipType, s: number) => void
) {
  const patterns: Array<{
    re: RegExp
    type: RelationshipType
    targetType: BrainItemType | null
  }> = [
    { re: /uses?\s+agent[:\s]+([a-z0-9_-]+)/gi, type: 'uses', targetType: 'agent' },
    { re: /requires?\s+agent[:\s]+([a-z0-9_-]+)/gi, type: 'requires', targetType: 'agent' },
    { re: /uses?\s+skill[:\s]+([a-z0-9_-]+)/gi, type: 'uses', targetType: 'skill' },
    { re: /requires?\s+skill[:\s]+([a-z0-9_-]+)/gi, type: 'requires', targetType: 'skill' },
    { re: /calls?\s+command[:\s]+([a-z0-9_-]+)/gi, type: 'calls', targetType: 'command' },
    { re: /depends?\s+on[:\s]+([a-z0-9_-]+)/gi, type: 'depends_on', targetType: null },
  ]

  for (const { re, type, targetType } of patterns) {
    for (const match of content.matchAll(re)) {
      const name = match[1].trim()
      const target = findByName(name, allItems, targetType)
      if (target) {
        add(item.id, target.id, type, 3)
      }
    }
  }
}

function detectCommandCalls(
  content: string,
  item: BrainItem,
  bySlug: Map<string, BrainItem>,
  add: (from: string, to: string, type: RelationshipType, s: number) => void
) {
  const commandPattern = /\/([a-z][a-z0-9_-]+)/gi
  for (const match of content.matchAll(commandPattern)) {
    const slug = match[1].toLowerCase()
    const target = bySlug.get(slug)
    if (target && target.type === 'command' && target.id !== item.id) {
      add(item.id, target.id, 'calls', 2)
    }
  }
}

function detectAgentMentions(
  content: string,
  item: BrainItem,
  allItems: BrainItem[],
  add: (from: string, to: string, type: RelationshipType, s: number) => void
) {
  if (item.type === 'agent') return
  const agents = allItems.filter((i) => i.type === 'agent')

  for (const agent of agents) {
    const name = agent.slug.toLowerCase()
    // Match as whole word to avoid false positives
    const pattern = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i')
    if (pattern.test(content)) {
      add(item.id, agent.id, 'references', 1)
    }
  }
}

function detectSkillMentions(
  content: string,
  item: BrainItem,
  allItems: BrainItem[],
  add: (from: string, to: string, type: RelationshipType, s: number) => void
) {
  if (item.type === 'skill') return
  const skills = allItems.filter((i) => i.type === 'skill')

  for (const skill of skills) {
    // Only match multi-word skill names to reduce false positives
    if (skill.slug.length < 4) continue
    const name = skill.slug.toLowerCase()
    const pattern = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i')
    if (pattern.test(content)) {
      add(item.id, skill.id, 'references', 1)
    }
  }
}

function findByName(
  name: string,
  items: BrainItem[],
  type: BrainItemType | null
): BrainItem | undefined {
  const normalized = name.toLowerCase().replace(/[_\s]/g, '-')
  return items.find((item) => {
    const matchesName =
      item.slug.toLowerCase() === normalized ||
      item.name.toLowerCase().replace(/[_\s]/g, '-') === normalized
    const matchesType = !type || item.type === type
    return matchesName && matchesType
  })
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function relationshipToEdge(
  rel: DetectedRelationship,
  index: number
): Edge {
  const style = EDGE_STYLES[rel.type]
  return {
    id: `e-${index}`,
    source: rel.fromId,
    target: rel.toId,
    label: style.label,
    type: 'default',
    animated: rel.strength >= 3,
    style: {
      stroke: style.stroke,
      strokeWidth: rel.strength >= 2 ? 2 : 1,
      strokeDasharray: style.strokeDasharray,
    },
    labelStyle: { fontSize: 10, fill: '#9ca3af' },
  }
}
