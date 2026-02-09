import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
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
import { getItemById, getOutgoingRefs } from '@/lib/generated'
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
import { ModeToggle, type ComposerMode } from './ModeToggle'
import { useExploreMode } from './ExploreMode'
import { BrainItemModal } from './BrainItemModal'
import { WorkflowContext } from './WorkflowContext'
import { cn } from '@/lib/utils'

interface DroppedItem {
  id: string
  name: string
  type: BrainItemType
  description: string
  category: string
}

function buildNodeData(item: DroppedItem) {
  const brainItem = getItemById(item.id)
  const refCount = brainItem ? getOutgoingRefs(brainItem).length : 0

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
    isReferenceNode: false,
    isExpanded: false,
    referenceCount: refCount,
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

// Collapse toggle button
function PanelToggle({
  visible,
  onClick,
  side,
  label,
}: {
  visible: boolean
  onClick: () => void
  side: 'left' | 'right' | 'bottom'
  label: string
}) {
  const icon = visible
    ? (side === 'left' ? '\u25C0' : side === 'right' ? '\u25B6' : '\u25BC')
    : (side === 'left' ? '\u25B6' : side === 'right' ? '\u25C0' : '\u25B2')

  return (
    <button
      onClick={onClick}
      title={`${visible ? 'Hide' : 'Show'} ${label}`}
      className={cn(
        'text-[10px] px-1.5 py-0.5 rounded border transition-colors',
        'border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50'
      )}
    >
      {icon}
    </button>
  )
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
  const [mode, setMode] = useState<ComposerMode>('build')
  const [showPalette, setShowPalette] = useState(true)
  const [showConfig, setShowConfig] = useState(true)
  const [showPreview, setShowPreview] = useState(true)
  const [modalItemId, setModalItemId] = useState<string | null>(null)
  const explore = useExploreMode()
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const rfInstance = useRef<{
    screenToFlowPosition: (pos: { x: number; y: number }) => { x: number; y: number }
  } | null>(null)

  // Keyboard shortcuts for panel toggles
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.key === '[') {
        e.preventDefault()
        setShowPalette((v) => !v)
      } else if (e.key === ']') {
        e.preventDefault()
        setShowConfig((v) => !v)
      } else if (e.key === '\\') {
        e.preventDefault()
        setShowPreview((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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

  // Explore mode: click node to expand/collapse references
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (mode !== 'explore') return

      const result = explore.expandNode(node.id, nodes, edges)
      setNodes(result.nodes)
      setEdges(result.edges)
    },
    [mode, nodes, edges, setNodes, setEdges, explore]
  )

  // Toolbar handlers
  const handleNew = useCallback(() => {
    setNodes([])
    setEdges([])
    setConfig({ ...DEFAULT_CONFIG })
    setWorkflowId(null)
    explore.reset()
  }, [setNodes, setEdges, explore])

  const handleClear = useCallback(() => {
    setNodes([])
    setEdges([])
    explore.reset()
  }, [setNodes, setEdges, explore])

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

  // Info modal handler — passed to nodes via context
  const handleInfoClick = useCallback((brainItemId: string) => {
    setModalItemId(brainItemId)
  }, [])

  const workflowContextValue = useMemo(
    () => ({ onInfoClick: handleInfoClick }),
    [handleInfoClick]
  )

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Compact header row: title + toolbar + mode toggle */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-lg font-bold shrink-0">Composer</h1>
          <span className="text-muted-foreground text-xs hidden md:inline truncate">
            Drag, connect, generate commands
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Panel toggles */}
          <div className="flex items-center gap-1">
            <PanelToggle visible={showPalette} onClick={() => setShowPalette((v) => !v)} side="left" label="palette [" />
            <PanelToggle visible={showPreview} onClick={() => setShowPreview((v) => !v)} side="bottom" label="preview \\" />
            <PanelToggle visible={showConfig} onClick={() => setShowConfig((v) => !v)} side="right" label="config ]" />
          </div>

          <div className="w-px h-4 bg-border" />

          {/* Clear button */}
          {nodes.length > 0 && (
            <button
              onClick={handleClear}
              className="text-[10px] px-2 py-0.5 rounded border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-colors"
            >
              Clear
            </button>
          )}

          <ModeToggle mode={mode} onChange={setMode} />
        </div>
      </div>

      {/* Toolbar row */}
      <WorkflowToolbar
        currentId={workflowId}
        currentName={config.name}
        onNew={handleNew}
        onLoad={handleLoad}
        onSave={handleSave}
        className="mb-2"
      />

      {/* Main layout: Palette | Canvas + Preview | Config */}
      <div className="flex-1 flex rounded-xl border border-border overflow-hidden bg-card">
        {/* Left: Component Palette */}
        {showPalette && (
          <>
            <div style={{ width: paletteWidth, minWidth: 120, maxWidth: 400 }}>
              <ComponentPalette className="w-full" />
            </div>
            <ResizeHandle
              direction="horizontal"
              onResize={(d) => setPaletteWidth((w) => Math.min(400, Math.max(120, w + d)))}
            />
          </>
        )}

        {/* Center: Canvas (top) + Preview (bottom) */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Canvas */}
          <div
            ref={reactFlowWrapper}
            className="flex-1 relative"
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <WorkflowContext.Provider value={workflowContextValue}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={onInit}
                onNodeClick={onNodeClick}
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
                      <p className="text-muted-foreground/40 text-[10px] mt-4">
                        [ ] \ toggle panels
                      </p>
                    </div>
                  </div>
                )}
              </ReactFlow>
            </WorkflowContext.Provider>

            {/* Quick-add menu overlay */}
            {quickAdd && (
              <QuickAddMenu
                position={quickAdd.screenPos}
                onSelect={handleQuickAddSelect}
                onClose={() => setQuickAdd(null)}
              />
            )}
          </div>

          {/* Bottom: Preview */}
          {showPreview && (
            <>
              <ResizeHandle
                direction="vertical"
                onResize={(d) => setPreviewHeight((h) => Math.min(400, Math.max(80, h - d)))}
              />
              <div style={{ height: previewHeight, minHeight: 80, maxHeight: 400 }}>
                <CommandPreview
                  markdown={markdown}
                  commandName={config.name}
                  className="h-full"
                />
              </div>
            </>
          )}
        </div>

        {/* Right: Command Config */}
        {showConfig && (
          <>
            <ResizeHandle
              direction="horizontal"
              onResize={(d) => setConfigWidth((w) => Math.min(400, Math.max(160, w - d)))}
            />
            <div style={{ width: configWidth, minWidth: 160, maxWidth: 400 }}>
              <CommandConfigPanel
                config={config}
                onChange={setConfig}
                className="w-full"
              />
            </div>
          </>
        )}
      </div>

      {/* Brain item detail modal */}
      {modalItemId && (
        <BrainItemModal
          itemId={modalItemId}
          onClose={() => setModalItemId(null)}
        />
      )}
    </div>
  )
}

// Export context for info button clicks from ERNode
export { type WorkflowBuilder }
export default WorkflowBuilder
