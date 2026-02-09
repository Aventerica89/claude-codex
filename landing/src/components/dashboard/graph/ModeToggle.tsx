import { cn } from '@/lib/utils'

export type ComposerMode = 'build' | 'explore'

interface ModeToggleProps {
  mode: ComposerMode
  onChange: (mode: ComposerMode) => void
}

const MODES = [
  {
    key: 'build' as const,
    label: 'Build Workflow',
    activeClass: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  },
  {
    key: 'explore' as const,
    label: 'Explore Refs',
    activeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
] as const

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex rounded-lg border border-border bg-card overflow-hidden">
      {MODES.map((m) => (
        <button
          key={m.key}
          onClick={() => onChange(m.key)}
          className={cn(
            'px-3 py-1 text-xs font-medium transition-colors border-r last:border-r-0',
            mode === m.key
              ? m.activeClass
              : 'text-muted-foreground hover:text-foreground border-transparent'
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
