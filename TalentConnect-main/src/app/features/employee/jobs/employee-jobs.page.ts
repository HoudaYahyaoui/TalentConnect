import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JobsAdapter } from '../../../data-access/api/adapters/jobs.adapter';
import { ApplicationsAdapter } from '../../../data-access/api/adapters/applications.adapter';
import { SessionStore } from '../../../core/state/session.store';
import { JobOffer } from '../../../data-access/models/portal.models';
import { StatusChipComponent } from '../../../shared/ui/status-chip.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';

@Component({
  selector: 'app-employee-jobs-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    StatusChipComponent,
    EmptyStateComponent,
  ],
  template: `
    <div class="page-wrap">
      <!-- Header search -->
      <header class="search-panel">
        <div class="search-head">
          <div>
            <p class="eyebrow">Mobilité interne</p>
            <h2>Explorer les opportunités</h2>
          </div>
          <span class="count-badge"
            >{{ filteredJobs().length }} offre{{ filteredJobs().length > 1 ? 's' : '' }}</span
          >
        </div>
        <div class="filter-grid">
          <div class="search-field">
            <span class="search-icon">⌕</span>
            <input
              class="app-input"
              placeholder="Rechercher un métier, une compétence…"
              [ngModel]="query()"
              (ngModelChange)="query.set($event)"
            />
          </div>
          <select
            class="app-input app-select"
            [ngModel]="location()"
            (ngModelChange)="location.set($event)"
          >
            <option value="">Tous les lieux</option>
            <option *ngFor="let l of locations()" [value]="l">{{ l }}</option>
          </select>
          <select
            class="app-input app-select"
            [ngModel]="department()"
            (ngModelChange)="department.set($event)"
          >
            <option value="">Tous les métiers</option>
            <option *ngFor="let d of departments()" [value]="d">{{ d }}</option>
          </select>
          <select
            class="app-input app-select"
            [ngModel]="sortBy()"
            (ngModelChange)="sortBy.set($event)"
          >
            <option value="score">Par score</option>
            <option value="publishedAt">Par date</option>
            <option value="title">Par titre</option>
          </select>
        </div>
      </header>

      <!-- Jobs grid -->
      @if (filteredJobs().length) {
        <div class="job-grid">
          @for (job of filteredJobs(); track job.id) {
            <article class="job-card" [class.applied]="hasApplied(job.id)">
              <div class="job-head">
                <div class="job-meta">
                  <h3>{{ job.title }}</h3>
                  <p class="job-sub">
                    {{ job.department }} · {{ job.location }} · {{ job.employmentType }}
                  </p>
                </div>
                <div class="job-head-right">
                  <app-status-chip [status]="job.status"></app-status-chip>
                  @if ((job.recommendedScore ?? 0) > 0) {
                    <div class="score-badge" [class.score-high]="(job.recommendedScore ?? 0) >= 80">
                      {{ job.recommendedScore }}%
                    </div>
                  }
                </div>
              </div>

              <p class="job-description">{{ job.description }}</p>

              <div class="tag-row">
                @for (tag of job.tags.slice(0, 5); track tag) {
                  <span class="tag">{{ tag }}</span>
                }
              </div>

              <footer class="job-footer">
                <div class="job-footer-meta">
                  <span class="seniority-badge">{{ job.seniority }}</span>
                  <span class="date-hint">Publié {{ job.publishedAt | date: 'dd MMM' }}</span>
                </div>
                <div class="job-actions">
                  <a
                    [routerLink]="['/app/employee/jobs', job.id]"
                    class="btn-detail"
                    mat-stroked-button
                  >
                    <mat-icon>open_in_new</mat-icon>
                    Détail
                  </a>
                  @if (hasApplied(job.id)) {
                    <button mat-flat-button class="btn-applied" disabled>
                      <mat-icon>check_circle</mat-icon>
                      Candidaté
                    </button>
                  } @else if (job.status === 'OPEN') {
                    <a
                      mat-flat-button
                      class="btn-apply"
                      [routerLink]="['/app/employee/jobs', job.id, 'apply']"
                    >
                      <mat-icon>send</mat-icon>
                      Postuler
                    </a>
                  } @else {
                    <button mat-stroked-button disabled class="btn-closed">Clôturé</button>
                  }
                </div>
              </footer>
            </article>
          }
        </div>
      } @else {
        <app-empty-state
          title="Aucune offre trouvée"
          description="Ajustez les filtres ou enregistrez une alerte pour être notifié à la prochaine publication."
          icon="travel_explore"
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

      /* Search panel */
      .search-panel {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px 24px;
      }
      .search-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 14px;
      }
      .search-head h2 {
        font-size: 1.15rem;
        font-weight: 700;
      }
      .count-badge {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 999px;
        background: var(--surface-highlight);
        color: var(--brand-700);
      }
      .filter-grid {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: 10px;
      }
      .search-field {
        position: relative;
      }
      .search-icon {
        position: absolute;
        left: 11px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-soft);
        font-size: 1rem;
        pointer-events: none;
      }
      .app-input {
        width: 100%;
        border-radius: 9px;
        border: 1px solid var(--border-base);
        background: var(--surface-muted);
        padding: 8px 12px;
        font-size: 0.85rem;
        color: var(--text-primary);
        outline: none;
        transition: border-color 150ms;
      }
      .search-field .app-input {
        padding-left: 30px;
      }
      .app-input:focus {
        border-color: var(--brand-500);
      }
      .app-select {
        cursor: pointer;
      }

      /* Job grid */
      .job-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .job-card {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 18px 20px;
        display: grid;
        gap: 10px;
        transition:
          border-color 150ms,
          box-shadow 150ms;
      }
      .job-card:hover {
        border-color: var(--border-base);
        box-shadow: var(--shadow-soft);
      }
      .job-card.applied {
        border-color: rgba(34, 197, 94, 0.35);
        background: rgba(34, 197, 94, 0.03);
      }

      /* Score */
      .score-badge {
        font-size: 0.72rem;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--surface-highlight);
        color: var(--brand-700);
        white-space: nowrap;
      }
      .score-badge.score-high {
        background: rgba(34, 197, 94, 0.14);
        color: #15803d;
      }

      .job-head-right {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        flex-shrink: 0;
      }

      .job-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }
      .job-meta h3 {
        font-size: 0.95rem;
        font-weight: 700;
      }
      .job-sub {
        font-size: 0.78rem;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .job-description {
        font-size: 0.82rem;
        color: var(--text-muted);
        line-height: 1.55;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Tags */
      .tag-row {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .tag {
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--surface-highlight);
        font-size: 0.72rem;
        color: var(--brand-700);
      }

      /* Footer */
      .job-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding-top: 6px;
      }
      .job-footer-meta {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .seniority-badge {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--surface-muted);
        border: 1px solid var(--border-base);
        color: var(--text-soft);
      }
      .date-hint {
        font-size: 0.72rem;
        color: var(--text-soft);
      }
      .job-actions {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      .btn-apply {
        background: var(--brand-500) !important;
        color: #fff !important;
        border-radius: 8px !important;
        font-size: 0.8rem !important;
        height: 32px !important;
        gap: 4px !important;
      }
      .btn-apply mat-icon {
        font-size: 15px !important;
        width: 15px !important;
        height: 15px !important;
      }
      .btn-applied {
        background: rgba(34, 197, 94, 0.13) !important;
        color: #15803d !important;
        border-radius: 8px !important;
        font-size: 0.8rem !important;
        height: 32px !important;
        gap: 4px !important;
      }
      .btn-applied mat-icon {
        font-size: 15px !important;
        width: 15px !important;
        height: 15px !important;
      }
      .btn-detail {
        border-radius: 8px !important;
        font-size: 0.8rem !important;
        height: 32px !important;
        gap: 4px !important;
        color: var(--text-muted) !important;
        border-color: var(--border-base) !important;
      }
      .btn-detail mat-icon {
        font-size: 15px !important;
        width: 15px !important;
        height: 15px !important;
      }
      .btn-closed {
        font-size: 0.8rem !important;
        height: 32px !important;
        opacity: 0.5;
      }

      @media (max-width: 900px) {
        .filter-grid {
          grid-template-columns: 1fr 1fr;
        }
        .job-grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 600px) {
        .filter-grid {
          grid-template-columns: 1fr;
        }
        .job-footer {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeJobsPageComponent {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly applicationsAdapter = inject(ApplicationsAdapter);
  private readonly appliedIds = signal<Set<string>>(new Set());

  constructor() {
    // Load already-applied job IDs on init
    this.applicationsAdapter.getMyApplications().subscribe((apps) => {
      this.appliedIds.set(
        new Set(
          apps.map((a) =>
            String(
              (a as { offerId?: string | number }).offerId ?? (a as { jobId?: string }).jobId ?? '',
            ),
          ),
        ),
      );
    });
  }

  protected readonly query = signal('');
  protected readonly location = signal('');
  protected readonly department = signal('');
  protected readonly sortBy = signal<'score' | 'publishedAt' | 'title'>('score');

  private readonly allJobsRaw = toSignal(
    inject(JobsAdapter)
      .getJobs()
      .pipe(catchError(() => of([]))),
    { initialValue: [] },
  );

  private readonly session = inject(SessionStore);

  /**
   * Score de compatibilité calculé côté client : recouvrement entre les
   * compétences du collaborateur et les prérequis + tags de l'offre.
   */
  private readonly allJobs = computed<JobOffer[]>(() => {
    const skills = (this.session.user()?.skills ?? []).map((s) => s.toLowerCase().trim());
    return this.allJobsRaw().map((job) => {
      if (job.recommendedScore != null) return job;
      const tokens = [...(job.requirements ?? []), ...(job.tags ?? [])]
        .map((t) => t.toLowerCase().trim())
        .filter(Boolean);
      if (!skills.length || !tokens.length) return job;
      const matched = tokens.filter((t) =>
        skills.some((s) => s === t || s.includes(t) || t.includes(s)),
      ).length;
      const score = Math.round((matched / tokens.length) * 100);
      return { ...job, recommendedScore: score };
    });
  });

  protected readonly locations = computed(() =>
    [...new Set(this.allJobs().map((j) => j.location))].sort(),
  );
  protected readonly departments = computed(() =>
    [...new Set(this.allJobs().map((j) => j.department))].sort(),
  );

  protected readonly filteredJobs = computed(() => {
    const q = this.query().toLowerCase();
    const loc = this.location();
    const dep = this.department();
    const sort = this.sortBy();
    let jobs = this.allJobs().filter((j) => {
      if (
        q &&
        !j.title.toLowerCase().includes(q) &&
        !j.description.toLowerCase().includes(q) &&
        !j.tags.some((t) => t.toLowerCase().includes(q))
      )
        return false;
      if (loc && j.location !== loc) return false;
      if (dep && j.department !== dep) return false;
      return true;
    });
    if (sort === 'score')
      jobs = [...jobs].sort((a, b) => (b.recommendedScore ?? 0) - (a.recommendedScore ?? 0));
    if (sort === 'publishedAt')
      jobs = [...jobs].sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));    if (sort === 'title') jobs = [...jobs].sort((a, b) => a.title.localeCompare(b.title));
    return jobs;
  });

  protected hasApplied(jobId: string): boolean {
    return this.appliedIds().has(jobId) || this.appliedIds().has(String(parseInt(jobId, 10)));
  }
}
