# 🏗️ TALENTCONNECT - ARCHITECTURE FRONTEND ENTERPRISE

**Projet:** TalentConnect  
**Type:** Application Angular Standalone  
**Version Angular:** 21.2.0  
**Paradigme:** Feature-based, Microservices-ready  
**Dernière mise à jour:** 2026-05-04

---

## 📌 PRINCIPES ARCHITECTURAUX

### 1. **Single Responsibility**

- Une feature = un domaine métier (Auth, Jobs, Applications, etc.)
- Chaque service a une responsabilité bien définie
- Séparation claire: Core ↔ Shared ↔ Features

### 2. **API Gateway Pattern**

```
Frontend Angular
    ↓
  ApiGatewayService (proxy unique)
    ↓
  Feature Adapters (AuthApi, JobApi, etc.)
    ↓
  Mocks / Real Backend (switchable)
```

- Un seul point d'entrée pour les appels HTTP
- Adapters permettent intégration backend progressive
- Mocks en place pour développement sans backend

### 3. **Lazy-Loading & Code Splitting**

- Features chargées à la demande
- Meilleure performance et bundle size
- Routing optimisé par rôle

### 4. **Security First**

- Guards par rôle (Admin, RH, Employé)
- Interceptor central pour JWT
- Token storage sécurisé (SessionStorage)
- Refresh token strategy

### 5. **Modern Angular Stack**

✅ Standalone Components (pas de NgModule)  
✅ Signals pour état local  
✅ Typed Forms  
✅ Built-in Control Flow (@if, @for, @switch)  
✅ Material Design + Theming  
✅ i18n (FR/EN)  
✅ Responsive + Accessible

---

## 🗂️ STRUCTURE DES DOSSIERS (COMPLÈTE)

```
src/
├── app/
│   ├── core/                          # ⭐ Logique centrale non-réutilisable
│   │   ├── api/                       # API Gateway + adapters
│   │   │   ├── api-gateway.service.ts # Service proxy unique
│   │   │   ├── adapters/
│   │   │   │   ├── auth.adapter.ts    # Adapter Auth (Mock + Real)
│   │   │   │   ├── jobs.adapter.ts
│   │   │   │   ├── applications.adapter.ts
│   │   │   │   ├── files.adapter.ts
│   │   │   │   └── chatbot.adapter.ts
│   │   │   └── models/
│   │   │       ├── api-response.model.ts
│   │   │       └── api-error.model.ts
│   │   │
│   │   ├── auth/                      # Gestion authentification
│   │   │   ├── auth.service.ts        # Service auth principal
│   │   │   ├── jwt-storage.service.ts # Gestion tokens (Session/Secure)
│   │   │   ├── models/
│   │   │   │   ├── jwt-payload.model.ts
│   │   │   │   ├── user-credentials.model.ts
│   │   │   │   └── jwt-token.model.ts
│   │   │   └── interceptors/
│   │   │       ├── jwt.interceptor.ts      # Injection JWT
│   │   │       ├── error.interceptor.ts    # Gestion erreurs
│   │   │       ├── loading.interceptor.ts  # Loading state
│   │   │       └── refresh-token.interceptor.ts
│   │   │
│   │   ├── guards/                    # Route guards par rôle
│   │   │   ├── auth.guard.ts          # Vérifie authentification
│   │   │   ├── admin.guard.ts         # Rôle ADMIN uniquement
│   │   │   ├── rh.guard.ts            # Rôle RH uniquement
│   │   │   ├── employee.guard.ts      # Rôle EMPLOYÉ uniquement
│   │   │   ├── manager.guard.ts       # Rôle MANAGER uniquement
│   │   │   └── public.guard.ts        # Redirection si authentifié
│   │   │
│   │   ├── models/                    # Models partagés (DTOs)
│   │   │   ├── user.model.ts
│   │   │   ├── user-role.enum.ts
│   │   │   ├── permission.model.ts
│   │   │   ├── pagination.model.ts
│   │   │   └── index.ts               # Export centralisé
│   │   │
│   │   ├── resolvers/                 # Route data resolvers
│   │   │   ├── user.resolver.ts
│   │   │   └── auth.resolver.ts
│   │   │
│   │   ├── state/                     # Global state management (Signals)
│   │   │   ├── auth.state.ts          # Auth state centralisé
│   │   │   ├── loading.state.ts
│   │   │   └── notification.state.ts
│   │   │
│   │   └── core.config.ts             # Fournisseurs core (HTTP, providers)
│   │
│   ├── shared/                        # ⭐ Composants réutilisables
│   │   ├── components/
│   │   │   ├── layouts/
│   │   │   │   ├── app-layout/        # Layout principal avec sidebar
│   │   │   │   ├── auth-layout/       # Layout login (sans navbar)
│   │   │   │   └── admin-layout/      # Layout admin spécifique
│   │   │   │
│   │   │   ├── navbar/                # Barre navigation
│   │   │   ├── sidebar/               # Barre latérale
│   │   │   ├── footer/
│   │   │   │
│   │   │   ├── common/                # Composants UI génériques
│   │   │   │   ├── button/
│   │   │   │   ├── card/
│   │   │   │   ├── modal/
│   │   │   │   ├── dialog-confirm/
│   │   │   │   ├── skeleton-loader/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── pagination/
│   │   │   │   ├── badge/
│   │   │   │   ├── status-badge/
│   │   │   │   ├── avatar/
│   │   │   │   └── spinner/
│   │   │   │
│   │   │   ├── feedback/              # Feedback utilisateur
│   │   │   │   ├── toast-notification/
│   │   │   │   ├── alert/
│   │   │   │   └── snackbar/
│   │   │   │
│   │   │   └── forms/                 # Composants formulaires
│   │   │       ├── input-field/
│   │   │       ├── select-dropdown/
│   │   │       ├── checkbox/
│   │   │       ├── radio-group/
│   │   │       ├── textarea/
│   │   │       ├── date-picker/
│   │   │       └── file-upload/
│   │   │
│   │   ├── pipes/
│   │   │   ├── safe-html.pipe.ts
│   │   │   ├── highlight.pipe.ts
│   │   │   ├── date-format.pipe.ts
│   │   │   └── truncate.pipe.ts
│   │   │
│   │   ├── directives/
│   │   │   ├── has-role.directive.ts      # *appHasRole="ADMIN"
│   │   │   ├── has-permission.directive.ts
│   │   │   ├── click-outside.directive.ts
│   │   │   └── image-fallback.directive.ts
│   │   │
│   │   ├── models/                    # Models partagés
│   │   │   ├── form-error.model.ts
│   │   │   ├── pagination-config.model.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── services/                  # Services réutilisables
│   │   │   ├── notification.service.ts    # Toast / Snackbar
│   │   │   ├── dialog.service.ts          # Modals
│   │   │   ├── loading.service.ts         # Spinner global
│   │   │   ├── storage.service.ts         # LocalStorage wrapper
│   │   │   └── clipboard.service.ts
│   │   │
│   │   ├── theme/                    # Theming (Material + Custom)
│   │   │   ├── theme.service.ts
│   │   │   └── theme-variables.scss
│   │   │
│   │   └── shared.module.ts            # Export des composants/services
│   │
│   ├── features/                       # 🎯 Modules métier lazy-loaded
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.component.ts
│   │   │   │   │   ├── login.component.html
│   │   │   │   │   └── login.component.scss
│   │   │   │   └── register/
│   │   │   │       ├── register.component.ts
│   │   │   │       ├── register.component.html
│   │   │   │       └── register.component.scss
│   │   │   ├── services/
│   │   │   │   └── auth-facade.service.ts
│   │   │   ├── stores/                # State local (Signals)
│   │   │   │   └── auth.store.ts
│   │   │   ├── models/
│   │   │   │   └── auth-form.model.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   ├── admin/
│   │   │   ├── pages/
│   │   │   │   ├── users-management/
│   │   │   │   │   ├── users-list/
│   │   │   │   │   ├── user-create/
│   │   │   │   │   └── user-edit/
│   │   │   │   └── roles-management/
│   │   │   │       └── roles-list/
│   │   │   ├── components/
│   │   │   │   ├── users-table/
│   │   │   │   └── user-form/
│   │   │   ├── services/
│   │   │   │   └── admin.service.ts
│   │   │   ├── models/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── user-form.model.ts
│   │   │   └── admin.routes.ts
│   │   │
│   │   ├── jobs/
│   │   │   ├── pages/
│   │   │   │   ├── jobs-list/
│   │   │   │   │   ├── jobs-list.component.ts
│   │   │   │   │   ├── jobs-list.component.html
│   │   │   │   │   └── jobs-list.component.scss
│   │   │   │   ├── job-detail/
│   │   │   │   │   ├── job-detail.component.ts
│   │   │   │   │   ├── job-detail.component.html
│   │   │   │   │   └── job-detail.component.scss
│   │   │   │   └── manage-jobs/        # Page RH uniquement
│   │   │   │       └── ...
│   │   │   ├── components/
│   │   │   │   ├── job-card/
│   │   │   │   ├── job-filters/
│   │   │   │   ├── job-form/
│   │   │   │   └── search-bar/
│   │   │   ├── services/
│   │   │   │   ├── jobs.service.ts
│   │   │   │   └── jobs-facade.service.ts
│   │   │   ├── stores/
│   │   │   │   └── jobs.store.ts       # State local avec Signals
│   │   │   ├── models/
│   │   │   │   ├── job.model.ts
│   │   │   │   ├── job-filter.model.ts
│   │   │   │   └── create-job.dto.ts
│   │   │   └── jobs.routes.ts
│   │   │
│   │   ├── applications/              # Candidatures & Applications
│   │   │   ├── pages/
│   │   │   │   ├── my-applications/
│   │   │   │   ├── applications-list/  # Vue RH
│   │   │   │   ├── application-detail/
│   │   │   │   └── apply-to-job/
│   │   │   ├── components/
│   │   │   │   ├── application-form/
│   │   │   │   ├── application-card/
│   │   │   │   ├── application-status-timeline/
│   │   │   │   └── cv-upload/
│   │   │   ├── services/
│   │   │   │   ├── applications.service.ts
│   │   │   │   └── applications-facade.service.ts
│   │   │   ├── stores/
│   │   │   │   └── applications.store.ts
│   │   │   ├── models/
│   │   │   │   ├── application.model.ts
│   │   │   │   ├── application-status.enum.ts
│   │   │   │   └── create-application.dto.ts
│   │   │   └── applications.routes.ts
│   │   │
│   │   ├── files/                     # Gestion fichiers (CV)
│   │   │   ├── services/
│   │   │   │   ├── file-upload.service.ts
│   │   │   │   ├── file-download.service.ts
│   │   │   │   └── file-facade.service.ts
│   │   │   ├── models/
│   │   │   │   ├── file-upload.model.ts
│   │   │   │   └── file-metadata.model.ts
│   │   │   └── utils/
│   │   │       ├── file-validators.util.ts
│   │   │       └── file-converters.util.ts
│   │   │
│   │   ├── dashboard-rh/              # Dashboard RH
│   │   │   ├── pages/
│   │   │   │   ├── dashboard-overview/
│   │   │   │   │   ├── dashboard-overview.component.ts
│   │   │   │   │   ├── dashboard-overview.component.html
│   │   │   │   │   └── dashboard-overview.component.scss
│   │   │   │   └── candidates-insights/
│   │   │   │       └── ...
│   │   │   ├── components/
│   │   │   │   ├── stat-card/
│   │   │   │   ├── chart-widget/
│   │   │   │   ├── recruiting-pipeline/
│   │   │   │   └── candidate-analytics/
│   │   │   ├── services/
│   │   │   │   ├── dashboard.service.ts
│   │   │   │   └── analytics.service.ts
│   │   │   ├── models/
│   │   │   │   ├── dashboard-stats.model.ts
│   │   │   │   └── chart-data.model.ts
│   │   │   └── dashboard-rh.routes.ts
│   │   │
│   │   ├── chatbot/                   # ChatBot widget
│   │   │   ├── components/
│   │   │   │   ├── chatbot-widget/
│   │   │   │   ├── chat-message/
│   │   │   │   └── chat-input/
│   │   │   ├── services/
│   │   │   │   ├── chatbot.service.ts
│   │   │   │   └── chat-facade.service.ts
│   │   │   ├── stores/
│   │   │   │   └── chat.store.ts
│   │   │   ├── models/
│   │   │   │   ├── chat-message.model.ts
│   │   │   │   └── chat-session.model.ts
│   │   │   └── chatbot.routes.ts
│   │   │
│   │   ├── common/                    # Pages générales
│   │   │   ├── pages/
│   │   │   │   ├── dashboard/         # Dashboard employé
│   │   │   │   ├── not-found/
│   │   │   │   ├── unauthorized/
│   │   │   │   └── error/
│   │   │   └── common.routes.ts
│   │   │
│   │   └── index.ts                   # Export façades
│   │
│   ├── app.routes.ts                  # Routes principales
│   ├── app.config.ts                  # Configuration app (providers)
│   ├── app.component.ts               # Root component
│   ├── app.component.html
│   └── app.component.scss
│
├── assets/
│   ├── icons/
│   ├── images/
│   ├── fonts/
│   └── i18n/
│       ├── fr.json
│       └── en.json
│
├── styles/
│   ├── _variables.scss               # Couleurs, spacing, etc.
│   ├── _mixins.scss
│   ├── _reset.scss
│   ├── _typography.scss
│   ├── _utilities.scss
│   ├── global.scss                   # Global styles
│   └── themes/
│       ├── light-theme.scss
│       └── dark-theme.scss
│
├── environments/
│   ├── environment.ts               # Dev
│   ├── environment.prod.ts          # Prod
│   └── environment.staging.ts       # Staging
│
├── index.html
├── main.ts
└── styles.css
```

---

## 🔐 ROUTING ARCHITECTURE

```typescript
// Route Structure Par Rôle

PUBLIC ROUTES:
├── /auth/login          → LoginComponent
├── /auth/register       → RegisterComponent
├── /404                 → NotFoundComponent
└── /error               → ErrorComponent

AUTHENTICATED ROUTES (ALL ROLES):
├── /dashboard           → DashboardComponent

ADMIN ONLY:
├── /admin/users
├── /admin/roles
└── /admin/system

RH ONLY:
├── /rh/candidates
├── /rh/applications
├── /rh/dashboard
├── /rh/jobs/manage
└── /rh/analytics

EMPLOYEE ONLY:
├── /jobs
├── /jobs/:id
├── /applications
├── /applications/:id
└── /profile

MANAGER:
├── /manager/team
└── /manager/reports
```

---

## 🔌 API GATEWAY ADAPTER PATTERN

### Architecture HTTP

```
┌──────────────────────────────────┐
│  Angular Components              │
└────────────┬─────────────────────┘
             │ uses
             ↓
┌──────────────────────────────────┐
│  Feature Services                │ (JobsService, AuthService, etc.)
│  (Facades - logique métier)      │
└────────────┬─────────────────────┘
             │ calls
             ↓
┌──────────────────────────────────┐
│  Feature Adapters                │ (JobsAdapter, AuthAdapter, etc.)
│  (Transformations, validation)   │
└────────────┬─────────────────────┘
             │ calls
             ↓
┌──────────────────────────────────┐
│  ApiGatewayService               │ (Single HTTP proxy)
│  - HTTP Client wrapper           │
│  - Request/Response interceptors  │
└────────────┬─────────────────────┘
             │
        ┌────┴────┐
        ↓         ↓
    MOCKS      REAL API
   (Dev)      (Backend)
```

### Exemple Flow

**Cas**: Chercher des offres d'emploi avec filtres

```
1. Component appelle JobsService.searchJobs(filters)
   ↓
2. JobsService appelle JobsAdapter.search(filters)
   ↓
3. JobsAdapter valide les données, transforme les filtres
   ↓
4. JobsAdapter appelle ApiGatewayService.get('/jobs', { params: ... })
   ↓
5. ApiGatewayService ajoute JWT, headers, gère erreurs
   ↓
6. [Si MOCK] MockJobsBackend retourne data
   [Si REAL] Vrai backend retourne data
   ↓
7. Response remonte et se transforme
   ↓
8. Component affiche résultat
```

---

## 🛡️ SÉCURITÉ - STRATÉGIE TOKENS

### JWT Flow

```
LOGIN:
1. User → /auth/login (credentials)
2. Backend → returnAccessToken (short-lived: 15min) + RefreshToken (30 days)
3. Frontend → Stocke dans SessionStorage (plus sûr que LocalStorage)

CHAQUE REQUEST:
1. JwtInterceptor extrait token de SessionStorage
2. Ajoute: Authorization: Bearer {token}
3. Backend valide + répond

TOKEN EXPIRATION:
1. Backend retourne 401
2. ErrorInterceptor capture 401
3. RefreshTokenInterceptor essaie refresh via RefreshToken
4. Nouveau AccessToken obtenu
5. Request originel réessayé
6. Si refresh échoue → redirect /login
```

### Stockage Tokens

```
SessionStorage:
  - AccessToken (court terme)
  - RefreshToken (sécurisé dans HttpOnly via backend si possible)

Notes:
- SessionStorage > LocalStorage (auto-clear après fermeture)
- Pas de stockage client du RefreshToken si backend supporte HttpOnly cookies
```

---

## 🎭 AUTORISATION & PERMISSIONS

### Role-Based Access Control (RBAC)

```
User Role:
├── ADMIN
│   ├── Permission: user.read, user.create, user.update, user.delete
│   ├── Permission: role.read, role.create, role.update, role.delete
│   ├── Permission: system.config
│   └── Routes: /admin/**
│
├── RH
│   ├── Permission: candidate.read, candidate.update
│   ├── Permission: job.read, job.create, job.update, job.delete
│   ├── Permission: application.read, application.evaluate
│   └── Routes: /rh/**
│
├── EMPLOYEE
│   ├── Permission: job.read
│   ├── Permission: application.create
│   └── Routes: /jobs/**, /applications/my
│
└── MANAGER
    ├── Permission: team.read
    ├── Permission: reports.read
    └── Routes: /manager/**
```

### Guards par Rôle

```typescript
// Usage dans routing
{
  path: 'admin',
  canActivate: [AdminGuard],  // Vérifie ADMIN role
  children: [ ... ]
}

// Dans composants (masquer UI par role)
<button *appHasRole="'RH'"> Manage Jobs </button>
<div *appHasRole="'ADMIN'"> System Config </div>
```

---

## 💾 MODELS & DTOS (FRONTEND)

### Principales entités

```typescript
// Core Models
User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  permissions: Permission[]
  avatar?: string
  createdAt: Date
}

Job {
  id: string
  title: string
  description: string
  department: string
  location: string
  salary?: number
  status: JobStatus (OPEN, CLOSED, DRAFT)
  createdBy: string
  createdAt: Date
}

Application {
  id: string
  jobId: string
  candidateId: string
  status: ApplicationStatus (PENDING, REVIEWED, ACCEPTED, REJECTED)
  cvUrl: string
  appliedAt: Date
  updatedAt: Date
}

FileUpload {
  id: string
  fileName: string
  fileSize: number
  contentType: string
  uploadUrl: string
  uploadedAt: Date
}

ChatMessage {
  id: string
  sessionId: string
  sender: 'user' | 'bot'
  content: string
  timestamp: Date
}
```

---

## 📊 STATE MANAGEMENT (SIGNALS)

### Pattern avec Signals

```typescript
// Signal-based store (no Redux/NgRx needed for MVP)

@Injectable()
export class JobsStore {
  // Public signals
  jobs$ = signal<Job[]>([])
  loading$ = signal(false)
  error$ = signal<string | null>(null)
  currentPage$ = signal(1)

  // Computed
  totalJobs$ = computed(() => this.jobs$().length)

  // Methods
  loadJobs(filters?: JobFilter) {
    this.loading$.set(true)
    this.jobsAdapter.search(filters).subscribe {
      this.jobs$.set(data)
      this.loading$.set(false)
    }
  }
}

// Usage dans Component
export class JobsListComponent {
  store = inject(JobsStore)
  jobs = this.store.jobs$    // Signal
  loading = this.store.loading$
}
```

---

## 🔌 INTERCEPTORS PIPELINE

```
Outgoing Request:
Request → JwtInterceptor (add token) → LoadingInterceptor (show spinner)

Incoming Response:
Response ← JwtInterceptor (no-op) ← LoadingInterceptor (hide spinner)

Error Response:
ErrorResponse → RefreshTokenInterceptor (try refresh)
            → ErrorInterceptor (log, notifications)
            → User (toast/redirect)
```

---

## 📦 DÉPENDANCES REQUISES

```json
{
  "dependencies": {
    "@angular/platform-browser": "^21.2.0",
    "@angular/common": "^21.2.0",
    "@angular/core": "^21.2.0",
    "@angular/forms": "^21.2.0",
    "@angular/router": "^21.2.0",
    "@angular/material": "^21.0.0",
    "rxjs": "^7.8.0",
    "date-fns": "^3.0.0",
    "lodash-es": "^4.17.21"
  },
  "devDependencies": {
    "typescript": "^5.9.2",
    "vitest": "^4.0.0",
    "@angular/cli": "^21.2.0",
    "@angular/compiler-cli": "^21.2.0"
  }
}
```

---

## ✅ CHECKLIST SPRINTS

### SPRINT 1: Auth & Admin

- [ ] JWT interceptor + token storage
- [ ] Auth service + guards par rôle
- [ ] Login page + register page
- [ ] Admin users management CRUD
- [ ] Mock backend auth
- [ ] Tests auth flow

### SPRINT 2: Jobs

- [ ] Jobs list page (employee + RH)
- [ ] Job detail page
- [ ] Search + filters
- [ ] Job form (RH only)
- [ ] Mock jobs data
- [ ] Services & stores

### SPRINT 3: Applications & Files

- [ ] Application form
- [ ] CV upload component
- [ ] My applications list
- [ ] Application status timeline
- [ ] File service with mocks

### SPRINT 4: Dashboard RH & ChatBot

- [ ] Dashboard RH overview
- [ ] Statistics & charts
- [ ] ChatBot widget integration
- [ ] Chat message service

### SPRINT 5: Quality & DevOps

- [ ] Unit tests (90%+ coverage)
- [ ] E2E tests (user flows)
- [ ] Environment configs
- [ ] Build optimization
- [ ] Documentation

---

## 🎨 DESIGN SYSTEM

### Material Theme

```scss
// colors
$primary: #2196F3      // Blue
$accent: #FF4081       // Pink
$warning: #FF9800      // Orange
$success: #4CAF50      // Green
$error: #F44336        // Red
$neutral: #757575      // Gray

// spacing (8px base)
$spacing-xs: 4px
$spacing-sm: 8px
$spacing-md: 16px
$spacing-lg: 24px
$spacing-xl: 32px

// typography
$font-primary: 'Roboto', sans-serif
$fs-h1: 32px
$fs-h2: 28px
$fs-body: 14px
$fs-caption: 12px
```

---

## 🌍 INTERNATIONALISATION (i18n)

```json
// assets/i18n/fr.json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer"
  },
  "jobs": {
    "list": "Offres d'emploi",
    "filters": "Filtres"
  }
}

// assets/i18n/en.json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "jobs": {
    "list": "Job Listings",
    "filters": "Filters"
  }
}
```

---

## 📈 PERFORMANCE TARGETS

- ✅ Lazy loaded modules
- ✅ OnPush change detection
- ✅ Tree-shaking enabled
- ✅ Bundle size < 500KB (main)
- ✅ LCP < 2.5s
- ✅ FID < 100ms

---

## 🚀 NEXT STEPS

1. ✅ Refactor core auth (JWT, guards, interceptors)
2. ✅ Setup API Gateway + adapters
3. ✅ Create feature folders + routing
4. ✅ Build shared components library
5. ✅ Implement Material theming
6. ✅ Add i18n
7. ⏳ Progressive backend integration
