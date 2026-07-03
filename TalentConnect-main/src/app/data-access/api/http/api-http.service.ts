/**
 * ApiHttpService — Pont centralisé Mock ↔ Microservices backend
 *
 * Architecture microservices :
 *   - auth-service       (8081) : JWT Bearer header
 *   - job-service        (8085) : JWT Bearer header
 *   - candidatures-service(8084): X-User-Id + X-Role headers
 *   - file-service       (8082) : JWT Bearer header
 *   - chatbot-service    (8083) : JWT Bearer header
 *
 * Les réponses des microservices ne sont PAS encapsulées dans { data: ... }.
 */
import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/** Supprime le toast d'erreur global pour les GET de fond (ex: chargement initial) */
export const SILENT_ERROR = new HttpContextToken<boolean>(() => false);
import { environment } from '../../../../environments/environment';
import { PortalMockApiService } from '../mocks/portal-mock-api.service';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Base URLs de chaque microservice
const AUTH_BASE = environment.services.auth;
const JOBS_BASE = environment.services.jobs;
const CAND_BASE = environment.services.candidatures;
const FILES_BASE = environment.services.files;

// Mapping rôle frontend → header X-Role pour candidatures-service (avec préfixe ROLE_)
const ROLE_HEADER_MAP: Record<string, string> = {
  EMPLOYEE: 'ROLE_EMPLOYEE',
  EMPLOYE: 'ROLE_EMPLOYEE',
  HR: 'ROLE_RH',
  RH: 'ROLE_RH',
  ADMIN: 'ROLE_ADMIN',
};

@Injectable({ providedIn: 'root' })
export class ApiHttpService {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(PortalMockApiService);

  // Exposer les bases pour les adapters
  readonly authBase = AUTH_BASE;
  readonly jobsBase = JOBS_BASE;
  readonly candBase = CAND_BASE;
  readonly filesBase = FILES_BASE;

  get isMock(): boolean {
    return environment.useMocks;
  }

  // ─── Mock helpers ──────────────────────────────────────────────────────────

  mockGet<T>(fileName: string): Observable<T> {
    return this.mock.get<T>(fileName);
  }

  // ─── Headers ───────────────────────────────────────────────────────────────

  /** JWT Bearer pour auth/jobs/files/chatbot */
  private jwtHeaders(): HttpHeaders {
    const token = localStorage.getItem('tc_token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })
      : new HttpHeaders({ 'Content-Type': 'application/json' });
  }

  /** X-User-Id + X-Role pour candidatures-service */
  private xHeaders(): HttpHeaders {
    const raw = localStorage.getItem('tc_user');
    const user = raw ? (JSON.parse(raw) as { id?: string; role?: string }) : null;
    const userId = user?.id ?? '';
    // Mapping: EMPLOYE (from JWT) → EMPLOYEE (for X-headers), RH and ADMIN stay as-is
    let frontendRole = user?.role ?? 'EMPLOYEE';
    if (frontendRole === 'EMPLOYE') frontendRole = 'EMPLOYEE';
    const xRole = ROLE_HEADER_MAP[frontendRole] ?? 'ROLE_EMPLOYEE';
    return new HttpHeaders({
      'X-User-Id': String(userId),
      'X-Role': xRole,
      'Content-Type': 'application/json',
    });
  }

  // ─── Méthodes JWT (auth-service, job-service, file-service) ───────────────

  /** GET {base}/{path} → T direct (pas de wrapper { data }) */
  getFrom<T>(base: string, path: string, params?: Record<string, string>): Observable<T> {
    let httpParams = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => v && (httpParams = httpParams.set(k, v)));
    return this.http.get<T>(`${base}/${path}`, { headers: this.jwtHeaders(), params: httpParams });
  }

  /** Comme getFrom mais supprime le toast d'erreur global (chargements de fond) */
  getFromSilent<T>(base: string, path: string, params?: Record<string, string>): Observable<T> {
    let httpParams = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => v && (httpParams = httpParams.set(k, v)));
    return this.http.get<T>(`${base}/${path}`, {
      headers: this.jwtHeaders(),
      params: httpParams,
      context: new HttpContext().set(SILENT_ERROR, true),
    });
  }

  /** GET paginé {base}/{path} → PageResponse<T> */
  getPageFrom<T>(
    base: string,
    path: string,
    params?: Record<string, string>,
  ): Observable<PageResponse<T>> {
    let httpParams = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => v && (httpParams = httpParams.set(k, v)));
    return this.http.get<PageResponse<T>>(`${base}/${path}`, {
      headers: this.jwtHeaders(),
      params: httpParams,
    });
  }

  /** POST {base}/{path} → T direct */
  postTo<T>(base: string, path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${base}/${path}`, body, { headers: this.jwtHeaders() });
  }

  /** PUT {base}/{path} → T direct */
  putTo<T>(base: string, path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${base}/${path}`, body, { headers: this.jwtHeaders() });
  }

  /** PATCH {base}/{path} → T direct */
  patchAt<T>(base: string, path: string, body?: unknown): Observable<T> {
    return this.http.patch<T>(`${base}/${path}`, body ?? {}, { headers: this.jwtHeaders() });
  }

  /** DELETE {base}/{path} → T direct */
  deleteFrom<T>(base: string, path: string): Observable<T> {
    return this.http.delete<T>(`${base}/${path}`, { headers: this.jwtHeaders() });
  }

  // ─── Méthodes candidatures-service (X-User-Id / X-Role) ───────────────────

  candGet<T>(path: string, params?: Record<string, string>): Observable<T> {
    let httpParams = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => v && (httpParams = httpParams.set(k, v)));
    return this.http.get<T>(`${CAND_BASE}/${path}`, {
      headers: this.xHeaders(),
      params: httpParams,
    });
  }

  /** GET paginé pour candidatures-service (retourne array ou PageResponse<T>) */
  candGetPage<T>(path: string, params?: Record<string, string>): Observable<T[] | PageResponse<T>> {
    let httpParams = new HttpParams();
    if (params)
      Object.entries(params).forEach(([k, v]) => v && (httpParams = httpParams.set(k, v)));
    return this.http.get<T[] | PageResponse<T>>(`${CAND_BASE}/${path}`, {
      headers: this.xHeaders(),
      params: httpParams,
    });
  }

  candPost<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${CAND_BASE}/${path}`, body, { headers: this.xHeaders() });
  }

  candPatch<T>(path: string, body?: unknown): Observable<T> {
    return this.http.patch<T>(`${CAND_BASE}/${path}`, body ?? {}, { headers: this.xHeaders() });
  }

  candDelete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${CAND_BASE}/${path}`, { headers: this.xHeaders() });
  }
}
