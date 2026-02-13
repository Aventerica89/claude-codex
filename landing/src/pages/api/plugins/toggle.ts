import type { APIRoute } from 'astro'
import { ensureDb } from '@/lib/db'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { pluginId, active } = body as {
      pluginId: string
      active: boolean
    }

    if (!pluginId || typeof active !== 'boolean') {
      return new Response(
        JSON.stringify({ success: false, error: 'pluginId and active (boolean) required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const db = await ensureDb()

    // Only toggle if installed
    const existing = await db.execute({
      sql: 'SELECT installed FROM user_plugins WHERE plugin_id = ? AND installed = 1',
      args: [pluginId],
    })

    if (existing.rows.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Plugin must be installed before toggling' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // SECURITY FIX: Use conditional SQL instead of string interpolation to prevent SQL injection
    const sql = active
      ? `UPDATE user_plugins
         SET active = 1, activated_at = datetime('now')
         WHERE plugin_id = ? AND installed = 1`
      : `UPDATE user_plugins
         SET active = 0, activated_at = NULL
         WHERE plugin_id = ? AND installed = 1`

    await db.execute({
      sql,
      args: [pluginId],
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: { pluginId, active },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Failed to toggle plugin:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Toggle failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
