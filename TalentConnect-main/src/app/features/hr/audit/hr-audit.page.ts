import {
  AfterViewInit, ChangeDetectionStrategy, Component, inject, OnInit, signal, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { NotificationsAdapter } from '../../../data-access/api/adapters/notifications.adapter';
import { AuditEvent } from '../../../data-access/models/portal.models';
import {
  SkeletonListComponent, EmptyStateComponent, ErrorStateComponent,
} from '../../../shared/components/page-states';

@Component({
  selector: 'app-hr-audit-page',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatInputModule, MatFormFieldModule, MatIconModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    SkeletonListComponent, EmptyStateComponent, ErrorStateComponent,
  ],
  template: `
    @if (loading()) {
      <app-skeleton-list [count]="6"></app-skeleton-list>
    } @else if (error()) {
      <app-error-state title="Impossible de charger l'audit" (retry)="load()"></app-error-state>
    } @else {
      <section class="panel">
        <h2>Audit trail</h2>
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
          <mat-label>Rechercher dans l'audit</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [formControl]="searchCtrl" />
        </mat-form-field>

        @if (dataSource.filteredData.length === 0) {
          <app-empty-state icon="verified_user" title="Aucun \u00e9v\u00e9nement"
            message="L'historique d'audit est vide."></app-empty-state>
        } @else {
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z0">
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Action</th>
                <td mat-cell *matCellDef="let row">{{ row.action }}</td>
              </ng-container>
              <ng-container matColumnDef="actor">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Acteur</th>
                <td mat-cell *matCellDef="let row">{{ row.actor }}</td>
              </ng-container>
              <ng-container matColumnDef="entityType">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
                <td mat-cell *matCellDef="let row">{{ row.entityType }}</td>
              </ng-container>
              <ng-container matColumnDef="details">
                <th mat-header-cell *matHeaderCellDef>D\u00e9tails</th>
                <td mat-cell *matCellDef="let row">{{ row.details }}</td>
              </ng-container>
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
                <td mat-cell *matCellDef="let row">{{ row.timestamp | date: 'dd/MM/yyyy HH:mm' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns"></tr>
            </table>
          </div>
          <mat-paginator [pageSizeOptions]="[10, 25, 50]" [pageSize]="25" showFirstLastButtons></mat-paginator>
        }
      </section>
    }
  `,
  styles: [`
    .panel { background: var(--surface-raised); border: 1px solid var(--border-subtle); border-radius: 1.25rem; padding: 1.25rem; }
    .search-field { width: 100%; margin-bottom: 0.75rem; }
    .table-container { overflow-x: auto; }
    table { width: 100%; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HrAuditPageComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly adapter = inject(NotificationsAdapter);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly searchCtrl = new FormControl('', { nonNullable: true });
  protected readonly dataSource = new MatTableDataSource<AuditEvent>();
  protected readonly columns = ['action', 'actor', 'entityType', 'details', 'timestamp'];

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(startWith(''), debounceTime(300), distinctUntilChanged())
      .subscribe((v) => { this.dataSource.filter = v.trim().toLowerCase(); });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  protected load(): void {
    this.loading.set(true); this.error.set(false);
    this.adapter.getAuditEvents().subscribe({
      next: (d) => { this.dataSource.data = d; this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set(true); },
    });
  }
}