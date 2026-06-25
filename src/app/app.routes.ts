import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/problem-list/problem-list').then((m) => m.ProblemList),
  },
  {
    path: 'problems/:slug',
    loadComponent: () =>
      import('./features/problem-detail/problem-detail').then((m) => m.ProblemDetail),
  },
  {
    path: 'payment',
    loadComponent: () =>
      import('./features/payment/payment-checkout/payment-checkout').then((m) => m.PaymentCheckout),
  },
  {
    path: 'payment/callback',
    loadComponent: () =>
      import('./features/payment/payment-callback/payment-callback').then((m) => m.PaymentCallback),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'support',
    loadComponent: () =>
      import('./features/support/support').then((m) => m.Support),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin-panel').then((m) => m.AdminPanel),
  },
  { path: '**', redirectTo: '' },
];
