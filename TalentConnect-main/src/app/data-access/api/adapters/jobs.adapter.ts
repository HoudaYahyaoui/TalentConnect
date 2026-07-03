import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { ApiHttpService, PageResponse } from '../http/api-http.service';
import { JobOffer } from '../../models/portal.models';

interface BackendJobOffer {
  id: string;
  title: string;
  companyName: string;
  location: string;

  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'TEMPORARY';
  experienceLevel: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';

  remote: boolean;
  description: string;
  published: boolean;

  publishedAt?: string | null;
  closingAt?: string | null;
  createdAt?: string | null;
}

/* ================= STATUS ================= */
function deriveStatus(job: BackendJobOffer): JobOffer['status'] {
  const now = Date.now();
  const closing = job.closingAt ? Date.parse(job.closingAt) : null;

  if (!job.published) return 'DRAFT';
  if (closing !== null && closing < now) return 'CLOSED';
  return 'OPEN';
}

/* ================= BACK -> FRONT ================= */
function toFrontend(job: BackendJobOffer): JobOffer {
  return {
    id: String(job.id),
    title: job.title,
    department: job.companyName,
    location: job.location,

    employmentType: toFrontendEmploymentType(job.employmentType),
    seniority: toFrontendSeniority(job.experienceLevel),

    status: deriveStatus(job),

    description: job.description,
    requirements: [],
    tags: [],

    publishedAt: job.publishedAt ?? job.createdAt ?? '',
    closingAt: job.closingAt ?? '',

    hiringManager: '',
    recommendedScore: 0,
  };
}

/* ================= FRONT -> BACK ================= */
function toBackend(job: Partial<JobOffer>) {
  const status = job.status ?? 'DRAFT';

  return {
    title: job.title ?? '',
    companyName: job.department ?? '',
    location: job.location ?? '',
    employmentType: toBackendEmploymentType(job.employmentType),
    experienceLevel: toBackendSeniority(job.seniority),
    remote: false,
    description: job.description ?? '',
    published: status === 'OPEN',
    publishedAt: job.publishedAt ?? null,
    closingAt:
      status === 'CLOSED' ? new Date(Date.now() - 60000).toISOString() : (job.closingAt ?? null),
  };
}

/* ================= SERVICE ================= */
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
            .pipe(map((r: BackendJobOffer[] | PageResponse<BackendJobOffer>) => (Array.isArray(r) ? r : r.content).map(toFrontend))),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /* ================= READ ================= */
  getJobs(): Observable<JobOffer[]> {
    return this.cache$;
  }

  getJobById(id: string): Observable<JobOffer | undefined> {
    return this.cache$.pipe(map((jobs: JobOffer[]) => jobs.find((x: JobOffer) => x.id === id)));
  }

  /* ================= ADMIN ================= */
  getJobsAdmin(): Observable<JobOffer[]> {
    return this.api
      .getFrom<BackendJobOffer[] | PageResponse<BackendJobOffer>>(this.api.jobsBase, 'admin/jobs')
      .pipe(map((r: BackendJobOffer[] | PageResponse<BackendJobOffer>) => (Array.isArray(r) ? r : r.content).map(toFrontend)));
  }

  /* ================= MUTATIONS ================= */
  createJob(job: Partial<JobOffer>): Observable<JobOffer> {
    return this.api
      .postTo<BackendJobOffer>(this.api.jobsBase, 'admin/jobs', toBackend(job))
      .pipe(map((r: BackendJobOffer) => toFrontend(r)));
  }

  updateJob(id: string, job: Partial<JobOffer>): Observable<JobOffer> {
    return this.api
      .putTo<BackendJobOffer>(this.api.jobsBase, `admin/jobs/${id}`, toBackend(job))
      .pipe(map((r: BackendJobOffer) => toFrontend(r)));
  }

  deleteJob(id: string): Observable<void> {
    return this.api.deleteFrom<void>(this.api.jobsBase, `admin/jobs/${id}`);
  }

  patchStatus(id: string, status: JobOffer['status'], job?: JobOffer): Observable<JobOffer> {
    return this.api
      .patchAt<BackendJobOffer>(this.api.jobsBase, `admin/jobs/${id}/status`, {
        ...toBackend({ ...job, status }),
      })
      .pipe(map((r: BackendJobOffer) => toFrontend(r)));
  }

  refreshCache() {
    this.invalidate$.next();
  }
}

/* ================= HELPERS ================= */
function toFrontendEmploymentType(v?: string) {
  switch (v) {
    case 'FULL_TIME':
      return 'CDI';
    case 'PART_TIME':
    case 'TEMPORARY':
      return 'CDD';
    case 'CONTRACT':
      return 'Freelance';
    case 'INTERN':
      return 'Stage';
    default:
      return 'CDI';
  }
}

function toBackendEmploymentType(v?: string) {
  switch (v) {
    case 'CDD':
      return 'TEMPORARY';
    case 'Freelance':
      return 'CONTRACT';
    case 'Stage':
      return 'INTERN';
    default:
      return 'FULL_TIME';
  }
}

function toFrontendSeniority(v?: string) {
  switch (v) {
    case 'JUNIOR':
      return 'Junior';
    case 'MID':
      return 'Confirmé';
    case 'SENIOR':
      return 'Senior';
    case 'LEAD':
      return 'Lead';
    default:
      return 'Confirmé';
  }
}

function toBackendSeniority(v?: string) {
  switch (v) {
    case 'Junior':
      return 'JUNIOR';
    case 'Senior':
      return 'SENIOR';
    case 'Lead':
      return 'LEAD';
    default:
      return 'MID';
  }
}
