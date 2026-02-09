import type { APIRoute } from 'astro'
import { ensureDb, getDb } from '@/lib/db'
import type { Plugin, PluginListRequest, PluginListResponse } from '@/lib/plugins/types'

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  try {
    const db = await ensureDb()

    // Parse query parameters
    const searchParams = url.searchParams
    const sources = searchParams.get('source')?.split(',').filter(Boolean) || []
    const categories = searchParams.get('category')?.split(',').filter(Boolean) || []
    const types = searchParams.get('type')?.split(',').filter(Boolean) || []
    const search = searchParams.get('search') || ''
    const sort = (searchParams.get('sort') || 'popular') as 'popular' | 'recent' | 'alphabetical'

    // Input validation for limit and offset
    const limitParam = parseInt(searchParams.get('limit') || '50')
    const offsetParam = parseInt(searchParams.get('offset') || '0')
    const limit = Math.min(Math.max(limitParam, 1), 100) // Between 1 and 100
    const offset = Math.max(offsetParam, 0) // Non-negative

    // Build WHERE clause
    const conditions: string[] = []
    const args: any[] = []

    if (sources.length > 0) {
      const placeholders = sources.map(() => '?').join(',')
      conditions.push(`source_id IN (${placeholders})`)
      args.push(...sources)
    }

    if (search) {
      conditions.push(`(name LIKE ? OR description LIKE ?)`)
      args.push(`%${search}%`, `%${search}%`)
    }

    if (categories.length > 0) {
      // Categories stored as JSON array
      const categoryConditions = categories.map(() => `categories LIKE ?`).join(' OR ')
      conditions.push(`(${categoryConditions})`)
      args.push(...categories.map((cat) => `%"${cat}"%`))
    }

    if (types.length > 0) {
      // Filter by component type counts
      const typeConditions = []
      for (const type of types) {
        if (type === 'agent') typeConditions.push('agent_count > 0')
        if (type === 'skill') typeConditions.push('skill_count > 0')
        if (type === 'command') typeConditions.push('command_count > 0')
        if (type === 'rule') typeConditions.push('rule_count > 0')
      }
      if (typeConditions.length > 0) {
        conditions.push(`(${typeConditions.join(' OR ')})`)
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    // Build ORDER BY clause
    let orderBy = 'ORDER BY install_count DESC, star_count DESC'
    if (sort === 'recent') {
      orderBy = 'ORDER BY last_updated DESC'
    } else if (sort === 'alphabetical') {
      orderBy = 'ORDER BY name ASC'
    }

    // Fetch plugins
    const pluginsResult = await db.execute({
      sql: `SELECT * FROM plugins ${whereClause} ${orderBy} LIMIT ? OFFSET ?`,
      args: [...args, limit, offset],
    })

    const plugins = pluginsResult.rows as unknown as Plugin[]

    // Parse JSON fields
    const parsedPlugins = plugins.map((p) => ({
      ...p,
      keywords: JSON.parse(p.keywords as any || '[]'),
      categories: JSON.parse(p.categories as any || '[]'),
      screenshots: JSON.parse(p.screenshots as any || '[]'),
    }))

    // Get total count
    const countResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM plugins ${whereClause}`,
      args,
    })

    const total = (countResult.rows[0] as any).count as number

    // Get filter counts
    const sourcesResult = await db.execute(
      'SELECT source_id, COUNT(*) as count FROM plugins GROUP BY source_id'
    )

    const categoriesResult = await db.execute(
      'SELECT categories FROM plugins WHERE categories IS NOT NULL AND categories != "[]"'
    )

    // Fix: Get type counts from full filtered dataset, not paginated results
    const typeCountsResult = await db.execute({
      sql: `SELECT
        SUM(CASE WHEN agent_count > 0 THEN 1 ELSE 0 END) as agent,
        SUM(CASE WHEN skill_count > 0 THEN 1 ELSE 0 END) as skill,
        SUM(CASE WHEN command_count > 0 THEN 1 ELSE 0 END) as command,
        SUM(CASE WHEN rule_count > 0 THEN 1 ELSE 0 END) as rule
        FROM plugins ${whereClause}`,
      args,
    })

    const typeCountsRow = typeCountsResult.rows[0] as any
    const typesCount = {
      agent: typeCountsRow.agent || 0,
      skill: typeCountsRow.skill || 0,
      command: typeCountsRow.command || 0,
      rule: typeCountsRow.rule || 0,
    }

    // Get source names
    const sourcesWithNames = await db.execute(
      'SELECT id, name FROM plugin_sources'
    )

    const sourceMap = new Map(
      (sourcesWithNames.rows as any[]).map((s) => [s.id, s.name])
    )

    const response: PluginListResponse = {
      success: true,
      data: {
        plugins: parsedPlugins,
        total,
        filters: {
          sources: (sourcesResult.rows as any[]).map((s) => ({
            id: s.source_id,
            name: sourceMap.get(s.source_id) || s.source_id,
            count: s.count,
          })),
          categories: extractUniqueCategories(categoriesResult.rows as any[]),
          types: [
            { type: 'agent', count: typesCount.agent },
            { type: 'skill', count: typesCount.skill },
            { type: 'command', count: typesCount.command },
            { type: 'rule', count: typesCount.rule },
          ].filter((t) => t.count > 0),
        },
      },
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Failed to fetch plugins:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch plugins',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

function extractUniqueCategories(rows: any[]): Array<{ name: string; count: number }> {
  const categoryCount = new Map<string, number>()

  for (const row of rows) {
    try {
      const categories = JSON.parse(row.categories || '[]')
      for (const cat of categories) {
        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1)
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  return Array.from(categoryCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}
