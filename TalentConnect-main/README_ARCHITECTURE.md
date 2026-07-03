# 🎯 TALENTCONNECT - GUIDE DE DÉMARRAGE COMPLET

> **Architecte Frontend Senior** | Angular Enterprise | Microservices Ready

---

## 📚 DOCUMENTATION COMPLÈTE

Avant de coder, lisez dans cet ordre:

1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** ← Commencez ICI
   - Vue d'ensemble de l'architecture
   - Structure des dossiers COMPLÈTE
   - Routing par rôle
   - Models et DTOs
   - Design system

2. **[HTTP_STRATEGY.md](./HTTP_STRATEGY.md)**
   - Pipeline HTTP complète
   - Interceptors (JWT, Loading, Error, Refresh Token)
   - Token storage strategy
   - Logging et debugging

3. **[BEST_PRACTICES.md](./BEST_PRACTICES.md)**
   - Principes SOLID appliqués
   - State management avec Signals
   - Type safety & TypeScript
   - Testing strategy
   - Performance optimization

4. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**
   - Dépendances à installer
   - Checklist pré-intégration
   - Guide d'intégration backend
   - Erreurs courantes

---

## 🚀 DÉMARRAGE RAPIDE (5 minutes)

### Architecture Vue d'ensemble

```
TalentConnect Frontend (Angular 21)
  │
  ├─ core/               ← Auth, Guards, API Gateway, Models
  ├─ shared/             ← UI components, pipes, directives
  ├─ features/           ← Domaines métier lazy-loaded
  │   ├─ auth/           (Login, Register)
  │   ├─ jobs/           (Offres d'emploi)
  │   ├─ applications/   (Candidatures)
  │   ├─ admin/          (Gestion utilisateurs)
  │   ├─ dashboard-rh/   (Dashboard RH)
  │   └─ chatbot/        (Widget ChatBot)
  │
  └─ styles/             ← Theming, variables SCSS

           ↓ à travers...

        API Gateway Service
        ├─ JwtInterceptor         (Ajoute token)
        ├─ LoadingInterceptor     (Spinner)
        ├─ RefreshTokenInterceptor (Token expiry)
        └─ ErrorInterceptor       (Error handling)

           ↓ via...

        Adapters Pattern
        ├─ AuthAdapter        ✅ Mock | Real Backend
        ├─ JobsAdapter        ✅ Mock | Real Backend
        ├─ ApplicationsAdapter ✅ Mock | Real Backend
        └─ ...
```

### Roles & Authorization

```
┌─────────────────────────────────────────────────────────┐
│  PUBLIC                                                 │
│  - /auth/login     (LoginComponent)                     │
│  - /auth/register  (RegisterComponent)                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  AUTHENTICATED (ALL ROLES)                              │
│  - /app/dashboard  (DashboardComponent)                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  EMPLOYEE ONLY                                          │
│  - /app/jobs                                            │
│  - /app/jobs/:id                                        │
│  - /app/applications/my                                 │
│  - /app/applications/apply/:jobId                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  RH ONLY                                                │
│  - /app/rh/jobs                                         │
│  - /app/rh/jobs/create                                  │
│  - /app/rh/applications                                 │
│  - /app/rh/candidates                                   │
│  - /app/rh/dashboard                                    │
│  - /app/rh/analytics                                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ADMIN ONLY                                             │
│  - /app/admin/users                                     │
│  - /app/admin/roles                                     │
│  - /app/admin/system                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 SPRINTS LIVRABLES

### SPRINT 1: Authentication & Admin (2 semaines)

**Livrables:**

- ✅ Login page (avec mocks)
- ✅ JWT auth service + token storage
- ✅ Auth guards (AuthGuard, AdminGuard, RhGuard, EmployeeGuard, PublicGuard)
- ✅ Role-based routing
- ✅ Admin user management (CRUD)

**Fichiers clés à implémenter:**

```
src/app/
├─ core/auth/
│  ├─ auth.service.ts              ← Main auth service
│  ├─ jwt-storage.service.ts       ← Token storage
│  ├─ models/
│  │  ├─ jwt-token.model.ts
│  │  └─ user-credentials.model.ts
│  └─ interceptors/ (JWT, Error)
├─ core/guards/
│  ├─ auth.guard.ts
│  ├─ admin.guard.ts
│  └─ public.guard.ts
└─ features/auth/
   ├─ pages/login/
   ├─ pages/register/
   └─ services/auth-facade.service.ts
```

---

### SPRINT 2: Jobs (Offres d'emploi)

**Livrables:**

- ✅ Jobs list page (Employee + RH view)
- ✅ Job detail page
- ✅ Search + filters
- ✅ Create/Edit job (RH only)

**Fichiers clés:**

```
src/app/
├─ features/jobs/
│  ├─ pages/
│  │  ├─ jobs-list/
│  │  ├─ job-detail/
│  │  ├─ job-create/
│  │  └─ job-edit/
│  ├─ components/
│  │  ├─ job-card/
│  │  └─ job-filters/
│  ├─ services/
│  │  ├─ jobs.service.ts
│  │  └─ jobs-facade.service.ts
│  ├─ stores/
│  │  └─ jobs.store.ts
│  ├─ models/
│  │  └─ job.model.ts
│  └─ jobs.routes.ts
└─ core/api/adapters/
   └─ jobs.adapter.ts
```

---

### SPRINT 3: Applications & Files

**Livrables:**

- ✅ Application form
- ✅ CV upload component
- ✅ My applications list
- ✅ Application status tracking
- ✅ File service with mock

**Fichiers clés:**

```
src/app/
├─ features/applications/
│  ├─ pages/
│  │  ├─ my-applications/
│  │  ├─ applications-list/
│  │  ├─ application-detail/
│  │  └─ apply-to-job/
│  ├─ components/
│  │  ├─ application-form/
│  │  └─ cv-upload/
│  ├─ models/
│  │  └─ application.model.ts
│  └─ services/applications-facade.service.ts
├─ features/files/
│  ├─ services/
│  │  ├─ file-upload.service.ts
│  │  └─ file-facade.service.ts
│  └─ models/file-upload.model.ts
└─ core/api/adapters/
   ├─ applications.adapter.ts
   └─ files.adapter.ts
```

---

### SPRINT 4: Dashboard RH & ChatBot

**Livrables:**

- ✅ Dashboard RH (stats, charts)
- ✅ Candidate analytics
- ✅ ChatBot widget integration
- ✅ Real-time messaging

**Fichiers clés:**

```
src/app/
├─ features/dashboard-rh/
│  ├─ pages/
│  │  ├─ dashboard-overview/
│  │  ├─ candidates-list/
│  │  └─ analytics/
│  ├─ components/
│  │  ├─ stat-card/
│  │  ├─ chart-widget/
│  │  └─ recruiting-pipeline/
│  └─ services/
│     ├─ dashboard.service.ts
│     └─ analytics.service.ts
└─ features/chatbot/
   ├─ components/chatbot-widget/
   ├─ services/chatbot-facade.service.ts
   └─ models/chat-message.model.ts
```

---

### SPRINT 5: Quality & DevOps

**Livrables:**

- ✅ Unit tests (90%+ coverage)
- ✅ E2E tests (user flows)
- ✅ Performance optimization
- ✅ Deployment config
- ✅ Documentation complete

**Fichiers clés:**

```
├─ **/*.spec.ts              ← Unit tests
├─ e2e/                       ← E2E tests
│  ├─ auth.spec.ts
│  ├─ jobs.spec.ts
│  ├─ applications.spec.ts
│  └─ admin.spec.ts
├─ angular.json              ← Build config
├─ tsconfig.json             ← TypeScript config
└─ README.md                 ← Setup guide
```

---

## 🔧 SETUP COMPLET (Première fois)

```bash
# 1. Clone le repo
git clone <repo-url>
cd TalentConnect

# 2. Install dependencies
npm install

# 3. Install Angular Material (Sprint 2)
ng add @angular/material

# 4. Vérifier la version Angular
ng version

# 5. Run dev server avec mocks
ng serve

# 6. Open browser
# http://localhost:4200/auth/login
# Credentials pour test: user@test.com / password123
```

---

## 🔑 POINTS CLÉS DE L'ARCHITECTURE

### 1. Adapter Pattern - API Abstraction

```typescript
// ✅ Chaque domain a son adapter
// Jobs
this.jobsAdapter.search(filters); // Mock or Real

// Applications
this.appAdapter.create(data); // Mock or Real

// Switching entre mock/real via environment.ts
// useMocks: true (dev) → false (prod)
```

### 2. Guards - Role-Based Access

```typescript
// ✅ Chaque route protégée par role
{
  path: 'admin',
  canActivate: [AdminGuard],  // ← Only ADMIN role
  children: [...]
}

// ✅ Dans templates, masquer UI par role
<button *appHasRole="'RH'"> Manage Jobs </button>
```

### 3. Signals - Reactive State

```typescript
// ✅ Modern Angular state (no Redux needed for MVP)
jobs$ = signal<Job[]>([]);
loading$ = signal(false);
totalJobs$ = computed(() => this.jobs$().length);

// Component auto-reactive
@Component({ changeDetection: ChangeDetectionStrategy.OnPush })
export class JobsComponent {
  store = inject(JobsStore);
  jobs = this.store.jobs$; // Reactive signal
}
```

### 4. Interceptors - Global HTTP Pipeline

```typescript
// ✅ All HTTP traffic goes through
JwtInterceptor        ← Add token to every request
LoadingInterceptor    ← Show/hide spinner
RefreshTokenInterceptor ← Handle 401, retry
ErrorInterceptor      ← Centralized error handling
```

### 5. Lazy Loading - Performance

```typescript
// ✅ Features chargées ON-DEMAND
{
  path: 'jobs',
  loadComponent: () =>
    import('./features/jobs/...').then(m => m.JobsComponent)
}

// Bundle main: ~150KB
// Each feature: ~50KB (loaded on demand)
```

---

## 📊 ARCHITECTURE PATTERNS UTILISÉS

| Pattern                  | Utilisation            | Fichier                         |
| ------------------------ | ---------------------- | ------------------------------- |
| **Adapter**              | API abstraction        | core/api/adapters/\*.ts         |
| **Service Factory**      | Create/manage services | core/ services                  |
| **Guard**                | Route protection       | core/guards/\*.guard.ts         |
| **Interceptor**          | HTTP pipeline          | core/auth/interceptors/\*.ts    |
| **Facade**               | Simplified API         | features/_/services/_-facade.ts |
| **Store/State**          | State management       | features/_/stores/_.store.ts    |
| **Smart/Dumb**           | Component hierarchy    | features/\*/pages + components  |
| **Dependency Injection** | Loose coupling         | @Injectable() everywhere        |

---

## 🎬 WORKFLOW DE DÉVELOPPEMENT

### Créer une nouvelle feature (ex: Awards)

#### 1. Generate folder structure

```bash
mkdir src/app/features/awards
mkdir src/app/features/awards/{pages,components,services,stores,models}
```

#### 2. Create models

```typescript
// awards.model.ts
export interface Award { ... }
export interface CreateAwardDTO { ... }

// index.ts (re-export)
export * from './award.model.ts'
```

#### 3. Create adapter

```typescript
// core/api/adapters/awards.adapter.ts
@Injectable()
export class AwardsAdapter {
  constructor(private api: ApiGatewayService) {}

  getAwards(): Observable<Award[]> {
    return this.api.get('/awards')...
  }
}
```

#### 4. Create service/facade

```typescript
// features/awards/services/awards.service.ts
@Injectable()
export class AwardsService {
  constructor(private adapter: AwardsAdapter) {}

  getAwards() {
    return this.adapter.getAwards();
  }
}
```

#### 5. Create store

```typescript
// features/awards/stores/awards.store.ts
@Injectable()
export class AwardsStore {
  awards$ = signal<Award[]>([]);

  loadAwards() {
    // Load data via service
  }
}
```

#### 6. Create pages/components

```typescript
// features/awards/pages/awards-list.component.ts
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AwardsListComponent {
  store = inject(AwardsStore);
  awards = this.store.awards$;
}
```

#### 7. Create routing

```typescript
// features/awards/awards.routes.ts
export const AWARDS_ROUTES: Routes = [
  {
    path: '',
    component: AwardsListComponent,
  },
];
```

#### 8. Add to main routes

```typescript
// app.routes.ts
{
  path: 'awards',
  canActivate: [AuthGuard],
  loadChildren: () =>
    import('./features/awards/awards.routes')
      .then(m => m.AWARDS_ROUTES),
}
```

---

## 🐛 DEBUG TIPS

### Browser DevTools

```javascript
// In Console, test API calls
fetch('/api/jobs', {
  headers: { Authorization: 'Bearer ' + sessionStorage.getItem('access_token') },
})
  .then((r) => r.json())
  .then(console.log);
```

### Check Auth State

```typescript
// In any component
const auth = inject(AuthService);
console.log(auth.currentUser());
console.log(auth.isAuthenticated());
```

### Mock Switch

```typescript
// In environment.ts
export const environment = {
  useMocks: true, // ← Set to true to use mocks
};
```

### Network Tab

```
Chrome DevTools → Network → Filter by XHR
- Check Authorization header present
- Check response status (200, 401, etc.)
- Check response body matches ApiResponse<T>
```

---

## 📈 PERFORMANCE CHECKLIST

Before production:

- [ ] Bundle size < 500KB (main)
- [ ] LCP < 2.5s (Largest Contentful Paint)
- [ ] No memory leaks (DevTools Memory)
- [ ] All images optimized
- [ ] Lazy loading configured
- [ ] Caching strategy set
- [ ] Error logging configured

---

## 🚀 NEXT STEPS

1. **Read** ARCHITECTURE.md
2. **Understand** folder structure
3. **Setup** dev environment
4. **Start** Sprint 1 (Auth & Admin)
5. **Implement** guards + login page
6. **Test** with mocks
7. **Integrate** with backend (Sprint 2+)
8. **Deploy** to staging
9. **Test** in production environment
10. **Monitor** with Sentry/AppInsights

---

## 📞 FAQ

**Q: Do I need Redux/NgRx?**  
A: No, not for MVP. Use Signals. Graduate to NgRx if complexity grows.

**Q: How to switch from mocks to real backend?**  
A: Change `useMocks: false` in environment.ts. Done!

**Q: Can I add Material Design later?**  
A: Yes, `ng add @angular/material` anytime. But recommended for Sprint 2.

**Q: How to test protected routes?**  
A: Use login credentials during testing. Mocks work same as real backend.

**Q: Can I use CSS-in-JS instead of SCSS?**  
A: Yes, but SCSS recommended for Material theming. Global variables are easier.

---

**Last Updated:** 2026-05-04  
**Version:** 1.0 - Enterprise Ready
