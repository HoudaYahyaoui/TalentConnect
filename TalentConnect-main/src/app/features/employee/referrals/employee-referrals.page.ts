import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SkillsCatalogService } from '../../../core/services/skills-catalog.service';
import { ReferralsService } from '../../../core/services/referrals.service';
import { ReferralsAdapter } from '../../../data-access/api/adapters/referrals.adapter';
import { AlertsService } from '../../../core/services/alerts.service';
import { SessionStore } from '../../../core/state/session.store';

@Component({
  selector: 'app-employee-referrals-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page-wrap">
      <header class="page-header">
        <div>
          <p class="eyebrow">Réseau &amp; Cooptation</p>
          <h2>Recommander un profil</h2>
          <p class="header-sub">
            Contribuez à développer les équipes en recommandant des talents de votre réseau.
          </p>
        </div>
        <div class="header-count">
          <span class="count-num">{{ store.count() }}</span>
          <span>cooptation{{ store.count() > 1 ? 's' : '' }}</span>
        </div>
      </header>

      <div class="main-grid">
        <!-- Formulaire -->
        <form class="panel form-card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <h3 class="section-title">
            <mat-icon>person_add</mat-icon>
            Informations du candidat
          </h3>

          <!-- Identité -->
          <div class="field-row">
            <div class="field-wrap">
              <label class="field-lbl">Prénom <span class="req">*</span></label>
              <input
                class="app-input"
                formControlName="firstName"
                placeholder="Prénom"
                [class.invalid]="isInvalid('firstName')"
              />
              @if (isInvalid('firstName')) {
                <span class="field-err">Requis</span>
              }
            </div>
            <div class="field-wrap">
              <label class="field-lbl">Nom <span class="req">*</span></label>
              <input
                class="app-input"
                formControlName="lastName"
                placeholder="Nom"
                [class.invalid]="isInvalid('lastName')"
              />
              @if (isInvalid('lastName')) {
                <span class="field-err">Requis</span>
              }
            </div>
          </div>

          <div class="field-row">
            <div class="field-wrap">
              <label class="field-lbl">Email <span class="req">*</span></label>
              <input
                class="app-input"
                formControlName="email"
                type="email"
                placeholder="prenom.nom@email.fr"
                [class.invalid]="isInvalid('email')"
              />
              @if (isInvalid('email')) {
                <span class="field-err">Email invalide</span>
              }
            </div>
            <div class="field-wrap">
              <label class="field-lbl">Téléphone</label>
              <input class="app-input" formControlName="phone" placeholder="+33 6 XX XX XX XX" />
            </div>
          </div>

          <div class="section-divider">
            <h3 class="section-title">
              <mat-icon>work_outline</mat-icon>
              Domaine &amp; Compétences
            </h3>
          </div>

          <!-- Domaine -->
          <div class="field-wrap">
            <label class="field-lbl">Domaine d'expertise <span class="req">*</span></label>
            <select
              class="app-input app-select"
              formControlName="domain"
              (change)="onDomainChange()"
              [class.invalid]="isInvalid('domain')"
            >
              <option value="">Choisir un domaine…</option>
              @for (d of catalog.domains; track d) {
                <option [value]="d">{{ d }}</option>
              }
            </select>
            @if (isInvalid('domain')) {
              <span class="field-err">Domaine requis</span>
            }
          </div>

          <!-- Compétences multi-select avec recherche -->
          @if (availableSkills().length) {
            <div class="field-wrap">
              <label class="field-lbl">Compétences <span class="req">*</span></label>
              <div class="skills-search-wrap">
                <input
                  class="app-input skills-search"
                  placeholder="Rechercher une compétence…"
                  [ngModel]="skillSearch()"
                  (ngModelChange)="skillSearch.set($event)"
                  [ngModelOptions]="{ standalone: true }"
                />
                <div class="skills-dropdown" *ngIf="filteredSkills().length">
                  @for (skill of filteredSkills(); track skill) {
                    <button
                      type="button"
                      class="skill-option"
                      [class.selected]="selectedSkills().includes(skill)"
                      (click)="toggleSkill(skill)"
                    >
                      <mat-icon class="skill-check">{{
                        selectedSkills().includes(skill) ? 'check_box' : 'check_box_outline_blank'
                      }}</mat-icon>
                      {{ skill }}
                    </button>
                  }
                </div>
              </div>
              <!-- Selected chips -->
              @if (selectedSkills().length) {
                <div class="selected-chips">
                  @for (s of selectedSkills(); track s) {
                    <span class="skill-chip">
                      {{ s }}
                      <button
                        type="button"
                        class="chip-remove"
                        (click)="removeSkill(s)"
                        aria-label="Retirer"
                      >
                        ×
                      </button>
                    </span>
                  }
                </div>
              }
              @if (form.touched && selectedSkills().length === 0) {
                <span class="field-err">Sélectionnez au moins une compétence</span>
              }
            </div>
          }

          <!-- CV Upload -->
          <div class="section-divider">
            <h3 class="section-title">
              <mat-icon>attach_file</mat-icon>
              CV &amp; Commentaire
            </h3>
          </div>

          <div class="field-wrap">
            <label class="field-lbl">CV (PDF, max 10 Mo)</label>
            <label class="dropzone" [class.has-file]="cvFileName()">
              <input type="file" accept=".pdf,.doc,.docx" (change)="onFile($event)" hidden />
              <mat-icon class="drop-icon">{{
                cvFileName() ? 'description' : 'upload_file'
              }}</mat-icon>
              <span class="drop-text">{{
                cvFileName() || 'Glisser-déposer ou cliquer pour parcourir'
              }}</span>
            </label>
          </div>

          <div class="field-wrap">
            <label class="field-lbl">Commentaire (optionnel)</label>
            <textarea
              class="app-input"
              formControlName="comment"
              rows="3"
              placeholder="Pourquoi recommandez-vous ce profil ?"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" mat-stroked-button class="btn-reset" (click)="reset()">
              Réinitialiser
            </button>
            <button type="submit" class="btn-submit" [disabled]="submitting()">
              @if (submitting()) {
                <span class="btn-spinner"></span>
                Envoi en cours…
              } @else {
                <mat-icon>send</mat-icon>
                Créer la recommandation
              }
            </button>
          </div>
        </form>

        <!-- Liste cooptations -->
        <section class="panel referrals-panel">
          <div class="panel-head">
            <h3>Mes recommandations</h3>
            <span class="count-badge">{{ store.count() }}</span>
          </div>

          @if (store.referrals().length) {
            <div class="referral-list">
              @for (r of store.referrals(); track r.id) {
                <article class="referral-card">
                  <div class="ref-avatar">
                    {{ r.firstName.charAt(0) }}{{ r.lastName.charAt(0) }}
                  </div>
                  <div class="ref-info">
                    <strong>{{ r.firstName }} {{ r.lastName }}</strong>
                    <span class="ref-sub">{{ r.domain }}</span>
                    <div class="ref-skills">
                      @for (sk of r.skills.slice(0, 3); track sk) {
                        <span class="ref-skill-tag">{{ sk }}</span>
                      }
                      @if (r.skills.length > 3) {
                        <span class="ref-skill-more">+{{ r.skills.length - 3 }}</span>
                      }
                    </div>
                  </div>
                  <div class="ref-right">
                    <span
                      class="ref-status"
                      [class]="'status-' + r.status.toLowerCase().replace(' ', '-')"
                      >{{ r.status }}</span
                    >
                    <button
                      mat-icon-button
                      class="ref-remove"
                      (click)="removeRef(r.id)"
                      matTooltip="Supprimer"
                      aria-label="Supprimer"
                    >
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </div>
                </article>
              }
            </div>
          } @else {
            <div class="empty-panel">
              <mat-icon>recommend</mat-icon>
              <p>Aucune cooptation pour l'instant.<br />Recommandez votre premier talent !</p>
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

      /* Header */
      .page-header {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 18px 22px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
      }
      .page-header h2 {
        font-size: 1.15rem;
      }
      .header-sub {
        font-size: 0.8rem;
        color: var(--text-muted);
        margin-top: 4px;
      }
      .header-count {
        text-align: center;
      }
      .count-num {
        display: block;
        font-size: 2rem;
        font-weight: 800;
        color: var(--brand-500);
        line-height: 1;
      }
      .header-count span:last-child {
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      /* Grid */
      .main-grid {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 14px;
        align-items: start;
      }
      .panel {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px;
      }

      /* Section titles */
      .section-title {
        display: flex;
        align-items: center;
        gap: 7px;
        font-size: 0.9rem;
        font-weight: 700;
        margin-bottom: 14px;
      }
      .section-title mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--brand-500);
      }
      .section-divider {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--border-subtle);
      }

      /* Form */
      .form-card {
        display: grid;
        gap: 12px;
      }
      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .field-wrap {
        display: grid;
        gap: 4px;
      }
      .field-lbl {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--text-secondary);
      }
      .req {
        color: var(--danger-500);
      }
      .app-input {
        width: 100%;
        border-radius: 9px;
        border: 1px solid var(--border-base);
        background: var(--surface-muted);
        padding: 8px 11px;
        font-size: 0.85rem;
        color: var(--text-primary);
        outline: none;
        transition: border-color 150ms;
        font-family: inherit;
      }
      .app-input:focus {
        border-color: var(--brand-500);
        box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
      }
      .app-input.invalid {
        border-color: var(--danger-500);
      }
      .app-select {
        cursor: pointer;
      }
      textarea.app-input {
        resize: vertical;
        min-height: 70px;
      }
      .field-err {
        font-size: 0.72rem;
        color: var(--danger-500);
      }

      /* Skills */
      .skills-search-wrap {
        position: relative;
      }
      .skills-dropdown {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        right: 0;
        z-index: 50;
        background: var(--surface-overlay);
        border: 1px solid var(--border-base);
        border-radius: 10px;
        max-height: 200px;
        overflow-y: auto;
        box-shadow: var(--shadow-card);
      }
      .skill-option {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 12px;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 0.83rem;
        color: var(--text-secondary);
        text-align: left;
        transition: background 100ms;
      }
      .skill-option:hover {
        background: var(--surface-highlight);
      }
      .skill-option.selected {
        color: var(--brand-700);
        font-weight: 600;
      }
      .skill-check {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
      }
      .selected-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 8px;
      }
      .skill-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--surface-highlight);
        color: var(--brand-700);
        font-size: 0.75rem;
        font-weight: 600;
      }
      .chip-remove {
        border: none;
        background: transparent;
        cursor: pointer;
        color: inherit;
        font-size: 1rem;
        line-height: 1;
        padding: 0;
        opacity: 0.6;
      }
      .chip-remove:hover {
        opacity: 1;
      }

      /* Dropzone */
      .dropzone {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px;
        border-radius: 10px;
        border: 2px dashed var(--border-base);
        background: var(--surface-muted);
        cursor: pointer;
        transition:
          border-color 150ms,
          background 150ms;
      }
      .dropzone:hover {
        border-color: var(--brand-500);
        background: var(--surface-highlight);
      }
      .dropzone.has-file {
        border-color: var(--success-500);
        background: rgba(34, 197, 94, 0.05);
      }
      .drop-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--text-soft);
      }
      .drop-text {
        font-size: 0.82rem;
        color: var(--text-muted);
      }

      /* Actions */
      .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        padding-top: 4px;
      }
      .btn-reset {
        border-radius: 9px !important;
        font-size: 0.82rem !important;
        height: 36px !important;
      }
      .btn-submit {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 18px;
        border: none;
        border-radius: 9px;
        background: linear-gradient(135deg, var(--brand-600), var(--accent-600));
        color: #fff;
        font-size: 0.82rem;
        font-weight: 600;
        cursor: pointer;
        transition: opacity 150ms;
      }
      .btn-submit:hover:not(:disabled) {
        opacity: 0.9;
      }
      .btn-submit:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
      .btn-submit mat-icon {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
      }
      .btn-spinner {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.4);
        border-top-color: #fff;
        animation: spin 0.7s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Referrals panel */
      .referrals-panel {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .panel-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .panel-head h3 {
        font-size: 0.92rem;
        font-weight: 700;
      }
      .count-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--surface-highlight);
        color: var(--brand-700);
      }
      .referral-list {
        display: grid;
        gap: 8px;
      }
      .referral-card {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid var(--border-subtle);
        background: var(--surface-muted);
      }
      .ref-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--brand-500), var(--accent-500));
        color: #fff;
        font-size: 0.78rem;
        font-weight: 700;
        display: grid;
        place-items: center;
        flex-shrink: 0;
      }
      .ref-info {
        flex: 1;
        min-width: 0;
      }
      .ref-info strong {
        display: block;
        font-size: 0.85rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ref-sub {
        font-size: 0.72rem;
        color: var(--text-muted);
      }
      .ref-skills {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
        margin-top: 4px;
      }
      .ref-skill-tag {
        font-size: 0.65rem;
        padding: 1px 6px;
        border-radius: 999px;
        background: var(--surface-highlight);
        color: var(--brand-700);
      }
      .ref-skill-more {
        font-size: 0.65rem;
        color: var(--text-soft);
      }
      .ref-right {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }
      .ref-status {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        white-space: nowrap;
      }
      .status-soumise {
        background: rgba(245, 158, 11, 0.14);
        color: #b45309;
      }
      .status-en-cours {
        background: rgba(59, 130, 246, 0.14);
        color: #1d4ed8;
      }
      .status-acceptée {
        background: rgba(34, 197, 94, 0.13);
        color: #15803d;
      }
      .status-refusée {
        background: rgba(239, 68, 68, 0.12);
        color: #b91c1c;
      }
      .ref-remove {
        color: var(--text-soft) !important;
        width: 28px !important;
        height: 28px !important;
      }
      .ref-remove mat-icon {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
      }
      .empty-panel {
        text-align: center;
        padding: 28px 16px;
        color: var(--text-muted);
      }
      .empty-panel mat-icon {
        font-size: 36px;
        width: 36px;
        height: 36px;
        opacity: 0.3;
        margin-bottom: 8px;
        display: block;
      }
      .empty-panel p {
        font-size: 0.82rem;
        line-height: 1.6;
      }

      @media (max-width: 900px) {
        .main-grid {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 600px) {
        .field-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeReferralsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly catalog = inject(SkillsCatalogService);
  protected readonly store = inject(ReferralsService);
  private readonly alerts = inject(AlertsService);
  private readonly session = inject(SessionStore);
  private readonly referralsAdapter = inject(ReferralsAdapter);

  protected readonly submitting = signal(false);
  protected readonly cvFileName = signal('');
  protected readonly skillSearch = signal('');
  protected readonly selectedSkills = signal<string[]>([]);

  protected readonly availableSkills = computed(() =>
    this.catalog.getSkillsForDomain(this.form?.get('domain')?.value ?? ''),
  );

  protected readonly filteredSkills = computed(() => {
    const q = this.skillSearch().toLowerCase();
    return q
      ? this.availableSkills().filter((s) => s.toLowerCase().includes(q))
      : this.availableSkills();
  });

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    domain: ['', Validators.required],
    comment: [''],
  });

  protected isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  protected onDomainChange(): void {
    this.selectedSkills.set([]);
    this.skillSearch.set('');
  }

  protected toggleSkill(skill: string): void {
    this.selectedSkills.update((list) =>
      list.includes(skill) ? list.filter((s) => s !== skill) : [...list, skill],
    );
    this.skillSearch.set('');
  }

  protected removeSkill(skill: string): void {
    this.selectedSkills.update((list) => list.filter((s) => s !== skill));
  }

  protected onFile(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.cvFileName.set(file.name);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.selectedSkills().length === 0) return;

    // Validate status is not empty (status set by backend, but we validate form integrity)
    const v = this.form.getRawValue();
    if (!v.firstName || !v.lastName || !v.email || !v.domain) {
      this.toast.open('Tous les champs obligatoires doivent être remplis', 'OK', { duration: 3000 });
      return;
    }

    this.submitting.set(true);

    // Prepare API payload
    const payload: Record<string, unknown> = {
      candidateFullName: `${v.firstName} ${v.lastName}`,
      candidateEmail: v.email,
      candidatePhone: v.phone || '',
      skills: this.selectedSkills(),
    };

    // Call API
    this.referralsAdapter.createReferral(payload as any).subscribe({
      next: (created) => {
        // Also add to local store for immediate display
        this.store.add({
          firstName: v.firstName,
          lastName: v.lastName,
          email: v.email,
          phone: v.phone,
          domain: v.domain,
          skills: this.selectedSkills(),
          cvFileName: this.cvFileName() || undefined,
          comment: v.comment || undefined,
          createdByUserId: this.session.user()?.id,
        });

        this.alerts.push({
          severity: 'success',
          title: 'Recommandation soumise',
          message: `${v.firstName} ${v.lastName} a été recommandé(e) avec succès.`,
          deepLink: '/app/employee/referrals',
        });

        this.toast.open(
          `Recommandation pour ${v.firstName} ${v.lastName} créée avec succès !`,
          'Voir mes candidatures',
          { duration: 5000 },
        );

        this.reset();
        this.submitting.set(false);
      },
      error: (err: any) => {
        this.submitting.set(false);
        console.error('Error creating referral:', err);

        // Handle HTTP 400 error
        if (err.status === 400) {
          const errorMessage = err.error?.message || 'Validation échouée. Veuillez vérifier vos données.';
          this.toast.open(errorMessage, 'OK', { duration: 4000 });
          return;
        }

        // Handle other errors
        const msg = err.status === 403
          ? 'Vous n\'avez pas la permission de créer une recommandation.'
          : 'Impossible de créer la recommandation. Veuillez réessayer.';
        this.toast.open(msg, 'OK', { duration: 4000 });
      },
    });
  }

  protected reset(): void {
    this.form.reset();
    this.selectedSkills.set([]);
    this.cvFileName.set('');
    this.skillSearch.set('');
  }

  protected removeRef(id: string): void {
    this.store.remove(id);
  }
}
