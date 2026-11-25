import { describe, expect, it } from 'vitest';

import type { TreeNode } from '../models/slide-spec.models';
import { DEFAULT_TREE_LAYOUT, layoutTree } from './tree-layout';

const sample: TreeNode[] = [
  { id: 'r', label: '8', parent: null },
  { id: 'l', label: '3', parent: 'r', side: 'left' },
  { id: 'x', label: '10', parent: 'r', side: 'right' },
  { id: 'll', label: '1', parent: 'l', side: 'left' },
  { id: 'lr', label: '6', parent: 'l', side: 'right' },
];

describe('layoutTree', () => {
  it('puts left subtrees left of their parent and right subtrees right (in-order columns)', () => {
    const at = new Map(layoutTree(sample).nodes.map(n => [n.id, n]));
    expect(at.get('ll')!.x).toBeLessThan(at.get('l')!.x);
    expect(at.get('l')!.x).toBeLessThan(at.get('lr')!.x);
    expect(at.get('lr')!.x).toBeLessThan(at.get('r')!.x);
    expect(at.get('r')!.x).toBeLessThan(at.get('x')!.x);
  });

  it('uses depth for y and never overlaps two nodes', () => {
    const { nodes } = layoutTree(sample);
    const { rowHeight, padding } = DEFAULT_TREE_LAYOUT;
    expect(nodes.find(n => n.id === 'r')!.y).toBe(padding);
    expect(nodes.find(n => n.id === 'll')!.y).toBe(padding + 2 * rowHeight);
    expect(new Set(nodes.map(n => `${n.x},${n.y}`)).size).toBe(nodes.length);
  });

  it('emits one edge per child and sizes the canvas around the nodes', () => {
    const layout = layoutTree(sample);
    expect(layout.edges).toHaveLength(4);
    expect(layout.edges).toContainEqual({ from: 'l', to: 'lr' });
    expect(layout.width).toBe(4 * DEFAULT_TREE_LAYOUT.columnWidth + 2 * DEFAULT_TREE_LAYOUT.padding);
    expect(layout.height).toBe(2 * DEFAULT_TREE_LAYOUT.rowHeight + 2 * DEFAULT_TREE_LAYOUT.padding);
  });

  it('is deterministic', () => {
    expect(layoutTree(sample)).toEqual(layoutTree(sample));
  });

  it('handles an empty tree and ignores cycles / unreachable nodes', () => {
    expect(layoutTree([])).toEqual({ nodes: [], edges: [], width: 0, height: 0 });
    const cyclic: TreeNode[] = [
      { id: 'r', label: 'r', parent: null },
      { id: 'a', label: 'a', parent: 'b', side: 'left' },
      { id: 'b', label: 'b', parent: 'a', side: 'left' },
    ];
    expect(layoutTree(cyclic).nodes.map(n => n.id)).toEqual(['r']);
  });
});
