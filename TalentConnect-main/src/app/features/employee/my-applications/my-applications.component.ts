import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StatusChipComponent } from '../../../shared/ui/status-chip.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { MyApplicationsStore, MyApplication } from '../../../core/state/my-applications.store';

type AppStatus = 'SUBMITTED' | 'REVIEW' | 'INTERVIEW' | 'OFFER' | 'HIRED' | 'REJECTED';

const PIPELINE: { status: AppStatus; label: string; icon: string; pct: number }[] = [
  { status: 'SUBMITTED', label: 'Soumis', icon: 'send', pct: 20 },
  { status: 'REVIEW', label: 'En étude', icon: 'pageview', pct: 40 },
  { status: 'INTERVIEW', label: 'Entretien', icon: 'record_voice_over', pct: 60 },
  { status: 'OFFER', label: 'Offre', icon: 'volunteer_activism', pct: 80 },
  { status: 'HIRED', label: 'Recruté', icon: 'emoji_events', pct: 100 },
];

const STATUS_ORDER: Record<AppStatus, number> = {
  SUBMITTED: 0,
  REVIEW: 1,
  INTERVIEW: 2,
  OFFER: 3,
  HIRED: 4,
  REJECTED: -1,
};

@Component({
  selector: 'app-my-applications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule,
    StatusChipComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="app-wrap">
      <header class="page-header">
        <div>
          <p class="eyebrow">Suivi de dossiers</p>
          <h2>Mes candidatures</h2>
        </div>
        <div class="header-pills">
          <div class="pill pill-active">
            <mat-icon>hourglass_top</mat-icon>
            <span>{{ activeCount() }} en cours</span>
          </div>
          <div class="pill pill-done">
            <mat-icon>check_circle</mat-icon>
            <span>{{ hiredCount() }} recrutés</span>
          </div>
          <div class="pill pill-total">
            <mat-icon>list_alt</mat-icon>
            <span>{{ total() }} total</span>
          </div>
        </div>
      </header>

      <mat-tab-group animationDuration="200ms" class="app-tabs">
        <!-- Active tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">hourglass_top</mat-icon>
            En cours ({{ activeCount() }})
          </ng-template>
          <div class="tab-content">
            @if (active().length === 0) {
              <app-empty-state
                icon="list_alt"
                title="Aucune candidature en cours"
                description="Explorez les offres et postulez pour démarrer votre mobilité."
                actionLabel="Voir les offres"
              ></app-empty-state>
            }
            @for (app of active(); track app.id) {
              <ng-container *ngTemplateOutlet="appCard; context: { $implicit: app }"></ng-container>
            }
          </div>
        </mat-tab>

        <!-- Hired tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">emoji_events</mat-icon>
            Recrutés ({{ hiredCount() }})
          </ng-template>
          <div class="tab-content">
            @if (hired().length === 0) {
              <app-empty-state
                icon="emoji_events"
                title="Aucun recrutement finalisé"
                description="Vos candidatures abouties apparaîtront ici."
              >
              </app-empty-state>
            }
            @for (app of hired(); track app.id) {
              <ng-container *ngTemplateOutlet="appCard; context: { $implicit: app }"></ng-container>
            }
          </div>
        </mat-tab>

        <!-- Rejected tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">cancel</mat-icon>
            Refusés ({{ rejectedCount() }})
          </ng-template>
          <div class="tab-content">
            @if (rejected().length === 0) {
              <app-empty-state
                icon="thumb_up"
                title="Aucun refus !"
                description="C'est une bonne nouvelle."
              >
              </app-empty-state>
            }
            @for (app of rejected(); track app.id) {
              <ng-container *ngTemplateOutlet="appCard; context: { $implicit: app }"></ng-container>
            }
          </div>
        </mat-tab>

        <!-- All tab -->
        <mat-tab label="Toutes ({{ total() }})">
          <div class="tab-content">
            @for (app of applications(); track app.id) {
              <ng-container *ngTemplateOutlet="appCard; context: { $implicit: app }"></ng-container>
            }
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Apply CTA -->
      <div class="cta-row">
        <a mat-flat-button class="btn-primary" routerLink="/app/employee/jobs">
          <mat-icon>travel_explore</mat-icon> Explorer de nouvelles offres
        </a>
      </div>
    </div>

    <!-- Application card template -->
    <ng-template #appCard let-app>
      <article class="app-card" [class]="'status-' + app.status.toLowerCase()">
        <div class="app-top">
          <div class="app-meta">
            <div class="job-icon">
              <mat-icon>{{ statusIcon(app.status) }}</mat-icon>
            </div>
            <div class="app-info">
              <h3>{{ app.jobTitle }}</h3>
              <p class="app-sub">{{ app.department }} · {{ app.location }}</p>
            </div>
          </div>
          <div class="app-actions">
            <app-status-chip [status]="app.status"></app-status-chip>
            @if (!isDone(app.status)) {
              <button
                mat-icon-button
                class="withdraw-btn"
                type="button"
                (click)="withdraw(app)"
                matTooltip="Retirer la candidature"
              >
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>
        </div>

        <!-- Progress bar for active apps -->
        @if (!isDone(app.status)) {
          <div class="progress-wrap">
            <mat-progress-bar
              mode="determinate"
              [value]="progressPct(app.status)"
              class="app-progress"
            >
            </mat-progress-bar>
            <span class="progress-label">{{ progressPct(app.status) }}% avancement</span>
          </div>
        }

        <!-- Pipeline steps -->
        @if (app.status !== 'REJECTED') {
          <div class="pipeline">
            @for (step of pipeline; track step.status) {
              <div
                class="step"
                [class.done]="isStepDone(app.status, step.status)"
                [class.current]="app.status === step.status"
              >
                <div class="step-dot">
                  <mat-icon class="step-icon">{{ step.icon }}</mat-icon>
                </div>
                <span class="step-label">{{ step.label }}</span>
              </div>
              @if (!$last) {
                <div class="step-line" [class.done]="isStepDone(app.status, step.status)"></div>
              }
            }
          </div>
        }

        <div class="app-footer">
          <span class="date-info">
            <mat-icon style="font-size:14px;width:14px;height:14px;vertical-align:middle"
              >schedule</mat-icon
            >
            Postulé le {{ app.appliedAt | date: 'dd MMM yyyy' }} · Mis à jour
            {{ app.updatedAt | date: 'dd MMM' }}
          </span>
          @if (app.notes) {
            <span class="app-note">
              <mat-icon style="font-size:14px;width:14px;height:14px;vertical-align:middle"
                >info</mat-icon
              >
              {{ app.notes }}
            </span>
          }
        </div>
      </article>
    </ng-template>
  `,
  styles: [
    `
      .app-wrap {
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
        margin: 4px 0 0;
      }
      .header-pills {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .pill {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 5px 12px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 500;
      }
      .pill mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }
      .pill-active {
        background: rgba(14, 165, 233, 0.1);
        color: var(--brand-700);
      }
      .pill-done {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
      }
      .pill-total {
        background: var(--surface-highlight);
        color: var(--text-soft);
      }

      .app-tabs {
        background: transparent;
      }
      ::ng-deep .app-tabs .mat-mdc-tab-body-wrapper {
        padding-top: 12px;
      }
      .tab-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-right: 4px;
        vertical-align: middle;
      }

      .tab-content {
        display: grid;
        gap: 10px;
        padding: 4px 0;
      }

      /* App cards */
      .app-card {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 16px 18px;
        display: grid;
        gap: 12px;
        transition: box-shadow 150ms;
      }
      .app-card:hover {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
      }
      .app-card.status-hired {
        border-left: 3px solid #22c55e;
      }
      .app-card.status-rejected {
        border-left: 3px solid #ef4444;
        opacity: 0.75;
      }
      .app-card.status-interview {
        border-left: 3px solid #8b5cf6;
      }
      .app-card.status-offer {
        border-left: 3px solid #f59e0b;
      }

      .app-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
      .app-meta {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .job-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-lg);
        background: var(--brand-100);
        color: var(--brand-600);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .app-info h3 {
        font-size: 0.95rem;
        font-weight: 600;
        margin: 0 0 2px;
      }
      .app-sub {
        font-size: 0.78rem;
        color: var(--text-soft);
        margin: 0;
      }
      .app-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .withdraw-btn mat-icon {
        font-size: 18px;
      }

      /* Progress */
      .progress-wrap {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .app-progress {
        flex: 1;
        height: 6px;
        border-radius: 3px;
      }
      ::ng-deep .app-progress .mdc-linear-progress__bar-inner {
        border-color: var(--brand-500) !important;
      }
      .progress-label {
        font-size: 0.72rem;
        color: var(--text-soft);
        white-space: nowrap;
      }

      /* Pipeline */
      .pipeline {
        display: flex;
        align-items: center;
        gap: 0;
        overflow-x: auto;
        padding: 4px 0;
      }
      .step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
        min-width: 64px;
      }
      .step-dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--surface-highlight);
        border: 2px solid var(--border-subtle);
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          background 200ms,
          border-color 200ms;
      }
      .step.done .step-dot {
        background: var(--brand-100);
        border-color: var(--brand-400);
      }
      .step.current .step-dot {
        background: var(--brand-600);
        border-color: var(--brand-600);
      }
      .step.current .step-dot mat-icon {
        color: #fff;
      }
      .step-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: var(--text-soft);
      }
      .step.done .step-icon {
        color: var(--brand-600);
      }
      .step-label {
        font-size: 0.68rem;
        color: var(--text-soft);
        text-align: center;
        white-space: nowrap;
      }
      .step.current .step-label {
        color: var(--brand-600);
        font-weight: 600;
      }
      .step-line {
        flex: 1;
        height: 2px;
        background: var(--border-subtle);
        min-width: 12px;
        transition: background 200ms;
      }
      .step-line.done {
        background: var(--brand-400);
      }

      /* Footer */
      .app-footer {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .date-info {
        font-size: 0.75rem;
        color: var(--text-soft);
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .app-note {
        font-size: 0.75rem;
        color: var(--text-soft);
        display: flex;
        align-items: center;
        gap: 4px;
        font-style: italic;
      }

      .cta-row {
        display: flex;
        justify-content: center;
        padding: 4px 0;
      }
      .btn-primary {
        background: var(--brand-600) !important;
        color: #fff !important;
      }
    `,
  ],
})
export class MyApplicationsComponent {
  private readonly toast = inject(ToastService);
  private readonly store = inject(MyApplicationsStore);

  protected readonly applications = this.store.applications;
  protected readonly pipeline = PIPELINE;

  protected readonly active = computed(() =>
    this.applications().filter((a) => !['HIRED', 'REJECTED'].includes(a.status)),
  );
  protected readonly hired = computed(() =>
    this.applications().filter((a) => a.status === 'HIRED'),
  );
  protected readonly rejected = computed(() =>
    this.applications().filter((a) => a.status === 'REJECTED'),
  );
  protected readonly activeCount = computed(() => this.active().length);
  protected readonly hiredCount = computed(() => this.hired().length);
  protected readonly rejectedCount = computed(() => this.rejected().length);
  protected readonly total = computed(() => this.applications().length);

  protected isDone(status: string): boolean {
    return status === 'HIRED' || status === 'REJECTED';
  }

  protected isStepDone(appStatus: AppStatus, stepStatus: AppStatus): boolean {
    return STATUS_ORDER[appStatus] >= STATUS_ORDER[stepStatus];
  }

  protected progressPct(status: AppStatus): number {
    return PIPELINE.find((s) => s.status === status)?.pct ?? 0;
  }

  protected statusIcon(status: string): string {
    const map: Record<string, string> = {
      SUBMITTED: 'send',
      REVIEW: 'pageview',
      INTERVIEW: 'record_voice_over',
      OFFER: 'volunteer_activism',
      HIRED: 'emoji_events',
      REJECTED: 'cancel',
    };
    return map[status] ?? 'work';
  }

  protected withdraw(app: MyApplication): void {
    this.store.withdraw(app.id);
    this.toast.open(`Candidature "${app.jobTitle}" retirée`, 'OK', { duration: 3000 });
  }
}
