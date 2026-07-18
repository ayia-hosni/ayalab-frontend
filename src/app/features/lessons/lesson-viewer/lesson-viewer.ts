import { Component, OnInit, HostListener, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { LessonsService } from '../../../core/services/lessons.service';
import { LessonWithSlides } from '../../../core/models/lesson.models';

type Lang = 'en' | 'ar';
type CodeLang = 'cpp' | 'java';

@Component({
  selector: 'app-lesson-viewer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lesson-viewer.html',
  styleUrl: './lesson-viewer.css',
})
export class LessonViewer implements OnInit {
  private route = inject(ActivatedRoute);
  private svc = inject(LessonsService);

  lesson  = signal<LessonWithSlides | null>(null);
  loading = signal(true);
  error   = signal<string | null>(null);

  current  = signal(0);
  lang     = signal<Lang>('en');
  codeLang = signal<CodeLang>('cpp');

  slides        = computed(() => this.lesson()?.slides ?? []);
  slide         = computed(() => this.slides()[this.current()]);
  posInLesson   = computed(() => this.current() + 1);
  totalInLesson = computed(() => this.slides().length);
  progressPct   = computed(() => this.totalInLesson() ? (this.posInLesson() / this.totalInLesson()) * 100 : 0);
  slideIndices  = computed(() => this.slides().map((_, i) => i));
  isFirst       = computed(() => this.current() === 0);
  isLast        = computed(() => this.current() === this.totalInLesson() - 1);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('lessonId'));
    if (!Number.isFinite(id)) {
      this.error.set('Lesson not found.');
      this.loading.set(false);
      return;
    }
    this.svc.get(id).subscribe({
      next: l => { this.lesson.set(l); this.current.set(0); this.loading.set(false); },
      error: () => { this.error.set('Could not reach the server.'); this.loading.set(false); },
    });
  }

  goTo(index: number): void {
    if (index < 0 || index >= this.totalInLesson()) return;
    this.current.set(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  next(): void { this.goTo(this.current() + 1); }
  back(): void { this.goTo(this.current() - 1); }

  setLang(l: Lang): void { this.lang.set(l); }
  setCodeLang(l: CodeLang): void { this.codeLang.set(l); }

  slideNumberInLesson(i: number): number {
    return i + 1;
  }

  slideTitle(i: number): string {
    const s = this.slides()[i];
    return this.lang() === 'en' ? s.title.en : s.title.ar;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.back();
  }
}
