import { useState, useCallback, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import type { BrainItem, BrainItemType } from '@/lib/generated/types'
import {
  generateCommand,
  DEFAULT_CONFIG,
  type CommandConfig,
} from '@/lib/graph/generateCommand'
import type { WorkflowDetail } from '@/lib/graph/workflowApi'
import { nodeTypes } from './nodeTypes'
import { ComponentPalette } from './ComponentPalette'
import { CommandConfigPanel } from './CommandConfigPanel'
import { CommandPreview } from './CommandPreview'
import { WorkflowToolbar } from './WorkflowToolbar'
import { QuickAddMenu } from './QuickAddMenu'
import { ResizeHandle } from './ResizeHandle'

interface DroppedItem {
  id: string
  name: string
  type: BrainItemType
  description: string
  category: string
}

function buildNodeData(item: DroppedItem) {
  return {
    label: item.name,
    itemType: item.type,
    brainItemId: item.id,
    description: item.description,
    category: item.category,
    meta1Label: 'Type',
    meta1Value: item.type,
    meta2Label: 'Category',
    meta2Value: item.category || 'general',
    isHighlighted: false,
    isSelected: false,
  }
}

let nodeIdCounter = 0
function nextNodeId(): string {
  nodeIdCounter++
  return `wf-node-${nodeIdCounter}-${Date.now()}`
}

interface QuickAddState {
  screenPos: { x: number; y: number }
  flowPos: { x: number; y: number }
}

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [config, setConfig] = useState<CommandConfig>({ ...DEFAULT_CONFIG })
  const [workflowId, setWorkflowId] = useState<string | null>(null)
  const [quickAdd, setQuickAdd] = useState<QuickAddState | null>(null)
  const [paletteWidth, setPaletteWidth] = useState(208)
  const [configWidth, setConfigWidth] = useState(256)
  const [previewHeight, setPreviewHeight] = useState(192)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const rfInstance = useRef<{
    screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number }
  } | null>(null)

  // Generate markdown from current state
  const markdown = useMemo(
    () => generateCommand(nodes, edges, config),
    [nodes, edges, config]
  )

  // Add a node at a given flow position
  const addNodeAtPosition = useCallback(
    (item: DroppedItem, position: { x: number; y: number }) => {
      const newNode: Node = {
        id: nextNodeId(),
        type: 'erNode',
        position,
        data: buildNodeData(item),
      }
      setNodes((nds) => [...nds, newNode])
    },
    [setNodes]
  )

  // Handle edge connections
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        animated: true,
        style: { stroke: '#7c3aed', strokeWidth: 2 },
      }, eds))
    },
    [setEdges]
  )

  // Handle drag over canvas
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  // Handle drop onto canvas
  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()

      const raw = e.dataTransfer.getData('application/json')
      if (!raw) return

      let item: DroppedItem
      try {
        item = JSON.parse(raw)
      } catch {
        return
      }

      if (!reactFlowWrapper.current || !rfInstance.current) return

      const position = rfInstance.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      addNodeAtPosition(item, position)
    },
    [addNodeAtPosition]
  )

  // Double-click canvas to open quick-add
  const onPaneDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!rfInstance.current || !reactFlowWrapper.current) return

      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const screenPos = {
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      }
      const flowPos = rfInstance.current.screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      })

      setQuickAdd({ screenPos, flowPos })
    },
    []
  )

  // Handle quick-add selection
  const handleQuickAddSelect = useCallback(
    (item: BrainItem) => {
      if (!quickAdd) return
      addNodeAtPosition(
        {
          id: item.id,
          name: item.name,
          type: item.type,
          description: item.description,
          category: item.category,
        },
        quickAdd.flowPos
      )
      setQuickAdd(null)
    },
    [quickAdd, addNodeAtPosition]
  )

  // Store reactflow instance
  const onInit = useCallback((instance: unknown) => {
    rfInstance.current = instance as typeof rfInstance.current
  }, [])

  // Toolbar handlers
  const handleNew = useCallback(() => {
    setNodes([])
    setEdges([])
    setConfig({ ...DEFAULT_CONFIG })
    setWorkflowId(null)
  }, [setNodes, setEdges])

  const handleLoad = useCallback((wf: WorkflowDetail) => {
    setNodes(wf.nodes || [])
    setEdges(wf.edges || [])
    setWorkflowId(wf.id)
    setConfig((prev) => ({
      ...prev,
      name: wf.name || '',
      description: wf.description || '',
    }))
  }, [setNodes, setEdges])

  const handleSave = useCallback(() => {
    return {
      name: config.name || 'Untitled',
      description: config.description || '',
      nodes: nodes,
      edges: edges,
    }
  }, [config, nodes, edges])

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold">Command Composer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Drag components onto the canvas, connect them, and generate
          deployable command files.
        </p>
      </div>

      {/* Toolbar */}
      <WorkflowToolbar
        currentId={workflowId}
        currentName={config.name}
        onNew={handleNew}
        onLoad={handleLoad}
        onSave={handleSave}
      />

      {/* Main layout: Palette | Canvas + Preview | Config */}
      <div className="flex-1 flex rounded-xl border border-border overflow-hidden bg-card">
        {/* Left: Component Palette */}
        <div style={{ width: paletteWidth, minWidth: 120, maxWidth: 400 }}>
          <ComponentPalette className="w-full" />
        </div>

        <ResizeHandle
          direction="horizontal"
          onResize={(d) => setPaletteWidth((w) => Math.min(400, Math.max(120, w + d)))}
        />

        {/* Center: Canvas (top) + Preview (bottom) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Canvas */}
          <div
            ref={reactFlowWrapper}
            className="flex-1 relative"
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={onInit}
              onPaneClick={() => setQuickAdd(null)}
              onDoubleClick={onPaneDoubleClick}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.3 }}
              minZoom={0.2}
              maxZoom={2}
              proOptions={{ hideAttribution: true }}
              deleteKeyCode={['Backspace', 'Delete']}
            >
              <Background
                variant={BackgroundVariant.Dots}
                gap={16}
                size={1}
                color="#27272a"
              />
              <Controls showInteractive={false} />
              {/* Empty state overlay */}
              {nodes.length === 0 && !quickAdd && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center space-y-2">
                    <p className="text-muted-foreground text-sm">
                      Drag components from the sidebar
                    </p>
                    <p className="text-muted-foreground/60 text-xs">
                      or double-click to quick-add
                    </p>
                  </div>
                </div>
              )}
            </ReactFlow>

            {/* Quick-add menu overlay */}
            {quickAdd && (
              <QuickAddMenu
                position={quickAdd.screenPos}
                onSelect={handleQuickAddSelect}
                onClose={() => setQuickAdd(null)}
              />
            )}
          </div>

          <ResizeHandle
            direction="vertical"
            onResize={(d) => setPreviewHeight((h) => Math.min(400, Math.max(80, h - d)))}
          />

          {/* Bottom: Preview */}
          <div style={{ height: previewHeight, minHeight: 80, maxHeight: 400 }}>
            <CommandPreview
              markdown={markdown}
              commandName={config.name}
              className="h-full"
            />
          </div>
        </div>

        <ResizeHandle
          direction="horizontal"
          onResize={(d) => setConfigWidth((w) => Math.min(400, Math.max(160, w - d)))}
        />

        {/* Right: Command Config */}
        <div style={{ width: configWidth, minWidth: 160, maxWidth: 400 }}>
          <CommandConfigPanel
            config={config}
            onChange={setConfig}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

export default WorkflowBuilder
