// core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { AuthModalService } from '../../features/auth/services/auth-modal.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const authModal = inject(AuthModalService);
  

  
  if (auth.isLoggedIn()) {
    return true;
  }
  
  authModal.openLogin(state.url);
  return false;
};