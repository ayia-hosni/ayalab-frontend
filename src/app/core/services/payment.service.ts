import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE } from './api.config';
import { InitiatePaymentRequest, InitiatePaymentResponse } from '../models/payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  initiate(request: InitiatePaymentRequest): Observable<InitiatePaymentResponse> {
    return this.http.post<InitiatePaymentResponse>(`${API_BASE}/payments/initiate`, request);
  }

  getStatus(ref: string): Observable<InitiatePaymentResponse> {
    return this.http.get<InitiatePaymentResponse>(`${API_BASE}/payments/${ref}/status`);
  }
}
