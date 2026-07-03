import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiHttpService } from '../http/api-http.service';
import { ReferralDraft } from '../../models/portal.models';

/**
 * Matches backend ReferralRequest (job-service :8085, JWT auth).
 * referrerEmail is extracted from the JWT — do NOT send it.
 * All fields optional except status (defaults to DRAFT on backend).
 */
export interface ReferralCreatePayload {
  candidateFullName: string;
  candidateEmail: string;
  candidatePhone: string;
  linkedIn?: string;
  targetJobId?: string;
  skills: string[];
  cvDocumentId?: string;
}

/** Shape of what the job-service actually returns */
interface BackendReferral {
  id: number | string;
  referrerEmail?: string;
  candidateFullName: string;
  candidateEmail: string;
  candidatePhone: string;
  linkedIn?: string;
  targetJobId: string;
  skills: string[];
  cvDocumentId?: string;
  status: string;
  createdAt: string;
}

function toReferralDraft(r: BackendReferral): ReferralDraft {
  return {
    id: String(r.id),
    referrerEmail: r.referrerEmail ?? '',
    candidateFullName: r.candidateFullName,
    candidateEmail: r.candidateEmail,
    candidatePhone: r.candidatePhone,
    linkedIn: r.linkedIn,
    targetJobId: r.targetJobId,
    skills: r.skills ?? [],
    cvDocumentId: r.cvDocumentId,
    createdAt: r.createdAt,
    status: r.status as ReferralDraft['status'],
  };
}

@Injectable({ providedIn: 'root' })
export class ReferralsAdapter {
  private readonly api = inject(ApiHttpService);

  /** GET /api/referrals/mine — job-service :8085, JWT */
  getReferrals(): Observable<ReferralDraft[]> {
    if (!this.api.isMock) {
      return this.api
        .getFromSilent<BackendReferral[]>(this.api.jobsBase, 'referrals/mine')
        .pipe(map((list) => list.map(toReferralDraft)));
    }
    return this.api.mockGet<ReferralDraft[]>('referrals.json');
  }

  /** GET /api/referrals — all referrals (HR view), job-service :8085, JWT */
  getAllReferrals(): Observable<ReferralDraft[]> {
    if (!this.api.isMock) {
      return this.api
        .getFrom<BackendReferral[]>(this.api.jobsBase, 'referrals')
        .pipe(map((list) => (Array.isArray(list) ? list : []).map(toReferralDraft)));
    }
    return this.api.mockGet<ReferralDraft[]>('referrals.json');
  }

  /** POST /api/referrals — job-service :8085, JWT */
  createReferral(referral: ReferralCreatePayload): Observable<ReferralDraft> {
    if (this.api.isMock) throw new Error('createReferral not supported in mock mode');
    // Backend expects targetJobId as Long — convert numeric strings, omit if empty
    const body: Record<string, unknown> = {
      candidateFullName: referral.candidateFullName,
      candidateEmail: referral.candidateEmail,
      candidatePhone: referral.candidatePhone,
      skills: referral.skills ?? [],
    };
    if (referral.linkedIn) body['linkedIn'] = referral.linkedIn;
    if (referral.cvDocumentId) body['cvDocumentId'] = referral.cvDocumentId;
    if (referral.targetJobId) {
      const numId = Number(referral.targetJobId);
      body['targetJobId'] = Number.isFinite(numId) && numId > 0 ? numId : referral.targetJobId;
    }
    return this.api
      .postTo<BackendReferral>(this.api.jobsBase, 'referrals', body)
      .pipe(map(toReferralDraft));
  }

  /** DELETE /api/referrals/{id} — job-service :8085, JWT */
  deleteReferral(id: string): Observable<void> {
    if (this.api.isMock) throw new Error('deleteReferral not supported in mock mode');
    return this.api.deleteFrom<void>(this.api.jobsBase, `referrals/${id}`);
  }
}
