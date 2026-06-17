import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../constants/roles';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data?.['roles'] as Role[] | undefined) ?? [];

  if (allowedRoles.length === 0 || authService.hasAnyRole(allowedRoles)) {
    return true;
  }

  const user = authService.currentUser();
  if (!user) {
    return router.createUrlTree(['/login']);
  }

  void authService.redirectByRole(user.role);
  return false;
};
