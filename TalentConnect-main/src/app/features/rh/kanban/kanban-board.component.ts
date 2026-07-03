import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanBoardComponent {
  protected readonly stages = ['received', 'interview', 'offer', 'hired'] as const;

  protected readonly columns = {
    received: [
      { id: 'a1', title: 'Alexandre Dupont', subtitle: 'Développeur Angular' },
      { id: 'a2', title: 'Sofia Martin', subtitle: 'Chef de projet' },
    ],
    interview: [{ id: 'b1', title: 'Léa Durand', subtitle: 'QA Analyst' }],
    offer: [{ id: 'c1', title: 'Omar Ben', subtitle: 'Ingénieur DevOps' }],
    hired: [{ id: 'd1', title: 'Emma Faure', subtitle: 'Product Owner' }],
  } as Record<string, { id: string; title: string; subtitle: string }[]>;

  protected drop(event: CdkDragDrop<{ id: string; title: string; subtitle: string }[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
  }
}
