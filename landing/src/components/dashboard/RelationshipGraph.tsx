import { useMemo } from 'react';
import type { PluginComponent, ComponentRelationship } from '../../lib/plugins/types';

interface RelationshipGraphProps {
  components: PluginComponent[];
  relationships: ComponentRelationship[];
}

const TYPE_COLORS = {
  agent: 'bg-purple-500/10 text-purple-400 border-purple-500/50',
  skill: 'bg-green-500/10 text-green-400 border-green-500/50',
  command: 'bg-blue-500/10 text-blue-400 border-blue-500/50',
  rule: 'bg-orange-500/10 text-orange-400 border-orange-500/50',
};

const TYPE_ICONS = {
  agent: '🤖',
  skill: '⚡',
  command: '⌘',
  rule: '📋',
};

const RELATIONSHIP_LABELS = {
  uses: 'uses',
  requires: 'requires',
  extends: 'extends',
  calls: 'calls',
  depends_on: 'depends on',
};

const STRENGTH_COLORS = {
  1: 'text-gray-500',
  2: 'text-yellow-500',
  3: 'text-green-500',
};

export function RelationshipGraph({ components, relationships }: RelationshipGraphProps) {
  const componentMap = useMemo(() => {
    return new Map(components.map(c => [c.id, c]));
  }, [components]);

  const relationshipsBySource = useMemo(() => {
    return relationships.reduce((acc, rel) => {
      if (!acc[rel.source_component_id]) {
        acc[rel.source_component_id] = [];
      }
      acc[rel.source_component_id].push(rel);
      return acc;
    }, {} as Record<string, ComponentRelationship[]>);
  }, [relationships]);

  const groupedComponents = useMemo(() => {
    return components.reduce((acc, component) => {
      if (!acc[component.type]) {
        acc[component.type] = [];
      }
      acc[component.type].push(component);
      return acc;
    }, {} as Record<string, PluginComponent[]>);
  }, [components]);

  if (relationships.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="text-muted-foreground mb-2">No relationships detected</div>
        <p className="text-sm text-muted-foreground">
          This plugin's components don't have any detected relationships between them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-violet-400">{relationships.length}</div>
          <div className="text-sm text-muted-foreground">Total Relationships</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-cyan-400">
            {new Set(relationships.map(r => r.source_component_id)).size}
          </div>
          <div className="text-sm text-muted-foreground">Components with Dependencies</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">
            {relationships.filter(r => r.strength === 3).length}
          </div>
          <div className="text-sm text-muted-foreground">High Confidence Links</div>
        </div>
      </div>

      {/* Relationship Type Legend */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-sm font-medium mb-3">Relationship Types</div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(RELATIONSHIP_LABELS).map(([type, label]) => {
            const count = relationships.filter(r => r.relationship_type === type).length;
            if (count === 0) return null;
            return (
              <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-secondary/30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                <span className="text-sm capitalize">{label}</span>
                <span className="text-xs text-muted-foreground">({count})</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Component Relationships */}
      <div className="space-y-4">
        {Object.entries(groupedComponents).map(([type, comps]) => {
          const compsWithRels = comps.filter(c => relationshipsBySource[c.id]?.length > 0);
          if (compsWithRels.length === 0) return null;

          return (
            <div key={type} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{TYPE_ICONS[type as keyof typeof TYPE_ICONS]}</span>
                <h3 className="text-lg font-semibold capitalize">{type}s</h3>
              </div>

              <div className="space-y-4">
                {compsWithRels.map((component) => {
                  const rels = relationshipsBySource[component.id] || [];
                  if (rels.length === 0) return null;

                  return (
                    <div key={component.id} className="space-y-2">
                      <div className={`px-4 py-3 border rounded-lg ${TYPE_COLORS[component.type]}`}>
                        <div className="font-medium">{component.name}</div>
                        {component.description && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {component.description}
                          </div>
                        )}
                      </div>

                      <div className="pl-8 space-y-2">
                        {rels.map((rel) => {
                          const target = componentMap.get(rel.target_component_id);
                          if (!target) return null;

                          return (
                            <div
                              key={`${rel.source_component_id}-${rel.target_component_id}-${rel.relationship_type}`}
                              className="flex items-start gap-3 py-2 pl-4 border-l-2 border-violet-500/30"
                            >
                              <div className="mt-1.5 text-violet-400">→</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-violet-400">
                                    {RELATIONSHIP_LABELS[rel.relationship_type]}
                                  </span>
                                  <span className={`px-2 py-0.5 text-xs font-medium border rounded-full ${TYPE_COLORS[target.type]}`}>
                                    {target.type}
                                  </span>
                                  <span className="font-medium">{target.name}</span>
                                  <span className={`text-xs ${STRENGTH_COLORS[rel.strength]}`}>
                                    {'★'.repeat(rel.strength)}
                                  </span>
                                </div>
                                {rel.metadata && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {rel.metadata}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bi-directional Relationships */}
      {(() => {
        const relationshipPairs = new Set(
          relationships.map(r => `${r.source_component_id}->${r.target_component_id}`)
        );

        const bidirectional = relationships.filter(r1 => {
          return relationshipPairs.has(`${r1.target_component_id}->${r1.source_component_id}`);
        });

        if (bidirectional.length === 0) return null;

        return (
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔄</span>
              <h3 className="text-lg font-semibold">Bi-directional Relationships</h3>
              <span className="text-sm text-muted-foreground">({bidirectional.length / 2})</span>
            </div>
            <p className="text-sm text-muted-foreground">
              These components have mutual dependencies - they reference each other.
            </p>
          </div>
        );
      })()}
    </div>
  );
}
