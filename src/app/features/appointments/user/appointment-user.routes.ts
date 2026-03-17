import { Routes } from '@angular/router';
import { AppointmentUserComponent } from './appointment-user/appointment-user.component';

export const appointmentUserRoutes: Routes = [
  {
    path: '',
    component: AppointmentUserComponent,  // ← Componente contenedor
  },
    {
    path: 'ubicacion',
    loadComponent: () =>
      import('./appointment-user/pages/clinic/clinic.component')
        .then(m => m.ClinicComponent),
  },
   {
    path: 'servicioss',
    loadComponent: () =>
      import('./appointment-user/pages/servicioss/servicioss.component')
        .then(m => m.ServiciossComponent),
  },
  
  {
    path: 'datacites',
    loadComponent: () =>
      import('./appointment-user/pages/datacite/datacite.component')
        .then(m => m.dataciteComponent),
  },
  {
    path: 'confirmacion',
    loadComponent: () =>
      import('./appointment-user/pages/confirmacion/confirmacion.component')
        .then(m => m.ConfirmacionComponent),
    }
  
];
