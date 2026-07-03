import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Route, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../api/models/backend-api-models';

/**
 * CANMATCH ROLE GUARD (pour les lazy-loaded modules)
 * Usage: {path: 'admin', canMatch: [roleMatchGuard], data: {roles: ['ADMIN']}}
 */
export const roleMatchGuard: CanMatchFn = (route: Route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  const expectedRoles = (route.data?.['roles'] as string[] | undefined) ?? [];

  if (expectedRoles.length === 0 || authService.hasAnyRole(expectedRoles)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};

/**
 * CANACTIVATE ROLE GUARD (pour les routes directs)
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  const expectedRoles = (route.data?.['roles'] as string[] | undefined) ?? [];

  if (expectedRoles.length === 0 || authService.hasAnyRole(expectedRoles)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};

/**
 * EMPLOYEE GUARD
 * Vérifie que l'utilisateur a le rôle EMPLOYEE
 */
export const employeeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (authService.hasRole(UserRole.EMPLOYEE)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};

/**
 * HR GUARD
 * Vérifie que l'utilisateur a le rôle HR
 */
export const hrGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (authService.hasRole(UserRole.HR)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};

/**
 * ADMIN GUARD
 * Vérifie que l'utilisateur a le rôle ADMIN
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (authService.hasRole(UserRole.ADMIN)) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};

/**
 * HR OR ADMIN GUARD
 * Vérifie que l'utilisateur a le rôle HR ou ADMIN
 */
export const hrOrAdminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (authService.hasAnyRole([UserRole.HR, UserRole.ADMIN])) {
    return true;
  }

  return router.createUrlTree(['/forbidden']);
};
