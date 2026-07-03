import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ToastService } from '../../../shared/services/toast.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { ApiHttpService } from '../../../data-access/api/http/api-http.service';
import { UserProfile, UserRole } from '../../../data-access/models/portal.models';
import {
  SkeletonListComponent,
  EmptyStateComponent,
  ErrorStateComponent,
} from '../../../shared/components/page-states';
import { AdminUserDialogComponent } from './admin-user-dialog.component';

interface BackendAdminUser {
  id: number;
  email: string;
  roles: string[];
  enabled: boolean;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  location?: string;
  title?: string;
  skills?: string[];
  experienceYears?: number;
  languages?: string[];
}

type AdminUiUser = UserProfile & { enabled: boolean };

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
    SkeletonListComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    @if (loading()) {
      <app-skeleton-list [count]="5"></app-skeleton-list>
    } @else if (errorState()) {
      <app-error-state
        title="Impossible de charger les utilisateurs"
        (retry)="load()"
      ></app-error-state>
    } @else {
      <section class="panel">
        <div class="head-row">
          <div>
            <p class="eyebrow">Gestion IAM</p>
            <h2>Utilisateurs ({{ dataSource.data.length }})</h2>
          </div>
          <div class="head-actions">
            <button mat-stroked-button type="button" (click)="exportCsv()">
              <mat-icon>download</mat-icon> Exporter
            </button>
            <button mat-flat-button type="button" class="btn-primary" (click)="openDialog()">
              <mat-icon>person_add</mat-icon> Nouvel utilisateur
            </button>
          </div>
        </div>

        <div class="toolbar-row">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
            <mat-icon matPrefix>search</mat-icon>
            <input matInput [formControl]="searchCtrl" placeholder="Rechercher…" />
            @if (searchCtrl.value) {
              <button matSuffix mat-icon-button type="button" (click)="searchCtrl.setValue('')">
                <mat-icon>close</mat-icon>
              </button>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="filter-field">
            <mat-select [formControl]="roleFilter" placeholder="Tous les rôles">
              <mat-option value="">Tous les rôles</mat-option>
              <mat-option value="EMPLOYEE">Collaborateur</mat-option>
              <mat-option value="HR">RH</mat-option>
              <mat-option value="ADMIN">Administrateur</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (dataSource.filteredData.length === 0) {
          <app-empty-state
            icon="person_search"
            title="Aucun utilisateur trouvé"
            message="Modifiez vos critères ou ajoutez un nouvel utilisateur."
            actionLabel="Ajouter un utilisateur"
            (action)="openDialog()"
          >
          </app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort>
              <ng-container matColumnDef="avatar">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let row">
                  <div class="user-avatar">
                    {{
                      (
                        (row.firstName?.charAt(0) || '') + (row.lastName?.charAt(0) || '') ||
                        row.email?.charAt(0) ||
                        'U'
                      ).toUpperCase()
                    }}
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom complet</th>
                <td mat-cell *matCellDef="let row">
                  <div class="cell-name">{{ row.firstName }} {{ row.lastName }}</div>
                  <div class="cell-sub">{{ row.title }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>E-mail</th>
                <td mat-cell *matCellDef="let row">{{ row.email }}</td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Rôle</th>
                <td mat-cell *matCellDef="let row">
                  <span class="role-chip" [class]="'role-' + row.role.toLowerCase()">{{
                    roleLabel(row.role)
                  }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Département</th>
                <td mat-cell *matCellDef="let row">{{ row.department }}</td>
              </ng-container>

              <ng-container matColumnDef="location">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Site</th>
                <td mat-cell *matCellDef="let row">{{ row.location }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let row" class="actions-cell">
                  <button
                    mat-icon-button
                    type="button"
                    matTooltip="Modifier"
                    (click)="openDialog(row)"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    type="button"
                    matTooltip="Changer le rôle"
                    (click)="changeRole(row)"
                  >
                    <mat-icon>manage_accounts</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    type="button"
                    matTooltip="Désactiver"
                    color="warn"
                    (click)="row.enabled ? deactivate(row) : reactivate(row)"
                  >
                    <mat-icon>{{ row.enabled ? 'person_off' : 'person' }}</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    type="button"
                    matTooltip="Supprimer"
                    color="warn"
                    (click)="deleteUser(row)"
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns; sticky: true"></tr>
              <tr mat-row *matRowDef="let row; columns: columns" class="data-row"></tr>
            </table>
          </div>
          <mat-paginator
            [pageSizeOptions]="[10, 25, 50]"
            [pageSize]="10"
            showFirstLastButtons
          ></mat-paginator>
        }
      </section>
    }
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
        margin-bottom: 1.25rem;
        flex-wrap: wrap;
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
      .head-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .btn-primary {
        background: var(--brand-500) !important;
        color: #fff !important;
        border-radius: 10px !important;
      }
      .toolbar-row {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
        flex-wrap: wrap;
      }
      .search-field {
        flex: 1;
        min-width: 200px;
      }
      .filter-field {
        width: 200px;
      }
      .table-container {
        overflow-x: auto;
        border-radius: 12px;
        border: 1px solid var(--border-subtle);
        margin-bottom: 0;
      }
      table {
        width: 100%;
      }
      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--brand-500), var(--accent-500));
        color: #fff;
        font-size: 0.7rem;
        font-weight: 700;
        display: grid;
        place-items: center;
      }
      .cell-name {
        font-size: 0.875rem;
        font-weight: 500;
      }
      .cell-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
      .role-chip {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        padding: 2px 8px;
        border-radius: 999px;
      }
      .role-employee {
        background: rgba(34, 197, 94, 0.12);
        color: #166534;
      }
      .role-hr {
        background: rgba(99, 102, 241, 0.12);
        color: #4338ca;
      }
      .role-admin {
        background: rgba(239, 68, 68, 0.12);
        color: #b91c1c;
      }
      .actions-cell {
        display: flex;
        gap: 2px;
        justify-content: flex-end;
      }
      .data-row:hover {
        background: var(--surface-highlight);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly api = inject(ApiHttpService);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = signal(true);
  protected readonly errorState = signal(false);
  protected readonly searchCtrl = new FormControl('', { nonNullable: true });
  protected readonly roleFilter = new FormControl('', { nonNullable: true });
  protected readonly dataSource = new MatTableDataSource<AdminUiUser>();
  protected readonly columns = [
    'avatar',
    'name',
    'email',
    'role',
    'department',
    'location',
    'actions',
  ];

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges
      .pipe(startWith(''), debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.applyFilters());
    this.roleFilter.valueChanges.subscribe(() => this.applyFilters());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  protected load(): void {
    this.loading.set(true);
    this.errorState.set(false);
    this.api.getFrom<BackendAdminUser[]>(this.api.authBase, 'admin/users').subscribe({
      next: (users) => {
        this.dataSource.data = users.map((u) => this.toUiUser(u));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorState.set(true);
      },
    });
  }

  private toUiUser(user: BackendAdminUser): AdminUiUser {
    const backendRole = user.roles?.[0] ?? 'EMPLOYEE';
    const role: UserRole =
      backendRole === 'RH' ? 'HR' : backendRole === 'ADMIN' ? 'ADMIN' : 'EMPLOYEE';

    return {
      id: String(user.id),
      employeeId: user.employeeId ?? String(user.id),
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email,
      role,
      department: user.department ?? '',
      location: user.location ?? '',
      title: user.title ?? '',
      skills: user.skills ?? [],
      experienceYears: user.experienceYears ?? 0,
      languages: user.languages ?? [],
      enabled: user.enabled,
    };
  }

  /** Frontend role → backend role (EMPLOYE, RH, ADMIN) */
  private toBackendRole(role: UserRole): 'EMPLOYE' | 'RH' | 'ADMIN' {
    if (role === 'HR') return 'RH';
    if (role === 'ADMIN') return 'ADMIN';
    return 'EMPLOYE'; // EMPLOYEE → EMPLOYE
  }

  private applyFilters(): void {
    const text = this.searchCtrl.value.trim().toLowerCase();
    const role = this.roleFilter.value;
    this.dataSource.filterPredicate = (row) => {
      const matchText =
        !text ||
        (row.firstName + ' ' + row.lastName + ' ' + row.email + ' ' + row.department)
          .toLowerCase()
          .includes(text);
      const matchRole = !role || row.role === role;
      return matchText && matchRole;
    };
    this.dataSource.filter = text + role;
  }

  protected roleLabel(role: UserRole): string {
    const map: Record<UserRole, string> = { EMPLOYEE: 'Collaborateur', HR: 'RH', ADMIN: 'Admin' };
    return map[role] ?? role;
  }

  protected openDialog(user?: AdminUiUser): void {
    const ref = this.dialog.open(AdminUserDialogComponent, {
      width: '520px',
      data: user ?? null,
      panelClass: 'tc-dialog',
    });
    ref.afterClosed().subscribe((result: (UserProfile & { password?: string }) | null) => {
      if (!result) return;
      if (user) {
        this.api
          .putTo<void>(this.api.authBase, `admin/users/${user.id}`, {
            firstName: result.firstName || null,
            lastName: result.lastName || null,
            department: result.department || null,
            location: result.location || null,
            title: result.title || null,
            roles: [this.toBackendRole(result.role)],
          })
          .subscribe({
            next: () => {
              this.load();
              this.toast.success('Utilisateur mis à jour.');
            },
            error: () => {
              this.toast.error("Impossible de mettre à jour l'utilisateur.");
            },
          });
      } else {
        this.api
          .postTo<BackendAdminUser>(this.api.authBase, 'admin/users', {
            email: result.email,
            password: result.password,
            roles: [this.toBackendRole(result.role)],
            firstName: result.firstName || null,
            lastName: result.lastName || null,
            department: result.department || null,
            location: result.location || null,
            title: result.title || null,
            experienceYears: result.experienceYears ?? 0,
            languages: result.languages ?? [],
            skills: result.skills ?? [],
          })
          .subscribe({
            next: () => {
              this.load();
              this.toast.success('Utilisateur créé avec succès.');
            },
            error: (err: { status?: number; error?: { code?: string } }) => {
              if (err.status === 409) {
                this.toast.error('Cet e-mail est déjà utilisé.');
              } else if (err.status === 400) {
                this.toast.error('Données invalides. Vérifiez le formulaire.');
              } else {
                this.toast.error('Création utilisateur échouée.');
              }
            },
          });
      }
    });
  }

  protected changeRole(user: AdminUiUser): void {
    const roles: UserRole[] = ['EMPLOYEE', 'HR', 'ADMIN'];
    const current = roles.indexOf(user.role);
    const next = roles[(current + 1) % roles.length];
    this.api
      .patchAt<void>(this.api.authBase, `admin/users/${user.id}/roles`, {
        roles: [this.toBackendRole(next)],
      })
      .subscribe({
        next: () => {
          this.load();
          this.toast.open('Role change en ' + this.roleLabel(next), 'OK', { duration: 2500 });
        },
        error: () => {
          this.toast.open('Impossible de changer le role.', 'OK', { duration: 3000 });
        },
      });
  }

  protected deactivate(user: AdminUiUser): void {
    this.api.patchAt<void>(this.api.authBase, `admin/users/${user.id}/enabled/false`).subscribe({
      next: () => {
        this.load();
        this.toast.open('Compte desactive.', 'OK', { duration: 2500 });
      },
      error: () => {
        this.toast.open('Impossible de desactiver le compte.', 'OK', { duration: 3000 });
      },
    });
  }

  protected reactivate(user: AdminUiUser): void {
    this.api.patchAt<void>(this.api.authBase, `admin/users/${user.id}/enabled/true`).subscribe({
      next: () => {
        this.load();
        this.toast.open('Compte reactive.', 'OK', { duration: 2500 });
      },
      error: () => {
        this.toast.open('Impossible de reactiver le compte.', 'OK', { duration: 3000 });
      },
    });
  }

  protected deleteUser(user: AdminUiUser): void {
    this.api.deleteFrom<void>(this.api.authBase, `admin/users/${user.id}`).subscribe({
      next: () => {
        this.load();
        this.toast.open('Utilisateur supprime.', 'OK', { duration: 2500 });
      },
      error: () => {
        this.toast.open('Impossible de supprimer cet utilisateur.', 'OK', { duration: 3000 });
      },
    });
  }

  protected exportCsv(): void {
    const rows = [
      ['Prénom', 'Nom', 'Email', 'Rôle', 'Département', 'Site'],
      ...this.dataSource.filteredData.map((u) => [
        u.firstName,
        u.lastName,
        u.email,
        u.role,
        u.department,
        u.location,
      ]),
    ];
    const csv = rows.map((r) => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utilisateurs-' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    this.toast.open('Export CSV téléchargé.', 'OK', { duration: 2000 });
  }
}
