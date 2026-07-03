import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const STATUS_MAP: Record<string, BadgeVariant> = {
  // Applications
  'En attente': 'warning',
  Entretien: 'info',
  Offre: 'success',
  Embauché: 'success',
  Rejeté: 'error',
  // Offers
  Ouverte: 'success',
  Fermée: 'error',
  'En cours': 'warning',
  // Generic
  PENDING: 'warning',
  OPEN: 'success',
  CLOSED: 'error',
  ACTIVE: 'success',
  INACTIVE: 'neutral',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-badge" [class]="'status-badge badge-' + variant()">
      <span class="badge-dot"></span>
      {{ label() }}
    </span>
  `,
  styles: [
    `
      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem;
        padding: 0.25rem 0.625rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0.01em;
        white-space: nowrap;
      }

      .badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      .badge-success {
        background: #ecfdf5;
        color: #065f46;
      }
      .badge-success .badge-dot {
        background: #10b981;
      }

      .badge-warning {
        background: #fffbeb;
        color: #92400e;
      }
      .badge-warning .badge-dot {
        background: #f59e0b;
      }

      .badge-error {
        background: #fef2f2;
        color: #991b1b;
      }
      .badge-error .badge-dot {
        background: #ef4444;
      }

      .badge-info {
        background: #eff6ff;
        color: #1e40af;
      }
      .badge-info .badge-dot {
        background: #3b82f6;
      }

      .badge-neutral {
        background: #f8fafc;
        color: #475569;
      }
      .badge-neutral .badge-dot {
        background: #94a3b8;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  @Input() set status(value: string) {
    this._status.set(value);
  }

  private readonly _status = signal('');

  protected readonly label = computed(() => this._status());
  protected readonly variant = computed<BadgeVariant>(
    () => STATUS_MAP[this._status()] ?? 'neutral',
  );
}
