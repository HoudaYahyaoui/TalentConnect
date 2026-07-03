/**
 * Development Environment Configuration
 *
 * Microservices Architecture:
 *   - auth-service       : http://localhost:8081  (Auth JWT + Profils utilisateurs)
 *   - file-service       : http://localhost:8082  (Upload/Download fichiers)
 *   - chatbot-service    : http://localhost:8083  (Assistant IA)
 *   - candidatures-service: http://localhost:8084 (Candidatures + Notifications + HR Metrics)
 *   - job-service        : http://localhost:8085  (Offres + Cooptations + Audit + HR Metrics)
 */

export const environment = {
  production: false,
  useMocks: false,

  // URL principale = auth-service (via proxy Angular → localhost:8081)
  apiGateway: {
    baseUrl: '/auth-api/api',
    timeout: 30000,
  },

  // URLs via proxy Angular (évite CORS en dev)
  // /auth-api  → localhost:8081  (auth-service)
  // /jobs-api  → localhost:8085  (job-service)
  // /cand-api  → localhost:8084  (candidatures-service)
  // /files-api → localhost:8082  (file-service)
  // /chat-api  → localhost:8083  (chatbot-service)
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
      wsUrl: 'ws://localhost:8083/ws/chat',
    },
    i18n: {
      defaultLanguage: 'fr',
      supportedLanguages: ['fr', 'en'],
    },
    logging: {
      level: 'debug',
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
