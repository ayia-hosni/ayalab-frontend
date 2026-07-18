import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AdminLessonService } from '../../../core/services/admin-lesson.service';
import { AdminLessonDetail, AdminLessonRequest, AdminSlide } from '../../../core/models/lesson-admin.models';
import {
  CardColorName, ChainItem, ChainNodeItem, ChainNullItem, ChainSplitItem, CodeSnippet, ComparisonCard, ComparisonGrid,
  ConnectorStyle, NodeColorName, PointerTag, VisualFrame, VisualSpec,
  emptyCard, emptyChainNode, emptyChainNull, emptyChainSplit, emptyCodeSnippet, emptyFrame, emptyGrid, emptyVisualSpec,
  renderVisualHtml, tryParseVisualSpec,
} from '../../../core/utils/visual-builder';
import { RichTextEditor } from '../../../shared/rich-text-editor/rich-text-editor';

type SlideTextField = 'kickerEn' | 'kickerAr' | 'titleEn' | 'titleAr' | 'visual' | 'bodyEn' | 'bodyAr';
type ChainSpec = Extract<VisualSpec, { kind: 'chain' }>;

interface SlideForm {
  id?: number;
  ordinal: number;
  kickerEn: string;
  kickerAr: string;
  titleEn: string;
  titleAr: string;
  visual: string;
  bodyEn: string;
  bodyAr: string;
  visualMode: 'builder' | 'raw';
  spec: VisualSpec;
}

interface LessonForm {
  ordinal: number;
  icon: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  slides: SlideForm[];
}

function toSlideForm(s: AdminSlide): SlideForm {
  let spec = emptyVisualSpec();
  let visualMode: 'builder' | 'raw' = 'raw';
  if (s.visualSpec) {
    try { spec = JSON.parse(s.visualSpec); visualMode = 'builder'; } catch { /* fall back to raw */ }
  } else {
    // Legacy slide authored before the builder existed — try to reconstruct a spec
    // from its HTML so it becomes dynamically editable too. Falls back to raw HTML
    // untouched if the layout isn't one the builder can represent.
    const parsed = tryParseVisualSpec(s.visual);
    if (parsed) { spec = parsed; visualMode = 'builder'; }
  }
  return {
    id: s.id, ordinal: s.ordinal, kickerEn: s.kickerEn, kickerAr: s.kickerAr,
    titleEn: s.titleEn, titleAr: s.titleAr, visual: s.visual, bodyEn: s.bodyEn, bodyAr: s.bodyAr,
    visualMode, spec,
  };
}

function toApiSlide(s: SlideForm): AdminSlide {
  const visual     = s.visualMode === 'builder' ? renderVisualHtml(s.spec) : s.visual;
  const visualSpec = s.visualMode === 'builder' ? JSON.stringify(s.spec) : null;
  return {
    id: s.id, ordinal: s.ordinal, kickerEn: s.kickerEn, kickerAr: s.kickerAr,
    titleEn: s.titleEn, titleAr: s.titleAr, visual, visualSpec, bodyEn: s.bodyEn, bodyAr: s.bodyAr,
  };
}

function emptySlideForm(ordinal: number): SlideForm {
  return {
    ordinal, kickerEn: '', kickerAr: '', titleEn: '', titleAr: '',
    visual: '', bodyEn: '', bodyAr: '',
    visualMode: 'builder', spec: emptyVisualSpec(),
  };
}

function emptyLessonForm(ordinal: number): LessonForm {
  return { ordinal, icon: '', titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '', slides: [] };
}

@Component({
  selector: 'app-admin-lessons-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RichTextEditor],
  templateUrl: './admin-lessons-panel.html',
  styleUrl: './admin-lessons-panel.css',
})
export class AdminLessonsPanel implements OnInit {
  private svc = inject(AdminLessonService);

  lessons = signal<AdminLessonDetail[]>([]);
  loading = signal(true);
  saving  = signal(false);
  error     = signal<string | null>(null);
  saveError = signal<string | null>(null);

  panelOpen = signal(false);
  isEdit    = signal(false);
  editingId = signal<number | null>(null);

  form = signal<LessonForm>(emptyLessonForm(0));

  deleteConfirm = signal<number | null>(null);
  expandedSlide = signal<number | null>(null);

  readonly NODE_COLORS: NodeColorName[] = ['orange', 'purple', 'teal', 'rose', 'gray'];
  readonly CARD_COLORS: CardColorName[] = ['orange', 'purple', 'teal', 'rose', 'gray', 'emerald'];

  total       = computed(() => this.lessons().length);
  totalSlides = computed(() => this.lessons().reduce((sum, l) => sum + l.slides.length, 0));

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list().subscribe({
      next: l => { this.lessons.set(l.slice().sort((a, b) => a.ordinal - b.ordinal)); this.loading.set(false); },
      error: () => { this.error.set('Could not reach the server.'); this.loading.set(false); },
    });
  }

  openCreate(): void {
    this.form.set(emptyLessonForm(this.lessons().length));
    this.isEdit.set(false);
    this.editingId.set(null);
    this.saveError.set(null);
    this.expandedSlide.set(null);
    this.panelOpen.set(true);
  }

  openEdit(l: AdminLessonDetail): void {
    this.form.set({
      ordinal: l.ordinal,
      icon: l.icon,
      titleEn: l.titleEn,
      titleAr: l.titleAr,
      descriptionEn: l.descriptionEn,
      descriptionAr: l.descriptionAr,
      slides: l.slides.map(toSlideForm),
    });
    this.isEdit.set(true);
    this.editingId.set(l.id);
    this.saveError.set(null);
    this.expandedSlide.set(null);
    this.panelOpen.set(true);
  }

  closePanel(): void { this.panelOpen.set(false); }

  updateField<K extends keyof LessonForm>(key: K, value: LessonForm[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  // ── slides ────────────────────────────────────────────────────────────

  addSlide(): void {
    this.form.update(f => ({ ...f, slides: [...f.slides, emptySlideForm(f.slides.length)] }));
    this.expandedSlide.set(this.form().slides.length - 1);
  }

  removeSlide(idx: number): void {
    this.form.update(f => {
      const slides = f.slides.filter((_, i) => i !== idx).map((s, i) => ({ ...s, ordinal: i }));
      return { ...f, slides };
    });
    this.expandedSlide.update(e => e === null ? null : e === idx ? null : e > idx ? e - 1 : e);
  }

  moveSlide(idx: number, dir: -1 | 1): void {
    const target = idx + dir;
    this.form.update(f => {
      if (target < 0 || target >= f.slides.length) return f;
      const slides = [...f.slides];
      [slides[idx], slides[target]] = [slides[target], slides[idx]];
      slides.forEach((s, i) => { s.ordinal = i; });
      return { ...f, slides };
    });
    this.expandedSlide.update(e => e === idx ? target : e === target ? idx : e);
  }

  toggleSlideExpanded(idx: number): void {
    this.expandedSlide.update(e => e === idx ? null : idx);
  }

  jumpToSlide(idx: number): void {
    this.expandedSlide.set(idx);
    setTimeout(() => {
      document.getElementById('admin-slide-' + idx)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  slideSummary(s: SlideForm): string {
    if (s.titleEn) return s.titleEn;
    if (s.kickerEn) return s.kickerEn;
    return '(untitled slide)';
  }

  slideKindBadge(s: SlideForm): string {
    if (s.visualMode === 'raw') return '🖊 Raw HTML';
    return s.spec.kind === 'grid' ? '▦ Grid' : '⛓ Chain';
  }

  updateSlide(idx: number, field: SlideTextField, value: string): void {
    this.form.update(f => {
      const slides = f.slides.map((s, i) => i === idx ? { ...s, [field]: value } : s);
      return { ...f, slides };
    });
  }

  toggleVisualMode(idx: number): void {
    this.form.update(f => {
      const slides = f.slides.map((s, i) => {
        if (i !== idx) return s;
        if (s.visualMode === 'raw') {
          if (s.visual && !confirm('Switching to the visual builder starts a fresh diagram — the existing raw HTML will be replaced when you save. Continue?')) {
            return s;
          }
          return { ...s, visualMode: 'builder' as const, spec: emptyVisualSpec() };
        }
        return { ...s, visualMode: 'raw' as const };
      });
      return { ...f, slides };
    });
  }

  previewFor(s: SlideForm): string {
    return renderVisualHtml(s.spec);
  }

  asChain(spec: VisualSpec): ChainSpec | null {
    return spec.kind === 'chain' ? spec : null;
  }

  asGrid(spec: VisualSpec): ComparisonGrid | null {
    return spec.kind === 'grid' ? spec.grid : null;
  }

  private updateSpec(idx: number, fn: (spec: VisualSpec) => VisualSpec): void {
    this.form.update(f => {
      const slides = f.slides.map((s, i) => i === idx ? { ...s, spec: fn(s.spec) } : s);
      return { ...f, slides };
    });
  }

  private updateChainSpec(idx: number, fn: (spec: ChainSpec) => ChainSpec): void {
    this.updateSpec(idx, spec => spec.kind === 'chain' ? fn(spec) : spec);
  }

  private updateGridSpec(idx: number, fn: (grid: ComparisonGrid) => ComparisonGrid): void {
    this.updateSpec(idx, spec => spec.kind === 'grid' ? { kind: 'grid', grid: fn(spec.grid) } : spec);
  }

  setVisualKind(idx: number, kind: 'chain' | 'grid'): void {
    this.form.update(f => {
      const slides = f.slides.map((s, i) => {
        if (i !== idx || s.spec.kind === kind) return s;
        const hasContent = s.spec.kind === 'chain' ? s.spec.frames.length > 0 : s.spec.grid.cards.length > 0;
        if (hasContent && !confirm('Switching visual type will discard the current content. Continue?')) return s;
        const spec: VisualSpec = kind === 'chain'
          ? { kind: 'chain', frames: [], code: null }
          : { kind: 'grid', grid: emptyGrid() };
        return { ...s, spec };
      });
      return { ...f, slides };
    });
  }

  // ── chain frames ──────────────────────────────────────────────────────

  addFrame(idx: number): void {
    this.updateChainSpec(idx, spec => ({ ...spec, frames: [...spec.frames, emptyFrame()] }));
  }

  removeFrame(idx: number, frameIdx: number): void {
    this.updateChainSpec(idx, spec => ({ ...spec, frames: spec.frames.filter((_, i) => i !== frameIdx) }));
  }

  moveFrame(idx: number, frameIdx: number, dir: -1 | 1): void {
    this.updateChainSpec(idx, spec => {
      const target = frameIdx + dir;
      if (target < 0 || target >= spec.frames.length) return spec;
      const frames = [...spec.frames];
      [frames[frameIdx], frames[target]] = [frames[target], frames[frameIdx]];
      return { ...spec, frames };
    });
  }

  updateFrameNote(idx: number, frameIdx: number, note: string): void {
    this.updateFrame(idx, frameIdx, frame => ({ ...frame, note }));
  }

  private updateFrame(idx: number, frameIdx: number, fn: (frame: VisualFrame) => VisualFrame): void {
    this.updateChainSpec(idx, spec => {
      const frames = spec.frames.map((fr, i) => i === frameIdx ? fn(fr) : fr);
      return { ...spec, frames };
    });
  }

  // ── chain items (within a frame) ──────────────────────────────────────

  addChainItem(idx: number, frameIdx: number, type: 'node' | 'null' | 'split'): void {
    this.updateFrame(idx, frameIdx, frame => {
      const item: ChainItem = type === 'node' ? emptyChainNode() : type === 'null' ? emptyChainNull() : emptyChainSplit();
      const items = [...frame.items, item];
      const connectors: ConnectorStyle[] = items.length > 1 ? [...frame.connectors, 'solid'] : frame.connectors;
      return { ...frame, items, connectors };
    });
  }

  removeChainItem(idx: number, frameIdx: number, itemIdx: number): void {
    this.updateFrame(idx, frameIdx, frame => {
      const items = frame.items.filter((_, i) => i !== itemIdx);
      const connectorToRemove = Math.min(itemIdx, frame.connectors.length - 1);
      const connectors = frame.connectors.filter((_, i) => i !== connectorToRemove);
      return { ...frame, items, connectors };
    });
  }

  moveChainItem(idx: number, frameIdx: number, itemIdx: number, dir: -1 | 1): void {
    this.updateFrame(idx, frameIdx, frame => {
      const target = itemIdx + dir;
      if (target < 0 || target >= frame.items.length) return frame;
      const items = [...frame.items];
      [items[itemIdx], items[target]] = [items[target], items[itemIdx]];
      return { ...frame, items };
    });
  }

  setItemType(idx: number, frameIdx: number, itemIdx: number, type: 'node' | 'null' | 'split'): void {
    this.updateFrame(idx, frameIdx, frame => {
      const items = frame.items.map((it, i) => {
        if (i !== itemIdx || it.type === type) return it;
        const pointerTag = it.pointerTag;
        if (type === 'node') return { ...emptyChainNode(), pointerTag };
        if (type === 'null') return { ...emptyChainNull(), pointerTag };
        return { ...emptyChainSplit(), pointerTag };
      });
      return { ...frame, items };
    });
  }

  updateChainNode(idx: number, frameIdx: number, itemIdx: number, patch: Partial<Omit<ChainNodeItem, 'type' | 'pointerTag'>>): void {
    this.updateFrame(idx, frameIdx, frame => {
      const items = frame.items.map((it, i) => i === itemIdx && it.type === 'node' ? { ...it, ...patch } : it);
      return { ...frame, items };
    });
  }

  updateChainNull(idx: number, frameIdx: number, itemIdx: number, patch: Partial<Omit<ChainNullItem, 'type' | 'pointerTag'>>): void {
    this.updateFrame(idx, frameIdx, frame => {
      const items = frame.items.map((it, i) => i === itemIdx && it.type === 'null' ? { ...it, ...patch } : it);
      return { ...frame, items };
    });
  }

  updateChainSplit(idx: number, frameIdx: number, itemIdx: number, patch: Partial<Omit<ChainSplitItem, 'type' | 'pointerTag'>>): void {
    this.updateFrame(idx, frameIdx, frame => {
      const items = frame.items.map((it, i) => i === itemIdx && it.type === 'split' ? { ...it, ...patch } : it);
      return { ...frame, items };
    });
  }

  setPointerTag(idx: number, frameIdx: number, itemIdx: number, tag: PointerTag | null): void {
    this.updateFrame(idx, frameIdx, frame => {
      const items = frame.items.map((it, i) => i === itemIdx ? { ...it, pointerTag: tag } as ChainItem : it);
      return { ...frame, items };
    });
  }

  setConnector(idx: number, frameIdx: number, connectorIdx: number, style: ConnectorStyle): void {
    this.updateFrame(idx, frameIdx, frame => {
      const connectors = frame.connectors.map((c, i) => i === connectorIdx ? style : c);
      return { ...frame, connectors };
    });
  }

  asNode(item: ChainItem): ChainNodeItem | null {
    return item.type === 'node' ? item : null;
  }

  asNull(item: ChainItem): ChainNullItem | null {
    return item.type === 'null' ? item : null;
  }

  asSplit(item: ChainItem): ChainSplitItem | null {
    return item.type === 'split' ? item : null;
  }

  // ── code snippet (chain kind only) ────────────────────────────────────

  addCodeSnippet(idx: number): void {
    this.updateChainSpec(idx, spec => ({ ...spec, code: emptyCodeSnippet() }));
  }

  removeCodeSnippet(idx: number): void {
    this.updateChainSpec(idx, spec => ({ ...spec, code: null }));
  }

  updateCodeSnippet(idx: number, patch: Partial<CodeSnippet>): void {
    this.updateChainSpec(idx, spec => ({ ...spec, code: spec.code ? { ...spec.code, ...patch } : spec.code }));
  }

  // ── comparison grid ────────────────────────────────────────────────────

  setGridColumns(idx: number, columns: 2 | 3 | 4): void {
    this.updateGridSpec(idx, grid => ({ ...grid, columns }));
  }

  addCard(idx: number): void {
    this.updateGridSpec(idx, grid => ({ ...grid, cards: [...grid.cards, emptyCard()] }));
  }

  removeCard(idx: number, cardIdx: number): void {
    this.updateGridSpec(idx, grid => ({ ...grid, cards: grid.cards.filter((_, i) => i !== cardIdx) }));
  }

  moveCard(idx: number, cardIdx: number, dir: -1 | 1): void {
    this.updateGridSpec(idx, grid => {
      const target = cardIdx + dir;
      if (target < 0 || target >= grid.cards.length) return grid;
      const cards = [...grid.cards];
      [cards[cardIdx], cards[target]] = [cards[target], cards[cardIdx]];
      return { ...grid, cards };
    });
  }

  updateCard(idx: number, cardIdx: number, patch: Partial<ComparisonCard>): void {
    this.updateGridSpec(idx, grid => {
      const cards = grid.cards.map((c, i) => i === cardIdx ? { ...c, ...patch } : c);
      return { ...grid, cards };
    });
  }

  // ── save / delete ─────────────────────────────────────────────────────

  save(): void {
    const f = this.form();
    if (!f.titleEn || !f.titleAr || !f.icon) {
      this.saveError.set('Icon, English title, and Arabic title are required.');
      return;
    }
    this.saving.set(true);
    this.saveError.set(null);

    const req: AdminLessonRequest = {
      ordinal: f.ordinal,
      icon: f.icon,
      titleEn: f.titleEn,
      titleAr: f.titleAr,
      descriptionEn: f.descriptionEn,
      descriptionAr: f.descriptionAr,
      slides: f.slides.map(toApiSlide),
    };

    const op = this.isEdit()
      ? this.svc.update(this.editingId()!, req)
      : this.svc.create(req);

    op.subscribe({
      next: saved => {
        this.lessons.update(list => {
          const next = this.isEdit() ? list.map(l => l.id === saved.id ? saved : l) : [...list, saved];
          return next.sort((a, b) => a.ordinal - b.ordinal);
        });
        this.saving.set(false);
        this.panelOpen.set(false);
      },
      error: err => {
        this.saveError.set(err.error?.message ?? 'Save failed.');
        this.saving.set(false);
      },
    });
  }

  confirmDelete(id: number): void { this.deleteConfirm.set(id); }
  cancelDelete(): void            { this.deleteConfirm.set(null); }

  doDelete(id: number): void {
    this.svc.delete(id).subscribe({
      next: () => { this.lessons.update(list => list.filter(l => l.id !== id)); this.deleteConfirm.set(null); },
      error: () => { this.error.set('Delete failed.'); this.deleteConfirm.set(null); },
    });
  }
}
