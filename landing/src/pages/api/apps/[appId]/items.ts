import type { APIRoute } from 'astro'
import { ensureDb, getDb } from '@/lib/db'
import { allItems } from '@/lib/generated'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { appId } = params

  try {
    const db = await ensureDb()
    const result = await db.execute({
      sql: 'SELECT item_id, connected_at, connection_source FROM app_connections WHERE app_id = ?',
      args: [appId],
    })

    const connected = result.rows.map((row) => {
      const item = allItems.find((i) => i.id === row.item_id)
      return {
        itemId: row.item_id,
        connectedAt: row.connected_at,
        connectionSource: row.connection_source ?? 'manual',
        name: item?.name ?? 'Unknown',
        type: item?.type ?? 'unknown',
        description: item?.description ?? '',
      }
    })

    return new Response(
      JSON.stringify({ success: true, data: connected }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DB error'
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
