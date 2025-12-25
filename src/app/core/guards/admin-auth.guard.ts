import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ❌ Not logged in
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  // ❌ Logged in but not ADMIN
  const user = authService.getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    authService.logout();
    return router.createUrlTree(['/login']);
  }

  // ✅ Authorized admin
  return true;
};
