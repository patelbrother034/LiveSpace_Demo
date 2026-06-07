import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    const user = auth.currentUser();
    // Redirect based on role
    return router.parseUrl('/' + (user?.role.toLowerCase() || '') + '/dashboard');
  }
  return true;
};