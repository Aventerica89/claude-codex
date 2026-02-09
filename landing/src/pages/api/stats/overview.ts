import type { APIRoute } from 'astro'
import { stats } from '@/lib/generated/stats'
import { ensureDb, getDb } from '@/lib/db'

export const prerender = false

export const GET: APIRoute = async () => {
  const base = { ...stats }

  try {
    const db = await ensureDb()

    const [usageResult, deploymentsResult, recentActivity] = await Promise.all([
      db.execute('SELECT SUM(usage_count) as total FROM codex_items'),
      db.execute('SELECT COUNT(*) as total FROM deployments'),
      db.execute(
        `SELECT d.item_id, d.repo, d.deployed_at, d.status, ci.name
         FROM deployments d
         LEFT JOIN codex_items ci ON d.item_id = ci.id
         ORDER BY d.deployed_at DESC
         LIMIT 10`
      ),
    ])

    const totalUsage = (usageResult.rows[0]?.total as number) ?? 0
    const totalDeploys = (deploymentsResult.rows[0]?.total as number) ?? 0

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...base,
          totalUsage,
          totalDeploys,
          recentActivity: recentActivity.rows,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch {
    // DB not available - return static stats only
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          ...base,
          totalUsage: 0,
          totalDeploys: 0,
          recentActivity: [],
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
