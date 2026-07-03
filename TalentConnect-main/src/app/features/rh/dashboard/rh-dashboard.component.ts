import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RhFacade } from '../rh.facade';
import { Candidate } from '../../../api/models/api-models';

@Component({
  selector: 'app-rh-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule],
  templateUrl: './rh-dashboard.component.html',
  styleUrls: ['./rh-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RhDashboardComponent implements OnInit {
  private readonly rhFacade = inject(RhFacade);

  protected readonly recentCandidates = this.rhFacade.recentCandidates;
  protected readonly pipelineStatus = this.rhFacade.pipelineStatus;

  ngOnInit(): void {
    this.rhFacade.initialize();
  }

  protected trackByCandidate(_index: number, candidate: Candidate): string {
    return candidate.id;
  }

  protected trackByStage(_index: number, item: { stage: string }): string {
    return item.stage;
  }
}
