import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * AUTH TOKEN INTERCEPTOR
 * Ajoute le token JWT Bearer à toutes les requêtes HTTP
 * Gère les erreurs 401 (token expiré/invalide) et 403 (rôle insuffisant)
 */
@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip mock requests
    if (request.url.startsWith('/mock/') || request.url.includes('/auth/login')) {
      return next.handle(request);
    }

    // Ajouter le token Bearer si présent
    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request);
  }
}
