/**
 * UserRole Enum - Rôles utilisateurs système
 * Utilisé pour les guards et les contrôles d'accès
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  RH = 'RH',
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
}

// Types pour faciliter la gestion des rôles
export type UserRoleType = UserRole | string;

// Map des rôles avec leurs permissions de base
export const ROLE_HIERARCHY = {
  [UserRole.ADMIN]: ['ADMIN', 'RH', 'EMPLOYEE'],
  [UserRole.RH]: ['RH', 'EMPLOYEE'],
  [UserRole.MANAGER]: ['MANAGER', 'EMPLOYEE'],
  [UserRole.EMPLOYEE]: ['EMPLOYEE'],
} as const;
