import type { APIRoute } from 'astro'
import { getDb } from '@/lib/db'
import type {
  Plugin,
  PluginComponent,
  ComponentRelationship,
  PluginInstallation,
  PluginDetailResponse,
} from '@/lib/plugins/types'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { id } = params

  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'Plugin ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const db = getDb()

    // Fetch plugin
    const pluginResult = await db.execute({
      sql: 'SELECT * FROM plugins WHERE id = ?',
      args: [id],
    })

    if (pluginResult.rows.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Plugin not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const plugin = pluginResult.rows[0] as unknown as Plugin

    // Parse JSON fields
    const parsedPlugin = {
      ...plugin,
      keywords: JSON.parse(plugin.keywords as any || '[]'),
      categories: JSON.parse(plugin.categories as any || '[]'),
      screenshots: JSON.parse(plugin.screenshots as any || '[]'),
    }

    // Fetch components
    const componentsResult = await db.execute({
      sql: 'SELECT * FROM plugin_components WHERE plugin_id = ? ORDER BY type, name',
      args: [id],
    })

    const components = (componentsResult.rows as unknown as PluginComponent[]).map((c) => ({
      ...c,
      tags: JSON.parse(c.tags as any || '[]'),
      tools: JSON.parse(c.tools as any || '[]'),
      dependencies: JSON.parse(c.dependencies as any || '[]'),
    }))

    // Fetch relationships
    const componentIds = components.map((c) => c.id)
    const placeholders = componentIds.map(() => '?').join(',')

    const relationshipsResult = componentIds.length
      ? await db.execute({
          sql: `SELECT * FROM component_relationships
                WHERE from_component_id IN (${placeholders})
                OR to_component_id IN (${placeholders})`,
          args: [...componentIds, ...componentIds],
        })
      : { rows: [] }

    const relationships = relationshipsResult.rows as unknown as ComponentRelationship[]

    // Fetch installations
    const installationsResult = await db.execute({
      sql: 'SELECT * FROM plugin_installations WHERE plugin_id = ? ORDER BY installed_at DESC',
      args: [id],
    })

    const installations = (installationsResult.rows as unknown as PluginInstallation[]).map(
      (i) => ({
        ...i,
        component_ids: JSON.parse(i.component_ids as any || '[]'),
        config_overrides: i.config_overrides
          ? JSON.parse(i.config_overrides as any)
          : undefined,
      })
    )

    // Check if favorited
    const favoriteResult = await db.execute({
      sql: 'SELECT * FROM plugin_favorites WHERE plugin_id = ? AND user_id = ?',
      args: [id, 'default'],
    })

    const isFavorite = favoriteResult.rows.length > 0

    const response: PluginDetailResponse = {
      success: true,
      data: {
        plugin: parsedPlugin,
        components,
        relationships,
        installations,
        readme: plugin.readme,
        isFavorite,
      },
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Failed to fetch plugin:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch plugin',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
