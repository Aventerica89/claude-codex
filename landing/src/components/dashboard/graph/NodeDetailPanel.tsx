import type { BrainItem, AgentItem, SkillItem } from '@/lib/generated/types'
import type { Edge } from '@xyflow/react'

interface NodeDetailPanelProps {
  item: BrainItem | null
  allItems: BrainItem[]
  edges: Edge[]
  onClose: () => void
}

const TYPE_BADGE_STYLES: Record<string, string> = {
  command: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  agent: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  skill: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  rule: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

export function NodeDetailPanel({
  item,
  allItems,
  edges,
  onClose,
}: NodeDetailPanelProps) {
  if (!item) return null

  const outgoing = edges.filter((e) => e.source === item.id)
  const incoming = edges.filter((e) => e.target === item.id)
  const badgeStyle = TYPE_BADGE_STYLES[item.type] || ''

  const findItem = (id: string) => allItems.find((i) => i.id === id)

  return (
    <div className="w-80 bg-card border-l border-border h-full overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {item.name}
            </h3>
            <span
              className={[
                'inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border',
                badgeStyle,
              ].join(' ')}
            >
              {item.type}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 border-b border-border">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {item.description}
        </p>
      </div>

      {/* Metadata */}
      <div className="p-4 border-b border-border space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Details
        </h4>
        <MetadataRow label="Category" value={item.category} />
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {item.type === 'agent' && (
          <>
            <MetadataRow
              label="Model"
              value={(item as AgentItem).model || 'default'}
            />
            <MetadataRow
              label="Tools"
              value={(item as AgentItem).tools.join(', ')}
            />
          </>
        )}
        {item.type === 'skill' && (
          <MetadataRow
            label="Kind"
            value={(item as SkillItem).kind}
          />
        )}
      </div>

      {/* Connections */}
      {(outgoing.length > 0 || incoming.length > 0) && (
        <div className="p-4 space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Connections
          </h4>

          {outgoing.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Outgoing ({outgoing.length})
              </p>
              <div className="space-y-1">
                {outgoing.map((edge) => {
                  const target = findItem(edge.target)
                  if (!target) return null
                  return (
                    <ConnectionRow
                      key={edge.id}
                      name={target.name}
                      type={target.type}
                      label={String(edge.label || '')}
                    />
                  )
                })}
              </div>
            </div>
          )}

          {incoming.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Incoming ({incoming.length})
              </p>
              <div className="space-y-1">
                {incoming.map((edge) => {
                  const source = findItem(edge.source)
                  if (!source) return null
                  return (
                    <ConnectionRow
                      key={edge.id}
                      name={source.name}
                      type={source.type}
                      label={String(edge.label || '')}
                    />
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function MetadataRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground truncate max-w-[160px]">{value}</span>
    </div>
  )
}

function ConnectionRow({
  name,
  type,
  label,
}: {
  name: string
  type: string
  label: string
}) {
  const dotColor: Record<string, string> = {
    command: 'bg-purple-400',
    agent: 'bg-emerald-400',
    skill: 'bg-blue-400',
    rule: 'bg-orange-400',
  }

  return (
    <div className="flex items-center gap-2 text-xs py-0.5">
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[type] || 'bg-gray-400'}`} />
      <span className="text-foreground truncate">{name}</span>
      <span className="text-muted-foreground/60 ml-auto shrink-0">{label}</span>
    </div>
  )
}
