"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'

export interface AppData {
  id: string
  name: string
  display_name: string | null
  status: string
  tech_stack: string[]
  live_url: string | null
  repository_url: string | null
}

export interface ConnectedItem {
  itemId: string
  connectedAt: string
  name: string
  type: string
  description: string
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-500' },
  inactive: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
  archived: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-500' },
  maintenance: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' },
}

const TYPE_COLORS: Record<string, string> = {
  command: 'text-blue-400 bg-blue-500/10',
  agent: 'text-purple-400 bg-purple-500/10',
  skill: 'text-green-400 bg-green-500/10',
  rule: 'text-orange-400 bg-orange-500/10',
}

interface AppCardProps {
  app: AppData
  connectedItems: ConnectedItem[]
  onConnect: (appId: string) => void
  onDisconnect: (appId: string, itemId: string) => void
}

export function AppCard({ app, connectedItems, onConnect, onDisconnect }: AppCardProps) {
  const [expanded, setExpanded] = useState(false)
  const statusStyle = STATUS_COLORS[app.status] ?? STATUS_COLORS.inactive
  const displayName = app.display_name ?? app.name

  return (
    <div className={cn(
      'bg-card border border-border rounded-xl transition-all',
      'hover:border-violet-500/30',
      expanded && 'border-violet-500/20'
    )}>
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold truncate">{displayName}</h3>
            {app.display_name && app.name !== app.display_name && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {app.name}
              </p>
            )}
          </div>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 ml-2',
            statusStyle.bg, statusStyle.text
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full', statusStyle.dot)} />
            {app.status}
          </span>
        </div>

        {/* Tech stack tags */}
        {app.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {app.tech_stack.slice(0, 5).map((tech) => (
              <span
                key={tech}
                className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground"
              >
                {tech}
              </span>
            ))}
            {app.tech_stack.length > 5 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                +{app.tech_stack.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Links row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {app.live_url && (
            <span
              onClick={(e) => {
                e.stopPropagation()
                window.open(app.live_url!, '_blank', 'noopener,noreferrer')
              }}
              className="hover:text-violet-400 transition-colors cursor-pointer truncate"
            >
              {app.live_url.replace(/^https?:\/\//, '')}
            </span>
          )}
          {connectedItems.length > 0 && (
            <span className="text-violet-400">
              {connectedItems.length} connected
            </span>
          )}
          <svg
            className={cn(
              'w-4 h-4 ml-auto transition-transform',
              expanded && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Connected Items</h4>
            <button
              onClick={() => onConnect(app.id)}
              className={cn(
                'text-xs px-3 py-1 rounded-lg transition-colors',
                'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20'
              )}
            >
              + Connect Item
            </button>
          </div>

          {connectedItems.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              No codex items connected yet.
            </p>
          ) : (
            <div className="space-y-2">
              {connectedItems.map((item) => (
                <div
                  key={item.itemId}
                  className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded capitalize',
                      TYPE_COLORS[item.type] ?? 'text-gray-400 bg-gray-500/10'
                    )}>
                      {item.type}
                    </span>
                    <span className="text-sm truncate">{item.name}</span>
                  </div>
                  <button
                    onClick={() => onDisconnect(app.id, item.itemId)}
                    className="text-xs text-muted-foreground hover:text-red-400 transition-colors shrink-0 ml-2"
                    title="Disconnect"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AppCard
