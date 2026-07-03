import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferService } from '../../../core/services/offer.service';
import { Offer } from '../../../core/models';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfferDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offerService = inject(OfferService);

  offer = signal<Offer | null>(null);
  isLoading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOffer(id);
    }
  }

  loadOffer(id: string) {
    this.isLoading.set(true);
    this.offerService.getOfferById(id).subscribe(offer => {
      this.offer.set(offer);
      this.isLoading.set(false);
    });
  }

  apply() {
    const id = this.offer()?.id;
    if (id) {
      this.router.navigate(['/apply', id]);
    }
  }
}