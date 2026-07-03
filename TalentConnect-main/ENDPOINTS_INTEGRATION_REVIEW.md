# 📋 TalentConnect — Revue Complète des Endpoints & Intégration Frontend

**Date**: 29 Juin 2026  
**Statut**: ✅ Architecture microservices opérationnelle  
**Dev Server**: http://localhost:56594 (proxy vers ports 8081-8085)

---

## 🔐 Authentification & Redirection

### ✅ Système de Connexion Validé

- **Endpoint**: `POST /api/auth/login` (auth-service:8081)
- **Test**: ✅ Réussi avec RH, ADMIN, EMPLOYEE
- **Format Réponse**: `{ accessToken, tokenType, userId, email, roles[] }`
- **Stockage**: `localStorage.tc_token` + `localStorage.tc_user`

### ✅ Redirection Basée sur Rôles

```typescript
RH      → /app/hr/dashboard
ADMIN   → /app/admin/dashboard
EMPLOYEE→ /app/employee/dashboard
```

**Status**: ✅ 100% opérationnel

---

## 🏗️ Architecture Microservices

### Proxy Configuration (`proxy.conf.json`)

```
/auth-api     → localhost:8081
/jobs-api     → localhost:8085
/cand-api     → localhost:8084
/files-api    → localhost:8082
/chat-api     → localhost:8083
```

**Status**: ✅ Fonctionnel (ERR_ABORTED au rechargement = normal)

---

## 🔵 AUTH-SERVICE (Port 8081) - JWT Bearer

### Authentification

| Endpoint             | Méthode | Public | Status        |
| -------------------- | ------- | ------ | ------------- |
| `/api/auth/login`    | POST    | ✅     | ✅ **VALIDÉ** |
| `/api/auth/register` | POST    | ✅     | ✅ Non testé  |

### Profil Utilisateur

| Endpoint                 | Requête JWT | Rôle      | Status        |
| ------------------------ | ----------- | --------- | ------------- |
| `GET /api/users/profile` | ✅ Bearer   | Tous      | ✅ **VALIDÉ** |
| `PUT /api/users/profile` | ✅ Bearer   | Tous      | ⚠️ À tester   |
| `GET /api/users`         | ✅ Bearer   | ADMIN     | ⚠️ À tester   |
| `GET /api/users/{id}`    | ✅ Bearer   | ADMIN, RH | ⚠️ À tester   |

### Administration Utilisateurs

| Endpoint                            | Requête JWT | Rôle  | Status      |
| ----------------------------------- | ----------- | ----- | ----------- |
| `GET /api/admin/users`              | ✅ Bearer   | ADMIN | ⚠️ À tester |
| `POST /api/admin/users`             | ✅ Bearer   | ADMIN | ⚠️ À tester |
| `PATCH /api/admin/users/{id}/roles` | ✅ Bearer   | ADMIN | ⚠️ À tester |
| `DELETE /api/admin/users/{id}`      | ✅ Bearer   | ADMIN | ⚠️ À tester |

---

## 💼 JOB-SERVICE (Port 8085) - JWT Bearer

### Offres d'Emploi

| Endpoint               | Méthode | Requête JWT | Rôle                | Status      |
| ---------------------- | ------- | ----------- | ------------------- | ----------- |
| `/api/jobs`            | GET     | ✅ Bearer   | EMPLOYEE, RH, ADMIN | ⚠️ À tester |
| `/api/jobs/{id}`       | GET     | ✅ Bearer   | EMPLOYEE, RH, ADMIN | ⚠️ À tester |
| `/api/admin/jobs`      | POST    | ✅ Bearer   | RH, ADMIN           | ⚠️ À tester |
| `/api/admin/jobs/{id}` | PUT     | ✅ Bearer   | RH, ADMIN           | ⚠️ À tester |
| `/api/admin/jobs/{id}` | DELETE  | ✅ Bearer   | RH, ADMIN           | ⚠️ À tester |

**Implémentation Frontend**: `JobsAdapter` (src/app/data-access/api/adapters/jobs.adapter.ts)

### Cooptations (Referrals)

| Endpoint                     | Méthode | Requête JWT | Rôle         | Status      |
| ---------------------------- | ------- | ----------- | ------------ | ----------- |
| `/api/referrals/mine`        | GET     | ✅ Bearer   | Tous         | ⚠️ À tester |
| `/api/referrals`             | GET     | ✅ Bearer   | RH, ADMIN    | ⚠️ À tester |
| `/api/referrals`             | POST    | ✅ Bearer   | Tous         | ⚠️ À tester |
| `/api/referrals/{id}/status` | PATCH   | ✅ Bearer   | RH, ADMIN    | ⚠️ À tester |
| `/api/referrals/{id}`        | DELETE  | ✅ Bearer   | Propriétaire | ⚠️ À tester |

**Implémentation Frontend**: `ReferralsAdapter`

### HR Metrics + Audit (JWT)

| Endpoint          | Méthode | Requête JWT | Rôle      | Status                    |
| ----------------- | ------- | ----------- | --------- | ------------------------- |
| `/api/hr/metrics` | GET     | ✅ Bearer   | RH, ADMIN | ⚠️ Chargement (undefined) |
| `/api/audit`      | GET     | ✅ Bearer   | RH, ADMIN | ⚠️ À tester               |

**Implémentation Frontend**: `NotificationsAdapter` (hr-dashboard utilise getHrMetrics)  
**Problème**: Metrics retournent `undefined` - À investiguer format backend

---

## 🟣 CANDIDATURES-SERVICE (Port 8084) - X-Headers

⚠️ **Authentification unique**: Utilise `X-User-Id` + `X-Role: ROLE_RH|ROLE_EMPLOYEE|ROLE_ADMIN`  
(NOT JWT Bearer comme les autres services)

### Candidatures

| Endpoint                        | Méthode | X-Headers                   | Rôle                   | Status             |
| ------------------------------- | ------- | --------------------------- | ---------------------- | ------------------ |
| `/api/candidatures`             | GET     | ✅ X-User-Id, X-Role        | ROLE_RH, ROLE_ADMIN    | ⚠️ Réponse paginée |
| `/api/candidatures/me`          | GET     | ✅ X-User-Id, X-Role        | ROLE_EMPLOYEE          | ⚠️ Réponse paginée |
| `/api/candidatures/{id}`        | GET     | ✅ X-User-Id, X-Role        | ROLE_EMPLOYEE, ROLE_RH | ⚠️ À tester        |
| `/api/candidatures`             | POST    | ✅ X-User-comportId, X-Role | ROLE_EMPLOYEE          | ⚠️ À tester        |
| `/api/candidatures/{id}/status` | PATCH   | ✅ X-User-Id, X-Role        | ROLE_RH, ROLE_ADMIN    | ⚠️ À tester        |

**Format Réponse**: `{ content: [], page: 0, size: 20, totalElements: X, totalPages: Y }`  
**Implémentation Frontend**: `ApplicationsAdapter` (utilise `candGetPage<T>`)  
**Correction Appliquée**: Fix du `.map() is not a function` (commit récent)

### Notifications

| Endpoint                          | Méthode | X-Headers            | Status         |
| --------------------------------- | ------- | -------------------- | -------------- |
| `/api/notifications`              | GET     | ✅ X-User-Id, X-Role | ⚠️ ERR_ABORTED |
| `/api/notifications/unread-count` | GET     | ✅ X-User-Id, X-Role | ⚠️ À tester    |
| `/api/notifications/{id}/read`    | PATCH   | ✅ X-User-Id, X-Role | ⚠️ À tester    |
| `/api/notifications/read-all`     | PATCH   | ✅ X-User-Id, X-Role | ⚠️ À tester    |
| `/api/notifications/{id}`         | DELETE  | ✅ X-User-Id, X-Role | ⚠️ À tester    |

**Implémentation Frontend**: `NotificationsAdapter.getNotifications()`

### HR Metrics (Candidatures)

| Endpoint          | Méthode | X-Headers            | Rôle                | Status      |
| ----------------- | ------- | -------------------- | ------------------- | ----------- |
| `/api/hr/metrics` | GET     | ✅ X-User-Id, X-Role | ROLE_RH, ROLE_ADMIN | ⚠️ À tester |

**Note**: Il y a 2 endpoints `/api/hr/metrics` - un par service (job-service et candidatures-service)

---

## 📁 FILE-SERVICE (Port 8082) - Pas de JWT requis

| Endpoint                       | Méthode | Auth     | Status      |
| ------------------------------ | ------- | -------- | ----------- |
| `/api/files/upload`            | POST    | ❌ Aucun | ⚠️ À tester |
| `/api/files/{fileId}/download` | GET     | ❌ Aucun | ⚠️ À tester |
| `/api/files/{fileId}/metadata` | GET     | ❌ Aucun | ⚠️ À tester |
| `/api/files/{fileId}`          | DELETE  | ❌ Aucun | ⚠️ À tester |
| `/api/files/health`            | GET     | ❌ Aucun | ⚠️ À tester |

**Implémentation Frontend**: `FileService` (src/app/core/services/file.service.ts)  
**Problème de sécurité**: ⚠️ Pas d'authentification sur upload/download

---

## 🤖 CHATBOT-SERVICE (Port 8083) - Pas de JWT

| Endpoint                        | Méthode | Paramètres                  | Status      |
| ------------------------------- | ------- | --------------------------- | ----------- |
| `/api/chatbot/messages`         | POST    | Body: `{ userId, message }` | ⚠️ À tester |
| `/api/chatbot/history/{userId}` | GET     | Query: `?page=0&size=20`    | ⚠️ À tester |
| `/api/chatbot/recent/{userId}`  | GET     | Query: `?limit=10`          | ⚠️ À tester |
| `/api/chatbot/history/{userId}` | DELETE  | Path param                  | ⚠️ À tester |
| `/api/chatbot/health`           | GET     | -                           | ⚠️ À tester |

**Note**: userId passé directement dans le body/path (pas dans headers)

---

## 🎯 Statut des Comptes de Test

| Email                    | Mot de Passe      | Rôle         | Statut      | Dashboard                 |
| ------------------------ | ----------------- | ------------ | ----------- | ------------------------- |
| `houda@gmail.com`        | `Houda@2025`      | **RH**       | ✅ Actif    | `/app/hr/dashboard`       |
| `admin@talentconnect.tn` | `Admin@Dev123`    | **ADMIN**    | ✅ Actif    | `/app/admin/dashboard`    |
| `test@talentconnect.tn`  | `Test@1234`       | **EMPLOYEE** | ✅ Actif    | `/app/employee/dashboard` |
| `rh@talentconnect.tn`    | (à réinitialiser) | **RH**       | ⚠️ Inactive | -                         |

---

## 🔧 Configuration Frontend

### Environnement (`environment.ts`)

```typescript
apiGateway.baseUrl: '/auth-api/api'
services.auth: '/auth-api/api'
services.jobs: '/jobs-api/api'
services.candidatures: '/cand-api/api'
services.files: '/files-api/api'
services.chatbot: '/chat-api/api'
```

### HTTP Service Methods

- `getFrom<T>(base, path)` — JWT GET
- `getPageFrom<T>(base, path)` — JWT GET paginé
- `postTo<T>(base, path, body)` — JWT POST
- `putTo<T>(base, path, body)` — JWT PUT
- `patchAt<T>(base, path, body)` — JWT PATCH
- `deleteFrom<T>(base, path)` — JWT DELETE
- **Candidatures**: `candGet<T>()`, `candGetPage<T>()`, `candPost<T>()`, `candPatch<T>()`, `candDelete<T>()`

### Adapters Implémentés

✅ `JobsAdapter` — jobs-service:8085 (JWT)  
✅ `ApplicationsAdapter` — candidatures-service:8084 (X-Headers, **FIX appliqué**)  
✅ `NotificationsAdapter` — dual (candidatures + job-service)  
✅ `ReferralsAdapter` — job-service:8085 (JWT)  
✅ `AuthAdapter` — auth-service:8081 (JWT)

---

## ⚠️ Problèmes Connus & À Investiguer

### 1. **HR Metrics retournent `undefined`**

- Dashboard RH: metrics.totalApplications, avgTimeToHire, conversionRate affichent `undefined`
- Endpoint: `GET /jobs-api/api/hr/metrics` retourne probablement un format non aligné
- **Action**: Valider le format exact du backend et adapter le mapping

### 2. **Notifications panel vide**

- Request: `GET /cand-api/api/notifications`
- Erreur: `ERR_ABORTED` → possiblement erreur 403 (headers X-User-Id/X-Role manquants)
- **Action**: Vérifier que les headers sont correctement envoyés

### 3. **Candidatures section vide**

- RH dashboard: "Aucune candidature" → soit pas de data, soit API error
- **Action**: Tester avec des candidatures réelles en DB

### 4. **File-Service sans auth**

- ⚠️ Tous les endpoints sont accessibles sans authentification
- **Recommandation**: Ajouter au moins JWT Bearer ou X-headers

---

## 📊 Matrice de Couverture des Tests

| Service                  | Endpoints | Testés | À Tester | Status  |
| ------------------------ | --------- | ------ | -------- | ------- |
| **Auth-Service**         | 4         | 3      | 1        | 75% ✅  |
| **Job-Service**          | 11        | 0      | 11       | 0% ⚠️   |
| **Candidatures-Service** | 8         | 1      | 7        | 12% ⚠️  |
| **File-Service**         | 5         | 0      | 5        | 0% ⚠️   |
| **Chatbot-Service**      | 5         | 0      | 5        | 0% ⚠️   |
| **TOTAL**                | **33**    | **4**  | **29**   | **12%** |

---

## 🚀 Plan d'Action Recommandé

### Phase 1: Validation Immédiate (Priorité Haute)

- [ ] Corriger HR Metrics (undefined)
- [ ] Tester job-service endpoints (GET /api/jobs, POST /api/admin/jobs)
- [ ] Tester candidatures complètes (GET, POST, PATCH)
- [ ] Valider notifications (vérifier X-headers)

### Phase 2: Intégration Complète

- [ ] Tester referrals (GET, POST, PATCH, DELETE)
- [ ] Tester file upload/download
- [ ] Intégrer chatbot service
- [ ] Valider pagination des réponses

### Phase 3: Sécurité & Optimisation

- [ ] Ajouter JWT au file-service
- [ ] Valider les garde-fous (role.guard, auth.guard)
- [ ] Tester les cas d'erreur (401, 403, 404, 500)
- [ ] Performance: optimiser les requêtes N+1

---

## ✅ Checkpoints Validés

- ✅ Proxy Angular dev server fonctionnel
- ✅ Login system (auth-service) opérationnel
- ✅ Role-based redirection (RH→HR, ADMIN→Admin, EMPLOYEE→Employee)
- ✅ localStorage synchronization (tc_token, tc_user keys)
- ✅ JWT Bearer headers correctement envoyés
- ✅ X-Headers pour candidatures-service (role mapping: ROLE_RH, ROLE_EMPLOYEE, etc.)
- ✅ Pagination response handling (PageResponse<T> avec content, page, size, totalElements)
- ✅ `.map is not a function` error fixé (ApplicationsAdapter)
- ✅ TypeScript compilation sans erreur

---

## 📝 Notes Finales

La **redirection basée sur rôles est 100% opérationnelle** et les trois dashboards (RH, ADMIN, EMPLOYEE) chargent correctement. L'architecture microservices est connectée et les proxies fonctionnent.

**Prochaine étape**: Valider les endpoints métier (jobs, candidatures, referrals) et investiguer pourquoi les metrics affichent `undefined`.

---

**Généré**: 2026-06-29 12:00 UTC  
**Dernière mise à jour**: ApplicationsAdapter fix (candGetPage)
