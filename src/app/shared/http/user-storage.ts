const USER_KEY = 'auth.user';

type StoredUser = { id: string; name: string; email: string };

export const userStorage = {
  get(): StoredUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as StoredUser;
      if (!parsed || typeof parsed.id !== 'string' || typeof parsed.email !== 'string') return null;
      return parsed;
    } catch {
      return null;
    }
  },

  set(user: StoredUser) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear() {
    localStorage.removeItem(USER_KEY);
  },
} as const;
