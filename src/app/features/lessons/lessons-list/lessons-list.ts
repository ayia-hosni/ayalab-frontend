import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LessonsService } from '../../../core/services/lessons.service';
import { Lesson } from '../../../core/models/lesson.models';

@Component({
  selector: 'app-lessons-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './lessons-list.html',
  styleUrl: './lessons-list.css',
})
export class LessonsList implements OnInit {
  private svc = inject(LessonsService);

  lessons = signal<Lesson[]>([]);
  loading = signal(true);
  error   = signal<string | null>(null);
  lang    = signal<'en' | 'ar'>('en');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc.list().subscribe({
      next: l => { this.lessons.set(l); this.loading.set(false); },
      error: () => { this.error.set('Could not reach the server.'); this.loading.set(false); },
    });
  }

  setLang(l: 'en' | 'ar'): void {
    this.lang.set(l);
  }
}
