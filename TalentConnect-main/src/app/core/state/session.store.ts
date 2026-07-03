import { computed, Injectable, signal } from '@angular/core';
import { UserProfile, UserRole } from '../../data-access/models/portal.models';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly tokenState = signal<string | null>(null);
  readonly user = signal<UserProfile | null>(null);
  readonly language = signal<'fr' | 'en'>('fr');
  readonly theme = signal<'light' | 'dark'>('light');

  readonly isAuthenticated = computed(() => !!this.tokenState() && !!this.user());
  readonly role = computed<UserRole | null>(() => this.user()?.role ?? null);
  readonly fullName = computed(() => {
    const currentUser = this.user();
    return currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'TalentConnect';
  });

  setSession(token: string, user: UserProfile): void {
    this.tokenState.set(token);
    this.user.set(user);
    localStorage.setItem('tc_token', token);
    localStorage.setItem('tc_user', JSON.stringify(user));
  }

  hydrate(): void {
    const token = localStorage.getItem('tc_token');
    const rawUser = localStorage.getItem('tc_user');
    const rawTheme = localStorage.getItem('tc_theme');
    const rawLanguage = localStorage.getItem('tc_lang');

    if (token && rawUser && !this.isTokenExpired(token)) {
      this.tokenState.set(token);
      this.user.set(JSON.parse(rawUser) as UserProfile);
    } else if (token) {
      // Token present but expired — clear session silently
      this.clear();
    }

    if (rawTheme === 'light' || rawTheme === 'dark') {
      this.theme.set(rawTheme);
    }

    if (rawLanguage === 'fr' || rawLanguage === 'en') {
      this.language.set(rawLanguage);
    }
  }

  clear(): void {
    this.tokenState.set(null);
    this.user.set(null);
    localStorage.removeItem('tc_token');
    localStorage.removeItem('tc_user');
  }

  getToken(): string | null {
    return this.tokenState();
  }

  /** Returns true if the JWT `exp` claim is in the past */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
      if (!payload.exp) return false;
      return payload.exp * 1000 < Date.now();
    } catch {
      return true; // malformed token → treat as expired
    }
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.theme.set(theme);
    localStorage.setItem('tc_theme', theme);
  }

  setLanguage(language: 'fr' | 'en'): void {
    this.language.set(language);
    localStorage.setItem('tc_lang', language);
  }
}
