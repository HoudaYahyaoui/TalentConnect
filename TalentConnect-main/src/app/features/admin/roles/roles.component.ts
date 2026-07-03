import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

interface PermissionRow {
  module: string;
  permission: string;
  icon: string;
  employee: boolean;
  hr: boolean;
  admin: boolean;
}

const PERMISSIONS: PermissionRow[] = [
  {
    module: 'Offres',
    permission: 'Voir les offres',
    icon: 'work',
    employee: true,
    hr: true,
    admin: true,
  },
  {
    module: 'Offres',
    permission: 'Créer / modifier offres',
    icon: 'edit',
    employee: false,
    hr: true,
    admin: true,
  },
  {
    module: 'Offres',
    permission: 'Clôturer une offre',
    icon: 'block',
    employee: false,
    hr: true,
    admin: true,
  },
  {
    module: 'Candidatures',
    permission: 'Postuler à une offre',
    icon: 'send',
    employee: true,
    hr: false,
    admin: true,
  },
  {
    module: 'Candidatures',
    permission: 'Voir toutes les candidatures',
    icon: 'groups',
    employee: false,
    hr: true,
    admin: true,
  },
  {
    module: 'Candidatures',
    permission: 'Modifier le statut',
    icon: 'swap_horiz',
    employee: false,
    hr: true,
    admin: true,
  },
  {
    module: 'Cooptation',
    permission: 'Recommander un candidat',
    icon: 'recommend',
    employee: true,
    hr: true,
    admin: true,
  },
  {
    module: 'Kanban',
    permission: 'Accéder au Kanban',
    icon: 'view_kanban',
    employee: false,
    hr: true,
    admin: true,
  },
  {
    module: 'Rapports',
    permission: 'Voir les rapports',
    icon: 'insights',
    employee: false,
    hr: true,
    admin: true,
  },
  {
    module: 'Rapports',
    permission: 'Exporter les données',
    icon: 'download',
    employee: false,
    hr: true,
    admin: true,
  },
  {
    module: 'Audit',
    permission: "Voir le journal d'audit",
    icon: 'history',
    employee: false,
    hr: true,
    admin: true,
  },
  {
    module: 'Utilisateurs',
    permission: 'Gérer les utilisateurs',
    icon: 'manage_accounts',
    employee: false,
    hr: false,
    admin: true,
  },
  {
    module: 'Utilisateurs',
    permission: 'Créer des comptes',
    icon: 'person_add',
    employee: false,
    hr: false,
    admin: true,
  },
  {
    module: 'Rôles',
    permission: 'Modifier les permissions',
    icon: 'shield',
    employee: false,
    hr: false,
    admin: true,
  },
  {
    module: 'Système',
    permission: 'Accéder aux paramètres',
    icon: 'settings',
    employee: false,
    hr: false,
    admin: true,
  },
  {
    module: 'Système',
    permission: 'Gérer les workflows',
    icon: 'account_tree',
    employee: false,
    hr: false,
    admin: true,
  },
];

@Component({
  selector: 'app-roles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
  ],
  template: `
    <div class="roles-wrap">
      <header class="page-header">
        <div>
          <p class="eyebrow">Contrôle d'accès</p>
          <h2>Rôles &amp; permissions</h2>
          <p class="header-sub">
            Configurez les droits d'accès pour chaque rôle. Les permissions Admin sont toujours
            activées.
          </p>
        </div>
        <div class="header-actions">
          <button mat-stroked-button type="button" (click)="resetDefaults()">
            <mat-icon>restart_alt</mat-icon> Réinitialiser
          </button>
          <button mat-flat-button class="btn-save" type="button" (click)="saveChanges()">
            <mat-icon>save</mat-icon> Sauvegarder
          </button>
        </div>
      </header>

      <!-- Permissions table -->
      <div class="table-card">
        <div class="table-container">
          <table mat-table [dataSource]="permissions()" class="perm-table">
            <ng-container matColumnDef="module">
              <th mat-header-cell *matHeaderCellDef>Module</th>
              <td mat-cell *matCellDef="let row">
                <div class="module-cell">
                  <mat-icon class="module-icon">{{ row.icon }}</mat-icon>
                  <div>
                    <span class="module-name">{{ row.module }}</span>
                    <span class="perm-name">{{ row.permission }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="employee">
              <th mat-header-cell *matHeaderCellDef>
                <div class="role-header">
                  <div class="role-badge employee">E</div>
                  Collaborateur
                </div>
              </th>
              <td mat-cell *matCellDef="let row; let i = index">
                <mat-slide-toggle
                  [checked]="row.employee"
                  [disabled]="row.admin && !row.employee && !row.hr"
                  (change)="toggle(i, 'employee', $event.checked)"
                  color="primary"
                ></mat-slide-toggle>
              </td>
            </ng-container>

            <ng-container matColumnDef="hr">
              <th mat-header-cell *matHeaderCellDef>
                <div class="role-header">
                  <div class="role-badge hr">RH</div>
                  Ressources Humaines
                </div>
              </th>
              <td mat-cell *matCellDef="let row; let i = index">
                <mat-slide-toggle
                  [checked]="row.hr"
                  (change)="toggle(i, 'hr', $event.checked)"
                  color="primary"
                ></mat-slide-toggle>
              </td>
            </ng-container>

            <ng-container matColumnDef="admin">
              <th mat-header-cell *matHeaderCellDef>
                <div class="role-header">
                  <div class="role-badge admin">A</div>
                  Administrateur
                </div>
              </th>
              <td mat-cell *matCellDef="let row">
                <mat-slide-toggle [checked]="true" [disabled]="true" color="primary">
                </mat-slide-toggle>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr
              mat-row
              *matRowDef="let row; columns: columns"
              [class.highlighted]="getRowModule(row) !== getRowModule(getPrevRow(row))"
            ></tr>
          </table>
        </div>
      </div>

      <!-- Role descriptions -->
      <div class="role-cards">
        <div class="role-card employee-card">
          <div class="role-card-icon"><mat-icon>person</mat-icon></div>
          <div>
            <h4>Collaborateur</h4>
            <p>
              Accès aux offres internes, candidature personnelle, cooptation et suivi de dossiers.
            </p>
            <div class="perm-count">
              <mat-icon>check_circle</mat-icon>
              {{ employeeCount() }} permissions actives
            </div>
          </div>
        </div>

        <div class="role-card hr-card">
          <div class="role-card-icon"><mat-icon>groups</mat-icon></div>
          <div>
            <h4>Ressources Humaines</h4>
            <p>Gestion complète des offres, candidats, Kanban, rapports et audit.</p>
            <div class="perm-count">
              <mat-icon>check_circle</mat-icon>
              {{ hrCount() }} permissions actives
            </div>
          </div>
        </div>

        <div class="role-card admin-card">
          <div class="role-card-icon"><mat-icon>admin_panel_settings</mat-icon></div>
          <div>
            <h4>Administrateur</h4>
            <p>Accès total au système, gestion IAM, workflows et configuration avancée.</p>
            <div class="perm-count">
              <mat-icon>check_circle</mat-icon>
              Toutes les permissions ({{ permissions().length }})
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .roles-wrap {
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
      }
      .header-actions {
        display: flex;
        gap: 10px;
        flex-shrink: 0;
      }
      .btn-save {
        background: var(--brand-600) !important;
        color: #fff !important;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .table-card {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        overflow: hidden;
      }
      .table-container {
        overflow-x: auto;
      }
      .perm-table {
        width: 100%;
      }
      ::ng-deep .perm-table th.mat-mdc-header-cell {
        background: var(--surface-highlight);
        font-size: 0.82rem;
        font-weight: 600;
      }
      .role-header {
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
      }
      .role-badge {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.65rem;
        font-weight: 800;
      }
      .employee {
        background: rgba(59, 130, 246, 0.15);
        color: #3b82f6;
      }
      .hr {
        background: rgba(139, 92, 246, 0.15);
        color: #8b5cf6;
      }
      .admin {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }

      .module-cell {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 0;
      }
      .module-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--brand-400);
        flex-shrink: 0;
      }
      .module-name {
        font-size: 0.72rem;
        color: var(--text-soft);
        display: block;
        text-transform: uppercase;
        letter-spacing: 0.4px;
      }
      .perm-name {
        font-size: 0.85rem;
        font-weight: 500;
        display: block;
      }

      /* Role description cards */
      .role-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      @media (max-width: 768px) {
        .role-cards {
          grid-template-columns: 1fr;
        }
      }
      .role-card {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl);
        padding: 18px;
        display: flex;
        gap: 14px;
        align-items: flex-start;
      }
      .role-card-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .employee-card .role-card-icon {
        background: rgba(59, 130, 246, 0.12);
        color: #3b82f6;
      }
      .hr-card .role-card-icon {
        background: rgba(139, 92, 246, 0.12);
        color: #8b5cf6;
      }
      .admin-card .role-card-icon {
        background: rgba(245, 158, 11, 0.12);
        color: #f59e0b;
      }
      .role-card h4 {
        font-size: 0.92rem;
        font-weight: 600;
        margin: 0 0 4px;
      }
      .role-card p {
        font-size: 0.8rem;
        color: var(--text-soft);
        margin: 0 0 8px;
      }
      .perm-count {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.78rem;
        color: #22c55e;
        font-weight: 600;
      }
      .perm-count mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    `,
  ],
})
export class RolesComponent {
  private readonly toast = inject(ToastService);

  protected readonly permissions = signal<PermissionRow[]>(JSON.parse(JSON.stringify(PERMISSIONS)));
  protected readonly columns = ['module', 'employee', 'hr', 'admin'];

  protected readonly employeeCount = () => this.permissions().filter((p) => p.employee).length;
  protected readonly hrCount = () => this.permissions().filter((p) => p.hr).length;

  protected toggle(index: number, role: 'employee' | 'hr', value: boolean): void {
    this.permissions.update((list) => {
      const updated = [...list];
      updated[index] = { ...updated[index], [role]: value };
      return updated;
    });
  }

  protected saveChanges(): void {
    this.toast.open('Permissions enregistrées avec succès', '', { duration: 3000 });
  }

  protected resetDefaults(): void {
    this.permissions.set(JSON.parse(JSON.stringify(PERMISSIONS)));
    this.toast.open('Permissions réinitialisées', '', { duration: 2500 });
  }

  protected getRowModule(row: PermissionRow | undefined): string {
    return row?.module ?? '';
  }

  protected getPrevRow(row: PermissionRow): PermissionRow | undefined {
    const idx = this.permissions().indexOf(row);
    return idx > 0 ? this.permissions()[idx - 1] : undefined;
  }
}
