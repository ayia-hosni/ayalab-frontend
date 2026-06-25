import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { parseApiError } from '../../../core/utils/api-error';

import { PaymentService } from '../../../core/services/payment.service';
import { PaymentMethodType } from '../../../core/models/payment.models';

@Component({
  selector: 'app-payment-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-checkout.html',
  styleUrl: './payment-checkout.css',
})
export class PaymentCheckout {
  private service = inject(PaymentService);
  private router = inject(Router);

  method = signal<PaymentMethodType>('CARD');
  loading = signal(false);
  error = signal<string | null>(null);

  firstName = '';
  lastName = '';
  email = '';
  phoneNumber = '';

  readonly PLAN_AMOUNT_CENTS = 9900;
  readonly CURRENCY = 'EGP';
  readonly currentYear = new Date().getFullYear();

  readonly methods: { value: PaymentMethodType; label: string; icon: string; hint: string }[] = [
    { value: 'CARD',   label: 'Credit / Debit Card', icon: '💳', hint: 'Pay securely via Paymob iframe' },
    { value: 'WALLET', label: 'Mobile Wallet',        icon: '📱', hint: 'Vodafone Cash · Etisalat · Orange' },
    { value: 'KIOSK',  label: 'Kiosk (Aman)',         icon: '🏪', hint: 'Pay at the nearest Aman or Masary outlet' },
  ];

  select(m: PaymentMethodType): void {
    this.method.set(m);
    this.error.set(null);
  }

  get showPhone(): boolean {
    return this.method() === 'WALLET';
  }

  pay(): void {
    if (!this.firstName || !this.lastName || !this.email) {
      this.error.set('Please fill in all required fields.');
      return;
    }
    if (this.method() === 'WALLET' && !this.phoneNumber) {
      this.error.set('Phone number is required for mobile wallet payments.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.service.initiate({
      method: this.method(),
      amountCents: this.PLAN_AMOUNT_CENTS,
      currency: this.CURRENCY,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber || undefined,
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.method === 'KIOSK') {
          this.router.navigate(['/payment/callback'], {
            queryParams: { ref: res.ref, bill: res.billReference },
          });
        } else if (res.redirectUrl) {
          window.location.href = res.redirectUrl;
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(parseApiError(err));
      },
    });
  }
}
