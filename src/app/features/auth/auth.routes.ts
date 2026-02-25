import { Routes } from '@angular/router';
import { superAdminGuard } from '../../core/guards/super-admin.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'registrar-admin',
    canActivate: [superAdminGuard],          // ← solo superadmin llega aquí
    loadComponent: () =>
      import('./register/register.component').then(m => m.RegisterComponent),
  },
];