/**
 * APPLICATION ADAPTER - Adapter pattern pour les candidatures
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { ApiGatewayService } from '../api-gateway.service';
import {
  Application,
  ApplicationFilter,
  CreateApplicationDTO,
  UpdateApplicationDTO,
} from '../../../features/applications/models/application.model';
import { PaginatedApiResponse } from '../models/api-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsAdapter {
  private useMock = environment.useMocks;

  constructor(private apiGateway: ApiGatewayService) {}

  /**
   * Get applications (with role-based filtering)
   */
  getApplications(filter: ApplicationFilter): Observable<PaginatedApiResponse<Application>> {
    if (this.useMock) {
      return this.mockGetApplications(filter);
    }

    return this.apiGateway.getPaginated<Application>('/applications', {
      params: filter as Record<string, string | number | boolean | undefined | null>,
    });
  }

  /**
   * Get application by ID
   */
  getApplicationById(appId: string): Observable<Application> {
    if (this.useMock) {
      return this.mockGetApplicationById(appId);
    }

    return this.apiGateway.get<Application>(`/applications/${appId}`).pipe(map((res) => res.data!));
  }

  /**
   * Create application (Employee applies to job)
   */
  createApplication(data: CreateApplicationDTO): Observable<Application> {
    if (this.useMock) {
      return this.mockCreateApplication(data);
    }

    return this.apiGateway.post<Application>('/applications', data).pipe(map((res) => res.data!));
  }

  /**
   * Update application status (RH only)
   */
  updateApplication(appId: string, data: UpdateApplicationDTO): Observable<Application> {
    if (this.useMock) {
      return this.mockUpdateApplication(appId, data);
    }

    return this.apiGateway
      .put<Application>(`/applications/${appId}`, data)
      .pipe(map((res) => res.data!));
  }

  // ===== MOCK IMPLEMENTATIONS =====

  private mockGetApplications(
    filter: ApplicationFilter,
  ): Observable<PaginatedApiResponse<Application>> {
    const mockApps: Application[] = [
      {
        id: 'app-1',
        jobId: 'job-1',
        candidateId: 'emp-1',
        candidateName: 'Jean Dupont',
        candidateEmail: 'jean@example.com',
        status: 'SUBMITTED' as any,
        cvUrl: '/files/cv-jean.pdf',
        appliedAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
      },
    ];

    return of({
      success: true,
      data: mockApps,
      pagination: {
        page: filter.page || 1,
        pageSize: filter.pageSize || 10,
        totalItems: 5,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      timestamp: new Date(),
    } as PaginatedApiResponse<Application>).pipe(delay(600));
  }

  private mockGetApplicationById(appId: string): Observable<Application> {
    return of({
      id: appId,
      jobId: 'job-1',
      candidateId: 'emp-1',
      candidateName: 'Jean Dupont',
      candidateEmail: 'jean@example.com',
      status: 'UNDER_REVIEW' as any,
      cvUrl: '/files/cv-jean.pdf',
      appliedAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
    } as Application).pipe(delay(500));
  }

  private mockCreateApplication(data: CreateApplicationDTO): Observable<Application> {
    return of({
      id: 'app-' + Math.random().toString(36).substr(2, 9),
      ...data,
      status: 'SUBMITTED' as any,
      appliedAt: new Date(),
      updatedAt: new Date(),
    } as Application).pipe(delay(700));
  }

  private mockUpdateApplication(
    appId: string,
    data: UpdateApplicationDTO,
  ): Observable<Application> {
    return of({
      id: appId,
      jobId: 'job-1',
      candidateId: 'emp-1',
      candidateName: 'Jean Dupont',
      candidateEmail: 'jean@example.com',
      ...data,
      appliedAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
    } as Application).pipe(delay(600));
  }
}
