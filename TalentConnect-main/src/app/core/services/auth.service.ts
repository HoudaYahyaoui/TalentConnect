import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthCredentials,
  AuthLoginResponse,
  UserDto,
  ApiResponse,
} from '../api/models/backend-api-models';
import { API_ENDPOINTS } from '../api/api-endpoints.config';

const AUTH_TOKEN_KEY = 'tc_token'; // Aligné avec SessionStore
const AUTH_USER_KEY = 'tc_user'; // Aligné avec SessionStore

export interface AuthSession {
  token: string;
  user: UserDto;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiGateway.baseUrl;

  // Observable pour tracker l'état d'authentification
  private readonly currentUserSubject$ = new BehaviorSubject<UserDto | null>(
    this.getCurrentUserFromStorage(),
  );
  public readonly currentUser$ = this.currentUserSubject$.asObservable();

  private readonly isAuthenticatedSubject$ = new BehaviorSubject<boolean>(!!this.getToken());
  public readonly isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();

  /**
   * Login avec email/password
   * Appelle POST /api/auth/login du backend
   */
  login(credentials: AuthCredentials): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthLoginResponse>>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map((response) => {
          const session: AuthSession = {
            token: response.data.token,
            user: response.data.user,
          };
          return session;
        }),
        tap((session) => this.persistSession(session)),
      );
  }

  /**
   * Logout
   * Appelle POST /api/auth/logout du backend
   */
  logout(): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/auth/logout`, {}).pipe(
      map(() => undefined),
      tap(() => this.clearSession()),
    );
  }

  /**
   * Demande de réinitialisation du mot de passe
   * Appelle POST /api/auth/forgot-password du backend
   */
  forgotPassword(email: string): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.apiUrl}${API_ENDPOINTS.auth.forgotPassword}`, { email })
      .pipe(map(() => undefined));
  }

  /**
   * Réinitialise le mot de passe avec un token reçu par email
   * Appelle POST /api/auth/reset-password du backend
   */
  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.apiUrl}${API_ENDPOINTS.auth.resetPassword}`, {
        token,
        newPassword,
      })
      .pipe(map(() => undefined));
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   * Appelle GET /api/users/profile du backend
   * Requiert le token JWT dans Authorization header (géré par interceptor)
   */
  getUserProfile(): Observable<UserDto> {
    return this.http.get<ApiResponse<UserDto>>(`${this.apiUrl}/users/profile`).pipe(
      map((response) => response.data),
      tap((user) => {
        this.currentUserSubject$.next(user);
        this.saveUserToStorage(user);
      }),
    );
  }

  /**
   * Sauvegarde la session dans le localStorage
   */
  persistSession(session: AuthSession): void {
    localStorage.setItem(AUTH_TOKEN_KEY, session.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
    this.currentUserSubject$.next(session.user);
    this.isAuthenticatedSubject$.next(true);
  }

  /**
   * Récupère le token JWT du localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Récupère l'utilisateur courant depuis le localStorage
   */
  getCurrentUserFromStorage(): UserDto | null {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as UserDto;
    } catch {
      return null;
    }
  }

  /**
   * Getter pour l'utilisateur courant (synchrone)
   * Priorité à localStorage (synchronisé par SessionStore) pour éviter les
   * données périmées dans currentUserSubject$ lors d'un changement de session
   * sans rechargement de page.
   */
  getCurrentUser(): UserDto | null {
    // If no token in localStorage the session was cleared — ignore any stale BehaviorSubject value
    if (!this.isAuthenticated()) return null;
    return this.getCurrentUserFromStorage() ?? this.currentUserSubject$.value;
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   * Lit directement le localStorage pour être compatible avec SessionStore
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY);
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Vérifie si l'utilisateur a l'un des rôles spécifiés
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Efface la session du localStorage
   */
  clearSession(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    this.currentUserSubject$.next(null);
    this.isAuthenticatedSubject$.next(false);
  }

  /**
   * Sauvegarde l'utilisateur dans le localStorage
   */
  private saveUserToStorage(user: UserDto): void {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }

  /**
   * Restaure la session depuis le localStorage au démarrage
   */
  restoreSession(): AuthSession | null {
    const token = this.getToken();
    const user = this.getCurrentUserFromStorage();

    if (!token || !user) {
      return null;
    }

    return { token, user };
  }
}
