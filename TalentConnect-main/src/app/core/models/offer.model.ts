/**
 * Offer Model - Représente une offre d'emploi
 */
export interface Offer {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
