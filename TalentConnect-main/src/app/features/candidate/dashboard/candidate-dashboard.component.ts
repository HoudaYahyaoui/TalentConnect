import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { CandidateFacade } from '../candidate.facade';
import { JobOffer, Application } from '../../../api/models/api-models';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatListModule],
  templateUrl: './candidate-dashboard.component.html',
  styleUrls: ['./candidate-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateDashboardComponent implements OnInit {
  private readonly candidateFacade = inject(CandidateFacade);

  protected readonly recentOffers = computed(() => this.candidateFacade.recentOffers());
  protected readonly openApplications = computed(() => this.candidateFacade.applications());

  ngOnInit(): void {
    this.candidateFacade.initialize();
  }

  protected trackByOffer(_index: number, offer: JobOffer): string {
    return offer.id;
  }

  protected trackByApplication(_index: number, app: Application): string {
    return app.id;
  }
}
