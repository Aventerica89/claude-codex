"use client"

import { cn } from '@/lib/utils'
import type { BrainItem } from '@/lib/generated/types'

const typeColors: Record<string, { badge: string; dot: string }> = {
  command: { badge: 'bg-blue-500/10 text-blue-400', dot: 'bg-blue-400' },
  agent: { badge: 'bg-purple-500/10 text-purple-400', dot: 'bg-purple-400' },
  skill: { badge: 'bg-green-500/10 text-green-400', dot: 'bg-green-400' },
  rule: { badge: 'bg-orange-500/10 text-orange-400', dot: 'bg-orange-400' },
}

interface ItemRowProps {
  item: BrainItem
  onEdit?: (item: BrainItem) => void
  onDeploy?: (item: BrainItem) => void
  onCopy?: (item: BrainItem) => void
}

export function ItemRow({ item, onEdit, onDeploy, onCopy }: ItemRowProps) {
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
        'flex items-center gap-4 px-4 py-3',
        'bg-card border border-border rounded-lg',
        'hover:border-violet-500/30 transition-colors group'
      )}
    >
      <div className={cn('w-2 h-2 rounded-full shrink-0', colors.dot)} />

      <code className="font-mono text-sm font-medium w-48 shrink-0 truncate">
        {item.name}
      </code>

      <span className={cn('px-2 py-0.5 text-xs rounded shrink-0', colors.badge)}>
        {item.category}
      </span>

      <p className="text-sm text-muted-foreground truncate flex-1 min-w-0">
        {item.description}
      </p>

      <div className="flex items-center gap-1.5 shrink-0">
        {item.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="hidden lg:inline px-1.5 py-0.5 text-xs bg-secondary/50 text-muted-foreground rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {onEdit && (
          <button
            onClick={() => onEdit(item)}
            className="px-2.5 py-1 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded transition-colors"
          >
            Open
          </button>
        )}
        {onDeploy && (
          <button
            onClick={() => onDeploy(item)}
            className="px-2.5 py-1 text-xs bg-secondary hover:bg-secondary/80 text-foreground rounded transition-colors"
          >
            Deploy
          </button>
        )}
        <button
          onClick={handleCopy}
          className="px-2.5 py-1 text-xs bg-secondary hover:bg-secondary/80 text-foreground rounded transition-colors"
          title="Copy to clipboard"
        >
          Copy
        </button>
      </div>
    </div>
  )
}
