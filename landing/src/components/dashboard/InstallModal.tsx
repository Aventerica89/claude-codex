import { useState } from 'react'
import type { Plugin, PluginComponent } from '../../lib/plugins/types'

const REPOS = [
  'Aventerica89/HDFlowsheet-Cloud',
  'Aventerica89/renvio-companion-app',
  'Aventerica89/claude-codex',
  'Aventerica89/claude-command',
  'Aventerica89/URLsToGo',
  'Aventerica89/jb-cloud-docs',
  'Aventerica89/jb-cloud-app-tracker',
  'Aventerica89/personal-apps',
  'Aventerica89/wp-jupiter',
  'Aventerica89/wp-neptune',
  'JBMD-Creations/HDFlowsheet',
]

interface InstallModalProps {
  plugin: Plugin & { components: PluginComponent[] }
  selectedComponents: string[]
  onClose: () => void
  onSuccess: () => void
}

export function InstallModal({
  plugin,
  selectedComponents,
  onClose,
  onSuccess,
}: InstallModalProps) {
  const [selectedRepo, setSelectedRepo] = useState('')
  const [isInstalling, setIsInstalling] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const selectedNames = plugin.components
    .filter(c => selectedComponents.includes(c.id))
    .map(c => c.name)

  const handleInstall = async () => {
    if (!selectedRepo) return
    setIsInstalling(true)
    setResult(null)

    try {
      const res = await fetch(`/api/plugins/${plugin.id}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRepository: selectedRepo,
          components: selectedComponents,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setResult({
          success: true,
          message: `Installed ${selectedComponents.length} components to ${selectedRepo}`,
        })
        setTimeout(onSuccess, 1500)
      } else {
        setResult({
          success: false,
          message: data.error || 'Installation failed',
        })
      }
    } catch {
      setResult({ success: false, message: 'Network error' })
    } finally {
      setIsInstalling(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Install Components</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-3">
          Install <span className="text-foreground font-medium">{selectedComponents.length}</span> component{selectedComponents.length !== 1 ? 's' : ''} from{' '}
          <span className="text-foreground font-mono">{plugin.name}</span>
        </p>

        {/* Selected components list */}
        <div className="mb-4 max-h-32 overflow-y-auto bg-secondary/30 rounded-lg p-3">
          <div className="flex flex-wrap gap-1.5">
            {selectedNames.map(name => (
              <span
                key={name}
                className="px-2 py-0.5 text-xs bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <label className="block text-sm font-medium mb-2">Target Repository</label>
        <select
          value={selectedRepo}
          onChange={(e) => setSelectedRepo(e.target.value)}
          className="w-full px-4 py-2 mb-4 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">Select a repository</option>
          {REPOS.map((repo) => (
            <option key={repo} value={repo}>{repo}</option>
          ))}
        </select>

        {result && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm ${
              result.success
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {result.message}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInstall}
            disabled={!selectedRepo || isInstalling}
            className="flex-1 px-4 py-2 text-sm bg-violet-600 hover:bg-violet-700 disabled:bg-violet-600/50 text-white rounded-lg transition-colors"
          >
            {isInstalling ? 'Installing...' : 'Install'}
          </button>
        </div>
      </div>
    </div>
  )
}
