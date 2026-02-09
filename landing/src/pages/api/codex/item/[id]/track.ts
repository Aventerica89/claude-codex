import type { APIRoute } from 'astro'
import { allItems } from '@/lib/generated'
import { ensureDb, getDb } from '@/lib/db'

export const prerender = false

export const POST: APIRoute = async ({ params }) => {
  const { id } = params

  const item = allItems.find((i) => i.id === id)
  if (!item) {
    return new Response(
      JSON.stringify({ success: false, error: 'Item not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const db = await ensureDb()
    const now = new Date().toISOString()

    await db.execute({
      sql: `INSERT INTO codex_items (id, type, slug, name, usage_count, last_used)
            VALUES (?, ?, ?, ?, 1, ?)
            ON CONFLICT(id) DO UPDATE SET
              usage_count = usage_count + 1,
              last_used = excluded.last_used`,
      args: [id, item.type, item.slug, item.name, now],
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Track failed'
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
