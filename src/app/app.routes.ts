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

  // 📌 MIS CITAS — cliente
  {
    path: 'mis-citas',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['cliente'], role: 'cliente' },
    loadComponent: () =>
      import('./features/appointments/user/appointment-list/appointment-list.component')
        .then(m => m.AppointmentListComponent)
  },
 
  // 📌 MIS PACIENTES — veterinario (mismo componente, distinto rol)
  {
    path: 'mis-pacientes',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['veterinario'], role: 'veterinario' },
    loadComponent: () =>
      import('./features/appointments/user/appointment-list/appointment-list.component')
        .then(m => m.AppointmentListComponent)
  },

    // 📌 CITAS DE MI CLÍNICA — admin (mismo componente, distinto rol)
    {
      path: 'admin-citas',
      canActivate: [authGuard, roleGuard],
      data: { roles: ['admin'], role: 'admin' },
      loadComponent: () =>
        import('./features/appointments/user/appointment-list/appointment-list.component')
          .then(m => m.AppointmentListComponent)
    },

  {
    path: 'presupuesto-cirugias',
    loadComponent: () =>
      import('./features/surgery-budget/surgery-budget.component')
        .then(m => m.SurgeryBudgetComponent),
  },
  {
  path: 'donaciones',
  loadChildren: () =>
    import('./features/donations/donations.routes')
      .then(m => m.donationRoutes)
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
  //Registrar veterinarios
    {
      path: 'register-vet',
      canActivate: [authGuard, roleGuard], 
    data:{roles:['admin']},
    loadComponent: () =>
      import('./features/register-vet/register-vet.component')
        .then(m => m.RegisterVetComponent)
    },
    //AdmClinicas
    {
      path: 'adm-clinics',
      canActivate: [authGuard, roleGuard], 
    data:{roles:['admin']},
    loadComponent: () =>
      import('./features/adm-clinics/adm-clinics.component')
        .then(m => m.AdmClinicsComponent)
    },
    //Administrar usuarios
    {
      path: 'admin-usu',
      canActivate: [authGuard, roleGuard], 
    data:{roles:['admin']},
    loadComponent: () =>
      import('./features/users/admin-users/admin-users.component')
        .then(m => m.AdminUsersComponent)
    },
    //reset password
    {
  path: 'forgot-password',
  loadComponent: () =>
    import('./features/auth/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent),
    },
    {
      path: 'reset-password',
      loadComponent: () =>
        import('./features/auth/reset-password/reset-password.component')
          .then(m => m.ResetPasswordComponent),
    },
  {
    path: '**',
    redirectTo: '',
  },
];