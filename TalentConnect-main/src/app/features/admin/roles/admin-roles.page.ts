import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { inject } from '@angular/core';

interface Permission {
  id: string;
  label: string;
  module: string;
  employee: boolean;
  hr: boolean;
  admin: boolean;
}

@Component({
  selector: 'app-admin-roles-page',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  template: `
    <section class="panel">
      <div class="head-row">
        <div>
          <p class="eyebrow">Contrôle d'accès</p>
          <h2>Rôles &amp; Permissions</h2>
        </div>
        <button mat-flat-button type="button" class="btn-save" (click)="save()">
          <mat-icon>save</mat-icon> Enregistrer
        </button>
      </div>

      <p class="desc">
        Définissez les droits d'accès par rôle. Les modifications sont appliquées immédiatement à
        tous les utilisateurs concernés.
      </p>

      <div class="rbac-table-wrap">
        <table class="rbac-table">
          <thead>
            <tr>
              <th class="col-module">Module</th>
              <th class="col-perm">Permission</th>
              <th class="col-role">Collaborateur</th>
              <th class="col-role">RH</th>
              <th class="col-role">Admin</th>
            </tr>
          </thead>
          <tbody>
            @for (p of permissions(); track p.id) {
              <tr>
                <td class="mod-cell">
                  <span class="mod-badge">{{ p.module }}</span>
                </td>
                <td class="perm-label">{{ p.label }}</td>
                <td class="check-cell">
                  <button
                    class="toggle-check"
                    [class.on]="p.employee"
                    (click)="toggle(p, 'employee')"
                    [attr.aria-label]="
                      p.employee ? 'Révoquer Collaborateur' : 'Accorder Collaborateur'
                    "
                  >
                    <mat-icon>{{
                      p.employee ? 'check_circle' : 'radio_button_unchecked'
                    }}</mat-icon>
                  </button>
                </td>
                <td class="check-cell">
                  <button
                    class="toggle-check"
                    [class.on]="p.hr"
                    (click)="toggle(p, 'hr')"
                    [attr.aria-label]="p.hr ? 'Révoquer RH' : 'Accorder RH'"
                  >
                    <mat-icon>{{ p.hr ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
                  </button>
                </td>
                <td class="check-cell">
                  <button
                    class="toggle-check always-on"
                    disabled
                    aria-label="Admin a toujours accès"
                  >
                    <mat-icon>check_circle</mat-icon>
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="roles-cards">
        @for (role of roleDescriptions; track role.key) {
          <article class="role-card" [class]="'role-' + role.key">
            <mat-icon class="role-icon">{{ role.icon }}</mat-icon>
            <h4>{{ role.name }}</h4>
            <p>{{ role.desc }}</p>
          </article>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .panel {
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-xl, 20px);
        padding: var(--sp-6, 24px);
      }
      .head-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 8px;
      }
      .eyebrow {
        margin: 0 0 2px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--text-soft);
      }
      h2 {
        font-size: 1.2rem;
      }
      .btn-save {
        background: var(--brand-500) !important;
        color: #fff !important;
        border-radius: 10px !important;
      }
      .desc {
        color: var(--text-muted);
        font-size: 0.85rem;
        margin-bottom: 24px;
      }
      .rbac-table-wrap {
        overflow-x: auto;
        border-radius: 12px;
        border: 1px solid var(--border-subtle);
        margin-bottom: 28px;
      }
      .rbac-table {
        width: 100%;
        border-collapse: collapse;
      }
      .rbac-table th {
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--text-soft);
        padding: 10px 16px;
        background: var(--surface-muted);
        text-align: left;
        border-bottom: 1px solid var(--border-base);
      }
      .rbac-table td {
        padding: 10px 16px;
        border-bottom: 1px solid var(--border-subtle);
        vertical-align: middle;
      }
      .rbac-table tr:last-child td {
        border-bottom: none;
      }
      .rbac-table tr:hover td {
        background: var(--surface-highlight);
      }
      .col-role {
        text-align: center;
        width: 110px;
      }
      .col-perm {
        width: 260px;
      }
      .mod-badge {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 2px 7px;
        border-radius: 999px;
        background: var(--surface-highlight);
        color: var(--brand-700);
      }
      .perm-label {
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      .check-cell {
        text-align: center;
      }
      .toggle-check {
        border: none;
        background: transparent;
        cursor: pointer;
        color: var(--border-strong);
        display: inline-grid;
        place-items: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        transition:
          color 120ms,
          background 120ms;
      }
      .toggle-check:hover:not(:disabled) {
        background: var(--surface-highlight);
      }
      .toggle-check.on {
        color: var(--success-500);
      }
      .toggle-check.always-on {
        color: var(--brand-500);
        opacity: 0.7;
        cursor: default;
      }
      .toggle-check mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .roles-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
      .role-card {
        padding: 16px;
        border-radius: 14px;
        border: 1px solid var(--border-subtle);
        background: var(--surface-muted);
      }
      .role-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
        margin-bottom: 8px;
      }
      .role-card h4 {
        font-size: 0.9rem;
        margin-bottom: 4px;
      }
      .role-card p {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      .role-employee .role-icon {
        color: var(--success-500);
      }
      .role-hr .role-icon {
        color: var(--accent-500);
      }
      .role-admin .role-icon {
        color: var(--danger-500);
      }
      @media (max-width: 768px) {
        .roles-cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminRolesPageComponent {
  private readonly toast = inject(ToastService);

  protected readonly permissions = signal<Permission[]>([
    {
      id: 'p1',
      label: 'Consulter les offres',
      module: 'Offres',
      employee: true,
      hr: true,
      admin: true,
    },
    {
      id: 'p2',
      label: 'Créer / modifier les offres',
      module: 'Offres',
      employee: false,
      hr: true,
      admin: true,
    },
    {
      id: 'p3',
      label: 'Clôturer une offre',
      module: 'Offres',
      employee: false,
      hr: true,
      admin: true,
    },
    {
      id: 'p4',
      label: 'Postuler à une offre',
      module: 'Candidatures',
      employee: true,
      hr: false,
      admin: true,
    },
    {
      id: 'p5',
      label: 'Voir toutes les candidatures',
      module: 'Candidatures',
      employee: false,
      hr: true,
      admin: true,
    },
    {
      id: 'p6',
      label: 'Changer statut candidature',
      module: 'Candidatures',
      employee: false,
      hr: true,
      admin: true,
    },
    {
      id: 'p7',
      label: 'Recommander un profil',
      module: 'Cooptation',
      employee: true,
      hr: true,
      admin: true,
    },
    {
      id: 'p8',
      label: 'Accès tableau de bord RH',
      module: 'Tableau de bord',
      employee: false,
      hr: true,
      admin: true,
    },
    {
      id: 'p9',
      label: 'Exporter des rapports CSV',
      module: 'Rapports',
      employee: false,
      hr: true,
      admin: true,
    },
    {
      id: 'p10',
      label: 'Gérer les utilisateurs',
      module: 'IAM',
      employee: false,
      hr: false,
      admin: true,
    },
    {
      id: 'p11',
      label: 'Modifier les rôles',
      module: 'IAM',
      employee: false,
      hr: false,
      admin: true,
    },
    {
      id: 'p12',
      label: "Consulter l'audit trail",
      module: 'Audit',
      employee: false,
      hr: true,
      admin: true,
    },
  ]);

  protected readonly roleDescriptions = [
    {
      key: 'employee',
      name: 'Collaborateur',
      icon: 'person',
      desc: 'Accès à ses propres candidatures, offres internes et cooptation. Aucun accès aux données des autres.',
    },
    {
      key: 'hr',
      name: 'Ressources humaines',
      icon: 'groups',
      desc: 'Pilotage complet du recrutement : offres, candidats, kanban, rapports et audit trail.',
    },
    {
      key: 'admin',
      name: 'Administrateur',
      icon: 'shield',
      desc: 'Contrôle total : gestion des utilisateurs, rôles, paramètres plateforme et observabilité.',
    },
  ];

  protected toggle(p: Permission, role: 'employee' | 'hr'): void {
    this.permissions.update((list) =>
      list.map((item) => (item.id === p.id ? { ...item, [role]: !item[role] } : item)),
    );
  }

  protected save(): void {
    this.toast.open('Permissions enregistrées.', 'OK', { duration: 2500 });
  }
}
