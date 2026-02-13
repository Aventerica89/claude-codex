import { useState, useEffect, useMemo } from 'react';
import type { Plugin } from '../../lib/plugins/types';
import { useToast } from '../ui/Toast';

interface InstallModalProps {
  plugin: Plugin;
  selectedComponents: string[];
  onClose: () => void;
  onSuccess: () => void;
}

interface Repository {
  id: string;
  name: string;
  path: string;
}

export function InstallModal({
  plugin,
  selectedComponents,
  onClose,
  onSuccess,
}: InstallModalProps) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [installing, setInstalling] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const abortController = new AbortController();
    fetchRepositories(abortController.signal);
    return () => {
      abortController.abort();
    };
  }, []);

  async function fetchRepositories(signal?: AbortSignal) {
    try {
      setLoadingRepos(true);
      const response = await fetch('/api/repositories', { signal });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepositories(data.data || []);

      if (data.data && data.data.length > 0) {
        setSelectedRepo(data.data[0].id);
      }
    } catch (err) {
      showToast('Failed to load repositories', 'error');
      setRepositories([
        { id: 'local', name: 'Local Repository', path: '~/.claude' }
      ]);
      setSelectedRepo('local');
    } finally {
      setLoadingRepos(false);
    }
  }

  async function handleInstall() {
    if (!selectedRepo) {
      showToast('Please select a repository', 'warning');
      return;
    }

    try {
      setInstalling(true);
      const repository = repositories.find(r => r.id === selectedRepo);

      const response = await fetch('/api/plugins/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plugin_id: plugin.id,
          component_ids: selectedComponents,
          repository_path: repository?.path || '~/.claude',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Installation failed');
      }

      const result = await response.json();
      showToast(`Installed ${result.data.installed_count} components!`, 'success');
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Installation failed';
      showToast(message, 'error');
    } finally {
      setInstalling(false);
    }
  }

  const componentsByType = useMemo(() => {
    return selectedComponents.reduce((acc, id) => {
      const type = id.split(':')[2] || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [selectedComponents]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-desc">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        tabIndex={-1}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <h2 id="modal-title" className="text-xl font-bold">Install Plugin</h2>
          <p id="modal-desc" className="text-sm text-muted-foreground mt-1">{plugin.name}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Component Summary */}
          <div className="bg-secondary/30 border border-border rounded-lg p-4">
            <div className="text-sm font-medium mb-2">
              Installing {selectedComponents.length} component{selectedComponents.length !== 1 ? 's' : ''}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(componentsByType).map(([type, count]) => (
                <span
                  key={type}
                  className="px-2 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded text-xs"
                >
                  {count} {type}{count !== 1 ? 's' : ''}
                </span>
              ))}
            </div>
          </div>

          {/* Repository Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Target Repository
            </label>
            {loadingRepos ? (
              <div className="text-sm text-muted-foreground">Loading repositories...</div>
            ) : repositories.length === 0 ? (
              <div className="text-sm text-muted-foreground">No repositories found</div>
            ) : (
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name} ({repo.path})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="text-sm text-yellow-400">
              <strong>Note:</strong> Components will be copied to the target repository.
              Existing files with the same name may be overwritten.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={installing}
            className="px-4 py-2 bg-secondary text-foreground border border-border rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleInstall}
            disabled={installing || !selectedRepo || repositories.length === 0}
            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {installing ? 'Installing...' : 'Install'}
          </button>
        </div>
      </div>
    </div>
  );
}
