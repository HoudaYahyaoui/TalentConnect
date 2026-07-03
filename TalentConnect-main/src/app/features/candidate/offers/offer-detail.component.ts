import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CandidateFacade } from '../candidate.facade';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly candidateFacade = inject(CandidateFacade);

  protected readonly offer = this.candidateFacade.currentOffer;

  constructor() {
    const offerId = this.route.snapshot.paramMap.get('id');
    if (offerId) {
      this.candidateFacade.loadOfferById(offerId);
    }
  }

  protected apply() {
    this.router.navigate(['app', 'candidate', 'applications']);
  }
}
