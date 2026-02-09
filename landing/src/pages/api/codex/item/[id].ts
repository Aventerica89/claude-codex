import type { APIRoute } from 'astro'
import { allItems } from '@/lib/generated'
import { ensureDb, getDb } from '@/lib/db'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { id } = params

  const item = allItems.find((i) => i.id === id)
  if (!item) {
    return new Response(
      JSON.stringify({ success: false, error: 'Item not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Check for DB override
  try {
    const db = await ensureDb()
    const result = await db.execute({
      sql: 'SELECT content_override, enabled, usage_count, last_used, last_edited FROM codex_items WHERE id = ?',
      args: [id],
    })

    const row = result.rows[0]
    const content = row?.content_override
      ? (row.content_override as string)
      : item.content

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...item,
          content,
          hasOverride: Boolean(row?.content_override),
          enabled: row ? (row.enabled as number) : 1,
          usageCount: row ? (row.usage_count as number) : 0,
          lastUsed: row ? (row.last_used as string | null) : null,
          lastEdited: row ? (row.last_edited as string | null) : null,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch {
    // DB not available - return generated data
    return new Response(
      JSON.stringify({ success: true, data: item }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params
  const body = await request.json()

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
      sql: `INSERT INTO codex_items (id, type, slug, name, content_override, last_edited)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              content_override = excluded.content_override,
              last_edited = excluded.last_edited`,
      args: [
        id,
        item.type,
        item.slug,
        item.name,
        body.content ?? null,
        now,
      ],
    })

    return new Response(
      JSON.stringify({ success: true }),
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
