import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OfferService } from '../../../core/services/offer.service';
import { Offer } from '../../../core/models';

@Component({
  selector: 'app-offers-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offers-list.component.html',
  styleUrls: ['./offers-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersListComponent implements OnInit {
  private offerService = inject(OfferService);
  private router = inject(Router);

  offers = signal<Offer[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadOffers();
  }

  loadOffers() {
    this.isLoading.set(true);
    this.offerService.getOffers().subscribe((offers) => {
      this.offers.set(offers);
      this.isLoading.set(false);
    });
  }

  viewOffer(id: string) {
    this.router.navigate(['/app/offers', id]);
  }
}
