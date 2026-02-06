"use client"

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ComponentPreview } from '@/components/ComponentCard'
import {
  registries,
  categories,
  getAllComponents,
  generateInstallCommands,
  type RegistryComponentWithRegistry,
} from '@/lib/registries'

const complexityColors = {
  simple: 'text-emerald-400',
  intermediate: 'text-amber-400',
  advanced: 'text-rose-400',
}

const registryBadgeColors: Record<string, string> = {
  shadcn: 'bg-foreground/10 text-foreground',
  'magic-ui': 'bg-pink-500/10 text-pink-400',
  aceternity: 'bg-sky-500/10 text-sky-400',
}

export function MarketplacePage() {
  const [search, setSearch] = useState('')
  const [selectedRegistries, setSelectedRegistries] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  const allComponents = useMemo(() => getAllComponents(), [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allComponents.filter((c) => {
      const matchRegistry =
        selectedRegistries.length === 0 ||
        selectedRegistries.includes(c.registry)
      const matchCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(c.category)
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      return matchRegistry && matchCategory && matchSearch
    })
  }, [allComponents, search, selectedRegistries, selectedCategories])

  const selectedComponents = useMemo(
    () => allComponents.filter((c) => selected.has(c.id)),
    [allComponents, selected]
  )

  const installCommands = useMemo(
    () => generateInstallCommands(selectedComponents as RegistryComponentWithRegistry[]),
    [selectedComponents]
  )

  const toggleComponent = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleRegistry = (id: string) => {
    setSelectedRegistries((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const copyCommands = async () => {
    await navigator.clipboard.writeText(installCommands.join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalSize = selectedComponents.reduce(
    (sum, c) => sum + parseFloat(c.bundleSize || '0'),
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Component Marketplace</h1>
          <p className="text-muted-foreground">
            {allComponents.length} components across {registries.length} registries
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <span className="text-sm text-violet-400 font-medium">
              {selected.size} selected
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {filtered.length} shown
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search components..."
          className="flex-1 px-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground self-center mr-1">
            Registry:
          </span>
          {registries.map((r) => (
            <button
              key={r.id}
              onClick={() => toggleRegistry(r.id)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-lg transition-colors',
                selectedRegistries.includes(r.id)
                  ? 'bg-violet-600 text-white'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {r.name} ({r.components.length})
            </button>
          ))}

          <span className="text-xs text-muted-foreground self-center ml-3 mr-1">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-lg transition-colors',
                selectedCategories.includes(cat)
                  ? 'bg-violet-600 text-white'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Install command bar */}
      {selected.size > 0 && (
        <div className="p-4 bg-card border border-violet-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selected.size} component{selected.size !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-muted-foreground">
                ~{totalSize.toFixed(1)} KB total
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(new Set())}
                className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                Clear
              </button>
              <button
                onClick={copyCommands}
                className="px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Commands'}
              </button>
            </div>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 font-mono text-xs overflow-x-auto">
            {installCommands.map((cmd, i) => (
              <div key={i} className="text-violet-400">{cmd}</div>
            ))}
          </div>
        </div>
      )}

      {/* Components grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((comp) => {
            const isSelected = selected.has(comp.id)
            return (
              <div
                key={comp.id}
                className={cn(
                  'flex flex-col gap-2 p-4 rounded-lg border transition-all',
                  isSelected
                    ? 'border-violet-500/50 bg-violet-500/5'
                    : 'border-border bg-card hover:border-violet-500/30'
                )}
              >
                {/* Name + checkbox */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium truncate">
                        {comp.name}
                      </h3>
                      <a
                        href={comp.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-violet-400 transition-colors shrink-0"
                        title="View docs"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {comp.description}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleComponent(comp.id)}
                    className={cn(
                      'w-5 h-5 rounded border shrink-0 mt-0.5 flex items-center justify-center transition-colors',
                      isSelected
                        ? 'bg-violet-600 border-violet-600'
                        : 'border-border hover:border-violet-500/50'
                    )}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Component preview */}
                <div className="w-full h-20 rounded-md bg-secondary/50 border border-border/50 flex items-center justify-center overflow-hidden">
                  <ComponentPreview componentId={comp.id} />
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-[10px] rounded font-medium',
                      registryBadgeColors[comp.registry] || 'bg-muted text-muted-foreground'
                    )}
                  >
                    {registries.find((r) => r.id === comp.registry)?.name || comp.registry}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-secondary text-muted-foreground">
                    {comp.category}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-medium',
                      complexityColors[comp.complexity]
                    )}
                  >
                    {comp.complexity}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono ml-auto">
                    {comp.bundleSize} KB
                  </span>
                </div>

                {/* Dependencies */}
                {comp.dependencies.length > 0 && (
                  <div className="text-[10px] text-muted-foreground">
                    {comp.dependencies.length} dep{comp.dependencies.length !== 1 ? 's' : ''}:{' '}
                    {comp.dependencies.slice(0, 2).join(', ')}
                    {comp.dependencies.length > 2 && ` +${comp.dependencies.length - 2}`}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No components match your filters.
        </div>
      )}
    </div>
  )
}
