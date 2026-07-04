import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { LINKED_LIST_LESSONS } from '../../../core/data/linked-list-lessons.data';
import { Lesson } from '../../../core/models/lesson.models';

@Component({
  selector: 'app-lessons-list',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './lessons-list.html',
  styleUrl: './lessons-list.css',
})
export class LessonsList {
  readonly lessons: Lesson[] = LINKED_LIST_LESSONS;
  lang = signal<'en' | 'ar'>('en');

  setLang(l: 'en' | 'ar'): void {
    this.lang.set(l);
  }

  slideCount(l: Lesson): number {
    return l.end - l.start;
  }
}
