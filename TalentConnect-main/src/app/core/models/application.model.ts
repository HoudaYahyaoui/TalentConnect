/**
 * Application Model - Représente une candidature interne ou externe
 */
export interface Application {
  id: string;
  offerId: string;
  candidateId: string;
  status: string;
  appliedAt: Date;
}
