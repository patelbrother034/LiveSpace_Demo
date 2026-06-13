import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  // Allow access to role selection even if logged in, to support workspace switching
  if (state.url.includes('/role-select')) {
    return true;
  }

  if (auth.isLoggedIn()) {
    const user = auth.currentUser();
    // Redirect based on role
    return router.parseUrl('/' + (user?.role.toLowerCase() || '') + '/dashboard');
  }
  return true;
};