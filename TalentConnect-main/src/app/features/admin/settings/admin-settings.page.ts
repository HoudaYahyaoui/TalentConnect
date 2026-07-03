import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="settings-grid">
      <!-- Général -->
      <section class="panel">
        <div class="section-head">
          <mat-icon>tune</mat-icon>
          <div>
            <h3>Général</h3>
            <p>Nom, langue et fuseau horaire de la plateforme</p>
          </div>
        </div>
        <form [formGroup]="generalForm" class="settings-form">
          <mat-form-field appearance="outline" subscriptSizing="dynamic">
            <mat-label>Nom de la plateforme</mat-label>
            <input matInput formControlName="platformName" />
          </mat-form-field>
          <div class="form-row">
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Langue par défaut</mat-label>
              <mat-select formControlName="language">
                <mat-option value="fr">Français</mat-option>
                <mat-option value="en">English</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" subscriptSizing="dynamic">
              <mat-label>Fuseau horaire</mat-label>
              <mat-select formControlName="timezone">
                <mat-option value="Europe/Paris">Europe/Paris</mat-option>
                <mat-option value="Africa/Tunis">Africa/Tunis</mat-option>
                <mat-option value="UTC">UTC</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </form>
      </section>

      <!-- Sécurité -->
      <section class="panel">
        <div class="section-head">
          <mat-icon>security</mat-icon>
          <div>
            <h3>Sécurité</h3>
            <p>Politique de mots de passe et sessions</p>
          </div>
        </div>
        <div class="toggle-list">
          <div class="toggle-item">
            <div>
              <span class="toggle-label">Authentification à deux facteurs (2FA)</span>
              <span class="toggle-desc">Obligatoire pour les rôles Admin et RH</span>
            </div>
            <mat-slide-toggle
              [checked]="settings().twoFactor"
              (change)="updateSetting('twoFactor', $event.checked)"
            ></mat-slide-toggle>
          </div>
          <div class="toggle-item">
            <div>
              <span class="toggle-label">Verrouillage automatique de session</span>
              <span class="toggle-desc">Déconnexion après 30 min d'inactivité</span>
            </div>
            <mat-slide-toggle
              [checked]="settings().autoLock"
              (change)="updateSetting('autoLock', $event.checked)"
            ></mat-slide-toggle>
          </div>
          <div class="toggle-item">
            <div>
              <span class="toggle-label">Journalisation des connexions</span>
              <span class="toggle-desc">Audit trail de toutes les authentifications</span>
            </div>
            <mat-slide-toggle
              [checked]="settings().loginAudit"
              (change)="updateSetting('loginAudit', $event.checked)"
            ></mat-slide-toggle>
          </div>
        </div>
      </section>

      <!-- Notifications -->
      <section class="panel">
        <div class="section-head">
          <mat-icon>notifications</mat-icon>
          <div>
            <h3>Notifications</h3>
            <p>Alertes e-mail et push par défaut</p>
          </div>
        </div>
        <div class="toggle-list">
          <div class="toggle-item">
            <div>
              <span class="toggle-label">Nouvelles candidatures</span>
              <span class="toggle-desc">Notifier les RH dès réception</span>
            </div>
            <mat-slide-toggle
              [checked]="settings().notifNewApp"
              (change)="updateSetting('notifNewApp', $event.checked)"
            ></mat-slide-toggle>
          </div>
          <div class="toggle-item">
            <div>
              <span class="toggle-label">Changements de statut</span>
              <span class="toggle-desc">Informer les candidats en temps réel</span>
            </div>
            <mat-slide-toggle
              [checked]="settings().notifStatus"
              (change)="updateSetting('notifStatus', $event.checked)"
            ></mat-slide-toggle>
          </div>
          <div class="toggle-item">
            <div>
              <span class="toggle-label">Rapport hebdomadaire</span>
              <span class="toggle-desc">Récapitulatif envoyé chaque lundi matin</span>
            </div>
            <mat-slide-toggle
              [checked]="settings().weeklyReport"
              (change)="updateSetting('weeklyReport', $event.checked)"
            ></mat-slide-toggle>
          </div>
        </div>
      </section>

      <!-- Stockage -->
      <section class="panel">
        <div class="section-head">
          <mat-icon>storage</mat-icon>
          <div>
            <h3>Stockage &amp; fichiers</h3>
            <p>Limites d'upload et types autorisés</p>
          </div>
        </div>
        <div class="toggle-list">
          <div class="toggle-item">
            <div>
              <span class="toggle-label">Taille max par fichier</span>
              <span class="toggle-desc">Limite pour les CV et pièces jointes</span>
            </div>
            <span class="setting-value">10 Mo</span>
          </div>
          <div class="toggle-item">
            <div>
              <span class="toggle-label">Formats autorisés</span>
              <span class="toggle-desc">Types MIME acceptés</span>
            </div>
            <span class="setting-value">PDF, DOCX</span>
          </div>
          <div class="toggle-item">
            <div>
              <span class="toggle-label">Analyse antivirus</span>
              <span class="toggle-desc">Scan automatique à l'upload</span>
            </div>
            <mat-slide-toggle
              [checked]="settings().virusScan"
              (change)="updateSetting('virusScan', $event.checked)"
            ></mat-slide-toggle>
          </div>
        </div>
      </section>

      <!-- Actions globales -->
      <div class="save-bar">
        <span class="save-hint">Les modifications s'appliquent immédiatement.</span>
        <div class="save-actions">
          <button mat-stroked-button type="button" (click)="reset()">Réinitialiser</button>
          <button mat-flat-button type="button" class="btn-save" (click)="save()">
            <mat-icon>save</mat-icon> Enregistrer les paramètres
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      .panel {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl, 20px);
        padding: 20px;
      }
      .section-head {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 18px;
      }
      .section-head mat-icon {
        color: var(--brand-500);
        font-size: 22px;
        width: 22px;
        height: 22px;
        margin-top: 2px;
      }
      .section-head h3 {
        font-size: 0.95rem;
        font-weight: 700;
        margin-bottom: 2px;
      }
      .section-head p {
        font-size: 0.78rem;
        color: var(--text-muted);
      }
      .settings-form {
        display: grid;
        gap: 12px;
      }
      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .toggle-list {
        display: grid;
        gap: 2px;
      }
      .toggle-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-subtle);
      }
      .toggle-item:last-child {
        border-bottom: none;
      }
      .toggle-label {
        display: block;
        font-size: 0.85rem;
        font-weight: 500;
        color: var(--text-secondary);
      }
      .toggle-desc {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
      .setting-value {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--brand-700);
        background: var(--surface-highlight);
        padding: 3px 10px;
        border-radius: 999px;
      }
      .save-bar {
        grid-column: 1 / -1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl, 20px);
      }
      .save-hint {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .save-actions {
        display: flex;
        gap: 10px;
      }
      .btn-save {
        background: var(--brand-500) !important;
        color: #fff !important;
        border-radius: 10px !important;
      }
      @media (max-width: 900px) {
        .settings-grid {
          grid-template-columns: 1fr;
        }
        .save-bar {
          flex-direction: column;
          gap: 12px;
          text-align: center;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSettingsPageComponent {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  protected readonly settings = signal({
    twoFactor: true,
    autoLock: true,
    loginAudit: true,
    notifNewApp: true,
    notifStatus: true,
    weeklyReport: false,
    virusScan: true,
  });

  protected readonly generalForm = this.fb.group({
    platformName: ['TalentConnect'],
    language: ['fr'],
    timezone: ['Europe/Paris'],
  });

  protected updateSetting(key: string, value: boolean): void {
    this.settings.update((s) => ({ ...s, [key]: value }));
  }

  protected save(): void {
    this.toast.open('Paramètres enregistrés avec succès.', 'OK', { duration: 2500 });
  }

  protected reset(): void {
    this.toast.open('Paramètres réinitialisés.', 'OK', { duration: 2000 });
  }
}
