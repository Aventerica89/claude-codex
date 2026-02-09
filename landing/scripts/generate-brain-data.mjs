#!/usr/bin/env node

/**
 * Generate brain data from markdown files in the claude-codex repo.
 * Reads commands/, agents/, skills/, rules/ and outputs typed TS files.
 *
 * Usage: node scripts/generate-brain-data.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const ROOT = path.resolve(import.meta.dirname, '..', '..')
const OUT_DIR = path.resolve(import.meta.dirname, '..', 'src', 'lib', 'generated')

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function safeMatter(raw) {
  try {
    return matter(raw)
  } catch {
    // If YAML frontmatter is malformed, strip it and return empty data
    const stripped = raw.replace(/^---[\s\S]*?---\n?/, '')
    return { data: {}, content: stripped }
  }
}

function slugify(name) {
  return name
    .replace(/\.md$/, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .toLowerCase()
}

function extractFirstHeading(content) {
  const match = content.match(/^#+\s+(.+)$/m)
  return match ? match[1].trim() : null
}

function stripCodeBlocks(content) {
  return content.replace(/```[\s\S]*?```/g, '')
}

function extractReferences(content, knownNames) {
  const stripped = stripCodeBlocks(content)
  const refs = new Set()

  // Match /command-name patterns (preceded by whitespace, backtick, quote, paren, or start of line)
  // Exclude filesystem paths (preceded by . ~ or followed by /)
  const slashPattern = /(?:^|[\s`"'(])(\/((?:[a-zA-Z])(?:[a-zA-Z0-9-])*))(?=[)\s`"',.:;!?\]]|$)/gm
  for (const match of stripped.matchAll(slashPattern)) {
    const name = match[1]
    if (knownNames.has(name)) {
      refs.add(name)
    }
  }

  // Match **bold-name** for agent cross-references
  const boldPattern = /\*\*([a-zA-Z][a-zA-Z0-9-]*)\*\*/g
  for (const match of stripped.matchAll(boldPattern)) {
    const name = match[1]
    if (knownNames.has(name)) {
      refs.add(name)
    }
  }

  return [...refs]
}

function extractFirstParagraph(content) {
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
      return trimmed
    }
  }
  return ''
}

function extractCategory(frontmatter, content) {
  if (frontmatter.category) return frontmatter.category
  const heading = extractFirstHeading(content)
  if (!heading) return 'General'
  const categoryMap = {
    session: 'Session',
    git: 'Git',
    deploy: 'Deploy',
    test: 'Testing',
    security: 'Security',
    build: 'Build',
    context: 'Context',
    learn: 'Learning',
    plan: 'Planning',
    doc: 'Docs',
    release: 'Release',
    ci: 'CI/CD',
    config: 'Config',
    workflow: 'Automation',
    routine: 'Automation',
    codex: 'Codex',
    env: 'Config',
  }
  const lower = heading.toLowerCase()
  for (const [key, cat] of Object.entries(categoryMap)) {
    if (lower.includes(key)) return cat
  }
  return 'General'
}

function extractTags(frontmatter, slug, content) {
  if (frontmatter.tags && Array.isArray(frontmatter.tags)) {
    return frontmatter.tags
  }
  const tags = new Set()
  tags.add(slug)
  const words = slug.split('-').filter(Boolean)
  for (const w of words) {
    if (w.length > 2) tags.add(w)
  }
  return [...tags].slice(0, 5)
}

// ---------------------------------------------------------------------------
// Parsers per type
// ---------------------------------------------------------------------------

function parseCommandFile(filePath, relDir) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data: fm, content } = safeMatter(raw)
  const basename = path.basename(filePath, '.md')
  const dirPrefix = relDir ? `${relDir}/` : ''
  const slug = slugify(dirPrefix + basename)
  const name = `/${dirPrefix}${basename}`.replace(/\/+/g, '/')
  const description = fm.description
    || extractFirstParagraph(content)
    || ''

  return {
    id: `cmd-${slug}`,
    slug,
    name,
    type: 'command',
    description: description.slice(0, 300),
    category: extractCategory(fm, content),
    tags: extractTags(fm, slug, content),
    content: raw,
  }
}

function parseAgentFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data: fm, content } = safeMatter(raw)
  const slug = slugify(path.basename(filePath, '.md'))
  const name = fm.name || slug

  return {
    id: `agent-${slug}`,
    slug,
    name,
    type: 'agent',
    description: (fm.description || extractFirstParagraph(content) || '').slice(0, 300),
    category: extractCategory(fm, content),
    tags: extractTags(fm, slug, content),
    tools: fm.tools ? String(fm.tools).split(',').map(t => t.trim()) : [],
    model: fm.model || 'sonnet',
    content: raw,
  }
}

function parseSkillFile(filePath, kind) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data: fm, content } = safeMatter(raw)
  const dirName = path.basename(path.dirname(filePath))
  const fileBase = path.basename(filePath, '.md')
  const slug = kind === 'learned'
    ? `learned-${slugify(fileBase)}`
    : slugify(dirName !== 'skills' ? dirName : fileBase)
  const name = fm.name || slug

  return {
    id: `skill-${slug}`,
    slug,
    name,
    type: 'skill',
    kind,
    description: (fm.description || extractFirstParagraph(content) || '').slice(0, 300),
    category: extractCategory(fm, content),
    tags: extractTags(fm, slug, content),
    content: raw,
  }
}

function parseRuleFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data: fm, content } = safeMatter(raw)
  const slug = slugify(path.basename(filePath, '.md'))
  const name = fm.name || slug
  const heading = extractFirstHeading(content)

  return {
    id: `rule-${slug}`,
    slug,
    name: heading || name,
    type: 'rule',
    description: (fm.description || extractFirstParagraph(content) || '').slice(0, 300),
    category: extractCategory(fm, content),
    tags: extractTags(fm, slug, content),
    content: raw,
  }
}

// ---------------------------------------------------------------------------
// Collectors
// ---------------------------------------------------------------------------

function collectCommands() {
  const dir = path.join(ROOT, 'commands')
  const items = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      items.push(parseCommandFile(path.join(dir, entry.name), ''))
    } else if (entry.isDirectory()) {
      const subDir = path.join(dir, entry.name)
      for (const sub of fs.readdirSync(subDir)) {
        if (sub.endsWith('.md')) {
          items.push(parseCommandFile(path.join(subDir, sub), entry.name))
        }
      }
    }
  }

  return items.sort((a, b) => a.slug.localeCompare(b.slug))
}

function collectAgents() {
  const dir = path.join(ROOT, 'agents')
  const items = []

  for (const entry of fs.readdirSync(dir)) {
    if (entry.endsWith('.md')) {
      items.push(parseAgentFile(path.join(dir, entry)))
    }
  }

  return items.sort((a, b) => a.slug.localeCompare(b.slug))
}

function collectSkills() {
  const dir = path.join(ROOT, 'skills')
  const items = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      items.push(parseSkillFile(path.join(dir, entry.name), 'core'))
    } else if (entry.isDirectory() && entry.name !== 'learned') {
      const skillMd = path.join(dir, entry.name, 'SKILL.md')
      const promptMd = path.join(dir, entry.name, 'prompt.md')
      if (fs.existsSync(skillMd)) {
        items.push(parseSkillFile(skillMd, 'core'))
      } else if (fs.existsSync(promptMd)) {
        items.push(parseSkillFile(promptMd, 'core'))
      }
    }
  }

  // Learned skills
  const learnedDir = path.join(dir, 'learned')
  if (fs.existsSync(learnedDir)) {
    for (const entry of fs.readdirSync(learnedDir, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        items.push(parseSkillFile(path.join(learnedDir, entry.name), 'learned'))
      } else if (entry.isDirectory()) {
        // Check for SKILL.md or any .md inside
        const inner = path.join(learnedDir, entry.name, 'SKILL.md')
        if (fs.existsSync(inner)) {
          items.push(parseSkillFile(inner, 'learned'))
        }
      }
    }
  }

  return items.sort((a, b) => a.slug.localeCompare(b.slug))
}

function collectRules() {
  const dir = path.join(ROOT, 'rules')
  const items = []

  for (const entry of fs.readdirSync(dir)) {
    if (entry.endsWith('.md')) {
      items.push(parseRuleFile(path.join(dir, entry)))
    }
  }

  return items.sort((a, b) => a.slug.localeCompare(b.slug))
}

// ---------------------------------------------------------------------------
// Code generators
// ---------------------------------------------------------------------------

function escapeForTS(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
}

function generateTypes() {
  return `// Auto-generated by scripts/generate-brain-data.mjs
// Do not edit manually

export type BrainItemType = 'command' | 'agent' | 'skill' | 'rule'
export type SkillKind = 'core' | 'learned'

export interface BaseBrainItem {
  id: string
  slug: string
  name: string
  type: BrainItemType
  description: string
  category: string
  tags: string[]
  content: string
  references: string[]
}

export interface CommandItem extends BaseBrainItem {
  type: 'command'
}

export interface AgentItem extends BaseBrainItem {
  type: 'agent'
  tools: string[]
  model: string
}

export interface SkillItem extends BaseBrainItem {
  type: 'skill'
  kind: SkillKind
}

export interface RuleItem extends BaseBrainItem {
  type: 'rule'
}

export type BrainItem = CommandItem | AgentItem | SkillItem | RuleItem
`
}

function itemToTS(item) {
  const base = [
    `    id: '${item.id}',`,
    `    slug: '${item.slug}',`,
    `    name: '${escapeForTS(item.name)}',`,
    `    type: '${item.type}' as const,`,
    `    description: \`${escapeForTS(item.description)}\`,`,
    `    category: '${escapeForTS(item.category)}',`,
    `    tags: [${item.tags.map(t => `'${escapeForTS(t)}'`).join(', ')}],`,
    `    content: \`${escapeForTS(item.content)}\`,`,
    `    references: [${(item.references || []).map(r => `'${escapeForTS(r)}'`).join(', ')}],`,
  ]

  if (item.type === 'agent') {
    base.push(`    tools: [${item.tools.map(t => `'${t}'`).join(', ')}],`)
    base.push(`    model: '${item.model}',`)
  }

  if (item.type === 'skill') {
    base.push(`    kind: '${item.kind}' as const,`)
  }

  return `  {\n${base.join('\n')}\n  }`
}

function generateDataFile(varName, typeName, items) {
  const header = `// Auto-generated by scripts/generate-brain-data.mjs\n// Do not edit manually\n\n`
  const importLine = `import type { ${typeName} } from './types'\n\n`
  const entries = items.map(itemToTS).join(',\n')
  const body = `export const ${varName}: ${typeName}[] = [\n${entries}\n]\n`
  return header + importLine + body
}

function generateStats(commands, agents, skills, rules) {
  const coreSkills = skills.filter(s => s.kind === 'core')
  const learnedSkills = skills.filter(s => s.kind === 'learned')
  const allItems = [...commands, ...agents, ...skills, ...rules]
  const totalRefs = allItems.reduce((sum, i) => sum + (i.references?.length || 0), 0)
  const itemsWithRefs = allItems.filter(i => i.references?.length > 0).length

  return `// Auto-generated by scripts/generate-brain-data.mjs
// Do not edit manually

export const stats = {
  commands: ${commands.length},
  agents: ${agents.length},
  skills: ${skills.length},
  coreSkills: ${coreSkills.length},
  learnedSkills: ${learnedSkills.length},
  rules: ${rules.length},
  total: ${commands.length + agents.length + skills.length + rules.length},
  references: ${totalRefs},
  itemsWithRefs: ${itemsWithRefs},
} as const
`
}

function generateIndex() {
  return `// Auto-generated by scripts/generate-brain-data.mjs
// Do not edit manually

export type { BrainItemType, BrainItem, CommandItem, AgentItem, SkillItem, RuleItem } from './types'
export { commands } from './commands'
export { agents } from './agents'
export { skills } from './skills'
export { rules } from './rules'
export { stats } from './stats'

import type { BrainItem, BrainItemType } from './types'
import { commands } from './commands'
import { agents } from './agents'
import { skills } from './skills'
import { rules } from './rules'

export const allItems: BrainItem[] = [
  ...commands,
  ...agents,
  ...skills,
  ...rules,
]

// Lookup maps (lazy-initialized)
let _byName: Map<string, BrainItem> | null = null
let _byId: Map<string, BrainItem> | null = null

function ensureNameMap(): Map<string, BrainItem> {
  if (!_byName) {
    _byName = new Map()
    for (const item of allItems) {
      _byName.set(item.name, item)
    }
  }
  return _byName
}

function ensureIdMap(): Map<string, BrainItem> {
  if (!_byId) {
    _byId = new Map()
    for (const item of allItems) {
      _byId.set(item.id, item)
    }
  }
  return _byId
}

export function getItemByName(name: string): BrainItem | undefined {
  return ensureNameMap().get(name)
}

export function getItemById(id: string): BrainItem | undefined {
  return ensureIdMap().get(id)
}

export function getOutgoingRefs(item: BrainItem): BrainItem[] {
  const nameMap = ensureNameMap()
  return item.references
    .map((ref) => nameMap.get(ref))
    .filter((r): r is BrainItem => r !== undefined)
}

export function getIncomingRefs(item: BrainItem): BrainItem[] {
  return allItems.filter((other) =>
    other.references.includes(item.name)
  )
}

export function getReferenceGraph(): {
  nodes: BrainItem[]
  edges: Array<{ source: string; target: string }>
} {
  const nodesWithRefs = allItems.filter(
    (item) => item.references.length > 0
      || allItems.some((o) => o.references.includes(item.name))
  )
  const nodeIds = new Set(nodesWithRefs.map((n) => n.id))
  const nameMap = ensureNameMap()

  const edges: Array<{ source: string; target: string }> = []
  for (const item of nodesWithRefs) {
    for (const ref of item.references) {
      const target = nameMap.get(ref)
      if (target && nodeIds.has(target.id)) {
        edges.push({ source: item.id, target: target.id })
      }
    }
  }

  return { nodes: nodesWithRefs, edges }
}

export function searchBrain(
  query: string,
  typeFilter?: BrainItemType[]
): BrainItem[] {
  const q = query.toLowerCase()

  return allItems.filter((item) => {
    const matchesType = !typeFilter?.length || typeFilter.includes(item.type)
    const matchesQuery =
      !query ||
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tags.some((tag) => tag.toLowerCase().includes(q))

    return matchesType && matchesQuery
  })
}
`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Generating brain data from markdown files...\n')

  const commands = collectCommands()
  const agents = collectAgents()
  const skills = collectSkills()
  const rules = collectRules()

  // Pass 2: extract cross-references using known names
  const allItems = [...commands, ...agents, ...skills, ...rules]
  const knownNames = new Set(allItems.map(i => i.name))

  let totalRefs = 0
  let itemsWithRefs = 0
  for (const item of allItems) {
    const refs = extractReferences(item.content, knownNames)
      .filter(r => r !== item.name)
    item.references = refs
    totalRefs += refs.length
    if (refs.length > 0) itemsWithRefs++
  }

  console.log(`  Commands: ${commands.length}`)
  console.log(`  Agents:   ${agents.length}`)
  console.log(`  Skills:   ${skills.length} (${skills.filter(s => s.kind === 'core').length} core + ${skills.filter(s => s.kind === 'learned').length} learned)`)
  console.log(`  Rules:    ${rules.length}`)
  console.log(`  Total:    ${allItems.length}`)
  console.log(`  References: ${totalRefs} (across ${itemsWithRefs} items)\n`)

  ensureDir(OUT_DIR)

  const files = {
    'types.ts': generateTypes(),
    'commands.ts': generateDataFile('commands', 'CommandItem', commands),
    'agents.ts': generateDataFile('agents', 'AgentItem', agents),
    'skills.ts': generateDataFile('skills', 'SkillItem', skills),
    'rules.ts': generateDataFile('rules', 'RuleItem', rules),
    'stats.ts': generateStats(commands, agents, skills, rules),
    'index.ts': generateIndex(),
  }

  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(OUT_DIR, filename)
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`  Wrote ${filename}`)
  }

  console.log(`\nDone! Generated ${Object.keys(files).length} files in src/lib/generated/`)
}

main()
