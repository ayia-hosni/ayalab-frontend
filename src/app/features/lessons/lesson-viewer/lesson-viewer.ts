import { Component, OnInit, HostListener, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { LINKED_LIST_LESSONS, LINKED_LIST_SLIDES } from '../../../core/data/linked-list-lessons.data';

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

  readonly lessons = LINKED_LIST_LESSONS;
  readonly slides = LINKED_LIST_SLIDES;

  lessonIdx = signal(0);
  current = signal(0);
  lang = signal<Lang>('en');
  codeLang = signal<CodeLang>('cpp');

  lesson = computed(() => this.lessons[this.lessonIdx()]);
  slide = computed(() => this.slides[this.current()]);
  posInLesson = computed(() => this.current() - this.lesson().start + 1);
  totalInLesson = computed(() => this.lesson().end - this.lesson().start);
  progressPct = computed(() => (this.posInLesson() / this.totalInLesson()) * 100);
  slideIndices = computed(() => {
    const l = this.lesson();
    return Array.from({ length: l.end - l.start }, (_, i) => l.start + i);
  });
  isFirst = computed(() => this.current() === this.lesson().start);
  isLast = computed(() => this.current() === this.lesson().end - 1);

  ngOnInit(): void {
    const idxParam = Number(this.route.snapshot.paramMap.get('lessonId'));
    const idx = Number.isFinite(idxParam) && this.lessons[idxParam] ? idxParam : 0;
    this.lessonIdx.set(idx);
    this.current.set(this.lessons[idx].start);
  }

  goTo(index: number): void {
    const l = this.lesson();
    if (index < l.start || index >= l.end) return;
    this.current.set(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  next(): void { this.goTo(this.current() + 1); }
  back(): void { this.goTo(this.current() - 1); }

  setLang(l: Lang): void { this.lang.set(l); }
  setCodeLang(l: CodeLang): void { this.codeLang.set(l); }

  slideNumberInLesson(i: number): number {
    return i - this.lesson().start + 1;
  }

  slideTitle(i: number): string {
    const s = this.slides[i];
    return this.lang() === 'en' ? s.title.en : s.title.ar;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.back();
  }
}
