import { UserRole } from './user-role.enum';

/**
 * User Model - Représente un utilisateur authentifié
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  department?: string;
  position?: string;
}

/**
 * User Profile - Données du profil utilisateur
 */
export interface UserProfile extends User {
  phone?: string;
  department?: string;
  manager?: string;
}

/**
 * CreateUserDTO - DTO pour créer un nouvel utilisateur
 */
export interface CreateUserDTO {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  phone?: string;
  department?: string;
}

/**
 * UpdateUserDTO - DTO pour mettre à jour un utilisateur
 */
export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
}
