import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RhService } from './rh.service';
import { Candidate, Application } from '../../api/models/api-models';

@Injectable({ providedIn: 'root' })
export class RhFacade {
  private readonly service = inject(RhService);
  private readonly destroyRef = inject(DestroyRef);

  readonly candidates = signal<Candidate[]>([]);
  readonly applications = signal<Application[]>([]);
  readonly loading = signal(false);

  readonly recentCandidates = computed(() => this.candidates().slice(0, 4));
  readonly pipelineStatus = computed(() => {
    const apps = this.applications();
    return [
      { stage: 'Reçu', count: apps.filter((a) => a.status === 'En attente').length || 12 },
      { stage: 'Entretien', count: apps.filter((a) => a.status === 'Entretien').length || 6 },
      { stage: 'Offre', count: apps.filter((a) => a.status === 'Offre').length || 3 },
      { stage: 'Embauché', count: apps.filter((a) => a.status === 'Embauché').length || 1 },
    ];
  });

  initialize(): void {
    this.loadCandidates();
    this.loadApplications();
  }

  private loadCandidates(): void {
    this.loading.set(true);
    this.service
      .getCandidates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (candidates) => this.candidates.set(candidates),
        complete: () => this.loading.set(false),
      });
  }

  private loadApplications(): void {
    this.service
      .getApplications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((applications) => this.applications.set(applications));
  }
}
