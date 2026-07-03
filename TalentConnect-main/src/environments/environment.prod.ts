/**
 * Production Environment Configuration
 */

export const environment = {
  production: true,
  useMocks: false, // ← Use real backend in production
  apiGateway: {
    baseUrl: '/auth-api/api', // Microservices: auth-service as primary (8081)
    timeout: 30000,
  },
  services: {
    auth: '/auth-api/api',
    jobs: '/jobs-api/api',
    candidatures: '/cand-api/api',
    files: '/files-api/api',
    chatbot: '/chat-api/api',
  },
  auth: {
    tokenRefreshInterval: 10 * 60 * 1000,
    tokenExpirationThreshold: 5 * 60,
    tokenStorageKey: 'tc_token',
    userStorageKey: 'tc_user',
  },
  features: {
    chatbot: {
      enabled: true,
      wsUrl: 'wss://api.example.com/ws/chat',
    },
    i18n: {
      defaultLanguage: 'fr',
      supportedLanguages: ['fr', 'en'],
    },
    logging: {
      level: 'error',
    },
    pagination: {
      defaultPageSize: 20,
      maxPageSize: 100,
    },
  },
  cors: {
    credentials: true,
  },
};
