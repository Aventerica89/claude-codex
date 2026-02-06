"use client"

import { cn } from '@/lib/utils'
import type { Plugin } from '@/lib/plugins/types'
import type { CardSize } from './CardSizeToggle'

interface PluginCardProps {
  plugin: Plugin
  size: CardSize
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

export function PluginCard({ plugin, size }: PluginCardProps) {
  const isCompact = size === 'compact'
  const isLarge = size === 'large'

  const sourceName =
    plugin.source_id === 'anthropic-official'
      ? 'Official'
      : plugin.source_id === 'awesome-community'
        ? 'Community'
        : 'Local'

  return (
    <a
      href={`/dashboard/plugins/${plugin.id}`}
      className={cn(
        'group relative flex flex-col',
        'bg-card border border-border rounded-lg',
        'hover:border-violet-500/50 hover:bg-card/80',
        'transition-all duration-200',
        isCompact ? 'p-3 gap-2' : isLarge ? 'p-6 gap-4' : 'p-4 gap-3'
      )}
    >
      {/* Source Badge */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-xs font-medium px-2 py-1 rounded border',
            sourceBadgeColors[plugin.source_id] || sourceBadgeColors.local
          )}
        >
          {sourceName}
        </span>

        {/* Install Count */}
        {!isCompact && plugin.install_count > 0 && (
          <span className="text-xs text-muted-foreground">
            {plugin.install_count} install{plugin.install_count !== 1 ? 's' : ''}
          </span>
        )}
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

      {/* Author & Version */}
      {isLarge && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2 border-t border-border">
          {plugin.author && <span>by {plugin.author}</span>}
          {plugin.version && <span>v{plugin.version}</span>}
          {plugin.license && <span>{plugin.license}</span>}
        </div>
      )}

      {/* Hover Indicator */}
      <div
        className={cn(
          'absolute inset-0 rounded-lg pointer-events-none',
          'ring-2 ring-violet-500/0 group-hover:ring-violet-500/20',
          'transition-all duration-200'
        )}
      />
    </a>
  )
}
