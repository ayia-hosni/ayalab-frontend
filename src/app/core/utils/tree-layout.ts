import type { TreeNode } from '../models/slide-spec.models';

export interface TreeLayoutOptions {
  /** Horizontal distance between neighbouring columns. */
  columnWidth: number;
  /** Vertical distance between levels. */
  rowHeight: number;
  /** Space kept around the drawing so nodes aren't clipped. */
  padding: number;
}

export const DEFAULT_TREE_LAYOUT: TreeLayoutOptions = { columnWidth: 64, rowHeight: 72, padding: 32 };

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  depth: number;
}

export interface TreeEdge {
  from: string;
  to: string;
}

export interface TreeLayout {
  nodes: PositionedNode[];
  edges: TreeEdge[];
  width: number;
  height: number;
}

/**
 * Places a binary tree: y follows depth, x follows in-order position, so a left subtree is
 * always left of its parent and right of it is always right, and no two nodes overlap.
 * Pure and deterministic. Nodes unreachable from the root, and cycles, are ignored.
 */
export function layoutTree(nodes: TreeNode[], options: TreeLayoutOptions = DEFAULT_TREE_LAYOUT): TreeLayout {
  const root = nodes.find(n => n.parent == null);
  if (!root) return { nodes: [], edges: [], width: 0, height: 0 };

  const children = new Map<string, { left?: string; right?: string }>();
  for (const n of nodes) {
    if (n.parent == null) continue;
    const slot = children.get(n.parent) ?? {};
    if (n.side === 'left') slot.left = n.id;
    else if (n.side === 'right') slot.right = n.id;
    children.set(n.parent, slot);
  }

  const positioned: PositionedNode[] = [];
  const edges: TreeEdge[] = [];
  const visited = new Set<string>();
  let column = 0;
  let maxDepth = 0;

  const place = (id: string, depth: number): void => {
    if (visited.has(id)) return;
    visited.add(id);
    const slot = children.get(id) ?? {};
    if (slot.left) place(slot.left, depth + 1);
    positioned.push({ id, x: column++ * options.columnWidth + options.padding, y: depth * options.rowHeight + options.padding, depth });
    maxDepth = Math.max(maxDepth, depth);
    if (slot.right) place(slot.right, depth + 1);
  };
  place(root.id, 0);

  for (const n of nodes) {
    if (n.parent != null && visited.has(n.id) && visited.has(n.parent)) edges.push({ from: n.parent, to: n.id });
  }

  return {
    nodes: positioned,
    edges,
    width: (column - 1) * options.columnWidth + options.padding * 2,
    height: maxDepth * options.rowHeight + options.padding * 2,
  };
}
