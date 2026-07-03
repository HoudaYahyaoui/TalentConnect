import { inject } from '@angular/core';
import { CanMatchFn, CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * CANMATCH AUTH GUARD
 * Vérifie l'authentification avant de charger un module
 */
export const authGuard: CanMatchFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};

/**
 * CANACTIVATE AUTH GUARD
 * Vérifie l'authentification pour les routes directes
 */
export const authActivateGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], {
    queryParams: { returnUrl: state.url },
  });
};

/**
 * ROLE GUARD
 * Vérifie que l'utilisateur a l'un des rôles requis
 * Usage: {path: 'admin', component: AdminComponent, canActivate: [roleGuard], data: { roles: ['ADMIN'] }}
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredRoles: string[] = route.data['roles'];
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // Pas de restriction de rôle
  }

  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // Rôle insuffisant
  router.navigate(['/forbidden']);
  return false;
};
