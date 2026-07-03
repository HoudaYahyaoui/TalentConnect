export type UserRole = 'EMPLOYEE' | 'HR' | 'ADMIN';
export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED';
export type ApplicationStatus =
  | 'SUBMITTED'
  | 'REVIEW'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED';
export type CandidateSource = 'INTERNAL' | 'REFERRAL';
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface UserProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: string;
  location: string;
  title: string;
  skills: string[];
  experienceYears: number;
  avatarUrl?: string;
  languages: string[];
}

export interface JobOffer {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  seniority: 'Junior' | 'Confirmé' | 'Senior' | 'Lead';
  status: JobStatus;
  description: string;
  requirements: string[];
  tags: string[];
  publishedAt: string;
  closingAt: string;
  hiringManager: string;
  recommendedScore?: number;
}

export interface TimelineEntry {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  author: string;
}

export interface DocumentFile {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  previewUrl?: string;
  downloadUrl?: string;
  scanStatus: 'PENDING' | 'SAFE' | 'FAILED';
  uploadedAt: string;
}

export interface ApplicationRecord {
  // ── Backend fields (candidatures-service response) ────────────────────────
  id: string;
  offerId: number; // job offer ID from backend
  applicantUserId?: number;
  type?: string; // 'INTERNE' | 'RECOMMANDATION'
  status: ApplicationStatus;
  createdAt: string;
  updatedAt?: string;
  cvFileId?: string | null;
  referralId?: number | null;
  // ── Derived / display fields (set by adapter) ─────────────────────────────
  jobId: string; // String(offerId) — kept for legacy store compat
  candidateName: string; // 'Employé #N' fallback (no name in API)
  source: CandidateSource; // derived from type: INTERNE→INTERNAL, RECOMMANDATION→REFERRAL
  score: number; // 0 — not returned by backend
  timeline: TimelineEntry[];
  documents: DocumentFile[];
  notes?: string;
}

export interface ReferralDraft {
  id: string;
  referrerEmail: string; // extracted from JWT by backend
  candidateFullName: string;
  candidateEmail: string;
  candidatePhone: string;
  linkedIn?: string;
  targetJobId: string;
  skills: string[];
  cvDocumentId?: string;
  createdAt: string;
  status: ApplicationStatus | 'DRAFT';
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  deepLink?: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  location?: string;
  department?: string;
  alertEnabled: boolean;
}

export interface AuditEvent {
  id: string;
  actor: string;
  actorRole: UserRole;
  action: string;
  entityType: 'JOB' | 'APPLICATION' | 'REFERRAL' | 'DOCUMENT';
  entityId: string;
  timestamp: string;
  details: string;
}

export interface DashboardMetrics {
  activeJobs: number;
  applicationsInProgress: number;
  referralsSubmitted: number;
  recommendedJobs: number;
}

export interface HrDashboardMetrics {
  totalJobOffers: number;
  publishedJobs: number;
  totalReferrals: number;
  hiredFromReferral: number;
  auditEventsToday: number;
  totalAuditEvents: number;
  // Derived on frontend from candidatures-service
  totalApplications: number;
  // Extended metrics (computed or returned by backend)
  internalCandidates: number;
  referrals: number;
  conversionRate: number;
  avgTimeToHire: number;
}

export interface KanbanColumn {
  status: ApplicationStatus;
  label: string;
  items: ApplicationRecord[];
}

export interface ChatbotReply {
  answer: string;
  intent: 'JOB' | 'REFERRAL' | 'STATUS' | 'HELP';
  suggestions: string[];
  sources: string[];
  fallbackAction?: string;
}
