import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { LessonsService } from '../../../core/services/lessons.service';
import { Lesson } from '../../../core/models/lesson.models';
import { LanguageService } from '../../../core/services/language.service';
import { Topbar } from '../../../shared/topbar/topbar';

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
}
