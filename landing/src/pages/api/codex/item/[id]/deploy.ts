import type { APIRoute } from 'astro'
import { allItems } from '@/lib/generated'
import { ensureDb, getDb } from '@/lib/db'

export const prerender = false

export const POST: APIRoute = async ({ params, request }) => {
  const { id } = params
  const body = await request.json()
  const { repo } = body

  if (!repo || typeof repo !== 'string') {
    return new Response(
      JSON.stringify({ success: false, error: 'repo is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

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

    // Record deployment
    await db.execute({
      sql: `INSERT INTO deployments (item_id, repo, deployed_at, status)
            VALUES (?, ?, ?, 'pending')`,
      args: [id, repo, now],
    })

    // TODO: Actual GitHub API deployment logic
    // For now, record the intent and mark as success
    await db.execute({
      sql: `UPDATE deployments SET status = 'success'
            WHERE item_id = ? AND repo = ? AND deployed_at = ?`,
      args: [id, repo, now],
    })

    return new Response(
      JSON.stringify({
        success: true,
        data: { itemId: id, repo, deployedAt: now },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Deploy failed'
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
