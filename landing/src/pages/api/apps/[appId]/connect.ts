import type { APIRoute } from 'astro'
import { ensureDb, getDb } from '@/lib/db'

export const prerender = false

export const POST: APIRoute = async ({ params, request }) => {
  const { appId } = params
  const body = await request.json()
  const { itemId } = body

  if (!itemId) {
    return new Response(
      JSON.stringify({ success: false, error: 'itemId is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const db = await ensureDb()

    await db.execute({
      sql: `INSERT INTO app_connections (app_id, item_id)
            VALUES (?, ?)`,
      args: [appId, itemId],
    })

    return new Response(
      JSON.stringify({ success: true }),
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

export const DELETE: APIRoute = async ({ params, request }) => {
  const { appId } = params
  const body = await request.json()
  const { itemId } = body

  if (!itemId) {
    return new Response(
      JSON.stringify({ success: false, error: 'itemId is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const db = await ensureDb()

    await db.execute({
      sql: 'DELETE FROM app_connections WHERE app_id = ? AND item_id = ?',
      args: [appId, itemId],
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
