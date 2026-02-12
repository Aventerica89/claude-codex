"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { stats } from '@/lib/generated/stats'

interface NavItem {
  id: string
  label: string
  icon: string
  href: string
  primary?: boolean
}

const primaryNavItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    href: '/dashboard',
    primary: true,
  },
  {
    id: 'commands',
    label: 'Commands',
    icon: 'M4 17l6-6-6-6M12 19h8',
    href: '/dashboard/commands',
    primary: true,
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: 'M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4zM6 10a6 6 0 0012 0',
    href: '/dashboard/agents',
    primary: true,
  },
  {
    id: 'workflows',
    label: 'Composer',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    href: '/dashboard/workflows',
    primary: true,
  },
]

interface MobileNavProps {
  currentPath: string
  onMenuClick: () => void
}

export function MobileNav({ currentPath, onMenuClick }: MobileNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card border-t border-border">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {primaryNavItems.map((item) => {
          const isActive = currentPath === item.href ||
            (item.href !== '/dashboard' && currentPath.startsWith(item.href))

          return (
            <a
              key={item.id}
              href={item.href}
              aria-label={item.label}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg',
                'min-w-[64px] min-h-[56px] transition-all active:scale-95',
                isActive
                  ? 'bg-violet-500/10 text-violet-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <svg
                className="w-6 h-6 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          )
        })}

        {/* Menu button */}
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className={cn(
            'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg',
            'min-w-[64px] min-h-[56px] transition-all active:scale-95',
            'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          )}
        >
          <svg
            className="w-6 h-6 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  )
}

export default MobileNav
