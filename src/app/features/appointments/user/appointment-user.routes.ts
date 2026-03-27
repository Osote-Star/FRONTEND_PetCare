// features/appointments/user/appointment-user.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../../core/guards/auth.guard';
import { AppointmentUserComponent } from './appointment-user/appointment-user.component';

export const appointmentUserRoutes: Routes = [
  {
    path: '',
    component: AppointmentUserComponent,
  },
  {
    path: 'ubicacion',
    canActivate: [authGuard], // ← PROTEGER
    loadComponent: () =>
      import('./appointment-user/pages/clinic/clinic.component')
        .then(m => m.ClinicComponent),
  },
  {
    path: 'servicioss',
    canActivate: [authGuard], // ← PROTEGER
    loadComponent: () =>
      import('./appointment-user/pages/servicioss/servicioss.component')
        .then(m => m.ServiciossComponent),
  },
  {
    path: 'datacites',
    canActivate: [authGuard], // ← PROTEGER
    loadComponent: () =>
      import('./appointment-user/pages/datacite/datacite.component')
        .then(m => m.DataciteComponent), // ← CORREGIR: DataciteComponent (con D mayúscula)
  },
  {
    path: 'confirmacion',
    canActivate: [authGuard], // ← PROTEGER
    loadComponent: () =>
      import('./appointment-user/pages/confirmacion/confirmacion.component')
        .then(m => m.ConfirmacionComponent),
  }
];