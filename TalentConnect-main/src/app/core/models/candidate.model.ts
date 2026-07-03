/**
 * Candidate Model - Représente un candidat / candidature externe
 */
export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  cvUrl: string;
  status: string;
  recommendedBy: string;
  isExternal: boolean;
  appliedAt: Date;
}
