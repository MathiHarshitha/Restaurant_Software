import { db } from './db';
import { settingsRepository } from './settingsRepository';

const META_ID = 'syncMeta';

// Sync bookkeeping: last successful sync and a short history log.
export const syncRepository = {
  async getMeta() {
    return (await settingsRepository.get(META_ID)) || { id: META_ID, lastSyncedAt: null, lastSyncCount: 0 };
  },

  saveMeta(changes) {
    return settingsRepository.merge(META_ID, changes);
  },

  addLog(entry) {
    return db.syncLog.add({ at: Date.now(), ...entry });
  },

  getRecentLogs(limit = 6) {
    return db.syncLog.orderBy('at').reverse().limit(limit).toArray();
  },

  clear() {
    return db.syncLog.clear();
  },
};
