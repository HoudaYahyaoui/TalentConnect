import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { StatusChipComponent } from '../../../shared/ui/status-chip.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { MyApplicationsStore, MyApplication } from '../../../core/state/my-applications.store';

type AppStatus = 'SUBMITTED' | 'REVIEW' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';

const PIPELINE: { status: AppStatus; label: string; icon: string }[] = [
  { status: 'SUBMITTED', label: 'Soumis', icon: 'send' },
  { status: 'REVIEW', label: 'En étude', icon: 'pageview' },
  { status: 'INTERVIEW', label: 'Entretien', icon: 'record_voice_over' },
  { status: 'OFFER', label: 'Offre', icon: 'volunteer_activism' },
  { status: 'HIRED', label: 'Recruté', icon: 'emoji_events' },
];

@Component({
  selector: 'app-employee-applications-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    StatusChipComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-wrap">
      <header class="page-header">
        <div>
          <p class="eyebrow">Suivi de dossiers</p>
          <h2>Mes candidatures</h2>
        </div>
        <div class="header-stats">
          <div class="stat-pill stat-active">
            <span class="stat-num">{{ activeCount() }}</span>
            <span>en cours</span>
          </div>
          <div class="stat-pill stat-done">
            <span class="stat-num">{{ total() }}</span>
            <span>total</span>
          </div>
        </div>
      </header>

      @if (applications().length) {
        <div class="app-list">
          @for (app of applications(); track app.id) {
            <article class="app-card" [class]="'status-' + app.status.toLowerCase()">
              <div class="app-top">
                <div class="app-info">
                  <h3>{{ app.jobTitle }}</h3>
                </div>
                <div class="app-badge-area">
                  <app-status-chip [status]="app.status"></app-status-chip>
                  @if (!isDone(app.status)) {
                    <button
                      mat-icon-button
                      class="withdraw-btn"
                      (click)="withdraw(app)"
                      matTooltip="Retirer la candidature"
                      aria-label="Retirer"
                    >
                      <mat-icon>close</mat-icon>
                    </button>
                  }
                </div>
              </div>

              <!-- Pipeline steps -->
              @if (app.status !== 'REJECTED') {
                <div class="pipeline">
                  @for (step of pipeline; track step.status) {
                    <div
                      class="pipeline-step"
                      [class.done]="isStepDone(app.status, step.status)"
                      [class.current]="app.status === step.status"
                    >
                      <div class="step-dot">
                        <mat-icon class="step-icon">{{ step.icon }}</mat-icon>
                      </div>
                      <span class="step-label">{{ step.label }}</span>
                    </div>
                    @if (!$last) {
                      <div
                        class="pipeline-line"
                        [class.done]="isStepDone(app.status, step.status)"
                      ></div>
                    }
                  }
                </div>
              }

              <div class="app-footer">
                <span class="date-info">
                  Postulé le {{ app.appliedAt | date: 'dd MMM yyyy' }} · Mis à jour
                  {{ app.updatedAt | date: 'dd MMM' }}
                </span>
                @if (app.notes) {
                  <span class="app-note">{{ app.notes }}</span>
                }
              </div>
            </article>
          }
        </div>
      } @else {
        <app-empty-state
          title="Aucune candidature"
          description="Explorez les offres internes et postulez en un clic depuis la page Offres."
          icon="list_alt"
        ></app-empty-state>
      }
    </div>
  `,
  styles: [
    `
      .page-wrap {
        display: grid;
        gap: 16px;
      }

      .page-header {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 18px 22px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }
      .page-header h2 {
        font-size: 1.15rem;
      }

      .header-stats {
        display: flex;
        gap: 10px;
      }
      .stat-pill {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 500;
      }
      .stat-num {
        font-size: 1.1rem;
        font-weight: 800;
      }
      .stat-active {
        background: rgba(14, 165, 233, 0.1);
        color: var(--brand-700);
      }
      .stat-done {
        background: var(--surface-highlight);
        color: var(--text-soft);
      }

      /* App cards */
      .app-list {
        display: grid;
        gap: 12px;
      }
      .app-card {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 18px 20px;
        display: grid;
        gap: 14px;
        transition: border-color 150ms;
      }
      .app-card.status-hired {
        border-left: 3px solid var(--success-500);
      }
      .app-card.status-rejected {
        border-left: 3px solid var(--danger-500);
        opacity: 0.7;
      }
      .app-card.status-interview {
        border-left: 3px solid var(--accent-500);
      }
      .app-card.status-offer {
        border-left: 3px solid var(--warning-500);
      }

      .app-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }
      .app-info h3 {
        font-size: 0.95rem;
        font-weight: 700;
      }
      .app-info p {
        font-size: 0.78rem;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .app-badge-area {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .withdraw-btn {
        color: var(--text-soft) !important;
        width: 28px !important;
        height: 28px !important;
      }
      .withdraw-btn mat-icon {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
      }

      /* Pipeline */
      .pipeline {
        display: flex;
        align-items: center;
        gap: 0;
        padding: 6px 0;
      }
      .pipeline-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }
      .step-dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid var(--border-base);
        background: var(--surface-muted);
        display: grid;
        place-items: center;
        transition: all 150ms;
      }
      .pipeline-step.done .step-dot {
        border-color: var(--success-500);
        background: rgba(34, 197, 94, 0.12);
        color: #15803d;
      }
      .pipeline-step.current .step-dot {
        border-color: var(--brand-500);
        background: rgba(14, 165, 233, 0.14);
        color: var(--brand-700);
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
      }
      .step-icon {
        font-size: 14px !important;
        width: 14px !important;
        height: 14px !important;
      }
      .step-label {
        font-size: 0.62rem;
        color: var(--text-soft);
        white-space: nowrap;
      }
      .pipeline-step.done .step-label,
      .pipeline-step.current .step-label {
        color: var(--text-secondary);
        font-weight: 600;
      }

      .pipeline-line {
        flex: 1;
        height: 2px;
        background: var(--border-base);
        margin-bottom: 18px;
        transition: background 150ms;
      }
      .pipeline-line.done {
        background: var(--success-500);
      }

      .app-footer {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: space-between;
        align-items: center;
      }
      .date-info {
        font-size: 0.72rem;
        color: var(--text-soft);
      }
      .app-note {
        font-size: 0.78rem;
        color: var(--text-muted);
        font-style: italic;
      }

      @media (max-width: 600px) {
        .pipeline {
          overflow-x: auto;
        }
        .page-header {
          flex-direction: column;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeApplicationsPageComponent implements OnInit {
  private readonly toast = inject(ToastService);
  protected readonly store = inject(MyApplicationsStore);

  protected readonly pipeline = PIPELINE;
  protected readonly applications = this.store.applications;
  protected readonly isLoading = this.store.isLoading;
  protected readonly error = this.store.error;
  protected readonly total = computed(() => this.applications().length);
  protected readonly activeCount = computed(() => this.store.active().length);

  ngOnInit(): void {
    // Charger les candidatures de l'utilisateur connecté
    this.store.loadMine(0, 20);
  }

  protected isDone(status: AppStatus): boolean {
    return ['HIRED', 'REJECTED'].includes(status);
  }

  protected isStepDone(currentStatus: AppStatus, stepStatus: AppStatus): boolean {
    const order: AppStatus[] = ['SUBMITTED', 'REVIEW', 'INTERVIEW', 'OFFER', 'HIRED'];
    const ci = order.indexOf(currentStatus);
    const si = order.indexOf(stepStatus);
    return si <= ci;
  }

  protected withdraw(app: MyApplication): void {
    this.store.withdraw(app.id);
    this.toast.open(`Candidature « ${app.jobTitle} » retirée.`, 'OK', { duration: 3000 });
  }
}
