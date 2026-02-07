import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { BrainItemType } from '@/lib/generated/types'

export interface ERNodeData {
  label: string
  itemType: BrainItemType
  category: string
  meta1Label: string
  meta1Value: string
  meta2Label: string
  meta2Value: string
  isHighlighted: boolean
  isSelected: boolean
  [key: string]: unknown
}

const TYPE_STYLES: Record<BrainItemType, {
  headerBg: string
  borderColor: string
  badge: string
  badgeText: string
}> = {
  command: {
    headerBg: 'bg-purple-500/20',
    borderColor: 'border-purple-500/40',
    badge: 'bg-purple-500/30 text-purple-300',
    badgeText: 'Command',
  },
  agent: {
    headerBg: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/40',
    badge: 'bg-emerald-500/30 text-emerald-300',
    badgeText: 'Agent',
  },
  skill: {
    headerBg: 'bg-blue-500/20',
    borderColor: 'border-blue-500/40',
    badge: 'bg-blue-500/30 text-blue-300',
    badgeText: 'Skill',
  },
  rule: {
    headerBg: 'bg-orange-500/20',
    borderColor: 'border-orange-500/40',
    badge: 'bg-orange-500/30 text-orange-300',
    badgeText: 'Rule',
  },
}

function ERNodeComponent({ data }: NodeProps) {
  const nodeData = data as unknown as ERNodeData
  const style = TYPE_STYLES[nodeData.itemType]

  const highlightRing = nodeData.isHighlighted
    ? 'ring-2 ring-yellow-400/60'
    : ''
  const selectedRing = nodeData.isSelected
    ? 'ring-2 ring-violet-400/80'
    : ''

  return (
    <div
      className={[
        'w-[200px] rounded-lg border bg-card shadow-md',
        'transition-all duration-150',
        style.borderColor,
        highlightRing,
        selectedRing,
      ].join(' ')}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-muted-foreground/50"
      />

      {/* Header */}
      <div className={[
        'px-3 py-2 rounded-t-lg border-b',
        style.headerBg,
        style.borderColor,
      ].join(' ')}>
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold truncate text-foreground">
            {nodeData.label}
          </span>
          <span className={[
            'text-[10px] px-1.5 py-0.5 rounded-full shrink-0',
            style.badge,
          ].join(' ')}>
            {style.badgeText}
          </span>
        </div>
      </div>

      {/* Metadata fields */}
      <div className="px-3 py-2 space-y-1 text-[11px]">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">{nodeData.meta1Label}</span>
          <span className="text-foreground truncate max-w-[110px]">
            {nodeData.meta1Value}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">{nodeData.meta2Label}</span>
          <span className="text-foreground truncate max-w-[110px]">
            {nodeData.meta2Value}
          </span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-muted-foreground/50"
      />
    </div>
  )
}

export const ERNode = memo(ERNodeComponent)
