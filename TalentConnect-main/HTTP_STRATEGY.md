# 🔐 STRATÉGIE HTTP & INTERCEPTORS - TalentConnect Frontend

## Vue d'ensemble de la Pipeline HTTP

```
OUTGOING REQUEST
  ↓
[1. JwtInterceptor] → Ajoute Authorization header
  ↓
[2. LoadingInterceptor] → Affiche spinner global
  ↓
[3. Request logging] → Log en dev mode
  ↓
→ API GATEWAY
  ↓

INCOMING RESPONSE (Success: 200-299)
  ↓
[1. LoadingInterceptor] → Masque spinner
  ↓
[2. Response logging]
  ↓
← Component subscribe()

INCOMING RESPONSE (Error: 401)
  ↓
[1. Error logging]
  ↓
[2. RefreshTokenInterceptor] → Essaie refresh token
  ├─ Success → Retry original request
  └─ Fail → Redirect /auth/login
  ↓
[3. Error notification] (toast/snackbar)
  ↓
← Component error handler
```

---

## 1. JWT INTERCEPTOR

**Responsabilité:** Ajouter le JWT token à chaque request

```typescript
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip si route publique ou déjà a un token
    if (this.isPublicUrl(req.url) || req.headers.has('Authorization')) {
      return next.handle(req);
    }

    const token = this.authService.getAccessToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }

    return next.handle(req);
  }

  private isPublicUrl(url: string): boolean {
    return url.includes('/auth/login') || url.includes('/auth/register');
  }
}
```

---

## 2. LOADING INTERCEPTOR

**Responsabilité:** Afficher/masquer un spinner global

```typescript
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loadingService.show();

    return next.handle(req).pipe(
      finalize(() => this.loadingService.hide()),
      catchError((error) => {
        this.loadingService.hide();
        throw error;
      }),
    );
  }
}
```

---

## 3. REFRESH TOKEN INTERCEPTOR

**Responsabilité:** Gérer l'expiration du token automatiquement

```typescript
@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new Subject<string>();

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        if (error.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshTokenSubject.next(null!);

          // Essayer de rafraîchir le token
          return this.authService.refreshToken().pipe(
            switchMap((token: JwtToken) => {
              this.isRefreshing = false;
              this.refreshTokenSubject.next(token.accessToken);

              // Retry original request avec nouveau token
              return next.handle(this.addToken(req, token.accessToken));
            }),
            catchError((err) => {
              this.isRefreshing = false;
              this.authService.logout();
              this.router.navigate(['/auth/login']);
              return throwError(() => err);
            }),
          );
        }

        if (error.status === 401 && this.isRefreshing) {
          // Attendre que le token soit rafraîchi
          return this.refreshTokenSubject.pipe(
            switchMap((token: string) => {
              return next.handle(this.addToken(req, token));
            }),
          );
        }

        return throwError(() => error);
      }),
    );
  }

  private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
```

---

## 4. ERROR INTERCEPTOR

**Responsabilité:** Centraliser la gestion d'erreur

```typescript
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private logger: LoggerService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error) => {
        this.handleError(error);
        return throwError(() => error);
      }),
    );
  }

  private handleError(error: any): void {
    const errorCode = error.error?.code || 'UNKNOWN_ERROR';
    const errorMessage = error.error?.message || 'Une erreur est survenue';

    // Log
    this.logger.error(`HTTP Error [${error.status}]: ${errorCode}`, error);

    // Notify user
    switch (error.status) {
      case 400:
        this.notificationService.error('Données invalides: ' + errorMessage);
        break;
      case 401:
        // Géré par RefreshTokenInterceptor
        break;
      case 403:
        this.notificationService.error('Accès non autorisé');
        break;
      case 404:
        this.notificationService.warning('Ressource non trouvée');
        break;
      case 500:
        this.notificationService.error('Erreur serveur. Veuillez réessayer plus tard.');
        break;
      default:
        this.notificationService.error(errorMessage);
    }
  }
}
```

---

## 5. PROVIDER SETUP (app.config.ts)

```typescript
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './core/auth/interceptors/jwt.interceptor';
import { LoadingInterceptor } from './core/auth/interceptors/loading.interceptor';
import { RefreshTokenInterceptor } from './core/auth/interceptors/refresh-token.interceptor';
import { ErrorInterceptor } from './core/auth/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([
        // Order matters! JWT must be first
        JwtInterceptor,
        LoadingInterceptor,
        RefreshTokenInterceptor,
        ErrorInterceptor,
      ]),
    ),
    // ... other providers
  ],
};
```

---

## 6. TOKEN STORAGE STRATEGY

### Comparaison des options:

| Option          | Sécurité | Persistance      | Accès JS |
| --------------- | -------- | ---------------- | -------- |
| localStorage    | ⚠️ Bas   | ✅ Oui           | ✅ Oui   |
| sessionStorage  | ⚠️ Bas   | ❌ Non (session) | ✅ Oui   |
| HttpOnly Cookie | ✅ Élevé | ✅ Config        | ❌ Non   |

### Recommandation pour TalentConnect:

**SessionStorage + HttpOnly Cookie (optimal)**

```typescript
@Injectable({
  providedIn: 'root',
})
export class JwtStorageService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  constructor() {}

  /**
   * Stocker les tokens
   * Le backend devrait envoyer les tokens HTTP-only cookies + sessionStorage pour l'accès
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    // SessionStorage (auto-clear après fermeture)
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken) {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
    // Note: Si le backend configure un HttpOnly cookie, pas besoin de le stocker ici
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  clearTokens(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}
```

---

## 7. REQUEST/RESPONSE LOGGING (Development Only)

```typescript
@Injectable()
export class RequestLoggingInterceptor implements HttpInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!environment.production) {
      const startTime = performance.now();
      this.logger.debug(`[HTTP] ${req.method} ${req.url}`);

      return next.handle(req).pipe(
        tap((event) => {
          if (event instanceof HttpResponse) {
            const duration = performance.now() - startTime;
            this.logger.debug(`[HTTP Response] ${event.status} - ${duration.toFixed(2)}ms`, {
              url: req.url,
              body: event.body,
            });
          }
        }),
        catchError((error) => {
          const duration = performance.now() - startTime;
          this.logger.error(`[HTTP Error] ${error.status} - ${duration.toFixed(2)}ms`, {
            url: req.url,
            error: error.error,
          });
          return throwError(() => error);
        }),
      );
    }

    return next.handle(req);
  }
}
```

---

## 8. GESTION DES ERREURS DE VALIDATION

Backend renvoie:

```json
{
  "status": 400,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "validationErrors": {
    "email": ["Email is invalid", "Email already exists"],
    "firstName": ["First name is required"]
  }
}
```

Frontend gère:

```typescript
// Dans le composant
if (error.error?.validationErrors) {
  this.formErrors = error.error.validationErrors;
  // Afficher erreurs sous chaque champ
}
```

---

## 9. BEST PRACTICES

✅ **DO:**

- Centraliser tout appel HTTP dans les adapters
- Utiliser des Observables, pas des Promises
- Implémenter timeout sur chaque requête
- Logger les erreurs en production (pour monitoring)
- Refresh token AVANT expiration (5 min de buffer)
- Valider côté frontend + backend

❌ **DON'T:**

- Stocker le token dans localStorage
- Utiliser d'anciens patterns de promise-based HTTP (`toPromise()`)
- Appeler l'API directement depuis les composants
- Créer des intercepteurs sans les ajouter aux providers
- Oublier de nettoyer les subscriptions

---

## 10. FLUX COMPLET D'AUTHENTIFICATION

```
1. USER LOGS IN
   ↓
   Component → AuthAdapter.login(credentials)
   ↓
   AuthAdapter → ApiGatewayService.post('/auth/login', credentials)
   ↓
   API Gateway retourne:
   {
     "accessToken": "eyJhbGc...",
     "refreshToken": "eyJhbGc...",
     "expiresIn": 900
   }
   ↓
2. TOKENS STORED
   ↓
   JwtStorageService.setTokens(accessToken, refreshToken)
   ↓
   AuthService.authState$.next(user)
   ↓
3. CHAQUE REQUEST
   ↓
   JwtInterceptor ajoute: Authorization: Bearer {token}
   ↓
4. TOKEN EXPIRES (15 minutes)
   ↓
   Response 401 Unauthorized
   ↓
   RefreshTokenInterceptor.intercept()
   ↓
   AuthAdapter.refreshToken(refreshToken)
   ↓
   Nouveau accessToken reçu
   ↓
   Original request retrié avec nouveau token
   ↓
5. LOGOUT
   ↓
   AuthService.logout()
   ↓
   JwtStorageService.clearTokens()
   ↓
   AuthService.authState$.next(null)
   ↓
   Navigate to /auth/login
```
