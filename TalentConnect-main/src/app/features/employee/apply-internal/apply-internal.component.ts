import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  computed,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, of, catchError } from 'rxjs';
import { JobsAdapter } from '../../../data-access/api/adapters/jobs.adapter';
import { ApplicationsAdapter } from '../../../data-access/api/adapters/applications.adapter';
import { FileService } from '../../../core/services/file.service';
import { FileUploadResponse } from '../../../core/api/models/backend-api-models';
import { Observable } from 'rxjs';
import { JobOffer } from '../../../data-access/models/portal.models';

@Component({
  selector: 'app-apply-internal',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatStepperModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  styleUrls: ['./apply-internal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="apply-wrap">
      <!-- Back nav -->
      <a mat-button routerLink="/app/employee/jobs" class="back-link">
        <mat-icon>arrow_back</mat-icon> Retour aux offres
      </a>

      @if (submitted()) {
        <!-- Success state -->
        <div class="success-card">
          <div class="success-icon-wrap">
            <mat-icon class="success-icon">check_circle</mat-icon>
          </div>
          <h2>Candidature envoyée !</h2>
          <p>
            Votre dossier a bien été transmis au service RH. Vous serez informé(e) de la suite par
            notification.
          </p>
          <div class="success-actions">
            <a mat-flat-button class="btn-primary" routerLink="/app/employee/applications">
              <mat-icon>list_alt</mat-icon> Voir mes candidatures
            </a>
            <a mat-stroked-button routerLink="/app/employee/jobs">
              <mat-icon>travel_explore</mat-icon> Explorer d'autres offres
            </a>
          </div>
        </div>
      } @else {
        <!-- Job banner -->
        @if (job()) {
          <div class="job-banner">
            <div class="job-banner-left">
              <div class="job-icon-wrap"><mat-icon>work</mat-icon></div>
              <div>
                <h3>{{ job()!.title }}</h3>
                <p>{{ job()!.department }} · {{ job()!.location }} · {{ job()!.employmentType }}</p>
              </div>
            </div>
            @if (job()!.recommendedScore) {
              <div class="score-badge" [class.high]="job()!.recommendedScore! >= 80">
                <mat-icon>insights</mat-icon>
                {{ job()!.recommendedScore }}% match
              </div>
            }
          </div>
        }

        <!-- Stepper form -->
        <mat-stepper [linear]="true" class="apply-stepper" #stepper>
          <!-- Step 1: Motivations -->
          <mat-step [stepControl]="step1" label="Motivations">
            <form [formGroup]="step1" class="step-form">
              <h3 class="step-title"><mat-icon>lightbulb</mat-icon> Lettre de motivation</h3>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Pourquoi postulez-vous à ce poste ?</mat-label>
                <textarea
                  matInput
                  formControlName="motivation"
                  rows="5"
                  placeholder="Décrivez vos motivations, votre intérêt pour ce poste et ce que vous pouvez apporter…"
                ></textarea>
                <mat-hint align="end"
                  >{{ step1.get('motivation')?.value?.length || 0 }}/2000</mat-hint
                >
                <mat-error>Ce champ est obligatoire (min. 100 caractères)</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Expériences clés en lien avec ce poste</mat-label>
                <textarea
                  matInput
                  formControlName="experience"
                  rows="4"
                  placeholder="Listez vos expériences et compétences les plus pertinentes pour ce rôle…"
                ></textarea>
                <mat-error>Ce champ est obligatoire</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Disponibilité souhaitée</mat-label>
                <input matInput type="date" formControlName="availability" />
                <mat-error>Date invalide</mat-error>
              </mat-form-field>

              <div class="step-actions">
                <button
                  mat-flat-button
                  class="btn-primary"
                  matStepperNext
                  type="button"
                  [disabled]="step1.invalid"
                >
                  Suivant <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 2: Documents -->
          <mat-step [stepControl]="step2" label="Documents">
            <form [formGroup]="step2" class="step-form">
              <h3 class="step-title"><mat-icon>attach_file</mat-icon> Documents à joindre</h3>

              <div class="upload-zone" (click)="triggerCvInput()">
                <input
                  #cvInput
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style="display:none"
                  (change)="onCvSelected($event)"
                />
                <mat-icon class="upload-icon">cloud_upload</mat-icon>
                @if (cvFileName()) {
                  <p class="upload-label">
                    <mat-icon style="vertical-align:middle;font-size:18px;">description</mat-icon>
                    {{ cvFileName() }}
                  </p>
                  <span class="upload-hint">Cliquer pour remplacer</span>
                } @else {
                  <p class="upload-label">Déposer votre CV ici</p>
                  <span class="upload-hint">PDF, DOCX · Max 5 Mo</span>
                }
              </div>

              <mat-form-field appearance="outline" class="full-width" style="margin-top:16px">
                <mat-label>Lien LinkedIn (optionnel)</mat-label>
                <mat-icon matPrefix>link</mat-icon>
                <input
                  matInput
                  formControlName="linkedin"
                  placeholder="https://linkedin.com/in/…"
                />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Portfolio / GitHub (optionnel)</mat-label>
                <mat-icon matPrefix>code</mat-icon>
                <input matInput formControlName="portfolio" placeholder="https://…" />
              </mat-form-field>

              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious type="button">
                  <mat-icon>arrow_back</mat-icon> Précédent
                </button>
                <button mat-flat-button class="btn-primary" matStepperNext type="button">
                  Suivant <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-step>

          <!-- Step 3: Confirmation -->
          <mat-step label="Confirmation">
            <div class="step-form">
              <h3 class="step-title"><mat-icon>fact_check</mat-icon> Récapitulatif</h3>

              <div class="recap-grid">
                <div class="recap-item">
                  <span class="recap-label">Poste visé</span>
                  <span class="recap-value">{{ job()?.title ?? '—' }}</span>
                </div>
                <div class="recap-item">
                  <span class="recap-label">Département</span>
                  <span class="recap-value">{{ job()?.department ?? '—' }}</span>
                </div>
                <div class="recap-item">
                  <span class="recap-label">Disponibilité</span>
                  <span class="recap-value">{{
                    step1.get('availability')?.value | date: 'dd MMM yyyy'
                  }}</span>
                </div>
                <div class="recap-item">
                  <span class="recap-label">CV joint</span>
                  <span class="recap-value">{{ cvFileName() || 'Non joint' }}</span>
                </div>
              </div>

              <div class="recap-motivation">
                <span class="recap-label">Motivation</span>
                <p>{{ step1.get('motivation')?.value }}</p>
              </div>

              <div class="consent-wrap">
                <mat-checkbox [formControl]="consentCtrl" color="primary">
                  Je certifie l'exactitude des informations fournies et consens au traitement de mes
                  données personnelles dans le cadre de ce recrutement.
                </mat-checkbox>
              </div>

              <div class="step-actions">
                <button mat-stroked-button matStepperPrevious type="button">
                  <mat-icon>arrow_back</mat-icon> Précédent
                </button>
                <button
                  mat-flat-button
                  class="btn-submit"
                  type="button"
                  [disabled]="!consentCtrl.value || submitting()"
                  (click)="submit()"
                >
                  @if (submitting()) {
                    <mat-spinner diameter="20" color="accent"></mat-spinner>
                  } @else {
                    <ng-container><mat-icon>send</mat-icon> Soumettre ma candidature</ng-container>
                  }
                </button>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      }
    </div>
  `,
})
export class ApplyInternalComponent implements OnInit {
  @ViewChild('cvInput') cvInput!: ElementRef<HTMLInputElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly jobsAdapter = inject(JobsAdapter);
  private readonly applicationsAdapter = inject(ApplicationsAdapter);
  private readonly fileService = inject(FileService);

  protected readonly job = signal<JobOffer | null>(null);
  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly cvFileName = signal<string | null>(null);
  private readonly cvFileObj = signal<File | null>(null);
  private readonly routeJobId = signal<string | null>(null);

  readonly step1 = this.fb.group({
    motivation: ['', [Validators.required, Validators.minLength(100)]],
    experience: ['', Validators.required],
    availability: [new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10)],
  });

  readonly step2 = this.fb.group({
    linkedin: [''],
    portfolio: [''],
  });

  readonly consentCtrl = this.fb.control(false);

  ngOnInit(): void {
    const jobId =
      this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.queryParamMap.get('jobId');
    this.routeJobId.set(jobId);
    if (jobId) {
      this.jobsAdapter.getJobById(jobId).subscribe((found) => {
        this.job.set(found ?? null);
      });
    }
  }

  protected triggerCvInput(): void {
    this.cvInput?.nativeElement.click();
  }

  protected onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.cvFileName.set(file.name);
      this.cvFileObj.set(file);
      this.toast.open('CV joint : ' + file.name, '', { duration: 2000 });
    }
  }

  protected submit(): void {
    const j = this.job();
    if (!j) return;

    // Use UUID (or numeric) job ID from route param or loaded job object
    const jobId = this.routeJobId() ?? j.id;
    if (!jobId) {
      this.toast.open(
        "Offre introuvable. Retournez \u00e0 la liste et r\u00e9essayez.",
        'Fermer',
        { duration: 5000 },
      );
      return;
    }

    this.submitting.set(true);

    const cvFile = this.cvFileObj();
    const userRaw = localStorage.getItem('tc_user');
    const user = userRaw ? (JSON.parse(userRaw) as { id?: number; role?: string }) : null;
    const userId = Number(user?.id ?? 0);
    let role = user?.role ?? 'EMPLOYEE';
    if (role === 'EMPLOYE') role = 'EMPLOYEE';

    // 1. Upload CV if provided (POST /api/files/upload).
    // L'échec de l'upload ne doit pas bloquer la candidature : on continue sans CV.
    let cvUploadFailed = false;
    const upload$: Observable<FileUploadResponse | null> = cvFile
      ? this.fileService.upload(cvFile, userId, role).pipe(
          catchError(() => {
            cvUploadFailed = true;
            return of(null);
          }),
        )
      : of(null);

    upload$
      .pipe(
        // 2. Submit application (POST /api/candidatures)
        switchMap((uploadResult) =>
          this.applicationsAdapter.apply(jobId).pipe(
            // 3. Attach CV to candidature if upload succeeded (PATCH /api/candidatures/{id}/cv)
            switchMap((candidature) => {
              if (uploadResult?.fileId) {
                return this.applicationsAdapter
                  .attachCv(candidature.id, uploadResult.fileId)
                  .pipe(
                    map(() => candidature),
                    catchError(() => {
                      cvUploadFailed = true;
                      return of(candidature);
                    }),
                  );
              }
              return of(candidature);
            }),
          ),
        ),
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.submitted.set(true);
          if (cvFile && cvUploadFailed) {
            this.toast.open(
              'Candidature envoyée, mais le CV n\u2019a pas pu être joint. Vous pourrez le rattacher plus tard.',
              'Fermer',
              { duration: 6000 },
            );
          }
        },
        error: (err: { status?: number }) => {
          this.submitting.set(false);
          const msg =
            err.status === 409
              ? 'Vous avez déjà postulé à cette offre.'
              : "Une erreur est survenue lors de l'envoi de votre candidature.";
          this.toast.open(msg, 'Fermer', { duration: 4000 });
        },
      });
  }
}
