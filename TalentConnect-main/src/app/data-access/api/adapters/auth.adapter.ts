import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, switchMap } from 'rxjs';
import { ApiHttpService } from '../http/api-http.service';
import { UserProfile, UserRole } from '../../models/portal.models';

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

/** Réponse brute de POST /api/auth/login ou /api/auth/register */
interface BackendAuthResponse {
  accessToken?: string;
  token?: string;
  tokenType?: string;
  userId: number;
  email: string;
  roles?: string[];
  role?: string;
  user?: BackendUserProfile;
}

/** Réponse brute de GET /api/users/profile */
interface BackendUserProfile {
  id: number;
  employeeId?: string; // ← NOUVEAU champ depuis la correction
  email: string;
  roles: string[]; // ← roles sans préfixe "ROLE_" (ex: ["ADMIN"])
  firstName?: string;
  lastName?: string;
  department?: string;
  location?: string;
  title?: string;
  experienceYears?: number;
  avatarUrl?: string;
  languages?: string[];
  skills?: string[];
}

/** Mapping rôle backend → rôle frontend (roles sans préfixe) */
const BACKEND_ROLE_MAP: Record<string, UserRole> = {
  ADMIN: 'ADMIN',
  RH: 'HR',
  EMPLOYEE: 'EMPLOYEE',
  EMPLOYE: 'EMPLOYEE',
};

function mapBackendRole(roles: string[]): UserRole {
  for (const r of roles) {
    const mapped = BACKEND_ROLE_MAP[r];
    if (mapped) return mapped;
  }
  return 'EMPLOYEE';
}

function extractAuthToken(response: BackendAuthResponse): string {
  return response.accessToken ?? response.token ?? '';
}

function extractRoles(response: BackendAuthResponse): string[] {
  if (Array.isArray(response.roles) && response.roles.length > 0) return response.roles;
  if (response.role) return [response.role];
  if (response.user?.roles?.length) return response.user.roles;
  return [];
}

function mapBackendProfile(profile: BackendUserProfile): UserProfile {
  return {
    id: String(profile.id),
    employeeId: profile.employeeId ?? String(profile.id), // ← utiliser employeeId du backend
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    email: profile.email,
    role: mapBackendRole(profile.roles ?? []),
    department: profile.department ?? '',
    location: profile.location ?? '',
    title: profile.title ?? '',
    skills: profile.skills ?? [],
    experienceYears: profile.experienceYears ?? 0,
    avatarUrl: profile.avatarUrl,
    languages: profile.languages ?? [],
  };
}

@Injectable({ providedIn: 'root' })
export class AuthAdapter {
  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiHttpService);

  login(email: string, password: string): Observable<LoginResponse> {
    if (this.api.isMock) {
      return this.api.mockGet<(UserProfile & { password: string })[]>('users.json').pipe(
        map((users) => {
          const user = users.find(
            (item) =>
              item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password,
          );
          if (!user) throw new Error('Identifiants invalides');
          const { password: _p, ...safeUser } = user;
          return { token: `mock-token-${safeUser.id}`, user: safeUser };
        }),
      );
    }

    return this.http
      .post<BackendAuthResponse>(`${this.api.authBase}/auth/login`, { email, password })
      .pipe(
        switchMap((authResp) => {
          const token = extractAuthToken(authResp);
          if (!token) {
            throw new Error('Réponse login invalide: token manquant');
          }

          if (authResp.user) {
            const roles = extractRoles(authResp);
            return new Observable<LoginResponse>((obs) => {
              obs.next({
                token,
                user: mapBackendProfile({ ...authResp.user!, roles }),
              });
              obs.complete();
            });
          }

          const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          });
          return this.http
            .get<BackendUserProfile>(`${this.api.authBase}/users/profile`, { headers })
            .pipe(
              map((profile) => ({
                token,
                user: mapBackendProfile(profile),
              })),
            );
        }),
      );
  }
}
