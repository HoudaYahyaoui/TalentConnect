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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { ToastService } from '../../../shared/services/toast.service';
import { ReferralsAdapter } from '../../../data-access/api/adapters/referrals.adapter';
import { ReferralDraft } from '../../../data-access/models/portal.models';
import { StatusChipComponent } from '../../../shared/ui/status-chip.component';
import {
  SkeletonListComponent,
  EmptyStateComponent,
  ErrorStateComponent,
} from '../../../shared/components/page-states';

@Component({
  selector: 'app-hr-referrals-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
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
        title="Impossible de charger les cooptations"
        (retry)="load()"
      ></app-error-state>
    } @else {
      <section class="panel">
        <div class="head-row">
          <div>
            <p class="eyebrow">COOPTATIONS</p>
            <h2>Gestion des recommandations</h2>
          </div>
        </div>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
          <mat-label>Rechercher une cooptation</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [formControl]="searchCtrl" />
        </mat-form-field>

        @if (dataSource.filteredData.length === 0) {
          <app-empty-state
            icon="recommend"
            title="Aucune cooptation"
            message="Aucune recommandation n'a été soumise."
          ></app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z0">
              <ng-container matColumnDef="candidateFullName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Candidat</th>
                <td mat-cell *matCellDef="let row">
                  <div class="name-cell">
                    <div class="row-avatar">{{ (row.candidateFullName || '?').charAt(0) }}</div>
                    <div>
                      <strong>{{ row.candidateFullName }}</strong>
                      <small class="email-text">{{ row.candidateEmail }}</small>
                    </div>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="referrerEmail">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Recommandé par</th>
                <td mat-cell *matCellDef="let row">{{ row.referrerEmail }}</td>
              </ng-container>
              <ng-container matColumnDef="targetJobId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Offre cible</th>
                <td mat-cell *matCellDef="let row">{{ row.targetJobId || '—' }}</td>
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
                  <button mat-icon-button [matMenuTriggerFor]="menu" type="button">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="deleteReferral(row)">
                      <mat-icon color="warn">delete</mat-icon> Supprimer
                    </button>
                  </mat-menu>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns"></tr>
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
      .table-container {
        overflow-x: auto;
        border-radius: 12px;
        border: 1px solid var(--border-subtle);
      }
      table {
        width: 100%;
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
      .email-text {
        display: block;
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HrReferralsPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly adapter = inject(ReferralsAdapter);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly searchCtrl = new FormControl('', { nonNullable: true });
  protected readonly dataSource = new MatTableDataSource<ReferralDraft>();
  protected readonly columns = [
    'candidateFullName',
    'referrerEmail',
    'targetJobId',
    'status',
    'createdAt',
    'actions',
  ];

  constructor() {
    effect(() => {
      if (!this.loading()) {
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

  ngAfterViewInit(): void {}

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.adapter.getAllReferrals().subscribe({
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

  protected deleteReferral(row: ReferralDraft): void {
    this.adapter.deleteReferral(row.id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((r) => r.id !== row.id);
        this.toast.open('Cooptation supprimée', '', { duration: 2500 });
      },
      error: () => {
        this.toast.open('Impossible de supprimer cette cooptation', 'Fermer', { duration: 4000 });
      },
    });
  }
}
