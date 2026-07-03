/**
 * Application Model - Candidature
 */

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SHORTLISTED = 'SHORTLISTED',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName?: string;
  candidateEmail?: string;
  status: ApplicationStatus;
  cvUrl: string;
  coverLetter?: string;
  appliedAt: Date;
  updatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  notes?: string;
}

export interface CreateApplicationDTO {
  jobId: string;
  cvUrl: string;
  coverLetter?: string;
}

export interface UpdateApplicationDTO {
  status: ApplicationStatus;
  notes?: string;
}

export interface ApplicationFilter {
  jobId?: string;
  status?: ApplicationStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}
