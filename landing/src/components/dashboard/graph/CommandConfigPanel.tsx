import { cn } from '@/lib/utils'
import { COMMON_TOOLS, type CommandConfig } from '@/lib/graph/generateCommand'

interface CommandConfigPanelProps {
  config: CommandConfig
  onChange: (config: CommandConfig) => void
  className?: string
}

const MODEL_OPTIONS = [
  { value: 'inherit', label: 'Inherit (default)' },
  { value: 'sonnet', label: 'Sonnet' },
  { value: 'opus', label: 'Opus' },
  { value: 'haiku', label: 'Haiku' },
] as const

export function CommandConfigPanel({
  config,
  onChange,
  className,
}: CommandConfigPanelProps) {
  const updateField = <K extends keyof CommandConfig>(
    key: K,
    value: CommandConfig[K]
  ) => {
    onChange({ ...config, [key]: value })
  }

  const toggleTool = (tool: string) => {
    const tools = config.allowedTools.includes(tool)
      ? config.allowedTools.filter((t) => t !== tool)
      : [...config.allowedTools, tool]
    updateField('allowedTools', tools)
  }

  return (
    <div className={cn(
      'h-full flex flex-col bg-card border-l border-border',
      className
    )}>
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Command Config
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Command Name */}
        <Field label="Command Name">
          <input
            type="text"
            value={config.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="my-workflow"
            className={INPUT_CLASS}
          />
          {config.name && (
            <p className="text-[10px] text-muted-foreground mt-1">
              Usage: /{config.name}
            </p>
          )}
        </Field>

        {/* Description */}
        <Field label="Description">
          <textarea
            value={config.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="What this command does..."
            rows={2}
            className={cn(INPUT_CLASS, 'resize-none')}
          />
        </Field>

        {/* Model */}
        <Field label="Model">
          <select
            value={config.model}
            onChange={(e) => updateField(
              'model',
              e.target.value as CommandConfig['model']
            )}
            className={INPUT_CLASS}
          >
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Argument Hint */}
        <Field label="Argument Hint">
          <input
            type="text"
            value={config.argumentHint}
            onChange={(e) => updateField('argumentHint', e.target.value)}
            placeholder="[file-or-branch]"
            className={INPUT_CLASS}
          />
        </Field>

        {/* Allowed Tools */}
        <Field label="Allowed Tools">
          <div className="flex flex-wrap gap-1">
            {COMMON_TOOLS.map((tool) => {
              const active = config.allowedTools.includes(tool)
              return (
                <button
                  key={tool}
                  onClick={() => toggleTool(tool)}
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-md border',
                    'transition-colors',
                    active
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'bg-secondary/30 border-border text-muted-foreground'
                  )}
                >
                  {tool}
                </button>
              )
            })}
          </div>
        </Field>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

const INPUT_CLASS = [
  'w-full px-2 py-1.5 text-xs rounded-md',
  'bg-secondary/50 border border-border',
  'text-foreground placeholder:text-muted-foreground',
  'focus:outline-none focus:ring-1 focus:ring-violet-500/50',
].join(' ')
