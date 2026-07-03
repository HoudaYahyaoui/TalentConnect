import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast-notification',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="toast-container" aria-live="assertive" aria-atomic="true">
      <div
        *ngFor="let toast of notifications(); trackBy: trackById"
        class="toast"
        [class]="'toast toast-' + toast.type"
        role="alert"
      >
        <mat-icon class="toast-icon">{{ getIcon(toast.type) }}</mat-icon>
        <span class="toast-message">{{ toast.message }}</span>
        <button
          mat-icon-button
          (click)="dismiss(toast.id)"
          aria-label="Fermer la notification"
          class="toast-close"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 400px;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        background: white;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        animation: slideIn 0.3s ease-out;
        border-left: 4px solid;
      }

      .toast-success {
        border-color: #10b981;
      }
      .toast-error {
        border-color: #ef4444;
      }
      .toast-warning {
        border-color: #f59e0b;
      }
      .toast-info {
        border-color: #3b82f6;
      }

      .toast-icon {
        font-size: 1.25rem;
        width: 24px;
        height: 24px;
      }
      .toast-success .toast-icon {
        color: #10b981;
      }
      .toast-error .toast-icon {
        color: #ef4444;
      }
      .toast-warning .toast-icon {
        color: #f59e0b;
      }
      .toast-info .toast-icon {
        color: #3b82f6;
      }

      .toast-message {
        flex: 1;
        font-size: 0.9rem;
        color: #334155;
      }

      .toast-close {
        opacity: 0.5;
        transition: opacity 0.2s;
      }
      .toast-close:hover {
        opacity: 1;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(16px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastNotificationComponent {
  private readonly notificationService = inject(NotificationService);

  protected readonly notifications = this.notificationService.getNotifications();

  protected getIcon(type: Notification['type']): string {
    const icons: Record<Notification['type'], string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return icons[type];
  }

  protected dismiss(id: string): void {
    this.notificationService.remove(id);
  }

  protected trackById(_index: number, item: Notification): string {
    return item.id;
  }
}
