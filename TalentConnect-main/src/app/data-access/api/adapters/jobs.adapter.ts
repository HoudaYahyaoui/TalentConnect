import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { ApiHttpService, PageResponse } from '../http/api-http.service';
import { JobOffer } from '../../models/portal.models';

interface BackendJobOffer {
  id: string | number;
  title: string;
  department?: string;
  status?: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED';
  employmentType?:
    | 'CDI'
    | 'CDD'
    | 'STAGE'
    | 'FREELANCE'
    | 'FULL_TIME'
    | 'PART_TIME'
    | 'CONTRACT'
    | 'INTERN'
    | 'TEMPORARY';
  seniority?:
    | 'Junior'
    | 'Confirme'
    | 'Confirmé'
    | 'Senior'
    | 'Lead'
    | 'JUNIOR'
    | 'MID'
    | 'SENIOR'
    | 'LEAD';
  publishedAt?: string;
  closingAt?: string;
  hiringManager?: string;
  requirements?: string[];
  tags?: string[];

  // Legacy microservice fields (still accepted during migration)
  companyName?: string;
  location: string;
  experienceLevel?: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';
  remote?: boolean;
  description: string;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendCreateOrUpdateJob {
  title: string;
  companyName: string; // backend field (not 'department')
  location: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'TEMPORARY';
  experienceLevel: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD'; // backend field (not 'seniority')
  remote?: boolean;
  description: string;
  published?: boolean; // backend uses boolean (not status string)
  status?: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED'; // Status support (ARCHIVED may be ignored by backend)
  requirements?: string[];
  tags?: string[];
  publishedAt?: string;
  closingAt?: string;
  hiringManager?: string;
}

function toFrontendEmploymentType(
  value?: BackendJobOffer['employmentType'],
): JobOffer['employmentType'] {
  switch (value) {
    case 'CDI':
    case 'FULL_TIME':
      return 'CDI';
    case 'CDD':
    case 'PART_TIME':
    case 'TEMPORARY':
      return 'CDD';
    case 'FREELANCE':
    case 'CONTRACT':
      return 'Freelance';
    case 'STAGE':
    case 'INTERN':
      return 'Stage';
    default:
      return 'CDI';
  }
}

function toBackendEmploymentType(
  value?: JobOffer['employmentType'],
): BackendCreateOrUpdateJob['employmentType'] {
  switch (value) {
    case 'CDD':
      return 'PART_TIME';
    case 'Freelance':
      return 'CONTRACT';
    case 'Stage':
      return 'INTERN';
    case 'CDI':
    default:
      return 'FULL_TIME';
  }
}

function toFrontendSeniority(
  value?: BackendJobOffer['seniority'] | BackendJobOffer['experienceLevel'],
): JobOffer['seniority'] {
  switch (value) {
    case 'Junior':
    case 'JUNIOR':
      return 'Junior';
    case 'Senior':
    case 'MID':
      return 'Confirmé';
    case 'Confirmé':
    case 'Confirme':
      return 'Confirmé';
    case 'SENIOR':
      return 'Senior';
    case 'Lead':
    case 'LEAD':
      return 'Lead';
    default:
      return 'Confirmé';
  }
}

function toBackendSeniority(
  value?: JobOffer['seniority'],
): BackendCreateOrUpdateJob['experienceLevel'] {
  switch (value) {
    case 'Junior':
      return 'JUNIOR';
    case 'Senior':
      return 'SENIOR';
    case 'Lead':
      return 'LEAD';
    case 'Confirmé':
    default:
      return 'MID';
  }
}

function toFrontendJob(job: BackendJobOffer): JobOffer {
  // DEBUG: Log what backend returns
  console.log('toFrontendJob DEBUG:', {
    id: job.id,
    status: job.status,
    published: job.published,
    publishedAt: job.publishedAt,
    closingAt: job.closingAt,
    createdAt: job.createdAt,
  });

  // Use actual publishedAt from backend when available; otherwise derive from createdAt
  const publishedDate = job.publishedAt ?? job.createdAt ?? new Date().toISOString();
  // Use actual closingAt from backend when available; default to empty string
  const closingDate = job.closingAt ?? '';

  let status: JobOffer['status'];
  if (job.status) {
    status = job.status;
    // Correction manuelle : si le statut est OPEN mais que la date de fin est passée
    if (status === 'OPEN' && job.closingAt) {
      if (Date.parse(job.closingAt) < Date.now()) {
        status = 'CLOSED';
      }
    }
  } else {
    // Derive status from legacy fields: prefer published flag, then publishedAt/closingAt timestamps.
    const now = Date.now();
    const publishedAtTs = job.publishedAt ? Date.parse(job.publishedAt) : NaN;
    const closingAtTs = job.closingAt ? Date.parse(job.closingAt) : NaN;

    console.log('toFrontendJob STATUS DERIVATION:', {
      now,
      publishedAtTs,
      closingAtTs,
      'closingAtTs < now': closingAtTs < now,
    });

    // If backend explicitly set published boolean -> OPEN when true
    if (job.published) {
      // If closingAt exists and is in the past, consider CLOSED
      if (!Number.isNaN(closingAtTs) && closingAtTs < now) status = 'CLOSED';
      else status = 'OPEN';
    }
    // If publication date exists and is in the past, treat as published/open (unless closed)
    else if (!Number.isNaN(publishedAtTs) && publishedAtTs <= now) {
      if (!Number.isNaN(closingAtTs) && closingAtTs < now) status = 'CLOSED';
      else status = 'OPEN';
    }
    // If closing date exists and is in the past => CLOSED
    else if (!Number.isNaN(closingAtTs) && closingAtTs < now) {
      status = 'CLOSED';
    }
    // Fallback: DRAFT
    else {
      status = 'DRAFT';
    }
  }

  console.log('toFrontendJob FINAL STATUS:', status);
  return {
    id: String(job.id),
    title: job.title,
    department: job.department ?? job.companyName ?? 'TalentConnect',
    location: job.location,
    employmentType: toFrontendEmploymentType(job.employmentType),
    seniority: toFrontendSeniority(job.seniority ?? job.experienceLevel),
    status,
    description: job.description,
    requirements: job.requirements ?? [],
    tags: job.tags ?? [],
    publishedAt: publishedDate,
    closingAt: closingDate,
    hiringManager: job.hiringManager ?? '',
    recommendedScore: undefined,
  };
}

function toBackendJobPayload(job: Partial<JobOffer>): BackendCreateOrUpdateJob {
  const isClosed = job.status === 'CLOSED';
  const isOpen = job.status === 'OPEN';
  const isDraft = job.status === 'DRAFT';
  const isArchived = job.status === 'ARCHIVED';
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

  let closingAtValue = job.closingAt;
  let publishedAtValue = job.publishedAt;
  let publishedValue: boolean;

  if (isClosed) {
    // Pour que le backend considère l'offre comme CLOSED, il faut published=true et closingAt dans le passé.
    // Important: préserver publishedAt original et définir closingAt dans le passé
    closingAtValue = oneMinuteAgo;
    publishedValue = true; // Doit être true pour que le backend la considère comme CLOSED
    // Assurer que publishedAt est défini pour le statut CLOSED
    if (!publishedAtValue) {
      publishedAtValue = new Date().toISOString();
    }
  } else if (isOpen) {
    publishedValue = true; // Doit être true pour OPEN
    // CORRECTION BUG: Si l'offre est PUBLIÉE mais que publishedAt n'est pas défini,
    // on le définit à la date actuelle. Ceci évite que toFrontendJob utilise createdAt à la place.
    if (!publishedAtValue) {
      publishedAtValue = new Date().toISOString();
    }
  } else if (isDraft) {
    publishedValue = false; // Doit être false pour DRAFT
  } else if (isArchived) {
    publishedValue = false; // ARCHIVED signifie non publié
  } else {
    publishedValue = false; // Défaut : non publié
  }

  // Log for debugging
  if (isClosed) {
    console.log('closeJob payload:', {
      status: job.status,
      closingAt: closingAtValue,
      publishedAt: publishedAtValue,
      published: publishedValue,
    });
  }

  return {
    title: job.title ?? '',
    companyName: job.department ?? 'TalentConnect',
    location: job.location ?? '',
    employmentType: toBackendEmploymentType(job.employmentType),
    experienceLevel: toBackendSeniority(job.seniority),
    remote: false,
    description: job.description ?? '',
    requirements: job.requirements ?? [],
    tags: job.tags ?? [],
    published: publishedValue,
    publishedAt: publishedAtValue,
    closingAt: closingAtValue,
    hiringManager: job.hiringManager,
    status: job.status as any // Toujours envoyer le statut explicitement si le backend le supporte
  };
}

export interface JobFilters {
  query?: string;
  location?: string;
  department?: string;
  sortBy?: 'score' | 'publishedAt' | 'title';
}

@Injectable({ providedIn: 'root' })
export class JobsAdapter {
  private readonly api = inject(ApiHttpService);
  private readonly invalidate$ = new Subject<void>();

  private readonly cache$ = this.invalidate$.pipe(
    startWith(undefined),
    switchMap(() =>
      this.api.isMock
        ? this.api.mockGet<JobOffer[]>('jobs.json')
        : this.api
            .getFrom<BackendJobOffer[] | PageResponse<BackendJobOffer>>(this.api.jobsBase, 'jobs')
            .pipe(map((r) => (Array.isArray(r) ? r : r.content).map((job) => toFrontendJob(job)))),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getJobs(filters?: JobFilters): Observable<JobOffer[]> {
    if (!this.api.isMock && filters) {
      const params: Record<string, string> = {};
      if (filters.query) params['q'] = filters.query;
      if (filters.location) params['location'] = filters.location;
      if (filters.sortBy === 'publishedAt') params['sort'] = 'publishedAt,desc';
      else if (filters.sortBy === 'title') params['sort'] = 'title,asc';
      return this.api
        .getFrom<
          BackendJobOffer[] | PageResponse<BackendJobOffer>
        >(this.api.jobsBase, 'jobs', params)
        .pipe(map((r) => (Array.isArray(r) ? r : r.content).map((job) => toFrontendJob(job))));
    }
    return this.cache$.pipe(
      map((jobs) => {
        let result = [...jobs];
        if (filters?.query) {
          const q = filters.query.toLowerCase();
          result = result.filter(
            (j) =>
              j.title.toLowerCase().includes(q) ||
              j.tags?.some((t) => t.toLowerCase().includes(q)) ||
              j.description.toLowerCase().includes(q),
          );
        }
        if (filters?.location) result = result.filter((j) => j.location === filters.location);
        if (filters?.department) result = result.filter((j) => j.department === filters.department);
        if (filters?.sortBy === 'score')
          result.sort((a, b) => (b.recommendedScore ?? 0) - (a.recommendedScore ?? 0));
        if (filters?.sortBy === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
        if (filters?.sortBy === 'publishedAt')
          result.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
        return result;
      }),
    );
  }

  /**
   * HR / Admin: fetch all jobs (including DRAFT, CLOSED, ARCHIVED).
   * Accepts optional filters so the admin endpoint can be queried server-side
   * for q/location/sort when provided.
   */
  getJobsAdmin(filters?: JobFilters): Observable<JobOffer[]> {
    if (this.api.isMock) {
      return this.api.mockGet<JobOffer[]>('jobs.json');
    }
    const params: Record<string, string> = {};
    if (filters) {
      if (filters.query) params['q'] = filters.query;
      if (filters.location) params['location'] = filters.location;
      if (filters.department) params['department'] = filters.department;
      if (filters.sortBy === 'publishedAt') params['sort'] = 'publishedAt,desc';
      else if (filters.sortBy === 'title') params['sort'] = 'title,asc';
    }
    return this.api
      .getFrom<BackendJobOffer[] | PageResponse<BackendJobOffer>>(this.api.jobsBase, 'admin/jobs', params)
      .pipe(map((r) => (Array.isArray(r) ? r : r.content).map((job) => toFrontendJob(job))));
  }

  getJobById(id: string): Observable<JobOffer | undefined> {
    if (!this.api.isMock) {
      return this.api
        .getFrom<BackendJobOffer>(this.api.jobsBase, `jobs/${id}`)
        .pipe(map((job) => toFrontendJob(job)));
    }
    return this.cache$.pipe(map((jobs) => jobs.find((j) => j.id === id)));
  }

  createJob(job: Partial<JobOffer>): Observable<JobOffer> {
    if (this.api.isMock) throw new Error('createJob not supported in mock mode');
    return this.api
      .postTo<BackendJobOffer>(this.api.jobsBase, 'admin/jobs', toBackendJobPayload(job))
      .pipe(map((created) => toFrontendJob(created)));
  }

  updateJob(id: string, job: Partial<JobOffer>): Observable<JobOffer> {
    if (this.api.isMock) throw new Error('updateJob not supported in mock mode');
    return this.api
      .putTo<BackendJobOffer>(this.api.jobsBase, `admin/jobs/${id}`, toBackendJobPayload(job))
      .pipe(map((updated) => toFrontendJob(updated)));
  }

  /** Publier / dépublier une offre (RH ou Admin) */
  togglePublished(id: string, published: boolean): Observable<JobOffer> {
    if (this.api.isMock) throw new Error('togglePublished not supported in mock mode');
    return this.api
      .patchAt<BackendJobOffer>(this.api.jobsBase, `admin/jobs/${id}/published`, { published })
      .pipe(map((updated) => toFrontendJob(updated)));
  }

  deleteJob(id: string): Observable<void> {
    if (this.api.isMock) throw new Error('deleteJob not supported in mock mode');
    return this.api.deleteFrom<void>(this.api.jobsBase, `admin/jobs/${id}`);
  }

  /** Change the status of a job (HR/Admin only) */
  patchStatus(id: string, status: string, job?: JobOffer): Observable<JobOffer> {
    if (this.api.isMock) throw new Error('patchStatus not supported in mock mode');

    // Build the payload based on the status being set
    const statusPayload: any = { status };

    // For CLOSED status, also set published=true and closingAt to the past
    if (status === 'CLOSED') {
      statusPayload.published = true;
      statusPayload.closingAt = new Date(Date.now() - 60000).toISOString();
      // Preserve publishedAt if available
      if (job?.publishedAt) {
        statusPayload.publishedAt = job.publishedAt;
      }
    }
    // For OPEN status, set published=true
    else if (status === 'OPEN') {
      statusPayload.published = true;
    }
    // For DRAFT status, set published=false
    else if (status === 'DRAFT') {
      statusPayload.published = false;
    }

    // Use PATCH to /admin/jobs/{id}/status endpoint
    // The backend may support this endpoint for status changes
    return this.api
      .patchAt<BackendJobOffer>(this.api.jobsBase, `admin/jobs/${id}/status`, statusPayload)
      .pipe(map((updated) => toFrontendJob(updated)));
  }


  refreshCache(): void {
    this.invalidate$.next();
  }
}
