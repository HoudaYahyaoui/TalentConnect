/**
 * JOBS ADAPTER - Adapter pattern pour le service Jobs
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { ApiGatewayService } from '../api-gateway.service';
import {
  Job,
  JobFilter,
  CreateJobDTO,
  UpdateJobDTO,
} from '../../../features/jobs/models/job.model';
import { PaginatedApiResponse } from '../models/api-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JobsAdapter {
  private useMock = environment.useMocks;

  constructor(private apiGateway: ApiGatewayService) {}

  /**
   * Get all jobs (paginated)
   */
  getJobs(filter: JobFilter): Observable<PaginatedApiResponse<Job>> {
    if (this.useMock) {
      return this.mockGetJobs(filter);
    }

    return this.apiGateway.getPaginated<Job>('/jobs', {
      params: filter as Record<string, string | number | boolean | undefined | null>,
    });
  }

  /**
   * Get job by ID
   */
  getJobById(jobId: string): Observable<Job> {
    if (this.useMock) {
      return this.mockGetJobById(jobId);
    }

    return this.apiGateway.get<Job>(`/jobs/${jobId}`).pipe(map((res) => res.data!));
  }

  /**
   * Create new job (RH only)
   */
  createJob(data: CreateJobDTO): Observable<Job> {
    if (this.useMock) {
      return this.mockCreateJob(data);
    }

    return this.apiGateway.post<Job>('/jobs', data).pipe(map((res) => res.data!));
  }

  /**
   * Update job (RH only)
   */
  updateJob(jobId: string, data: UpdateJobDTO): Observable<Job> {
    if (this.useMock) {
      return this.mockUpdateJob(jobId, data);
    }

    return this.apiGateway.put<Job>(`/jobs/${jobId}`, data).pipe(map((res) => res.data!));
  }

  /**
   * Delete job (RH only)
   */
  deleteJob(jobId: string): Observable<void> {
    if (this.useMock) {
      return this.mockDeleteJob(jobId);
    }

    return this.apiGateway.delete<void>(`/jobs/${jobId}`).pipe(map(() => void 0));
  }

  // ===== MOCK IMPLEMENTATIONS =====

  private mockGetJobs(filter: JobFilter): Observable<PaginatedApiResponse<Job>> {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Senior Angular Developer',
        description: 'Looking for experienced Angular developers...',
        department: 'Engineering',
        location: 'Remote',
        type: 'FULL_TIME' as any,
        status: 'OPEN' as any,
        salary: 80000,
        requirements: ['Angular', 'TypeScript', 'RxJS'],
        createdBy: 'rh-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'UX/UI Designer',
        description: 'Design beautiful interfaces...',
        department: 'Design',
        location: 'Paris',
        type: 'FULL_TIME' as any,
        status: 'OPEN' as any,
        salary: 65000,
        requirements: ['Figma', 'UI Design', 'Prototyping'],
        createdBy: 'rh-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return of({
      success: true,
      data: mockJobs,
      pagination: {
        page: filter.page || 1,
        pageSize: filter.pageSize || 10,
        totalItems: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: false,
      },
      timestamp: new Date(),
    } as PaginatedApiResponse<Job>).pipe(delay(800));
  }

  private mockGetJobById(jobId: string): Observable<Job> {
    return of({
      id: jobId,
      title: 'Senior Angular Developer',
      description: 'Looking for experienced Angular developers...',
      department: 'Engineering',
      location: 'Remote',
      type: 'FULL_TIME' as any,
      status: 'OPEN' as any,
      salary: 80000,
      requirements: ['Angular', 'TypeScript', 'RxJS'],
      createdBy: 'rh-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Job).pipe(delay(600));
  }

  private mockCreateJob(data: CreateJobDTO): Observable<Job> {
    return of({
      id: 'new-' + Math.random().toString(36).substr(2, 9),
      ...data,
      status: 'DRAFT' as any,
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Job).pipe(delay(800));
  }

  private mockUpdateJob(jobId: string, data: UpdateJobDTO): Observable<Job> {
    return of({
      id: jobId,
      title: data.title || 'Updated Job',
      description: data.description || '',
      department: data.department || '',
      location: data.location || '',
      type: data.type || ('FULL_TIME' as any),
      status: data.status || ('OPEN' as any),
      requirements: data.requirements || [],
      createdBy: 'current-user',
      createdAt: new Date(Date.now() - 86400000), // yesterday
      updatedAt: new Date(),
    } as Job).pipe(delay(600));
  }

  private mockDeleteJob(jobId: string): Observable<void> {
    return of(void 0).pipe(delay(600));
  }
}
