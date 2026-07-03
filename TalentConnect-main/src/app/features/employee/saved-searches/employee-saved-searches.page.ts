import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsAdapter } from '../../../data-access/api/adapters/notifications.adapter';
import { NotificationItem, NotificationType } from '../../../data-access/models/portal.models';

type AlertSeverity = NotificationType;

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: string; cls: string }> = {
  info: { icon: 'info', cls: 'sev-info' },
  success: { icon: 'check_circle', cls: 'sev-success' },
  warning: { icon: 'warning_amber', cls: 'sev-warning' },
  error: { icon: 'error_outline', cls: 'sev-error' },
};

@Component({
  selector: 'app-employee-saved-searches-page',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="page-wrap">
      @if (loading()) {
        <div class="loading-state">
          <mat-icon>sync</mat-icon>
          <p>Chargement des notifications...</p>
        </div>
      } @else {
        <!-- Header -->
        <header class="page-header">
          <div>
            <p class="eyebrow">Notifications</p>
            <h2>Alertes &amp; activités</h2>
          </div>
          <div class="header-actions">
            @if (unread() > 0) {
              <button mat-stroked-button class="btn-read-all" (click)="markAllRead()">
                <mat-icon>done_all</mat-icon>
                Tout marquer comme lu
              </button>
            }
            <div class="badge-stat">
              <span class="badge-num unread">{{ unread() }}</span>
              <span>non lue{{ unread() > 1 ? 's' : '' }}</span>
            </div>
          </div>
        </header>

        <!-- Alertes -->
        @if (alerts().length) {
          <div class="alerts-list">
            @for (alert of alerts(); track alert.id) {
              <article class="alert-card" [class.unread]="!alert.read">
                <!-- Icône sévérité -->
                <div class="alert-icon-wrap" [class]="getConfig(alert.type).cls">
                  <mat-icon>{{ getConfig(alert.type).icon }}</mat-icon>
                </div>

                <!-- Contenu -->
                <div class="alert-body">
                  <div class="alert-top">
                    <strong class="alert-title">{{ alert.title }}</strong>
                    @if (!alert.read) {
                      <span class="unread-dot" aria-label="Non lue"></span>
                    }
                  </div>
                  <p class="alert-msg">{{ alert.message }}</p>
                  <div class="alert-meta">
                    <span class="alert-date">{{ formatDate(alert.createdAt) }}</span>
                    @if (alert.deepLink) {
                      <a [routerLink]="alert.deepLink" class="alert-link">Voir le détail →</a>
                    }
                  </div>
                </div>

                <!-- Actions -->
                <div class="alert-actions">
                  @if (!alert.read) {
                    <button
                      mat-icon-button
                      class="action-btn"
                      (click)="markRead(alert.id)"
                      matTooltip="Marquer comme lue"
                    >
                      <mat-icon>mark_email_read</mat-icon>
                    </button>
                  }
                  <button
                    mat-icon-button
                    class="action-btn dismiss-btn"
                    (click)="dismiss(alert.id)"
                    matTooltip="Supprimer"
                  >
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              </article>
            }
          </div>
        } @else {
          <div class="empty-state">
            <mat-icon>notifications_none</mat-icon>
            <h3>Tout est à jour</h3>
            <p>
              Aucune alerte active. Vous recevrez ici les mises à jour de vos candidatures et
              offres.
            </p>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .page-wrap {
        display: grid;
        gap: 14px;
      }

      /* Header */
      .page-header {
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
      .page-header h2 {
        font-size: 1.1rem;
      }
      .header-actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .btn-read-all {
        border-radius: 9px !important;
        font-size: 0.78rem !important;
        height: 32px !important;
        gap: 4px !important;
      }
      .btn-read-all mat-icon {
        font-size: 15px !important;
        width: 15px !important;
        height: 15px !important;
      }
      .badge-stat {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.78rem;
        color: var(--text-muted);
      }
      .badge-num {
        font-size: 1.1rem;
        font-weight: 800;
      }
      .badge-num.unread {
        color: var(--brand-500);
      }

      /* Alerts list */
      .alerts-list {
        display: grid;
        gap: 8px;
      }
      .alert-card {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid var(--border-subtle);
        background: var(--surface-raised);
        transition: border-color 150ms;
      }
      .alert-card.unread {
        background: color-mix(in srgb, var(--surface-raised) 97%, var(--brand-500));
        border-color: rgba(14, 165, 233, 0.2);
      }

      /* Icon */
      .alert-icon-wrap {
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: grid;
        place-items: center;
      }
      .alert-icon-wrap mat-icon {
        font-size: 19px;
        width: 19px;
        height: 19px;
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

      /* Body */
      .alert-body {
        flex: 1;
        min-width: 0;
      }
      .alert-top {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 3px;
      }
      .alert-title {
        font-size: 0.88rem;
        font-weight: 600;
      }
      .unread-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--brand-500);
        flex-shrink: 0;
      }
      .alert-msg {
        font-size: 0.8rem;
        color: var(--text-muted);
        line-height: 1.5;
        margin-bottom: 6px;
      }
      .alert-meta {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .alert-date {
        font-size: 0.7rem;
        color: var(--text-soft);
      }
      .alert-link {
        font-size: 0.75rem;
        color: var(--brand-600);
        font-weight: 500;
      }
      .alert-link:hover {
        text-decoration: underline;
      }

      /* Actions */
      .alert-actions {
        display: flex;
        gap: 2px;
        flex-shrink: 0;
      }
      .action-btn {
        color: var(--text-soft) !important;
        width: 30px !important;
        height: 30px !important;
      }
      .action-btn mat-icon {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
      }
      .dismiss-btn:hover {
        color: var(--danger-500) !important;
      }

      /* Empty */
      .empty-state {
        text-align: center;
        padding: 48px 24px;
        background: var(--surface-raised);
        border: 1px dashed var(--border-base);
        border-radius: var(--radius-xl);
      }
      .empty-state mat-icon {
        font-size: 44px;
        width: 44px;
        height: 44px;
        color: var(--text-soft);
        opacity: 0.3;
        margin-bottom: 12px;
      }
      .empty-state h3 {
        font-size: 1rem;
        margin-bottom: 6px;
      }
      .empty-state p {
        font-size: 0.82rem;
        color: var(--text-muted);
        max-width: 340px;
        margin: 0 auto;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeSavedSearchesPageComponent implements OnInit {
  private readonly adapter = inject(NotificationsAdapter);

  protected readonly alerts = signal<NotificationItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly unread = computed(() => this.alerts().filter((a) => !a.read).length);

  protected getConfig(sev: AlertSeverity) {
    return SEVERITY_CONFIG[sev ?? 'info'];
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.loading.set(true);
    this.adapter.getNotifications().subscribe({
      next: (items) => {
        this.alerts.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.alerts.set([]);
        this.loading.set(false);
      },
    });
  }

  protected markRead(id: string): void {
    this.adapter.markRead(id).subscribe(() => {
      this.alerts.update((list) => list.map((a) => (a.id === id ? { ...a, read: true } : a)));
    });
  }

  protected markAllRead(): void {
    this.adapter.markAllRead().subscribe(() => {
      this.alerts.update((list) => list.map((a) => ({ ...a, read: true })));
    });
  }

  protected dismiss(id: string): void {
    this.adapter.dismiss(id).subscribe(() => {
      this.alerts.update((list) => list.filter((a) => a.id !== id));
    });
  }

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `Il y a ${diff} min`;
    if (diff < 1440) return `Il y a ${Math.floor(diff / 60)} h`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
}
