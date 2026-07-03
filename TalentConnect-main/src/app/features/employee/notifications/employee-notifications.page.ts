import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AlertsService, AlertSeverity } from '../../../core/services/alerts.service';

const SEV: Record<AlertSeverity, { icon: string; cls: string }> = {
  info: { icon: 'info', cls: 'sev-info' },
  success: { icon: 'check_circle', cls: 'sev-success' },
  warning: { icon: 'warning_amber', cls: 'sev-warning' },
  error: { icon: 'error_outline', cls: 'sev-error' },
};

@Component({
  selector: 'app-employee-notifications-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="notif-wrap">
      <header class="notif-header">
        <div>
          <p class="eyebrow">Centre de messages</p>
          <h2>Notifications</h2>
        </div>
        <div class="header-right">
          @if (svc.unreadCount() > 0) {
            <button mat-stroked-button class="btn-all" (click)="svc.markAllRead()">
              <mat-icon>done_all</mat-icon> Tout lire
            </button>
          }
          <span class="badge-pill"
            >{{ svc.unreadCount() }} non lue{{ svc.unreadCount() > 1 ? 's' : '' }}</span
          >
        </div>
      </header>

      @if (svc.alerts().length) {
        <div class="notif-list">
          @for (n of svc.alerts(); track n.id) {
            <article class="notif-card" [class.unread]="!n.read" (click)="svc.markRead(n.id)">
              <div class="notif-icon" [class]="getConf(n.severity).cls">
                <mat-icon>{{ getConf(n.severity).icon }}</mat-icon>
              </div>
              <div class="notif-body">
                <div class="notif-title-row">
                  <strong>{{ n.title }}</strong>
                  @if (!n.read) {
                    <span class="unread-dot"></span>
                  }
                </div>
                <p class="notif-msg">{{ n.message }}</p>
                <span class="notif-date">{{ fmt(n.createdAt) }}</span>
              </div>
              <button mat-icon-button class="dismiss" (click)="dismiss($event, n.id)">
                <mat-icon>close</mat-icon>
              </button>
            </article>
          }
        </div>
      } @else {
        <div class="empty">
          <mat-icon>notifications_none</mat-icon>
          <p>Aucune notification</p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .notif-wrap {
        display: grid;
        gap: 14px;
      }
      .notif-header {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 16px 22px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .notif-header h2 {
        font-size: 1.1rem;
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .btn-all {
        border-radius: 9px !important;
        font-size: 0.78rem !important;
        height: 32px !important;
      }
      .btn-all mat-icon {
        font-size: 15px !important;
        width: 15px !important;
        height: 15px !important;
      }
      .badge-pill {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 999px;
        background: var(--surface-highlight);
        color: var(--brand-700);
      }
      .notif-list {
        display: grid;
        gap: 6px;
      }
      .notif-card {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 13px 16px;
        border-radius: 13px;
        border: 1px solid var(--border-subtle);
        background: var(--surface-raised);
        cursor: pointer;
        transition: background 120ms;
      }
      .notif-card:hover {
        background: var(--surface-highlight);
      }
      .notif-card.unread {
        border-color: rgba(14, 165, 233, 0.22);
      }
      .notif-icon {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }
      .notif-icon mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .sev-info {
        background: rgba(59, 130, 246, 0.12);
        color: #1d4ed8;
      }
      .sev-success {
        background: rgba(34, 197, 94, 0.12);
        color: #15803d;
      }
      .sev-warning {
        background: rgba(245, 158, 11, 0.14);
        color: #b45309;
      }
      .sev-error {
        background: rgba(239, 68, 68, 0.12);
        color: #b91c1c;
      }
      .notif-body {
        flex: 1;
        min-width: 0;
      }
      .notif-title-row {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 3px;
      }
      .notif-title-row strong {
        font-size: 0.87rem;
      }
      .unread-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--brand-500);
        flex-shrink: 0;
      }
      .notif-msg {
        font-size: 0.8rem;
        color: var(--text-muted);
        line-height: 1.5;
        margin-bottom: 5px;
      }
      .notif-date {
        font-size: 0.7rem;
        color: var(--text-soft);
      }
      .dismiss {
        color: var(--text-soft) !important;
        width: 28px !important;
        height: 28px !important;
        flex-shrink: 0;
      }
      .dismiss mat-icon {
        font-size: 15px !important;
        width: 15px !important;
        height: 15px !important;
      }
      .empty {
        text-align: center;
        padding: 40px;
        background: var(--surface-raised);
        border: 1px dashed var(--border-base);
        border-radius: var(--radius-xl);
      }
      .empty mat-icon {
        font-size: 40px;
        width: 40px;
        height: 40px;
        opacity: 0.25;
        display: block;
        margin: 0 auto 8px;
      }
      .empty p {
        font-size: 0.85rem;
        color: var(--text-muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeNotificationsPageComponent {
  protected readonly svc = inject(AlertsService);
  protected getConf(s: AlertSeverity) {
    return SEV[s];
  }
  protected fmt(iso: string): string {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)} h`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
  protected dismiss(e: Event, id: string): void {
    e.stopPropagation();
    this.svc.dismiss(id);
  }
}
