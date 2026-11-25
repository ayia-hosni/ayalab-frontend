import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { TreePanel, TreeSpec } from '../../core/models/slide-spec.models';
import { layoutTree } from '../../core/utils/tree-layout';
import { NODE_COLORS, NodeColorName } from '../../core/utils/visual-builder';

const DEPTH_COLORS: NodeColorName[] = ['purple', 'orange', 'teal', 'rose'];

interface NodeView {
  id: string;
  label: string;
  x: number;
  y: number;
  boxClass: string;
  highlighted: boolean;
  /** 1-based position in the visit order, or null when this panel doesn't number the nodes. */
  visit: number | null;
}

interface EdgeView {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PanelView {
  caption: string | undefined;
  width: number;
  height: number;
  nodes: NodeView[];
  edges: EdgeView[];
  ariaLabel: string;
}

/** Binary-tree diagrams; coordinates come from {@link layoutTree}, nothing is hand-positioned. */
@Component({
  selector: 'app-tree-visual',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tree-visual.html',
})
export class TreeVisual {
  spec = input.required<TreeSpec>();

  panels = computed<PanelView[]>(() => this.spec().panels.map(p => this.toView(p)));

  private toView(panel: TreePanel): PanelView {
    const layout = layoutTree(panel.nodes);
    const byId = new Map(panel.nodes.map(n => [n.id, n]));
    const highlighted = new Set(panel.highlight ?? []);
    const visitIndex = new Map((panel.visitOrder ?? []).map((id, i) => [id, i + 1]));
    const at = new Map(layout.nodes.map(n => [n.id, n]));

    const nodes = layout.nodes.map((p): NodeView => {
      const src = byId.get(p.id)!;
      const colors = NODE_COLORS[src.color ?? DEPTH_COLORS[p.depth % DEPTH_COLORS.length]];
      return {
        id: p.id,
        label: src.label,
        x: p.x,
        y: p.y,
        boxClass: `${colors.border} ${colors.bg} ${colors.text}`,
        highlighted: highlighted.has(p.id),
        visit: visitIndex.get(p.id) ?? null,
      };
    });
    const edges = layout.edges.map((e): EdgeView => {
      const a = at.get(e.from)!;
      const b = at.get(e.to)!;
      return { key: `${e.from}-${e.to}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
    });

    return {
      caption: panel.caption,
      width: layout.width,
      height: layout.height,
      nodes,
      edges,
      ariaLabel: describe(panel, layout.nodes.length),
    };
  }
}

function describe(panel: TreePanel, count: number): string {
  const caption = panel.caption ? `${panel.caption}: ` : '';
  const order = panel.visitOrder?.length ? `, visited in order ${panel.visitOrder.map(id => panel.nodes.find(n => n.id === id)?.label ?? id).join(', ')}` : '';
  return `${caption}binary tree with ${count} node${count === 1 ? '' : 's'}${order}`;
}
