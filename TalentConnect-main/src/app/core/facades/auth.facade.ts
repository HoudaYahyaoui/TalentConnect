import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AuthStore } from '../state/auth.store';
import { AuthCredentials } from '../api/models/backend-api-models';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);

  readonly user = this.authStore.user;
  readonly isAuthenticated = this.authStore.isAuthenticated;
  readonly role = computed(() => this.user()?.role ?? null);

  initializeSession(): void {
    this.authStore.initialize();
  }

  login(credentials: AuthCredentials) {
    return this.authService.login(credentials).pipe(
      tap((session) => {
        this.authStore.updateSession(session);
      }),
    );
  }

  logout(): void {
    this.authStore.clear();
    this.router.navigate(['auth/login']);
  }

  get landingRoute(): string[] {
    const currentRole = this.role();
    if (currentRole === 'HR') {
      return ['app', 'hr', 'dashboard'];
    }
    if (currentRole === 'ADMIN') {
      return ['app', 'admin', 'dashboard'];
    }
    return ['app', 'employee', 'dashboard'];
  }
}
