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
  {
    path: 'admin/lessons',
    loadComponent: () =>
      import('./features/admin/lessons/admin-lessons-panel').then((m) => m.AdminLessonsPanel),
  },
  {
    path: 'lessons',
    loadComponent: () =>
      import('./features/lessons/lessons-list/lessons-list').then((m) => m.LessonsList),
  },
  {
    path: 'lessons/:lessonId',
    loadComponent: () =>
      import('./features/lessons/lesson-viewer/lesson-viewer').then((m) => m.LessonViewer),
  },
  { path: '**', redirectTo: '' },
];
