"use client"

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from '../ui/Toast'
import { allItems } from '@/lib/generated'
import type { BrainItem, BrainItemType } from '@/lib/generated/types'
import type { AppData, ConnectedItem } from './AppCard'

interface ConnectedItemWithSource extends ConnectedItem {
  connectionSource: string
}

interface SyncResult {
  found: number
  added: number
  removed: number
  items: Array<{ id: string; name: string; type: string; slug: string }>
  message?: string
}

interface SyncHistory {
  synced_at: string
  items_found: number
  items_added: number
  items_removed: number
  status: string
  error_message: string | null
}

interface AppDetailPageProps {
  appId: string
}

type Tab = 'items' | 'sync'

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500' },
  inactive: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
  archived: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  maintenance: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' },
}

const TYPE_COLORS: Record<string, string> = {
  command: 'text-blue-400 bg-blue-500/10',
  agent: 'text-purple-400 bg-purple-500/10',
  skill: 'text-green-400 bg-green-500/10',
  rule: 'text-orange-400 bg-orange-500/10',
}

const TYPE_FILTERS: { label: string; value: BrainItemType }[] = [
  { label: 'Commands', value: 'command' },
  { label: 'Agents', value: 'agent' },
  { label: 'Skills', value: 'skill' },
  { label: 'Rules', value: 'rule' },
]

export function AppDetailPage({ appId }: AppDetailPageProps) {
  const [app, setApp] = useState<AppData | null>(null)
  const [items, setItems] = useState<ConnectedItemWithSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('items')
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [pickerSearch, setPickerSearch] = useState('')
  const [pickerTypeFilter, setPickerTypeFilter] = useState<BrainItemType | null>(null)
  const { showToast } = useToast()

  const fetchApp = useCallback(async () => {
    try {
      const res = await fetch(`/api/apps/${appId}`)
      const json = await res.json()
      if (json.success) {
        setApp(json.data)
      } else {
        setError(json.error ?? 'App not found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    }
  }, [appId])

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`/api/apps/${appId}/items`)
      const json = await res.json()
      if (json.success) {
        setItems(json.data)
      }
    } catch {
      // Supplementary data, silent fail
    }
  }, [appId])

  useEffect(() => {
    async function load() {
      setLoading(true)
      await Promise.all([fetchApp(), fetchItems()])
      setLoading(false)
    }
    load()
  }, [fetchApp, fetchItems])

  async function handleSync() {
    if (!app?.repository_url) return
    setSyncing(true)
    setSyncResult(null)

    try {
      const res = await fetch(`/api/apps/${appId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repository_url: app.repository_url }),
      })
      const json = await res.json()

      if (json.success) {
        setSyncResult(json)
        showToast(
          `Sync complete: ${json.found} found, ${json.added} added, ${json.removed} removed`,
          'success'
        )
        await fetchItems()
      } else {
        showToast(json.error ?? 'Sync failed', 'error')
      }
    } catch (err) {
      showToast('Sync request failed', 'error')
    } finally {
      setSyncing(false)
    }
  }

  async function handleConnect(item: BrainItem) {
    try {
      const res = await fetch(`/api/apps/${appId}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      })
      const json = await res.json()
      if (json.success) {
        setShowPicker(false)
        showToast(`Connected ${item.name}`, 'success')
        await fetchItems()
      }
    } catch {
      showToast('Connection failed', 'error')
    }
  }

  async function handleDisconnect(itemId: string) {
    try {
      await fetch(`/api/apps/${appId}/connect`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
      showToast('Disconnected', 'success')
      await fetchItems()
    } catch {
      showToast('Disconnect failed', 'error')
    }
  }

  // Stats
  const totalCount = items.length
  const autoCount = items.filter((i) => i.connectionSource === 'auto_sync').length
  const manualCount = items.filter((i) => i.connectionSource === 'manual').length

  // Picker filtering
  const filteredPicker = allItems.filter((item) => {
    const matchesType = !pickerTypeFilter || item.type === pickerTypeFilter
    const q = pickerSearch.toLowerCase()
    const matchesSearch = !pickerSearch
      || item.name.toLowerCase().includes(q)
      || item.description.toLowerCase().includes(q)
    return matchesType && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading app details...</div>
      </div>
    )
  }

  if (error || !app) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-400">{error || 'App not found'}</div>
        <a
          href="/dashboard/apps"
          className={cn(
            'px-4 py-2 rounded-lg transition-colors',
            'bg-violet-500/10 text-violet-400 border border-violet-500/30',
            'hover:bg-violet-500/20'
          )}
        >
          Back to Apps
        </a>
      </div>
    )
  }

  const displayName = app.display_name ?? app.name
  const statusStyle = STATUS_COLORS[app.status] ?? STATUS_COLORS.inactive

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <a
              href="/dashboard/apps"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Back
            </a>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <span className={cn(
              'text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5',
              statusStyle.bg, statusStyle.text
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full', statusStyle.dot)} />
              {app.status}
            </span>
          </div>

          {/* Tech stack */}
          {app.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {app.tech_stack.map((tech) => (
                <span
                  key={tech}
                  className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Action links */}
          <div className="flex flex-wrap gap-3">
            {app.live_url && (
              <a
                href={app.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'text-sm px-4 py-2 rounded-lg transition-colors',
                  'bg-violet-500/10 text-violet-400 border border-violet-500/30',
                  'hover:bg-violet-500/20'
                )}
              >
                Open App
              </a>
            )}
            {app.repository_url && (
              <a
                href={app.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'text-sm px-4 py-2 rounded-lg transition-colors',
                  'bg-secondary text-foreground border border-border',
                  'hover:bg-secondary/80'
                )}
              >
                View Repo
              </a>
            )}
            <button
              onClick={handleSync}
              disabled={!app.repository_url || syncing}
              className={cn(
                'text-sm px-4 py-2 rounded-lg font-medium transition-colors',
                app.repository_url && !syncing
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
                  : 'bg-secondary/50 text-muted-foreground border border-border cursor-not-allowed'
              )}
            >
              {syncing ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Connected" value={totalCount} color="violet" />
        <StatCard label="Auto-Detected" value={autoCount} color="cyan" />
        <StatCard label="Manual" value={manualCount} color="purple" />
        <StatCard label="Last Synced" value={syncResult ? 'Just now' : 'Never'} color="green" isText />
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {([
            { id: 'items' as const, label: `Connected Items (${totalCount})` },
            { id: 'sync' as const, label: 'Sync' },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-3 border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {totalCount} item{totalCount !== 1 ? 's' : ''} connected
            </h3>
            <button
              onClick={() => setShowPicker(true)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-lg transition-colors',
                'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20'
              )}
            >
              + Connect Item
            </button>
          </div>

          {items.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-muted-foreground mb-2">No codex items connected</p>
              <p className="text-xs text-muted-foreground">
                Use "Sync" to auto-detect or manually connect items.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded capitalize shrink-0',
                      TYPE_COLORS[item.type] ?? 'text-gray-400 bg-gray-500/10'
                    )}>
                      {item.type}
                    </span>
                    <span className="text-sm truncate">{item.name}</span>
                    <SourceBadge source={item.connectionSource} />
                  </div>
                  <button
                    onClick={() => handleDisconnect(item.itemId)}
                    className="text-muted-foreground hover:text-red-400 transition-colors shrink-0 ml-2"
                    title="Disconnect"
                  >
                    <XIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-2">Auto-Sync</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Scans the repo's <code className="text-xs bg-secondary px-1 py-0.5 rounded">.claude/</code> directory
              and matches files against the codex catalog.
            </p>

            <button
              onClick={handleSync}
              disabled={!app.repository_url || syncing}
              className={cn(
                'px-5 py-2.5 rounded-lg font-medium transition-colors',
                app.repository_url && !syncing
                  ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed'
              )}
            >
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>

            {!app.repository_url && (
              <p className="text-xs text-yellow-400 mt-2">
                No repository URL set for this app. Add one at apps.jbcloud.app.
              </p>
            )}
          </div>

          {syncResult && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-medium mb-3">Sync Results</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-cyan-400">{syncResult.found}</div>
                  <div className="text-xs text-muted-foreground">Found</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{syncResult.added}</div>
                  <div className="text-xs text-muted-foreground">Added</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-red-400">{syncResult.removed}</div>
                  <div className="text-xs text-muted-foreground">Removed</div>
                </div>
              </div>

              {syncResult.message && (
                <p className="text-sm text-yellow-400">{syncResult.message}</p>
              )}

              {syncResult.items.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  {syncResult.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded bg-secondary/30"
                    >
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded capitalize',
                        TYPE_COLORS[item.type] ?? 'text-gray-400 bg-gray-500/10'
                      )}>
                        {item.type}
                      </span>
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Connect Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Connect Codex Item</h3>
                <button
                  onClick={() => setShowPicker(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XIcon />
                </button>
              </div>
              <input
                type="text"
                placeholder="Search items..."
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 rounded-lg text-sm',
                  'bg-secondary/50 border border-border',
                  'focus:outline-none focus:border-violet-500/50'
                )}
                autoFocus
              />
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => setPickerTypeFilter(null)}
                  className={cn(
                    'text-xs px-2 py-1 rounded-lg transition-colors',
                    !pickerTypeFilter
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'text-muted-foreground hover:bg-secondary'
                  )}
                >
                  All
                </button>
                {TYPE_FILTERS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setPickerTypeFilter(
                      pickerTypeFilter === value ? null : value
                    )}
                    className={cn(
                      'text-xs px-2 py-1 rounded-lg transition-colors',
                      pickerTypeFilter === value
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'text-muted-foreground hover:bg-secondary'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredPicker.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No items found
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredPicker.slice(0, 50).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleConnect(item)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg transition-colors',
                        'hover:bg-secondary/50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded capitalize bg-secondary text-muted-foreground">
                          {item.type}
                        </span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {item.description}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
  isText = false,
}: {
  label: string
  value: number | string
  color: 'violet' | 'cyan' | 'purple' | 'green'
  isText?: boolean
}) {
  const colors = {
    violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
    cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  }
  const c = colors[color]

  return (
    <div className={cn(c.bg, 'border', c.border, 'rounded-lg p-4')}>
      <div className={cn(isText ? 'text-base' : 'text-2xl', 'font-bold', c.text)}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function SourceBadge({ source }: { source: string }) {
  if (source === 'auto_sync') {
    return (
      <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 shrink-0">
        Auto
      </span>
    )
  }
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-500/10 text-gray-400 shrink-0">
      Manual
    </span>
  )
}

function XIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default AppDetailPage
