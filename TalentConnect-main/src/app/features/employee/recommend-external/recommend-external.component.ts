import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { JobsAdapter } from '../../../data-access/api/adapters/jobs.adapter';
import { ReferralsAdapter } from '../../../data-access/api/adapters/referrals.adapter';
import type { ReferralCreatePayload } from '../../../data-access/api/adapters/referrals.adapter';
import { JobOffer } from '../../../data-access/models/portal.models';
import { SessionStore } from '../../../core/state/session.store';
import { FileService } from '../../../core/services/file.service';

interface Referral {
  id: string;
  candidateName: string;
  email: string;
  job: string;
  status: 'En attente' | 'En cours' | 'Recruté' | 'Refusé';
  date: string;
}

const SEED_REFERRALS: Referral[] = [
  {
    id: 'r1',
    candidateName: 'Alexandre Petit',
    email: 'a.petit@email.com',
    job: 'Lead Product Designer',
    status: 'En cours',
    date: '2025-05-10',
  },
  {
    id: 'r2',
    candidateName: 'Camille Robert',
    email: 'c.robert@email.com',
    job: 'Data Engineer',
    status: 'En attente',
    date: '2025-05-20',
  },
  {
    id: 'r3',
    candidateName: 'Nicolas Durand',
    email: 'n.durand@email.com',
    job: 'DevOps Senior',
    status: 'Recruté',
    date: '2025-04-15',
  },
];

const STATUS_COLORS: Record<string, string> = {
  'En attente': '#f59e0b',
  'En cours': '#3b82f6',
  Recruté: '#22c55e',
  Refusé: '#ef4444',
};

const SKILLS_CATALOG = [
  'Angular',
  'React',
  'Vue.js',
  'TypeScript',
  'Python',
  'Java',
  'Spring Boot',
  'Node.js',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'DevOps',
  'CI/CD',
  'SQL',
  'MongoDB',
  'UX/UI Design',
  'Figma',
  'Product Management',
  'Scrum',
  'Machine Learning',
  'Data Science',
  'Cybersécurité',
  'Cloud Architecture',
];

@Component({
  selector: 'app-recommend-external',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  template: `
    <div class="rec-wrap">
      <header class="page-header">
        <div>
          <p class="eyebrow">Programme Cooptation</p>
          <h2>Recommander un candidat externe</h2>
          <p class="header-sub">
            Partagez votre réseau et contribuez au recrutement. Une prime de cooptation peut être
            attribuée lors de l'embauche.
          </p>
        </div>
        <div class="badge-coopt">
          <mat-icon>emoji_events</mat-icon>
          <div>
            <span class="badge-num">{{ myReferrals().length }}</span>
            <span class="badge-label">cooptations</span>
          </div>
        </div>
      </header>

      <div class="rec-grid">
        <!-- Form -->
        <div class="form-card">
          @if (submitted()) {
            <div class="form-success">
              <mat-icon class="ok-icon">check_circle</mat-icon>
              <h3>Recommandation envoyée !</h3>
              <p>
                Votre cooptation a été transmise à l'équipe RH. Vous serez notifié(e) de
                l'avancement.
              </p>
              <button mat-flat-button class="btn-primary" type="button" (click)="resetForm()">
                <mat-icon>add</mat-icon> Nouvelle cooptation
              </button>
            </div>
          } @else {
            <h3 class="form-section-title">
              <mat-icon>person_add</mat-icon> Informations du candidat
            </h3>

            <form [formGroup]="form" class="rec-form" (ngSubmit)="submit()">
              <div class="field-row">
                <mat-form-field appearance="outline">
                  <mat-label>Prénom</mat-label>
                  <mat-icon matPrefix>person</mat-icon>
                  <input matInput formControlName="firstName" placeholder="Alice" />
                  <mat-error>Obligatoire</mat-error>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nom</mat-label>
                  <input matInput formControlName="lastName" placeholder="Martin" />
                  <mat-error>Obligatoire</mat-error>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email professionnel</mat-label>
                <mat-icon matPrefix>email</mat-icon>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="alice.martin@email.com"
                />
                <mat-error>Email invalide</mat-error>
              </mat-form-field>

              <div class="field-row">
                <mat-form-field appearance="outline">
                  <mat-label>Téléphone</mat-label>
                  <mat-icon matPrefix>phone</mat-icon>
                  <input matInput formControlName="phone" placeholder="+33 6 XX XX XX XX" />
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>LinkedIn (optionnel)</mat-label>
                  <mat-icon matPrefix>link</mat-icon>
                  <input matInput formControlName="linkedin" placeholder="linkedin.com/in/…" />
                </mat-form-field>
              </div>

              <mat-divider style="margin: 4px 0 12px;"></mat-divider>

              <h3 class="form-section-title">
                <mat-icon>work</mat-icon> Poste visé &amp; compétences
              </h3>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Offre cible</mat-label>
                <mat-icon matPrefix>business_center</mat-icon>
                <mat-select formControlName="targetJobId">
                  @for (job of jobs(); track job.id) {
                    <mat-option [value]="job.id">
                      {{ job.title }} — {{ job.department }}
                    </mat-option>
                  }
                </mat-select>
                <mat-error>Sélectionner une offre</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Compétences clés</mat-label>
                <mat-icon matPrefix>psychology</mat-icon>
                <mat-select formControlName="skills" multiple>
                  @for (skill of skillsCatalog; track skill) {
                    <mat-option [value]="skill">{{ skill }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-divider style="margin: 4px 0 12px;"></mat-divider>

              <h3 class="form-section-title">
                <mat-icon>rate_review</mat-icon> Message de recommandation
              </h3>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Votre recommandation</mat-label>
                <textarea
                  matInput
                  formControlName="message"
                  rows="4"
                  placeholder="Décrivez pourquoi vous recommandez cette personne, vos interactions avec elle, ses points forts…"
                ></textarea>
                <mat-hint align="end">{{ form.get('message')?.value?.length || 0 }}/1000</mat-hint>
                <mat-error>Message obligatoire (min. 50 caractères)</mat-error>
              </mat-form-field>

              <div class="upload-zone" (click)="triggerFileInput()">
                <input
                  #cvFileInput
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style="display:none"
                  (change)="onFileSelected($event)"
                />
                <mat-icon class="upload-icon">attach_file</mat-icon>
                @if (cvFile()) {
                  <span
                    >{{ cvFile() }} —
                    <small style="color:var(--text-soft)">Cliquer pour remplacer</small></span
                  >
                } @else {
                  <span
                    >Joindre le CV du candidat
                    <small style="color:var(--text-soft)">(optionnel · PDF/DOCX)</small></span
                  >
                }
              </div>

              <div class="form-actions">
                <button mat-stroked-button type="button" routerLink="/app/employee/dashboard">
                  Annuler
                </button>
                <button
                  mat-flat-button
                  class="btn-primary"
                  type="submit"
                  [disabled]="form.invalid || submitting()"
                >
                  @if (submitting()) {
                    <mat-spinner diameter="18"></mat-spinner>
                  } @else {
                    <ng-container><mat-icon>send</mat-icon> Envoyer la cooptation</ng-container>
                  }
                </button>
              </div>
            </form>
          }
        </div>

        <!-- My referrals panel -->
        <div class="panel-referrals">
          <h3 class="panel-title"><mat-icon>history</mat-icon> Mes cooptations</h3>

          @if (myReferrals().length === 0) {
            <div class="empty-ref">
              <mat-icon>group_add</mat-icon>
              <p>Aucune cooptation pour l'instant.</p>
            </div>
          } @else {
            <div class="ref-list">
              @for (r of myReferrals(); track r.id) {
                <div class="ref-card">
                  <div class="ref-avatar">{{ r.candidateName.charAt(0) }}</div>
                  <div class="ref-info">
                    <span class="ref-name">{{ r.candidateName }}</span>
                    <span class="ref-job">{{ r.job }}</span>
                    <span class="ref-date">{{ r.date | date: 'dd MMM yyyy' }}</span>
                  </div>
                  <div
                    class="ref-status"
                    [style.background]="statusBg(r.status)"
                    [style.color]="statusColor(r.status)"
                  >
                    {{ r.status }}
                  </div>
                </div>
              }
            </div>
          }

          <mat-divider style="margin: 12px 0;"></mat-divider>
          <div class="prime-info">
            <mat-icon>info</mat-icon>
            <small
              >La prime de cooptation est versée à l'issue de la période d'essai du candidat
              recruté.</small
            >
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .rec-wrap {
        display: grid;
        gap: 16px;
      }

      .page-header {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px 24px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }
      .page-header h2 {
        font-size: 1.2rem;
        margin: 4px 0 6px;
      }
      .header-sub {
        font-size: 0.82rem;
        color: var(--text-soft);
        margin: 0;
        max-width: 560px;
      }
      .badge-coopt {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--brand-100);
        border-radius: var(--radius-xl);
        padding: 10px 18px;
        flex-shrink: 0;
      }
      .badge-coopt mat-icon {
        color: var(--brand-600);
        font-size: 26px;
        width: 26px;
        height: 26px;
      }
      .badge-num {
        font-size: 1.4rem;
        font-weight: 800;
        display: block;
        line-height: 1;
      }
      .badge-label {
        font-size: 0.75rem;
        color: var(--text-soft);
      }

      .rec-grid {
        display: grid;
        grid-template-columns: 1fr 340px;
        gap: 16px;
      }
      @media (max-width: 900px) {
        .rec-grid {
          grid-template-columns: 1fr;
        }
      }

      .form-card {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 24px;
      }
      .form-section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        margin: 0 0 8px;
        color: var(--text-primary);
      }
      .form-section-title mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--brand-500);
      }

      .rec-form {
        display: grid;
        gap: 14px;
      }
      .full-width {
        width: 100%;
      }
      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      @media (max-width: 600px) {
        .field-row {
          grid-template-columns: 1fr;
        }
      }

      .upload-zone {
        border: 2px dashed var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: 16px 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.85rem;
        transition:
          border-color 150ms,
          background 150ms;
      }
      .upload-zone:hover {
        border-color: var(--brand-400);
        background: var(--brand-50);
      }
      .upload-icon {
        color: var(--brand-400);
      }

      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        padding-top: 4px;
      }
      .btn-primary {
        background: var(--brand-600) !important;
        color: #fff !important;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .btn-primary mat-spinner {
        display: inline-flex;
      }

      .form-success {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 32px 16px;
        text-align: center;
      }
      .ok-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: #22c55e;
      }
      .form-success h3 {
        margin: 0;
        font-size: 1.1rem;
      }
      .form-success p {
        margin: 0;
        color: var(--text-soft);
        max-width: 340px;
        font-size: 0.88rem;
      }

      /* Referrals panel */
      .panel-referrals {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        align-self: flex-start;
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

      .empty-ref {
        text-align: center;
        padding: 24px 0;
        color: var(--text-soft);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .empty-ref mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        opacity: 0.4;
      }
      .empty-ref p {
        margin: 0;
        font-size: 0.85rem;
      }

      .ref-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .ref-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        background: var(--surface-base, #f8fafc);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
      }
      .ref-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--brand-200);
        color: var(--brand-700);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.9rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      .ref-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }
      .ref-name {
        font-size: 0.88rem;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ref-job {
        font-size: 0.75rem;
        color: var(--text-soft);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ref-date {
        font-size: 0.7rem;
        color: var(--text-soft);
      }
      .ref-status {
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .prime-info {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 0.75rem;
        color: var(--text-soft);
        background: rgba(var(--brand-600-rgb, 37, 99, 235), 0.05);
        border-radius: var(--radius-lg);
        padding: 10px;
      }
      .prime-info mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--brand-500);
        flex-shrink: 0;
      }
    `,
  ],
})
export class RecommendExternalComponent implements OnInit {
  @ViewChild('cvFileInput') cvFileInput!: ElementRef<HTMLInputElement>;

  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly jobsAdapter = inject(JobsAdapter);
  private readonly referralsAdapter = inject(ReferralsAdapter);
  private readonly session = inject(SessionStore);
  private readonly fileService = inject(FileService);

  protected readonly jobs = signal<JobOffer[]>([]);
  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly cvFile = signal<string | null>(null);
  protected readonly cvFileObject = signal<File | null>(null);
  protected readonly myReferrals = signal<Referral[]>([]);
  protected readonly skillsCatalog = SKILLS_CATALOG;

  readonly form = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    linkedin: [''],
    targetJobId: ['', Validators.required],
    skills: [[] as string[]],
    message: ['', [Validators.required, Validators.minLength(50)]],
  });

  ngOnInit(): void {
    this.jobsAdapter.getJobs().subscribe((jobs) => {
      this.jobs.set(jobs.filter((j) => j.status === 'OPEN'));
    });
    // Load real referrals from backend
    this.referralsAdapter.getReferrals().subscribe({
      next: (refs) => {
        const mapped: Referral[] = refs.map((r) => ({
          id: String(r.id),
          candidateName: r.candidateFullName ?? '',
          email: r.candidateEmail ?? '',
          job: (r as { jobTitle?: string }).jobTitle ?? r.targetJobId ?? '\u2014',
          status: this.mapStatus((r as { status?: string }).status ?? ''),
          date: r.createdAt?.substring(0, 10) ?? '',
        }));
        this.myReferrals.set(mapped);
      },
      error: () => {
        /* keep empty list on error */
      },
    });
  }

  private mapStatus(s: string): Referral['status'] {
    const m: Record<string, Referral['status']> = {
      SUBMITTED: 'En attente',
      REVIEW: 'En cours',
      INTERVIEW: 'En cours',
      OFFER: 'En cours',
      HIRED: 'Recrut\u00e9',
      REJECTED: 'Refus\u00e9',
    };
    return m[s] ?? 'En attente';
  }

  protected triggerFileInput(): void {
    this.cvFileInput?.nativeElement.click();
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        this.toast.open('Le CV ne doit pas dépasser 10 MB.', 'Fermer', { duration: 4000 });
        input.value = '';
        return;
      }
      this.cvFile.set(file.name);
      this.cvFileObject.set(file);
      this.toast.open('CV joint : ' + file.name, '', { duration: 2000 });
    }
  }

  protected submit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const val = this.form.getRawValue();

    const basePayload: ReferralCreatePayload = {
      candidateFullName: `${val.firstName} ${val.lastName}`.trim(),
      candidateEmail: val.email || '',
      candidatePhone: val.phone || '',
      linkedIn: val.linkedin || '',
      targetJobId: val.targetJobId ? String(val.targetJobId) : '',
      skills: val.skills?.length ? val.skills : [],
    };

    const cv = this.cvFileObject();
    const user = this.session.user();
    const upload$ = cv
      ? this.fileService
          .upload(cv, Number(user?.id ?? 0), user?.role ?? 'EMPLOYEE')
          .pipe(map((r) => r.fileId))
      : of(null as string | null);

    upload$
      .pipe(
        switchMap((cvDocumentId) => {
          const payload: ReferralCreatePayload = cvDocumentId
            ? { ...basePayload, cvDocumentId }
            : basePayload;
          return this.referralsAdapter.createReferral(payload);
        }),
      )
      .subscribe({
      next: (created) => {
        const targetJob = this.jobs().find((j) => j.id === val.targetJobId);
        const newRef: Referral = {
          id: String((created as { id?: string }).id ?? Date.now()),
          candidateName: basePayload.candidateFullName,
          email: basePayload.candidateEmail ?? '',
          job: (created as { jobTitle?: string }).jobTitle ?? targetJob?.title ?? '\u2014',
          status: 'En attente',
          date: new Date().toISOString().substring(0, 10),
        };
        this.myReferrals.update((list) => [newRef, ...list]);
        this.submitting.set(false);
        this.submitted.set(true);
      },
      error: (err: { status?: number; error?: { message?: string; error?: string } }) => {
        this.submitting.set(false);
        const backendMsg = err?.error?.message ?? err?.error?.error;
        let msg: string;
        if (err.status === 409) {
          msg = 'Vous avez d\u00e9j\u00e0 recommand\u00e9 ce candidat pour cette offre.';
        } else if (err.status === 500) {
          msg = backendMsg
            ? `Erreur serveur\u00a0: ${backendMsg}`
            : 'Erreur interne du serveur. Contactez un administrateur si le probl\u00e8me persiste.';
        } else {
          msg = backendMsg ?? "Une erreur est survenue lors de l'envoi de la cooptation.";
        }
        console.error('[Cooptation] Erreur:', err.status, err.error);
        this.toast.open(msg, 'Fermer', { duration: 5000 });
      },
    });
  }

  protected resetForm(): void {
    this.form.reset();
    this.cvFile.set(null);
    this.cvFileObject.set(null);
    this.submitted.set(false);
  }

  protected statusBg(status: string): string {
    const map: Record<string, string> = {
      'En attente': 'rgba(245,158,11,0.12)',
      'En cours': 'rgba(59,130,246,0.12)',
      Recruté: 'rgba(34,197,94,0.12)',
      Refusé: 'rgba(239,68,68,0.12)',
    };
    return map[status] ?? 'transparent';
  }

  protected statusColor(status: string): string {
    return STATUS_COLORS[status] ?? 'inherit';
  }
}
