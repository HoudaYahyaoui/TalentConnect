import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';

interface WorkflowStep {
  id: string;
  name: string;
  type: 'screening' | 'interview' | 'assessment' | 'decision' | 'offer';
  duration: number;
  responsible: string;
}

interface WorkflowConfig {
  department: string;
  steps: WorkflowStep[];
}

const STEP_COLORS: Record<string, string> = {
  screening: '#3b82f6',
  interview: '#8b5cf6',
  assessment: '#f59e0b',
  decision: '#ef4444',
  offer: '#22c55e',
};
const STEP_ICONS: Record<string, string> = {
  screening: 'filter_list',
  interview: 'record_voice_over',
  assessment: 'quiz',
  decision: 'gavel',
  offer: 'volunteer_activism',
};
const STEP_LABELS: Record<string, string> = {
  screening: 'Pré-sélection',
  interview: 'Entretien',
  assessment: 'Évaluation',
  decision: 'Décision',
  offer: 'Offre',
};

const DEFAULT_WORKFLOWS: WorkflowConfig[] = [
  {
    department: 'Digital Factory',
    steps: [
      { id: 's1', name: 'Pré-sélection CV', type: 'screening', duration: 2, responsible: 'RH' },
      { id: 's2', name: 'Entretien RH', type: 'interview', duration: 3, responsible: 'RH' },
      {
        id: 's3',
        name: 'Test technique',
        type: 'assessment',
        duration: 5,
        responsible: 'Tech Lead',
      },
      {
        id: 's4',
        name: 'Entretien manager',
        type: 'interview',
        duration: 3,
        responsible: 'Manager',
      },
      {
        id: 's5',
        name: 'Décision finale',
        type: 'decision',
        duration: 1,
        responsible: 'Directeur',
      },
      { id: 's6', name: 'Envoi offre', type: 'offer', duration: 2, responsible: 'RH' },
    ],
  },
  {
    department: 'Finance',
    steps: [
      { id: 'f1', name: 'Pré-sélection', type: 'screening', duration: 2, responsible: 'RH' },
      {
        id: 'f2',
        name: 'Entretien métier',
        type: 'interview',
        duration: 4,
        responsible: 'Responsable Finance',
      },
      {
        id: 'f3',
        name: 'Cas pratique',
        type: 'assessment',
        duration: 3,
        responsible: 'Équipe Finance',
      },
      { id: 'f4', name: 'Offre', type: 'offer', duration: 2, responsible: 'RH' },
    ],
  },
  {
    department: 'RH',
    steps: [
      { id: 'h1', name: 'Tri des candidatures', type: 'screening', duration: 1, responsible: 'RH' },
      { id: 'h2', name: 'Entretien croisé', type: 'interview', duration: 3, responsible: 'DRH' },
      { id: 'h3', name: "Offre d'emploi", type: 'offer', duration: 2, responsible: 'DRH' },
    ],
  },
];

@Component({
  selector: 'app-workflow',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    CdkDropList,
    CdkDrag,
  ],
  template: `
    <div class="wf-wrap">
      <header class="page-header">
        <div>
          <p class="eyebrow">Configuration RH</p>
          <h2>Workflows de recrutement</h2>
          <p class="header-sub">
            Créez et personnalisez les étapes de recrutement par département. Glissez-déposez pour
            réorganiser.
          </p>
        </div>
        <button mat-flat-button class="btn-save" type="button" (click)="saveAll()">
          <mat-icon>save</mat-icon> Sauvegarder tout
        </button>
      </header>

      <!-- Department selector -->
      <div class="dept-tabs">
        @for (wf of workflows(); track wf.department) {
          <button
            class="dept-tab"
            [class.active]="selectedDept() === wf.department"
            type="button"
            (click)="selectDept(wf.department)"
          >
            {{ wf.department }}
          </button>
        }
        <button class="dept-tab add-dept" type="button" (click)="addDepartment()">
          <mat-icon>add</mat-icon> Ajouter
        </button>
      </div>

      @if (currentWorkflow(); as wf) {
        <div class="wf-grid">
          <!-- Steps panel -->
          <div class="steps-panel">
            <div class="steps-header">
              <h3>
                <mat-icon>account_tree</mat-icon>
                Étapes — {{ wf.department }}
              </h3>
              <span class="step-count"
                >{{ wf.steps.length }} étape{{ wf.steps.length > 1 ? 's' : '' }}</span
              >
            </div>

            <!-- Preview flow -->
            <div class="flow-preview">
              @for (step of wf.steps; track step.id; let i = $index; let last = $last) {
                <div class="flow-node" [style.border-color]="stepColor(step.type)">
                  <mat-icon [style.color]="stepColor(step.type)">{{
                    stepIcon(step.type)
                  }}</mat-icon>
                  <span>{{ step.name }}</span>
                  <small>{{ step.duration }}j</small>
                </div>
                @if (!last) {
                  <mat-icon class="flow-arrow">arrow_forward</mat-icon>
                }
              }
            </div>

            <!-- Drag & drop list -->
            <div cdkDropList (cdkDropListDropped)="dropStep($event)" class="drag-list">
              @for (step of wf.steps; track step.id; let i = $index) {
                <div cdkDrag class="step-card">
                  <div class="step-drag-handle" cdkDragHandle>
                    <mat-icon>drag_indicator</mat-icon>
                  </div>
                  <div class="step-type-dot" [style.background]="stepColor(step.type)">
                    <mat-icon
                      [style.color]="'#fff'"
                      style="font-size:14px;width:14px;height:14px;"
                      >{{ stepIcon(step.type) }}</mat-icon
                    >
                  </div>
                  <div class="step-info">
                    <span class="step-name">{{ step.name }}</span>
                    <span class="step-meta">
                      <span
                        class="step-type-pill"
                        [style.background]="stepColor(step.type) + '20'"
                        [style.color]="stepColor(step.type)"
                      >
                        {{ stepLabel(step.type) }}
                      </span>
                      · {{ step.duration }}j · {{ step.responsible }}
                    </span>
                  </div>
                  <div class="step-actions">
                    <button
                      mat-icon-button
                      type="button"
                      (click)="editStep(i)"
                      matTooltip="Modifier"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      type="button"
                      (click)="removeStep(i)"
                      matTooltip="Supprimer"
                      color="warn"
                    >
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </div>
                </div>
              }
            </div>

            <div class="total-duration">
              <mat-icon>timer</mat-icon>
              Durée totale estimée : <strong>{{ totalDays() }} jours ouvrés</strong>
            </div>
          </div>

          <!-- Add step form -->
          <div class="add-step-panel">
            <h3 class="form-title">
              <mat-icon>add_circle</mat-icon>
              Ajouter une étape
            </h3>

            <form [formGroup]="stepForm" class="step-form" (ngSubmit)="submitStep()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Nom de l'étape</mat-label>
                <input matInput formControlName="name" placeholder="Ex : Entretien technique" />
                <mat-error>Obligatoire</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Type</mat-label>
                <mat-select formControlName="type">
                  @for (t of stepTypes; track t.value) {
                    <mat-option [value]="t.value">
                      {{ t.label }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Durée (jours ouvrés)</mat-label>
                <input matInput type="number" formControlName="duration" min="1" max="30" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Responsable</mat-label>
                <input
                  matInput
                  formControlName="responsible"
                  placeholder="RH, Manager, Tech Lead…"
                />
              </mat-form-field>

              <div class="form-actions">
                @if (editingIndex() >= 0) {
                  <button mat-stroked-button type="button" (click)="cancelEdit()">Annuler</button>
                }
                <button mat-flat-button class="btn-add" type="submit" [disabled]="stepForm.invalid">
                  <mat-icon>{{ editingIndex() >= 0 ? 'save' : 'add' }}</mat-icon>
                  {{ editingIndex() >= 0 ? 'Mettre à jour' : 'Ajouter' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .wf-wrap {
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
        font-size: 1.15rem;
        margin: 4px 0 6px;
      }
      .header-sub {
        font-size: 0.82rem;
        color: var(--text-soft);
        margin: 0;
        max-width: 520px;
      }
      .btn-save {
        background: var(--brand-600) !important;
        color: #fff !important;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* Dept tabs */
      .dept-tabs {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .dept-tab {
        padding: 7px 18px;
        border: 1px solid var(--border-subtle);
        border-radius: 999px;
        background: var(--surface-raised);
        cursor: pointer;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-soft);
        transition: all 150ms;
      }
      .dept-tab:hover {
        border-color: var(--brand-400);
        color: var(--brand-600);
      }
      .dept-tab.active {
        background: var(--brand-600);
        color: #fff;
        border-color: var(--brand-600);
      }
      .dept-tab.add-dept {
        display: flex;
        align-items: center;
        gap: 4px;
        border-style: dashed;
      }
      .dept-tab.add-dept mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      /* Main grid */
      .wf-grid {
        display: grid;
        grid-template-columns: 1fr 320px;
        gap: 16px;
      }
      @media (max-width: 900px) {
        .wf-grid {
          grid-template-columns: 1fr;
        }
      }

      .steps-panel {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .steps-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .steps-header h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        font-size: 0.95rem;
        font-weight: 600;
      }
      .steps-header h3 mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--brand-500);
      }
      .step-count {
        font-size: 0.78rem;
        color: var(--text-soft);
        background: var(--surface-highlight);
        padding: 3px 10px;
        border-radius: 999px;
      }

      /* Flow preview */
      .flow-preview {
        display: flex;
        align-items: center;
        gap: 6px;
        overflow-x: auto;
        padding: 10px;
        background: var(--surface-highlight);
        border-radius: var(--radius-lg);
      }
      .flow-node {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        border: 2px solid;
        border-radius: var(--radius-lg);
        padding: 8px 12px;
        flex-shrink: 0;
        background: var(--surface-raised);
        min-width: 80px;
        text-align: center;
      }
      .flow-node span {
        font-size: 0.72rem;
        font-weight: 600;
      }
      .flow-node small {
        font-size: 0.65rem;
        color: var(--text-soft);
      }
      .flow-node mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .flow-arrow {
        color: var(--text-soft);
        font-size: 18px;
        flex-shrink: 0;
      }

      /* Drag list */
      .drag-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .step-card {
        display: flex;
        align-items: center;
        gap: 10px;
        background: var(--surface-base, #f8fafc);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-lg);
        padding: 10px 12px;
        transition: box-shadow 150ms;
      }
      .step-card:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);
      }
      .cdk-drag-preview {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        border-radius: var(--radius-lg);
      }
      .cdk-drag-placeholder {
        opacity: 0;
      }
      .step-drag-handle {
        cursor: grab;
        color: var(--text-soft);
      }
      .step-type-dot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .step-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .step-name {
        font-size: 0.88rem;
        font-weight: 600;
      }
      .step-meta {
        font-size: 0.75rem;
        color: var(--text-soft);
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
      }
      .step-type-pill {
        padding: 1px 7px;
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 600;
      }
      .step-actions {
        display: flex;
        gap: 2px;
      }

      .total-duration {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.82rem;
        color: var(--text-soft);
        padding: 8px 12px;
        border-radius: var(--radius-lg);
        background: var(--surface-highlight);
      }
      .total-duration mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--brand-500);
      }
      .total-duration strong {
        color: var(--brand-600);
      }

      /* Add step form */
      .add-step-panel {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 20px;
        align-self: flex-start;
      }
      .form-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 16px;
        font-size: 0.95rem;
        font-weight: 600;
      }
      .form-title mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: var(--brand-500);
      }
      .step-form {
        display: grid;
        gap: 12px;
      }
      .full-width {
        width: 100%;
      }
      .form-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      .btn-add {
        background: var(--brand-600) !important;
        color: #fff !important;
        display: flex;
        align-items: center;
        gap: 6px;
      }
    `,
  ],
})
export class WorkflowComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);

  protected readonly workflows = signal<WorkflowConfig[]>(
    JSON.parse(JSON.stringify(DEFAULT_WORKFLOWS)),
  );
  protected readonly selectedDept = signal(DEFAULT_WORKFLOWS[0].department);
  protected readonly editingIndex = signal(-1);

  protected readonly stepTypes = Object.entries(STEP_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  readonly stepForm = this.fb.group({
    name: ['', Validators.required],
    type: ['interview'],
    duration: [3, [Validators.required, Validators.min(1)]],
    responsible: ['RH'],
  });

  protected readonly currentWorkflow = () =>
    this.workflows().find((w) => w.department === this.selectedDept());

  protected readonly totalDays = () =>
    this.currentWorkflow()?.steps.reduce((sum, s) => sum + s.duration, 0) ?? 0;

  protected selectDept(dept: string): void {
    this.selectedDept.set(dept);
    this.editingIndex.set(-1);
    this.stepForm.reset({ type: 'interview', duration: 3, responsible: 'RH' });
  }

  protected addDepartment(): void {
    const name = prompt('Nom du département :');
    if (!name) return;
    this.workflows.update((list) => [...list, { department: name, steps: [] }]);
    this.selectDept(name);
  }

  protected dropStep(event: CdkDragDrop<WorkflowStep[]>): void {
    this.workflows.update((list) =>
      list.map((w) => {
        if (w.department !== this.selectedDept()) return w;
        const steps = [...w.steps];
        moveItemInArray(steps, event.previousIndex, event.currentIndex);
        return { ...w, steps };
      }),
    );
  }

  protected submitStep(): void {
    if (this.stepForm.invalid) return;
    const val = this.stepForm.getRawValue();
    const step: WorkflowStep = {
      id: 'step-' + Date.now(),
      name: val.name!,
      type: val.type as WorkflowStep['type'],
      duration: val.duration!,
      responsible: val.responsible!,
    };

    this.workflows.update((list) =>
      list.map((w) => {
        if (w.department !== this.selectedDept()) return w;
        const steps = [...w.steps];
        const idx = this.editingIndex();
        if (idx >= 0) {
          steps[idx] = { ...steps[idx], ...step, id: steps[idx].id };
        } else {
          steps.push(step);
        }
        return { ...w, steps };
      }),
    );
    this.stepForm.reset({ type: 'interview', duration: 3, responsible: 'RH' });
    this.editingIndex.set(-1);
    this.toast.open(this.editingIndex() >= 0 ? 'Étape mise à jour' : 'Étape ajoutée', '', {
      duration: 2000,
    });
  }

  protected editStep(index: number): void {
    const step = this.currentWorkflow()?.steps[index];
    if (!step) return;
    this.editingIndex.set(index);
    this.stepForm.patchValue(step);
  }

  protected cancelEdit(): void {
    this.editingIndex.set(-1);
    this.stepForm.reset({ type: 'interview', duration: 3, responsible: 'RH' });
  }

  protected removeStep(index: number): void {
    this.workflows.update((list) =>
      list.map((w) => {
        if (w.department !== this.selectedDept()) return w;
        return { ...w, steps: w.steps.filter((_, i) => i !== index) };
      }),
    );
  }

  protected saveAll(): void {
    this.toast.open('Workflows sauvegardés avec succès', '', { duration: 3000 });
  }

  protected stepColor(type: string): string {
    return STEP_COLORS[type] ?? '#94a3b8';
  }
  protected stepIcon(type: string): string {
    return STEP_ICONS[type] ?? 'radio_button_unchecked';
  }
  protected stepLabel(type: string): string {
    return STEP_LABELS[type] ?? type;
  }
}
