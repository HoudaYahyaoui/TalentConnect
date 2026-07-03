import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SILENT_ERROR } from '../../data-access/api/http/api-http.service';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startedAt = performance.now();
    const isSilent = request.context.get(SILENT_ERROR);

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            console.info(
              `[HTTP] ${request.method} ${request.url} • ${event.status} • ${Math.round(performance.now() - startedAt)}ms`,
            );
          }
        },
        error: (error) => {
          // Ne pas logger les erreurs silencieuses (chargements de fond, etc.)
          if (!isSilent) {
            console.error(
              `[HTTP] ${request.method} ${request.url} • error • ${Math.round(performance.now() - startedAt)}ms`,
              error,
            );
          }
        },
      }),
    );
  }
}
