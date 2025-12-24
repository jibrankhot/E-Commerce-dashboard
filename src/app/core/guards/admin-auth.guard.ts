import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1️⃣ Not logged in
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // 2️⃣ Logged in but not ADMIN
  const user = authService.getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    authService.logout(); // clean logout
    return false;
  }

  // ✅ Authorized admin
  return true;
};
