import { db } from './db';

export const prefsRepo = {
  async get<T>(key: string): Promise<T | undefined> {
    const entry = await db.prefs.get(key);
    return entry?.value as T | undefined;
  },

  async set(key: string, value: unknown): Promise<void> {
    await db.prefs.put({ key, value });
  },

  async delete(key: string): Promise<void> {
    await db.prefs.delete(key);
  },
};
