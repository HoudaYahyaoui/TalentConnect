import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../http/api-http.service';
import { AuditEvent, HrDashboardMetrics, NotificationItem } from '../../models/portal.models';

interface BackendHrMetrics {
  totalJobOffers?: number;
  publishedJobs?: number;
  totalReferrals?: number;
  hiredFromReferral?: number;
  auditEventsToday?: number;
  totalAuditEvents?: number;
}

/** Backend returns uppercase type (SUCCESS|INFO|WARNING|ERROR) and numeric id */
interface BackendNotification {
  id: number | string;
  userId?: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  deepLink?: string;
  createdAt: string;
}

function toNotificationItem(n: BackendNotification): NotificationItem {
  return {
    id: String(n.id),
    type: (n.type?.toLowerCase() ?? 'info') as NotificationItem['type'],
    title: n.title,
    message: n.message,
    read: n.read,
    deepLink: n.deepLink,
    createdAt: n.createdAt,
  };
}

@Injectable({ providedIn: 'root' })
export class NotificationsAdapter {
  private readonly api = inject(ApiHttpService);

  // ─── Notifications (candidatures-service :8084, X-headers) ──────────────────

  getNotifications(): Observable<NotificationItem[]> {
    if (!this.api.isMock) {
      return this.api
        .candGet<BackendNotification[]>('notifications')
        .pipe(map((list) => list.map(toNotificationItem)));
    }
    return this.api.mockGet<NotificationItem[]>('notifications.json');
  }

  getUnreadCount(): Observable<{ count: number }> {
    if (!this.api.isMock) return this.api.candGet<{ count: number }>('notifications/unread-count');
    return of({ count: 0 });
  }

  markRead(id: string): Observable<NotificationItem> {
    if (this.api.isMock) return of({} as NotificationItem);
    return this.api
      .candPatch<BackendNotification>(`notifications/${id}/read`)
      .pipe(map(toNotificationItem));
  }

  markAllRead(): Observable<void> {
    if (this.api.isMock) return of(void 0);
    return this.api.candPatch<void>('notifications/read-all');
  }

  dismiss(id: string): Observable<void> {
    if (this.api.isMock) return of(void 0);
    return this.api.candDelete<void>(`notifications/${id}`);
  }

  // ─── Audit (job-service :8085, JWT) ─────────────────────────────────────

  getAuditEvents(): Observable<AuditEvent[]> {
    if (!this.api.isMock) {
      return this.api.getFrom<AuditEvent[]>(this.api.jobsBase, 'audit');
    }
    return this.api.mockGet<AuditEvent[]>('audit-events.json');
  }

  // ─── HR Metrics (job-service :8085, JWT) ─────────────────────────────────

  getHrMetrics(): Observable<HrDashboardMetrics> {
    if (!this.api.isMock) {
      return this.api.getFromSilent<BackendHrMetrics>(this.api.jobsBase, 'hr/metrics').pipe(
        map((raw) => ({
          totalJobOffers: raw.totalJobOffers ?? 0,
          publishedJobs: raw.publishedJobs ?? 0,
          totalReferrals: raw.totalReferrals ?? 0,
          hiredFromReferral: raw.hiredFromReferral ?? 0,
          auditEventsToday: raw.auditEventsToday ?? 0,
          totalAuditEvents: raw.totalAuditEvents ?? 0,
          totalApplications: 0, // populated by the dashboard from allApplications.length
          internalCandidates: (raw as { internalCandidates?: number }).internalCandidates ?? 0,
          referrals: raw.totalReferrals ?? 0,
          conversionRate: (raw as { conversionRate?: number }).conversionRate ?? 0,
          avgTimeToHire: (raw as { avgTimeToHire?: number }).avgTimeToHire ?? 0,
        })),
      );
    }
    return this.api.mockGet<HrDashboardMetrics>('hr-metrics.json');
  }
}
