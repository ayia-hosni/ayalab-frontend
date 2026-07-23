import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { parseApiError } from '../../core/utils/api-error';

import { PaymentService } from '../../core/services/payment.service';
import { PaymentMethodType } from '../../core/models/payment.models';
import { LanguageService } from '../../core/services/language.service';
import { Topbar } from '../../shared/topbar/topbar';

interface Tier {
  cups: number;
  label: string;
  amountCents: number;
  price: string;
}

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, FormsModule, Topbar],
  templateUrl: './support.html',
  styleUrl: './support.css',
})
export class Support {
  private service = inject(PaymentService);
  private router = inject(Router);
  lang = inject(LanguageService);

  readonly tiers: Tier[] = [
    { cups: 1, label: '☕',       amountCents: 2900,  price: 'EGP 29'  },
    { cups: 3, label: '☕☕☕',   amountCents: 7900,  price: 'EGP 79'  },
    { cups: 5, label: '☕×5',     amountCents: 14900, price: 'EGP 149' },
  ];

  readonly methods = [
    { value: 'CARD' as PaymentMethodType,   labelKey: 'supMethodCard' as const,   icon: '💳' },
    { value: 'WALLET' as PaymentMethodType, labelKey: 'supMethodWallet' as const, icon: '📱' },
    { value: 'KIOSK' as PaymentMethodType,  labelKey: 'supMethodKiosk' as const,  icon: '🏪' },
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
      this.error.set(this.lang.t('supErrFillNameEmail'));
      return;
    }
    if (this.method() === 'WALLET' && !this.phoneNumber) {
      this.error.set(this.lang.t('supErrPhoneRequired'));
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
