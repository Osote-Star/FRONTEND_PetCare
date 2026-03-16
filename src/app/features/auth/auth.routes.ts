import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';


export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'registrar-admin',
    canActivate: [authGuard, roleGuard], 
    data:{roles:[1]},         // ← solo superadmin llega aquí
    loadComponent: () =>
      import('./register/register.component').then(m => m.RegisterComponent),
  },
];