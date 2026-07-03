import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastService } from '../../../shared/services/toast.service';
import { ApplicationRecord, ApplicationStatus } from '../../../data-access/models/portal.models';
import { ApplicationsAdapter } from '../../../data-access/api/adapters/applications.adapter';
import { FileService } from '../../../core/services/file.service';

const STATUS_FLOW: ApplicationStatus[] = ['SUBMITTED', 'REVIEW', 'INTERVIEW', 'OFFER', 'HIRED'];
const STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Soumise',
  REVIEW: 'En cours',
  INTERVIEW: 'Entretien',
  OFFER: 'Offre',
  HIRED: 'Recrutée',
  REJECTED: 'Refusée',
};

@Component({
  selector: 'app-hr-candidate-detail-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="dialog-header">
      <div class="header-left">
        <div class="cand-avatar">{{ candidate.candidateName.charAt(0) }}</div>
        <div>
          <h2 mat-dialog-title>{{ candidate.candidateName }}</h2>
          <span class="source-badge" [class]="'src-' + candidate.source.toLowerCase()">
            {{ candidate.source === 'INTERNAL' ? 'Mobilité interne' : 'Cooptation' }}
          </span>
        </div>
      </div>
      <button mat-icon-button type="button" mat-dialog-close><mat-icon>close</mat-icon></button>
    </div>

    <mat-dialog-content class="dialog-content">
      <mat-tab-group animationDuration="200ms">
        <!-- Dossier tab -->
        <mat-tab label="Dossier">
          <div class="tab-body">
            <!-- Status pipeline -->
            <div class="pipeline-wrap">
              @for (s of statusFlow; track s; let i = $index) {
                <div
                  class="pipe-step"
                  [class.active]="candidate.status === s"
                  [class.done]="isDone(s)"
                >
                  <div class="pipe-dot">
                    <mat-icon class="pipe-icon">{{ getStatusIcon(s) }}</mat-icon>
                  </div>
                  <span class="pipe-label">{{ statusLabel(s) }}</span>
                </div>
                @if (i < statusFlow.length - 1) {
                  <div class="pipe-line" [class.done]="isDone(s)"></div>
                }
              }
            </div>

            <!-- Details grid -->
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Score</span>
                <span class="score-value" [class.high]="candidate.score >= 80">
                  <mat-icon>insights</mat-icon> {{ candidate.score }}%
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Candidature</span>
                <span>{{ candidate.createdAt | date: 'dd MMM yyyy' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Mise à jour</span>
                <span>{{ candidate.updatedAt | date: 'dd MMM yyyy' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Source</span>
                <span>{{ candidate.source }}</span>
              </div>
            </div>

            @if (candidate.notes) {
              <div class="notes-box">
                <mat-icon>sticky_note_2</mat-icon>
                <p>{{ candidate.notes }}</p>
              </div>
            }

            <!-- Documents -->
            @if (candidate.documents.length) {
              <div>
                <h4 class="section-title"><mat-icon>attach_file</mat-icon> Documents</h4>
                <div class="docs-list">
                  @for (doc of candidate.documents; track doc.id) {
                    <div class="doc-row">
                      <mat-icon class="doc-icon">description</mat-icon>
                      <span class="doc-name">{{ doc.fileName }}</span>
                      <span class="doc-status" [class]="'scan-' + doc.scanStatus.toLowerCase()">
                        {{ doc.scanStatus === 'SAFE' ? '✓ Sécurisé' : doc.scanStatus }}
                      </span>
                      <button mat-icon-button type="button" matTooltip="Télécharger">
                        <mat-icon>download</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Changer statut tab -->
        <mat-tab label="Avancement">
          <div class="tab-body">
            <h4 class="section-title"><mat-icon>swap_horiz</mat-icon> Changer le statut</h4>
            <form [formGroup]="statusForm" class="status-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nouveau statut</mat-label>
                <mat-select formControlName="status">
                  <mat-option value="SUBMITTED">Soumise</mat-option>
                  <mat-option value="REVIEW">En cours</mat-option>
                  <mat-option value="INTERVIEW">Entretien</mat-option>
                  <mat-option value="OFFER">Offre</mat-option>
                  <mat-option value="HIRED">Recrutée</mat-option>
                  <mat-option value="REJECTED">Refusée</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Note interne</mat-label>
                <textarea
                  matInput
                  formControlName="note"
                  rows="3"
                  placeholder="Commentaire visible uniquement par l'équipe RH…"
                ></textarea>
              </mat-form-field>

              <button
                mat-flat-button
                class="btn-update"
                type="button"
                (click)="updateStatus()"
                [disabled]="statusForm.invalid || saving()"
              >
                @if (saving()) {
                  <mat-spinner diameter="18" color="accent"></mat-spinner>
                } @else {
                  <span><mat-icon>save</mat-icon> Mettre à jour</span>
                }
              </button>
            </form>
          </div>
        </mat-tab>

        <!-- Planifier entretien -->
        <mat-tab label="Entretien">
          <div class="tab-body">
            <h4 class="section-title"><mat-icon>event</mat-icon> Planifier un entretien</h4>
            <form [formGroup]="interviewForm" class="status-form">
              <div class="field-row">
                <mat-form-field appearance="outline">
                  <mat-label>Date</mat-label>
                  <input matInput type="date" formControlName="date" />
                  <mat-error>Date requise</mat-error>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Heure</mat-label>
                  <input matInput type="time" formControlName="time" />
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Type d'entretien</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="phone">Téléphonique</mat-option>
                  <mat-option value="visio">Visioconférence</mat-option>
                  <mat-option value="onsite">Présentiel</mat-option>
                  <mat-option value="technical">Test technique</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Intervieweur(s)</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input
                  matInput
                  formControlName="interviewers"
                  placeholder="Sophie Martin, Jean Dupont"
                />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Lieu / Lien visio</mat-label>
                <mat-icon matPrefix>link</mat-icon>
                <input
                  matInput
                  formControlName="location"
                  placeholder="Salle A3 ou https://meet.google.com/…"
                />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes de préparation</mat-label>
                <textarea
                  matInput
                  formControlName="notes"
                  rows="2"
                  placeholder="Points à aborder, documents à apporter…"
                ></textarea>
              </mat-form-field>

              <button
                mat-flat-button
                class="btn-update"
                type="button"
                (click)="scheduleInterview()"
                [disabled]="interviewForm.invalid"
              >
                <mat-icon>event_available</mat-icon> Confirmer l'entretien
              </button>
            </form>

            @if (scheduledInterviews().length) {
              <mat-divider style="margin: 16px 0;"></mat-divider>
              <h4 class="section-title"><mat-icon>event_note</mat-icon> Entretiens planifiés</h4>
              <div class="interview-list">
                @for (iv of scheduledInterviews(); track iv.id) {
                  <div class="iv-row">
                    <mat-icon class="iv-icon">{{ typeIcon(iv.type) }}</mat-icon>
                    <div class="iv-info">
                      <span class="iv-date">{{ iv.date }} à {{ iv.time }}</span>
                      <span class="iv-meta">{{ typeLabel(iv.type) }} · {{ iv.interviewers }}</span>
                    </div>
                    <span class="iv-status">Confirmé</span>
                  </div>
                }
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-stroked-button type="button" mat-dialog-close>Fermer</button>
      <button mat-flat-button class="btn-dl" type="button" (click)="downloadCv()">
        <mat-icon>download</mat-icon> Télécharger CV
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px 0;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .cand-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--brand-100);
        color: var(--brand-700);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      h2[mat-dialog-title] {
        margin: 0 0 4px;
        font-size: 1.05rem;
      }
      .source-badge {
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
      }
      .src-internal {
        background: rgba(59, 130, 246, 0.12);
        color: #3b82f6;
      }
      .src-referral {
        background: rgba(139, 92, 246, 0.12);
        color: #8b5cf6;
      }

      .dialog-content {
        padding: 8px 20px;
        min-width: min(580px, 92vw);
        max-height: 68vh;
      }
      .tab-body {
        display: grid;
        gap: 16px;
        padding: 16px 0;
      }

      /* Pipeline */
      .pipeline-wrap {
        display: flex;
        align-items: center;
        overflow-x: auto;
        padding: 4px 0;
      }
      .pipe-step {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 64px;
      }
      .pipe-dot {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: var(--surface-highlight);
        border: 2px solid var(--border-subtle);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .pipe-step.done .pipe-dot {
        background: var(--brand-100);
        border-color: var(--brand-400);
      }
      .pipe-step.active .pipe-dot {
        background: var(--brand-600);
        border-color: var(--brand-600);
      }
      .pipe-step.active .pipe-dot .pipe-icon {
        color: #fff;
      }
      .pipe-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        color: var(--text-soft);
      }
      .pipe-step.done .pipe-icon {
        color: var(--brand-600);
      }
      .pipe-label {
        font-size: 0.65rem;
        text-align: center;
        color: var(--text-soft);
        white-space: nowrap;
      }
      .pipe-step.active .pipe-label {
        color: var(--brand-600);
        font-weight: 600;
      }
      .pipe-line {
        flex: 1;
        height: 2px;
        background: var(--border-subtle);
        min-width: 10px;
      }
      .pipe-line.done {
        background: var(--brand-400);
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .detail-item {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .detail-label {
        font-size: 0.72rem;
        color: var(--text-soft);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .score-value {
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: 700;
        font-size: 0.95rem;
      }
      .score-value.high {
        color: #16a34a;
      }
      .score-value mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      .notes-box {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: rgba(245, 158, 11, 0.08);
        border-radius: var(--radius-lg);
        padding: 12px;
        font-size: 0.85rem;
      }
      .notes-box mat-icon {
        color: #f59e0b;
        flex-shrink: 0;
      }
      .notes-box p {
        margin: 0;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0;
        font-size: 0.9rem;
        font-weight: 600;
      }
      .section-title mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--brand-500);
      }

      .docs-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .doc-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-subtle);
      }
      .doc-icon {
        color: var(--brand-400);
      }
      .doc-name {
        flex: 1;
        font-size: 0.85rem;
      }
      .doc-status {
        font-size: 0.75rem;
        font-weight: 600;
      }
      .scan-safe {
        color: #22c55e;
      }
      .scan-pending {
        color: #f59e0b;
      }
      .scan-failed {
        color: #ef4444;
      }

      /* Forms */
      .status-form {
        display: grid;
        gap: 12px;
      }
      .full-width {
        width: 100%;
      }
      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .btn-update {
        background: var(--brand-600) !important;
        color: #fff !important;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* Interview list */
      .interview-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .iv-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        border-radius: var(--radius-lg);
        background: var(--surface-highlight);
      }
      .iv-icon {
        color: var(--brand-500);
      }
      .iv-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .iv-date {
        font-size: 0.88rem;
        font-weight: 600;
      }
      .iv-meta {
        font-size: 0.75rem;
        color: var(--text-soft);
      }
      .iv-status {
        font-size: 0.72rem;
        color: #22c55e;
        font-weight: 600;
        background: rgba(34, 197, 94, 0.1);
        padding: 2px 8px;
        border-radius: 999px;
      }

      .dialog-actions {
        padding: 12px 20px 16px;
        gap: 10px;
      }
      .btn-dl {
        background: var(--brand-600) !important;
        color: #fff !important;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    `,
  ],
})
export class HrCandidateDetailDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly dialogRef = inject(MatDialogRef<HrCandidateDetailDialogComponent>);
  private readonly applicationsAdapter = inject(ApplicationsAdapter);
  private readonly fileService = inject(FileService);
  readonly candidate: ApplicationRecord = inject(MAT_DIALOG_DATA);

  protected readonly statusFlow = STATUS_FLOW;
  protected readonly scheduledInterviews = signal<any[]>([]);
  protected readonly saving = signal(false);

  readonly statusForm = this.fb.group({
    status: [this.candidate.status, Validators.required],
    note: [''],
  });

  readonly interviewForm = this.fb.group({
    date: ['', Validators.required],
    time: ['09:00'],
    type: ['visio'],
    interviewers: [''],
    location: [''],
    notes: [''],
  });

  protected isDone(s: ApplicationStatus): boolean {
    const order: Record<string, number> = {
      SUBMITTED: 0,
      REVIEW: 1,
      INTERVIEW: 2,
      OFFER: 3,
      HIRED: 4,
    };
    return order[this.candidate.status] >= order[s];
  }

  protected statusLabel(s: string): string {
    return STATUS_LABELS[s] ?? s;
  }

  protected getStatusIcon(s: string): string {
    const map: Record<string, string> = {
      SUBMITTED: 'send',
      REVIEW: 'pageview',
      INTERVIEW: 'record_voice_over',
      OFFER: 'volunteer_activism',
      HIRED: 'emoji_events',
    };
    return map[s] ?? 'radio_button_unchecked';
  }

  protected updateStatus(): void {
    const val = this.statusForm.getRawValue();
    this.saving.set(true);
    this.applicationsAdapter
      .patchStatus(this.candidate.id, val.status as ApplicationStatus)
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.toast.open(`Statut mis \u00e0 jour\u00a0: ${this.statusLabel(val.status!)}`, '', {
            duration: 2500,
          });
          this.dialogRef.close({
            updated: true,
            candidate: { ...this.candidate, status: updated.status },
          });
        },
        error: () => {
          this.saving.set(false);
          this.toast.open(
            'Impossible de mettre \u00e0 jour le statut. V\u00e9rifiez votre connexion.',
            'Fermer',
            { duration: 4000 },
          );
        },
      });
  }

  protected scheduleInterview(): void {
    if (this.interviewForm.invalid) return;
    const val = this.interviewForm.getRawValue();
    this.scheduledInterviews.update((list) => [...list, { id: Date.now().toString(), ...val }]);
    this.toast.open('Entretien planifié avec succès', '', { duration: 2500 });
    this.interviewForm.reset({ time: '09:00', type: 'visio' });
  }

  protected downloadCv(): void {
    const cvFileId = this.candidate.cvFileId;
    if (!cvFileId) {
      this.toast.open('Aucun CV disponible pour ce candidat', 'Fermer', { duration: 3000 });
      return;
    }
    this.fileService.download(cvFileId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-${this.candidate.candidateName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.toast.open('CV t\u00e9l\u00e9charg\u00e9', '', { duration: 2000 });
      },
      error: () => {
        this.toast.open('Impossible de t\u00e9l\u00e9charger le CV', 'Fermer', { duration: 4000 });
      },
    });
  }

  protected typeIcon(type: string): string {
    const m: Record<string, string> = {
      phone: 'phone',
      visio: 'videocam',
      onsite: 'business',
      technical: 'code',
    };
    return m[type] ?? 'event';
  }

  protected typeLabel(type: string): string {
    const m: Record<string, string> = {
      phone: 'Téléphonique',
      visio: 'Visio',
      onsite: 'Présentiel',
      technical: 'Technique',
    };
    return m[type] ?? type;
  }
}
