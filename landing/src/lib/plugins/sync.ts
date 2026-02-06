// Plugin Sync Logic - Fetch and sync plugins from sources

import { getDb } from '../db'
import type { Plugin, PluginComponent, PluginSource } from './types'
import {
  parseAnthropicPlugin,
  parseCommunityPlugin,
  listPluginsInRepo,
} from './parsers'

/**
 * Sync all enabled plugin sources
 */
export async function syncAllSources(force: boolean = false): Promise<{
  synced: number
  errors: Array<{ source: string; error: string }>
}> {
  const db = getDb()
  const errors: Array<{ source: string; error: string }> = []
  let synced = 0

  // Get all enabled sources
  const sourcesResult = await db.execute(
    'SELECT * FROM plugin_sources WHERE enabled = 1'
  )

  const sources = sourcesResult.rows as unknown as PluginSource[]

  for (const source of sources) {
    try {
      // Skip if recently synced (unless force)
      if (!force && source.last_synced) {
        const lastSync = new Date(source.last_synced)
        const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60)

        if (hoursSinceSync < 1) {
          console.log(`Skipping ${source.name} - synced ${hoursSinceSync.toFixed(1)}h ago`)
          continue
        }
      }

      console.log(`Syncing ${source.name}...`)

      if (source.type === 'official') {
        await syncAnthropicOfficial()
        synced++
      } else if (source.type === 'community') {
        await syncAwesomeCommunity()
        synced++
      } else if (source.type === 'local') {
        await syncLocalPlugins()
        synced++
      }

      // Update last_synced timestamp
      await db.execute({
        sql: 'UPDATE plugin_sources SET last_synced = ? WHERE id = ?',
        args: [new Date().toISOString(), source.id],
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      errors.push({ source: source.name, error: errorMessage })
      console.error(`Failed to sync ${source.name}:`, errorMessage)
    }
  }

  return { synced, errors }
}

/**
 * Sync Anthropic official plugins
 */
async function syncAnthropicOfficial(): Promise<void> {
  const db = getDb()
  const repoUrl = 'https://raw.githubusercontent.com/anthropics/claude-plugins-official'

  // List all plugins in the repo
  const pluginNames = await listPluginsInRepo(
    'anthropics',
    'claude-plugins-official',
    'plugins'
  )

  console.log(`Found ${pluginNames.length} official plugins`)

  for (const pluginName of pluginNames) {
    try {
      const { plugin, components } = await parseAnthropicPlugin(
        `plugins/${pluginName}`,
        repoUrl
      )

      await savePlugin(plugin as Plugin, components)
      console.log(`  ✓ Synced ${pluginName}`)
    } catch (error) {
      console.error(`  ✗ Failed to sync ${pluginName}:`, error)
    }
  }
}

/**
 * Sync community plugins from awesome-claude-code-plugins
 */
async function syncAwesomeCommunity(): Promise<void> {
  const db = getDb()
  const repoUrl = 'https://raw.githubusercontent.com/ccplugins/awesome-claude-code-plugins'

  // List of specific community plugins to sync
  const communityPlugins = [
    'changelog-generator',
    'codebase-documenter',
    'context7-docs-fetcher',
    'deployment-engineer',
    'frontend-developer',
    'ui-designer',
    'ux-researcher',
  ]

  console.log(`Syncing ${communityPlugins.length} community plugins`)

  for (const pluginName of communityPlugins) {
    try {
      const { plugin, components } = await parseCommunityPlugin(
        `plugins/${pluginName}`,
        repoUrl
      )

      await savePlugin(plugin as Plugin, components)
      console.log(`  ✓ Synced ${pluginName}`)
    } catch (error) {
      console.error(`  ✗ Failed to sync ${pluginName}:`, error)
    }
  }
}

/**
 * Sync local plugins from codex_items
 * This creates a "virtual plugin" from existing items
 */
async function syncLocalPlugins(): Promise<void> {
  const db = getDb()

  // Get all local codex items that aren't plugin-managed
  const result = await db.execute(
    'SELECT * FROM codex_items WHERE is_plugin_managed = 0'
  )

  const items = result.rows as any[]

  if (items.length === 0) {
    console.log('  No local items to sync')
    return
  }

  // Create/update the "Local Codex" plugin
  const localPlugin: Partial<Plugin> = {
    id: 'local:claude-codex',
    source_id: 'local',
    name: 'Local Claude Codex',
    description: 'Your custom agents, skills, commands, and rules',
    author: 'You',
    version: '1.0.0',
    repository_url: null,
    license: 'Custom',
    keywords: [],
    categories: ['custom', 'local'],
    agent_count: items.filter((i) => i.type === 'agent').length,
    skill_count: items.filter((i) => i.type === 'skill').length,
    command_count: items.filter((i) => i.type === 'command').length,
    rule_count: items.filter((i) => i.type === 'rule').length,
  }

  // Convert codex items to plugin components
  const components = items.map((item) => ({
    type: item.type,
    name: item.name,
    slug: item.slug,
    description: null,
    content: item.content_override || '',
    category: null,
    tags: [],
  }))

  await savePlugin(localPlugin as Plugin, components)
  console.log(`  ✓ Synced ${items.length} local items`)
}

/**
 * Save plugin and its components to database
 */
async function savePlugin(
  plugin: Plugin,
  components: Array<{
    type: string
    name: string
    slug: string
    description?: string | null
    content: string
    category?: string | null
    tags?: string[]
    metadata?: any
  }>
): Promise<void> {
  const db = getDb()

  // Upsert plugin
  await db.execute({
    sql: `INSERT OR REPLACE INTO plugins (
      id, source_id, name, description, author, version, repository_url,
      homepage_url, license, keywords, categories, agent_count, skill_count,
      command_count, rule_count, readme, changelog, icon_url, banner_url,
      screenshots, install_count, star_count, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      plugin.id,
      plugin.source_id,
      plugin.name,
      plugin.description,
      plugin.author,
      plugin.version,
      plugin.repository_url,
      plugin.homepage_url,
      plugin.license,
      JSON.stringify(plugin.keywords || []),
      JSON.stringify(plugin.categories || []),
      plugin.agent_count || 0,
      plugin.skill_count || 0,
      plugin.command_count || 0,
      plugin.rule_count || 0,
      plugin.readme,
      plugin.changelog,
      plugin.icon_url,
      plugin.banner_url,
      JSON.stringify(plugin.screenshots || []),
      plugin.install_count || 0,
      plugin.star_count || 0,
      new Date().toISOString(),
    ],
  })

  // Delete existing components for this plugin
  await db.execute({
    sql: 'DELETE FROM plugin_components WHERE plugin_id = ?',
    args: [plugin.id],
  })

  // Insert components
  for (const component of components) {
    const componentId = `${plugin.id}:${component.type}:${component.slug}`

    await db.execute({
      sql: `INSERT INTO plugin_components (
        id, plugin_id, type, name, slug, description, content, category, tags,
        model, tools, dependencies, command_syntax
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        componentId,
        plugin.id,
        component.type,
        component.name,
        component.slug,
        component.description || null,
        component.content,
        component.category || null,
        JSON.stringify(component.tags || []),
        component.metadata?.model || null,
        JSON.stringify(component.metadata?.tools || []),
        JSON.stringify(component.metadata?.dependencies || []),
        null, // command_syntax - parse from content if needed
      ],
    })
  }
}

/**
 * Sync a single plugin by ID
 */
export async function syncPluginById(pluginId: string): Promise<void> {
  const [source, name] = pluginId.split(':')

  if (source === 'anthropic') {
    const repoUrl = 'https://raw.githubusercontent.com/anthropics/claude-plugins-official'
    const { plugin, components } = await parseAnthropicPlugin(`plugins/${name}`, repoUrl)
    await savePlugin(plugin as Plugin, components)
  } else if (source === 'community') {
    const repoUrl = 'https://raw.githubusercontent.com/ccplugins/awesome-claude-code-plugins'
    const { plugin, components } = await parseCommunityPlugin(`plugins/${name}`, repoUrl)
    await savePlugin(plugin as Plugin, components)
  } else if (source === 'local') {
    await syncLocalPlugins()
  }
}

/**
 * Get sync status for all sources
 */
export async function getSyncStatus(): Promise<
  Array<PluginSource & { hoursAgo: number | null }>
> {
  const db = getDb()
  const result = await db.execute('SELECT * FROM plugin_sources')
  const sources = result.rows as unknown as PluginSource[]

  return sources.map((source) => {
    let hoursAgo: number | null = null
    if (source.last_synced) {
      const lastSync = new Date(source.last_synced)
      hoursAgo = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60)
    }

    return {
      ...source,
      hoursAgo,
    }
  })
}
