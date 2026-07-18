import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE } from './api.config';
import { Lesson, LessonWithSlides, Slide } from '../models/lesson.models';

interface LessonSummaryDto {
  id: number;
  ordinal: number;
  icon: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  slideCount: number;
}

interface SlideDto {
  id: number;
  ordinal: number;
  kickerEn: string;
  kickerAr: string;
  titleEn: string;
  titleAr: string;
  visual: string;
  bodyEn: string;
  bodyAr: string;
}

interface LessonDetailDto extends LessonSummaryDto {
  slides: SlideDto[];
}

function toLesson(d: LessonSummaryDto): Lesson {
  return {
    id: d.id,
    icon: d.icon,
    title: { en: d.titleEn, ar: d.titleAr },
    description: { en: d.descriptionEn, ar: d.descriptionAr },
    slideCount: d.slideCount,
  };
}

function toSlide(s: SlideDto): Slide {
  return {
    id: s.id,
    kicker: { en: s.kickerEn, ar: s.kickerAr },
    title: { en: s.titleEn, ar: s.titleAr },
    visual: s.visual,
    body: { en: s.bodyEn, ar: s.bodyAr },
  };
}

@Injectable({ providedIn: 'root' })
export class LessonsService {
  private http = inject(HttpClient);

  list(): Observable<Lesson[]> {
    return this.http.get<LessonSummaryDto[]>(`${API_BASE}/lessons`).pipe(
      map(list => list.map(toLesson)),
    );
  }

  get(id: number): Observable<LessonWithSlides> {
    return this.http.get<LessonDetailDto>(`${API_BASE}/lessons/${id}`).pipe(
      map(d => ({ ...toLesson(d), slides: d.slides.map(toSlide) })),
    );
  }
}
