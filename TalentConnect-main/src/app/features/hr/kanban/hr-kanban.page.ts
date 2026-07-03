import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToastService } from '../../../shared/services/toast.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApplicationsAdapter } from '../../../data-access/api/adapters/applications.adapter';
import { KanbanColumn, ApplicationRecord } from '../../../data-access/models/portal.models';
import { StatusChipComponent } from '../../../shared/ui/status-chip.component';
import { SkeletonListComponent, ErrorStateComponent } from '../../../shared/components/page-states';

@Component({
  selector: 'app-hr-kanban-page',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    StatusChipComponent,
    SkeletonListComponent,
    ErrorStateComponent,
  ],
  template: `
    @if (loading()) {
      <app-skeleton-list [count]="4"></app-skeleton-list>
    } @else if (error()) {
      <app-error-state title="Impossible de charger le tableau" (retry)="load()"></app-error-state>
    } @else {
      <div class="kanban-header">
        <h2>Recrutement — Pipeline</h2>
        <span class="total-badge">{{ totalCards() }} candidatures</span>
      </div>
      <div class="kanban-grid">
        <div
          *ngFor="let col of columns()"
          class="kanban-column"
          [id]="col.status"
          cdkDropList
          [cdkDropListData]="col.items"
          [cdkDropListConnectedTo]="connectedLists()"
          (cdkDropListDropped)="onDrop($event, col)"
        >
          <header class="col-header">
            <span class="col-label">{{ col.label }}</span>
            <span class="col-count">{{ col.items.length }}</span>
          </header>

          <div *ngFor="let card of col.items" class="kanban-card" cdkDrag [cdkDragData]="card">
            <div class="drag-handle" cdkDragHandle>
              <mat-icon>drag_indicator</mat-icon>
            </div>
            <strong>{{ card.candidateName }}</strong>
            <p class="card-meta">
              {{ card.source }} &bull; {{ card.createdAt | date: 'dd/MM/yy' }}
            </p>
            <div class="card-footer">
              <app-status-chip [status]="card.status"></app-status-chip>
            </div>
            <div class="cdk-drag-placeholder" *cdkDragPlaceholder>
              <div class="placeholder-inner"></div>
            </div>
          </div>

          <div *ngIf="col.items.length === 0" class="col-empty">Aucune candidature</div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .kanban-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      .total-badge {
        background: var(--surface-highlight);
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 0.85rem;
        color: var(--brand-700);
      }
      .kanban-grid {
        display: flex;
        gap: 1rem;
        overflow-x: auto;
        padding-bottom: 1rem;
        align-items: flex-start;
      }
      .kanban-column {
        min-width: 220px;
        max-width: 260px;
        flex-shrink: 0;
        background: var(--surface-raised);
        border: 1px solid var(--border-subtle);
        border-radius: 1.25rem;
        padding: 1rem;
        min-height: 400px;
      }
      .col-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }
      .col-label {
        font-weight: 600;
        font-size: 0.9rem;
      }
      .col-count {
        background: var(--border-subtle);
        border-radius: 999px;
        padding: 2px 8px;
        font-size: 0.8rem;
      }
      .kanban-card {
        background: var(--surface-muted);
        border-radius: 1rem;
        padding: 0.9rem;
        margin-bottom: 0.75rem;
        cursor: grab;
        position: relative;
        transition: box-shadow 0.15s;
      }
      .kanban-card:hover {
        box-shadow: var(--shadow-soft);
      }
      .kanban-card.cdk-drag-dragging {
        opacity: 0.85;
        box-shadow: var(--shadow-overlay);
      }
      .drag-handle {
        position: absolute;
        top: 8px;
        right: 8px;
        color: var(--text-soft);
        cursor: grab;
      }
      .card-meta {
        margin: 0.3rem 0 0.5rem;
        color: var(--text-muted);
        font-size: 0.82rem;
      }
      .card-footer {
        display: flex;
        justify-content: flex-end;
      }
      .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .cdk-drop-list-dragging .kanban-card:not(.cdk-drag-placeholder) {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
      }
      .placeholder-inner {
        background: var(--surface-highlight);
        border: 2px dashed var(--brand-500);
        border-radius: 1rem;
        height: 72px;
      }
      .col-empty {
        text-align: center;
        color: var(--text-soft);
        font-size: 0.85rem;
        padding: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HrKanbanPageComponent implements OnInit {
  private readonly adapter = inject(ApplicationsAdapter);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly columns = signal<KanbanColumn[]>([]);

  protected readonly totalCards = () => this.columns().reduce((sum, c) => sum + c.items.length, 0);
  protected readonly connectedLists = () => this.columns().map((c) => c.status);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(false);
    this.adapter.getKanbanColumns().subscribe({
      next: (cols) => {
        this.columns.set(cols);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  protected onDrop(event: CdkDragDrop<ApplicationRecord[]>, targetCol: KanbanColumn): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const card = event.item.data as ApplicationRecord;
      const previousCol = this.columns().find((c) => c.status === event.previousContainer.id);

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      this.adapter.patchStatus(card.id, targetCol.status).subscribe({
        next: () => {
          this.adapter.refreshCache();
          this.toast.open(card.candidateName + ' deplace vers ' + targetCol.label, 'OK', {
            duration: 2500,
          });
        },
        error: () => {
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex,
          );
          this.columns.update((cols) =>
            cols.map((c) => {
              if (c.status === targetCol.status) return { ...c, items: [...event.container.data] };
              if (previousCol && c.status === previousCol.status) {
                return { ...c, items: [...event.previousContainer.data] };
              }
              return c;
            }),
          );
          this.toast.open('Impossible de mettre a jour le statut.', 'OK', { duration: 3000 });
        },
      });
    }
    this.columns.update((cols) => [...cols]);
  }
}
