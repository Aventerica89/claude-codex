import type { APIRoute } from 'astro'
import { ensureDb } from '@/lib/db'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { repoName, owner, active } = body as {
      repoName: string
      owner: string
      active: boolean
    }

    if (!repoName || !owner || typeof active !== 'boolean') {
      return new Response(
        JSON.stringify({ success: false, error: 'repoName, owner, and active required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const db = await ensureDb()

    await db.execute({
      sql: `INSERT INTO user_repos (repo_name, owner, active, activated_at)
            VALUES (?, ?, ?, CASE WHEN ? THEN datetime('now') ELSE NULL END)
            ON CONFLICT(repo_name) DO UPDATE SET
              active = excluded.active,
              activated_at = excluded.activated_at`,
      args: [repoName, owner, active ? 1 : 0, active ? 1 : 0],
    })

    return new Response(
      JSON.stringify({ success: true, data: { repoName, active } }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Toggle failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
