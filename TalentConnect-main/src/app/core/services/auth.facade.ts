import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthAdapter } from '../../data-access/api/adapters/auth.adapter';
import { SessionStore } from '../state/session.store';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly adapter = inject(AuthAdapter);
  private readonly sessionStore = inject(SessionStore);
  private readonly router = inject(Router);

  readonly user = this.sessionStore.user;
  readonly role = this.sessionStore.role;
  readonly isAuthenticated = this.sessionStore.isAuthenticated;

  hydrate(): void {
    this.sessionStore.hydrate();
  }

  login(email: string, password: string) {
    return this.adapter.login(email, password).pipe(
      tap((session) => {
        this.sessionStore.setSession(session.token, session.user);
      }),
    );
  }

  logout(): void {
    this.sessionStore.clear();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  get landingRoute(): string {
    switch (this.role()) {
      case 'HR':
        return '/app/hr/dashboard';
      case 'ADMIN':
        return '/app/admin/dashboard';
      default:
        return '/app/employee/dashboard';
    }
  }
}
