import { useMemo } from 'react'
import { getItemById, getOutgoingRefs, getIncomingRefs } from '@/lib/generated'
import type { BrainItemType } from '@/lib/generated/types'
import { cn } from '@/lib/utils'

interface BrainItemModalProps {
  itemId: string
  onClose: () => void
}

const TYPE_COLORS: Record<BrainItemType, string> = {
  command: 'text-purple-400 bg-purple-500/20 border-purple-500/40',
  agent: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40',
  skill: 'text-blue-400 bg-blue-500/20 border-blue-500/40',
  rule: 'text-orange-400 bg-orange-500/20 border-orange-500/40',
}

export function BrainItemModal({ itemId, onClose }: BrainItemModalProps) {
  const item = useMemo(() => getItemById(itemId), [itemId])
  const outgoing = useMemo(
    () => (item ? getOutgoingRefs(item) : []),
    [item]
  )
  const incoming = useMemo(
    () => (item ? getIncomingRefs(item) : []),
    [item]
  )

  if (!item) return null

  const typeStyle = TYPE_COLORS[item.type]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[80vh] overflow-y-auto',
          'rounded-xl border border-border bg-card shadow-2xl'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 p-4 border-b border-border bg-card/95 backdrop-blur-sm rounded-t-xl">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-foreground truncate">
              {item.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full border',
                typeStyle
              )}>
                {item.type}
              </span>
              {item.category && (
                <span className="text-[10px] text-muted-foreground">
                  {item.category}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'shrink-0 w-6 h-6 flex items-center justify-center rounded',
              'text-muted-foreground hover:text-foreground',
              'hover:bg-secondary/50 transition-colors'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Description */}
          {item.description && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Description
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {item.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Agent-specific fields */}
          {'tools' in item && item.tools.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Tools
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {item.tools.map((tool) => (
                  <span
                    key={tool}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {'model' in item && item.model && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Model
              </h3>
              <span className="text-xs text-foreground/80">{item.model}</span>
            </div>
          )}

          {/* Skill kind */}
          {'kind' in item && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Kind
              </h3>
              <span className="text-xs text-foreground/80 capitalize">{item.kind}</span>
            </div>
          )}

          {/* References: Outgoing */}
          {outgoing.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                References ({outgoing.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {outgoing.map((ref) => (
                  <span
                    key={ref.id}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full border',
                      TYPE_COLORS[ref.type]
                    )}
                  >
                    {ref.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* References: Incoming */}
          {incoming.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Referenced By ({incoming.length})
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {incoming.map((ref) => (
                  <span
                    key={ref.id}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full border',
                      TYPE_COLORS[ref.type]
                    )}
                  >
                    {ref.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Content preview */}
          {item.content && (
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Content
              </h3>
              <pre className={cn(
                'text-[11px] leading-relaxed p-3 rounded-lg',
                'bg-secondary/50 text-foreground/80',
                'overflow-x-auto max-h-60 whitespace-pre-wrap break-words'
              )}>
                {item.content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
