import type { APIRoute } from 'astro'
import { ensureDb, getDb } from '@/lib/db'

export const prerender = false

export const GET: APIRoute = async () => {
  try {
    const db = await ensureDb()
    const result = await db.execute(
      'SELECT id, name, description, created_at, updated_at FROM workflows ORDER BY updated_at DESC'
    )

    return new Response(
      JSON.stringify({ success: true, data: result.rows }),
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

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json()
  const { name, description, nodes, edges } = body

  if (!name || !nodes || !edges) {
    return new Response(
      JSON.stringify({ success: false, error: 'name, nodes, edges required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const db = await ensureDb()
    const id = crypto.randomUUID()
    const now = new Date().toISOString()

    await db.execute({
      sql: `INSERT INTO workflows (id, name, description, nodes, edges, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        name,
        description ?? '',
        JSON.stringify(nodes),
        JSON.stringify(edges),
        now,
        now,
      ],
    })

    return new Response(
      JSON.stringify({ success: true, data: { id } }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DB error'
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
