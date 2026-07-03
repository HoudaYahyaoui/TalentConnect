import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApplicationDto,
  ApplicationCreateDto,
  ApplicationStatusUpdateDto,
  ApiResponse,
  PageDto,
} from '../api/models/backend-api-models';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiGateway.baseUrl;

  /**
   * Récupère toutes les candidatures (admin/HR)
   * GET /api/applications?page=0&size=20
   */
  getAll(page: number = 0, size: number = 20): Observable<PageDto<ApplicationDto>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http
      .get<ApiResponse<PageDto<ApplicationDto>>>(`${this.apiUrl}/applications`, { params })
      .pipe(map((response) => response.data));
  }

  /**
   * Récupère les candidatures de l'utilisateur connecté (EMPLOYEE)
   * GET /api/applications/mine?page=0&size=20
   */
  getMine(page: number = 0, size: number = 20): Observable<PageDto<ApplicationDto>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    return this.http
      .get<ApiResponse<PageDto<ApplicationDto>>>(`${this.apiUrl}/applications/mine`, { params })
      .pipe(map((response) => response.data));
  }

  /**
   * Récupère une candidature spécifique
   * GET /api/applications/{id}
   */
  getById(id: number): Observable<ApplicationDto> {
    return this.http
      .get<ApiResponse<ApplicationDto>>(`${this.apiUrl}/applications/${id}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Crée une nouvelle candidature
   * POST /api/applications
   */
  create(application: ApplicationCreateDto): Observable<ApplicationDto> {
    return this.http
      .post<ApiResponse<ApplicationDto>>(`${this.apiUrl}/applications`, application)
      .pipe(map((response) => response.data));
  }

  /**
   * Change le statut d'une candidature (HR/ADMIN only)
   * PATCH /api/applications/{id}/status
   */
  updateStatus(id: number, update: ApplicationStatusUpdateDto): Observable<ApplicationDto> {
    return this.http
      .patch<ApiResponse<ApplicationDto>>(`${this.apiUrl}/applications/${id}/status`, update)
      .pipe(map((response) => response.data));
  }

  /**
   * Supprime une candidature (EMPLOYEE only - propriétaire)
   * DELETE /api/applications/{id}
   */
  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/applications/${id}`)
      .pipe(map(() => undefined));
  }
}
