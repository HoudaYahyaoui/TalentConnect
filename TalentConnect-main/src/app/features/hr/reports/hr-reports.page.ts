import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { combineLatest, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../../../shared/services/toast.service';
import { NotificationsAdapter } from '../../../data-access/api/adapters/notifications.adapter';
import { ApplicationsAdapter } from '../../../data-access/api/adapters/applications.adapter';
import { HrDashboardMetrics } from '../../../data-access/models/portal.models';
import { SkeletonListComponent, ErrorStateComponent } from '../../../shared/components/page-states';

@Component({
  selector: 'app-hr-reports-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    SkeletonListComponent,
    ErrorStateComponent,
  ],
  template: `
    @if (loading()) {
      <app-skeleton-list [count]="4"></app-skeleton-list>
    } @else if (error()) {
      <app-error-state
        title="Impossible de charger les rapports"
        (retry)="load()"
      ></app-error-state>
    } @else if (metrics(); as m) {
      <section class="panel">
        <div class="head-row">
          <div>
            <h2>Dashboard analytique RH</h2>
            <p>Funnel, conversion et exports.</p>
          </div>
          <div class="actions-row">
            <button mat-stroked-button type="button" (click)="exportCsv()">
              <mat-icon>download</mat-icon> Exporter CSV
            </button>
          </div>
        </div>

        <div class="stats-grid">
          <article class="stat-card">
            <strong>{{ m.totalApplications }}</strong>
            <span>candidatures totales</span>
          </article>
          <article class="stat-card">
            <strong>{{ m.internalCandidates }}</strong>
            <span>mobilité interne</span>
          </article>
          <article class="stat-card">
            <strong>{{ m.referrals }}</strong>
            <span>cooptations</span>
          </article>
          <article class="stat-card">
            <strong>{{ m.conversionRate }} %</strong>
            <span>taux de conversion</span>
          </article>
          <article class="stat-card">
            <strong>{{ m.avgTimeToHire }} j</strong>
            <span>time-to-hire moyen</span>
          </article>
        </div>

        <div class="funnel">
          <h3>Progression funnel</h3>
          <div class="funnel-bar">
            <div class="funnel-step" [style.flex]="m.totalApplications">
              <span>Soumis</span><strong>{{ m.totalApplications }}</strong>
            </div>
            <div class="funnel-step review" [style.flex]="m.internalCandidates">
              <span>Analyse</span><strong>{{ m.internalCandidates }}</strong>
            </div>
            <div class="funnel-step final" [style.flex]="m.referrals">
              <span>Offre</span><strong>{{ m.referrals }}</strong>
            </div>
          </div>
        </div>
      </section>
    }
  `,
  styles: [
    `
      .panel {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: 1.25rem;
        padding: 1.25rem;
        display: grid;
        gap: 1.5rem;
      }
      .head-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
      }
      .head-row p {
        margin: 0.3rem 0 0;
        color: var(--text-muted);
      }
      .actions-row {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 1rem;
      }
      .stat-card {
        display: grid;
        gap: 0.3rem;
        padding: 1.1rem;
        border-radius: 1rem;
        background: var(--surface-muted);
        text-align: center;
      }
      .stat-card strong {
        font-size: 2rem;
        font-weight: 800;
        color: var(--brand-700);
      }
      .stat-card span {
        color: var(--text-muted);
        font-size: 0.82rem;
      }
      .funnel h3 {
        margin: 0 0 0.75rem;
      }
      .funnel-bar {
        display: flex;
        gap: 4px;
        border-radius: 0.5rem;
        overflow: hidden;
        height: 48px;
      }
      .funnel-step {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1rem;
        background: var(--surface-highlight);
        gap: 0.5rem;
        font-size: 0.82rem;
        color: var(--brand-700);
      }
      .funnel-step.review {
        background: rgba(99, 102, 241, 0.14);
        color: var(--accent-500);
      }
      .funnel-step.final {
        background: rgba(34, 197, 94, 0.14);
        color: var(--success-500);
      }
      @media (max-width: 900px) {
        .stats-grid {
          grid-template-columns: repeat(2, 1fr);
        }
        .head-row {
          flex-direction: column;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HrReportsPageComponent implements OnInit {
  private readonly adapter = inject(NotificationsAdapter);
  private readonly appAdapter = inject(ApplicationsAdapter);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly metrics = signal<HrDashboardMetrics | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    combineLatest([
      this.adapter.getHrMetrics().pipe(catchError(() => of({
        totalJobOffers: 0, publishedJobs: 0, totalReferrals: 0,
        hiredFromReferral: 0, auditEventsToday: 0, totalAuditEvents: 0,
        totalApplications: 0, internalCandidates: 0, referrals: 0,
        conversionRate: 0, avgTimeToHire: 0,
      } as HrDashboardMetrics))),
      this.appAdapter.getApplications().pipe(catchError(() => of([]))),
    ]).subscribe({
      next: ([m, apps]) => {
        this.metrics.set({
          ...m,
          totalApplications: apps.length || m.totalApplications,
          internalCandidates: apps.length ? apps.filter((a) => a.source === 'INTERNAL').length : m.internalCandidates,
          referrals: apps.length ? apps.filter((a) => a.source === 'REFERRAL').length : m.referrals,
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  protected exportCsv(): void {
    const m = this.metrics();
    if (!m) return;

    const rows = [
      ['M\u00e9trique', 'Valeur'],
      ['Candidatures totales', m.totalApplications],
      ['Mobilit\u00e9 interne', m.internalCandidates],
      ['Cooptations', m.referrals],
      ['Taux de conversion (%)', m.conversionRate],
      ['Time-to-hire moyen (jours)', m.avgTimeToHire],
    ];

    const csv = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rapport-rh-' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
    URL.revokeObjectURL(url);

    this.toast.open('Export CSV t\u00e9l\u00e9charg\u00e9.', 'OK', { duration: 2500 });
  }
}
