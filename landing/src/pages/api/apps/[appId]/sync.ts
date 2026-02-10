import type { APIRoute } from 'astro'
import { ensureDb } from '@/lib/db'
import { parseRepoUrl, fetchClaudeDirectory } from '@/lib/github'
import { allItems } from '@/lib/generated'
import type { BrainItemType } from '@/lib/generated/types'

export const prerender = false

const DIR_TO_TYPE: Record<string, BrainItemType> = {
  commands: 'command',
  agents: 'agent',
  skills: 'skill',
  rules: 'rule',
}

export const POST: APIRoute = async ({ params, request }) => {
  const { appId } = params

  let body: { repository_url?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const { repository_url } = body
  if (!repository_url) {
    return new Response(
      JSON.stringify({ success: false, error: 'repository_url required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const parsed = parseRepoUrl(repository_url)
  if (!parsed) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid GitHub URL' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const token = import.meta.env.GITHUB_TOKEN

  try {
    const claudeDir = await fetchClaudeDirectory(
      parsed.owner,
      parsed.repo,
      token
    )

    if (!claudeDir) {
      const db = await ensureDb()
      await db.execute({
        sql: `INSERT INTO app_sync_history
              (app_id, items_found, items_added, items_removed, status, error_message)
              VALUES (?, 0, 0, 0, 'success', 'No .claude/ directory found')`,
        args: [appId],
      })

      return new Response(
        JSON.stringify({
          success: true,
          found: 0,
          added: 0,
          removed: 0,
          items: [],
          message: 'No .claude/ directory found in repo',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Match found files against catalog
    const matchedItems: Array<{
      id: string
      name: string
      type: string
      slug: string
    }> = []

    for (const [dir, slugs] of Object.entries(claudeDir)) {
      const brainType = DIR_TO_TYPE[dir]
      if (!brainType) continue

      for (const slug of slugs) {
        const match = allItems.find(
          (item) => item.type === brainType && item.slug === slug
        )
        if (match) {
          matchedItems.push({
            id: match.id,
            name: match.name,
            type: match.type,
            slug: match.slug,
          })
        }
      }
    }

    const db = await ensureDb()

    // Get existing auto_sync connections
    const existing = await db.execute({
      sql: `SELECT item_id FROM app_connections
            WHERE app_id = ? AND connection_source = 'auto_sync'`,
      args: [appId],
    })
    const existingIds = new Set(
      existing.rows.map((r) => r.item_id as string)
    )
    const matchedIds = new Set(matchedItems.map((m) => m.id))

    // Determine adds and removes
    const toAdd = matchedItems.filter((m) => !existingIds.has(m.id))
    const toRemove = [...existingIds].filter((id) => !matchedIds.has(id))

    // INSERT new auto_sync connections
    for (const item of toAdd) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO app_connections
              (app_id, item_id, connection_source) VALUES (?, ?, 'auto_sync')`,
        args: [appId, item.id],
      })
    }

    // DELETE stale auto_sync connections (never touch manual)
    for (const itemId of toRemove) {
      await db.execute({
        sql: `DELETE FROM app_connections
              WHERE app_id = ? AND item_id = ? AND connection_source = 'auto_sync'`,
        args: [appId, itemId],
      })
    }

    // Record sync history
    await db.execute({
      sql: `INSERT INTO app_sync_history
            (app_id, items_found, items_added, items_removed, status)
            VALUES (?, ?, ?, ?, 'success')`,
      args: [appId, matchedItems.length, toAdd.length, toRemove.length],
    })

    return new Response(
      JSON.stringify({
        success: true,
        found: matchedItems.length,
        added: toAdd.length,
        removed: toRemove.length,
        items: matchedItems,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed'

    try {
      const db = await ensureDb()
      await db.execute({
        sql: `INSERT INTO app_sync_history
              (app_id, status, error_message) VALUES (?, 'error', ?)`,
        args: [appId, message],
      })
    } catch {
      // Ignore history write failure
    }

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
