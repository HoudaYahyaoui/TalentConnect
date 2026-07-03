import { Injectable, inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { SessionStore } from '../state/session.store';
import { getUserFriendlyHttpError } from '../utils/http-error-message';
import { ToastService } from '../../shared/services/toast.service';
import { SILENT_ERROR } from '../../data-access/api/http/api-http.service';

@Injectable()
export class ErrorHandlingInterceptor implements HttpInterceptor {
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly sessionStore = inject(SessionStore);

  private isRefreshing = false;
  private readonly refreshSubject = new BehaviorSubject<string | null>(null);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('/auth/')) {
          return this.handle401(request, next);
        }

        // Pas de toast pour les requêtes marquées SILENT_ERROR (chargements de fond)
        if (request.context.get(SILENT_ERROR)) {
          return throwError(() => error);
        }

        const message = getUserFriendlyHttpError(error, request.url);

        this.toast.error(message);

        return throwError(() => error);
      }),
    );
  }

  private handle401(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);

      // En mode mock, pas de vrai refresh token → on redirige directement
      this.sessionStore.clear();
      this.isRefreshing = false;
      this.router.navigate(['/auth/login'], { replaceUrl: true });
      this.toast.warning('Session expirée', 'Reconnectez-vous pour continuer.');
      return throwError(() => new Error('Session expirée'));

      // 🔄 À activer une fois le back-end branché :
      // return this.authRefreshService.refresh().pipe(
      //   switchMap((token) => {
      //     this.isRefreshing = false;
      //     this.refreshSubject.next(token);
      //     return next.handle(this.addToken(request, token));
      //   }),
      //   catchError((err) => {
      //     this.isRefreshing = false;
      //     this.sessionStore.clear();
      //     this.router.navigate(['/auth/login']);
      //     return throwError(() => err);
      //   }),
      // );
    }

    return this.refreshSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addToken(request, token))),
    );
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
}
