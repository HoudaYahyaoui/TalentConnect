import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JobsAdapter } from '../../../data-access/api/adapters/jobs.adapter';
import { NotificationsAdapter } from '../../../data-access/api/adapters/notifications.adapter';
import { SessionStore } from '../../../core/state/session.store';
import { MyApplicationsStore } from '../../../core/state/my-applications.store';
import { StatusChipComponent } from '../../../shared/ui/status-chip.component';
import { MetricCardComponent } from '../../../shared/ui/metric-card.component';

@Component({
  selector: 'app-employee-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    StatusChipComponent,
    MetricCardComponent,
  ],
  template: `
    <div class="page-wrap">
      <!-- Hero welcome -->
      <header class="hero-card">
        <div class="hero-left">
          <p class="eyebrow">Portail Mobilité Interne</p>
          <h2>Bonjour, {{ firstName() }} 👋</h2>
          <p class="hero-sub">
            Retrouvez vos opportunités recommandées, suivez vos dossiers et gérez votre profil de
            mobilité.
          </p>
          <div class="hero-actions">
            <a mat-flat-button class="btn-primary" routerLink="/app/employee/jobs">
              <mat-icon>travel_explore</mat-icon>
              Explorer les offres
            </a>
            <a mat-stroked-button class="btn-secondary" routerLink="/app/employee/referrals">
              <mat-icon>recommend</mat-icon>
              Recommander un profil
            </a>
          </div>
        </div>
        <div class="hero-art" aria-hidden="true">
          <div class="hero-ring r1"></div>
          <div class="hero-ring r2"></div>
          <mat-icon class="hero-icon">auto_awesome</mat-icon>
        </div>
      </header>

      <!-- KPIs -->
      <div class="metrics-row">
        <app-metric-card
          label="Offres suggérées"
          [value]="topJobs().length"
          hint="Scoring profil/offre"
          icon="travel_explore"
        ></app-metric-card>
        <app-metric-card
          label="Candidatures en cours"
          [value]="pending().length"
          hint="Dossiers actifs"
          icon="list_alt"
        ></app-metric-card>
        <app-metric-card
          label="Notifications"
          [value]="unreadCount()"
          hint="Non lues"
          icon="notifications"
        ></app-metric-card>
        <app-metric-card
          label="Score moyen"
          [value]="avgScore() + '%'"
          hint="Compatibilité offres"
          icon="insights"
        ></app-metric-card>
      </div>

      <div class="two-col">
        <!-- Top offres -->
        <section class="panel">
          <div class="panel-head">
            <h3>Top offres pour vous</h3>
            <a mat-button class="see-all-btn" routerLink="/app/employee/jobs">Voir tout</a>
          </div>
          @for (job of topJobs(); track job.id) {
            <article class="list-row">
              <div class="row-info">
                <span class="row-title">{{ job.title }}</span>
                <span class="row-sub">{{ job.department }} · {{ job.location }}</span>
              </div>
              <div class="row-right">
                <span class="match-badge" [class.high]="(job.recommendedScore ?? 0) >= 80">
                  {{ job.recommendedScore }}%
                </span>
                <app-status-chip [status]="job.status"></app-status-chip>
              </div>
            </article>
          }
          @if (!topJobs().length) {
            <p class="empty-msg">Aucune offre disponible pour le moment.</p>
          }
        </section>

        <!-- Candidatures récentes -->
        <section class="panel">
          <div class="panel-head">
            <h3>Mes candidatures</h3>
            <a mat-button class="see-all-btn" routerLink="/app/employee/applications">Voir tout</a>
          </div>
          @for (app of myApps(); track app.id) {
            <article class="list-row">
              <div class="row-info">
                <span class="row-title">{{ app.jobTitle }}</span>
                <span class="row-sub">Mis à jour {{ app.updatedAt | date: 'dd MMM yyyy' }}</span>
              </div>
              <app-status-chip [status]="app.status"></app-status-chip>
            </article>
          }
          @if (!myApps().length) {
            <div class="no-apps">
              <mat-icon>send</mat-icon>
              <p>Vous n'avez pas encore postulé.</p>
              <a mat-flat-button class="btn-primary-sm" routerLink="/app/employee/jobs"
                >Postuler maintenant</a
              >
            </div>
          }
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .page-wrap {
        display: grid;
        gap: 16px;
      }

      /* Hero */
      .hero-card {
        background: linear-gradient(135deg, var(--brand-600) 0%, var(--accent-600) 100%);
        border-radius: var(--radius-xl);
        padding: 28px 32px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        color: #fff;
        overflow: hidden;
        position: relative;
      }
      .hero-left {
        flex: 1;
      }
      .hero-card .eyebrow {
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 6px;
      }
      .hero-card h2 {
        font-size: 1.5rem;
        color: #fff;
        margin-bottom: 8px;
      }
      .hero-sub {
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.78);
        line-height: 1.6;
        margin-bottom: 18px;
      }
      .hero-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .btn-primary {
        background: #fff !important;
        color: var(--brand-700) !important;
        border-radius: 9px !important;
        font-size: 0.82rem !important;
        height: 36px !important;
        gap: 4px !important;
      }
      .btn-primary mat-icon {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
      }
      .btn-secondary {
        border-color: rgba(255, 255, 255, 0.5) !important;
        color: #fff !important;
        border-radius: 9px !important;
        font-size: 0.82rem !important;
        height: 36px !important;
        gap: 4px !important;
      }
      .btn-secondary mat-icon {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
      }

      /* Hero art */
      .hero-art {
        position: relative;
        width: 80px;
        height: 80px;
        flex-shrink: 0;
      }
      .hero-ring {
        position: absolute;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.2);
      }
      .hero-ring.r1 {
        inset: -10px;
        animation: spin 12s linear infinite;
      }
      .hero-ring.r2 {
        inset: 8px;
        animation: spin 8s linear infinite reverse;
      }
      .hero-icon {
        position: absolute;
        inset: 0;
        margin: auto;
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: rgba(255, 255, 255, 0.85);
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Metrics */
      .metrics-row {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }

      /* Two col */
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .panel {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 18px 20px;
      }
      .panel-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }
      .panel-head h3 {
        font-size: 0.92rem;
        font-weight: 700;
      }
      .see-all-btn {
        font-size: 0.78rem !important;
        color: var(--brand-500) !important;
      }

      /* List rows */
      .list-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 9px 0;
        border-top: 1px solid var(--border-subtle);
      }
      .list-row:first-of-type {
        border-top: none;
        padding-top: 0;
      }
      .row-info {
        min-width: 0;
      }
      .row-title {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row-sub {
        display: block;
        font-size: 0.72rem;
        color: var(--text-muted);
        margin-top: 1px;
      }
      .row-right {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
      }
      .match-badge {
        font-size: 0.68rem;
        font-weight: 800;
        padding: 2px 7px;
        border-radius: 999px;
        background: var(--surface-highlight);
        color: var(--brand-700);
      }
      .match-badge.high {
        background: rgba(34, 197, 94, 0.13);
        color: #15803d;
      }

      /* No apps */
      .no-apps {
        text-align: center;
        padding: 20px 0;
        color: var(--text-muted);
      }
      .no-apps mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        margin-bottom: 8px;
        opacity: 0.4;
      }
      .no-apps p {
        font-size: 0.82rem;
        margin-bottom: 12px;
      }
      .btn-primary-sm {
        background: var(--brand-500) !important;
        color: #fff !important;
        border-radius: 8px !important;
        font-size: 0.78rem !important;
        height: 30px !important;
      }

      .empty-msg {
        font-size: 0.82rem;
        color: var(--text-muted);
        text-align: center;
        padding: 16px 0;
      }

      @media (max-width: 1024px) {
        .metrics-row {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 768px) {
        .two-col {
          grid-template-columns: 1fr;
        }
        .hero-art {
          display: none;
        }
      }
      @media (max-width: 600px) {
        .metrics-row {
          grid-template-columns: 1fr 1fr;
        }
        .hero-card {
          padding: 20px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeDashboardPageComponent {
  private readonly session = inject(SessionStore);
  private readonly myAppStore = inject(MyApplicationsStore);
  private readonly notifAdapter = inject(NotificationsAdapter);

  protected readonly firstName = computed(() => this.session.user()?.firstName ?? 'vous');

  private readonly allJobs = toSignal(inject(JobsAdapter).getJobs(), { initialValue: [] });
  private readonly notifs = toSignal(this.notifAdapter.getNotifications(), { initialValue: [] });

  protected readonly topJobs = computed(() =>
    this.allJobs()
      .filter((j) => j.status === 'OPEN')
      .slice(0, 4),
  );
  protected readonly myApps = computed(() => this.myAppStore.applications().slice(0, 4));
  protected readonly pending = this.myAppStore.pending;
  protected readonly unreadCount = computed(() => this.notifs().filter((n) => !n.read).length);
  protected readonly avgScore = computed(() => {
    const open = this.allJobs().filter((j) => j.status === 'OPEN');
    return open.length
      ? Math.round(open.reduce((s, j) => s + (j.recommendedScore ?? 0), 0) / open.length)
      : 0;
  });
}
