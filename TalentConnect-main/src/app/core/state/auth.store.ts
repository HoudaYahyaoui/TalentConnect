import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthService, AuthSession } from '../services/auth.service';
import { UserDto } from '../api/models/backend-api-models';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authService = inject(AuthService);
  private readonly token = signal<string | null>(null);
  readonly user = signal<UserDto | null>(null);

  readonly isAuthenticated = computed(() => !!this.token() && !!this.user());

  initialize(): void {
    const session = this.authService.restoreSession();
    if (session) {
      this.token.set(session.token);
      this.user.set(session.user);
    }
  }

  updateSession(session: AuthSession): void {
    this.token.set(session.token);
    this.user.set(session.user);
    this.authService.persistSession(session);
  }

  clear(): void {
    this.token.set(null);
    this.user.set(null);
    this.authService.clearSession();
  }

  getToken(): string | null {
    return this.token();
  }
}
