import { computed, Injectable, signal } from '@angular/core';

const LS_KEY = 'tc_referrals';

export interface Referral {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  domain: string;
  skills: string[];
  cvFileName?: string;
  comment?: string;
  status: 'Soumise' | 'En cours' | 'Acceptée' | 'Refusée';
  createdAt: string;
  createdByUserId?: string;
}

@Injectable({ providedIn: 'root' })
export class ReferralsService {
  private readonly _referrals = signal<Referral[]>(this.load());

  readonly referrals = this._referrals.asReadonly();
  readonly count = computed(() => this._referrals().length);

  add(data: Omit<Referral, 'id' | 'createdAt' | 'status'>): Referral {
    const ref: Referral = {
      ...data,
      id: 'ref-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      status: 'Soumise',
      createdAt: new Date().toISOString(),
    };
    this._referrals.update((list) => [ref, ...list]);
    this.persist();
    return ref;
  }

  remove(id: string): void {
    this._referrals.update((list) => list.filter((r) => r.id !== id));
    this.persist();
  }

  private load(): Referral[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : this.seed();
    } catch { return []; }
  }

  private seed(): Referral[] {
    const s: Referral[] = [
      {
        id: 'ref-seed-1',
        firstName: 'Karim', lastName: 'Mansour',
        email: 'karim.mansour@gmail.com', phone: '+33 6 12 34 56 78',
        domain: 'IT & Développement',
        skills: ['Angular', 'TypeScript', 'Docker'],
        status: 'En cours',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(s));
    return s;
  }

  private persist(): void {
    localStorage.setItem(LS_KEY, JSON.stringify(this._referrals()));
  }
}
