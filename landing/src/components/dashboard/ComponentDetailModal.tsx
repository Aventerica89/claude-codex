"use client"

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { renderMarkdown } from '@/lib/markdown'

interface ComponentInfo {
  type: string
  name: string
  slug: string
}

interface ComponentDetailModalProps {
  component: ComponentInfo
  pluginName: string
  repositoryUrl: string
  onClose: () => void
}

const typeColors: Record<string, string> = {
  agent: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  skill: 'text-green-400 bg-green-500/10 border-green-500/30',
  command: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  rule: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
}

const TYPE_DESCRIPTIONS: Record<string, string> = {
  agent: 'Agents are autonomous sub-processes that handle complex tasks.',
  skill: 'Skills provide specialized capabilities and domain knowledge.',
  command: 'Commands are slash-invocable actions (e.g., /commit).',
  rule: 'Rules enforce coding standards and project conventions.',
}

/**
 * Derive the raw GitHub URL base from a repository_url like:
 * https://github.com/anthropics/claude-plugins-official/tree/main/plugins/agent-sdk-dev
 * -> https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/plugins/agent-sdk-dev
 */
function toRawBase(repositoryUrl: string): string {
  return repositoryUrl
    .replace('github.com', 'raw.githubusercontent.com')
    .replace('/tree/', '/')
}

/**
 * Try multiple possible paths for a component's markdown file.
 * Skills can be at skills/{name}.md or skills/{name}/SKILL.md
 */
function getCandidatePaths(component: ComponentInfo): string[] {
  const typeDir = component.type + 's' // agent -> agents
  const paths = [`/${typeDir}/${component.name}.md`]

  if (component.type === 'skill') {
    paths.push(`/${typeDir}/${component.name}/SKILL.md`)
    paths.push(`/${typeDir}/${component.name}/prompt.md`)
  }

  return paths
}

async function fetchComponentContent(
  repositoryUrl: string,
  component: ComponentInfo
): Promise<string | null> {
  const rawBase = toRawBase(repositoryUrl)
  const candidates = getCandidatePaths(component)

  for (const path of candidates) {
    try {
      const response = await fetch(rawBase + path)
      if (response.ok) {
        return await response.text()
      }
    } catch {
      // Try next candidate
    }
  }

  return null
}

export function ComponentDetailModal({
  component,
  pluginName,
  repositoryUrl,
  onClose,
}: ComponentDetailModalProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(false)

      const md = await fetchComponentContent(repositoryUrl, component)

      if (cancelled) return

      if (md) {
        setContent(md)
      } else {
        setError(true)
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [repositoryUrl, component.type, component.name])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // renderMarkdown uses DOMPurify to sanitize all HTML
  const renderedHtml = content ? renderMarkdown(content) : ''
  const typeDesc = TYPE_DESCRIPTIONS[component.type] || ''

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
          'relative z-10 w-full max-w-3xl max-h-[85vh] flex flex-col',
          'bg-card border border-border rounded-xl shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded border capitalize shrink-0',
                  typeColors[component.type] || 'text-gray-400 bg-gray-500/10 border-gray-500/30'
                )}
              >
                {component.type}
              </span>
              <h2 className="text-xl font-bold truncate">{component.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {typeDesc} Part of <span className="text-foreground font-medium">{pluginName}</span>.
            </p>
          </div>
          <button
            onClick={onClose}
            className={cn(
              'p-2 rounded-lg transition-colors shrink-0 ml-4',
              'text-muted-foreground hover:text-foreground hover:bg-foreground/10'
            )}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              <div className="text-sm text-muted-foreground">
                Loading component source...
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="text-muted-foreground">
                Could not load source markdown.
              </div>
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'text-sm px-4 py-2 rounded-lg transition-colors',
                  'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20',
                  'border border-violet-500/20'
                )}
              >
                View on GitHub instead
              </a>
            </div>
          ) : (
            <div
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border shrink-0">
          <a
            href={repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-violet-400 transition-colors"
          >
            View source on GitHub
          </a>
          <button
            onClick={onClose}
            className={cn(
              'px-4 py-2 text-sm rounded-lg transition-colors',
              'bg-foreground/5 text-foreground hover:bg-foreground/10'
            )}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
