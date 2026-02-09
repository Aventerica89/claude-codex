import type { APIRoute } from 'astro'
import { ensureDb } from '@/lib/db'
import { catalog } from '@/lib/generated/plugin-catalog'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { id } = params

  if (!id) {
    return new Response(
      JSON.stringify({ success: false, error: 'Plugin ID required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Find plugin in static catalog
    const plugin = catalog.find((p) => p.id === id)

    if (!plugin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Plugin not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Get user status from DB
    const db = await ensureDb()
    const statusResult = await db.execute({
      sql: 'SELECT installed, active FROM user_plugins WHERE plugin_id = ?',
      args: [id],
    })

    const userRow = statusResult.rows[0] as
      | { installed: number; active: number }
      | undefined

    const response = {
      success: true,
      data: {
        ...plugin,
        installed: userRow ? (userRow.installed as number) === 1 : false,
        active: userRow ? (userRow.active as number) === 1 : false,
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
