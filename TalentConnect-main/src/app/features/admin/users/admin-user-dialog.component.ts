import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { UserProfile } from '../../../data-access/models/portal.models';

@Component({
  selector: 'app-admin-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>{{ isEdit ? "Modifier l'utilisateur" : 'Nouvel utilisateur' }}</h2>
      <button mat-icon-button type="button" mat-dialog-close aria-label="Fermer">
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <div class="form-row">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="firstName" placeholder="Marie" />
            @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
              <mat-error>Requis</mat-error>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="lastName" placeholder="Martin" />
            @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
              <mat-error>Requis</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" subscriptSizing="dynamic">
          <mat-label>Adresse e-mail</mat-label>
          <mat-icon matPrefix>alternate_email</mat-icon>
          <input
            matInput
            formControlName="email"
            type="email"
            placeholder="marie.martin@domaine.fr"
          />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <mat-error>E-mail invalide</mat-error>
          }
        </mat-form-field>

        @if (!isEdit) {
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Mot de passe initial</mat-label>
            <mat-icon matPrefix>lock</mat-icon>
            <input
              matInput
              formControlName="password"
              type="password"
              placeholder="MotDePasse@123"
            />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <mat-error>Minimum 8 caracteres</mat-error>
            }
          </mat-form-field>
        }

        <div class="form-row">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Rôle</mat-label>
            <mat-select formControlName="role">
              <mat-option value="EMPLOYEE">Collaborateur</mat-option>
              <mat-option value="HR">Ressources humaines</mat-option>
              <mat-option value="ADMIN">Administrateur</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Département</mat-label>
            <input matInput formControlName="department" placeholder="Digital Factory" />
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Poste</mat-label>
            <input matInput formControlName="title" placeholder="Chef de projet" />
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Site</mat-label>
            <input matInput formControlName="location" placeholder="Paris" />
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-stroked-button type="button" mat-dialog-close>Annuler</button>
      <button mat-flat-button type="button" class="btn-save" (click)="save()">
        <mat-icon>{{ isEdit ? 'save' : 'person_add' }}</mat-icon>
        {{ isEdit ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px 0;
      }
      h2[mat-dialog-title] {
        font-size: 1.1rem;
        font-weight: 700;
        margin: 0;
      }
      mat-dialog-content {
        padding: 16px 20px;
      }
      .dialog-form {
        display: grid;
        gap: 14px;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      mat-dialog-actions {
        padding: 8px 20px 16px;
        gap: 8px;
      }
      .btn-save {
        background: var(--brand-500) !important;
        color: #fff !important;
        border-radius: 10px !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly ref = inject(MatDialogRef<AdminUserDialogComponent>);
  protected readonly data: UserProfile | null = inject(MAT_DIALOG_DATA);
  protected readonly isEdit = !!this.data;

  protected readonly form = this.fb.nonNullable.group({
    firstName: [this.data?.firstName ?? '', Validators.required],
    lastName: [this.data?.lastName ?? '', Validators.required],
    email: [this.data?.email ?? '', [Validators.required, Validators.email]],
    password: ['', this.isEdit ? [] : [Validators.required, Validators.minLength(8)]],
    role: [this.data?.role ?? 'EMPLOYEE', Validators.required],
    department: [this.data?.department ?? ''],
    title: [this.data?.title ?? ''],
    location: [this.data?.location ?? ''],
  });

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const val = this.form.getRawValue();
    this.ref.close({
      ...this.data,
      ...val,
      id: this.data?.id ?? '',
      employeeId: this.data?.employeeId ?? '',
      skills: this.data?.skills ?? [],
      experienceYears: this.data?.experienceYears ?? 0,
      languages: this.data?.languages ?? ['fr'],
    } as UserProfile);
  }
}
