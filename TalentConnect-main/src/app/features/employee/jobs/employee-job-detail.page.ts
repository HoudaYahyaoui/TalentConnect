import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { JobsAdapter } from '../../../data-access/api/adapters/jobs.adapter';
import { MyApplicationsStore } from '../../../core/state/my-applications.store';
import { SessionStore } from '../../../core/state/session.store';
import { StatusChipComponent } from '../../../shared/ui/status-chip.component';

@Component({
  selector: 'app-employee-job-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    StatusChipComponent,
  ],
  template: `
    @if (job(); as currentJob) {
      <div class="detail-wrap">
        <!-- Header -->
        <div class="detail-header">
          <a mat-button routerLink="/app/employee/jobs" class="back-link">
            <mat-icon>arrow_back</mat-icon> Retour
          </a>
          <div class="header-body">
            <div class="header-left">
              <div class="job-icon-wrap"><mat-icon>work</mat-icon></div>
              <div>
                <p class="eyebrow">{{ currentJob.department }}</p>
                <h2>{{ currentJob.title }}</h2>
                <p class="header-meta">
                  <mat-icon style="font-size:15px;width:15px;height:15px;vertical-align:middle"
                    >location_on</mat-icon
                  >
                  {{ currentJob.location }} · {{ currentJob.employmentType }} ·
                  {{ currentJob.seniority }}
                </p>
              </div>
            </div>
            <div class="header-right">
              <app-status-chip [status]="currentJob.status"></app-status-chip>
              @if (currentJob.recommendedScore) {
                <div class="score-badge" [class.high]="currentJob.recommendedScore >= 80">
                  <mat-icon>insights</mat-icon> {{ currentJob.recommendedScore }}% match
                </div>
              }
            </div>
          </div>
          <!-- Tags -->
          <div class="tags-row">
            @for (tag of currentJob.tags; track tag) {
              <span class="tag-chip">{{ tag }}</span>
            }
          </div>
        </div>

        <!-- Content grid -->
        <div class="detail-grid">
          <div class="main-content">
            <section class="content-section">
              <h3><mat-icon>assignment</mat-icon> Mission &amp; Description</h3>
              <p>{{ currentJob.description }}</p>
            </section>

            <section class="content-section">
              <h3><mat-icon>checklist</mat-icon> Prérequis &amp; compétences attendues</h3>
              @if (currentJob.requirements.length) {
                <ul class="req-list">
                  @for (item of currentJob.requirements; track item) {
                    <li>
                      <mat-icon class="req-check">check_circle</mat-icon>
                      {{ item }}
                    </li>
                  }
                </ul>
              } @else {
                <p class="empty-hint">Aucun prérequis spécifique renseigné pour cette offre.</p>
              }
            </section>
          </div>

          <aside class="side-panel">
            <!-- Score card -->
            @if (currentJob.recommendedScore) {
              <div class="score-card" [class.high]="currentJob.recommendedScore >= 80">
                <div class="score-label">Score de compatibilité</div>
                <div class="score-value">{{ currentJob.recommendedScore }}%</div>
                <div class="score-desc">
                  Basé sur votre profil de compétences et votre expérience
                </div>
              </div>
            }

            <!-- Meta info -->
            <div class="meta-card">
              <div class="meta-row">
                <mat-icon>calendar_today</mat-icon>
                <div>
                  <span class="meta-label">Publié le</span>
                  <span>{{ currentJob.publishedAt | date: 'dd MMM yyyy' }}</span>
                </div>
              </div>
              <div class="meta-row">
                <mat-icon>event_busy</mat-icon>
                <div>
                  <span class="meta-label">Clôture</span>
                  <span>{{ currentJob.closingAt | date: 'dd MMM yyyy' }}</span>
                </div>
              </div>
              <div class="meta-row">
                <mat-icon>person</mat-icon>
                <div>
                  <span class="meta-label">Responsable</span>
                  <span>{{ currentJob.hiringManager || 'Non renseigné' }}</span>
                </div>
              </div>
            </div>

            <!-- CTA -->
            @if (hasApplied()) {
              <div class="already-applied">
                <mat-icon>check_circle</mat-icon>
                Candidature déjà soumise
              </div>
            } @else {
              <a
                mat-flat-button
                class="apply-btn"
                [routerLink]="['/app/employee/jobs', currentJob.id, 'apply']"
              >
                <mat-icon>send</mat-icon>
                Postuler à ce poste
              </a>
            }

            <a mat-stroked-button class="share-btn" routerLink="/app/employee/recommend">
              <mat-icon>recommend</mat-icon>
              Recommander un profil
            </a>
          </aside>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .detail-wrap {
        display: grid;
        gap: 16px;
      }
      .back-link {
        align-self: flex-start;
        color: var(--text-soft);
        font-size: 0.85rem;
      }

      .detail-header {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px 24px;
        display: grid;
        gap: 12px;
      }
      .header-body {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .header-left {
        display: flex;
        align-items: flex-start;
        gap: 14px;
      }
      .job-icon-wrap {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-lg);
        background: var(--brand-100);
        color: var(--brand-600);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .header-left h2 {
        font-size: 1.2rem;
        margin: 2px 0 4px;
      }
      .header-meta {
        font-size: 0.82rem;
        color: var(--text-soft);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .score-badge {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 5px 12px;
        border-radius: 999px;
        background: rgba(100, 116, 139, 0.1);
        color: var(--text-soft);
        font-size: 0.82rem;
        font-weight: 600;
      }
      .score-badge.high {
        background: rgba(34, 197, 94, 0.12);
        color: #16a34a;
      }
      .score-badge mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }
      .tags-row {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .tag-chip {
        padding: 3px 10px;
        border-radius: 999px;
        background: var(--surface-highlight);
        color: var(--text-soft);
        font-size: 0.75rem;
        font-weight: 500;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 300px;
        gap: 16px;
        align-items: start;
      }
      @media (max-width: 900px) {
        .detail-grid {
          grid-template-columns: 1fr;
        }
      }

      .content-section {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px;
        margin-bottom: 12px;
      }
      .content-section h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        margin: 0 0 12px;
      }
      .content-section h3 mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--brand-500);
      }
      .content-section p {
        font-size: 0.88rem;
        line-height: 1.7;
        color: var(--text-soft);
        margin: 0;
      }
      .req-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .req-list li {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 0.88rem;
      }
      .req-check {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #22c55e;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .side-panel {
        display: grid;
        gap: 12px;
      }
      .score-card {
        border: 2px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 16px;
        text-align: center;
        background: var(--surface-raised);
      }
      .score-card.high {
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.04);
      }
      .score-label {
        font-size: 0.75rem;
        color: var(--text-soft);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .score-value {
        font-size: 2.8rem;
        font-weight: 800;
        color: var(--brand-600);
        line-height: 1.1;
      }
      .score-card.high .score-value {
        color: #16a34a;
      }
      .score-desc {
        font-size: 0.75rem;
        color: var(--text-soft);
        margin-top: 4px;
      }

      .meta-card {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .meta-row {
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }
      .meta-row mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--brand-400);
        margin-top: 1px;
        flex-shrink: 0;
      }
      .meta-row > div {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .meta-label {
        font-size: 0.7rem;
        color: var(--text-soft);
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .meta-row span:last-child {
        font-size: 0.85rem;
        font-weight: 500;
      }

      .apply-btn {
        width: 100%;
        background: var(--brand-600) !important;
        color: #fff !important;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 0.95rem;
        padding: 10px !important;
        border-radius: var(--radius-lg) !important;
      }
      .share-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .already-applied {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 12px;
        border-radius: var(--radius-xl);
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
        font-size: 0.88rem;
        font-weight: 600;
        border: 1px solid rgba(34, 197, 94, 0.2);
      }
      .already-applied mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeJobDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jobsAdapter = inject(JobsAdapter);
  private readonly snackBar = inject(MatSnackBar);
  private readonly appsStore = inject(MyApplicationsStore);
  private readonly session = inject(SessionStore);

  private readonly jobRaw = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      switchMap((id) => this.jobsAdapter.getJobById(id)),
    ),
    { initialValue: undefined },
  );

  /** Ajoute un score de compatibilité calculé côté client (compétences × prérequis/tags). */
  protected readonly job = computed(() => {
    const j = this.jobRaw();
    if (!j || j.recommendedScore != null) return j;
    const skills = (this.session.user()?.skills ?? []).map((s) => s.toLowerCase().trim());
    const tokens = [...(j.requirements ?? []), ...(j.tags ?? [])]
      .map((t) => t.toLowerCase().trim())
      .filter(Boolean);
    if (!skills.length || !tokens.length) return j;
    const matched = tokens.filter((t) =>
      skills.some((s) => s === t || s.includes(t) || t.includes(s)),
    ).length;
    return { ...j, recommendedScore: Math.round((matched / tokens.length) * 100) };
  });

  protected readonly hasApplied = computed(() => {
    const j = this.job();
    if (!j) return false;
    const numId = parseInt(String(j.id), 10);
    return !isNaN(numId) && this.appsStore.hasApplied(numId);
  });
}
