import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { ListPanel, ListSpec, ListVariant } from '../../core/models/slide-spec.models';
import { NODE_COLORS, NodeColorName } from '../../core/utils/visual-builder';

const DEFAULT_COLORS: NodeColorName[] = ['orange', 'purple', 'teal', 'rose'];

interface NodeView {
  id: string;
  label: string;
  boxClass: string;
  lineClass: string;
  /** Arrowhead border colours matching {@link lineClass}. */
  arrowRight: string;
  arrowLeft: string;
  pointer: string | null;
  highlighted: boolean;
}

interface PanelView {
  caption: string | undefined;
  nodes: NodeView[];
  nullEnd: boolean;
  ariaLabel: string;
}

/** Singly, doubly and circular linked-list diagrams, one box per panel (e.g. Before / After). */
@Component({
  selector: 'app-list-visual',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './list-visual.html',
})
export class ListVisual {
  spec = input.required<ListSpec>();

  variant = computed<ListVariant>(() => this.spec().variant);
  panels = computed<PanelView[]>(() => this.spec().panels.map(p => this.toView(p, this.spec().variant)));

  private toView(panel: ListPanel, variant: ListVariant): PanelView {
    const pointersAt = new Map<string, string[]>();
    for (const p of panel.pointers ?? []) {
      pointersAt.set(p.at, [...(pointersAt.get(p.at) ?? []), p.name]);
    }
    const highlighted = new Set(panel.highlight ?? []);
    const nodes = panel.nodes.map((n, i): NodeView => {
      const colors = NODE_COLORS[n.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]];
      return {
        id: n.id,
        label: n.label,
        boxClass: `${colors.border} ${colors.bg} ${colors.text}`,
        lineClass: colors.line,
        arrowRight: colors.line.replace('bg-', 'border-l-'),
        arrowLeft: colors.line.replace('bg-', 'border-r-'),
        pointer: pointersAt.get(n.id)?.join(' / ') ?? null,
        highlighted: highlighted.has(n.id),
      };
    });
    const nullEnd = variant !== 'circular' && panel.nullEnd !== false;
    return { caption: panel.caption, nodes, nullEnd, ariaLabel: describe(panel, variant, nullEnd) };
  }
}

/** Text alternative for screen readers, e.g. "Doubly linked list: 10, 20, 30, then NULL". */
function describe(panel: ListPanel, variant: ListVariant, nullEnd: boolean): string {
  const items = panel.nodes.map(n => n.label).join(', ') || 'empty';
  const tail = variant === 'circular' ? ', then back to the first node' : nullEnd ? ', then NULL' : '';
  const caption = panel.caption ? `${panel.caption}: ` : '';
  return `${caption}${variant} linked list: ${items}${tail}`;
}
