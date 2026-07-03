import { writeFileSync } from 'fs';

// ─── AuthAdapter ─────────────────────────────────────────────────────────────
writeFileSync(
  'src/app/data-access/api/adapters/auth.adapter.ts',
  `import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiHttpService } from '../http/api-http.service';
import { UserProfile } from '../../models/portal.models';

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

@Injectable({ providedIn: 'root' })
export class AuthAdapter {
  private readonly api = inject(ApiHttpService);

  login(email: string, password: string): Observable<LoginResponse> {
    if (this.api.isMock) {
      return this.api.mockGet<(UserProfile & { password: string })[]>('users.json').pipe(
        map((users) => {
          const user = users.find(
            (item) =>
              item.email.toLowerCase() === email.trim().toLowerCase() &&
              item.password === password,
          );
          if (!user) throw new Error('Identifiants invalides');
          const { password: _p, ...safeUser } = user;
          return { token: \`mock-token-\${safeUser.id}\`, user: safeUser };
        }),
      );
    }
    return this.api.post<LoginResponse>('auth/login', { email, password });
  }
}
`,
);

// ─── JobsAdapter ──────────────────────────────────────────────────────────────
writeFileSync(
  'src/app/data-access/api/adapters/jobs.adapter.ts',
  `import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { ApiHttpService } from '../http/api-http.service';
import { JobOffer } from '../../models/portal.models';

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
        : this.api.get<JobOffer[]>('jobs'),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getJobs(filters?: JobFilters): Observable<JobOffer[]> {
    if (!this.api.isMock && filters) {
      const params: Record<string, string> = {};
      if (filters.query)      params['query']      = filters.query;
      if (filters.location)   params['location']   = filters.location;
      if (filters.department) params['department'] = filters.department;
      if (filters.sortBy)     params['sortBy']     = filters.sortBy;
      return this.api.get<JobOffer[]>('jobs', params);
    }
    return this.cache$.pipe(
      map((jobs) => {
        let result = [...jobs];
        if (filters?.query) {
          const q = filters.query.toLowerCase();
          result = result.filter(
            (j) =>
              j.title.toLowerCase().includes(q) ||
              j.tags.some((t) => t.toLowerCase().includes(q)) ||
              j.description.toLowerCase().includes(q),
          );
        }
        if (filters?.location)   result = result.filter((j) => j.location === filters.location);
        if (filters?.department) result = result.filter((j) => j.department === filters.department);
        if (filters?.sortBy === 'score')
          result.sort((a, b) => (b.recommendedScore ?? 0) - (a.recommendedScore ?? 0));
        if (filters?.sortBy === 'title')
          result.sort((a, b) => a.title.localeCompare(b.title));
        if (filters?.sortBy === 'publishedAt')
          result.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
        return result;
      }),
    );
  }

  getJobById(id: string): Observable<JobOffer | undefined> {
    if (!this.api.isMock) return this.api.get<JobOffer>(\`jobs/\${id}\`);
    return this.cache$.pipe(map((jobs) => jobs.find((j) => j.id === id)));
  }

  createJob(job: Partial<JobOffer>): Observable<JobOffer> {
    if (this.api.isMock) throw new Error('createJob not supported in mock mode');
    return this.api.post<JobOffer>('jobs', job);
  }

  updateJob(id: string, job: Partial<JobOffer>): Observable<JobOffer> {
    if (this.api.isMock) throw new Error('updateJob not supported in mock mode');
    return this.api.put<JobOffer>(\`jobs/\${id}\`, job);
  }

  patchStatus(id: string, status: string): Observable<JobOffer> {
    if (this.api.isMock) throw new Error('patchStatus not supported in mock mode');
    return this.api.patch<JobOffer>(\`jobs/\${id}/status\`, { status });
  }

  refreshCache(): void { this.invalidate$.next(); }
}
`,
);

// ─── ApplicationsAdapter ──────────────────────────────────────────────────────
writeFileSync(
  'src/app/data-access/api/adapters/applications.adapter.ts',
  `import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, startWith, switchMap } from 'rxjs/operators';
import { ApiHttpService } from '../http/api-http.service';
import { ApplicationRecord, ApplicationStatus, KanbanColumn } from '../../models/portal.models';

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

  private readonly cache$ = this.invalidate$.pipe(
    startWith(undefined),
    switchMap(() =>
      this.api.isMock
        ? this.api.mockGet<ApplicationRecord[]>('applications.json')
        : this.api.get<ApplicationRecord[]>('applications'),
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  getApplications(): Observable<ApplicationRecord[]> { return this.cache$; }

  getMyApplications(): Observable<ApplicationRecord[]> {
    if (!this.api.isMock) return this.api.get<ApplicationRecord[]>('applications/mine');
    return this.cache$;
  }

  getApplicationById(id: string): Observable<ApplicationRecord | undefined> {
    if (!this.api.isMock) return this.api.get<ApplicationRecord>(\`applications/\${id}\`);
    return this.cache$.pipe(map((items) => items.find((item) => item.id === id)));
  }

  apply(jobId: string): Observable<ApplicationRecord> {
    if (this.api.isMock) throw new Error('apply not supported in mock mode');
    return this.api.post<ApplicationRecord>('applications', { jobId });
  }

  withdraw(id: string): Observable<void> {
    if (this.api.isMock) throw new Error('withdraw not supported in mock mode');
    return this.api.delete<void>(\`applications/\${id}\`);
  }

  patchStatus(id: string, status: ApplicationStatus): Observable<ApplicationRecord> {
    if (this.api.isMock) throw new Error('patchStatus not supported in mock mode');
    return this.api.patch<ApplicationRecord>(\`applications/\${id}/status\`, { status });
  }

  getKanbanColumns(): Observable<KanbanColumn[]> {
    return this.cache$.pipe(
      map((items) => {
        const statuses: ApplicationStatus[] = ['SUBMITTED','REVIEW','INTERVIEW','OFFER','HIRED','REJECTED'];
        return statuses.map((status) => ({
          status,
          label: COLUMN_LABELS[status],
          items: items.filter((item) => item.status === status),
        }));
      }),
    );
  }

  refreshCache(): void { this.invalidate$.next(); }
}
`,
);

// ─── ReferralsAdapter ─────────────────────────────────────────────────────────
writeFileSync(
  'src/app/data-access/api/adapters/referrals.adapter.ts',
  `import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiHttpService } from '../http/api-http.service';
import { ReferralDraft } from '../../models/portal.models';

@Injectable({ providedIn: 'root' })
export class ReferralsAdapter {
  private readonly api = inject(ApiHttpService);

  getReferrals(): Observable<ReferralDraft[]> {
    if (!this.api.isMock) return this.api.get<ReferralDraft[]>('referrals/mine');
    return this.api.mockGet<ReferralDraft[]>('referrals.json');
  }

  createReferral(referral: Partial<ReferralDraft>): Observable<ReferralDraft> {
    if (this.api.isMock) throw new Error('createReferral not supported in mock mode');
    return this.api.post<ReferralDraft>('referrals', referral);
  }

  deleteReferral(id: string): Observable<void> {
    if (this.api.isMock) throw new Error('deleteReferral not supported in mock mode');
    return this.api.delete<void>(\`referrals/\${id}\`);
  }
}
`,
);

// ─── NotificationsAdapter ─────────────────────────────────────────────────────
writeFileSync(
  'src/app/data-access/api/adapters/notifications.adapter.ts',
  `import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiHttpService } from '../http/api-http.service';
import { AuditEvent, HrDashboardMetrics, NotificationItem } from '../../models/portal.models';

@Injectable({ providedIn: 'root' })
export class NotificationsAdapter {
  private readonly api = inject(ApiHttpService);

  getNotifications(): Observable<NotificationItem[]> {
    if (!this.api.isMock) return this.api.get<NotificationItem[]>('notifications');
    return this.api.mockGet<NotificationItem[]>('notifications.json');
  }

  markRead(id: string): Observable<void> {
    if (this.api.isMock) return new Observable((obs) => { obs.complete(); });
    return this.api.patch<void>(\`notifications/\${id}/read\`);
  }

  markAllRead(): Observable<void> {
    if (this.api.isMock) return new Observable((obs) => { obs.complete(); });
    return this.api.patch<void>('notifications/read-all');
  }

  dismiss(id: string): Observable<void> {
    if (this.api.isMock) return new Observable((obs) => { obs.complete(); });
    return this.api.delete<void>(\`notifications/\${id}\`);
  }

  getAuditEvents(): Observable<AuditEvent[]> {
    if (!this.api.isMock) return this.api.get<AuditEvent[]>('audit');
    return this.api.mockGet<AuditEvent[]>('audit-events.json');
  }

  getHrMetrics(): Observable<HrDashboardMetrics> {
    if (!this.api.isMock) return this.api.get<HrDashboardMetrics>('hr/metrics');
    return this.api.mockGet<HrDashboardMetrics>('hr-metrics.json');
  }
}
`,
);

console.log('Tous les adapters migrés OK');
