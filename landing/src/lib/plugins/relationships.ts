// Relationship Detection - Detect connections between plugin components

import { getDb } from '../db'
import type { ComponentRelationship, RelationshipType, PluginComponent } from './types'

/**
 * Detect and store relationships for a plugin
 */
export async function detectRelationships(pluginId: string): Promise<number> {
  const db = getDb()

  // Get all components for this plugin
  const result = await db.execute({
    sql: 'SELECT * FROM plugin_components WHERE plugin_id = ?',
    args: [pluginId],
  })

  const components = result.rows as unknown as PluginComponent[]

  // Also get all other components to detect cross-plugin relationships
  const allResult = await db.execute('SELECT * FROM plugin_components')
  const allComponents = allResult.rows as unknown as PluginComponent[]

  let relationshipsFound = 0

  // Analyze each component's content
  for (const component of components) {
    if (!component.content) continue

    const relationships = analyzeComponentContent(component, allComponents)

    for (const rel of relationships) {
      try {
        const result = await db.execute({
          sql: `INSERT OR IGNORE INTO component_relationships (
            from_component_id, to_component_id, relationship_type, description, strength
          ) VALUES (?, ?, ?, ?, ?)`,
          args: [
            component.id,
            rel.to_component_id,
            rel.relationship_type,
            rel.description,
            rel.strength,
          ],
        })
        // Only count if actually inserted (not ignored due to duplicate)
        if (result.rowsAffected > 0) {
          relationshipsFound++
        }
      } catch (error) {
        // Only ignore UNIQUE constraint violations, re-throw other errors
        if (error instanceof Error && !error.message.includes('UNIQUE constraint')) {
          throw error
        }
      }
    }
  }

  return relationshipsFound
}

/**
 * Analyze component content to detect relationships
 */
function analyzeComponentContent(
  component: PluginComponent,
  allComponents: PluginComponent[]
): Array<{
  to_component_id: string
  relationship_type: RelationshipType
  description: string | null
  strength: number
}> {
  const relationships: Array<{
    to_component_id: string
    relationship_type: RelationshipType
    description: string | null
    strength: number
  }> = []

  const content = component.content?.toLowerCase() || ''

  // 1. Detect explicit references with keywords
  const explicitPatterns = [
    { pattern: /uses?\s+agent[:\s]+([a-z0-9-]+)/gi, type: 'uses' as RelationshipType, targetType: 'agent' },
    { pattern: /requires?\s+agent[:\s]+([a-z0-9-]+)/gi, type: 'requires' as RelationshipType, targetType: 'agent' },
    { pattern: /uses?\s+skill[:\s]+([a-z0-9-]+)/gi, type: 'uses' as RelationshipType, targetType: 'skill' },
    { pattern: /requires?\s+skill[:\s]+([a-z0-9-]+)/gi, type: 'requires' as RelationshipType, targetType: 'skill' },
    { pattern: /calls?\s+command[:\s]+([a-z0-9-]+)/gi, type: 'calls' as RelationshipType, targetType: 'command' },
    { pattern: /extends?\s+([a-z0-9-]+)/gi, type: 'extends' as RelationshipType, targetType: null },
    { pattern: /depends?\s+on[:\s]+([a-z0-9-]+)/gi, type: 'depends_on' as RelationshipType, targetType: null },
  ]

  for (const { pattern, type, targetType } of explicitPatterns) {
    const matches = Array.from(content.matchAll(pattern))
    for (const match of matches) {
      const targetName = match[1].trim()
      const targetComponent = findComponentByName(targetName, allComponents, targetType)

      if (targetComponent) {
        relationships.push({
          to_component_id: targetComponent.id,
          relationship_type: type,
          description: `${component.name} ${type} ${targetComponent.name}`,
          strength: 3, // High strength for explicit references
        })
      }
    }
  }

  // 2. Detect command invocations (e.g., "/test", "/deploy")
  const commandPattern = /\/([a-z0-9-]+)/gi
  const commandMatches = Array.from(content.matchAll(commandPattern))

  for (const match of commandMatches) {
    const commandName = match[1]
    const targetComponent = findComponentByName(commandName, allComponents, 'command')

    if (targetComponent) {
      relationships.push({
        to_component_id: targetComponent.id,
        relationship_type: 'calls',
        description: `${component.name} calls /${commandName}`,
        strength: 2, // Medium strength for implicit invocations
      })
    }
  }

  // 3. Detect Task tool agent invocations
  const taskAgentPattern = /task\s+tool.*?agent[:\s]+([a-z0-9-]+)/gi
  const taskMatches = Array.from(content.matchAll(taskAgentPattern))

  for (const match of taskMatches) {
    const agentName = match[1]
    const targetComponent = findComponentByName(agentName, allComponents, 'agent')

    if (targetComponent) {
      relationships.push({
        to_component_id: targetComponent.id,
        relationship_type: 'uses',
        description: `${component.name} uses ${agentName} via Task tool`,
        strength: 2,
      })
    }
  }

  // 4. Detect tool references (for agents)
  if (component.type === 'agent') {
    try {
      const tools = JSON.parse(component.tools || '[]') as string[]
      // Tools like Read, Grep, TodoWrite are built-in, not components
      // But we can detect if they reference other custom tools
    } catch (e) {
      // Ignore JSON parse errors
    }
  }

  // 5. Detect dependencies from metadata
  try {
    const dependencies = JSON.parse(component.dependencies || '[]') as string[]
    for (const depName of dependencies) {
      const targetComponent = findComponentByName(depName, allComponents, null)

      if (targetComponent) {
        relationships.push({
          to_component_id: targetComponent.id,
          relationship_type: 'depends_on',
          description: `${component.name} depends on ${targetComponent.name}`,
          strength: 3, // High strength for explicit dependencies
        })
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  // 6. Detect skill invocations (mentioned in prompts)
  for (const otherComponent of allComponents) {
    if (otherComponent.type === 'skill' && otherComponent.id !== component.id) {
      // Look for skill name mentions in content
      const skillNamePattern = new RegExp(`\\b${escapeRegex(otherComponent.name)}\\b`, 'gi')
      if (skillNamePattern.test(content)) {
        relationships.push({
          to_component_id: otherComponent.id,
          relationship_type: 'uses',
          description: `${component.name} uses ${otherComponent.name} skill`,
          strength: 1, // Low strength for name mentions (might be false positive)
        })
      }
    }
  }

  return relationships
}

/**
 * Find a component by name and optional type
 */
function findComponentByName(
  name: string,
  components: PluginComponent[],
  type: string | null
): PluginComponent | null {
  const normalizedName = name.toLowerCase().replace(/[_\s]/g, '-')

  return (
    components.find((c) => {
      const matchesName =
        c.slug.toLowerCase() === normalizedName ||
        c.name.toLowerCase().replace(/[_\s]/g, '-') === normalizedName

      const matchesType = !type || c.type === type

      return matchesName && matchesType
    }) || null
  )
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Get relationship graph for a plugin
 */
export async function getRelationshipGraph(pluginId: string): Promise<{
  nodes: Array<{
    id: string
    type: string
    name: string
    category: string | null
  }>
  edges: Array<{
    from: string
    to: string
    type: RelationshipType
    strength: number
  }>
}> {
  const db = getDb()

  // Get all components for this plugin
  const componentsResult = await db.execute({
    sql: 'SELECT * FROM plugin_components WHERE plugin_id = ?',
    args: [pluginId],
  })

  const components = componentsResult.rows as unknown as PluginComponent[]
  const componentIds = components.map((c) => c.id)

  // Get all relationships involving these components
  let relationships: ComponentRelationship[] = []

  if (componentIds.length > 0) {
    const placeholders = componentIds.map(() => '?').join(',')
    const relationshipsResult = await db.execute({
      sql: `SELECT * FROM component_relationships
            WHERE from_component_id IN (${placeholders})
            OR to_component_id IN (${placeholders})`,
      args: [...componentIds, ...componentIds],
    })
    relationships = relationshipsResult.rows as unknown as ComponentRelationship[]
  }

  // Build nodes
  const nodes = components.map((c) => ({
    id: c.id,
    type: c.type,
    name: c.name,
    category: c.category,
  }))

  // Build edges
  const edges = relationships.map((r) => ({
    from: r.from_component_id,
    to: r.to_component_id,
    type: r.relationship_type,
    strength: r.strength,
  }))

  return { nodes, edges }
}

/**
 * Get all relationships for a component
 */
export async function getComponentRelationships(
  componentId: string
): Promise<{
  outgoing: ComponentRelationship[]
  incoming: ComponentRelationship[]
}> {
  const db = getDb()

  // Get outgoing relationships (this component uses others)
  const outgoingResult = await db.execute({
    sql: 'SELECT * FROM component_relationships WHERE from_component_id = ?',
    args: [componentId],
  })

  // Get incoming relationships (others use this component)
  const incomingResult = await db.execute({
    sql: 'SELECT * FROM component_relationships WHERE to_component_id = ?',
    args: [componentId],
  })

  return {
    outgoing: outgoingResult.rows as unknown as ComponentRelationship[],
    incoming: incomingResult.rows as unknown as ComponentRelationship[],
  }
}

/**
 * Detect circular dependencies
 */
export async function detectCircularDependencies(
  pluginId: string
): Promise<string[][]> {
  const { nodes, edges } = await getRelationshipGraph(pluginId)

  const cycles: string[][] = []
  const visited = new Set<string>()
  const stack = new Set<string>()

  function dfs(nodeId: string, path: string[]): void {
    if (stack.has(nodeId)) {
      // Found a cycle
      const cycleStart = path.indexOf(nodeId)
      cycles.push(path.slice(cycleStart).concat(nodeId))
      return
    }

    if (visited.has(nodeId)) return

    visited.add(nodeId)
    stack.add(nodeId)

    // Find outgoing edges
    const outgoing = edges.filter((e) => e.from === nodeId)

    for (const edge of outgoing) {
      dfs(edge.to, [...path, nodeId])
    }

    stack.delete(nodeId)
  }

  // Check each node
  for (const node of nodes) {
    dfs(node.id, [])
  }

  return cycles
}
