import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  JobOfferDto,
  JobOfferCreateDto,
  JobOfferStatus,
  ApiResponse,
  PageDto,
} from '../api/models/backend-api-models';

@Injectable({
  providedIn: 'root',
})
export class JobsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiGateway.baseUrl;

  /**
   * Récupère la liste des offres d'emploi avec filtres
   * GET /api/jobs?q=search&location=Tunis&status=OPEN&page=0&size=20
   */
  getAll(
    filters: {
      search?: string;
      location?: string;
      department?: string;
      status?: JobOfferStatus;
      page?: number;
      size?: number;
    } = {},
  ): Observable<PageDto<JobOfferDto>> {
    let params = new HttpParams();

    if (filters.search) params = params.set('q', filters.search);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.department) params = params.set('department', filters.department);
    if (filters.status) params = params.set('status', filters.status);

    params = params.set('page', (filters.page ?? 0).toString());
    params = params.set('size', (filters.size ?? 20).toString());

    return this.http
      .get<ApiResponse<PageDto<JobOfferDto>>>(`${this.apiUrl}/jobs`, { params })
      .pipe(map((response) => response.data));
  }

  /**
   * Récupère une offre spécifique
   * GET /api/jobs/{id}
   */
  getById(id: number): Observable<JobOfferDto> {
    return this.http
      .get<ApiResponse<JobOfferDto>>(`${this.apiUrl}/jobs/${id}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Crée une nouvelle offre d'emploi (HR/ADMIN only)
   * POST /api/jobs
   */
  create(jobOffer: JobOfferCreateDto): Observable<JobOfferDto> {
    return this.http
      .post<ApiResponse<JobOfferDto>>(`${this.apiUrl}/jobs`, jobOffer)
      .pipe(map((response) => response.data));
  }

  /**
   * Met à jour une offre d'emploi (HR/ADMIN only)
   * PUT /api/jobs/{id}
   */
  update(id: number, jobOffer: JobOfferCreateDto): Observable<JobOfferDto> {
    return this.http
      .put<ApiResponse<JobOfferDto>>(`${this.apiUrl}/jobs/${id}`, jobOffer)
      .pipe(map((response) => response.data));
  }

  /**
   * Change le statut d'une offre (HR/ADMIN only)
   * PATCH /api/jobs/{id}/status
   * ex: { "status": "OPEN" }
   */
  updateStatus(id: number, status: JobOfferStatus): Observable<JobOfferDto> {
    return this.http
      .patch<ApiResponse<JobOfferDto>>(`${this.apiUrl}/jobs/${id}/status`, { status })
      .pipe(map((response) => response.data));
  }

  /**
   * Supprime une offre d'emploi (ADMIN only)
   * DELETE /api/jobs/{id}
   */
  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.apiUrl}/jobs/${id}`)
      .pipe(map(() => undefined));
  }
}
