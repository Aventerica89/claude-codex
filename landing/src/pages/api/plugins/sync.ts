import type { APIRoute } from 'astro'
import { syncAllSources, getSyncStatus } from '@/lib/plugins/sync'
import { detectRelationships } from '@/lib/plugins/relationships'
import { getDb } from '@/lib/db'
import type { PluginSyncResponse } from '@/lib/plugins/types'

export const prerender = false

export const GET: APIRoute = async () => {
  try {
    // Return sync status for all sources
    const status = await getSyncStatus()

    return new Response(
      JSON.stringify({
        success: true,
        data: status,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Failed to get sync status:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get sync status',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}))
    const sources = body.sources as string[] | undefined

    // Input validation: Ensure force is a boolean
    const forceParam = body.force
    const force = typeof forceParam === 'boolean' ? forceParam : forceParam === 'true'

    console.log('Starting plugin sync...', { sources, force })

    // Sync all sources
    const result = await syncAllSources(force)

    console.log(`Synced ${result.synced} sources`)

    // Detect relationships for all synced plugins
    const db = getDb()
    const pluginsResult = await db.execute('SELECT id FROM plugins')
    const plugins = pluginsResult.rows as { id: string }[]

    let totalRelationships = 0
    for (const plugin of plugins) {
      try {
        const count = await detectRelationships(plugin.id)
        totalRelationships += count
        console.log(`  Found ${count} relationships for ${plugin.id}`)
      } catch (error) {
        console.error(`  Failed to detect relationships for ${plugin.id}:`, error)
      }
    }

    console.log(`Total relationships detected: ${totalRelationships}`)

    const response: PluginSyncResponse = {
      success: true,
      data: {
        synced: result.synced,
        errors: result.errors,
      },
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Failed to sync plugins:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync plugins',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
