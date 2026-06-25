import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE } from './api.config';
import { DashboardStats, PagedLogs, Period } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  stats(period: Period): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${API_BASE}/dashboard/stats`, {
      params: new HttpParams().set('period', period),
    });
  }

  logs(page: number, size: number, eventType?: string): Observable<PagedLogs> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);
    if (eventType) params = params.set('eventType', eventType);
    return this.http.get<PagedLogs>(`${API_BASE}/dashboard/logs`, { params });
  }
}
