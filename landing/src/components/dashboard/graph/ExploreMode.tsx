import { useCallback, useRef } from 'react'
import type { Node, Edge } from '@xyflow/react'
import dagre from 'dagre'
import { getItemById, getOutgoingRefs } from '@/lib/generated'
import type { ERNodeData } from './ERNode'

// Edge style constants
const REF_EDGE_STYLE = {
  stroke: '#22d3ee',
  strokeWidth: 1.5,
  strokeDasharray: '6 3',
}

const CROSSLINK_EDGE_STYLE = {
  stroke: '#22d3ee',
  strokeWidth: 1,
  strokeDasharray: '3 3',
}

// Layout constants
const NODE_WIDTH = 200
const NODE_HEIGHT = 100
const RANK_SEP = 80
const NODE_SEP = 40

interface ExploreState {
  expandedIds: Set<string>
  referenceNodeIds: Set<string>
}

function layoutSubtree(
  parentNode: Node,
  childNodes: Node[],
): Node[] {
  if (childNodes.length === 0) return []

  const g = new dagre.graphlib.Graph()
  g.setGraph({
    rankdir: 'TB',
    ranksep: RANK_SEP,
    nodesep: NODE_SEP,
  })
  g.setDefaultEdgeLabel(() => ({}))

  // Add parent as root
  g.setNode(parentNode.id, { width: NODE_WIDTH, height: NODE_HEIGHT })

  // Add children
  for (const child of childNodes) {
    g.setNode(child.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
    g.setEdge(parentNode.id, child.id)
  }

  dagre.layout(g)

  // Get parent position from dagre
  const parentDagre = g.node(parentNode.id)
  const offsetX = parentNode.position.x - parentDagre.x
  const offsetY = parentNode.position.y - parentDagre.y

  // Position children relative to parent's actual position
  return childNodes.map((child) => {
    const dagreNode = g.node(child.id)
    return {
      ...child,
      position: {
        x: dagreNode.x + offsetX,
        y: dagreNode.y + offsetY,
      },
    }
  })
}

function buildNodeData(
  brainItemId: string,
  label: string,
  itemType: string,
  category: string,
  refCount: number,
): ERNodeData {
  return {
    label,
    itemType: itemType as ERNodeData['itemType'],
    brainItemId,
    category,
    meta1Label: 'Type',
    meta1Value: itemType,
    meta2Label: 'Refs',
    meta2Value: String(refCount),
    isHighlighted: false,
    isSelected: false,
    isReferenceNode: true,
    isExpanded: false,
    referenceCount: refCount,
  }
}

export function useExploreMode() {
  const stateRef = useRef<ExploreState>({
    expandedIds: new Set(),
    referenceNodeIds: new Set(),
  })

  const isExpanded = useCallback((nodeId: string): boolean => {
    return stateRef.current.expandedIds.has(nodeId)
  }, [])

  const isReferenceNode = useCallback((nodeId: string): boolean => {
    return stateRef.current.referenceNodeIds.has(nodeId)
  }, [])

  const expandNode = useCallback((
    nodeId: string,
    nodes: Node[],
    edges: Edge[],
  ): { nodes: Node[]; edges: Edge[] } => {
    const state = stateRef.current

    // Already expanded? collapse instead
    if (state.expandedIds.has(nodeId)) {
      return collapseNode(nodeId, nodes, edges)
    }

    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return { nodes, edges }

    const data = node.data as unknown as ERNodeData
    const brainItem = getItemById(data.brainItemId)
    if (!brainItem) return { nodes, edges }

    const outgoing = getOutgoingRefs(brainItem)
    if (outgoing.length === 0) return { nodes, edges }

    state.expandedIds.add(nodeId)

    const existingBrainIds = new Map(
      nodes.map((n) => [(n.data as unknown as ERNodeData).brainItemId, n.id])
    )

    const newNodes: Node[] = []
    const newEdges: Edge[] = []

    for (const ref of outgoing) {
      const existingNodeId = existingBrainIds.get(ref.id)

      if (existingNodeId) {
        // Draw cross-link edge to existing node (no duplicate)
        const edgeId = `explore-xlink-${nodeId}-${existingNodeId}`
        if (!edges.some((e) => e.id === edgeId)) {
          newEdges.push({
            id: edgeId,
            source: nodeId,
            target: existingNodeId,
            style: CROSSLINK_EDGE_STYLE,
            animated: false,
            data: { isReference: true, isCrossLink: true },
          })
        }
        continue
      }

      const refOutgoing = getOutgoingRefs(ref)
      const childId = `explore-${ref.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

      newNodes.push({
        id: childId,
        type: 'erNode',
        position: { x: 0, y: 0 },
        data: buildNodeData(
          ref.id,
          ref.name,
          ref.type,
          ref.category,
          refOutgoing.length,
        ),
      })

      existingBrainIds.set(ref.id, childId)
      state.referenceNodeIds.add(childId)

      newEdges.push({
        id: `explore-edge-${nodeId}-${childId}`,
        source: nodeId,
        target: childId,
        style: REF_EDGE_STYLE,
        animated: false,
        data: { isReference: true, parentNodeId: nodeId },
      })
    }

    // Layout the new child nodes around the parent
    const positionedChildren = layoutSubtree(node, newNodes)

    // Mark parent as expanded
    const updatedNodes = nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          data: { ...n.data, isExpanded: true },
        }
      }
      return n
    })

    return {
      nodes: [...updatedNodes, ...positionedChildren],
      edges: [...edges, ...newEdges],
    }
  }, [])

  const collapseNode = useCallback((
    nodeId: string,
    nodes: Node[],
    edges: Edge[],
  ): { nodes: Node[]; edges: Edge[] } => {
    const state = stateRef.current

    if (!state.expandedIds.has(nodeId)) {
      return { nodes, edges }
    }

    state.expandedIds.delete(nodeId)

    // Find direct children added by this node's expansion
    const childEdges = edges.filter(
      (e) => e.source === nodeId && (e.data as any)?.isReference
    )
    const childNodeIds = new Set(
      childEdges
        .filter((e) => !(e.data as any)?.isCrossLink)
        .map((e) => e.target)
    )

    // Recursively collect nodes to remove (children that are only reachable via this node)
    const toRemove = new Set<string>()
    const queue = [...childNodeIds]

    while (queue.length > 0) {
      const id = queue.shift()!
      if (toRemove.has(id)) continue
      if (!state.referenceNodeIds.has(id)) continue

      // Check if any other non-removed node connects to this one
      const otherParents = edges.filter(
        (e) => e.target === id
          && e.source !== nodeId
          && !toRemove.has(e.source)
      )
      if (otherParents.length > 0) continue

      toRemove.add(id)
      state.referenceNodeIds.delete(id)
      state.expandedIds.delete(id)

      // Also collapse this node's children
      const subChildren = edges.filter(
        (e) => e.source === id && (e.data as any)?.isReference
      )
      for (const e of subChildren) {
        if (!(e.data as any)?.isCrossLink) {
          queue.push(e.target)
        }
      }
    }

    // Remove edges connected to removed nodes + direct ref edges from this node
    const edgeIdsToRemove = new Set(childEdges.map((e) => e.id))

    const filteredNodes = nodes
      .filter((n) => !toRemove.has(n.id))
      .map((n) => {
        if (n.id === nodeId) {
          return { ...n, data: { ...n.data, isExpanded: false } }
        }
        return n
      })

    const filteredEdges = edges.filter((e) => {
      if (edgeIdsToRemove.has(e.id)) return false
      if (toRemove.has(e.source) || toRemove.has(e.target)) return false
      return true
    })

    return { nodes: filteredNodes, edges: filteredEdges }
  }, [])

  const reset = useCallback(() => {
    stateRef.current = {
      expandedIds: new Set(),
      referenceNodeIds: new Set(),
    }
  }, [])

  return {
    expandNode,
    collapseNode,
    isExpanded,
    isReferenceNode,
    reset,
  }
}
