"use client"

import { cn } from '@/lib/utils'

interface PluginFiltersProps {
  sources: Array<{ id: string; name: string; count: number }>
  categories: Array<{ name: string; count: number }>
  types: Array<{ type: string; count: number }>
  selectedSources: string[]
  selectedCategories: string[]
  selectedTypes: string[]
  onToggleSource: (id: string) => void
  onToggleCategory: (cat: string) => void
  onToggleType: (type: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
}

export function PluginFilters({
  sources,
  categories,
  types,
  selectedSources,
  selectedCategories,
  selectedTypes,
  onToggleSource,
  onToggleCategory,
  onToggleType,
  onClearFilters,
  hasActiveFilters,
}: PluginFiltersProps) {
  return (
    <div className="w-64 shrink-0">
      <div className="sticky top-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Sources */}
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium text-muted-foreground">Source</div>
          <div className="flex flex-col gap-2">
            {sources.map((source) => (
              <label
                key={source.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selectedSources.includes(source.id)}
                  onChange={() => onToggleSource(source.id)}
                  className={cn(
                    'w-4 h-4 rounded border-border',
                    'text-violet-500 focus:ring-violet-500/50',
                    'cursor-pointer'
                  )}
                />
                <span className="text-sm group-hover:text-foreground transition-colors flex-1">
                  {source.name}
                </span>
                <span className="text-xs text-muted-foreground">{source.count}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Types */}
        {types.length > 0 && (
          <div className="flex flex-col gap-3 pt-3 border-t border-border">
            <div className="text-sm font-medium text-muted-foreground">Type</div>
            <div className="flex flex-col gap-2">
              {types.map((type) => (
                <label
                  key={type.type}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.type)}
                    onChange={() => onToggleType(type.type)}
                    className={cn(
                      'w-4 h-4 rounded border-border',
                      'text-violet-500 focus:ring-violet-500/50',
                      'cursor-pointer'
                    )}
                  />
                  <span className="text-sm group-hover:text-foreground transition-colors flex-1 capitalize">
                    {type.type}s
                  </span>
                  <span className="text-xs text-muted-foreground">{type.count}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-col gap-3 pt-3 border-t border-border">
            <div className="text-sm font-medium text-muted-foreground">Category</div>
            <div className="flex flex-col gap-2">
              {categories.slice(0, 10).map((cat) => (
                <label
                  key={cat.name}
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => onToggleCategory(cat.name)}
                    className={cn(
                      'w-4 h-4 rounded border-border',
                      'text-violet-500 focus:ring-violet-500/50',
                      'cursor-pointer'
                    )}
                  />
                  <span className="text-sm group-hover:text-foreground transition-colors flex-1 capitalize">
                    {cat.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{cat.count}</span>
                </label>
              ))}
              {categories.length > 10 && (
                <div className="text-xs text-muted-foreground pl-6">
                  +{categories.length - 10} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
