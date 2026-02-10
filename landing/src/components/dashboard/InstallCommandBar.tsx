"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface InstallCommandBarProps {
  selectedPlugins: Array<{ id: string; name: string }>
  mode: 'install' | 'remove'
  onClear: () => void
}

export function InstallCommandBar({
  selectedPlugins,
  mode,
  onClear,
}: InstallCommandBarProps) {
  const [copied, setCopied] = useState(false)

  if (selectedPlugins.length === 0) return null

  const pluginNames = selectedPlugins.map((p) => p.name).join(' ')
  const command =
    mode === 'install'
      ? `/codex-sync install ${pluginNames}`
      : `/codex-sync remove ${pluginNames}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = command
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const borderColor =
    mode === 'install'
      ? 'border-amber-500/30'
      : 'border-red-500/30'

  const bgColor =
    mode === 'install'
      ? 'bg-amber-500/5'
      : 'bg-red-500/5'

  const accentColor =
    mode === 'install'
      ? 'text-amber-400'
      : 'text-red-400'

  return (
    <div
      className={cn(
        'sticky top-0 z-20 rounded-lg border p-4',
        'backdrop-blur-sm',
        borderColor,
        bgColor
      )}
    >
      {/* Top row: count + actions */}
      <div className="flex items-center justify-between mb-3">
        <span className={cn('text-sm font-medium', accentColor)}>
          {selectedPlugins.length} plugin
          {selectedPlugins.length !== 1 ? 's' : ''} selected
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onClear}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleCopy}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              mode === 'install'
                ? 'bg-amber-500 text-black hover:bg-amber-400'
                : 'bg-red-500 text-white hover:bg-red-400'
            )}
          >
            {copied ? 'Copied!' : 'Copy Command'}
          </button>
        </div>
      </div>

      {/* Command preview */}
      <div
        className={cn(
          'rounded-md px-4 py-2.5 font-mono text-sm',
          'bg-black/40 border border-white/5',
          'overflow-x-auto whitespace-nowrap'
        )}
      >
        <span className="text-muted-foreground select-none">$ </span>
        <span className="text-foreground">{command}</span>
      </div>

      {/* Info message */}
      <p className="text-xs text-muted-foreground mt-2">
        * Plugins install locally on your machine.
        Copy this command and run it in Claude Code.
      </p>
    </div>
  )
}
