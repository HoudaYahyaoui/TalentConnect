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
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JobsAdapter } from '../../../data-access/api/adapters/jobs.adapter';
import { SessionStore } from '../../../core/state/session.store';
import { UserProfileService, ExtendedProfile } from '../../../core/services/user-profile.service';
import { SkillsCatalogService, SKILL_CATALOG } from '../../../core/services/skills-catalog.service';

@Component({
  selector: 'app-employee-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  template: `
    <div class="page-wrap">
      <!-- View mode -->
      @if (!editing()) {
        <div class="profile-layout">
          <!-- Carte principale -->
          <section class="panel profile-main">
            <div class="profile-top">
              <div class="profile-avatar">{{ initials() }}</div>
              <div class="profile-identity">
                <h2>{{ user()?.firstName }} {{ user()?.lastName }}</h2>
                <p class="profile-title">{{ user()?.title }}</p>
                <p class="profile-meta">{{ user()?.department }} · {{ user()?.location }}</p>
                @if (extProfile()?.bio) {
                  <p class="profile-bio">{{ extProfile()!.bio }}</p>
                }
              </div>
              <button mat-flat-button class="btn-edit" (click)="startEdit()">
                <mat-icon>edit</mat-icon>
                Modifier le profil
              </button>
            </div>

            <!-- Infos de contact -->
            <div class="contact-row">
              <div class="contact-item">
                <mat-icon>alternate_email</mat-icon>
                <span>{{ user()?.email }}</span>
              </div>
              @if (extProfile()?.phone) {
                <div class="contact-item">
                  <mat-icon>phone</mat-icon>
                  <span>{{ extProfile()!.phone }}</span>
                </div>
              }
              @if (extProfile()?.linkedin) {
                <div class="contact-item">
                  <mat-icon>link</mat-icon>
                  <a [href]="extProfile()!.linkedin" target="_blank" rel="noopener">LinkedIn</a>
                </div>
              }
              @if (extProfile()?.github) {
                <div class="contact-item">
                  <mat-icon>code</mat-icon>
                  <a [href]="extProfile()!.github" target="_blank" rel="noopener">GitHub</a>
                </div>
              }
            </div>

            <!-- Compétences -->
            <div class="skills-section">
              <h4>Compétences</h4>
              <div class="skills-grid">
                @for (skill of user()?.skills ?? []; track skill) {
                  <span class="skill-chip">{{ skill }}</span>
                }
                @if (!user()?.skills?.length) {
                  <p class="no-data">Aucune compétence renseignée</p>
                }
              </div>
            </div>

            <!-- Stats -->
            <div class="stats-row">
              <div class="stat-box">
                <span class="stat-val">{{ user()?.experienceYears }}</span>
                <span class="stat-lbl">ans d'exp.</span>
              </div>
              <div class="stat-box">
                <span class="stat-val">{{ user()?.skills?.length ?? 0 }}</span>
                <span class="stat-lbl">compétences</span>
              </div>
              <div class="stat-box">
                <span class="stat-val">{{ user()?.languages?.length ?? 0 }}</span>
                <span class="stat-lbl"
                  >langue{{ (user()?.languages?.length ?? 0) > 1 ? 's' : '' }}</span
                >
              </div>
            </div>
          </section>
        </div>
      } @else {
        <!-- Edit mode -->
        <form class="panel edit-form" [formGroup]="editForm" (ngSubmit)="saveProfile()" novalidate>
          <div class="edit-header">
            <h3><mat-icon>edit</mat-icon> Modifier le profil</h3>
            <button type="button" mat-icon-button (click)="cancelEdit()" matTooltip="Annuler">
              <mat-icon>close</mat-icon>
            </button>
          </div>

          <!-- Identité -->
          <div class="form-section">
            <h4 class="form-section-title">Identité</h4>
            <div class="field-row">
              <div class="field-wrap">
                <label class="field-lbl">Prénom <span class="req">*</span></label>
                <input
                  class="app-input"
                  formControlName="firstName"
                  placeholder="Prénom"
                  [class.invalid]="isInvalid('firstName')"
                />
              </div>
              <div class="field-wrap">
                <label class="field-lbl">Nom <span class="req">*</span></label>
                <input
                  class="app-input"
                  formControlName="lastName"
                  placeholder="Nom"
                  [class.invalid]="isInvalid('lastName')"
                />
              </div>
            </div>
            <div class="field-row">
              <div class="field-wrap">
                <label class="field-lbl">Téléphone</label>
                <input class="app-input" formControlName="phone" placeholder="+33 6 XX XX XX XX" />
              </div>
              <div class="field-wrap">
                <label class="field-lbl">Localisation</label>
                <input class="app-input" formControlName="location" placeholder="Ville, Pays" />
              </div>
            </div>

            <div class="field-row">
              <div class="field-wrap">
                <label class="field-lbl">Années d'expérience</label>
                <!-- show current value as placeholder while control stays null to indicate non-modified -->
                <input class="app-input" type="number" min="0" formControlName="experienceYears" placeholder="{{ user()?.experienceYears ?? '' }}" />
              </div>
              <div class="field-wrap"></div>
            </div>

            <div class="field-wrap">
              <label class="field-lbl">Bio / À propos</label>
              <textarea
                class="app-input"
                formControlName="bio"
                rows="3"
                placeholder="Décrivez votre profil et vos ambitions…"
              ></textarea>
            </div>
          </div>

          <!-- Liens -->
          <div class="form-section">
            <h4 class="form-section-title">Liens professionnels</h4>
            <div class="field-row">
              <div class="field-wrap">
                <label class="field-lbl">LinkedIn URL</label>
                <input
                  class="app-input"
                  formControlName="linkedin"
                  placeholder="https://linkedin.com/in/…"
                />
              </div>
              <div class="field-wrap">
                <label class="field-lbl">GitHub URL</label>
                <input
                  class="app-input"
                  formControlName="github"
                  placeholder="https://github.com/…"
                />
              </div>
            </div>
          </div>

          <!-- Compétences éditables -->
          <div class="form-section">
            <h4 class="form-section-title">Compétences</h4>

            <!-- Ajouter une compétence -->
            <div class="skill-add-row">
              <input
                class="app-input"
                placeholder="Ajouter une compétence…"
                [ngModel]="newSkill()"
                (ngModelChange)="newSkill.set($event)"
                [ngModelOptions]="{ standalone: true }"
                (keydown.enter)="addSkill(); $event.preventDefault()"
                list="skills-datalist"
              />
              <datalist id="skills-datalist">
                @for (s of allSkills(); track s) {
                  <option [value]="s">{{ s }}</option>
                }
              </datalist>
              <button type="button" class="btn-add-skill" (click)="addSkill()">
                <mat-icon>add</mat-icon>
              </button>
            </div>

            <!-- Chips éditables -->
            <div class="skills-chips">
              @for (skill of editSkills(); track skill) {
                <span class="skill-chip editable">
                  {{ skill }}
                  <button type="button" class="chip-remove" (click)="removeSkill(skill)">×</button>
                </span>
              }
              @if (!editSkills().length) {
                <span class="no-data">Aucune compétence — ajoutez-en ci-dessus</span>
              }
            </div>
          </div>

          <!-- Actions -->
          <div class="edit-actions">
            <button type="button" mat-stroked-button (click)="cancelEdit()" class="btn-cancel">
              Annuler
            </button>
            <button type="submit" class="btn-save">
              <mat-icon>save</mat-icon>
              Enregistrer
            </button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .page-wrap {
        display: grid;
        gap: 14px;
      }
      .panel {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px 22px;
      }

      /* Profile layout */
      .profile-layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: 14px;
        align-items: start;
      }

      /* Profile main */
      .profile-top {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        margin-bottom: 18px;
      }
      .profile-avatar {
        flex-shrink: 0;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--brand-500), var(--accent-500));
        color: #fff;
        font-size: 1.1rem;
        font-weight: 800;
        display: grid;
        place-items: center;
      }
      .profile-identity {
        flex: 1;
      }
      .profile-identity h2 {
        font-size: 1.15rem;
        margin-bottom: 3px;
      }
      .profile-title {
        font-size: 0.85rem;
        color: var(--brand-700);
        font-weight: 600;
      }
      .profile-meta {
        font-size: 0.78rem;
        color: var(--text-muted);
        margin-top: 2px;
      }
      .profile-bio {
        font-size: 0.82rem;
        color: var(--text-muted);
        margin-top: 8px;
        line-height: 1.55;
      }
      .btn-edit {
        background: var(--brand-500) !important;
        color: #fff !important;
        border-radius: 9px !important;
        font-size: 0.78rem !important;
        height: 32px !important;
        gap: 4px !important;
        flex-shrink: 0;
      }
      .btn-edit mat-icon {
        font-size: 15px !important;
        width: 15px !important;
        height: 15px !important;
      }

      /* Contact */
      .contact-row {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 18px;
        padding: 12px 0;
        border-top: 1px solid var(--border-subtle);
        border-bottom: 1px solid var(--border-subtle);
      }
      .contact-item {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .contact-item mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }
      .contact-item a {
        color: var(--brand-600);
      }

      /* Skills */
      .skills-section {
        margin-bottom: 16px;
      }
      .skills-section h4 {
        font-size: 0.82rem;
        font-weight: 700;
        color: var(--text-soft);
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 10px;
      }
      .skills-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }
      .skill-chip {
        padding: 3px 10px;
        border-radius: 999px;
        background: var(--surface-highlight);
        color: var(--brand-700);
        font-size: 0.75rem;
        font-weight: 600;
      }

      /* Stats */
      .stats-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        padding-top: 14px;
        border-top: 1px solid var(--border-subtle);
      }
      .stat-box {
        text-align: center;
      }
      .stat-val {
        display: block;
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--brand-500);
        line-height: 1;
      }
      .stat-lbl {
        font-size: 0.72rem;
        color: var(--text-muted);
      }

      /* Suggested panel */
      .suggested-panel h3 {
        font-size: 0.92rem;
        font-weight: 700;
        margin-bottom: 14px;
      }
      .job-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 9px 0;
        border-top: 1px solid var(--border-subtle);
      }
      .job-row:first-of-type {
        border-top: none;
        padding-top: 0;
      }
      .job-row strong {
        display: block;
        font-size: 0.85rem;
      }
      .job-meta {
        font-size: 0.72rem;
        color: var(--text-muted);
      }
      .match-badge {
        font-size: 0.68rem;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--surface-highlight);
        color: var(--brand-700);
        flex-shrink: 0;
      }
      .match-badge.high {
        background: rgba(34, 197, 94, 0.13);
        color: #15803d;
      }
      .no-data {
        font-size: 0.8rem;
        color: var(--text-soft);
        font-style: italic;
      }

      /* Edit form */
      .edit-form {
        display: grid;
        gap: 0;
      }
      .edit-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .edit-header h3 {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 1rem;
      }
      .edit-header mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--brand-500);
      }
      .form-section {
        margin-bottom: 20px;
        padding-bottom: 18px;
        border-bottom: 1px solid var(--border-subtle);
      }
      .form-section:last-of-type {
        border-bottom: none;
      }
      .form-section-title {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-soft);
        margin-bottom: 12px;
      }
      .field-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-bottom: 10px;
      }
      .field-wrap {
        display: grid;
        gap: 4px;
        margin-bottom: 10px;
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
      textarea.app-input {
        resize: vertical;
        min-height: 70px;
      }

      /* Skills editable */
      .skill-add-row {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
        align-items: center;
      }
      .skill-add-row .app-input {
        flex: 1;
      }
      .btn-add-skill {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        border: 1px solid var(--border-base);
        background: var(--surface-muted);
        cursor: pointer;
        display: grid;
        place-items: center;
        color: var(--brand-500);
        transition: background 150ms;
      }
      .btn-add-skill:hover {
        background: var(--surface-highlight);
      }
      .btn-add-skill mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .skills-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .skill-chip.editable {
        display: inline-flex;
        align-items: center;
        gap: 4px;
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

      /* Edit actions */
      .edit-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        padding-top: 16px;
      }
      .btn-cancel {
        border-radius: 9px !important;
        font-size: 0.82rem !important;
        height: 36px !important;
      }
      .btn-save {
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
      }
      .btn-save mat-icon {
        font-size: 15px !important;
        width: 15px !important;
        height: 15px !important;
      }

      @media (max-width: 900px) {
        .profile-layout {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 600px) {
        .field-row {
          grid-template-columns: 1fr;
        }
        .profile-top {
          flex-direction: column;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeProfilePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly profileSvc = inject(UserProfileService);
  protected readonly session = inject(SessionStore);
  protected readonly catalog = inject(SkillsCatalogService);

  private readonly jobs = toSignal(inject(JobsAdapter).getJobs({ sortBy: 'score' }), {
    initialValue: [],
  });

  protected readonly user = this.session.user;
  protected readonly editing = signal(false);
  protected readonly editSkills = signal<string[]>([]);
  protected readonly newSkill = signal('');
  protected readonly extProfile = signal<ExtendedProfile | null>(null);
  // originalExperience stores the value returned by the backend so we can
  // decide whether the user intentionally changed it (null = unknown / not set)
  protected originalExperience: number | null = null;

  protected readonly initials = computed(() => {
    const u = this.user();
    if (!u) return 'U';
    const first = u.firstName?.trim()?.charAt(0) ?? '';
    const last = u.lastName?.trim()?.charAt(0) ?? '';
    const byNames = `${first}${last}`.toUpperCase();
    if (byNames) return byNames;
    const localPart = (u.email ?? '').split('@')[0] ?? '';
    const parts = localPart.split(/[._-]+/).filter(Boolean);
    const fallback = parts
      .slice(0, 2)
      .map((p) => p.charAt(0))
      .join('')
      .toUpperCase();
    return fallback || 'U';
  });

  protected readonly suggestedJobs = computed(() =>
    this.jobs()
      .filter((j) => j.status === 'OPEN')
      .slice(0, 5),
  );

  protected readonly allSkills = computed(() => SKILL_CATALOG.flatMap((g) => g.skills));

  protected readonly editForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: [''],
    location: [''],
    // null = non modifié; validators enforce reasonable range when user sets a value
    experienceYears: [null as number | null, [Validators.min(0), Validators.max(80)]],
    bio: [''],
    linkedin: [''],
    github: [''],
  });

  ngOnInit(): void {
    this.profileSvc.loadProfile().subscribe({
      next: (profile) => {
        this.extProfile.set(profile);
        // keep originalExperience for comparison later
        this.originalExperience = profile.experienceYears ?? this.user()?.experienceYears ?? null;
      },
      error: () => {
        this.extProfile.set(this.user() as ExtendedProfile | null);
      },
    });
  }

  protected isInvalid(field: string): boolean {
    const c = this.editForm.get(field);
    return !!(c?.invalid && c.touched);
  }

  protected startEdit(): void {
    const u = this.user();
    const ext = this.extProfile();
    if (!u) return;
    // Initialize fields but keep experienceYears control null so we can
    // detect an explicit user modification vs leaving it unchanged.
    this.editForm.patchValue({
      firstName: u.firstName,
      lastName: u.lastName,
      phone: ext?.phone ?? '',
      location: u.location,
      experienceYears: null,
      bio: ext?.bio ?? '',
      linkedin: ext?.linkedin ?? '',
      github: ext?.github ?? '',
    });
    this.editSkills.set([...(u.skills ?? [])]);
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected addSkill(): void {
    const s = this.newSkill().trim();
    if (s && !this.editSkills().includes(s)) {
      this.editSkills.update((list) => [...list, s]);
    }
    this.newSkill.set('');
  }

  protected removeSkill(skill: string): void {
    this.editSkills.update((list) => list.filter((s) => s !== skill));
  }

  protected saveProfile(): void {
    this.editForm.markAllAsTouched();
    if (this.editForm.invalid) return;

    const v = this.editForm.getRawValue();

    // Build minimal payload: include fields only when user modified them or when non-empty
    const payload: any = {};
    if (v.firstName?.trim()) payload.firstName = v.firstName.trim();
    if (v.lastName?.trim()) payload.lastName = v.lastName.trim();
    if (v.location?.trim()) payload.location = v.location.trim();
    if (this.editSkills().length) payload.skills = this.editSkills();
    if (v.phone) payload.phone = v.phone;
    if (v.bio) payload.bio = v.bio;
    if (v.linkedin) payload.linkedin = v.linkedin;
    if (v.github) payload.github = v.github;

    // EXPERIENCE YEARS: include only if control.dirty (user interacted) OR
    // value is explicitly different from originalExperience
    const ctrl = this.editForm.get('experienceYears');
    if (ctrl) {
      const val = v.experienceYears;
      const valIsNumber = val !== null && val !== undefined;
      if (ctrl.dirty || (valIsNumber && Number(val) !== this.originalExperience)) {
        const n = Number(val);
        if (!isNaN(n) && n >= 0 && n <= 80) {
          payload.experienceYears = n;
        } else if (valIsNumber) {
          // invalid number entered — show validation error and abort
          this.toast.open('Années d\'expérience invalide', 'OK', { duration: 3000 });
          return;
        }
      }
    }

    if (Object.keys(payload).length === 0) {
      // nothing to update
      this.toast.open('Aucune modification à enregistrer.', 'OK', { duration: 2000 });
      return;
    }

    this.profileSvc
      .save(payload)
      .subscribe({
        next: (profile) => {
          this.extProfile.set(profile);
          // update originalExperience from server and reset form dirty state
          this.originalExperience = profile.experienceYears ?? null;
          this.editForm.markAsPristine();
          // keep control empty to represent 'not modified'
          this.editForm.patchValue({ experienceYears: null });
          this.editing.set(false);
          this.toast.open('Profil mis a jour avec succes.', 'OK', { duration: 3000 });
        },
        error: () => {
          this.toast.open('Impossible de mettre a jour le profil.', 'OK', { duration: 3000 });
        },
      });
  }
}
