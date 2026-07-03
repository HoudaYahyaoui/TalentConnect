import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { JobOffer } from '../../../data-access/models/portal.models';

export interface HrJobDialogData {
  job?: Partial<JobOffer>;
}

@Component({
  selector: 'app-hr-job-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>{{ dialogTitle }}</h2>
      <button mat-icon-button type="button" mat-dialog-close><mat-icon>close</mat-icon></button>
    </div>

    <mat-dialog-content class="dialog-content">
      <form [formGroup]="form" class="job-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Titre du poste</mat-label>
          <mat-icon matPrefix>work</mat-icon>
          <input matInput formControlName="title" placeholder="Ex : Lead Developer Angular" />
          <mat-error>Titre obligatoire</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Département</mat-label>
            <mat-icon matPrefix>domain</mat-icon>
            <mat-select formControlName="department">
              <mat-option value="Digital Factory">Digital Factory</mat-option>
              <mat-option value="Finance">Finance</mat-option>
              <mat-option value="Marketing">Marketing</mat-option>
              <mat-option value="RH">Ressources Humaines</mat-option>
              <mat-option value="IT">IT / Infrastructure</mat-option>
              <mat-option value="Data">Data & IA</mat-option>
              <mat-option value="Consulting">Consulting</mat-option>
              <mat-option value="Legal">Juridique</mat-option>
            </mat-select>
            <mat-error>Requis</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Localisation</mat-label>
            <mat-icon matPrefix>location_on</mat-icon>
            <input matInput formControlName="location" placeholder="Paris, Lyon…" />
            <mat-error>Requis</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Type de contrat</mat-label>
            <mat-select formControlName="employmentType">
              <mat-option value="CDI">CDI</mat-option>
              <mat-option value="CDD">CDD</mat-option>
              <mat-option value="Stage">Stage</mat-option>
              <mat-option value="Freelance">Freelance</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Niveau d'expérience</mat-label>
            <mat-select formControlName="seniority">
              <mat-option value="Junior">Junior (0–3 ans)</mat-option>
              <mat-option value="Confirmé">Confirmé (3–7 ans)</mat-option>
              <mat-option value="Senior">Senior (7+ ans)</mat-option>
              <mat-option value="Lead">Lead / Expert</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Statut</mat-label>
          <mat-select formControlName="status">
            <mat-option value="DRAFT">Brouillon</mat-option>
            <mat-option value="OPEN">Publié</mat-option>
            <mat-option value="CLOSED">Fermé</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-divider></mat-divider>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description du poste</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="4"
            placeholder="Décrivez la mission, les responsabilités, le contexte de l'équipe…"
          ></textarea>
          <mat-hint align="end">{{ form.get('description')?.value?.length || 0 }}/2000</mat-hint>
          @if (form.get('description')?.hasError('required')) {
            <mat-error>Description obligatoire</mat-error>
          } @else if (form.get('description')?.hasError('minlength')) {
            <mat-error>Minimum 20 caractères requis</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Prérequis (une ligne par prérequis)</mat-label>
          <textarea
            matInput
            formControlName="requirementsText"
            rows="3"
            placeholder="5 ans d'expérience Angular&#10;Maîtrise de TypeScript&#10;Connaissance des APIs REST"
          ></textarea>
          <mat-hint>Séparez chaque prérequis par une nouvelle ligne</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tags (virgules)</mat-label>
          <mat-icon matPrefix>label</mat-icon>
          <input matInput formControlName="tagsText" placeholder="Angular, TypeScript, RxJS" />
          <mat-hint>Séparés par des virgules</mat-hint>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Date de publication</mat-label>
            <input matInput type="date" formControlName="publishedAt" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Date de clôture</mat-label>
            <input matInput type="date" formControlName="closingAt" />
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Responsable du recrutement</mat-label>
          <mat-icon matPrefix>person</mat-icon>
          <input matInput formControlName="hiringManager" placeholder="Prénom Nom" />
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-stroked-button type="button" mat-dialog-close>Annuler</button>
      <button
        mat-flat-button
        class="btn-save"
        type="button"
        [disabled]="form.invalid"
        (click)="save()"
      >
        <mat-icon>{{ isEdit ? 'save' : 'add' }}</mat-icon>
        {{ submitLabel }}
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
      .dialog-header h2 {
        margin: 0;
        font-size: 1.1rem;
      }
      .dialog-content {
        padding: 16px 20px;
        min-width: min(560px, 90vw);
        max-height: 70vh;
      }
      .job-form {
        display: grid;
        gap: 14px;
      }
      .full-width {
        width: 100%;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      @media (max-width: 480px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }
      .dialog-actions {
        padding: 12px 20px 16px;
        gap: 10px;
      }
      .btn-save {
        background: var(--brand-600) !important;
        color: #fff !important;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    `,
  ],
})
export class HrJobDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<HrJobDialogComponent>);
  private readonly data: HrJobDialogData = inject(MAT_DIALOG_DATA) ?? {};

  protected readonly isEdit = !!this.data.job?.id;

  get dialogTitle(): string {
    return this.isEdit ? "Modifier l'offre" : 'Cr\u00e9er une offre';
  }

  get submitLabel(): string {
    return this.isEdit ? 'Enregistrer' : "Cr\u00e9er l'offre";
  }

  // Helper to convert ISO date to yyyy-MM-dd format for date input
  private toDateInputValue(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    // If already in yyyy-MM-dd format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Convert ISO to yyyy-MM-dd
    // Use string manipulation to avoid timezone issues
    try {
      const isoString = dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00Z`;
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';
      // Extract local date without UTC conversion
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  }

  readonly form = this.fb.group({
    title: [this.data.job?.title ?? '', Validators.required],
    department: [this.data.job?.department ?? '', Validators.required],
    location: [this.data.job?.location ?? '', Validators.required],
    employmentType: [this.data.job?.employmentType ?? 'CDI'],
    seniority: [this.data.job?.seniority ?? 'Confirmé'],
    status: [this.data.job?.status ?? 'DRAFT'],
    description: [
      this.data.job?.description ?? '',
      [Validators.required, Validators.minLength(20)],
    ],
    requirementsText: [this.data.job?.requirements?.join('\n') ?? ''],
    tagsText: [this.data.job?.tags?.join(', ') ?? ''],
    publishedAt: [this.toDateInputValue(this.data.job?.publishedAt) || new Date().toISOString().substring(0, 10)],
    closingAt: [this.toDateInputValue(this.data.job?.closingAt) ?? ''],
    hiringManager: [this.data.job?.hiringManager ?? ''],
  });

   protected save(): void {
     if (this.form.invalid) return;
     const val = this.form.getRawValue();
     // Convert date strings to ISO format for backend compatibility
     // Returns undefined if empty, ISO string if valid
     const toISODate = (dateStr: string | null | undefined): string | undefined => {
       if (!dateStr) return undefined;
       // If already in ISO format, return as-is
       if (dateStr.includes('T')) return dateStr;
       // Convert yyyy-MM-dd to ISO format (UTC)
       // Parse the date string as UTC to avoid timezone issues
       const [year, month, day] = dateStr.split('-').map(Number);
       if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
       const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
       return date.toISOString();
     };
     const job: Partial<JobOffer> = {
       ...this.data.job,
       title: val.title!,
       department: val.department!,
       location: val.location!,
       employmentType: val.employmentType as JobOffer['employmentType'],
       seniority: val.seniority as JobOffer['seniority'],
       status: val.status as JobOffer['status'],
       description: val.description!,
       requirements:
         val.requirementsText
           ?.split('\n')
           .map((s) => s.trim())
           .filter(Boolean) ?? [],
       tags:
         val.tagsText
           ?.split(',')
           .map((s) => s.trim())
           .filter(Boolean) ?? [],
       publishedAt: toISODate(val.publishedAt),
       closingAt: toISODate(val.closingAt),
       hiringManager: val.hiringManager ?? '',
     };
     this.dialogRef.close(job);
   }
}
