import { Injectable, inject } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

/**
 * JWT TOKEN INTERCEPTOR
 * Ajoute automatiquement le token Bearer à chaque requête HTTP
 * Gère les erreurs 401 (token expiré) et 403 (rôle insuffisant)
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Récupérer le token
    const token = this.authService.getToken();

    // Ajouter le token au header Authorization si présent
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Token expiré ou invalide
        if (error.status === 401) {
          this.authService.clearSession();
          this.toast.open('Votre session a expiré. Veuillez vous reconnecter.', 'OK', {
            duration: 5000,
          });
          this.router.navigate(['/auth/login']);
        }

        // Rôle insuffisant
        if (error.status === 403) {
          this.router.navigate(['/forbidden']);
        }

        return throwError(() => error);
      }),
    );
  }
}
