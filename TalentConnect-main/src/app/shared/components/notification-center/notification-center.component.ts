import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { NotificationsAdapter } from '../../../data-access/api/adapters/notifications.adapter';
import { NotificationItem } from '../../../data-access/models/portal.models';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatListModule,
    MatChipsModule,
  ],
  template: `
    <!-- Backdrop -->
    @if (isOpen()) {
      <div class="notif-backdrop" (click)="close()"></div>
    }

    <div class="notif-panel" [class.open]="isOpen()">
      <header class="notif-header">
        <h3>Notification</h3>
        <button mat-icon-button type="button" (click)="close()" aria-label="Fermer">
          <mat-icon>close</mat-icon>
        </button>
      </header>

      <div class="notif-list">
        @for (notif of recentNotifications(); track notif.id) {
          <div class="notif-item" [class.unread]="!notif.read" (click)="markAsRead(notif)">
            <div class="notif-avatar">
              <mat-icon [class]="'notif-icon-color notif-' + notif.type">
                {{ iconFor(notif.type) }}
              </mat-icon>
              <span class="notif-dot" [class]="'dot-' + notif.type"></span>
            </div>
            <div class="notif-body">
              <p class="notif-text">
                <strong>{{ notif.title }}</strong> {{ notif.message }}
              </p>
              <span class="notif-time">{{ formatDate(notif.createdAt) }}</span>
            </div>
          </div>
        } @empty {
          <p class="notif-empty">Aucune notification.</p>
        }
      </div>

      <footer class="notif-footer">
        <button mat-button type="button" class="view-all-btn" (click)="viewAll()">
          Voir toutes les notifications
        </button>
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .notif-backdrop {
        position: fixed;
        inset: 0;
        z-index: 99;
        background: transparent;
      }
      .notif-panel {
        position: fixed;
        top: 60px;
        right: 16px;
        width: min(380px, calc(100vw - 32px));
        max-height: 520px;
        background: var(--surface-raised, #fff);
        border: 1px solid var(--border-subtle, #e2e8f0);
        border-radius: 16px;
        box-shadow:
          0 20px 60px rgba(0, 0, 0, 0.12),
          0 4px 16px rgba(0, 0, 0, 0.06);
        z-index: 100;
        display: flex;
        flex-direction: column;
        transform: translateY(-8px) scale(0.97);
        opacity: 0;
        pointer-events: none;
        transition:
          transform 200ms ease,
          opacity 200ms ease;
      }
      .notif-panel.open {
        transform: translateY(0) scale(1);
        opacity: 1;
        pointer-events: auto;
      }
      .notif-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px 12px;
        border-bottom: 1px solid var(--border-subtle, #f1f5f9);
      }
      .notif-header h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 700;
      }
      .notif-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
      }
      .notif-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 20px;
        cursor: pointer;
        transition: background 120ms;
      }
      .notif-item:hover {
        background: var(--surface-highlight, #f8fafc);
      }
      .notif-item.unread {
        background: var(--surface-highlight, #f8fafc);
      }
      .notif-avatar {
        position: relative;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--surface-muted, #f1f5f9);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .notif-icon-color {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .notif-success {
        color: #22c55e;
      }
      .notif-info {
        color: #3b82f6;
      }
      .notif-warning {
        color: #f59e0b;
      }
      .notif-error {
        color: #ef4444;
      }
      .notif-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid var(--surface-raised, #fff);
      }
      .dot-success {
        background: #22c55e;
      }
      .dot-info {
        background: #3b82f6;
      }
      .dot-warning {
        background: #f59e0b;
      }
      .dot-error {
        background: #ef4444;
      }
      .notif-body {
        flex: 1;
        min-width: 0;
      }
      .notif-text {
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.4;
        color: var(--text-primary, #1e293b);
      }
      .notif-text strong {
        font-weight: 600;
      }
      .notif-time {
        font-size: 0.72rem;
        color: var(--text-muted, #94a3b8);
        margin-top: 4px;
        display: block;
      }
      .notif-empty {
        text-align: center;
        padding: 32px;
        color: var(--text-soft);
      }
      .notif-footer {
        padding: 12px 20px;
        border-top: 1px solid var(--border-subtle, #f1f5f9);
        text-align: center;
      }
      .view-all-btn {
        width: 100%;
        border-radius: 10px !important;
        font-weight: 600 !important;
        font-size: 0.85rem !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationCenterComponent implements OnInit {
  private readonly adapter = inject(NotificationsAdapter);
  private readonly router = inject(Router);

  protected readonly isOpen = signal(false);
  protected readonly notifications = signal<NotificationItem[]>([]);

  protected readonly unreadCount = () => this.notifications().filter((n) => !n.read).length;

  protected readonly recentNotifications = () => this.notifications().slice(0, 5);

  ngOnInit(): void {
    this.adapter.getNotifications().subscribe((items) => this.notifications.set(items));
  }

  open(): void {
    this.isOpen.set(true);
  }
  close(): void {
    this.isOpen.set(false);
  }
  toggle(): void {
    this.isOpen.update((v) => !v);
  }

  protected viewAll(): void {
    this.close();
    this.router.navigate(['/app/employee/saved-searches']);
  }

  protected markAsRead(notif: NotificationItem): void {
    this.adapter.markRead(notif.id).subscribe();
    this.notifications.update((list) =>
      list.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
    );
  }

  protected iconFor(type: string): string {
    switch (type) {
      case 'success':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  }

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return "À l'instant";
    if (diff < 60) return `${diff} min`;
    if (diff < 1440) return `${Math.floor(diff / 60)} h`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }
}
