# ✅ BONNES PRATIQUES & RECOMMANDATIONS PROFESSIONNELLES

## 1. Principes d'Architecture Appliqués

### Clean Architecture

✅ Séparation claire des responsabilités

- **Adapters** = Bridge entre services et API
- **Services** = Business logic
- **Components** = Présentation uniquement
- **Guards** = Sécurité

### SOLID Principles

**S - Single Responsibility**

- Chaque service/component a UNE responsabilité
- Exemple: `JobsService` = CRUD jobs, `JobsAdapter` = transformations API

**O - Open/Closed**

- Code ouvert à l'extension via adapters, guards, interceptors
- Fermé à la modification (patterns génériques)

**L - Liskov Substitution**

- Tous les guards implémentent la même interface
- Tous les adapters implémentent le même pattern

**I - Interface Segregation**

- Models petits et spécialisés (JobFilter, UserCredentials, etc.)
- Pas d'objets "fourre-tout"

**D - Dependency Injection**

- Tout en @Injectable()
- Angular injecte automatiquement les dépendances

---

## 2. Structure de Dossiers - Justifications

```
core/          → Logique non-réutilisable
├─ api/        → Centraliser HTTP (adapters + gateway)
├─ auth/       → Authentification (tokens, credentials)
├─ guards/     → Sécurité (role-based access)
└─ models/     → DTOs partagés

shared/        → Réutilisable across les features
├─ components/ → UI génériques (button, card, etc.)
├─ pipes/      → date formatting, truncate, etc.
├─ directives/ → *appHasRole, *appClickOutside
└─ services/   → Notifications, dialog, etc.

features/      → Domaines métier
└─ {feature}/
   ├─ pages/       → Route components
   ├─ components/  → Feature-specific UI
   ├─ services/    → Business logic
   ├─ stores/      → State local (Signals)
   ├─ models/      → Feature DTOs
   └─ {feature}.routes.ts
```

---

## 3. State Management - Strategy Signals

### Pourquoi PAS Redux/NgRx pour MVP?

- ❌ **Complexité excessive** pour première itération
- ❌ **Learning curve** pour développeurs
- ✅ **Signals** natifs Angular = excellent rapport complexité/puissance

### Pattern Recommandé:

```typescript
// jobs.store.ts
@Injectable({
  providedIn: 'root',
})
export class JobsStore {
  // Signals
  jobs$ = signal<Job[]>([]);
  loading$ = signal(false);
  error$ = signal<string | null>(null);

  // Computeds (auto-recalc quand signal change)
  totalJobs$ = computed(() => this.jobs$().length);

  // Methods - mutent les signals
  loadJobs(filter?: JobFilter) {
    this.loading$.set(true);
    this.jobsAdapter.search(filter).subscribe({
      next: (data) => {
        this.jobs$.set(data);
        this.error$.set(null);
      },
      error: (err) => {
        this.error$.set(err.message);
      },
      complete: () => this.loading$.set(false),
    });
  }
}

// Dans le composant
export class JobsListComponent {
  store = inject(JobsStore);

  // Template
  jobs = this.store.jobs$; // Signal ← reactive
  isLoading = this.store.loading$;
  total = this.store.totalJobs$;
}
```

### Évolution Future vers NgRx:

Si la complexité augmente (ex: collaboration temps réel, multi-user):

```
Phase 1 (NOW): Signals
    ↓ (quand >5 features complexes)
Phase 2: NgRx + Effects (pour state global)
```

---

## 4. Typing Strict - TypeScript Rigoreux

### ✅ DO:

```typescript
// Feature model bien typé
export interface Job {
  id: string;
  title: string;
  status: JobStatus; // enum, pas string
  salary?: number;
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

// Service avec types génériques
@Injectable()
export class JobsService {
  getJobs(filter: JobFilter): Observable<PaginatedResponse<Job>> {
    return this.adapter.search(filter);
  }
}
```

### ❌ DON'T:

```typescript
// any = perte de typage
getJobs(): Observable<any> { }

// strings plutôt qu'enums
status: 'DRAFT' | 'OPEN' // Fragile

// Types trop génériques
interface Data { }
function process(data: Data): any { }
```

---

## 5. Change Detection - Performance OnPush

### Tous les composants = OnPush

```typescript
@Component({
  selector: 'app-job-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
})
export class JobListComponent {
  @Input() jobs: Job[]; // Input de parent

  // Les Signals transforment auto OnPush en réactif
  store = inject(JobsStore);
  jobs$ = this.store.jobs$;
}
```

**Impact:**

- ✅ Détection de changement uniquement quand inputs changent
- ✅ Performances 2-3x meilleures avec listes longues
- ✅ Requis pour zoneless Angular (futur)

---

## 6. Lazy Loading des Features

```typescript
// app.routes.ts
{
  path: 'jobs',
  canActivate: [EmployeeGuard],
  loadComponent: () =>
    import('./features/jobs/pages/jobs-list/jobs-list.component')
      .then(m => m.JobsListComponent),  // ← Code splitting
}
```

**Bénéfices:**

- Bundle initial: ~150KB (sans jobs feature)
- Jobs feature chargée ON-DEMAND: ~50KB
- User RH ne la voit pas du tout ✅

---

## 7. Gestion d'Erreurs - Pattern Centralisé

```typescript
// ❌ BAD: Erreur nonnel dans chaque component
try {
  const job = await this.api.get('/job/1').toPromise();
} catch (e) {
  alert('Erreur!');
}

// ✅ GOOD: Centralisé
ErrorInterceptor -> NotificationService {
  const msg = this.mapErrorToUserMessage(error);
  this.notificationService.error(msg);
}
```

---

## 8. Internationalisation - i18n Setup

```json
// assets/i18n/fr.json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer"
  },
  "jobs": {
    "noResults": "Aucune offre trouvée",
    "applying": "Candidature en cours..."
  }
}
```

```typescript
// Component
export class JobListComponent {
  i18n = inject(I18nService);

  template: `{{ 'jobs.noResults' | translate }}`;
}
```

---

## 9. Material Design Theming

```scss
// styles/_variables.scss
$primary-color: #2196f3;
$accent-color: #ff4081;
$warn-color: #f44336;

// Dark mode ready
$dark-bg: #121212;
$light-text: #ffffff;

// Spacing system (8px base)
$spacing: (
  'xs': 4px,
  'sm': 8px,
  'md': 16px,
  'lg': 24px,
  'xl': 32px,
);
```

---

## 10. Testing Strategy

### Unit Tests (Vitest)

```typescript
describe('JobsAdapter', () => {
  it('should search jobs with filters', () => {
    const adapter = new JobsAdapter(apiGateway);
    adapter.getJobs({ department: 'Engineering' }).subscribe((data) => {
      expect(data.data.length).toBeGreaterThan(0);
    });
  });
});
```

### E2E Tests (Cypress/Playwright)

```typescript
describe('Employee Job Application Flow', () => {
  it('should apply to a job successfully', () => {
    cy.visit('/');
    cy.login('emp@test.com', 'password');
    cy.contains('a', 'Jobs').click();
    cy.contains('Senior Angular Developer').click();
    cy.contains('button', 'Apply').click();
    cy.contains('Application submitted').should('be.visible');
  });
});
```

---

## 11. Documentation Code - JSDoc

```typescript
/**
 * JobsAdapter - Adapter pour le service des offres d'emploi
 *
 * Responsabilité:
 * - Transformer requêtes/réponses métier
 * - Valider les données
 * - Fournir alternance mock/real
 *
 * @example
 * const adapter = inject(JobsAdapter);
 * adapter.getJobs({ department: 'Engineering' }).subscribe(jobs => {...});
 */
@Injectable({
  providedIn: 'root',
})
export class JobsAdapter {
  /**
   * Récupère les offres avec filtrage et pagination
   * @param filter - Critères de recherche
   * @returns Réponse paginée avec les offres
   */
  getJobs(filter: JobFilter): Observable<PaginatedApiResponse<Job>> {
    // ...
  }
}
```

---

## 12. Continuous Improvement Plan

### Phase 1 (Sprints 1-3): MVP Stable

- [ ] Features de base fonctionnelles
- [ ] Tests unitaires 50%+
- [ ] Mocks backend opérationnels

### Phase 2 (Sprint 4-5): Polish

- [ ] Tests unitaires 80%+
- [ ] E2E tests clés
- [ ] Performance optimisée

### Phase 3 (Post-MVP): Enterprise-Ready

- [ ] Tests 90%+
- [ ] Monitoring en prod
- [ ] Analytics users
- [ ] Migration vers NgRx (si complexité++)
- [ ] PWA offline support

---

## 13. Checklist Code Review

Avant merge/PR:

- [ ] Types stricts (pas de `any`)
- [ ] OnPush change detection utilisé
- [ ] Error handling centralisé
- [ ] Pas de subscription non-cleanup
- [ ] Models/enums correctement typés
- [ ] Adapters utilisés pour API calls
- [ ] Lazy loading configuré
- [ ] Tests couvrent >80% du code
- [ ] JSDoc pour fonctions publiques
- [ ] No console.log() en prod

---

## 14. Performance Targets

| Métrique                       | Target | Current |
| ------------------------------ | ------ | ------- |
| LCP (Largest Contentful Paint) | <2.5s  | -       |
| FID (First Input Delay)        | <100ms | -       |
| CLS (Cumulative Layout Shift)  | <0.1   | -       |
| Bundle Size (main)             | <500KB | -       |
| Bundle Size (lazy feature)     | <100KB | -       |

---

## 15. Git Workflow Recommandé

```bash
# Sprint branch
git checkout -b sprint-1-auth

# Feature branch
git checkout -b feature/login-form

# Commit messages (conventional)
git commit -m "feat(auth): add login component"
git commit -m "fix(jobs): handle empty results"
git commit -m "docs(readme): update setup instructions"

# PR process:
# 1. Push feature branch
# 2. Create PR with description
# 3. Code review
# 4. Squash merge to sprint branch
```
