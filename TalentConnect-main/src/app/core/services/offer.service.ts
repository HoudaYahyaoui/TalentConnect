import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Offer } from '../models';
import { JobsAdapter } from '../../data-access/api/adapters/jobs.adapter';
import { JobOffer as BackendJobOffer } from '../../data-access/models/portal.models';
import { JobOffer as PortalJobOffer } from '../../data-access/models/portal.models';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private readonly jobsAdapter = inject(JobsAdapter);

  getOffers(): Observable<Offer[]> {
    return this.jobsAdapter
      .getJobs()
      .pipe(map((jobs) => jobs.map((job) => this.toLegacyOffer(job))));
  }

  getOfferById(id: string): Observable<Offer | null> {
    return this.jobsAdapter
      .getJobById(id)
      .pipe(map((job) => (job ? this.toLegacyOffer(job) : null)));
  }

  createOffer(offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Observable<Offer> {
    return this.jobsAdapter
      .createJob(this.toBackendPayload(offer))
      .pipe(map((job) => this.toLegacyOffer(job)));
  }

  updateOffer(id: string, offer: Partial<Offer>): Observable<Offer | null> {
    return this.jobsAdapter
      .updateJob(id, this.toBackendPayload(offer))
      .pipe(map((job) => this.toLegacyOffer(job)));
  }

  deleteOffer(id: string): Observable<boolean> {
    return this.jobsAdapter.deleteJob(id).pipe(map(() => true));
  }

  private toLegacyOffer(job: BackendJobOffer): Offer {
    return {
      id: String(job.id),
      title: job.title,
      description: job.description,
      department: job.department ?? 'TalentConnect',
      location: job.location,
      type: job.employmentType ?? 'FULL_TIME',
      status: job.status ?? 'DRAFT',
      createdAt: new Date((job as any).createdAt ?? job.publishedAt ?? Date.now()),
      updatedAt: new Date((job as any).updatedAt ?? job.publishedAt ?? Date.now()),
    };
  }

  private toBackendPayload(offer: Partial<Offer>): {
    title: string;
    department: string;
    location: string;
    employmentType: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
    seniority: 'Junior' | 'Confirmé' | 'Senior' | 'Lead';
    status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED';
    description: string;
    requirements?: string[];
    tags?: string[];
  } {
    const type = offer.type ?? 'FULL_TIME';
    const employmentType =
      type === 'FULL_TIME'
        ? 'CDI'
        : type === 'PART_TIME'
          ? 'CDD'
          : type === 'CONTRACT'
            ? 'Freelance'
            : type === 'INTERN'
              ? 'Stage'
              : 'CDI';
    return {
      title: offer.title ?? '',
      department: offer.department ?? 'TalentConnect',
      location: offer.location ?? '',
      employmentType,
      seniority: 'Confirmé',
      status: (offer.status as PortalJobOffer['status']) ?? 'DRAFT',
      description: offer.description ?? '',
      requirements: [],
      tags: [],
    };
  }
}
