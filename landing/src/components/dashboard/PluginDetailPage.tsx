"use client"

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useToast } from '../ui/Toast'
import type { CatalogPluginWithStatus } from '@/lib/plugins/types'

interface PluginDetailPageProps {
  pluginId: string
}

type Tab = 'overview' | 'components'

const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
  'anthropic-official': {
    label: 'Official',
    color: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  },
  'awesome-community': {
    label: 'Community',
    color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
}

const typeColors: Record<string, string> = {
  agent: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  skill: 'text-green-400 bg-green-500/10 border-green-500/30',
  command: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  rule: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
}

const statColors = {
  agent: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  skill: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  command: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  rule: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
}

export function PluginDetailPage({ pluginId }: PluginDetailPageProps) {
  const [plugin, setPlugin] = useState<CatalogPluginWithStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const { showToast } = useToast()

  useEffect(() => {
    fetchPluginDetails()
  }, [pluginId])

  async function fetchPluginDetails() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/plugins/${pluginId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch plugin: ${response.statusText}`)
      }

      const data = await response.json()
      setPlugin(data.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load plugin'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleInstall() {
    if (!plugin) return

    const action = plugin.installed ? 'uninstall' : 'install'

    // Optimistic update
    setPlugin((prev) =>
      prev ? { ...prev, installed: !prev.installed, active: false } : prev
    )

    try {
      const response = await fetch('/api/plugins/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId: plugin.id, action }),
      })
      if (!response.ok) throw new Error('Failed')
      showToast(
        action === 'install'
          ? `Installed ${plugin.name} (deactivated)`
          : `Uninstalled ${plugin.name}`,
        'success'
      )
    } catch {
      // Revert
      setPlugin((prev) =>
        prev ? { ...prev, installed: plugin.installed, active: plugin.active } : prev
      )
      showToast('Operation failed', 'error')
    }
  }

  async function handleToggle() {
    if (!plugin || !plugin.installed) return

    const newActive = !plugin.active

    // Optimistic update
    setPlugin((prev) => (prev ? { ...prev, active: newActive } : prev))

    try {
      const response = await fetch('/api/plugins/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId: plugin.id, active: newActive }),
      })
      if (!response.ok) throw new Error('Failed')
    } catch {
      // Revert
      setPlugin((prev) => (prev ? { ...prev, active: plugin.active } : prev))
      showToast('Toggle failed', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading plugin details...</div>
      </div>
    )
  }

  if (error || !plugin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-400">{error || 'Plugin not found'}</div>
        <a
          href="/dashboard/plugins"
          className={cn(
            'px-4 py-2 rounded-lg transition-colors',
            'bg-violet-500/10 text-violet-400 border border-violet-500/30',
            'hover:bg-violet-500/20'
          )}
        >
          Back to Plugins
        </a>
      </div>
    )
  }

  const sourceBadge = SOURCE_BADGES[plugin.source_id] || {
    label: 'Unknown',
    color: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  }

  const componentsByType = {
    agent: plugin.components.filter((c) => c.type === 'agent'),
    skill: plugin.components.filter((c) => c.type === 'skill'),
    command: plugin.components.filter((c) => c.type === 'command'),
    rule: plugin.components.filter((c) => c.type === 'rule'),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <a
              href="/dashboard/plugins"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; Back
            </a>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold">{plugin.name}</h1>
            <span
              className={cn(
                'px-3 py-1 text-xs font-medium border rounded-full',
                sourceBadge.color
              )}
            >
              {sourceBadge.label}
            </span>
            {plugin.installed && (
              <span
                className={cn(
                  'px-3 py-1 text-xs font-medium border rounded-full',
                  plugin.active
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                )}
              >
                {plugin.active ? 'Active' : 'Inactive'}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-lg mb-4">{plugin.description}</p>

          {/* Metadata */}
          <div className="flex flex-wrap gap-6 text-sm">
            {plugin.author && (
              <div>
                <span className="text-muted-foreground">Author:</span>
                <span className="ml-2 text-foreground">{plugin.author}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Components:</span>
              <span className="ml-2 text-foreground">{plugin.components.length}</span>
            </div>
            {plugin.repository_url && (
              <a
                href={plugin.repository_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 transition-colors"
              >
                View on GitHub
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 items-end">
          {!plugin.installed ? (
            <button
              onClick={handleInstall}
              className={cn(
                'px-6 py-3 rounded-lg font-medium transition-colors',
                'bg-violet-500 text-white hover:bg-violet-600'
              )}
            >
              Install Plugin
            </button>
          ) : (
            <>
              <button
                onClick={handleToggle}
                className={cn(
                  'px-6 py-3 rounded-lg font-medium transition-colors',
                  plugin.active
                    ? 'bg-foreground/10 text-foreground hover:bg-foreground/20'
                    : 'bg-violet-500 text-white hover:bg-violet-600'
                )}
              >
                {plugin.active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={handleInstall}
                className="text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Uninstall
              </button>
            </>
          )}
        </div>
      </div>

      {/* Component Stats */}
      <div className="grid grid-cols-4 gap-4">
        {(['agent', 'skill', 'command', 'rule'] as const).map((type) => {
          const colors = statColors[type]
          return (
            <div
              key={type}
              className={cn(colors.bg, 'border', colors.border, 'rounded-lg p-4')}
            >
              <div className={cn('text-2xl font-bold', colors.text)}>
                {componentsByType[type].length}
              </div>
              <div className="text-sm text-muted-foreground capitalize">{type}s</div>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {([
            { id: 'overview' as const, label: 'Overview' },
            { id: 'components' as const, label: `Components (${plugin.components.length})` },
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
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">About This Plugin</h3>
              <p className="text-muted-foreground">
                {plugin.description || 'No description available.'}
              </p>

              {plugin.categories.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Categories</div>
                  <div className="flex flex-wrap gap-2">
                    {plugin.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-secondary/50 text-foreground text-xs rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-4">
            {plugin.components.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-muted-foreground">
                  No components found. This plugin may be MCP-only.
                </p>
              </div>
            ) : (
              plugin.components.map((comp) => (
                <div
                  key={`${comp.type}-${comp.slug}`}
                  className="bg-card border border-border rounded-lg p-4 flex items-center gap-4"
                >
                  <span
                    className={cn(
                      'text-xs font-medium px-2.5 py-1 rounded border capitalize',
                      typeColors[comp.type] || 'text-gray-400 bg-gray-500/10 border-gray-500/30'
                    )}
                  >
                    {comp.type}
                  </span>
                  <span className="font-medium">{comp.name}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
