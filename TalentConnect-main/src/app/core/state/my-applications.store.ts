import { computed, Injectable, signal, inject } from '@angular/core';
import { SessionStore } from './session.store';
import { ApplicationsAdapter } from '../../data-access/api/adapters/applications.adapter';
import { ApplicationStatus } from '../../data-access/models/portal.models';

/**
 * Représentation locale d'une candidature
 * Mappée depuis ApplicationRecord (candidatures-service)
 */
export interface MyApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  score?: number;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class MyApplicationsStore {
  private readonly session = inject(SessionStore);
  private readonly applicationsAdapter = inject(ApplicationsAdapter);

  // État
  private readonly _applications = signal<MyApplication[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Signaux publics
  readonly applications = this._applications.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  // Signaux dérivés
  readonly pending = computed(() =>
    this._applications().filter((a) => !['HIRED', 'REJECTED'].includes(a.status)),
  );

  readonly active = computed(() =>
    this._applications().filter((a) =>
      ['SUBMITTED', 'REVIEW', 'INTERVIEW', 'OFFER'].includes(a.status),
    ),
  );

  readonly count = computed(() => this._applications().length);

  readonly activeCount = computed(() => this.active().length);

  /**
   * Charge les candidatures de l'utilisateur connecté via candidatures-service
   */
  loadMine(_page: number = 0, _size: number = 20): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.applicationsAdapter.getMyApplications().subscribe({
      next: (apps) => {
        this._applications.set(
          apps.map((app) => ({
            id: Number(app.id),
            jobId: Number(app.jobId),
            jobTitle: (app as { jobTitle?: string }).jobTitle ?? '',
            status: app.status,
            appliedAt: app.createdAt,
            updatedAt: app.updatedAt ?? app.createdAt,
            score: app.score,
            notes: app.notes,
          })),
        );
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des candidatures:', err);
        this._error.set(err?.error?.message || 'Erreur lors du chargement des candidatures');
        this._isLoading.set(false);
      },
    });
  }

  /**
   * Vérifie si l'utilisateur a postulé à une offre
   */
  hasApplied(jobId: number): boolean {
    return this._applications().some((a) => a.jobId === jobId);
  }

  /**
   * Soumet une nouvelle candidature via candidatures-service
   */
  apply(jobId: number): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.applicationsAdapter.apply(String(jobId)).subscribe({
      next: (app) => {
        this._applications.update((list) => [
          {
            id: Number(app.id),
            jobId: Number(app.jobId),
            jobTitle: (app as { jobTitle?: string }).jobTitle ?? '',
            status: app.status,
            appliedAt: app.createdAt,
            updatedAt: app.updatedAt ?? app.createdAt,
            score: app.score,
            notes: app.notes,
          },
          ...list,
        ]);
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors de la candidature:', err);
        const errorMessage =
          err.status === 409
            ? 'Vous avez déjà postulé à cette offre'
            : (err?.error?.message ?? 'Erreur lors de la candidature');
        this._error.set(errorMessage);
        this._isLoading.set(false);
      },
    });
  }

  /**
   * Retire une candidature
   */
  withdraw(id: number): void {
    this._isLoading.set(true);
    this._error.set(null);

    this.applicationsAdapter.withdraw(String(id)).subscribe({
      next: () => {
        this._applications.update((list) => list.filter((a) => a.id !== id));
        this._isLoading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors du retrait de la candidature:', err);
        this._error.set(err?.error?.message || 'Erreur lors du retrait');
        this._isLoading.set(false);
      },
    });
  }

  /**
   * Récupère une candidature spécifique
   */
  getById(id: number): MyApplication | undefined {
    return this._applications().find((a) => a.id === id);
  }

  /**
   * Efface l'erreur
   */
  clearError(): void {
    this._error.set(null);
  }
}
