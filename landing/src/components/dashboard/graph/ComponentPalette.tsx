import { useState, useMemo } from 'react'
import { allItems } from '@/lib/generated'
import type { BrainItem, BrainItemType } from '@/lib/generated/types'
import { cn } from '@/lib/utils'

const TYPE_TABS: {
  type: BrainItemType
  label: string
  color: string
  activeBg: string
  chipBg: string
}[] = [
  {
    type: 'command',
    label: 'Cmd',
    color: 'text-purple-400',
    activeBg: 'bg-purple-500/20 border-purple-500/40',
    chipBg: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20',
  },
  {
    type: 'agent',
    label: 'Agt',
    color: 'text-emerald-400',
    activeBg: 'bg-emerald-500/20 border-emerald-500/40',
    chipBg: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20',
  },
  {
    type: 'skill',
    label: 'Skl',
    color: 'text-blue-400',
    activeBg: 'bg-blue-500/20 border-blue-500/40',
    chipBg: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20',
  },
  {
    type: 'rule',
    label: 'Rul',
    color: 'text-orange-400',
    activeBg: 'bg-orange-500/20 border-orange-500/40',
    chipBg: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20',
  },
]

interface ComponentPaletteProps {
  className?: string
}

export function ComponentPalette({ className }: ComponentPaletteProps) {
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<BrainItemType>('command')

  const activeTab = TYPE_TABS.find((t) => t.type === activeType)!

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return allItems.filter((item) => {
      if (item.type !== activeType) return false
      if (q && !item.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [search, activeType])

  const counts = useMemo(() => {
    const c: Record<BrainItemType, number> = {
      command: 0, agent: 0, skill: 0, rule: 0,
    }
    for (const item of allItems) {
      c[item.type]++
    }
    return c
  }, [])

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    item: BrainItem
  ) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description,
        category: item.category,
      })
    )
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className={cn(
      'h-full flex flex-col bg-card border-r border-border',
      className
    )}>
      {/* Type tabs */}
      <div className="flex border-b border-border">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.type}
            onClick={() => setActiveType(tab.type)}
            className={cn(
              'flex-1 py-2 text-[10px] font-medium border-b-2 transition-colors',
              activeType === tab.type
                ? `${tab.color} border-current`
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            <span className="block">{tab.label}</span>
            <span className="block text-[9px] opacity-60">
              {counts[tab.type]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-2">
        <input
          type="text"
          placeholder={`Search ${activeTab.label.toLowerCase()}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            'w-full px-2 py-1.5 text-xs rounded-md',
            'bg-secondary/50 border border-border',
            'text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-1 focus:ring-violet-500/50'
          )}
        />
      </div>

      {/* Chips grid */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-wrap gap-1">
          {filtered.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              title={item.description}
              className={cn(
                'px-2 py-1 text-[11px] rounded-md border',
                'cursor-grab active:cursor-grabbing',
                'transition-colors truncate max-w-full',
                activeTab.chipBg
              )}
            >
              {item.name}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground p-2 w-full text-center">
              No matches
            </p>
          )}
        </div>
      </div>

      {/* Help */}
      <div className="p-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground leading-relaxed text-center">
          Drag chips to canvas, or double-click canvas to quick-add
        </p>
      </div>
    </div>
  )
}
