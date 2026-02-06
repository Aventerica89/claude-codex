import { useState, useEffect } from 'react';
import type { Plugin, PluginComponent, ComponentRelationship } from '../../lib/plugins/types';
import { PluginComponentList } from './PluginComponentList';
import { RelationshipGraph } from './RelationshipGraph';
import { InstallModal } from './InstallModal';
import { useToast } from '../ui/Toast';

interface PluginDetailPageProps {
  pluginId: string;
}

interface PluginDetail extends Plugin {
  components: PluginComponent[];
  relationships: ComponentRelationship[];
  installations: any[];
  is_favorited: boolean;
}

type Tab = 'overview' | 'components' | 'relationships' | 'readme' | 'installations';

const SOURCE_BADGES = {
  official: { label: 'Official', color: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  community: { label: 'Community', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  local: { label: 'Local', color: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
};

export function PluginDetailPage({ pluginId }: PluginDetailPageProps) {
  const [plugin, setPlugin] = useState<PluginDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());
  const [showInstallModal, setShowInstallModal] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPluginDetails();
  }, [pluginId]);

  async function fetchPluginDetails() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/plugins/${pluginId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch plugin: ${response.statusText}`);
      }

      const data = await response.json();
      setPlugin(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load plugin';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectAll() {
    if (!plugin) return;
    const allIds = plugin.components.map(c => c.id);
    setSelectedComponents(new Set(allIds));
  }

  function handleSelectNone() {
    setSelectedComponents(new Set());
  }

  function handleToggleComponent(componentId: string) {
    setSelectedComponents(prev => {
      const next = new Set(prev);
      if (next.has(componentId)) {
        next.delete(componentId);
      } else {
        next.add(componentId);
      }
      return next;
    });
  }

  function handleInstall() {
    if (selectedComponents.size === 0) {
      showToast('Please select at least one component to install', 'warning');
      return;
    }
    setShowInstallModal(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading plugin details...</div>
      </div>
    );
  }

  if (error || !plugin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-400">{error || 'Plugin not found'}</div>
        <a
          href="/dashboard/plugins"
          className="px-4 py-2 bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/20 transition-colors"
        >
          Back to Plugins
        </a>
      </div>
    );
  }

  const sourceBadge = SOURCE_BADGES[plugin.source_type];
  const totalComponents = plugin.components.length;
  const componentsByType = {
    agent: plugin.components.filter(c => c.type === 'agent').length,
    skill: plugin.components.filter(c => c.type === 'skill').length,
    command: plugin.components.filter(c => c.type === 'command').length,
    rule: plugin.components.filter(c => c.type === 'rule').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <a
              href="/dashboard/plugins"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back
            </a>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-bold">{plugin.name}</h1>
            <span className={`px-3 py-1 text-xs font-medium border rounded-full ${sourceBadge.color}`}>
              {sourceBadge.label}
            </span>
          </div>
          <p className="text-muted-foreground text-lg mb-4">{plugin.description}</p>

          {/* Metadata */}
          <div className="flex flex-wrap gap-6 text-sm">
            {plugin.author && (
              <div>
                <span className="text-muted-foreground">Author:</span>
                <span className="ml-2 text-foreground">{plugin.author}</span>
              </div>
            )}
            {plugin.version && (
              <div>
                <span className="text-muted-foreground">Version:</span>
                <span className="ml-2 text-foreground">{plugin.version}</span>
              </div>
            )}
            {plugin.license && (
              <div>
                <span className="text-muted-foreground">License:</span>
                <span className="ml-2 text-foreground">{plugin.license}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Components:</span>
              <span className="ml-2 text-foreground">{totalComponents}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Installs:</span>
              <span className="ml-2 text-foreground">{plugin.install_count}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleInstall}
            disabled={selectedComponents.size === 0}
            className="px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Install {selectedComponents.size > 0 && `(${selectedComponents.size})`}
          </button>
        </div>
      </div>

      {/* Component Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">{componentsByType.agent}</div>
          <div className="text-sm text-muted-foreground">Agents</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{componentsByType.skill}</div>
          <div className="text-sm text-muted-foreground">Skills</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{componentsByType.command}</div>
          <div className="text-sm text-muted-foreground">Commands</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-400">{componentsByType.rule}</div>
          <div className="text-sm text-muted-foreground">Rules</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'components', label: `Components (${totalComponents})` },
            { id: 'relationships', label: `Relationships (${plugin.relationships.length})` },
            { id: 'readme', label: 'README' },
            { id: 'installations', label: `Installations (${plugin.installations.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">About This Plugin</h3>
              <p className="text-muted-foreground">{plugin.description}</p>

              {plugin.keywords && plugin.keywords.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Keywords</div>
                  <div className="flex flex-wrap gap-2">
                    {plugin.keywords.map((keyword: string) => (
                      <span
                        key={keyword}
                        className="px-3 py-1 bg-secondary/50 text-foreground text-xs rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <PluginComponentList
            components={plugin.components}
            selectedComponents={selectedComponents}
            onToggleComponent={handleToggleComponent}
            onSelectAll={handleSelectAll}
            onSelectNone={handleSelectNone}
          />
        )}

        {activeTab === 'relationships' && (
          <RelationshipGraph
            components={plugin.components}
            relationships={plugin.relationships}
          />
        )}

        {activeTab === 'readme' && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="prose prose-invert max-w-none">
              {plugin.readme ? (
                <div dangerouslySetInnerHTML={{ __html: plugin.readme }} />
              ) : (
                <p className="text-muted-foreground">No README available</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'installations' && (
          <div className="bg-card border border-border rounded-xl p-6">
            {plugin.installations.length === 0 ? (
              <p className="text-muted-foreground">No installations yet</p>
            ) : (
              <div className="space-y-4">
                {plugin.installations.map((install: any) => (
                  <div key={install.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <div className="font-medium">{install.repository_name}</div>
                      <div className="text-sm text-muted-foreground">
                        Installed {new Date(install.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {install.component_count} components
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Install Modal */}
      {showInstallModal && (
        <InstallModal
          plugin={plugin}
          selectedComponents={Array.from(selectedComponents)}
          onClose={() => setShowInstallModal(false)}
          onSuccess={() => {
            fetchPluginDetails();
            setShowInstallModal(false);
            showToast('Plugin installed successfully!', 'success');
          }}
        />
      )}
    </div>
  );
}
