import type { BrainItemType } from '@/lib/generated/types'

interface GraphControlsProps {
  visibleTypes: Set<BrainItemType>
  onToggleType: (type: BrainItemType) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  counts: Record<BrainItemType, number>
}

const TYPE_CONFIG: Array<{
  type: BrainItemType
  label: string
  color: string
  activeColor: string
}> = [
  {
    type: 'command',
    label: 'Commands',
    color: 'border-purple-500/30 text-purple-400/60',
    activeColor: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
  },
  {
    type: 'agent',
    label: 'Agents',
    color: 'border-emerald-500/30 text-emerald-400/60',
    activeColor: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300',
  },
  {
    type: 'skill',
    label: 'Skills',
    color: 'border-blue-500/30 text-blue-400/60',
    activeColor: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
  },
  {
    type: 'rule',
    label: 'Rules',
    color: 'border-orange-500/30 text-orange-400/60',
    activeColor: 'bg-orange-500/20 border-orange-500/50 text-orange-300',
  },
]

export function GraphControls({
  visibleTypes,
  onToggleType,
  searchQuery,
  onSearchChange,
  counts,
}: GraphControlsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search nodes..."
          className="pl-9 pr-3 py-1.5 text-sm bg-card border border-border rounded-lg
            focus:outline-none focus:ring-1 focus:ring-violet-500/50 w-48"
        />
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Type toggles */}
      {TYPE_CONFIG.map(({ type, label, color, activeColor }) => {
        const isActive = visibleTypes.has(type)
        return (
          <button
            key={type}
            onClick={() => onToggleType(type)}
            className={[
              'text-xs px-3 py-1.5 rounded-lg border transition-colors',
              isActive ? activeColor : color,
            ].join(' ')}
          >
            {label}
            <span className="ml-1.5 opacity-70">{counts[type]}</span>
          </button>
        )
      })}
    </div>
  )
}
