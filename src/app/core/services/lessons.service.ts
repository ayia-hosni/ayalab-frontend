import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';
import { LessonDetail, LessonSummary } from '../models/lesson.models';

/** Reads lessons already localized by the server; pass the active language on every call. */
@Injectable({ providedIn: 'root' })
export class LessonsService {
  private http = inject(HttpClient);

  list(lang: string): Observable<LessonSummary[]> {
    return this.http.get<LessonSummary[]>(`${API_BASE}/lessons`, { params: this.params(lang) });
  }

  /** `slugOrId` accepts a numeric id so links from before slugs existed still resolve. */
  get(slugOrId: string, lang: string): Observable<LessonDetail> {
    return this.http.get<LessonDetail>(`${API_BASE}/lessons/${encodeURIComponent(slugOrId)}`, {
      params: this.params(lang),
    });
  }

  private params(lang: string): HttpParams {
    return new HttpParams().set('lang', lang);
  }
}
