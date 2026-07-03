/**
 * AUTH ADAPTER - Adapter pattern pour le service Auth
 *
 * Responsabilité:
 * - Transformer les requêtes/réponses auth
 * - Appeler l'API Gateway
 * - Valider les données
 * - Fournir une interface mock pour dev
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { ApiGatewayService } from '../api-gateway.service';
import {
  UserCredentials,
  LoginResponse,
  RegisterRequest,
} from '../../auth/models/user-credentials.model';
import { JwtToken } from '../../auth/models/jwt-token.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthAdapter {
  private useMock = environment.useMocks;

  constructor(private apiGateway: ApiGatewayService) {}

  /**
   * Login user
   */
  login(credentials: UserCredentials): Observable<LoginResponse> {
    if (this.useMock) {
      return this.mockLogin(credentials);
    }

    return this.apiGateway
      .post<LoginResponse>('/auth/login', credentials)
      .pipe(map((res) => res.data!));
  }

  /**
   * Register user
   */
  register(data: RegisterRequest): Observable<LoginResponse> {
    if (this.useMock) {
      return this.mockRegister(data);
    }

    return this.apiGateway
      .post<LoginResponse>('/auth/register', data)
      .pipe(map((res) => res.data!));
  }

  /**
   * Refresh token
   */
  refreshToken(refreshToken: string): Observable<JwtToken> {
    if (this.useMock) {
      return this.mockRefreshToken();
    }

    return this.apiGateway
      .post<JwtToken>('/auth/refresh', { refreshToken })
      .pipe(map((res) => res.data!));
  }

  /**
   * Logout (just notify backend)
   */
  logout(): Observable<void> {
    if (this.useMock) {
      return of(void 0).pipe(delay(500));
    }

    return this.apiGateway.post<void>('/auth/logout', {}).pipe(map(() => void 0));
  }

  // ===== MOCK IMPLEMENTATIONS FOR DEVELOPMENT =====

  private mockLogin(credentials: UserCredentials): Observable<LoginResponse> {
    // Simulate network delay
    return of({
      user: {
        id: 'user-123',
        email: credentials.email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE', // Default role for demo
      },
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 900, // 15 minutes
    } as LoginResponse).pipe(delay(800));
  }

  private mockRegister(data: RegisterRequest): Observable<LoginResponse> {
    return of({
      user: {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: 'EMPLOYEE',
      },
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresIn: 900,
    } as LoginResponse).pipe(delay(800));
  }

  private mockRefreshToken(): Observable<JwtToken> {
    return of({
      accessToken: 'mock-access-token-' + Date.now(),
      expiresIn: 900,
      tokenType: 'Bearer',
    } as JwtToken).pipe(delay(300));
  }
}
