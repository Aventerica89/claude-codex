"use client"

import { cn } from '@/lib/utils'
import type { CatalogPluginWithStatus } from '@/lib/plugins/types'
import type { CardSize } from './CardSizeToggle'

interface PluginCardProps {
  plugin: CatalogPluginWithStatus
  size: CardSize
  selected?: boolean
  onSelect: (pluginId: string) => void
  onToggle: (pluginId: string, active: boolean) => void
}

const sourceBadgeColors: Record<string, string> = {
  'anthropic-official': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  'awesome-community': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  local: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

const typeColors = {
  agent: 'text-purple-400',
  skill: 'text-green-400',
  command: 'text-blue-400',
  rule: 'text-orange-400',
}

const statusDotColors = {
  active: 'bg-green-400',
  installed: 'bg-gray-400',
  none: '',
}

export function PluginCard({ plugin, size, selected = false, onSelect, onToggle }: PluginCardProps) {
  const isCompact = size === 'compact'
  const isLarge = size === 'large'

  const sourceName =
    plugin.source_id === 'anthropic-official'
      ? 'Official'
      : plugin.source_id === 'awesome-community'
        ? 'Community'
        : 'Local'

  const statusKey = plugin.active ? 'active' : plugin.installed ? 'installed' : 'none'

  return (
    <a
      href={`/dashboard/plugins/${plugin.id}`}
      className={cn(
        'group relative flex flex-col',
        'bg-card border rounded-lg',
        'transition-all duration-200',
        selected
          ? 'border-amber-500/50 bg-amber-500/5'
          : 'border-border hover:border-violet-500/50 hover:bg-card/80',
        isCompact ? 'p-3 gap-2' : isLarge ? 'p-6 gap-4' : 'p-4 gap-3'
      )}
    >
      {/* Source Badge + Status Dot */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {statusKey !== 'none' && (
            <span
              className={cn('w-2 h-2 rounded-full shrink-0', statusDotColors[statusKey])}
              title={plugin.active ? 'Active' : 'Installed'}
            />
          )}
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded border',
              sourceBadgeColors[plugin.source_id] || sourceBadgeColors.local
            )}
          >
            {sourceName}
          </span>
        </div>

        {/* Select / Toggle Control */}
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.preventDefault()}
        >
          {!plugin.installed ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onSelect(plugin.id)
              }}
              className={cn(
                'text-xs font-medium px-2.5 py-1 rounded transition-colors border',
                selected
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border-violet-500/20'
              )}
            >
              {selected ? 'Selected' : 'Install'}
            </button>
          ) : (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onSelect(plugin.id)
                }}
                className={cn(
                  'text-xs font-medium px-2 py-1 rounded transition-colors border',
                  selected
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-foreground/5 text-muted-foreground hover:text-red-400 border-transparent hover:border-red-500/20'
                )}
                title="Select for removal"
              >
                {selected ? 'Remove' : 'X'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onToggle(plugin.id, !plugin.active)
                }}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full',
                  'border-2 border-transparent transition-colors duration-200',
                  plugin.active ? 'bg-violet-500' : 'bg-foreground/20'
                )}
                title={plugin.active ? 'Deactivate' : 'Activate'}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 rounded-full',
                    'bg-white shadow-sm transition-transform duration-200',
                    plugin.active ? 'translate-x-4' : 'translate-x-0'
                  )}
                />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Plugin Name */}
      <div className="flex-1">
        <h3
          className={cn(
            'font-semibold group-hover:text-violet-400 transition-colors',
            isCompact ? 'text-sm line-clamp-2' : isLarge ? 'text-xl' : 'text-base'
          )}
        >
          {plugin.name}
        </h3>

        {/* Description */}
        {!isCompact && plugin.description && (
          <p
            className={cn(
              'text-muted-foreground mt-1',
              isLarge ? 'text-sm line-clamp-3' : 'text-xs line-clamp-2'
            )}
          >
            {plugin.description}
          </p>
        )}
      </div>

      {/* Component Counts */}
      <div
        className={cn(
          'flex gap-3',
          isCompact ? 'text-xs flex-wrap' : 'text-sm',
          isLarge && 'gap-4'
        )}
      >
        {plugin.agent_count > 0 && (
          <div className="flex items-center gap-1">
            <span className={typeColors.agent}>{plugin.agent_count}</span>
            <span className="text-muted-foreground">
              agent{plugin.agent_count !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {plugin.skill_count > 0 && (
          <div className="flex items-center gap-1">
            <span className={typeColors.skill}>{plugin.skill_count}</span>
            <span className="text-muted-foreground">
              skill{plugin.skill_count !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {plugin.command_count > 0 && (
          <div className="flex items-center gap-1">
            <span className={typeColors.command}>{plugin.command_count}</span>
            <span className="text-muted-foreground">
              command{plugin.command_count !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        {plugin.rule_count > 0 && (
          <div className="flex items-center gap-1">
            <span className={typeColors.rule}>{plugin.rule_count}</span>
            <span className="text-muted-foreground">
              rule{plugin.rule_count !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Categories */}
      {!isCompact && plugin.categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {plugin.categories.slice(0, isLarge ? 5 : 3).map((cat) => (
            <span
              key={cat}
              className={cn(
                'text-xs px-2 py-0.5 rounded',
                'bg-foreground/5 text-muted-foreground'
              )}
            >
              {cat}
            </span>
          ))}
          {plugin.categories.length > (isLarge ? 5 : 3) && (
            <span className="text-xs text-muted-foreground">
              +{plugin.categories.length - (isLarge ? 5 : 3)}
            </span>
          )}
        </div>
      )}

      {/* Author (large view) */}
      {isLarge && plugin.author && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
          <span>by {plugin.author}</span>
        </div>
      )}

      {/* Hover Indicator */}
      <div
        className={cn(
          'absolute inset-0 rounded-lg pointer-events-none',
          'ring-2 transition-all duration-200',
          selected
            ? 'ring-amber-500/30'
            : 'ring-violet-500/0 group-hover:ring-violet-500/20'
        )}
      />
    </a>
  )
}
