"use client"

import { cn } from '@/lib/utils'

interface ChangelogEntry {
  type: 'added' | 'changed' | 'fixed' | 'removed' | 'security'
  description: string
}

interface ChangelogVersion {
  version: string
  date: string
  entries: ChangelogEntry[]
}

const TYPE_CONFIG = {
  added: {
    label: '+ Added',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  changed: {
    label: 'Changed',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  fixed: {
    label: 'Fixed',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
  removed: {
    label: 'Removed',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
  security: {
    label: 'Security',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    border: 'border-violet-500/30',
  },
}

/** Map markdown section headers to entry types */
const SECTION_TYPE_MAP: Record<string, ChangelogEntry['type']> = {
  'new features': 'added',
  'features': 'added',
  'added': 'added',
  'improvements': 'changed',
  'changed': 'changed',
  'bug fixes': 'fixed',
  'fixes': 'fixed',
  'fixed': 'fixed',
  'removed': 'removed',
  'breaking changes': 'removed',
  'security': 'security',
  'documentation': 'changed',
}

function parseChangelog(markdown: string): ChangelogVersion[] {
  const versions: ChangelogVersion[] = []
  const lines = markdown.split('\n')

  let currentVersion: ChangelogVersion | null = null
  let currentType: ChangelogEntry['type'] = 'added'

  for (const line of lines) {
    const trimmed = line.trim()

    // Version header: ## v1.0.0 - 2026-02-09 or ## Unreleased - 2026-02-09
    const versionMatch = trimmed.match(
      /^##\s+(.+?)\s*[-–]\s*(\d{4}-\d{2}-\d{2})/
    )
    if (versionMatch) {
      currentVersion = {
        version: versionMatch[1].trim(),
        date: formatDate(versionMatch[2]),
        entries: [],
      }
      versions.push(currentVersion)
      continue
    }

    // Section header: ### New Features
    const sectionMatch = trimmed.match(/^###\s+(.+)/)
    if (sectionMatch) {
      const sectionName = sectionMatch[1].trim().toLowerCase()
      currentType = SECTION_TYPE_MAP[sectionName] || 'changed'
      continue
    }

    // Entry: - Description text
    const entryMatch = trimmed.match(/^[-*]\s+(.+)/)
    if (entryMatch && currentVersion) {
      currentVersion.entries.push({
        type: currentType,
        description: entryMatch[1],
      })
    }
  }

  return versions
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface ChangelogPageProps {
  markdown: string
}

export function ChangelogPage({ markdown }: ChangelogPageProps) {
  const versions = parseChangelog(markdown)

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Changelog</h1>
          {versions[0] && (
            <span
              className={cn(
                'px-3 py-1 text-xs font-semibold rounded-full',
                'bg-violet-500/10 text-violet-400 border border-violet-500/30'
              )}
            >
              {versions[0].version}
            </span>
          )}
        </div>
        <p className="text-muted-foreground">
          Recent updates and improvements
        </p>
      </div>

      {/* Versions */}
      <div className="space-y-10">
        {versions.map((version, i) => (
          <section key={i}>
            {/* Version header */}
            <div className="flex items-center gap-3 mb-5">
              <span
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-full',
                  'bg-foreground/5 text-foreground border border-border'
                )}
              >
                {version.version}
              </span>
              <span className="text-sm text-muted-foreground">
                {version.date}
              </span>
            </div>

            {/* Entries */}
            <div className="space-y-3 pl-1">
              {version.entries.map((entry, j) => {
                const config = TYPE_CONFIG[entry.type]
                return (
                  <div key={j} className="flex items-start gap-3">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full',
                        'text-xs font-medium border shrink-0 mt-0.5',
                        config.bg,
                        config.text,
                        config.border
                      )}
                    >
                      {config.label}
                    </span>
                    <span className="text-sm text-foreground/90">
                      {entry.description}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Separator between versions */}
            {i < versions.length - 1 && (
              <div className="border-t border-border mt-8" />
            )}
          </section>
        ))}
      </div>

      {/* Empty state */}
      {versions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="text-muted-foreground">No changelog entries yet.</div>
          <p className="text-sm text-muted-foreground">
            Run <code className="text-violet-400">/changelog</code> in Claude
            Code to generate one.
          </p>
        </div>
      )}
    </div>
  )
}
