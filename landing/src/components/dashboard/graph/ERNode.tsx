import { memo, useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import type { BrainItemType } from '@/lib/generated/types'

export interface ERNodeData {
  label: string
  itemType: BrainItemType
  brainItemId: string
  description?: string
  category: string
  meta1Label: string
  meta1Value: string
  meta2Label: string
  meta2Value: string
  isHighlighted: boolean
  isSelected: boolean
  isReferenceNode?: boolean
  isExpanded?: boolean
  referenceCount?: number
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

function ERNodeComponent({ id, data }: NodeProps) {
  const nodeData = data as unknown as ERNodeData
  const style = TYPE_STYLES[nodeData.itemType]
  const { deleteElements } = useReactFlow()

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      deleteElements({ nodes: [{ id }] })
    },
    [id, deleteElements]
  )

  const highlightRing = nodeData.isHighlighted
    ? 'ring-2 ring-yellow-400/60'
    : ''
  const selectedRing = nodeData.isSelected
    ? 'ring-2 ring-violet-400/80'
    : ''
  const refNodeStyle = nodeData.isReferenceNode
    ? 'border-dashed opacity-90'
    : ''

  return (
    <div
      className={[
        'w-[200px] rounded-lg border bg-card shadow-md',
        'transition-all duration-150 group',
        style.borderColor,
        highlightRing,
        selectedRing,
        refNodeStyle,
      ].join(' ')}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-muted-foreground/50"
      />

      {/* Header */}
      <div className={[
        'px-3 py-2 rounded-t-lg border-b relative',
        style.headerBg,
        style.borderColor,
      ].join(' ')}>
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold truncate text-foreground">
            {nodeData.label}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <span className={[
              'text-[10px] px-1.5 py-0.5 rounded-full',
              style.badge,
            ].join(' ')}>
              {style.badgeText}
            </span>
            {/* Expand/collapse badge for explore mode */}
            {typeof nodeData.referenceCount === 'number' && nodeData.referenceCount > 0 && (
              <span className={[
                'text-[9px] min-w-[16px] h-4 flex items-center justify-center',
                'rounded-full px-1 font-bold',
                nodeData.isExpanded
                  ? 'bg-cyan-500/30 text-cyan-300'
                  : 'bg-cyan-500/20 text-cyan-400',
              ].join(' ')}>
                {nodeData.isExpanded ? '\u2212' : `+${nodeData.referenceCount}`}
              </span>
            )}
            {/* Delete button - visible on hover */}
            <button
              onClick={handleDelete}
              className={[
                'opacity-0 group-hover:opacity-100',
                'w-4 h-4 flex items-center justify-center',
                'rounded text-muted-foreground hover:text-red-400',
                'transition-opacity',
              ].join(' ')}
              title="Remove from canvas"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Metadata fields */}
      <div className="px-3 py-2 space-y-1 text-[11px]">
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">
            {nodeData.meta1Label}
          </span>
          <span className="text-foreground truncate max-w-[110px]">
            {nodeData.meta1Value}
          </span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muted-foreground">
            {nodeData.meta2Label}
          </span>
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
