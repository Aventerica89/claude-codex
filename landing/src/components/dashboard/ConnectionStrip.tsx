"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  services,
  getStatusColor,
  getStatusBgColor,
  getStatusLabel,
  type Service,
  type ServiceType,
} from '@/lib/services'

const TYPE_LABELS: Record<ServiceType, string> = {
  platform: 'Platforms',
  database: 'Databases',
  tool: 'Tools',
  integration: 'MCP',
}

const TYPE_ORDER: ServiceType[] = ['platform', 'database', 'tool', 'integration']

function groupByType(items: Service[]): Record<ServiceType, Service[]> {
  const groups: Record<ServiceType, Service[]> = {
    platform: [],
    database: [],
    tool: [],
    integration: [],
  }
  for (const service of items) {
    groups[service.type].push(service)
  }
  return groups
}

interface ServiceChipProps {
  service: Service
  isSelected: boolean
  onSelect: () => void
}

function ServiceChip({ service, isSelected, onSelect }: ServiceChipProps) {
  return (
    <button
      onClick={onSelect}
      aria-label={`${service.name} service status: ${getStatusLabel(service.status)}`}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all min-h-[44px]',
        'border border-transparent active:scale-95',
        isSelected
          ? 'bg-secondary border-border shadow-sm'
          : 'hover:bg-secondary/40'
      )}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full shrink-0', getStatusBgColor(service.status))}
      />
      <span className="font-medium whitespace-nowrap">{service.name}</span>
      {service.latencyMs !== null ? (
        <span
          className={cn(
            'tabular-nums',
            service.latencyMs < 100 ? 'text-muted-foreground' : 'text-yellow-500'
          )}
        >
          {service.latencyMs}ms
        </span>
      ) : (
        <span className="text-red-400">--</span>
      )}
    </button>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

interface DetailPanelProps {
  service: Service
}

function DetailPanel({ service }: DetailPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-3 sm:px-4 py-3 bg-secondary/30 rounded-lg text-xs mt-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Status</span>
          <span className={cn('font-medium', getStatusColor(service.status))}>
            {getStatusLabel(service.status)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Type</span>
          <span className="capitalize">{service.type}</span>
        </div>
        {service.endpoint && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Endpoint</span>
            <span className="text-violet-400 font-mono truncate max-w-[200px]">
              {service.endpoint}
            </span>
          </div>
        )}
        {service.latencyMs !== null && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Latency</span>
            <span className="tabular-nums">{service.latencyMs}ms</span>
          </div>
        )}
        {service.lastCheck && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Checked</span>
            <span>{formatTimeAgo(service.lastCheck)}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function ConnectionStrip() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const connectedCount = services.filter(s => s.status === 'connected').length
  const warningCount = services.filter(s => s.status === 'warning').length
  const offlineCount = services.filter(s => s.status === 'offline').length

  const grouped = groupByType(services)
  const selectedService = selectedId
    ? services.find(s => s.id === selectedId) ?? null
    : null

  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-sm font-semibold">Connection Status</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {connectedCount}
          </span>
          {warningCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              {warningCount}
            </span>
          )}
          {offlineCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {offlineCount}
            </span>
          )}
        </div>
      </div>

      {/* Grouped rows */}
      <div className="space-y-3 sm:space-y-1">
        {TYPE_ORDER.map(type => {
          const group = grouped[type]
          if (group.length === 0) return null

          return (
            <div key={type} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-1">
              {/* Type label */}
              <span className="text-[11px] text-muted-foreground sm:w-20 shrink-0 sm:text-right sm:pr-3">
                {TYPE_LABELS[type]}
              </span>

              {/* Divider - hidden on mobile */}
              <div className="hidden sm:block w-px h-5 bg-border shrink-0" />

              {/* Service chips */}
              <div className="flex items-center gap-2 flex-wrap sm:pl-2">
                {group.map(service => (
                  <ServiceChip
                    key={service.id}
                    service={service}
                    isSelected={selectedId === service.id}
                    onSelect={() =>
                      setSelectedId(selectedId === service.id ? null : service.id)
                    }
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedService && (
          <DetailPanel key={selectedService.id} service={selectedService} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ConnectionStrip
