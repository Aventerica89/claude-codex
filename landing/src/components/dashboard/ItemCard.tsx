"use client"

import { cn } from '@/lib/utils'
import type { BrainItem } from '@/lib/generated/types'

const typeColors: Record<string, { badge: string; name: string }> = {
  command: { badge: 'bg-blue-500/10 text-blue-400', name: 'text-blue-400' },
  agent: { badge: 'bg-purple-500/10 text-purple-400', name: 'text-purple-400' },
  skill: { badge: 'bg-green-500/10 text-green-400', name: 'text-green-400' },
  rule: { badge: 'bg-orange-500/10 text-orange-400', name: 'text-orange-400' },
}

interface ItemCardProps {
  item: BrainItem
  onEdit?: (item: BrainItem) => void
  onDeploy?: (item: BrainItem) => void
  onCopy?: (item: BrainItem) => void
}

export function ItemCard({ item, onEdit, onDeploy, onCopy }: ItemCardProps) {
  const colors = typeColors[item.type] ?? typeColors.command

  const handleCopy = () => {
    if (onCopy) {
      onCopy(item)
      return
    }
    navigator.clipboard.writeText(item.content)
  }

  return (
    <div
      className={cn(
        'bg-card border border-border rounded-xl p-5',
        'hover:border-violet-500/30 transition-colors group'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <code className={cn('font-mono text-sm font-semibold', colors.name)}>
          {item.name}
        </code>
        <span className={cn('px-2 py-0.5 text-xs rounded', colors.badge)}>
          {item.category}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {item.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {item.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 text-xs bg-secondary/50 text-muted-foreground rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={() => onEdit(item)}
            className="flex-1 px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          >
            Open
          </button>
        )}
        {onDeploy && (
          <button
            onClick={() => onDeploy(item)}
            className="flex-1 px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
          >
            Deploy
          </button>
        )}
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
          title="Copy to clipboard"
        >
          Copy
        </button>
      </div>
    </div>
  )
}
