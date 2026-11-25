import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { SlideSpec } from '../../core/models/slide-spec.models';
import { renderVisualHtml } from '../../core/utils/visual-builder';
import { ListVisual } from './list-visual';
import { MemoryVisual } from './memory-visual';
import { TreeVisual } from './tree-visual';

/** Renders a slide's structured `visual` spec; picks the component for its `kind`. */
@Component({
  selector: 'app-visual-renderer',
  standalone: true,
  imports: [ListVisual, MemoryVisual, TreeVisual],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  template: `
    @let s = spec();
    @if (s.kind === 'list') {
      <app-list-visual [spec]="s" />
    } @else if (s.kind === 'tree') {
      <app-tree-visual [spec]="s" />
    } @else if (s.kind === 'memory') {
      <app-memory-visual [spec]="s" />
    } @else {
      <div [innerHTML]="html()"></div>
    }
  `,
})
export class VisualRenderer {
  spec = input.required<SlideSpec>();

  /** Markup for the kinds that are still HTML-backed; unknown kinds render nothing instead of throwing. */
  html = computed(() => {
    const s = this.spec();
    switch (s.kind) {
      case 'legacy-html': return s.html;
      case 'chain':
      case 'grid': return renderVisualHtml(s);
      default: return '';
    }
  });
}
