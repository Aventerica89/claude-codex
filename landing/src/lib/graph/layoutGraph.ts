import dagre from 'dagre'
import type { Node, Edge } from '@xyflow/react'

const NODE_WIDTH = 200
const NODE_HEIGHT = 90

interface LayoutOptions {
  direction?: 'TB' | 'LR'
  nodeSpacing?: number
  rankSpacing?: number
}

/**
 * Apply dagre auto-layout to position nodes hierarchically.
 * Returns new node array with x/y positions assigned.
 */
export function layoutGraph(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node[] {
  const {
    direction = 'TB',
    nodeSpacing = 40,
    rankSpacing = 80,
  } = options

  const g = new dagre.graphlib.Graph()

  g.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 40,
    marginy: 40,
  })

  g.setDefaultEdgeLabel(() => ({}))

  for (const node of nodes) {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target)
  }

  dagre.layout(g)

  return nodes.map((node) => {
    const dagreNode = g.node(node.id)
    if (!dagreNode) return node

    return {
      ...node,
      position: {
        x: dagreNode.x - NODE_WIDTH / 2,
        y: dagreNode.y - NODE_HEIGHT / 2,
      },
    }
  })
}
