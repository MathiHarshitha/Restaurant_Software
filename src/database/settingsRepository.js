import { db } from './db';

// Key/value records: 'restaurant' (profile), 'counters' (bill sequence), 'seed' (demo dataset meta).
export const settingsRepository = {
  get(id) {
    return db.settings.get(id);
  },
  put(record) {
    return db.settings.put(record);
  },
  async merge(id, changes) {
    const current = (await db.settings.get(id)) || { id };
    const next = { ...current, ...changes, updatedAt: new Date().toISOString() };
    await db.settings.put(next);
    return next;
  },
  clear() {
    return db.settings.clear();
  },
};
