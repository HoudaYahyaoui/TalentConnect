import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

const FR_LABELS: Record<string, string> = {
  OPEN: 'Ouvert',
  CLOSED: 'Fermé',
  DRAFT: 'Brouillon',
  ARCHIVED: 'Archivé',
  SUBMITTED: 'Soumis',
  REVIEW: 'En étude',
  INTERVIEW: 'Entretien',
  OFFER: 'Offre',
  HIRED: 'Recruté',
  REJECTED: 'Refusé',
  INTERNAL: 'Interne',
  REFERRAL: 'Cooptation',
  EMPLOYEE: 'Collaborateur',
  HR: 'RH',
  ADMIN: 'Admin',
  INFO: 'Info',
  SUCCESS: 'Succès',
  WARNING: 'Attention',
  ERROR: 'Erreur',
};

@Component({
  selector: 'app-status-chip',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="status-chip" [class]="'status-chip tone-' + tone()">{{ label() }}</span>`,
  styles: [
    `
      .status-chip {
        display: inline-flex;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .tone-success {
        background: rgba(34, 197, 94, 0.13);
        color: #15803d;
      }
      .tone-info {
        background: rgba(59, 130, 246, 0.13);
        color: #1d4ed8;
      }
      .tone-warning {
        background: rgba(245, 158, 11, 0.14);
        color: #b45309;
      }
      .tone-danger {
        background: rgba(239, 68, 68, 0.13);
        color: #b91c1c;
      }
      .tone-neutral {
        background: rgba(148, 163, 184, 0.14);
        color: #475569;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChipComponent {
  private readonly _value = signal('');
  @Input({ required: true }) set status(s: string) {
    this._value.set(s);
  }
  readonly label = computed(() => FR_LABELS[this._value()] ?? this._value().replaceAll('_', ' '));
  readonly tone = computed(() => {
    const s = this._value();
    if (['HIRED', 'OPEN', 'OFFER', 'SUCCESS'].includes(s)) return 'success';
    if (['INTERVIEW', 'REVIEW', 'INFO'].includes(s)) return 'info';
    if (['SUBMITTED', 'DRAFT', 'WARNING', 'INTERNAL'].includes(s)) return 'warning';
    if (['REJECTED', 'CLOSED', 'ERROR'].includes(s)) return 'danger';
    if (['ARCHIVED'].includes(s)) return 'neutral';
    return 'neutral';
  });
}
