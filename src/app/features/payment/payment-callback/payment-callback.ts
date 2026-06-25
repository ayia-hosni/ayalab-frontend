import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { interval, switchMap, takeWhile } from 'rxjs';

import { PaymentService } from '../../../core/services/payment.service';
import { PaymentOrderStatus } from '../../../core/models/payment.models';

@Component({
  selector: 'app-payment-callback',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-callback.html',
  styleUrl: './payment-callback.css',
})
export class PaymentCallback implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(PaymentService);

  status = signal<PaymentOrderStatus | null>(null);
  billReference = signal<string | null>(null);
  ref = signal<string | null>(null);
  readonly currentYear = new Date().getFullYear();

  ngOnInit(): void {
    const ref = this.route.snapshot.queryParamMap.get('ref');
    const bill = this.route.snapshot.queryParamMap.get('bill');

    this.ref.set(ref);

    if (bill) {
      this.billReference.set(bill);
      this.status.set('PENDING');
      return;
    }

    if (ref) {
      this.pollStatus(ref);
    }
  }

  private pollStatus(ref: string): void {
    interval(3000).pipe(
      switchMap(() => this.service.getStatus(ref)),
      takeWhile((res) => res.status === 'PENDING', true),
    ).subscribe({
      next: (res) => this.status.set(res.status),
    });
  }
}
