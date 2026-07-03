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

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startedAt = performance.now();

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
          console.error(
            `[HTTP] ${request.method} ${request.url} • error • ${Math.round(performance.now() - startedAt)}ms`,
            error,
          );
        },
      }),
    );
  }
}
