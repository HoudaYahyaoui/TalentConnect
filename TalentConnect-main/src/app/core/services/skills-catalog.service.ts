import { Injectable } from '@angular/core';

export interface SkillGroup {
  domain: string;
  skills: string[];
}

export const SKILL_CATALOG: SkillGroup[] = [
  {
    domain: 'IT & Développement',
    skills: ['Angular', 'React', 'Vue.js', 'TypeScript', 'Java', 'Spring Boot',
             'Node.js', 'Python', 'SQL', 'PostgreSQL', 'MongoDB', 'Docker',
             'Kubernetes', 'CI/CD', 'DevOps', 'AWS', 'Azure', 'REST API',
             'GraphQL', 'Microservices'],
  },
  {
    domain: 'Ressources Humaines',
    skills: ['Recrutement', 'Paie', 'ATS', 'GPEC', 'Formation', 'Onboarding',
             'Entretiens annuels', 'Droit du travail', 'HRIS', 'Employer branding'],
  },
  {
    domain: 'Finance & Gestion',
    skills: ['Contrôle de gestion', 'Comptabilité', 'Audit', 'Trésorerie',
             'Reporting', 'Excel avancé', 'SAP', 'IFRS', 'Budget prévisionnel'],
  },
  {
    domain: 'Marketing & Communication',
    skills: ['Marketing digital', 'SEO/SEA', 'Community management', 'Copywriting',
             'Emailing', 'Analytics', 'Brand strategy', 'InDesign', 'Figma'],
  },
  {
    domain: 'Commerce & Vente',
    skills: ['Développement commercial', 'Négociation', 'CRM', 'Salesforce',
             'Account management', 'Prospection', 'B2B', 'Avant-vente'],
  },
  {
    domain: 'Data & IA',
    skills: ['Python', 'R', 'Machine Learning', 'Deep Learning', 'NLP',
             'Power BI', 'Tableau', 'Spark', 'Hadoop', 'ETL', 'LLM'],
  },
  {
    domain: 'Design & UX',
    skills: ['Figma', 'UX Research', 'Design System', 'Prototypage',
             'Accessibility', 'Motion design', 'Adobe XD', 'User testing'],
  },
  {
    domain: 'Management & Conseil',
    skills: ['Gestion de projet', 'Agile', 'Scrum', 'PRINCE2', 'Change management',
             'Leadership', 'Coaching', 'Consulting', 'PMO'],
  },
];

@Injectable({ providedIn: 'root' })
export class SkillsCatalogService {
  readonly domains = SKILL_CATALOG.map((g) => g.domain);

  getSkillsForDomain(domain: string): string[] {
    return SKILL_CATALOG.find((g) => g.domain === domain)?.skills ?? [];
  }

  searchSkills(domain: string, query: string): string[] {
    const q = query.toLowerCase();
    return this.getSkillsForDomain(domain).filter((s) => s.toLowerCase().includes(q));
  }
}
