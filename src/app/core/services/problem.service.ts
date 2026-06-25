import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE } from './api.config';
import {
  ProblemSummary,
  ProblemDetail,
  ProblemFilters,
  SubmitRequest,
  SubmitResult,
} from '../models/problem.models';

@Injectable({ providedIn: 'root' })
export class ProblemService {
  private http = inject(HttpClient);

  list(filters: ProblemFilters): Observable<ProblemSummary[]> {
    let params = new HttpParams();
    if (filters.difficulty && filters.difficulty !== 'all') {
      params = params.set('difficulty', filters.difficulty);
    }
    if (filters.status && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.tag) {
      params = params.set('tag', filters.tag);
    }
    return this.http.get<ProblemSummary[]>(`${API_BASE}/problems`, { params });
  }

  tags(): Observable<string[]> {
    return this.http.get<string[]>(`${API_BASE}/problems/tags`);
  }

  get(slug: string): Observable<ProblemDetail> {
    return this.http.get<ProblemDetail>(`${API_BASE}/problems/${slug}`);
  }

  submit(slug: string, request: SubmitRequest): Observable<SubmitResult> {
    return this.http.post<SubmitResult>(`${API_BASE}/problems/${slug}/submit`, request);
  }
}
