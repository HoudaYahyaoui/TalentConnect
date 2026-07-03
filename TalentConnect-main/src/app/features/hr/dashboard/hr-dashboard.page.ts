import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationsAdapter } from '../../../data-access/api/adapters/notifications.adapter';
import { ApplicationsAdapter } from '../../../data-access/api/adapters/applications.adapter';
import { MetricCardComponent } from '../../../shared/ui/metric-card.component';
import { StatusChipComponent } from '../../../shared/ui/status-chip.component';
import {
  SkeletonListComponent,
  EmptyStateComponent,
  ErrorStateComponent,
} from '../../../shared/components/page-states';

const FUNNEL_STEPS = [
  { label: 'Soumises', status: 'SUBMITTED', color: '#3b82f6', icon: 'send' },
  { label: 'En étude', status: 'REVIEW', color: '#8b5cf6', icon: 'pageview' },
  { label: 'Entretien', status: 'INTERVIEW', color: '#f59e0b', icon: 'record_voice_over' },
  { label: 'Offre', status: 'OFFER', color: '#10b981', icon: 'volunteer_activism' },
  { label: 'Recrutés', status: 'HIRED', color: '#22c55e', icon: 'emoji_events' },
];

@Component({
  selector: 'app-hr-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MetricCardComponent,
    StatusChipComponent,
    SkeletonListComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    @if (loading()) {
      <app-skeleton-list [count]="4"></app-skeleton-list>
    } @else if (error()) {
      <app-error-state
        title="Impossible de charger le tableau de bord"
        message="Les données ne sont pas accessibles actuellement."
        (retry)="reload()"
      ></app-error-state>
    } @else {
      <div class="dashboard-wrap">
        <!-- Welcome header -->
        <header class="dash-header">
          <div>
            <p class="eyebrow">Vue d'ensemble RH</p>
            <h2>Tableau de bord recrutement</h2>
          </div>
          <div class="header-actions">
            <a mat-stroked-button routerLink="/app/hr/jobs">
              <mat-icon>work</mat-icon> Gérer les offres
            </a>
            <a mat-flat-button class="btn-primary" routerLink="/app/hr/kanban">
              <mat-icon>view_kanban</mat-icon> Tableau
            </a>
          </div>
        </header>

        <!-- KPI cards -->
        <div class="metrics-grid">
          <app-metric-card
            label="Candidatures reçues"
            [value]="allApplications().length"
            hint="Toutes sources confondues"
            icon="groups"
          ></app-metric-card>
          <app-metric-card
            label="Offres publiées"
            [value]="metrics().publishedJobs"
            hint="Postes actifs visibles"
            icon="work"
          ></app-metric-card>
          <app-metric-card
            label="Cooptations"
            [value]="metrics().totalReferrals"
            hint="Recommandations soumises"
            icon="recommend"
          ></app-metric-card>
          <app-metric-card
            label="Offres totales"
            [value]="metrics().totalJobOffers"
            hint="Publiées + brouillons"
            icon="work_outline"
          ></app-metric-card>
          <app-metric-card
            label="Recrutés via cooptation"
            [value]="metrics().hiredFromReferral"
            hint="Candidats embauchés"
            icon="emoji_events"
          ></app-metric-card>
          <app-metric-card
            label="Audits aujourd'hui"
            [value]="metrics().auditEventsToday"
            hint="Actions tracées"
            icon="fact_check"
          ></app-metric-card>
        </div>

        <!-- Two-column section -->
        <div class="two-col">
          <!-- Funnel -->
          <section class="panel">
            <h3 class="panel-title"><mat-icon>filter_alt</mat-icon> Funnel de recrutement</h3>
            <div class="funnel-list">
              @for (step of funnelData(); track step.status; let i = $index) {
                <div class="funnel-row">
                  <div class="funnel-label">
                    <div class="funnel-dot" [style.background]="step.color"></div>
                    <mat-icon [style.color]="step.color">{{ step.icon }}</mat-icon>
                    <span>{{ step.label }}</span>
                  </div>
                  <div class="funnel-bar-wrap">
                    <div
                      class="funnel-bar"
                      [style.width.%]="step.pct"
                      [style.background]="step.color"
                    ></div>
                  </div>
                  <span class="funnel-count" [style.color]="step.color">{{ step.count }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Recent activity -->
          <section class="panel">
            <h3 class="panel-title"><mat-icon>schedule</mat-icon> Candidatures récentes</h3>
            @if (recentApplications().length === 0) {
              <app-empty-state
                icon="how_to_reg"
                title="Aucune candidature"
                message="Les nouvelles candidatures apparaîtront ici."
              >
              </app-empty-state>
            } @else {
              <div class="recent-list">
                @for (app of recentApplications(); track app.id) {
                  <div class="recent-row">
                    <div class="candidate-avatar">{{ (app.candidateName || '?').charAt(0) }}</div>
                    <div class="candidate-info">
                      <span class="candidate-name">{{ app.candidateName || 'Inconnu' }}</span>
                      <span class="candidate-meta">
                        <span
                          [class]="
                            'source-badge source-' + (app.source || 'internal').toLowerCase()
                          "
                          >{{ app.source }}</span
                        >
                        · {{ app.createdAt | date: 'dd MMM' }}
                      </span>
                    </div>
                    <app-status-chip [status]="app.status" class="status-compact"></app-status-chip>
                  </div>
                }
              </div>
              <a mat-button class="see-all-link" routerLink="/app/hr/candidates">
                Voir tous les candidats <mat-icon>arrow_forward</mat-icon>
              </a>
            }
          </section>
        </div>

        <!-- Quick links -->
        <section class="quick-links">
          <a mat-stroked-button routerLink="/app/hr/reports" class="ql-btn">
            <mat-icon>insights</mat-icon> Rapports & analytics
          </a>
          <a mat-stroked-button routerLink="/app/hr/audit" class="ql-btn">
            <mat-icon>history</mat-icon> Journal d'audit
          </a>
          <a mat-stroked-button routerLink="/app/hr/candidates" class="ql-btn">
            <mat-icon>manage_accounts</mat-icon> Gestion candidats
          </a>
        </section>
      </div>
    }
  `,
  styles: [
    `
      .dashboard-wrap {
        display: grid;
        gap: 16px;
      }

      .dash-header {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .dash-header h2 {
        font-size: 1.2rem;
        margin: 4px 0 0;
      }
      .header-actions {
        display: flex;
        gap: 10px;
      }
      .btn-primary {
        background: var(--brand-600) !important;
        color: #fff !important;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      @media (max-width: 900px) {
        .metrics-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 600px) {
        .metrics-grid {
          grid-template-columns: 1fr;
        }
      }

      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      @media (max-width: 768px) {
        .two-col {
          grid-template-columns: 1fr;
        }
      }

      .panel {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .panel-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        margin: 0;
      }
      .panel-title mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--brand-500);
      }

      /* Funnel */
      .funnel-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .funnel-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .funnel-label {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 110px;
        flex-shrink: 0;
        font-size: 0.82rem;
        font-weight: 500;
      }
      .funnel-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .funnel-label mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
      .funnel-bar-wrap {
        flex: 1;
        height: 8px;
        background: var(--surface-highlight);
        border-radius: 4px;
        overflow: hidden;
      }
      .funnel-bar {
        height: 100%;
        border-radius: 4px;
        transition: width 600ms ease;
      }
      .funnel-count {
        font-size: 0.88rem;
        font-weight: 700;
        width: 30px;
        text-align: right;
        flex-shrink: 0;
      }

      /* Recent activity */
      .recent-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .recent-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .candidate-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--brand-100);
        color: var(--brand-700);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.9rem;
        flex-shrink: 0;
      }
      .candidate-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .candidate-name {
        font-size: 0.88rem;
        font-weight: 600;
      }
      .candidate-meta {
        font-size: 0.75rem;
        color: var(--text-soft);
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .source-badge {
        padding: 1px 8px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 600;
      }
      .source-internal {
        background: rgba(59, 130, 246, 0.12);
        color: #3b82f6;
      }
      .source-referral {
        background: rgba(139, 92, 246, 0.12);
        color: #8b5cf6;
      }
      .see-all-link {
        align-self: flex-start;
        font-size: 0.82rem;
        color: var(--brand-500);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* Quick links */
      .quick-links {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .ql-btn {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HrDashboardPageComponent implements OnInit {
  private readonly notificationsAdapter = inject(NotificationsAdapter);
  private readonly applicationsAdapter = inject(ApplicationsAdapter);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  private readonly DEFAULT_METRICS = {
    totalJobOffers: 0,
    publishedJobs: 0,
    totalReferrals: 0,
    hiredFromReferral: 0,
    auditEventsToday: 0,
    totalAuditEvents: 0,
    totalApplications: 0,
  };

  protected readonly metrics = toSignal(
    this.notificationsAdapter.getHrMetrics().pipe(catchError(() => of(this.DEFAULT_METRICS))),
    { initialValue: this.DEFAULT_METRICS },
  );

  protected readonly allApplications = toSignal(
    this.applicationsAdapter.getApplications().pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  protected readonly recentApplications = computed(() =>
    [...this.allApplications()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
  );

  protected readonly activeJobs = computed(() => {
    const statuses = this.allApplications().map((a) => a.status);
    return new Set(statuses.filter((s) => s !== 'HIRED' && s !== 'REJECTED')).size || 8;
  });

  protected readonly funnelData = computed(() => {
    const apps = this.allApplications();
    const total = apps.length || 1;
    return FUNNEL_STEPS.map((step) => {
      const count = apps.filter((a) => a.status === step.status).length;
      return { ...step, count, pct: Math.round((count / total) * 100) };
    });
  });

  ngOnInit(): void {
    this.loadData();
  }

  protected reload(): void {
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set(false);
    // Track loading on applications (critical data); metrics failure shows zeros, not error page
    this.applicationsAdapter.getApplications().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }
}
