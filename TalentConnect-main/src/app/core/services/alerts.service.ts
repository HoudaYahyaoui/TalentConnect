import { computed, Injectable, signal } from '@angular/core';

const LS_KEY = 'tc_alerts';

export type AlertSeverity = 'info' | 'success' | 'warning' | 'error';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  deepLink?: string;
}

@Injectable({ providedIn: 'root' })
export class AlertsService {
  private readonly _alerts = signal<Alert[]>(this.load());

  readonly alerts = this._alerts.asReadonly();
  readonly unreadCount = computed(() => this._alerts().filter((a) => !a.read).length);

  markRead(id: string): void {
    this._alerts.update((list) =>
      list.map((a) => a.id === id ? { ...a, read: true } : a)
    );
    this.persist();
  }

  markAllRead(): void {
    this._alerts.update((list) => list.map((a) => ({ ...a, read: true })));
    this.persist();
  }

  dismiss(id: string): void {
    this._alerts.update((list) => list.filter((a) => a.id !== id));
    this.persist();
  }

  push(alert: Omit<Alert, 'id' | 'createdAt' | 'read'>): void {
    const a: Alert = {
      ...alert,
      id: 'alrt-' + Date.now(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    this._alerts.update((list) => [a, ...list]);
    this.persist();
  }

  private load(): Alert[] {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : this.seed();
    } catch { return this.seed(); }
  }

  private seed(): Alert[] {
    const now = Date.now();
    const s: Alert[] = [
      {
        id: 'alrt-seed-1', severity: 'info', read: false,
        title: 'Entretien planifié',
        message: 'Votre entretien pour Lead Angular Engineer est confirmé le 10 mai à 14h.',
        createdAt: new Date(now - 1 * 86400000).toISOString(),
        deepLink: '/app/employee/applications',
      },
      {
        id: 'alrt-seed-2', severity: 'success', read: false,
        title: 'Candidature en cours de traitement',
        message: 'Votre dossier pour Angular Tech Lead est passé à l\'étape "Analyse".',
        createdAt: new Date(now - 2 * 86400000).toISOString(),
      },
      {
        id: 'alrt-seed-3', severity: 'warning', read: true,
        title: 'Offre bientôt clôturée',
        message: 'L\'offre "Data Scientist – Lyon" ferme dans 3 jours.',
        createdAt: new Date(now - 4 * 86400000).toISOString(),
        deepLink: '/app/employee/jobs',
      },
      {
        id: 'alrt-seed-4', severity: 'success', read: true,
        title: 'Recommandation acceptée',
        message: 'Karim Mansour a été contacté suite à votre cooptation.',
        createdAt: new Date(now - 6 * 86400000).toISOString(),
      },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(s));
    return s;
  }

  private persist(): void {
    localStorage.setItem(LS_KEY, JSON.stringify(this._alerts()));
  }
}
