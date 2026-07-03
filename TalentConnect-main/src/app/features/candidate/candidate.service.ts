import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { JobsAdapter } from '../../data-access/api/adapters/jobs.adapter';
import { ApplicationsAdapter } from '../../data-access/api/adapters/applications.adapter';
import {
  JobOffer as BackendJobOffer,
  ApplicationRecord,
} from '../../data-access/models/portal.models';
import { Application, Candidate, JobOffer, User } from '../../api/models/api-models';

@Injectable({
  providedIn: 'root',
})
class CandidateService {
  private readonly jobsAdapter = inject(JobsAdapter);
  private readonly applicationsAdapter = inject(ApplicationsAdapter);
  private readonly authService = inject(AuthService);

  getOffers(): Observable<JobOffer[]> {
    return this.jobsAdapter
      .getJobs()
      .pipe(map((jobs) => jobs.map((job) => this.toLegacyOffer(job))));
  }

  getApplications(): Observable<Application[]> {
    return this.applicationsAdapter
      .getApplications()
      .pipe(map((records) => records.map((record) => this.toLegacyApplication(record))));
  }

  getCandidateProfile(): Observable<Candidate> {
    return this.authService.getUserProfile().pipe(
      map((user) => ({
        id: String(user.id),
        displayName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        title: user.title || 'Collaborateur',
        department: user.department || '',
        location: user.location || '',
        skills: user.skills || [],
        experienceYears: user.experienceYears || 0,
        score: undefined,
      })),
    );
  }

  getUsers(): Observable<User[]> {
    return this.authService.getUserProfile().pipe(
      map((user) => [
        {
          id: String(user.id),
          displayName: `${user.firstName} ${user.lastName}`.trim() || user.email,
          email: user.email,
          role: 'ROLE_CANDIDATE',
          permissions: [],
          avatarUrl: user.avatarUrl,
          department: user.department,
          position: user.title,
        },
      ]),
    );
  }

  private toLegacyOffer(job: any): JobOffer {
    return {
      id: job.id,
      title: job.title,
      department: job.department ?? '',
      location: job.location ?? '',

      // 🔥 FIX IMPORTANT NULL SAFETY
      postedAt: job.publishedAt ?? job.createdAt ?? '',

      status: job.status === 'OPEN' ? 'Ouverte' : job.status === 'CLOSED' ? 'Fermée' : 'En cours',

      tags: job.tags ?? [],
      matchScore: job.recommendedScore ?? 0,
      description: job.description ?? '',
    };
  }

  private toLegacyApplication(record: ApplicationRecord): Application {
    return {
      id: record.id,
      offerId: String(record.offerId),
      candidateId: String(record.applicantUserId ?? record.id),
      status: this.mapApplicationStatus(record.status),
      appliedAt: record.createdAt,
      offerTitle: record.jobId,
    };
  }

  private mapApplicationStatus(status: ApplicationRecord['status']): Application['status'] {
    const map: Record<string, Application['status']> = {
      SUBMITTED: 'En attente',
      REVIEW: 'En attente',
      INTERVIEW: 'Entretien',
      OFFER: 'Offre',
      HIRED: 'Embauché',
      REJECTED: 'Rejeté',
    };
    return map[status] ?? 'En attente';
  }
}

export default CandidateService
