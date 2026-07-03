import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { ApplicationsAdapter } from '../../../data-access/api/adapters/applications.adapter';
import { ApplicationRecord } from '../../../data-access/models/portal.models';
import { FileService } from '../../../core/services/file.service';
import { StatusChipComponent } from '../../../shared/ui/status-chip.component';
import {
  SkeletonListComponent,
  EmptyStateComponent,
  ErrorStateComponent,
} from '../../../shared/components/page-states';
import { HrCandidateDetailDialogComponent } from './hr-candidate-detail-dialog.component';

@Component({
  selector: 'app-hr-candidates-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatChipsModule,
    StatusChipComponent,
    SkeletonListComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    @if (loading()) {
      <app-skeleton-list [count]="5"></app-skeleton-list>
    } @else if (error()) {
      <app-error-state
        title="Impossible de charger les candidats"
        (retry)="load()"
      ></app-error-state>
    } @else {
      <section class="panel">
        <h2>Gestion des candidats</h2>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
          <mat-label>Rechercher un candidat</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [formControl]="searchCtrl" />
        </mat-form-field>

        @if (dataSource.filteredData.length === 0) {
          <app-empty-state
            icon="person_off"
            title="Aucun candidat"
            message="Aucun candidat ne correspond aux critères."
          ></app-empty-state>
        } @else {
          <div class="table-container">
            <table
              mat-table
              [dataSource]="dataSource"
              matSort
              class="mat-elevation-z0 clickable-rows"
            >
              <ng-container matColumnDef="candidateName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Candidat</th>
                <td mat-cell *matCellDef="let row">
                  <div class="name-cell">
                    <div class="row-avatar">{{ (row.candidateName || '?').charAt(0) }}</div>
                    <span>{{ row.candidateName || 'Inconnu' }}</span>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="source">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Source</th>
                <td mat-cell *matCellDef="let row">
                  <span
                    class="source-chip"
                    [class]="'src-' + (row.source || 'internal').toLowerCase()"
                    >{{ row.source }}</span
                  >
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Statut</th>
                <td mat-cell *matCellDef="let row">
                  <app-status-chip [status]="row.status"></app-status-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                <td mat-cell *matCellDef="let row">{{ row.createdAt | date: 'dd/MM/yyyy' }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let row" (click)="$event.stopPropagation()">
                  <button
                    mat-icon-button
                    matTooltip="Voir le dossier"
                    type="button"
                    (click)="openDetail(row)"
                  >
                    <mat-icon>open_in_new</mat-icon>
                  </button>
                  <button mat-icon-button [matMenuTriggerFor]="menu" type="button">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="downloadCv(row.id)">
                      <mat-icon>download</mat-icon> Télécharger CV
                    </button>
                    <button mat-menu-item (click)="changeStatus(row)">
                      <mat-icon>swap_horiz</mat-icon> Changer statut
                    </button>
                  </mat-menu>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: columns"
                (click)="openDetail(row)"
                class="data-row"
              ></tr>
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
        border-radius: 1.25rem;
        padding: 1.25rem;
      }
      .search-field {
        width: 100%;
        margin-bottom: 0.75rem;
      }
      .table-container {
        overflow-x: auto;
        border-radius: 12px;
        border: 1px solid var(--border-subtle);
      }
      table {
        width: 100%;
      }
      .clickable-rows .data-row {
        cursor: pointer;
        transition: background 120ms;
      }
      .clickable-rows .data-row:hover {
        background: var(--surface-highlight);
      }
      .name-cell {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .row-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--brand-100);
        color: var(--brand-700);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        font-weight: 700;
        flex-shrink: 0;
      }
      .source-chip {
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 0.72rem;
        font-weight: 600;
      }
      .src-internal {
        background: rgba(59, 130, 246, 0.12);
        color: #3b82f6;
      }
      .src-referral {
        background: rgba(139, 92, 246, 0.12);
        color: #8b5cf6;
      }
      .score-pill {
        padding: 2px 10px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 700;
        background: rgba(100, 116, 139, 0.1);
        color: var(--text-soft);
      }
      .score-pill.high {
        background: rgba(34, 197, 94, 0.12);
        color: #16a34a;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HrCandidatesPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly adapter = inject(ApplicationsAdapter);
  private readonly toast = inject(ToastService);
  private readonly fileService = inject(FileService);
  private readonly dialog = inject(MatDialog);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly searchCtrl = new FormControl('', { nonNullable: true });
  protected readonly dataSource = new MatTableDataSource<ApplicationRecord>();
  protected readonly columns = [
    'candidateName',
    'source',
    'status',
    'createdAt',
    'actions',
  ];

  constructor() {
    // Connect paginator & sort after @if reveals the table (loading → false)
    effect(() => {
      if (!this.loading()) {
        // Run after the DOM has been updated
        Promise.resolve().then(() => {
          if (this.paginator) this.dataSource.paginator = this.paginator;
          if (this.sort) this.dataSource.sort = this.sort;
          this.cdr.markForCheck();
        });
      }
    });
  }

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges
      .pipe(startWith(''), debounceTime(300), distinctUntilChanged())
      .subscribe((v) => {
        this.dataSource.filter = v.trim().toLowerCase();
      });
  }

  ngAfterViewInit(): void {
    // Paginator/sort are connected via effect() when @if reveals the table
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.adapter.getApplications().subscribe({
      next: (d) => {
        this.dataSource.data = d;
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  protected openDetail(row: ApplicationRecord): void {
    this.dialog
      .open(HrCandidateDetailDialogComponent, {
        data: row,
        maxWidth: '640px',
        width: '100%',
        panelClass: 'dialog-panel',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.updated) {
          this.dataSource.data = this.dataSource.data.map((r) =>
            r.id === result.candidate.id ? result.candidate : r,
          );
        }
      });
  }

  protected downloadCv(id: string): void {
    const row = this.dataSource.data.find((r) => r.id === id);
    const cvFileId = row?.cvFileId;
    if (!cvFileId) {
      this.toast.open('Aucun CV disponible pour ce candidat', 'Fermer', { duration: 3000 });
      return;
    }
    this.fileService.download(cvFileId).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv-${(row?.candidateName ?? id).replace(/\s+/g, '-').toLowerCase()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        this.toast.open('CV t\u00e9l\u00e9charg\u00e9', '', { duration: 2000 });
      },
      error: () => {
        this.toast.open('Impossible de t\u00e9l\u00e9charger le CV', 'Fermer', { duration: 4000 });
      },
    });
  }

  protected changeStatus(row: ApplicationRecord): void {
    this.openDetail(row);
  }
}
