import type { APIRoute } from 'astro'
import { ensureDb } from '@/lib/db'
import { catalog } from '@/lib/generated/plugin-catalog'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { pluginId, action } = body as {
      pluginId: string
      action: 'install' | 'uninstall'
    }

    if (!pluginId || !action) {
      return new Response(
        JSON.stringify({ success: false, error: 'pluginId and action required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (action !== 'install' && action !== 'uninstall') {
      return new Response(
        JSON.stringify({ success: false, error: 'action must be install or uninstall' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verify plugin exists in catalog
    const plugin = catalog.find((p) => p.id === pluginId)
    if (!plugin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Plugin not found in catalog' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const db = await ensureDb()

    if (action === 'install') {
      await db.execute({
        sql: `INSERT OR REPLACE INTO user_plugins
              (plugin_id, installed, active, installed_at)
              VALUES (?, 1, 0, datetime('now'))`,
        args: [pluginId],
      })
    } else {
      await db.execute({
        sql: 'DELETE FROM user_plugins WHERE plugin_id = ?',
        args: [pluginId],
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          pluginId,
          action,
          installed: action === 'install',
          active: false,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Failed to install/uninstall plugin:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Operation failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
