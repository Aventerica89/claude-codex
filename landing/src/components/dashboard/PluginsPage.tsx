"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { CardSizeToggle, type CardSize } from './CardSizeToggle'
import { PluginCard } from './PluginCard'
import { PluginFilters } from './PluginFilters'
import { InstallCommandBar } from './InstallCommandBar'
import { useToast } from '../ui/Toast'
import { RepoList } from './RepoList'
import { MY_REPOS } from '@/lib/repos'
import type { CatalogPluginWithStatus } from '@/lib/plugins/types'

type StatusTab = 'all' | 'installed' | 'active' | 'repos'

const GRID_CLASSES: Record<CardSize, string> = {
  compact: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  normal: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  large: 'grid-cols-1 md:grid-cols-2',
}

interface PluginListResponse {
  success: boolean
  data: {
    plugins: CatalogPluginWithStatus[]
    total: number
    catalogTotal: number
    installedCount: number
    activeCount: number
    filters: {
      sources: Array<{ id: string; name: string; count: number }>
      categories: Array<{ name: string; count: number }>
      types: Array<{ type: string; count: number }>
    }
  }
}

export function PluginsPage() {
  const { showToast } = useToast()
  const [plugins, setPlugins] = useState<CatalogPluginWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<StatusTab>('all')
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'alphabetical'>('popular')
  const [cardSize, setCardSize] = useState<CardSize>('normal')

  // Counts
  const [catalogTotal, setCatalogTotal] = useState(0)
  const [installedCount, setInstalledCount] = useState(0)
  const [activeCount, setActiveCount] = useState(0)

  // Plugin selection for command bar
  const [selectedForInstall, setSelectedForInstall] = useState<
    Map<string, { id: string; name: string }>
  >(new Map())
  const [selectedForRemove, setSelectedForRemove] = useState<
    Map<string, { id: string; name: string }>
  >(new Map())

  // Available filter options
  const [filterOptions, setFilterOptions] = useState<{
    sources: Array<{ id: string; name: string; count: number }>
    categories: Array<{ name: string; count: number }>
    types: Array<{ type: string; count: number }>
  }>({
    sources: [],
    categories: [],
    types: [],
  })

  // Fetch plugins
  useEffect(() => {
    const abortController = new AbortController()
    fetchPlugins(abortController.signal)

    return () => {
      abortController.abort()
    }
  }, [selectedSources, selectedCategories, selectedTypes, sortBy, statusTab])

  const fetchPlugins = async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (selectedSources.length > 0) params.set('source', selectedSources.join(','))
      if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','))
      if (selectedTypes.length > 0) params.set('type', selectedTypes.join(','))
      params.set('sort', sortBy)

      if (statusTab === 'installed') params.set('installed', 'true')
      if (statusTab === 'active') params.set('installed', 'active')

      const response = await fetch(`/api/plugins?${params.toString()}`, { signal })
      if (!response.ok) throw new Error('Failed to fetch plugins')

      const data: PluginListResponse = await response.json()
      if (data.success) {
        setPlugins(data.data.plugins)
        setFilterOptions(data.data.filters)
        setCatalogTotal(data.data.catalogTotal)
        setInstalledCount(data.data.installedCount)
        setActiveCount(data.data.activeCount)
      } else {
        throw new Error('Failed to load plugins')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Failed to load plugins')
    } finally {
      setLoading(false)
    }
  }

  // Client-side search filtering
  const filteredPlugins = useMemo(() => {
    if (!search) return plugins

    const q = search.toLowerCase()
    return plugins.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false) ||
        (p.author?.toLowerCase().includes(q) ?? false) ||
        p.categories.some((c) => c.toLowerCase().includes(q))
    )
  }, [plugins, search])

  // Toggle plugin selection for install command bar
  const handleSelect = useCallback((pluginId: string) => {
    const plugin = plugins.find((p) => p.id === pluginId)
    if (!plugin) return

    if (plugin.installed) {
      // Installed plugins toggle in the remove selection
      setSelectedForRemove((prev) => {
        const next = new Map(prev)
        if (next.has(pluginId)) {
          next.delete(pluginId)
        } else {
          next.set(pluginId, { id: pluginId, name: plugin.name })
        }
        return next
      })
    } else {
      // Uninstalled plugins toggle in the install selection
      setSelectedForInstall((prev) => {
        const next = new Map(prev)
        if (next.has(pluginId)) {
          next.delete(pluginId)
        } else {
          next.set(pluginId, { id: pluginId, name: plugin.name })
        }
        return next
      })
    }
  }, [plugins])

  const clearInstallSelection = useCallback(() => {
    setSelectedForInstall(new Map())
  }, [])

  const clearRemoveSelection = useCallback(() => {
    setSelectedForRemove(new Map())
  }, [])

  // Toggle active/inactive handler with optimistic update
  const handleToggle = async (pluginId: string, active: boolean) => {
    const plugin = plugins.find((p) => p.id === pluginId)
    if (!plugin || !plugin.installed) return

    const wasActive = plugin.active

    // Optimistic update
    setPlugins((prev) =>
      prev.map((p) => (p.id === pluginId ? { ...p, active } : p))
    )
    setActiveCount((c) => (active ? c + 1 : Math.max(0, c - 1)))

    try {
      const response = await fetch('/api/plugins/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pluginId, active }),
      })
      if (!response.ok) throw new Error('Failed')
    } catch {
      // Revert on failure
      setPlugins((prev) =>
        prev.map((p) => (p.id === pluginId ? { ...p, active: wasActive } : p))
      )
      setActiveCount((c) => (wasActive ? c + 1 : Math.max(0, c - 1)))
      showToast('Toggle failed', 'error')
    }
  }

  const toggleSource = (id: string) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSelectedSources([])
    setSelectedCategories([])
    setSelectedTypes([])
    setSearch('')
  }

  const hasActiveFilters =
    selectedSources.length > 0 ||
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    search.length > 0

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Plugin Catalog</h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage {catalogTotal} Claude Code plugins
            </p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2">
          {([
            { key: 'all' as StatusTab, label: 'All', count: catalogTotal },
            { key: 'installed' as StatusTab, label: 'Installed', count: installedCount },
            { key: 'active' as StatusTab, label: 'Active', count: activeCount },
            { key: 'repos' as StatusTab, label: 'My Repos', count: MY_REPOS.length },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusTab(tab.key)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                statusTab === tab.key
                  ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                  : 'bg-foreground/5 text-muted-foreground hover:text-foreground border border-transparent'
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Search Bar — hidden when repos tab is active */}
        {statusTab !== 'repos' && (
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search plugins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  'w-full px-4 py-2 rounded-lg',
                  'bg-background border border-border',
                  'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
                  'placeholder:text-muted-foreground'
                )}
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={cn(
                'px-4 py-2 rounded-lg',
                'bg-background border border-border',
                'focus:outline-none focus:ring-2 focus:ring-violet-500/50'
              )}
            >
              <option value="popular">Default</option>
              <option value="alphabetical">A-Z</option>
            </select>

            {/* View Toggle */}
            <CardSizeToggle value={cardSize} onChange={setCardSize} />
          </div>
        )}
      </div>

      {/* Main Content */}
      {statusTab === 'repos' ? (
        <RepoList />
      ) : (
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <PluginFilters
            sources={filterOptions.sources}
            categories={filterOptions.categories}
            types={filterOptions.types}
            selectedSources={selectedSources}
            selectedCategories={selectedCategories}
            selectedTypes={selectedTypes}
            onToggleSource={toggleSource}
            onToggleCategory={toggleCategory}
            onToggleType={toggleType}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Plugin Grid */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Install Command Bar */}
            <InstallCommandBar
              selectedPlugins={[...selectedForInstall.values()]}
              mode="install"
              onClear={clearInstallSelection}
            />

            {/* Remove Command Bar */}
            <InstallCommandBar
              selectedPlugins={[...selectedForRemove.values()]}
              mode="remove"
              onClear={clearRemoveSelection}
            />

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading plugins...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-400">{error}</div>
              </div>
            ) : filteredPlugins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="text-muted-foreground">
                  {statusTab !== 'all'
                    ? `No ${statusTab} plugins found`
                    : 'No plugins found'}
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-violet-400 hover:text-violet-300 text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className={cn('grid gap-4', GRID_CLASSES[cardSize])}>
                  {filteredPlugins.map((plugin) => (
                    <PluginCard
                      key={plugin.id}
                      plugin={plugin}
                      size={cardSize}
                      selected={
                        selectedForInstall.has(plugin.id) ||
                        selectedForRemove.has(plugin.id)
                      }
                      onSelect={handleSelect}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
