import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { LessonsService } from '../../../core/services/lessons.service';
import { BilingualText, Lesson } from '../../../core/models/lesson.models';
import { LanguageService } from '../../../core/services/language.service';
import { Topbar } from '../../../shared/topbar/topbar';

interface LessonSection {
  key: string;
  section: BilingualText;
  lessons: Lesson[];
  categories: BilingualText[];
}

@Component({
  selector: 'app-lessons-list',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './lessons-list.html',
  styleUrl: './lessons-list.css',
})
export class LessonsList implements OnInit {
  private svc = inject(LessonsService);
  lang = inject(LanguageService);

  lessons = signal<Lesson[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);

  /** Active category filter per section, keyed by section.en; null/absent = show all. */
  private activeCategory = signal<Record<string, string | null>>({});

  sections = computed<LessonSection[]>(() => {
    const bySection = new Map<string, LessonSection>();
    for (const l of this.lessons()) {
      const key = l.section.en;
      if (!bySection.has(key)) {
        bySection.set(key, { key, section: l.section, lessons: [], categories: [] });
      }
      const group = bySection.get(key)!;
      group.lessons.push(l);
      if (l.category && !group.categories.some(c => c.en === l.category!.en)) {
        group.categories.push(l.category);
      }
    }
    return [...bySection.values()];
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list().subscribe({
      next: l => { this.lessons.set(l); this.loading.set(false); },
      error: () => { this.error.set(this.lang.t('llCouldNotReach')); this.loading.set(false); },
    });
  }

  visibleLessons(section: LessonSection): Lesson[] {
    const cat = this.activeCategory()[section.key] ?? null;
    if (!cat) return section.lessons;
    return section.lessons.filter(l => l.category?.en === cat);
  }

  activeCategoryOf(section: LessonSection): string | null {
    return this.activeCategory()[section.key] ?? null;
  }

  setCategory(section: LessonSection, categoryEn: string | null): void {
    this.activeCategory.update(m => ({ ...m, [section.key]: categoryEn }));
  }
}
