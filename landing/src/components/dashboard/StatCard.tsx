"use client"

import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number | string
  subtitle?: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  icon?: React.ReactNode
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'cyan'
  onClick?: () => void
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    border: 'border-purple-500/20',
  },
  green: {
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    border: 'border-green-500/20',
  },
  orange: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/20',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/20',
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  color = 'purple',
  onClick,
}: StatCardProps) {
  const colors = colorClasses[color]

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-5 rounded-xl border transition-all",
        "bg-card hover:bg-secondary/50",
        "border-border hover:border-violet-500/30",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium mb-1",
                trend.isPositive !== false ? "text-green-400" : "text-red-400"
              )}
            >
              {trend.isPositive !== false ? '↗' : '↘'}
              {trend.value > 0 && '+'}
              {trend.value} {trend.label}
            </span>
          )}
          <div className={cn("text-3xl font-bold", colors.text)}>
            {value}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground/70 mt-0.5">
              {subtitle}
            </div>
          )}
        </div>

        {icon && (
          <div className={cn("p-2 rounded-lg", colors.bg, colors.border, "border")}>
            {icon}
          </div>
        )}
      </div>

      {onClick && (
        <div className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all →
        </div>
      )}
    </button>
  )
}

export default StatCard
