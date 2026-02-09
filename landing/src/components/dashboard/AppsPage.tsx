"use client"

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { AppCard, type AppData, type ConnectedItem } from './AppCard'
import { allItems } from '@/lib/generated'
import type { BrainItem, BrainItemType } from '@/lib/generated/types'

type ConnectionMap = Record<string, ConnectedItem[]>

const TYPE_FILTERS: { label: string; value: BrainItemType }[] = [
  { label: 'Commands', value: 'command' },
  { label: 'Agents', value: 'agent' },
  { label: 'Skills', value: 'skill' },
  { label: 'Rules', value: 'rule' },
]

function ConnectPicker({
  appId,
  onSelect,
  onClose,
}: {
  appId: string
  onSelect: (item: BrainItem) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<BrainItemType | null>(null)

  const filtered = allItems.filter((item) => {
    const matchesType = !typeFilter || item.type === typeFilter
    const q = search.toLowerCase()
    const matchesSearch = !search
      || item.name.toLowerCase().includes(q)
      || item.description.toLowerCase().includes(q)
    return matchesType && matchesSearch
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Connect Codex Item</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              'w-full px-3 py-2 rounded-lg text-sm',
              'bg-secondary/50 border border-border',
              'focus:outline-none focus:border-violet-500/50'
            )}
            autoFocus
          />
          <div className="flex gap-1 mt-2">
            <button
              onClick={() => setTypeFilter(null)}
              className={cn(
                'text-xs px-2 py-1 rounded-lg transition-colors',
                !typeFilter
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-muted-foreground hover:bg-secondary'
              )}
            >
              All
            </button>
            {TYPE_FILTERS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(typeFilter === value ? null : value)}
                className={cn(
                  'text-xs px-2 py-1 rounded-lg transition-colors',
                  typeFilter === value
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
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No items found
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.slice(0, 50).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
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
  )
}

export function AppsPage() {
  const [apps, setApps] = useState<AppData[]>([])
  const [connections, setConnections] = useState<ConnectionMap>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectingAppId, setConnectingAppId] = useState<string | null>(null)

  const fetchApps = useCallback(async () => {
    try {
      const res = await fetch('/api/apps')
      const json = await res.json()
      if (json.success) {
        setApps(json.data)
      } else {
        setError(json.error ?? 'Failed to load apps')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchConnections = useCallback(async (appId: string) => {
    try {
      const res = await fetch(`/api/apps/${appId}/items`)
      const json = await res.json()
      if (json.success) {
        setConnections((prev) => ({ ...prev, [appId]: json.data }))
      }
    } catch {
      // Silently fail — connections are supplementary
    }
  }, [])

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  useEffect(() => {
    apps.forEach((app) => {
      fetchConnections(app.id)
    })
  }, [apps, fetchConnections])

  const handleConnect = async (appId: string, item: BrainItem) => {
    try {
      const res = await fetch(`/api/apps/${appId}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      })
      const json = await res.json()
      if (json.success) {
        setConnectingAppId(null)
        fetchConnections(appId)
      }
    } catch {
      // Connection failed silently
    }
  }

  const handleDisconnect = async (appId: string, itemId: string) => {
    try {
      await fetch(`/api/apps/${appId}/connect`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })
      fetchConnections(appId)
    } catch {
      // Disconnect failed silently
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Apps</h1>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-secondary rounded w-2/3 mb-3" />
              <div className="h-3 bg-secondary rounded w-1/2 mb-2" />
              <div className="h-3 bg-secondary rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Apps</h1>
        <p className="text-muted-foreground">
          {apps.length} applications from{' '}
          <a
            href="https://apps.jbcloud.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:underline"
          >
            apps.jbcloud.app
          </a>
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg p-4">
          {error}
        </div>
      )}

      {apps.length === 0 && !error ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground mb-2">No applications found</p>
          <p className="text-xs text-muted-foreground">
            Add apps at apps.jbcloud.app to see them here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              connectedItems={connections[app.id] ?? []}
              onConnect={(appId) => setConnectingAppId(appId)}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>
      )}

      {connectingAppId && (
        <ConnectPicker
          appId={connectingAppId}
          onSelect={(item) => handleConnect(connectingAppId, item)}
          onClose={() => setConnectingAppId(null)}
        />
      )}
    </div>
  )
}

export default AppsPage
