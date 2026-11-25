import { Component, HostListener, signal, computed, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, switchMap, tap } from 'rxjs';

import { LessonsService } from '../../../core/services/lessons.service';
import { LessonDetail } from '../../../core/models/lesson.models';
import { LanguageService } from '../../../core/services/language.service';
import { VisualRenderer } from '../../../shared/visual-renderer/visual-renderer';

type CodeLang = 'cpp' | 'java';

@Component({
  selector: 'app-lesson-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink, VisualRenderer],
  templateUrl: './lesson-viewer.html',
  styleUrl: './lesson-viewer.css',
})
export class LessonViewer {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(LessonsService);
  lang = inject(LanguageService);

  lesson  = signal<LessonDetail | null>(null);
  loading = signal(true);
  error   = signal<string | null>(null);

  current  = signal(0);
  codeLang = signal<CodeLang>('cpp');

  slides        = computed(() => this.lesson()?.slides ?? []);
  slide         = computed(() => this.slides()[this.current()]);
  posInLesson   = computed(() => this.current() + 1);
  totalInLesson = computed(() => this.slides().length);
  progressPct   = computed(() => this.totalInLesson() ? (this.posInLesson() / this.totalInLesson()) * 100 : 0);
  slideIndices  = computed(() => this.slides().map((_, i) => i));
  isFirst       = computed(() => this.current() === 0);
  isLast        = computed(() => this.current() === this.totalInLesson() - 1);

  constructor() {
    // Text is localized by the server: refetch when the language changes, keeping the current slide.
    toObservable(this.lang.lang).pipe(
      tap(() => { if (!this.lesson()) this.loading.set(true); }),
      switchMap(lang => this.svc.get(this.route.snapshot.paramMap.get('slug') ?? '', lang).pipe(
        catchError(err => {
          this.error.set(this.lang.t(err?.status === 404 ? 'lvNotFound' : 'llCouldNotReach'));
          this.loading.set(false);
          return EMPTY;
        }),
      )),
      takeUntilDestroyed(),
    ).subscribe(l => {
      this.lesson.set(l);
      this.current.update(i => Math.min(i, Math.max(l.slides.length - 1, 0)));
      this.error.set(null);
      this.loading.set(false);
      this.canonicalizeUrl(l.slug);
    });
  }

  /** Old links used the numeric id; swap it for the slug without adding a history entry. */
  private canonicalizeUrl(slug: string): void {
    if (this.route.snapshot.paramMap.get('slug') !== slug) {
      void this.router.navigate(['/lessons', slug], { replaceUrl: true });
    }
  }

  goTo(index: number): void {
    if (index < 0 || index >= this.totalInLesson()) return;
    this.current.set(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  next(): void { this.goTo(this.current() + 1); }
  back(): void { this.goTo(this.current() - 1); }

  setCodeLang(l: CodeLang): void { this.codeLang.set(l); }

  slideNumberInLesson(i: number): number {
    return i + 1;
  }

  slideTitle(i: number): string {
    return this.slides()[i].title;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.back();
  }
}
