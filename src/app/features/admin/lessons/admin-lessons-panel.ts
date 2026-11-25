import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminLessonService } from '../../../core/services/admin-lesson.service';
import { LanguageService } from '../../../core/services/language.service';
import { Topbar } from '../../../shared/topbar/topbar';
import {
  AdminCategory, AdminLessonDetail, AdminLessonRequest, AdminSlide, AdminSlideText, AdminTaxonomy,
} from '../../../core/models/lesson-admin.models';
import type { SlideSpec } from '../../../core/models/slide-spec.models';
import { parseApiError } from '../../../core/utils/api-error';
import { VisualRenderer } from '../../../shared/visual-renderer/visual-renderer';
import {
  CardColorName, ChainItem, ChainNodeItem, ChainNullItem, ChainSplitItem, CodeSnippet, ComparisonCard, ComparisonGrid,
  ConnectorStyle, NodeColorName, PointerTag, VisualFrame, VisualSpec,
  emptyCard, emptyChainNode, emptyChainNull, emptyChainSplit, emptyCodeSnippet, emptyFrame, emptyGrid, emptyVisualSpec,
  renderVisualHtml, tryParseVisualSpec,
} from '../../../core/utils/visual-builder';
import { RichTextEditor } from '../../../shared/rich-text-editor/rich-text-editor';

type SlideTextField = 'kickerEn' | 'kickerAr' | 'titleEn' | 'titleAr' | 'visual' | 'specJson' | 'bodyEn' | 'bodyAr';
type VisualMode = 'builder' | 'raw' | 'json';
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
  visualMode: VisualMode;
  spec: VisualSpec;
  /** Pretty-printed spec for kinds the builder doesn't model (list, tree); edited as JSON. */
  specJson: string;
}

interface LessonForm {
  slug: string;
  ordinal: number;
  icon: string;
  published: boolean;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  sectionId: number | null;
  categoryId: number | null;
  slides: SlideForm[];
}

const EMPTY_TEXT: AdminSlideText = { kicker: '', title: '', body: '' };

function toSlideForm(s: AdminSlide): SlideForm {
  const en = s.translations.en ?? EMPTY_TEXT;
  const ar = s.translations.ar ?? EMPTY_TEXT;
  const base = {
    id: s.id, ordinal: s.ordinal ?? 0,
    kickerEn: en.kicker, kickerAr: ar.kicker, titleEn: en.title, titleAr: ar.title,
    bodyEn: en.body, bodyAr: ar.body,
  };
  const spec = s.spec;

  if (spec.kind === 'chain' || spec.kind === 'grid') {
    return { ...base, visual: '', visualMode: 'builder', spec, specJson: '' };
  }
  if (spec.kind === 'legacy-html') {
    // Try to reconstruct a builder spec from the HTML so it becomes editable; if the layout
    // isn't one the builder can represent, keep it as raw HTML untouched.
    const parsed = tryParseVisualSpec(spec.html);
    return parsed
      ? { ...base, visual: spec.html, visualMode: 'builder', spec: parsed, specJson: '' }
      : { ...base, visual: spec.html, visualMode: 'raw', spec: emptyVisualSpec(), specJson: '' };
  }
  return { ...base, visual: '', visualMode: 'json', spec: emptyVisualSpec(), specJson: JSON.stringify(spec, null, 2) };
}

/** @throws SyntaxError when the slide is in JSON mode and its text isn't valid JSON */
function toApiSlide(s: SlideForm): AdminSlide {
  const spec: SlideSpec =
    s.visualMode === 'builder' ? s.spec :
    s.visualMode === 'raw'     ? { kind: 'legacy-html', html: s.visual } :
    JSON.parse(s.specJson);
  return {
    id: s.id,
    spec,
    translations: {
      en: { kicker: s.kickerEn, title: s.titleEn, body: s.bodyEn },
      ar: { kicker: s.kickerAr, title: s.titleAr, body: s.bodyAr },
    },
  };
}

function emptySlideForm(ordinal: number): SlideForm {
  return {
    ordinal, kickerEn: '', kickerAr: '', titleEn: '', titleAr: '',
    visual: '', bodyEn: '', bodyAr: '',
    visualMode: 'builder', spec: emptyVisualSpec(), specJson: '',
  };
}

function emptyLessonForm(ordinal: number): LessonForm {
  return {
    slug: '', ordinal, icon: '', published: true, titleEn: '', titleAr: '', descriptionEn: '', descriptionAr: '',
    sectionId: null, categoryId: null, slides: [],
  };
}

@Component({
  selector: 'app-admin-lessons-panel',
  standalone: true,
  imports: [CommonModule, Topbar, RichTextEditor, VisualRenderer],
  templateUrl: './admin-lessons-panel.html',
  styleUrl: './admin-lessons-panel.css',
})
export class AdminLessonsPanel implements OnInit {
  private svc = inject(AdminLessonService);
  lang = inject(LanguageService);

  lessons = signal<AdminLessonDetail[]>([]);
  taxonomy = signal<AdminTaxonomy>({ sections: [] });
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

  /** Categories offered for the section currently chosen in the form. */
  categoryOptions = computed<AdminCategory[]>(() => {
    const id = this.form().sectionId;
    return this.taxonomy().sections.find(sec => sec.id === id)?.categories ?? [];
  });

  ngOnInit(): void {
    this.load();
    this.svc.taxonomy().subscribe({
      next: t => this.taxonomy.set(t),
      error: () => this.error.set('Could not load sections and categories.'),
    });
  }

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
      slug: l.slug,
      ordinal: l.ordinal,
      icon: l.icon,
      published: l.published,
      titleEn: l.translations.en?.title ?? '',
      titleAr: l.translations.ar?.title ?? '',
      descriptionEn: l.translations.en?.description ?? '',
      descriptionAr: l.translations.ar?.description ?? '',
      sectionId: l.sectionId,
      categoryId: l.categoryId,
      slides: l.slides.map(toSlideForm),
    });
    this.isEdit.set(true);
    this.editingId.set(l.id);
    this.saveError.set(null);
    this.expandedSlide.set(null);
    this.panelOpen.set(true);
  }

  /** Display helpers for the lesson table. */
  sectionName(l: AdminLessonDetail): string {
    return this.taxonomy().sections.find(sec => sec.id === l.sectionId)?.names.en ?? '';
  }

  categoryName(l: AdminLessonDetail): string {
    const section = this.taxonomy().sections.find(sec => sec.id === l.sectionId);
    return section?.categories.find(c => c.id === l.categoryId)?.names.en ?? '';
  }

  /** Changing the section invalidates a category that belonged to the previous one. */
  setSection(id: number | null): void {
    this.form.update(f => ({ ...f, sectionId: id, categoryId: null }));
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
    if (s.visualMode === 'json') return '{ } ' + (this.parseJsonSpec(s)?.kind ?? 'JSON');
    return s.spec.kind === 'grid' ? '▦ Grid' : '⛓ Chain';
  }

  updateSlide(idx: number, field: SlideTextField, value: string): void {
    this.form.update(f => {
      const slides = f.slides.map((s, i) => i === idx ? { ...s, [field]: value } : s);
      return { ...f, slides };
    });
  }

  setVisualMode(idx: number, mode: VisualMode): void {
    this.form.update(f => {
      const slides = f.slides.map((s, i) => {
        if (i !== idx || s.visualMode === mode) return s;
        if (mode === 'builder') {
          const hasContent = s.visualMode === 'raw' ? !!s.visual : !!s.specJson;
          if (hasContent && !confirm('Switching to the visual builder starts a fresh diagram — the current content will be replaced when you save. Continue?')) {
            return s;
          }
          return { ...s, visualMode: mode, spec: emptyVisualSpec() };
        }
        if (mode === 'raw') {
          return { ...s, visualMode: mode, visual: s.visualMode === 'builder' ? renderVisualHtml(s.spec) : s.visual };
        }
        // json: start from whatever the slide currently is
        const current: SlideSpec = s.visualMode === 'builder' ? s.spec : { kind: 'legacy-html', html: s.visual };
        return { ...s, visualMode: mode, specJson: JSON.stringify(current, null, 2) };
      });
      return { ...f, slides };
    });
  }

  /** Parsed JSON-mode spec for the live preview, or null while the text isn't valid JSON. */
  parseJsonSpec(s: SlideForm): SlideSpec | null {
    try {
      const v = JSON.parse(s.specJson);
      return v && typeof v === 'object' && typeof v.kind === 'string' ? v : null;
    } catch {
      return null;
    }
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
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.slug)) {
      this.saveError.set('Slug is required: lowercase letters, digits and dashes (e.g. insert-first).');
      return;
    }
    if (f.sectionId === null) {
      this.saveError.set('Choose a section.');
      return;
    }

    let slides: AdminSlide[];
    try {
      slides = f.slides.map(toApiSlide);
    } catch {
      this.saveError.set('A slide in JSON mode has invalid JSON.');
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);

    const req: AdminLessonRequest = {
      slug: f.slug,
      ordinal: f.ordinal,
      icon: f.icon,
      published: f.published,
      sectionId: f.sectionId,
      categoryId: f.categoryId,
      translations: {
        en: { title: f.titleEn, description: f.descriptionEn },
        ar: { title: f.titleAr, description: f.descriptionAr },
      },
      slides,
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
        this.saveError.set(parseApiError(err));
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
