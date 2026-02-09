import type { APIRoute } from 'astro'
import { commands } from '@/lib/generated/commands'
import { agents } from '@/lib/generated/agents'
import { skills } from '@/lib/generated/skills'
import { rules } from '@/lib/generated/rules'
import { ensureDb, getDb } from '@/lib/db'
import type { BrainItemType } from '@/lib/generated/types'

export const prerender = false

const dataMap: Record<BrainItemType, readonly unknown[]> = {
  command: commands,
  agent: agents,
  skill: skills,
  rule: rules,
}

const validTypes = new Set<string>(['command', 'agent', 'skill', 'rule'])

export const GET: APIRoute = async ({ params }) => {
  const { type } = params

  // Normalize plural to singular
  const singular = type?.replace(/s$/, '') ?? ''

  if (!validTypes.has(singular)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Invalid type' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const items = dataMap[singular as BrainItemType] as Array<{
    id: string
    content: string
    [key: string]: unknown
  }>

  // Try to merge DB overrides
  try {
    const db = await ensureDb()
    const dbRows = await db.execute({
      sql: 'SELECT id, content_override, enabled, usage_count, last_used FROM codex_items WHERE type = ?',
      args: [singular],
    })

    const overrides = new Map(
      dbRows.rows.map((row) => [row.id as string, row])
    )

    const merged = items.map((item) => {
      const override = overrides.get(item.id)
      if (!override) return { ...item, content: undefined }

      return {
        ...item,
        content: undefined,
        contentOverride: override.content_override ? true : false,
        enabled: override.enabled as number,
        usageCount: override.usage_count as number,
        lastUsed: override.last_used as string | null,
      }
    })

    return new Response(
      JSON.stringify({ success: true, data: merged }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch {
    // DB not available - return generated data without content (too large for list)
    const slim = items.map(({ content, ...rest }) => rest)
    return new Response(
      JSON.stringify({ success: true, data: slim }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
