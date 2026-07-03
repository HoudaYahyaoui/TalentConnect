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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { ToastService } from '../../../shared/services/toast.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { JobsAdapter } from '../../../data-access/api/adapters/jobs.adapter';
import { JobOffer } from '../../../data-access/models/portal.models';
import { StatusChipComponent } from '../../../shared/ui/status-chip.component';
import {
  SkeletonListComponent,
  EmptyStateComponent,
  ErrorStateComponent,
} from '../../../shared/components/page-states';
import { HrJobDialogComponent } from './hr-job-dialog.component';

@Component({
  selector: 'app-hr-jobs-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatDialogModule,
    MatMenuModule,
    SkeletonListComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    @if (loading()) {
      <app-skeleton-list [count]="6"></app-skeleton-list>
    } @else if (error()) {
      <app-error-state
        title="Impossible de charger les offres"
        (retry)="loadJobs()"
      ></app-error-state>
    } @else {
      <section class="panel">
        <div class="head-row">
          <div>
            <p class="eyebrow">GESTION DES OFFRES</p>
            <h2>Piloter les offres</h2>
          </div>
          <button mat-flat-button color="primary" type="button" (click)="createJob()">
            <mat-icon>add</mat-icon> Cr&eacute;er une offre
          </button>
        </div>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
          <mat-label>Rechercher une offre</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [formControl]="searchCtrl" />
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="status-filter">
          <mat-label>Filtrer par statut</mat-label>
          <mat-select [formControl]="statusFilterCtrl">
            <mat-option value="">Tous</mat-option>
            <mat-option value="OPEN">Ouvert</mat-option>
            <mat-option value="CLOSED">Fermé</mat-option>
            <mat-option value="DRAFT">Brouillon</mat-option>
            <mat-option value="ARCHIVED">Archivé</mat-option>
          </mat-select>
        </mat-form-field>

        @if (dataSource.filteredData.length === 0) {
          <app-empty-state
            icon="work_off"
            title="Aucune offre trouv&eacute;e"
            message="Aucune offre ne correspond &agrave; votre recherche."
            actionLabel="R&eacute;initialiser"
            (action)="searchCtrl.setValue('')"
          ></app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z0">
              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Titre</th>
                <td mat-cell *matCellDef="let row">{{ row.title }}</td>
              </ng-container>
              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>D&eacute;partement</th>
                <td mat-cell *matCellDef="let row">{{ row.department }}</td>
              </ng-container>
              <ng-container matColumnDef="location">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Lieu</th>
                <td mat-cell *matCellDef="let row">{{ row.location }}</td>
              </ng-container>
               <ng-container matColumnDef="status">
                 <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                 <td mat-cell *matCellDef="let row" class="status-cell">
                   <button
                     mat-button
                     [matMenuTriggerFor]="statusMenu"
                     class="status-button"
                     [class.status-draft]="row.status === 'DRAFT'"
                     [class.status-open]="row.status === 'OPEN'"
                     [class.status-closed]="row.status === 'CLOSED'"
                   >
                     {{ row.status === 'DRAFT' ? 'Brouillon' : (row.status === 'OPEN' ? 'Ouvert' : 'Fermé') }}
                     <mat-icon>arrow_drop_down</mat-icon>
                   </button>
                   <mat-menu #statusMenu="matMenu">
                     <button mat-menu-item (click)="updateJobStatus(row.id, 'DRAFT')" [disabled]="row.status === 'DRAFT'">
                       <mat-icon>draft</mat-icon>
                       <span>Brouillon</span>
                     </button>
                     <button mat-menu-item (click)="updateJobStatus(row.id, 'OPEN')" [disabled]="row.status === 'OPEN'">
                       <mat-icon>public</mat-icon>
                       <span>Ouvert</span>
                     </button>
                     <button mat-menu-item (click)="updateJobStatus(row.id, 'CLOSED')" [disabled]="row.status === 'CLOSED'">
                       <mat-icon>block</mat-icon>
                       <span>Fermé</span>
                     </button>
                   </mat-menu>
                 </td>
               </ng-container>
               <ng-container matColumnDef="publishedAt">
                 <th mat-header-cell *matHeaderCellDef mat-sort-header>Publié le</th>
                 <td mat-cell *matCellDef="let row">{{ row.publishedAt | date: 'dd/MM/yyyy' }}</td>
               </ng-container>
               <ng-container matColumnDef="closingAt">
                 <th mat-header-cell *matHeaderCellDef mat-sort-header>Clôture</th>
                 <td mat-cell *matCellDef="let row">{{ row.closingAt ? (row.closingAt | date: 'dd/MM/yyyy') : '-' }}</td>
               </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let row" class="actions-cell">
                  <button
                    mat-icon-button
                    type="button"
                    matTooltip="Modifier"
                    (click)="editJob(row.id)"
                    aria-label="Modifier l'offre"
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    mat-icon-button
                    type="button"
                    matTooltip="Cl&ocirc;turer"
                    color="warn"
                    (click)="closeJob(row.id)"
                    aria-label="Cl&ocirc;turer l'offre"
                  >
                    <mat-icon>block</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>
          <mat-paginator
            [pageSizeOptions]="[5, 10, 25]"
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
        margin: 0 0 0.25rem;
        color: var(--text-soft);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.72rem;
        font-weight: 600;
      }
      .search-field {
        width: 100%;
        max-width: 400px;
        margin-bottom: 0.5rem;
      }
      .status-filter {
        width: 200px;
        margin-bottom: 0.5rem;
        margin-left: 1rem;
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
      .actions-cell {
        display: flex;
        gap: 2px;
        justify-content: flex-end;
        padding-right: 8px !important;
      }
      .status-cell {
        padding: 0 !important;
      }
      .status-button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 12px !important;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 600;
        overflow: hidden;
      }
      .status-button mat-icon {
        font-size: 18px !important;
        width: 18px !important;
        height: 18px !important;
      }
      .status-draft {
        background: rgba(245, 158, 11, 0.12) !important;
        color: #b45309 !important;
      }
      .status-open {
        background: rgba(34, 197, 94, 0.12) !important;
        color: #15803d !important;
      }
      .status-closed {
        background: rgba(239, 68, 68, 0.12) !important;
        color: #b91c1c !important;
      }
      @media (max-width: 900px) {
        .head-row {
          flex-direction: column;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HrJobsPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly jobsAdapter = inject(JobsAdapter);
  private readonly toast = inject(ToastService);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly searchCtrl = new FormControl('', { nonNullable: true });
  protected readonly statusFilterCtrl = new FormControl('', { nonNullable: true });
  protected readonly dataSource = new MatTableDataSource<JobOffer>();
  private allJobs: JobOffer[] = [];
  protected readonly displayedColumns = [
    'title',
    'department',
    'location',
    'status',
    'publishedAt',
    'closingAt',
    'actions',
  ];

  ngOnInit(): void {
    this.loadJobs();
    this.searchCtrl.valueChanges
      .pipe(startWith(''), debounceTime(300), distinctUntilChanged())
      .subscribe((v) => {
        // Use a case-insensitive filter that checks title, department, location, description and tags
        // Ensure filter is a string and lower-cased for comparison
        this.dataSource.filter = (v ?? '').trim().toLowerCase();
      });
    this.statusFilterCtrl.valueChanges.pipe(startWith('')).subscribe((status) => {
      this.applyStatusFilter(status);
    });

    // Configure a custom filter predicate so MatTableDataSource performs a case-insensitive
    // search over the relevant fields (title, department, location, description, tags).
    this.dataSource.filterPredicate = (data: JobOffer, filter: string) => {
      const q = (filter ?? '').trim().toLowerCase();
      if (!q) return true;
      const searchable = [data.title, data.department, data.location, data.description]
        .concat(data.tags ?? [])
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(q);
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  protected loadJobs(): void {
    this.loading.set(true);
    this.error.set(false);
    // Validate that we have a token and an admin/HR user before calling admin endpoint
    const token = localStorage.getItem('tc_token');
    const rawUser = localStorage.getItem('tc_user');
    const user = rawUser ? JSON.parse(rawUser) : null;


    if (!token) {
      this.loading.set(false);
      this.error.set(true);
      this.toast.open('Jeton manquant. Connectez-vous avant d\'accéder aux offres RH.', 'OK', { duration: 5000 });
      return;
    }
    if (!user || !user.role || (user.role !== 'HR' && user.role !== 'ADMIN' && user.role !== 'RH')) {
      this.loading.set(false);
      this.error.set(true);
      this.toast.open('Accès refusé: compte non autorisé pour la vue RH.', 'OK', { duration: 5000 });
      return;
    }

    // Use admin endpoint to retrieve all offers (not only OPEN) for HR view
    this.jobsAdapter.getJobsAdmin().subscribe({
      next: (jobs) => {
        this.allJobs = jobs;
        this.applyStatusFilter(this.statusFilterCtrl.value);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  private applyStatusFilter(status: string): void {
    if (status) {
      this.dataSource.data = this.allJobs.filter((j) => j.status === status);
    } else {
      this.dataSource.data = this.allJobs;
    }
    // Re-apply current text filter after changing the datasource so filteredData updates
    this.dataSource.filter = (this.searchCtrl.value ?? '').trim().toLowerCase();
  }

  protected createJob(): void {
    this.dialog
      .open(HrJobDialogComponent, {
        data: {},
        panelClass: 'dialog-panel',
        maxWidth: '620px',
        width: '100%',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.jobsAdapter.createJob(result).subscribe({
            next: (created) => {
              this.jobsAdapter.refreshCache();
              this.allJobs = [created, ...this.allJobs];
              this.applyStatusFilter(this.statusFilterCtrl.value);
              this.toast.open(`Offre "${created.title}" cr\u00e9\u00e9e avec succ\u00e8s`, '', {
                duration: 3000,
              });
            },
            error: (err: { status?: number }) => {
              const msg =
                err.status === 403
                  ? 'Seul un administrateur peut cr\u00e9er une offre.'
                  : 'Impossible de cr\u00e9er l offre.';
              this.toast.open(msg, 'OK', { duration: 4000 });
            },
          });
        }
      });
  }

  protected editJob(id: string): void {
    const job = this.dataSource.data.find((j) => j.id === id);
    if (!job) return;
    this.dialog
      .open(HrJobDialogComponent, {
        data: { job },
        panelClass: 'dialog-panel',
        maxWidth: '620px',
        width: '100%',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.jobsAdapter.updateJob(id, result).subscribe({
            next: (updated) => {
              this.jobsAdapter.refreshCache();
              this.allJobs = this.allJobs.map((j) => (j.id === id ? updated : j));
              this.applyStatusFilter(this.statusFilterCtrl.value);
              this.toast.open(`Offre "${updated.title}" mise \u00e0 jour`, '', { duration: 3000 });
            },
            error: (err: { status?: number }) => {
              const msg =
                err.status === 403
                  ? 'Seul un administrateur peut modifier cette offre.'
                  : 'Impossible de modifier cette offre.';
              this.toast.open(msg, 'OK', { duration: 4000 });
            },
          });
        }
      });
  }

  protected closeJob(id: string): void {
    // Get the current job to preserve its data
    const currentJob = this.allJobs.find((j) => j.id === id);
    if (!currentJob) return;

     // Use updateJob with status CLOSED - send the full job payload
     // This ensures all required fields are sent to the backend
     this.jobsAdapter.updateJob(id, { ...currentJob, status: 'CLOSED' }).subscribe({
       next: (updated) => {
         this.jobsAdapter.refreshCache();
         this.allJobs = this.allJobs.map((j) => (j.id === id ? updated : j));
         // Force table refresh
         this.dataSource.data = [...this.allJobs];
         this.applyStatusFilter(this.statusFilterCtrl.value);
         this.toast.open('Offre clôturée', '', { duration: 2500 });
       },
      error: (err) => {
        console.error('Error closing job:', err);
        this.toast.open('Impossible de clôturer cette offre.', 'OK', { duration: 3000 });
      },
    });
  }

  protected updateJobStatus(id: string, newStatus: string): void {
    const currentJob = this.allJobs.find((j) => j.id === id);
    if (!currentJob) return;

    // Use updateJob (PUT) instead of patchStatus which causes 500 error
    this.jobsAdapter.updateJob(id, { ...currentJob, status: newStatus as any }).subscribe({
      next: (updated) => {
        this.jobsAdapter.refreshCache();
        this.allJobs = this.allJobs.map((j) => (j.id === id ? updated : j));
        // Force table refresh
        this.dataSource.data = [...this.allJobs];
        this.applyStatusFilter(this.statusFilterCtrl.value);
        const statusLabel = newStatus === 'DRAFT' ? 'Brouillon' : (newStatus === 'OPEN' ? 'Ouvert' : 'Fermé');
        this.toast.open(`Statut mis à jour: ${statusLabel}`, '', { duration: 2500 });
      },
      error: (err: { status?: number }) => {
        console.error('Error updating job status:', err);
        const msg = err.status === 400
          ? 'Statut invalide. Veuillez vérifier votre sélection.'
          : 'Impossible de mettre à jour le statut.';
        this.toast.open(msg, 'OK', { duration: 4000 });
      },
    });
  }
}
