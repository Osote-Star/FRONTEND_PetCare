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
      import('./appointment-user/pages/ubicacion/ubicacion.component')
        .then(m => m.UbicacionComponent),
  },
   {
    path: 'servicioss',
    loadComponent: () =>
      import('./appointment-user/pages/servicioss/servicioss.component')
        .then(m => m.ServiciossComponent),
  },
  {
    path: 'datos-usuario',
    loadComponent: () =>
      import('./appointment-user/pages/datosusuario/datosusuario.component')
        .then(m => m.DatosusuarioComponent),
  },
  {
    path: 'datos-mascota',
    loadComponent: () =>
      import('./appointment-user/pages/datosperro/datosperro.component')
        .then(m => m.DatosperroComponent),
  },
  {
    path: 'confirmacion',
    loadComponent: () =>
      import('./appointment-user/pages/confirmacion/confirmacion.component')
        .then(m => m.ConfirmacionComponent),
    }
  
];
