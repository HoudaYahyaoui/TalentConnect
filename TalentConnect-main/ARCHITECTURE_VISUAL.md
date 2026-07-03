# 🎨 ARCHITECTURE VISUELLE - TalentConnect Frontend

## 1. Application Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TALENTCONNECT FRONTEND                       │
│                      (Angular 21 Standalone)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    [USERS]          [EMPLOYEES]        [RH/MANAGERS]
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼─────┐
                    │  Router    │
                    │ (app.routes)
                    └──────┬─────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    [Auth Routes]    [Protected Routes]  [Admin Routes]
    /login           /app/jobs            /app/admin
    /register        /app/applications    /app/rh
                     /app/dashboard
                           │
                    ┌──────▼─────────────┐
                    │  Guards Apply      │
                    │  (AuthGuard,       │
                    │   RoleGuards)      │
                    └──────┬─────────────┘
                           │
                    ┌──────▼──────────┐
                    │  Components     │
                    │  Render         │
                    └──────┬──────────┘
                           │
                    ┌──────▼──────────┐
                    │  HTTP Calls     │
                    │  (via Service)  │
                    └──────┬──────────┘
                           │
                    ┌──────▼──────────────────┐
                    │  Interceptors Pipeline  │
                    │  1. JWT                 │
                    │  2. Loading             │
                    │  3. RefreshToken        │
                    │  4. Error               │
                    └──────┬──────────────────┘
                           │
                    ┌──────▼──────────────────┐
                    │   Adapters              │
                    │  Transform & Validate   │
                    └──────┬──────────────────┘
                           │
            ┌──────────────┴────────────────┐
            │                               │
            ▼                               ▼
        [MOCKS]                        [REAL API]
     (environment:                   (environment:
      useMocks=true)                  useMocks=false)
            │                               │
            └──────────────┬────────────────┘
                           │
                    ┌──────▼──────────┐
                    │  API Gateway    │
                    │  (Backend)      │
                    └─────────────────┘
```

---

## 2. Feature-Based Module Structure

```
TalentConnect Frontend
│
├─ Core (Non-reusable)
│  ├─ api/
│  │  ├─ api-gateway.service
│  │  └─ adapters/
│  │     ├─ auth.adapter ┐
│  │     ├─ jobs.adapter ├─► Isolated & Mockable
│  │     └─ apps.adapter ┘
│  │
│  ├─ auth/
│  │  ├─ auth.service
│  │  ├─ jwt-storage.service
│  │  ├─ models/
│  │  │  ├─ jwt-token
│  │  │  └─ user-credentials
│  │  └─ interceptors/
│  │     ├─ jwt.interceptor
│  │     ├─ loading.interceptor
│  │     ├─ refresh-token.interceptor
│  │     └─ error.interceptor
│  │
│  ├─ guards/
│  │  ├─ auth.guard
│  │  ├─ admin.guard
│  │  ├─ rh.guard
│  │  ├─ employee.guard
│  │  └─ public.guard
│  │
│  ├─ models/ (Shared DTOs)
│  │  ├─ user.model
│  │  ├─ permission.model
│  │  └─ pagination.model
│  │
│  ├─ resolvers/
│  │  └─ data preload
│  │
│  └─ state/ (Global state - optional)
│
├─ Shared (Reusable)
│  ├─ components/
│  │  ├─ layouts/
│  │  │  ├─ app-layout
│  │  │  ├─ auth-layout
│  │  │  └─ admin-layout
│  │  ├─ common/ (UI components)
│  │  │  ├─ button
│  │  │  ├─ card
│  │  │  ├─ modal
│  │  │  └─ spinner
│  │  ├─ feedback/
│  │  │  ├─ toast
│  │  │  ├─ snackbar
│  │  │  └─ alert
│  │  └─ forms/ (Form inputs)
│  │     ├─ input-field
│  │     ├─ select
│  │     └─ date-picker
│  │
│  ├─ pipes/
│  │  ├─ date-format
│  │  ├─ truncate
│  │  └─ highlight
│  │
│  ├─ directives/
│  │  ├─ has-role
│  │  ├─ has-permission
│  │  └─ click-outside
│  │
│  ├─ services/
│  │  ├─ notification.service
│  │  ├─ dialog.service
│  │  ├─ loading.service
│  │  └─ storage.service
│  │
│  ├─ theme/ (Material theming)
│  │  └─ design system
│  │
│  └─ models/ (Shared models)
│
└─ Features (Lazy-loaded domains)
   │
   ├─ auth/
   │  ├─ pages/
   │  │  ├─ login
   │  │  └─ register
   │  ├─ services/
   │  │  └─ auth-facade
   │  ├─ models/
   │  │  └─ auth-form
   │  └─ auth.routes
   │
   ├─ admin/ (ADMIN only)
   │  ├─ pages/
   │  │  ├─ users-list
   │  │  ├─ user-create
   │  │  └─ roles-list
   │  ├─ components/
   │  │  └─ user-form
   │  ├─ services/
   │  │  └─ admin.service
   │  └─ admin.routes
   │
   ├─ jobs/ (RH + EMPLOYEE)
   │  ├─ pages/
   │  │  ├─ jobs-list
   │  │  ├─ job-detail
   │  │  ├─ job-create (RH)
   │  │  └─ job-edit (RH)
   │  ├─ components/
   │  │  ├─ job-card
   │  │  └─ job-filters
   │  ├─ services/
   │  │  ├─ jobs.service
   │  │  └─ jobs-facade
   │  ├─ stores/
   │  │  └─ jobs.store (Signals)
   │  ├─ models/
   │  │  └─ job.model
   │  └─ jobs.routes
   │
   ├─ applications/ (EMPLOYEE apply + RH review)
   │  ├─ pages/
   │  │  ├─ my-applications
   │  │  ├─ applications-list (RH)
   │  │  ├─ application-detail
   │  │  └─ apply-to-job
   │  ├─ components/
   │  │  ├─ application-form
   │  │  └─ cv-upload
   │  ├─ services/
   │  │  └─ applications.service
   │  ├─ stores/
   │  │  └─ applications.store
   │  ├─ models/
   │  │  └─ application.model
   │  └─ applications.routes
   │
   ├─ files/ (CV upload)
   │  ├─ services/
   │  │  ├─ file-upload.service
   │  │  └─ file-facade.service
   │  └─ models/
   │     └─ file-upload.model
   │
   ├─ dashboard-rh/ (RH only)
   │  ├─ pages/
   │  │  ├─ dashboard
   │  │  └─ analytics
   │  ├─ components/
   │  │  ├─ stat-card
   │  │  └─ chart-widget
   │  ├─ services/
   │  │  └─ dashboard.service
   │  ├─ models/
   │  │  └─ dashboard-stats
   │  └─ dashboard.routes
   │
   ├─ chatbot/ (Global)
   │  ├─ components/
   │  │  └─ chatbot-widget
   │  ├─ services/
   │  │  └─ chatbot.service
   │  ├─ stores/
   │  │  └─ chat.store
   │  └─ models/
   │     └─ chat-message
   │
   └─ common/ (General pages)
      ├─ pages/
      │  ├─ dashboard (for all users)
      │  ├─ profile
      │  ├─ not-found
      │  ├─ unauthorized
      │  └─ error
      └─ common.routes
```

---

## 3. HTTP Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│          COMPONENT INITIATES ACTION                             │
│  e.g., User clicks "Search Jobs"                               │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  COMPONENT CALLS SERVICE                                        │
│  this.jobsService.searchJobs(filter)                            │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  SERVICE CALLS ADAPTER                                          │
│  this.jobsAdapter.search(filter)                                │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ADAPTER VALIDATES & TRANSFORMS                                 │
│  Validates filter shape, normalizes data                        │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ADAPTER CHECKS MOCK MODE                                       │
│  if (environment.useMocks) → return mockData()                  │
│  else → call ApiGatewayService                                  │
└────────────┬────────────────────────────────────────────────────┘
             │
      ┌──────┴────────┐
      │               │
      ▼               ▼
   [MOCK]          [REAL API]
  return of()      call HTTP
      │               │
      └───────┬───────┘
              │
              ▼
   ┌─────────────────────────────────────────────┐
   │  HTTP REQUEST → INTERCEPTORS PIPELINE       │
   └─────────────────────────────────────────────┘
              │
              ▼
   ┌─────────────────────────────────────────────┐
   │  1. JWT INTERCEPTOR                         │
   │  ├─ Check if public route (login, register)│
   │  ├─ If not: Get token from sessionStorage  │
   │  └─ Add header: Authorization: Bearer {tok}│
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │  2. LOADING INTERCEPTOR                     │
   │  └─ Show spinner                            │
   └────────────┬────────────────────────────────┘
                │
                ▼
   ┌─────────────────────────────────────────────┐
   │  HTTP REQUEST SENT TO API GATEWAY           │
   │  GET /api/jobs?department=Engineering       │
   └────────────┬────────────────────────────────┘
                │
         ┌──────┴──────┐
         │             │
         ▼             ▼
    [2XX OK]      [4XX/5XX ERROR]
         │             │
         └─────┬───────┘
               │
               ▼
   ┌─────────────────────────────────────────────┐
   │  HTTP RESPONSE RECEIVED                     │
   └────────────┬────────────────────────────────┘
                │
                ├─── [2XX SUCCESS] ──────┐
                │                        │
                ▼                        │
   ┌──────────────────────────┐          │
   │  LOADING INTERCEPTOR     │          │
   │  Hide spinner            │          │
   └────────────┬─────────────┘          │
                │                        │
                ▼                        │
   ┌──────────────────────────┐          │
   │  ERROR INTERCEPTOR       │          │
   │  (no error)              │          │
   └────────────┬─────────────┘          │
                │                        │
                │◄───────────────────────┤
                │                        │
                ▼                        │
         ┌─────────────────┐             │
         │  Transform     │             │
         │  response      │             │
         │  data          │             │
         └────────┬────────┘             │
                  │                      │
         ┌────────▼────────┐             │
         │ Adapter maps to │             │
         │ frontend models │             │
         └────────┬────────┘             │
                  │                      │
                  ▼                      │
         ┌─────────────────┐             │
         │  Return Observ. │             │
         │  to service     │             │
         └────────┬────────┘             │
                  │                      │
                  ▼                      │
         ┌─────────────────┐             │
         │  Service pipes  │             │
         │  result to      │             │
         │  store/cache    │             │
         └────────┬────────┘             │
                  │                      │
                  ▼                      │
         ┌─────────────────┐             │
         │  Component      │             │
         │  updates UI     │             │
         │  (display jobs) │             │
         └─────────────────┘             │
                                         │
                                    [ERROR]
                                         │
                          ┌──────────────▼───────┐
                          │ ERROR INTERCEPTOR    │
                          │ Check status code    │
                          ├──────────────────────┤
                          │ 401 Unauthorized?    │
                          │ ├─ Try refresh token │
                          │ ├─ Retry request     │
                          │ └─ If fail→ logout   │
                          ├──────────────────────┤
                          │ 403 Forbidden?       │
                          │ └─ Show alert        │
                          ├──────────────────────┤
                          │ Other errors?        │
                          │ └─ Show toast        │
                          └──────────────────────┘
                                         │
                          ┌──────────────▼───────┐
                          │ LOADING INTERCEPTOR  │
                          │ Hide spinner         │
                          └──────────────────────┘
                                         │
                          ┌──────────────▼───────┐
                          │ Component error      │
                          │ handler              │
                          └──────────────────────┘
```

---

## 4. Role-Based Routing & Access Control

```
┌──────────────────────────────────────────────────────────────┐
│                    USER AUTHENTICATES                        │
│  username/password → Backend verifies → JWT token issued     │
└────────────┬─────────────────────────────────────────────────┘
             │ Token + role stored in sessionStorage
             ▼
┌──────────────────────────────────────────────────────────────┐
│                    USER NAVIGATES                            │
│  e.g., tries to access /app/admin/users                      │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│              ROUTER EVALUATES ROUTE CONFIG                   │
│  {                                                           │
│    path: 'admin',                                            │
│    canActivate: [AdminGuard],  ← CHECK THIS GUARD            │
│    children: [...]                                           │
│  }                                                           │
└────────────┬─────────────────────────────────────────────────┘
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│              ADMIN GUARD CHECKS                              │
│  1. Is user authenticated?                                   │
│     NO → Redirect /auth/login                                │
│     YES ↓                                                    │
│  2. Does user have ADMIN role?                               │
│     NO → Redirect /unauthorized                              │
│     YES ↓                                                    │
│  3. Allow route navigation                                   │
└────────────┬─────────────────────────────────────────────────┘
             │
      ┌──────┴─────────┐
      │                │
      ▼                ▼
 [ALLOWED]        [DENIED]
      │                │
      ▼                ▼
[Load                 [Show
Component]         Error
                    Page]


GUARD LOGIC EXAMPLE:

canActivate(route: ActivatedRouteSnapshot): boolean {
  if (!this.authService.isAuthenticated()) {
    this.router.navigate(['/auth/login']);
    return false;
  }

  if (this.authService.getUserRole() !== 'ADMIN') {
    this.router.navigate(['/unauthorized']);
    return false;
  }

  return true;  ← ALLOW
}
```

---

## 5. Signals & Reactive State Flow

```
┌─────────────────────────────────────────────────────────────┐
│              COMPONENT INITIALIZES                          │
│  constructor() { store = inject(JobsStore) }               │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              COMPONENT LOADS DATA                           │
│  ngOnInit() { this.store.loadJobs(filters) }               │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              STORE (JobsStore)                              │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─► loading$.set(true)
             │
             ├─► Ask adapter for data
             │
             └─► On response:
                 │
                 ├─► jobs$.set(data)
                 │
                 ├─► loading$.set(false)
                 │
                 └─► error$.set(null)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│     SIGNAL CHANGES → COMPONENT AUTO-UPDATES (OnPush)        │
│                                                             │
│  Template subscribers:                                     │
│  - {{ jobs$ | async }}  → Auto-unwraps signal              │
│  - *ngIf="loading$()"   → Reactive                         │
│  - {{ (total$ | async) }}  → Computed value                │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
        [UI UPDATES]


SIGNAL REACTIVE CHAIN:

Store:
  jobs$ = signal<Job[]>([])
    ↓
  computed jobs count = computed(() => jobs$().length)
    ↓
  Component template
    ├─ <div *ngIf="(jobs$().length > 0)">
    ├─ <div *ngFor="let job of jobs$()"
    └─ "Total: {{ totalJobs$() }}"
       └─ Auto-updates when jobs$ changes!
```

---

## 6. Adapter Pattern Switching Mock ↔ Real

```
┌─────────────────────────────────────────────┐
│          ADAPTER DECISION POINT              │
└────────────┬────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────┐
│  Check: environment.useMocks                │
└────────────┬────────────────────────────────┘
             │
      ┌──────┴───────┐
      │              │
      ▼              ▼
 [useMocks=   [useMocks=
  true]        false]
      │              │
      ▼              ▼
┌──────────┐   ┌──────────────────────┐
│ MOCK     │   │ REAL BACKEND         │
│ FLOW     │   │ FLOW                 │
├──────────┤   ├──────────────────────┤
│ of([     │   │ apiGateway.get(      │
│   {...}, │   │   '/jobs',           │
│   {...}  │   │   params             │
│ ]).pipe( │   │ ).pipe(              │
│ delay()  │   │ map(res => res.data) │
│ )        │   │ )                    │
└──────────┘   └──────────────────────┘
      │              │
      │ Both emit    │
      │ Job[].     │
      │ Same type  │
      │              │
      └──────┬───────┘
             │
             ▼
    ┌──────────────┐
    │ Adapter      │
    │ Returns same │
    │ Observable   │
    │ Regardless   │
    └────────┬─────┘
             │
             ▼
    ┌──────────────┐
    │ Service      │
    │ doesn't care │
    │ if mock or   │
    │ real - same  │
    │ interface!   │
    └──────────────┘

TO SWITCH (one line change):

environment.ts:
  export const environment = {
    useMocks: true   ← Change to false for real API
  };

That's it! No code changes needed in components/services/adapters!
```

---

## 7. Security: JWT Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│              USER LOGS IN                                   │
│  Email + Password → POST /auth/login                        │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│          BACKEND VALIDATES CREDENTIALS                      │
│  Database lookup → Password hash check                      │
└────────────┬────────────────────────────────────────────────┘
             │
        ┌────┴───┐
        │         │
        ▼         ▼
    INVALID    VALID
        │         │
     [Error]  ┌──▼──────────────────────────────────┐
              │  CREATE JWT ACCESS TOKEN (15 min)   │
              │  Payload:                           │
              │  {                                  │
              │    sub: user-id,                    │
              │    email: user@mail.com,            │
              │    role: "EMPLOYEE",                │
              │    permissions: [...],              │
              │    exp: now + 900s                  │
              │  }                                  │
              └──┬──────────────────────────────────┘
                 │
                 ├─ Sign with SECRET_KEY
                 │
                 ▼
         ┌───────────────┐
         │ token returned│
         │ to frontend   │
         └────────┬──────┘
                  │
                  ▼
      ┌──────────────────────────────┐
      │ FRONTEND STORES:             │
      │ sessionStorage['access_token'│
      │ = 'eyJhbGc...'              │
      └────────┬─────────────────────┘
               │
        ┌──────┴─────────┐
        │                │
        ▼                ▼
  [WITHIN 15 MIN]  [AFTER 15 MIN]
        │                │
        ▼                ▼
   Each request      API returns 401
   includes token    Unauthorized
   in header
        │                │
        │                ▼
        │        ┌────────────────────┐
        │        │ REFRESH TOKEN FLOW │
        │        │                    │
        │        │ Send refresh token │
        │        │ to /auth/refresh   │
        │        │                    │
        │        │ Backend validates  │
        │        │ refresh token      │
        │        │                    │
        │        │ Return new JWT     │
        │        │ (another 15 min)   │
        │        └────────┬───────────┘
        │                 │
        │        ┌────────▼─────────┐
        │        │ Retry original   │
        │        │ request with new │
        │        │ token            │
        │        └────────┬─────────┘
        │                 │
        │                 ▼
        │        ┌─────────────────┐
        │        │ If refresh FAILS│
        │        │ or no token:    │
        │        │ Redirect LOGIN  │
        │        └─────────────────┘
        │
        └─────────────────┬────────────────┐
                          │                │
                          ▼                ▼
                    [REQUEST OK]      [TOKEN EXPIRED
                    ┌─◄── Keep using  MANY TIMES]
                    │     same token   │
                    │     until exp.   ▼
                    │              [LOGOUT REQUIRED]
                    │
                    ▼
          ┌──────────────────────┐
          │ USER LOGOUT          │
          │                      │
          │ sessionStorage.clear()│
          │ = Remove all tokens  │
          │                      │
          │ Redirect /login      │
          └──────────────────────┘
```

---

## 8. Permission-Based UI Masking

```
┌────────────────────────────────────────────┐
│          RENDER COMPONENT                  │
│  Should show "Manage Jobs" button?         │
└────────┬────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────┐
│   *appHasRole="'RH'"  DIRECTIVE            │
│  Check current user role                   │
└────────┬────────────────────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
 ROLE=RH   ROLE≠RH
    │          │
    ▼          ▼
 [SHOW]    [HIDE]
    │          │
    ▼          ▼
┌─────────────────────────────────────────────┐
│  HTML RENDERED OR NOT (not just disabled)   │
└─────────────────────────────────────────────┘

TEMPLATE EXAMPLE:

<button
  *appHasRole="'RH'"
  (click)="createJob()"
>
  Manage Jobs
</button>

<!-- This button only rendered if user.role === 'RH' -->
<!-- Hidden in DOM for EMPLOYEE (security + UX) -->
```

---

## Summary: Data Flow End-to-End

```
USER ACTION
    ↓
COMPONENT
    ↓
SERVICE (Business Logic)
    ↓
ADAPTER (Transformation)
    ↓
API GATEWAY (HTTP proxy)
    ↓
INTERCEPTORS
  ├─ JWT (add token)
  ├─ Loading (spinner)
  ├─ Refresh (auto-renew)
  └─ Error (handle failures)
    ↓
MOCK or REAL BACKEND
    ↓
RESPONSE BACK through interceptors
    ↓
ADAPTER transforms to frontend models
    ↓
SERVICE stores in Store (Signals)
    ↓
COMPONENT observes Signal changes
    ↓
TEMPLATE UPDATES (OnPush change detection)
    ↓
USER SEES RESULT ✅
```

---

Everything is connected and ready to implement!
