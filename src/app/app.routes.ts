import { Routes } from '@angular/router';
import { authGuard }       from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';


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

  // 📌 MÓDULO DE CITAS - CORREGIDO
  {
    path: 'citas',
    loadChildren: () => 
      import('./features/appointments/user/appointment-user.routes')
        .then(m => m.appointmentUserRoutes)
  },

  // 📌 ADMIN DE CITAS - RUTA SEPARADA (no va como hijo de /citas)
  {
    path: 'citas/admin',
     canActivate: [authGuard, roleGuard], 
    data:{roles:[1, 2]},
    loadComponent: () =>
      import('./features/appointments/admin/appointment-admin/appointment-admin.component')
        .then(m => m.AppointmentAdminComponent)
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

  // AUTH
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    //canActivate: [authGuard, superAdminGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent),
  },

  {
    path: '**',
    redirectTo: '',
  },
];