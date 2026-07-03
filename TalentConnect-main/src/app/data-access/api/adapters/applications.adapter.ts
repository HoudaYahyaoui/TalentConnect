import { Injectable, inject } from '@angular/core';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { ApiHttpService, PageResponse } from '../http/api-http.service';
import { ApplicationRecord, ApplicationStatus, KanbanColumn } from '../../models/portal.models';
import { UserDto } from '../../../core/api/models/backend-api-models';

// Mapping statuts frontend → backend (candidatures-service)
const STATUS_TO_BACKEND: Record<ApplicationStatus, string> = {
  SUBMITTED: 'SOUMISE',
  REVIEW: 'EN_COURS',
  INTERVIEW: 'ENTRETIEN',
  OFFER: 'ENTRETIEN',
  HIRED: 'RECRUTEE',
  REJECTED: 'REFUSEE',
};
// Mapping statuts backend → frontend
const STATUS_FROM_BACKEND: Record<string, ApplicationStatus> = {
  SOUMISE: 'SUBMITTED',
  EN_COURS: 'REVIEW',
  ENTRETIEN: 'INTERVIEW',
  RECRUTEE: 'HIRED',
  REFUSEE: 'REJECTED',
};
function normalizeStatus(s: string): ApplicationStatus {
  return STATUS_FROM_BACKEND[s] ?? (s as ApplicationStatus);
}

function extractItems<T>(response: T[] | PageResponse<T>): T[] {
  return Array.isArray(response) ? response : (response.content ?? []);
}

/** Shape returned by candidatures-service API */
interface BackendCandidature {
  id: number | string;
  offerId: number;
  applicantUserId?: number;
  type?: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  cvFileId?: string | null;
  referralId?: number | null;
}

/** Maps raw backend candidature to the frontend ApplicationRecord */
function toApplicationRecord(raw: BackendCandidature): ApplicationRecord {
  return {
    id: String(raw.id),
    offerId: raw.offerId,
    applicantUserId: raw.applicantUserId,
    type: raw.type,
    status: normalizeStatus(raw.status),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? raw.createdAt,
    cvFileId: raw.cvFileId,
    referralId: raw.referralId,
    // derived / display fields
    jobId: String(raw.offerId),
    candidateName: `Employé #${raw.applicantUserId ?? '?'}`,
    source: raw.type === 'RECOMMANDATION' ? 'REFERRAL' : 'INTERNAL',
    score: 0,
    timeline: [],
    documents: [],
  };
}

const COLUMN_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: 'Soumis',
  REVIEW: 'Analyse',
  INTERVIEW: 'Entretien',
  OFFER: 'Offre',
  HIRED: 'Recruté',
  REJECTED: 'Refusé',
};

@Injectable({ providedIn: 'root' })
export class ApplicationsAdapter {
  private readonly api = inject(ApiHttpService);
  private readonly invalidate$ = new Subject<void>();

  private fetchUserName(userId: number): Observable<string> {
    return this.api
      .getFromSilent<UserDto>(this.api.authBase, `users/${userId}`)
      .pipe(
        map((u) => `${u.firstName} ${u.lastName}`.trim() || `Employé #${userId}`),
        catchError(() => of(`Employé #${userId}`)),
      );
  }

  private enrichWithNames(records: ApplicationRecord[]): Observable<ApplicationRecord[]> {
    const ids = [...new Set(records.map((r) => r.applicantUserId).filter((id): id is number => id != null))];
    if (ids.length === 0) return of(records);
    const requests: Record<string, Observable<string>> = {};
    ids.forEach((id) => (requests[String(id)] = this.fetchUserName(id)));
    return forkJoin(requests).pipe(
      map((nameMap) =>
        records.map((r) => ({
          ...r,
          candidateName:
            r.applicantUserId != null
              ? (nameMap[String(r.applicantUserId)] ?? r.candidateName)
              : r.candidateName,
        })),
      ),
      catchError(() => of(records)),
    );
  }

  private readonly cache$ = this.invalidate$.pipe(
    startWith(undefined),
    switchMap(() =>
      this.api.isMock
        ? this.api.mockGet<ApplicationRecord[]>('applications.json')
        : this.api
            .candGetPage<BackendCandidature>('candidatures')
            .pipe(
              map((response) => extractItems(response).map(toApplicationRecord)),
              switchMap((records) => this.enrichWithNames(records)),
            ),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getApplications(): Observable<ApplicationRecord[]> {
    return this.cache$;
  }

  getMyApplications(): Observable<ApplicationRecord[]> {
    if (!this.api.isMock) {
      return this.api
        .candGetPage<BackendCandidature>('candidatures/me')
        .pipe(map((response) => extractItems(response).map(toApplicationRecord)));
    }
    return this.cache$;
  }

  getApplicationById(id: string): Observable<ApplicationRecord | undefined> {
    if (!this.api.isMock) {
      // Backend wraps response: { candidature: CandidatureResponse, history: [...] }
      return this.api
        .candGet<{ candidature: BackendCandidature; history: unknown[] }>(`candidatures/${id}`)
        .pipe(
          map((resp) => {
            const raw = resp?.candidature ?? (resp as unknown as BackendCandidature);
            return toApplicationRecord(raw);
          }),
        );
    }
    return this.cache$.pipe(map((items) => items.find((item) => item.id === id)));
  }

  apply(jobId: string): Observable<ApplicationRecord> {
    if (this.api.isMock) throw new Error('apply not supported in mock mode');
    // Send as integer if jobId is a pure integer string; otherwise send as-is (UUID)
    const numericId = Number(jobId);
    const offerId = Number.isInteger(numericId) && numericId > 0 && String(numericId) === jobId
      ? numericId
      : jobId;
    return this.api
      .candPost<BackendCandidature>('candidatures', { offerId, type: 'INTERNE' })
      .pipe(map(toApplicationRecord));
  }

  withdraw(id: string): Observable<void> {
    if (this.api.isMock) throw new Error('withdraw not supported in mock mode');
    return this.api.candDelete<void>(`candidatures/${id}`);
  }

  patchStatus(id: string, status: ApplicationStatus): Observable<ApplicationRecord> {
    if (this.api.isMock) throw new Error('patchStatus not supported in mock mode');
    return this.api
      .candPatch<BackendCandidature>(`candidatures/${id}/status`, {
        newStatus: STATUS_TO_BACKEND[status] ?? status,
      })
      .pipe(map(toApplicationRecord));
  }

  /** PATCH /api/candidatures/{id}/cv — attach an uploaded CV file to a candidature */
  attachCv(id: string, cvFileId: string): Observable<ApplicationRecord> {
    if (this.api.isMock) throw new Error('attachCv not supported in mock mode');
    return this.api
      .candPatch<BackendCandidature>(`candidatures/${id}/cv`, { cvFileId })
      .pipe(map(toApplicationRecord));
  }

  getKanbanColumns(): Observable<KanbanColumn[]> {
    return this.cache$.pipe(
      map((items) => {
        const statuses: ApplicationStatus[] = [
          'SUBMITTED',
          'REVIEW',
          'INTERVIEW',
          'OFFER',
          'HIRED',
          'REJECTED',
        ];
        return statuses.map((status) => ({
          status,
          label: COLUMN_LABELS[status],
          items: items.filter((item) => item.status === status),
        }));
      }),
    );
  }

  refreshCache(): void {
    this.invalidate$.next();
  }
}
