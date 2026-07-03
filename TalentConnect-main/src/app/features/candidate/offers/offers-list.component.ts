import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { CandidateFacade } from '../candidate.facade';

@Component({
  selector: 'app-offers-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './offers-list.component.html',
  styleUrls: ['./offers-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersListComponent {
  private readonly candidateFacade = inject(CandidateFacade);
  private readonly router = inject(Router);

  protected readonly offers = this.candidateFacade.offers;

  protected openOffer(id: string) {
    this.router.navigate(['app', 'candidate', 'offers', id]);
  }
}
