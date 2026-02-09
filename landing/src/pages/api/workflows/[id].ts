import type { APIRoute } from 'astro'
import { ensureDb, getDb } from '@/lib/db'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { id } = params

  try {
    const db = await ensureDb()
    const result = await db.execute({
      sql: 'SELECT * FROM workflows WHERE id = ?',
      args: [id],
    })

    const row = result.rows[0]
    if (!row) {
      return new Response(
        JSON.stringify({ success: false, error: 'Workflow not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...row,
          nodes: JSON.parse(row.nodes as string),
          edges: JSON.parse(row.edges as string),
        },
      }),
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

export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params
  const body = await request.json()
  const { name, description, nodes, edges } = body

  try {
    const db = await ensureDb()
    const now = new Date().toISOString()

    await db.execute({
      sql: `UPDATE workflows SET
              name = COALESCE(?, name),
              description = COALESCE(?, description),
              nodes = COALESCE(?, nodes),
              edges = COALESCE(?, edges),
              updated_at = ?
            WHERE id = ?`,
      args: [
        name ?? null,
        description ?? null,
        nodes ? JSON.stringify(nodes) : null,
        edges ? JSON.stringify(edges) : null,
        now,
        id,
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

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params

  try {
    const db = await ensureDb()
    await db.execute({
      sql: 'DELETE FROM workflows WHERE id = ?',
      args: [id],
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
