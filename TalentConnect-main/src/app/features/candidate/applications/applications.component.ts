import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { CandidateFacade } from '../candidate.facade';

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsComponent {
  private readonly candidateFacade = inject(CandidateFacade);
  protected readonly applications = computed(() => this.candidateFacade.applications());
}
