import { computed, Injectable, inject } from '@angular/core';
import { SessionStore } from '../state/session.store';

const dictionary = {
  fr: {
    common: {
      appName: 'TalentConnect',
      logout: 'Déconnexion',
      employee: 'Collaborateur',
      hr: 'RH',
      admin: 'Admin',
    },
  },
  en: {
    common: {
      appName: 'TalentConnect',
      logout: 'Logout',
      employee: 'Employee',
      hr: 'HR',
      admin: 'Admin',
    },
  },
} as const;

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly sessionStore = inject(SessionStore);
  readonly language = this.sessionStore.language;
  readonly currentDictionary = computed(() => dictionary[this.language()]);

  t(path: string): string {
    const segments = path.split('.');
    let current: unknown = this.currentDictionary();

    for (const segment of segments) {
      current = (current as Record<string, unknown>)?.[segment];
    }

    return typeof current === 'string' ? current : path;
  }
}
