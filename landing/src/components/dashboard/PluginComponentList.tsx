import type { PluginComponent } from '../../lib/plugins/types';

interface PluginComponentListProps {
  components: PluginComponent[];
  selectedComponents: Set<string>;
  onToggleComponent: (componentId: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
}

const TYPE_COLORS = {
  agent: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  skill: 'bg-green-500/10 text-green-400 border-green-500/30',
  command: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  rule: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
};

const TYPE_ICONS = {
  agent: '🤖',
  skill: '⚡',
  command: '⌘',
  rule: '📋',
};

export function PluginComponentList({
  components,
  selectedComponents,
  onToggleComponent,
  onSelectAll,
  onSelectNone,
}: PluginComponentListProps) {
  const groupedComponents = components.reduce((acc, component) => {
    if (!acc[component.type]) {
      acc[component.type] = [];
    }
    acc[component.type].push(component);
    return acc;
  }, {} as Record<string, PluginComponent[]>);

  const allSelected = components.length > 0 && selectedComponents.size === components.length;
  const someSelected = selectedComponents.size > 0 && !allSelected;

  return (
    <div className="space-y-6">
      {/* Selection Controls */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected;
            }}
            onChange={() => (allSelected ? onSelectNone() : onSelectAll())}
            className="w-4 h-4 rounded border-border bg-secondary/30"
          />
          <span className="text-sm font-medium">
            {selectedComponents.size === 0
              ? 'Select components to install'
              : `${selectedComponents.size} of ${components.length} selected`}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="px-3 py-1.5 text-sm bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded-lg hover:bg-violet-500/20 transition-colors"
          >
            Select All
          </button>
          <button
            onClick={onSelectNone}
            disabled={selectedComponents.size === 0}
            className="px-3 py-1.5 text-sm bg-secondary/50 text-muted-foreground border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Component Groups */}
      {Object.entries(groupedComponents).map(([type, comps]) => (
        <div key={type} className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{TYPE_ICONS[type as keyof typeof TYPE_ICONS]}</span>
            <h3 className="text-lg font-semibold capitalize">{type}s</h3>
            <span className="text-sm text-muted-foreground">({comps.length})</span>
          </div>

          <div className="space-y-2">
            {comps.map((component) => {
              const isSelected = selectedComponents.has(component.id);
              const hasTools = component.tools && component.tools.length > 0;
              const hasModel = component.model;

              return (
                <div
                  key={component.id}
                  onClick={() => onToggleComponent(component.id)}
                  className={`
                    flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors
                    ${isSelected
                      ? 'bg-violet-500/10 border-violet-500/50'
                      : 'bg-card border-border hover:border-violet-500/30'
                    }
                  `}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleComponent(component.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-4 h-4 rounded border-border bg-secondary/30"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{component.name}</h4>
                      <span className={`px-2 py-0.5 text-xs font-medium border rounded-full ${TYPE_COLORS[component.type]}`}>
                        {component.type}
                      </span>
                    </div>

                    {component.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {component.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-xs">
                      {component.file_path && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">File:</span> {component.file_path}
                        </div>
                      )}
                      {hasModel && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">Model:</span> {component.model}
                        </div>
                      )}
                      {hasTools && (
                        <div className="text-muted-foreground">
                          <span className="font-medium">Tools:</span> {component.tools.join(', ')}
                        </div>
                      )}
                    </div>

                    {component.tags && component.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {component.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-secondary/50 text-foreground text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {components.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No components available
        </div>
      )}
    </div>
  );
}
