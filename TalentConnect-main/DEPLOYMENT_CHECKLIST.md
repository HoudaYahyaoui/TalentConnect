# 📋 CHECKLIST DÉPLOIEMENT & INTÉGRATION BACKEND

## 🛠️ OUTILS & DÉPENDANCES À INSTALLER

### Phase 1: Core (✅ DÉJÀ INSTALLÉ)

```bash
npm install @angular/core@^21.2.0
npm install @angular/common@^21.2.0
npm install @angular/router@^21.2.0
npm install @angular/forms@^21.2.0
npm install rxjs@^7.8.0
```

### Phase 2: UI & Material (À faire avant Sprint 2)

```bash
# Angular Material
npm install @angular/material@^21.0.0
npm install @angular/cdk@^21.0.0

# Icônes Material
npm install @angular/material-icon-font@latest

# Le reste est optionnel, mais recommandé:
npm install material-design-icons
```

### Phase 3: Utilities (À faire selon besoins)

```bash
# Date formatting
npm install date-fns@^3.0.0

# Utilities
npm install lodash-es@^4.17.21

# HTTP client enhancement (optionnel)
npm install axios@^1.0.0  # Alternative si besoin spécial

# Notifications avancées
npm install ngx-toastr@^18.0.0  # Optionnel
npm install @ngx-pwa/local-storage@^18.0.0  # Secure storage
```

### Phase 4: i18n (À faire avant Sprint 5)

```bash
# Internationalisation
npm install @ngx-translate/core@^15.0.0
npm install @ngx-translate/http-loader@^8.0.0

# Alternativement, Angular native i18n (recommandé):
ng add @angular/localize
```

### Phase 5: Testing (À faire avant Sprint 5)

```bash
# Vitest (déjà configured dans angular.json)
npm install vitest@^4.0.8

# Additional test utilities
npm install @testing-library/angular@^14.0.0
npm install @testing-library/jest-dom@^6.0.0

# Testing avec mock backend
npm install msw@^2.0.0  # Mock Service Worker

# E2E Testing
npm install --save-dev playwright@^1.40.0
npm install --save-dev @playwright/test@^1.40.0
```

### Phase 6: Development Tools (Optional but Recommended)

```bash
# ESLint + Prettier (code quality)
npm install --save-dev eslint@^8.0.0
npm install --save-dev prettier@^3.8.1
npm install --save-dev eslint-config-prettier@^9.0.0

# Husky (pre-commit hooks)
npm install --save-dev husky@^9.0.0
npx husky install

# Commitlint (conventional commits)
npm install --save-dev @commitlint/cli@^18.0.0
npm install --save-dev @commitlint/config-conventional@^18.0.0

# Build analysis
npm install --save-dev webpack-bundle-analyzer@^4.10.0
npm install --save-dev esbuild-plugin-visualizer@^0.7.0
```

### Phase 7: Monitoring & Analytics (Production)

```bash
# Application Insights (Azure) ou Sentry
npm install @microsoft/applicationinsights-web@^3.0.0
npm install sentry-angular@^8.0.0  # Alternative

# Performance monitoring
npm install web-vitals@^4.0.0
```

---

## ✅ CHECKLIST PRÉ-INTÉGRATION BACKEND

### Étape 1: Vérifier les Mocks

- [ ] Mock auth service fonctionne
- [ ] Mock jobs adapter retourne données correctes
- [ ] Mock applications adapter fonctionne
- [ ] Mock file upload marche
- [ ] Tous les endpoints mock utilisent les bonnes structures

### Étape 2: Tester les Routes

- [ ] Route /auth/login accessible sans auth
- [ ] Route /auth/login redirige si déjà authentifié
- [ ] Route /app/dashboard protégée par AuthGuard
- [ ] Route /app/admin protégée par AdminGuard
- [ ] Route /app/rh/jobs protégée par RhGuard
- [ ] Route /app/jobs protégée par EmployeeGuard
- [ ] Route /404 affiche correctly
- [ ] Route /unauthorized affiche correctly
- [ ] Wildcard route redirige à /404

### Étape 3: Vérifier Guards

- [ ] AuthGuard redirige vers login si pas authentifié
- [ ] AdminGuard redirige vers unauthorized si pas ADMIN
- [ ] RhGuard redirige vers unauthorized si pas RH
- [ ] EmployeeGuard redirige vers unauthorized si pas EMPLOYEE
- [ ] PublicGuard redirige à dashboard si déjà authentifié
- [ ] Guards sont dans les bonnes routes

### Étape 4: Vérifier Interceptors

- [ ] JwtInterceptor ajoute Authorization header
- [ ] JwtInterceptor skip les routes publiques
- [ ] LoadingInterceptor affiche spinner
- [ ] LoadingInterceptor cache spinner après request
- [ ] ErrorInterceptor affiche les erreurs
- [ ] RefreshTokenInterceptor gère 401

### Étape 5: Vérifier Models & Types

- [ ] User model matches backend API contract
- [ ] Job model matches backend API contract
- [ ] Application model matches backend API contract
- [ ] FileUpload model matches backend API contract
- [ ] Tous les enums sont corrects
- [ ] ValidationErrors model matches backend

### Étape 6: Vérifier API Gateway Service

- [ ] ApiGatewayService constructeur correct
- [ ] Toutes les méthodes HTTP (GET, POST, PUT, DELETE) travaillent
- [ ] Timeout configuré
- [ ] Headers génériques OK
- [ ] URL construction OK

### Étape 7: Vérifier Adapters

- [ ] AuthAdapter.login() fonctionne
- [ ] AuthAdapter.register() fonctionne
- [ ] AuthAdapter.refreshToken() fonctionne
- [ ] JobsAdapter.getJobs() fonctionne
- [ ] ApplicationsAdapter.createApplication() fonctionne
- [ ] Tous les adapters utilisent ApiGatewayService
- [ ] Mock mode switch fonctionne via environment

### Étape 8: Configuration Environment

- [ ] environment.ts pointe à API locale (http://localhost:8080)
- [ ] environment.prod.ts pointe à API prod
- [ ] useMocks = true (dev), false (prod)
- [ ] URL API Gateway correcte dans les deux

---

## 🔗 CHECKLIST INTÉGRATION BACKEND

### 1️⃣ Avant Intégration

**Backend Ready:**

- [ ] API Gateway déployed et accessible
- [ ] CORS configuré pour http://localhost:4200
- [ ] Auth endpoint /auth/login retourne JWT
- [ ] Auth endpoint /auth/refresh fonctionne
- [ ] Tous les endpoints retourne `ApiResponse<T>` avec le format exact

**Frontend Ready:**

- [ ] Mocks passent les tests
- [ ] Routes configurées
- [ ] Guards implémentés
- [ ] Interceptors connectés

### 2️⃣ Configuration CORS (Backend)

Le backend doit configurer:

```java
// Spring Boot CORS config
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:4200", "https://domain.com")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("Content-Type", "Authorization")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

### 3️⃣ Switch Mock → Real Backend

**Étape 1:** Désactiver mocks dans environment.ts

```typescript
export const environment = {
  useMocks: false, // ← FALSE
  apiGateway: {
    baseUrl: 'http://localhost:8080/api',
    timeout: 30000,
  },
};
```

**Étape 2:** Tester login

```bash
ng serve
# Naviguer à http://localhost:4200/auth/login
# Entrer credentials réels
# Vérifier Network tab: Authorization header présent
# Vérifier token sauvegardé en sessionStorage
```

**Étape 3:** Tester routes protégées

```bash
# Si login OK → dashboard devrait charger
# Si logout → AuthGuard redirige à login
# Tester chaque route RH/Admin
```

### 4️⃣ Debug Checklist

Si erreurs lors de l'intégraton:

**401 Unauthorized?**

- [ ] Token valide dans Authorization header
- [ ] Backend retourne 401 pour token expiré
- [ ] RefreshTokenInterceptor essaie refresh
- [ ] Si refresh OK → request retrié

**CORS Error?**

- [ ] Backend a CORS activé
- [ ] Frontend URL est dans allowedOrigins
- [ ] OPTIONS request retourne 200

**Type Mismatch?**

- [ ] Response structure matches ApiResponse<T>
- [ ] Job.id est string, pas number
- [ ] Dates sont ISO 8601 strings, pas timestamps
- [ ] Enums matchent exactement

**Request Not Sent?**

- [ ] JwtInterceptor skip public routes (login, register)
- [ ] Auth routes ne demandent PAS le token
- [ ] Public endpoints retournent 200 sans token

### 5️⃣ Performance Checklist

Avant production:

- [ ] Bundle size < 500KB (main)
- [ ] Lazy chunks < 100KB chacun
- [ ] LCP < 2.5s
- [ ] No memory leaks (dev tools)
- [ ] No N+1 queries
- [ ] API calls debounced/throttled quand nécessaire
- [ ] Images optimisées
- [ ] No console.log() en production

### 6️⃣ Security Checklist

Avant production:

- [ ] Tokens en SessionStorage (pas localStorage)
- [ ] HttpOnly cookies pour refresh token (si possible)
- [ ] CORS restrictif (domaines spécifiques)
- [ ] HTTPS forcé en prod
- [ ] CSP headers configurés
- [ ] No sensitive data in localStorage
- [ ] Logout clear tous les tokens
- [ ] Token validation côté backend

### 7️⃣ Monitoring & Logging

Setup pour production:

```typescript
// main.ts
if (environment.production) {
  enableProdMode();

  // Setup Sentry
  Sentry.init({
    dsn: environment.sentryDsn,
    environment: 'production',
    tracesSampleRate: 0.1,
  });

  // Setup Application Insights
  const appInsights = new ApplicationInsights({
    config: {
      instrumentationKey: environment.appInsightsKey,
      ...
    }
  });
}
```

### 8️⃣ Deployment Checklist

Avant déploiement en prod:

- [ ] Environment variables configurés
- [ ] Build prod lancé et réussi
- [ ] Bundle size acceptable
- [ ] Tests passent (unit + e2e)
- [ ] No console errors/warnings
- [ ] Monitoring actif
- [ ] Rollback plan en place
- [ ] Deployment scripts fonctionnent

---

## 📦 Build & Deployment Commands

### Development

```bash
# Dev server with mocks
ng serve

# Build development
ng build --configuration development
```

### Production

```bash
# Production build (optimisé)
ng build --configuration production

# Production serve (simulation)
ng serve --configuration production

# Build with source maps (debug prod bugs)
ng build --configuration production --source-map
```

### Testing

```bash
# Run tests
ng test

# Run tests with coverage
ng test --code-coverage

# Run E2E tests
ng e2e

# Run specific test file
ng test --include='**/jobs.spec.ts'
```

### Analysis

```bash
# Analyze bundle
ng build --stats-json
webpack-bundle-analyzer dist/talen-connect/stats.json

# Check budget
ng build --budget
```

---

## 🚨 Erreurs Courantes & Solutions

### Erreur: "Cannot match any routes"

**Cause:** Route pas configurée correctement

```typescript
// ✅ FIX: Vérifier app.routes.ts
// Check path, canActivate guard, loadComponent
```

### Erreur: "401 Unauthorized on every request"

**Cause:** Token manquant ou expiré

```typescript
// ✅ FIX: Vérifier JwtInterceptor attach le token
// Check JwtStorageService.getAccessToken()
```

### Erreur: "Type of X is not assignable"

**Cause:** Mismatch entre model frontend et backend

```typescript
// ✅ FIX: Vérifier models/job.model.ts matches backend
// Make sure enums are string literals, not numbers
```

### Erreur: "Cannot read property of undefined"

**Cause:** Pas d'initialisation du signal

```typescript
// ✅ FIX:
jobs$ = signal<Job[]>([]); // Initialize to empty array
```

---

## 📞 Support & Escalation

Si problèmes d'intégration:

1. **Check mocks first** - Vérifier que mocks fonctionnent
2. **Enable debug logging** - Check Network tab + console logs
3. **Validate API contract** - Ensure backend response matches expected format
4. **Test with Postman** - Test backend endpoints directement
5. **Check CORS** - Network tab → preflight response
6. **Compare timestamps** - Frontend/backend timezone issues?

---

## ✨ Recommandations Finales

1. **Start Simple**: Mock → Real backend progressivement
2. **Test Often**: Intégrer chaque endpoint immédiatement après backend dev
3. **Version API**: Use versioning (/api/v1, /api/v2) for backward compatibility
4. **Document Everything**: API contracts, error codes, response formats
5. **Monitor Production**: Setup Sentry/AppInsights from day 1
6. **Keep Security First**: Token refresh, CORS, HTTPS
7. **Plan for Scale**: Lazy loading, OnPush, pagination from the start
