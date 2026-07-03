export type UserRole = 'ROLE_CANDIDATE' | 'ROLE_HR' | 'ROLE_ADMIN';

export interface Permission {
  id: string;
  key: string;
  label: string;
}

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  permissions: string[];
  avatarUrl?: string;
  department?: string;
  position?: string;
  password?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  remember: boolean;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface JobOffer {
  id: string;
  title: string;
  department: string;
  location: string;
  postedAt: string;
  status: 'Ouverte' | 'Fermée' | 'En cours';
  tags: string[];
  matchScore: number;
  description: string;
}

export interface Application {
  id: string;
  offerId: string;
  candidateId: string;
  status: 'En attente' | 'Entretien' | 'Offre' | 'Embauché' | 'Rejeté';
  appliedAt: string;
  offerTitle?: string;
}

export interface Candidate {
  id: string;
  displayName: string;
  title: string;
  department?: string;
  location: string;
  skills?: string[];
  experienceYears: number;
  score?: number;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  user: string;
  target: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'To do' | 'In progress' | 'Completed';
  dueDate: string;
  owner: string;
}

export interface ChatbotIntent {
  question: string;
  answer: string;
  tags: string[];
}
