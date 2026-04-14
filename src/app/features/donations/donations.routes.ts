import { Routes } from '@angular/router';

export const donationRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./donations.component')
        .then(m => m.DonationsComponent),
  },
  {
    path: 'confirmacion',
    loadComponent: () =>
      import('./pages/success/success.component')
        .then(m => m.SuccessComponent),
  },
  {
    path: 'cancelado',
    loadComponent: () =>
      import('./pages/cancelled/cancelled.component')
        .then(m => m.CancelledComponent),
  }
];