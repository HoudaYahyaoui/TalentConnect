/**
 * Permission Model - Gestion des permissions granulaires
 */
export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  category: PermissionCategory;
}

export enum PermissionCategory {
  USER = 'user',
  JOB = 'job',
  APPLICATION = 'application',
  FILE = 'file',
  DASHBOARD = 'dashboard',
  SYSTEM = 'system',
}

// Permissions par ressource
export const PERMISSIONS = {
  // User Management
  'user.read': { code: 'user.read', name: 'Read Users', category: PermissionCategory.USER },
  'user.create': { code: 'user.create', name: 'Create User', category: PermissionCategory.USER },
  'user.update': { code: 'user.update', name: 'Update User', category: PermissionCategory.USER },
  'user.delete': { code: 'user.delete', name: 'Delete User', category: PermissionCategory.USER },

  // Job Management
  'job.read': { code: 'job.read', name: 'Read Jobs', category: PermissionCategory.JOB },
  'job.create': { code: 'job.create', name: 'Create Job', category: PermissionCategory.JOB },
  'job.update': { code: 'job.update', name: 'Update Job', category: PermissionCategory.JOB },
  'job.delete': { code: 'job.delete', name: 'Delete Job', category: PermissionCategory.JOB },

  // Application Management
  'application.read': { code: 'application.read', name: 'Read Applications', category: PermissionCategory.APPLICATION },
  'application.create': { code: 'application.create', name: 'Create Application', category: PermissionCategory.APPLICATION },
  'application.evaluate': { code: 'application.evaluate', name: 'Evaluate Application', category: PermissionCategory.APPLICATION },

  // File Management
  'file.upload': { code: 'file.upload', name: 'Upload Files', category: PermissionCategory.FILE },
  'file.download': { code: 'file.download', name: 'Download Files', category: PermissionCategory.FILE },

  // Dashboard
  'dashboard.view': { code: 'dashboard.view', name: 'View Dashboard', category: PermissionCategory.DASHBOARD },

  // System
  'system.config': { code: 'system.config', name: 'System Config', category: PermissionCategory.SYSTEM },
} as const;

// Default permissions par rôle
export const ROLE_DEFAULT_PERMISSIONS = {
  ADMIN: Object.keys(PERMISSIONS),
  RH: [
    'job.read',
    'job.create',
    'job.update',
    'job.delete',
    'application.read',
    'application.evaluate',
    'user.read',
    'dashboard.view',
    'file.download',
  ],
  EMPLOYEE: ['job.read', 'application.create', 'application.read', 'file.upload', 'file.download'],
  MANAGER: ['dashboard.view', 'user.read'],
} as const;
