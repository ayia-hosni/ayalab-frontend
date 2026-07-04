import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { AdminService } from '../../core/services/admin.service';
import { AdminProblemDetail, AdminProblemRequest, AdminTestCase } from '../../core/models/admin.models';

const LANGS = ['javascript', 'python', 'java'];
const VISUALIZER_TYPES = ['', 'POINTER_TRACE'];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function emptyRequest(): AdminProblemRequest {
  return {
    id: null, title: '', slug: '', acceptance: 0, difficulty: 'easy',
    tags: [], description: '', visualizerType: null,
    starterCode: { javascript: '', python: '', java: '' },
    available: false, testCases: [],
  };
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
  private svc = inject(AdminService);

  problems  = signal<AdminProblemDetail[]>([]);
  loading   = signal(true);
  saving    = signal(false);
  error     = signal<string | null>(null);
  saveError = signal<string | null>(null);

  panelOpen   = signal(false);
  isEdit      = signal(false);
  editingId   = signal<number | null>(null);

  form = signal<AdminProblemRequest>(emptyRequest());

  // UI state
  activeCodeLang = signal('javascript');
  tagInput       = signal('');
  deleteConfirm  = signal<number | null>(null);

  readonly LANGS          = LANGS;
  readonly DIFFICULTIES   = ['easy', 'medium', 'hard'];
  readonly VISUALIZERS    = VISUALIZER_TYPES;

  total     = computed(() => this.problems().length);
  available = computed(() => this.problems().filter(p => p.available).length);

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list().subscribe({
      next: p => { this.problems.set(p); this.loading.set(false); },
      error: () => { this.error.set('Could not reach the server.'); this.loading.set(false); },
    });
  }

  openCreate(): void {
    this.form.set(emptyRequest());
    this.isEdit.set(false);
    this.editingId.set(null);
    this.activeCodeLang.set('javascript');
    this.tagInput.set('');
    this.saveError.set(null);
    this.panelOpen.set(true);
  }

  openEdit(p: AdminProblemDetail): void {
    const starterCode = { javascript: '', python: '', java: '', ...p.starterCode };
    this.form.set({
      id: p.id, title: p.title, slug: p.slug, acceptance: p.acceptance,
      difficulty: p.difficulty, tags: [...p.tags], description: p.description ?? '',
      visualizerType: p.visualizerType ?? '', starterCode,
      available: p.available,
      testCases: p.testCases.map(tc => ({ ...tc })),
    });
    this.isEdit.set(true);
    this.editingId.set(p.id);
    this.activeCodeLang.set('javascript');
    this.tagInput.set('');
    this.saveError.set(null);
    this.panelOpen.set(true);
  }

  closePanel(): void { this.panelOpen.set(false); }

  // ── form helpers ─────────────────────────────────────────────────────────

  updateField<K extends keyof AdminProblemRequest>(key: K, value: AdminProblemRequest[K]): void {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  onTitleChange(title: string): void {
    this.form.update(f => ({
      ...f, title,
      slug: f.slug === slugify(f.title) || f.slug === '' ? slugify(title) : f.slug,
    }));
  }

  setCode(lang: string, code: string): void {
    this.form.update(f => ({ ...f, starterCode: { ...f.starterCode, [lang]: code } }));
  }

  addTag(): void {
    const t = this.tagInput().trim();
    if (!t) return;
    this.form.update(f => ({ ...f, tags: f.tags.includes(t) ? f.tags : [...f.tags, t] }));
    this.tagInput.set('');
  }

  removeTag(t: string): void {
    this.form.update(f => ({ ...f, tags: f.tags.filter(x => x !== t) }));
  }

  onTagKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter') { e.preventDefault(); this.addTag(); }
  }

  // ── test cases ────────────────────────────────────────────────────────────

  addTestCase(): void {
    this.form.update(f => {
      const next: AdminTestCase = {
        ordinal: (f.testCases.length + 1) as number,
        sample: false, inputJson: '', outputJson: '',
      };
      return { ...f, testCases: [...f.testCases, next] };
    });
  }

  removeTestCase(idx: number): void {
    this.form.update(f => {
      const cases = f.testCases.filter((_, i) => i !== idx)
        .map((tc, i) => ({ ...tc, ordinal: i + 1 }));
      return { ...f, testCases: cases };
    });
  }

  updateTestCase(idx: number, field: keyof AdminTestCase, value: string | boolean | number): void {
    this.form.update(f => {
      const cases = f.testCases.map((tc, i) => i === idx ? { ...tc, [field]: value } : tc);
      return { ...f, testCases: cases };
    });
  }

  // ── save / delete ─────────────────────────────────────────────────────────

  save(): void {
    const f = this.form();
    if (!f.id || !f.title || !f.slug) { this.saveError.set('ID, Title and Slug are required.'); return; }
    this.saving.set(true);
    this.saveError.set(null);

    const req: AdminProblemRequest = {
      ...f,
      visualizerType: f.visualizerType || null,
      tags: f.tags,
    };

    const op = this.isEdit()
      ? this.svc.update(f.id, req)
      : this.svc.create(req);

    op.subscribe({
      next: saved => {
        this.problems.update(list => {
          if (this.isEdit()) return list.map(p => p.id === saved.id ? saved : p);
          return [...list, saved].sort((a, b) => a.id - b.id);
        });
        this.saving.set(false);
        this.panelOpen.set(false);
      },
      error: err => {
        const msg = err.status === 409 ? `Problem #${f.id} already exists.`
                  : err.error?.message ?? 'Save failed.';
        this.saveError.set(msg);
        this.saving.set(false);
      },
    });
  }

  confirmDelete(id: number): void { this.deleteConfirm.set(id); }
  cancelDelete(): void            { this.deleteConfirm.set(null); }

  doDelete(id: number): void {
    this.svc.delete(id).subscribe({
      next: () => { this.problems.update(list => list.filter(p => p.id !== id)); this.deleteConfirm.set(null); },
      error: () => { this.error.set('Delete failed.'); this.deleteConfirm.set(null); },
    });
  }

  diffColor(d: string): string {
    return d === 'easy' ? 'var(--easy)' : d === 'medium' ? 'var(--medium)' : 'var(--hard)';
  }
}
