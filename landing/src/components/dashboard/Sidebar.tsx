"use client"

import { cn } from '@/lib/utils'
import { stats } from '@/lib/generated/stats'

interface NavItem {
  id: string
  label: string
  icon: string
  href: string
  count?: number
}

const navItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    href: '/dashboard',
  },
  {
    id: 'commands',
    label: 'Commands',
    icon: 'M4 17l6-6-6-6M12 19h8',
    href: '/dashboard/commands',
    count: stats.commands,
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: 'M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4zM6 10a6 6 0 0012 0',
    href: '/dashboard/agents',
    count: stats.agents,
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    href: '/dashboard/skills',
    count: stats.skills,
  },
  {
    id: 'rules',
    label: 'Rules',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    href: '/dashboard/rules',
    count: stats.rules,
  },
  {
    id: 'plugins',
    label: 'Plugins',
    icon: 'M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z',
    href: '/dashboard/plugins',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    href: '/dashboard/marketplace',
    count: 44,
  },
  {
    id: 'deploy',
    label: 'Deploy Center',
    icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    href: '/dashboard/deploy',
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    href: '/dashboard/workflows',
  },
]

const bottomItems: NavItem[] = [
  {
    id: 'services',
    label: 'Services',
    icon: 'M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01',
    href: '/dashboard/services',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    href: '/dashboard/settings',
  },
]

interface SidebarProps {
  currentPath: string
}

export function Sidebar({ currentPath }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
              <path d="M6 10a6 6 0 0 0 12 0" />
            </svg>
          </div>
          <span className="font-semibold">Claude Codex</span>
        </a>
      </div>

      {/* Main nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.href ||
            (item.href !== '/dashboard' && currentPath.startsWith(item.href))

          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  isActive ? 'bg-violet-500/20' : 'bg-secondary'
                )}>
                  {item.count}
                </span>
              )}
            </a>
          )
        })}
      </nav>

      {/* Bottom nav */}
      <div className="p-4 border-t border-border space-y-1">
        {bottomItems.map((item) => {
          const isActive = currentPath === item.href

          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-violet-500/10 text-violet-400'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </a>
          )
        })}
      </div>

      {/* Back to home */}
      <div className="p-4 border-t border-border">
        <a
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Back to Home</span>
        </a>
      </div>
    </aside>
  )
}

export default Sidebar
