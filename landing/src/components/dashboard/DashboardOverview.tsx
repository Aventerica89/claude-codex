"use client"

import { useState, useEffect } from 'react'
import { ConnectionStrip } from './ConnectionStrip'
import { StatCard } from './StatCard'
import { stats } from '@/lib/generated/stats'

const TERMINAL_ICON = (
  <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 17l6-6-6-6M12 19h8" />
  </svg>
)

const AGENT_ICON = (
  <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M12 2a4 4 0 014 4v2a4 4 0 01-8 0V6a4 4 0 014-4zM6 10a6 6 0 0012 0" />
  </svg>
)

const SKILL_ICON = (
  <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

const RULE_ICON = (
  <svg className="w-5 h-5 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const APPS_ICON = (
  <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

const CHEVRON_RIGHT = (
  <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

interface QuickActionProps {
  href: string
  icon: React.ReactNode
  label: string
  bgColor: string
}

function QuickAction({ href, icon, label, bgColor }: QuickActionProps) {
  return (
    <a
      href={href}
      className="flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm">{label}</span>
      </div>
      {CHEVRON_RIGHT}
    </a>
  )
}

export function DashboardOverview() {
  const [appsCount, setAppsCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/apps')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setAppsCount(json.data.length)
        }
      })
      .catch(() => {
        // Silently fail — apps count is supplementary
      })
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          {stats.total} items across your Claude Codex configuration
        </p>
      </div>

      <ConnectionStrip />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Commands"
          value={stats.commands}
          color="blue"
          icon={TERMINAL_ICON}
          onClick={() => { window.location.href = '/dashboard/commands' }}
        />
        <StatCard
          title="Agents"
          value={stats.agents}
          color="purple"
          icon={AGENT_ICON}
          onClick={() => { window.location.href = '/dashboard/agents' }}
        />
        <StatCard
          title="Skills"
          value={stats.skills}
          subtitle={`${stats.coreSkills} core + ${stats.learnedSkills} learned`}
          color="green"
          icon={SKILL_ICON}
          onClick={() => { window.location.href = '/dashboard/skills' }}
        />
        <StatCard
          title="Rules"
          value={stats.rules}
          color="orange"
          icon={RULE_ICON}
          onClick={() => { window.location.href = '/dashboard/rules' }}
        />
        <StatCard
          title="Connected Apps"
          value={appsCount ?? '...'}
          subtitle="from apps.jbcloud.app"
          color="cyan"
          icon={APPS_ICON}
          onClick={() => { window.location.href = '/dashboard/apps' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <QuickAction
              href="/dashboard/commands"
              icon={TERMINAL_ICON}
              label="Browse Commands"
              bgColor="bg-blue-500/10"
            />
            <QuickAction
              href="/dashboard/agents"
              icon={AGENT_ICON}
              label="Browse Agents"
              bgColor="bg-purple-500/10"
            />
            <QuickAction
              href="/dashboard/apps"
              icon={
                <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                </svg>
              }
              label="Browse Apps"
              bgColor="bg-cyan-500/10"
            />
            <QuickAction
              href="/dashboard/deploy"
              icon={
                <svg className="w-4 h-4 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              }
              label="Deploy Center"
              bgColor="bg-violet-500/10"
            />
            <QuickAction
              href="/dashboard/workflows"
              icon={
                <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              label="Visual Workflows"
              bgColor="bg-amber-500/10"
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Codex Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Items</span>
              <span className="font-mono font-bold">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Commands</span>
              <span className="font-mono text-blue-400">{stats.commands}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Agents</span>
              <span className="font-mono text-purple-400">{stats.agents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Core Skills</span>
              <span className="font-mono text-green-400">{stats.coreSkills}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Learned Skills</span>
              <span className="font-mono text-green-300">{stats.learnedSkills}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rules</span>
              <span className="font-mono text-orange-400">{stats.rules}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
