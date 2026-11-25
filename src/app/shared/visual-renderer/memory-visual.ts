import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { MemoryPanel, MemorySpec } from '../../core/models/slide-spec.models';
import { DEFAULT_MEMORY_LAYOUT, layoutMemory, MemoryLayout } from '../../core/utils/memory-layout';
import { NODE_COLORS, NodeColorName } from '../../core/utils/visual-builder';

const DEFAULT_COLORS: NodeColorName[] = ['orange', 'purple', 'teal', 'rose'];

interface CellView {
  id: string;
  x: number;
  address: string | null;
  name: string | null;
  value: string;
  uninitialised: boolean;
  boxClass: string;
  highlighted: boolean;
}

interface ArrowView {
  key: string;
  d: string;
  head: string;
  strokeClass: string;
  fillClass: string;
}

interface PanelView {
  caption: string | undefined;
  layout: MemoryLayout;
  cells: CellView[];
  arrows: ArrowView[];
  ariaLabel: string;
}

/** Memory-cell diagrams (address, name, value) with pointer arrows; positions come from {@link layoutMemory}. */
@Component({
  selector: 'app-memory-visual',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './memory-visual.html',
})
export class MemoryVisual {
  spec = input.required<MemorySpec>();

  readonly o = DEFAULT_MEMORY_LAYOUT;
  panels = computed<PanelView[]>(() => this.spec().panels.map(p => this.toView(p)));

  private toView(panel: MemoryPanel): PanelView {
    const layout = layoutMemory(panel.cells, panel.arrows);
    const xOf = new Map(layout.cells.map(c => [c.id, c.x]));
    const highlighted = new Set(panel.highlight ?? []);
    const colorOf = new Map<string, NodeColorName>();

    const cells = panel.cells.map((c, i): CellView => {
      const color = c.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      colorOf.set(c.id, color);
      const colors = NODE_COLORS[color];
      const hasValue = c.value !== undefined && c.value !== '';
      return {
        id: c.id,
        x: xOf.get(c.id)!,
        address: c.address ?? null,
        name: c.name ?? null,
        value: hasValue ? c.value! : '?',
        uninitialised: !hasValue,
        boxClass: `${colors.border} ${colors.bg} ${colors.text}`,
        highlighted: highlighted.has(c.id),
      };
    });

    const arrows = layout.arrows.map((a): ArrowView => {
      const line = NODE_COLORS[colorOf.get(a.from) ?? 'gray'].line;
      return {
        key: a.key,
        d: a.d,
        head: a.head,
        strokeClass: line.replace('bg-', 'stroke-'),
        fillClass: line.replace('bg-', 'fill-'),
      };
    });

    return { caption: panel.caption, layout, cells, arrows, ariaLabel: describe(panel) };
  }
}

/** Text alternative, e.g. "p holds 1000 and points to x". */
function describe(panel: MemoryPanel): string {
  const byId = new Map(panel.cells.map(c => [c.id, c]));
  const label = (id: string) => byId.get(id)?.name ?? id;
  const cells = panel.cells
    .map(c => `${label(c.id)}${c.address ? ` at ${c.address}` : ''} holds ${c.value ? c.value : 'nothing yet'}`)
    .join('; ');
  const arrows = (panel.arrows ?? []).map(a => `${label(a.from)} points to ${label(a.to)}`).join('; ');
  const caption = panel.caption ? `${panel.caption}: ` : '';
  return `${caption}memory: ${cells}${arrows ? `. ${arrows}` : ''}`;
}
