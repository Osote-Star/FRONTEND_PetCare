import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
export const roleGuard: CanActivateFn = (route, state) => {

  const auth = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as number[];

  const userRole = auth.getRole();


  if (!userRole) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRoles.includes(userRole)) {
    return true;
  }

  router.navigate(['/no-autorizado']);
  return false;
};
