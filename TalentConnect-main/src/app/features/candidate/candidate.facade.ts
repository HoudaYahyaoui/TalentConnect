import { DestroyRef, inject, Injectable, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import CandidateService from './candidate.service';
import { Application, Candidate, JobOffer } from '../../api/models/api-models';

@Injectable({
  providedIn: 'root',
})
export class CandidateFacade {
  private readonly service = inject(CandidateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly offers = signal<JobOffer[]>([]);
  readonly applications = signal<Application[]>([]);
  readonly profile = signal<Candidate | null>(null);
  readonly currentOffer = signal<JobOffer | null>(null);
  readonly loading = signal(false);

  readonly recentOffers = computed(() => this.offers().slice(0, 3));

  initialize(): void {
    this.loadOffers();
    this.loadApplications();
    this.loadProfile();
  }

  loadOffers(): void {
    this.loading.set(true);
    this.service
      .getOffers()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (offers) => this.offers.set(offers),
        complete: () => this.loading.set(false),
      });
  }

  loadApplications(): void {
    this.service
      .getApplications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((applications) => this.applications.set(applications));
  }

  loadProfile(): void {
    this.service
      .getCandidateProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((profile) => this.profile.set(profile));
  }

  loadOfferById(id: string): void {
    const current = this.offers().find((offer) => offer.id === id) ?? null;
    this.currentOffer.set(current);
  }
}
