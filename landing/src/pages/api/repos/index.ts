import type { APIRoute } from 'astro'
import { ensureDb } from '@/lib/db'

export const prerender = false

export const GET: APIRoute = async () => {
  try {
    const db = await ensureDb()
    const result = await db.execute('SELECT repo_name, owner, active, activated_at FROM user_repos')

    return new Response(
      JSON.stringify({ success: true, data: result.rows }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch repos',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
