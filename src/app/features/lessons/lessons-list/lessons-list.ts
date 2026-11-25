import { Component, computed, signal, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { LessonsService } from '../../../core/services/lessons.service';
import { LessonSummary, TaxonomyRef } from '../../../core/models/lesson.models';
import { LanguageService } from '../../../core/services/language.service';
import { Topbar } from '../../../shared/topbar/topbar';
import { switchMap, tap, catchError, EMPTY } from 'rxjs';

interface CategoryGroup {
  key: string;
  category: TaxonomyRef;
  lessons: LessonSummary[];
}

interface LessonSection {
  key: string;
  section: TaxonomyRef;
  lessons: LessonSummary[];
  /** Lessons with no category, shown as direct rows under the section. */
  uncategorized: LessonSummary[];
  /** Lessons grouped by category, shown as nested sub-branches. */
  categoryGroups: CategoryGroup[];
}

@Component({
  selector: 'app-lessons-list',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './lessons-list.html',
  styleUrl: './lessons-list.css',
})
export class LessonsList {
  private svc = inject(LessonsService);
  lang = inject(LanguageService);

  lessons = signal<LessonSummary[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);

  private expandedSections = signal<Set<string>>(new Set());
  private expandedCategories = signal<Set<string>>(new Set());

  sections = computed<LessonSection[]>(() => {
    const bySection = new Map<string, LessonSection>();
    for (const l of this.lessons()) {
      const key = l.section.slug;
      if (!bySection.has(key)) {
        bySection.set(key, { key, section: l.section, lessons: [], uncategorized: [], categoryGroups: [] });
      }
      const group = bySection.get(key)!;
      group.lessons.push(l);
      if (l.category) {
        let cg = group.categoryGroups.find(c => c.category.slug === l.category!.slug);
        if (!cg) {
          cg = { key: `${key}::${l.category.slug}`, category: l.category, lessons: [] };
          group.categoryGroups.push(cg);
        }
        cg.lessons.push(l);
      } else {
        group.uncategorized.push(l);
      }
    }
    return [...bySection.values()];
  });

  /** Section-wide sequential lesson numbers (uncategorized rows first, then each category in order). */
  private lessonNumbers = computed<Map<number, number>>(() => {
    const numbers = new Map<number, number>();
    for (const section of this.sections()) {
      let n = 1;
      for (const l of section.uncategorized) numbers.set(l.id, n++);
      for (const cg of section.categoryGroups) {
        for (const l of cg.lessons) numbers.set(l.id, n++);
      }
    }
    return numbers;
  });

  private reload = signal(0);

  constructor() {
    // Content is localized by the server, so a language switch (or a retry) refetches the list.
    toObservable(computed(() => [this.lang.lang(), this.reload()] as const)).pipe(
      tap(() => { this.loading.set(true); this.error.set(null); }),
      switchMap(([lang]) => this.svc.list(lang).pipe(
        catchError(() => {
          this.error.set(this.lang.t('llCouldNotReach'));
          this.loading.set(false);
          return EMPTY;
        }),
      )),
      takeUntilDestroyed(),
    ).subscribe(l => {
      const firstLoad = this.lessons().length === 0;
      this.lessons.set(l);
      this.loading.set(false);
      if (firstLoad) this.expandFirstBranch();
    });
  }

  load(): void {
    this.reload.update(n => n + 1);
  }

  /** Opens the first section (and its first category, if any) so the tree isn't fully collapsed on load. */
  private expandFirstBranch(): void {
    const first = this.sections()[0];
    if (!first) return;
    this.expandedSections.set(new Set([first.key]));
    const firstCat = first.categoryGroups[0];
    if (firstCat) this.expandedCategories.set(new Set([firstCat.key]));
  }

  lessonNumber(l: LessonSummary): number {
    return this.lessonNumbers().get(l.id) ?? 0;
  }

  lessonCountLabel(count: number): string {
    if (this.lang.lang() === 'ar') return count === 1 ? 'درس واحد' : `${count} دروس`;
    return count === 1 ? '1 lesson' : `${count} lessons`;
  }

  isSectionExpanded(section: LessonSection): boolean {
    return this.expandedSections().has(section.key);
  }

  toggleSection(section: LessonSection): void {
    this.expandedSections.update(set => {
      const next = new Set(set);
      next.has(section.key) ? next.delete(section.key) : next.add(section.key);
      return next;
    });
  }

  isCategoryExpanded(cg: CategoryGroup): boolean {
    return this.expandedCategories().has(cg.key);
  }

  toggleCategory(cg: CategoryGroup): void {
    this.expandedCategories.update(set => {
      const next = new Set(set);
      next.has(cg.key) ? next.delete(cg.key) : next.add(cg.key);
      return next;
    });
  }
}
