import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {

  const auth = inject(AuthService);
  const router = inject(Router);

const allowedRoles = route.data['roles'] as string[];

  const userRole = auth.getUserRole();

  if (allowedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/citas']);
  return false;
};