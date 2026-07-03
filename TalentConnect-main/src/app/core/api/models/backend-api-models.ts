/**
 * BACKEND API MODELS
 * ==================
 * Interfaces TypeScript correspondant aux DTOs Spring Boot du contrat API (v1.0)
 *
 * Cartographie:
 *   - talentconnect-backend:8080 → UserDto, JobOfferDto, ApplicationDto, etc.
 *   - auth-service:8081 → AuthToken, UserAuthDto
 *   - file-service:8082 → FileDto
 *   - candidatures-service:8084 → CandidatureDto
 *   - chatbot-service:8083 → ChatResponse
 */

// ============================================================================
// ENUMS / CONSTANTES
// ============================================================================

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  HR = 'HR',
  ADMIN = 'ADMIN',
}

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  REVIEW = 'REVIEW',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

export enum CandidatureStatus {
  SOUMISE = 'SOUMISE',
  EN_COURS = 'EN_COURS',
  ENTRETIEN = 'ENTRETIEN',
  REFUSEE = 'REFUSEE',
  RECRUTEE = 'RECRUTEE',
}

export enum CandidatureType {
  INTERNE = 'INTERNE',
  RECOMMANDATION = 'RECOMMANDATION',
}

export enum JobOfferStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export enum EmploymentType {
  CDI = 'CDI',
  CDD = 'CDD',
  STAGE = 'STAGE',
  FREELANCE = 'FREELANCE',
}

export enum JobServiceEmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  TEMPORARY = 'TEMPORARY',
}

export enum SeniorityLevel {
  JUNIOR = 'JUNIOR',
  CONFIRME = 'CONFIRME',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
}

export enum JobServiceSeniorityLevel {
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
}

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export enum ReferralStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVIEW = 'REVIEW',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  HIRED = 'HIRED',
  REJECTED = 'REJECTED',
}

export enum ApplicationSource {
  INTERNAL = 'INTERNAL',
  REFERRAL = 'REFERRAL',
}

export enum AuditAction {
  APPLY = 'APPLY',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  timestamp: string; // ISO 8601, peut être sans Z
  status: number;
}

export interface ApiErrorResponse {
  error: string;
  status: number;
  timestamp: string;
}

export interface PageDto<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  token: string;
  user: UserDto;
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  email: string;
  roles: string[];
}

// ============================================================================
// USERS / EMPLOYEES
// ============================================================================

export interface UserDto {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department?: string;
  location?: string;
  title?: string;
  skills?: string[];
  experienceYears?: number;
  avatarUrl?: string;
  languages?: string[];
}

export interface UserProfileUpdateDto {
  firstName?: string;
  lastName?: string;
  department?: string;
  location?: string;
  title?: string;
  avatarUrl?: string;
  experienceYears?: number;
}

// ============================================================================
// JOB OFFERS - talentconnect-backend
// ============================================================================

export interface JobOfferDto {
  id: number;
  title: string;
  department?: string;
  location: string;
  description: string;
  employmentType?: EmploymentType;
  seniority?: SeniorityLevel;
  status: JobOfferStatus;
  requirements?: string[];
  tags?: string[];
  publishedAt?: string;
  closingAt?: string;
  hiringManager?: string;
  recommendedScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobOfferCreateDto {
  title: string;
  department?: string;
  location: string;
  description: string;
  employmentType?: EmploymentType;
  seniority?: SeniorityLevel;
  status?: JobOfferStatus;
  requirements?: string[];
  tags?: string[];
  publishedAt?: string;
  closingAt?: string;
  hiringManager?: string;
  recommendedScore?: number;
}

// ============================================================================
// JOB OFFERS - job-service (microservice)
// ============================================================================

export interface JobOfferResponse {
  id: string; // UUID
  title: string;
  companyName: string;
  location: string;
  employmentType: JobServiceEmploymentType;
  experienceLevel: JobServiceSeniorityLevel;
  remote: boolean;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  published: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobOfferCreateRequest {
  title: string;
  companyName: string;
  location: string;
  employmentType: JobServiceEmploymentType;
  experienceLevel: JobServiceSeniorityLevel;
  remote: boolean;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  published?: boolean;
}

// ============================================================================
// APPLICATIONS - talentconnect-backend
// ============================================================================

export interface ApplicationDto {
  id: number;
  jobId: number;
  jobTitle: string;
  employeeId: number;
  candidateName?: string;
  source: ApplicationSource;
  status: ApplicationStatus;
  score?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  timeline?: ApplicationTimeline[];
  documents?: ApplicationDocument[];
}

export interface ApplicationCreateDto {
  jobId: number;
  source?: ApplicationSource;
}

export interface ApplicationStatusUpdateDto {
  status: ApplicationStatus;
}

export interface ApplicationTimeline {
  id: number;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  changedAt: string;
  changedBy: number;
  changedByRole: UserRole;
}

export interface ApplicationDocument {
  id: number;
  downloadUrl: string;
  uploadedAt: string;
}

// ============================================================================
// CANDIDATURES - candidatures-service (microservice)
// ============================================================================

export interface CandidatureResponse {
  id: number;
  offerId: number;
  applicantUserId: number;
  type: CandidatureType;
  status: CandidatureStatus;
  createdAt: string;
  updatedAt: string;
  cvFileId?: string;
  referralId?: number;
}

export interface CandidatureDetailsResponse {
  candidature: CandidatureResponse;
  history: CandidatureHistory[];
}

export interface CandidatureHistory {
  id: number;
  fromStatus: CandidatureStatus;
  toStatus: CandidatureStatus;
  changedAt: string;
  changedBy: number;
  changedByRole: string;
}

export interface CandidatureCreateRequest {
  offerId: number;
  type: CandidatureType;
  referralId?: number;
}

export interface CandidatureStatusUpdateRequest {
  newStatus: CandidatureStatus;
}

export interface CandidatureCvUpdateRequest {
  cvFileId: string;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface NotificationDto {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  deepLink?: string;
  createdAt: string;
}

// ============================================================================
// REFERRALS / COOPTATION
// ============================================================================

export interface ReferralDto {
  id: number;
  referrerEmployeeId: number;
  referrerName: string;
  candidateFullName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  linkedIn?: string;
  targetJobId: number;
  targetJobTitle: string;
  skills?: string[];
  cvDocumentId?: string;
  status: ReferralStatus;
  createdAt: string;
}

export interface ReferralCreateDto {
  candidateFullName: string;
  candidateEmail?: string;
  candidatePhone?: string;
  linkedIn?: string;
  targetJobId: number;
  skills?: string[];
  cvDocumentId?: string;
  status?: ReferralStatus;
}

// ============================================================================
// FILES - file-service
// ============================================================================

export interface FileUploadResponse {
  fileId: string; // UUID
  fileName: string;
  size: string;
}

export interface FileMetadata {
  fileId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface FileServiceHealthResponse {
  status: string;
  service: string;
}

// ============================================================================
// CHATBOT - chatbot-service
// ============================================================================

export interface ChatMessage {
  userId: string;
  message: string;
}

export interface ChatResponse {
  userId: string;
  message: string;
  response: string;
  intent: string;
  createdAt: string;
}

export interface ConversationResponse {
  id: number;
  userId: string;
  userMessage: string;
  botResponse: string;
  createdAt: string;
}

export interface ChatbotHealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

// ============================================================================
// METRICS & AUDIT
// ============================================================================

export interface HRMetrics {
  totalApplications: number;
  internalCandidates: number;
  referrals: number;
  avgTimeToHire: number;
  conversionRate: number;
}

export interface AuditEvent {
  id: number;
  actor: string;
  actorRole: UserRole;
  action: AuditAction;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}
