import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from './api.config';
import { AdminProblemDetail, AdminProblemRequest } from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  list(): Observable<AdminProblemDetail[]> {
    return this.http.get<AdminProblemDetail[]>(`${API_BASE}/admin/problems`);
  }

  get(id: number): Observable<AdminProblemDetail> {
    return this.http.get<AdminProblemDetail>(`${API_BASE}/admin/problems/${id}`);
  }

  create(req: AdminProblemRequest): Observable<AdminProblemDetail> {
    return this.http.post<AdminProblemDetail>(`${API_BASE}/admin/problems`, req);
  }

  update(id: number, req: AdminProblemRequest): Observable<AdminProblemDetail> {
    return this.http.put<AdminProblemDetail>(`${API_BASE}/admin/problems/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE}/admin/problems/${id}`);
  }
}
