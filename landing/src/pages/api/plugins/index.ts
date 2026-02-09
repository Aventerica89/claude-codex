import type { APIRoute } from 'astro'
import { ensureDb } from '@/lib/db'
import { catalog, catalogStats } from '@/lib/generated/plugin-catalog'
import type { CatalogPluginWithStatus } from '@/lib/plugins/types'

export const prerender = false

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = url.searchParams
    const sources = searchParams.get('source')?.split(',').filter(Boolean) || []
    const categories = searchParams.get('category')?.split(',').filter(Boolean) || []
    const types = searchParams.get('type')?.split(',').filter(Boolean) || []
    const search = searchParams.get('search') || ''
    const sort = searchParams.get('sort') || 'popular'
    const installedFilter = searchParams.get('installed')

    // Fetch user plugin status from DB
    const db = await ensureDb()
    const userPluginsResult = await db.execute(
      'SELECT plugin_id, installed, active FROM user_plugins WHERE installed = 1'
    )

    const userStatus = new Map<string, { installed: boolean; active: boolean }>()
    for (const row of userPluginsResult.rows) {
      userStatus.set(row.plugin_id as string, {
        installed: (row.installed as number) === 1,
        active: (row.active as number) === 1,
      })
    }

    // Merge static catalog with user status
    let plugins: CatalogPluginWithStatus[] = catalog.map((p) => {
      const status = userStatus.get(p.id)
      return {
        ...p,
        installed: status?.installed ?? false,
        active: status?.active ?? false,
      }
    })

    // Filter by installed status
    if (installedFilter === 'true') {
      plugins = plugins.filter((p) => p.installed)
    } else if (installedFilter === 'active') {
      plugins = plugins.filter((p) => p.active)
    }

    // Filter by source
    if (sources.length > 0) {
      plugins = plugins.filter((p) => sources.includes(p.source_id))
    }

    // Filter by category
    if (categories.length > 0) {
      plugins = plugins.filter((p) =>
        p.categories.some((cat) => categories.includes(cat))
      )
    }

    // Filter by component type
    if (types.length > 0) {
      plugins = plugins.filter((p) => {
        for (const type of types) {
          if (type === 'agent' && p.agent_count > 0) return true
          if (type === 'skill' && p.skill_count > 0) return true
          if (type === 'command' && p.command_count > 0) return true
          if (type === 'rule' && p.rule_count > 0) return true
        }
        return false
      })
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase()
      plugins = plugins.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          (p.author?.toLowerCase().includes(q) ?? false) ||
          p.categories.some((c) => c.toLowerCase().includes(q))
      )
    }

    // Sort
    if (sort === 'alphabetical') {
      plugins.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'recent') {
      // Static catalog doesn't have dates; keep default order
    }
    // Default sort = catalog order (official first)

    // Compute filter counts from full catalog (not filtered subset)
    const allWithStatus = catalog.map((p) => {
      const status = userStatus.get(p.id)
      return { ...p, installed: status?.installed ?? false, active: status?.active ?? false }
    })

    const sourceCounts = new Map<string, number>()
    const categoryCounts = new Map<string, number>()
    const typeCounts = { agent: 0, skill: 0, command: 0, rule: 0 }

    for (const p of allWithStatus) {
      sourceCounts.set(p.source_id, (sourceCounts.get(p.source_id) || 0) + 1)
      for (const cat of p.categories) {
        categoryCounts.set(cat, (categoryCounts.get(cat) || 0) + 1)
      }
      if (p.agent_count > 0) typeCounts.agent++
      if (p.skill_count > 0) typeCounts.skill++
      if (p.command_count > 0) typeCounts.command++
      if (p.rule_count > 0) typeCounts.rule++
    }

    const sourceNames: Record<string, string> = {
      'anthropic-official': 'Anthropic Official',
      'awesome-community': 'Community',
    }

    const response = {
      success: true,
      data: {
        plugins,
        total: plugins.length,
        catalogTotal: catalogStats.total,
        installedCount: [...userStatus.values()].filter((s) => s.installed).length,
        activeCount: [...userStatus.values()].filter((s) => s.active).length,
        filters: {
          sources: Array.from(sourceCounts.entries()).map(([id, count]) => ({
            id,
            name: sourceNames[id] || id,
            count,
          })),
          categories: Array.from(categoryCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count),
          types: [
            { type: 'agent', count: typeCounts.agent },
            { type: 'skill', count: typeCounts.skill },
            { type: 'command', count: typeCounts.command },
            { type: 'rule', count: typeCounts.rule },
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
