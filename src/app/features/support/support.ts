import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { parseApiError } from '../../core/utils/api-error';

import { PaymentService } from '../../core/services/payment.service';
import { PaymentMethodType } from '../../core/models/payment.models';

interface Tier {
  cups: number;
  label: string;
  amountCents: number;
  price: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './support.html',
  styleUrl: './support.css',
})
export class Support {
  private service = inject(PaymentService);
  private router = inject(Router);

  readonly tiers: Tier[] = [
    { cups: 1, label: '☕',       amountCents: 2900,  price: 'EGP 29'  },
    { cups: 3, label: '☕☕☕',   amountCents: 7900,  price: 'EGP 79'  },
    { cups: 5, label: '☕×5',     amountCents: 14900, price: 'EGP 149' },
  ];

  readonly methods: { value: PaymentMethodType; label: string; icon: string }[] = [
    { value: 'CARD',   label: 'Card',          icon: '💳' },
    { value: 'WALLET', label: 'Mobile Wallet', icon: '📱' },
    { value: 'KIOSK',  label: 'Kiosk (Aman)',  icon: '🏪' },
  ];

  selectedTier = signal<Tier>(this.tiers[0]);
  method = signal<PaymentMethodType>('CARD');
  loading = signal(false);
  error = signal<string | null>(null);

  firstName = '';
  lastName = '';
  email = '';
  phoneNumber = '';

  get showPhone(): boolean {
    return this.method() === 'WALLET';
  }

  selectTier(tier: Tier): void {
    this.selectedTier.set(tier);
  }

  selectMethod(m: PaymentMethodType): void {
    this.method.set(m);
    this.error.set(null);
  }

  pay(): void {
    if (!this.firstName || !this.lastName || !this.email) {
      this.error.set('Please fill in your name and email.');
      return;
    }
    if (this.method() === 'WALLET' && !this.phoneNumber) {
      this.error.set('Phone number is required for mobile wallet.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const tier = this.selectedTier();

    this.service.initiate({
      method: this.method(),
      amountCents: tier.amountCents,
      currency: 'EGP',
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
