// core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { AuthModalService } from '../../features/auth/services/auth-modal.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const authModal = inject(AuthModalService);

  const allowedRoles = route.data['roles'] as string[];
  const userRole = auth.getUserRole();


  if (!auth.isLoggedIn()) {
    authModal.openLogin(state.url);
    return false;
  }

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirigir según el rol
  if (auth.isAdmin()) {
    router.navigate(['/admin']);
  } else if (auth.isVeterinarian()) {
    router.navigate(['/veterinario']);
  } else {
    router.navigate(['/citas']);
  }
  return false;
};