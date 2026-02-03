"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  services,
  getStatusColor,
  getStatusBgColor,
  getStatusLabel,
  type Service,
} from '@/lib/services'

interface ServiceItemProps {
  service: Service
  isExpanded: boolean
  onToggle: () => void
}

function ServiceItem({ service, isExpanded, onToggle }: ServiceItemProps) {
  return (
    <div className="flex flex-col">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          "hover:bg-secondary/50",
          isExpanded && "bg-secondary/50"
        )}
      >
        {/* Status dot */}
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            getStatusBgColor(service.status)
          )}
        />

        {/* Service name */}
        <span className="text-sm font-medium">{service.name}</span>

        {/* Latency */}
        {service.latencyMs !== null && (
          <span className={cn(
            "text-xs",
            service.latencyMs < 100 ? "text-muted-foreground" : "text-yellow-500"
          )}>
            {service.latencyMs}ms
          </span>
        )}
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2 ml-4 border-l-2 border-border">
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className={getStatusColor(service.status)}>
                    {getStatusLabel(service.status)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="capitalize">{service.type}</span>
                </div>
                {service.endpoint && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Endpoint</span>
                    <span className="text-violet-400 font-mono text-[10px] truncate max-w-[120px]">
                      {service.endpoint}
                    </span>
                  </div>
                )}
                {service.lastCheck && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Check</span>
                    <span>{formatTimeAgo(service.lastCheck)}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function ConnectionStrip() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const connectedCount = services.filter(s => s.status === 'connected').length
  const warningCount = services.filter(s => s.status === 'warning').length
  const offlineCount = services.filter(s => s.status === 'offline').length

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Connection Status</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {connectedCount}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            {warningCount}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {offlineCount}
          </span>
        </div>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1">
        {services.map((service) => (
          <ServiceItem
            key={service.id}
            service={service}
            isExpanded={expandedId === service.id}
            onToggle={() => setExpandedId(
              expandedId === service.id ? null : service.id
            )}
          />
        ))}
      </div>
    </div>
  )
}

export default ConnectionStrip
