import { Routes } from '@angular/router';
import { authGuard }       from './core/guards/auth.guard';
import { adminGuard }      from './core/guards/admin.guard';
import { superAdminGuard } from './core/guards/super-admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'sobre-nosotros',
    loadComponent: () =>
      import('./features/about/about.component').then(m => m.AboutComponent),
  },
  {
    path: 'citas',
    children: [
      {
        path: '',
        // 🌐 Sin guard — cualquier visitante puede agendar
        loadComponent: () =>
          import('./features/appointments/user/appointment-user/appointment-user.component')
            .then(m => m.AppointmentUserComponent),
      },
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        loadComponent: () =>
          import('./features/appointments/admin/appointment-admin/appointment-admin.component')
            .then(m => m.AppointmentAdminComponent),
      },
    ],
  },
  {
    path: 'presupuesto-cirugias',
    loadComponent: () =>
      import('./features/surgery-budget/surgery-budget.component')
        .then(m => m.SurgeryBudgetComponent),
  },
  {
    path: 'donaciones',
    loadComponent: () =>
      import('./features/donations/donations.component')
        .then(m => m.DonationsComponent),
  },
  {
    path: 'contacto',
    loadComponent: () =>
      import('./features/contact/contact.component')
        .then(m => m.ContactComponent),
  },
  // ── Auth ────────────────────────────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'registrar-admin',
    canActivate: [authGuard, superAdminGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];