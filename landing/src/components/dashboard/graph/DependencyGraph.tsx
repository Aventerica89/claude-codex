import { useState, useMemo, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type NodeMouseHandler,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { allItems } from '@/lib/generated'
import type { BrainItem, BrainItemType } from '@/lib/generated/types'
import { transformBrainData } from '@/lib/graph/transformBrainData'
import { layoutGraph } from '@/lib/graph/layoutGraph'
import { nodeTypes } from './nodeTypes'
import { GraphControls } from './GraphControls'
import { NodeDetailPanel } from './NodeDetailPanel'
import type { ERNodeData } from './ERNode'

const ALL_TYPES: BrainItemType[] = ['command', 'agent', 'skill', 'rule']

const MINIMAP_COLORS: Record<string, string> = {
  command: '#a855f7',
  agent: '#10b981',
  skill: '#3b82f6',
  rule: '#f97316',
}

export function DependencyGraph() {
  const [visibleTypes, setVisibleTypes] = useState<Set<BrainItemType>>(
    () => new Set(ALL_TYPES)
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const graphInitialized = useRef(false)

  // Compute full graph once
  const fullGraph = useMemo(() => {
    const { nodes, edges } = transformBrainData(allItems)
    const layoutNodes = layoutGraph(nodes, edges)
    return { nodes: layoutNodes, edges }
  }, [])

  // Filter by visible types
  const filteredGraph = useMemo(() => {
    const visibleIds = new Set<string>()

    const nodes = fullGraph.nodes.filter((node) => {
      const data = node.data as unknown as ERNodeData
      const visible = visibleTypes.has(data.itemType)
      if (visible) visibleIds.add(node.id)
      return visible
    })

    const edges = fullGraph.edges.filter(
      (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)
    )

    return { nodes, edges }
  }, [fullGraph, visibleTypes])

  // Apply search highlighting
  const displayGraph = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    const nodes = filteredGraph.nodes.map((node) => {
      const data = node.data as unknown as ERNodeData
      const isHighlighted =
        query.length > 0 && data.label.toLowerCase().includes(query)
      const isSelected = node.id === selectedItemId

      return {
        ...node,
        data: { ...data, isHighlighted, isSelected },
      }
    })

    return { nodes, edges: filteredGraph.edges }
  }, [filteredGraph, searchQuery, selectedItemId])

  const [nodes, setNodes, onNodesChange] = useNodesState(displayGraph.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(displayGraph.edges)

  // Sync when displayGraph changes
  useMemo(() => {
    if (!graphInitialized.current) {
      graphInitialized.current = true
      return
    }
    setNodes(displayGraph.nodes)
    setEdges(displayGraph.edges)
  }, [displayGraph, setNodes, setEdges])

  // Type counts
  const counts = useMemo(() => {
    const c: Record<BrainItemType, number> = {
      command: 0,
      agent: 0,
      skill: 0,
      rule: 0,
    }
    for (const item of allItems) {
      c[item.type]++
    }
    return c
  }, [])

  const handleToggleType = useCallback((type: BrainItemType) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }, [])

  const handleNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedItemId((prev) => (prev === node.id ? null : node.id))
  }, [])

  const selectedItem: BrainItem | null = useMemo(() => {
    if (!selectedItemId) return null
    return allItems.find((item) => item.id === selectedItemId) ?? null
  }, [selectedItemId])

  const minimapNodeColor = useCallback((node: { data: Record<string, unknown> }) => {
    const data = node.data as unknown as ERNodeData
    return MINIMAP_COLORS[data.itemType] || '#6b7280'
  }, [])

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Dependency Graph</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Interactive visualization of {allItems.length} components
          and their connections
        </p>
      </div>

      {/* Controls */}
      <div className="mb-3">
        <GraphControls
          visibleTypes={visibleTypes}
          onToggleType={handleToggleType}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          counts={counts}
        />
      </div>

      {/* Graph + Detail Panel */}
      <div className="flex-1 flex rounded-xl border border-border overflow-hidden bg-card">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={16}
              size={1}
              color="#27272a"
            />
            <Controls
              className="!bg-card !border-border !shadow-lg"
              showInteractive={false}
            />
            <MiniMap
              className="!bg-card !border-border"
              nodeColor={minimapNodeColor}
              maskColor="rgba(0,0,0,0.6)"
            />
          </ReactFlow>
        </div>

        <NodeDetailPanel
          item={selectedItem}
          allItems={allItems}
          edges={edges}
          onClose={() => setSelectedItemId(null)}
        />
      </div>
    </div>
  )
}

export default DependencyGraph
