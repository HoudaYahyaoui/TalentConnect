/**
 * API Endpoints Configuration
 * Centralise tous les endpoints par microservice pour faciliter la maintenance
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refreshToken: '/auth/refresh',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  users: {
    base: '/users',
    profile: '/users/profile',
    byId: (id: string) => `/users/${id}`,
    roles: '/users/roles',
    permissions: '/users/permissions',
  },
  jobs: {
    base: '/jobs',
    byId: (id: string) => `/jobs/${id}`,
    search: '/jobs/search',
    recommend: '/jobs/recommend',
    stats: '/jobs/stats',
  },
  applications: {
    base: '/applications',
    byId: (id: string) => `/applications/${id}`,
    byCandidate: (candidateId: string) => `/applications/candidate/${candidateId}`,
    byJob: (jobId: string) => `/applications/job/${jobId}`,
    updateStatus: (id: string) => `/applications/${id}/status`,
  },
  candidates: {
    base: '/candidates',
    byId: (id: string) => `/candidates/${id}`,
    search: '/candidates/search',
    pipeline: '/candidates/pipeline',
  },
  notifications: {
    base: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
    unreadCount: '/notifications/unread-count',
  },
  files: {
    upload: '/files/upload',
    download: (id: string) => `/files/${id}/download`,
    delete: (id: string) => `/files/${id}`,
  },
  audit: {
    logs: '/audit/logs',
    byUser: (userId: string) => `/audit/logs/user/${userId}`,
  },
} as const;
