import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';
import {
  AdminLessonDetail, AdminLessonRequest, AdminTaxonomy, TaxonomyRequest,
} from '../models/lesson-admin.models';

@Injectable({ providedIn: 'root' })
export class AdminLessonService {
  private http = inject(HttpClient);

  list(): Observable<AdminLessonDetail[]> {
    return this.http.get<AdminLessonDetail[]>(`${API_BASE}/admin/lessons`);
  }

  get(id: number): Observable<AdminLessonDetail> {
    return this.http.get<AdminLessonDetail>(`${API_BASE}/admin/lessons/${id}`);
  }

  create(req: AdminLessonRequest): Observable<AdminLessonDetail> {
    return this.http.post<AdminLessonDetail>(`${API_BASE}/admin/lessons`, req);
  }

  update(id: number, req: AdminLessonRequest): Observable<AdminLessonDetail> {
    return this.http.put<AdminLessonDetail>(`${API_BASE}/admin/lessons/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/admin/lessons/${id}`);
  }

  taxonomy(): Observable<AdminTaxonomy> {
    return this.http.get<AdminTaxonomy>(`${API_BASE}/admin/lessons/taxonomy`);
  }

  createSection(req: TaxonomyRequest): Observable<AdminTaxonomy> {
    return this.http.post<AdminTaxonomy>(`${API_BASE}/admin/lessons/taxonomy/sections`, req);
  }

  createCategory(req: TaxonomyRequest): Observable<AdminTaxonomy> {
    return this.http.post<AdminTaxonomy>(`${API_BASE}/admin/lessons/taxonomy/categories`, req);
  }
}
