export const storage = {
  get(key: string): string | null {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  },

  getJson<T>(key: string): T | null {
    const raw = this.get(key);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  set(key: string, value: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(key, value);
  },

  setJson(key: string, value: unknown): void {
    this.set(key, JSON.stringify(value));
  },

  remove(key: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(key);
  },
};
