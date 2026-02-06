"use client"

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { CardSizeToggle, type CardSize } from './CardSizeToggle'
import { PluginCard } from './PluginCard'
import { PluginFilters } from './PluginFilters'
import type { Plugin, PluginListResponse } from '@/lib/plugins/types'

const GRID_CLASSES: Record<CardSize, string> = {
  compact: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  normal: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  large: 'grid-cols-1 md:grid-cols-2',
}

export function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  // Filter states
  const [search, setSearch] = useState('')
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'alphabetical'>('popular')
  const [cardSize, setCardSize] = useState<CardSize>('normal')

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
    fetchPlugins()
  }, [selectedSources, selectedCategories, selectedTypes, sortBy])

  const fetchPlugins = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (selectedSources.length > 0) params.set('source', selectedSources.join(','))
      if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','))
      if (selectedTypes.length > 0) params.set('type', selectedTypes.join(','))
      params.set('sort', sortBy)

      const response = await fetch(`/api/plugins?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch plugins')

      const data: PluginListResponse = await response.json()
      if (data.success) {
        setPlugins(data.data.plugins)
        setFilterOptions(data.data.filters)
      } else {
        throw new Error('Failed to load plugins')
      }
    } catch (err) {
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
        p.description?.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
    )
  }, [plugins, search])

  // Sync plugins
  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/plugins/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      })

      if (!response.ok) throw new Error('Sync failed')

      const data = await response.json()
      if (data.success) {
        await fetchPlugins()
        alert(`Synced ${data.data.synced} plugin sources!`)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to sync plugins')
    } finally {
      setSyncing(false)
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
            <h1 className="text-3xl font-bold">Plugin Repository</h1>
            <p className="text-muted-foreground mt-1">
              Browse and install Claude Code plugins from official and community sources
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {syncing ? 'Syncing...' : 'Sync Plugins'}
          </button>
        </div>

        {/* Search Bar */}
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
            <option value="popular">Popular</option>
            <option value="recent">Recent</option>
            <option value="alphabetical">A-Z</option>
          </select>

          {/* View Toggle */}
          <CardSizeToggle value={cardSize} onChange={setCardSize} />
        </div>
      </div>

      {/* Main Content */}
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
        <div className="flex-1">
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
              <div className="text-muted-foreground">No plugins found</div>
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
                  <PluginCard key={plugin.id} plugin={plugin} size={cardSize} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
