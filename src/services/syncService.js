import { billRepository } from '../database/billRepository';
import { syncRepository } from '../database/syncRepository';
import { apiClient } from './api/apiClient';

const BATCH = 50;

/**
 * Pushes locally stored bills that the server hasn't acknowledged yet.
 * Safe to call any time: it's a no-op when nothing is pending, and bills only
 * become "synced" after the server confirms receipt of their ids.
 */
export const syncService = {
  async syncPendingBills() {
    const pending = await billRepository.getPending();
    if (!pending.length) return { synced: 0 };

    let synced = 0;
    try {
      for (let i = 0; i < pending.length; i += BATCH) {
        const batch = pending.slice(i, i + BATCH);
        const { accepted, serverTime } = await apiClient.post('/bills/sync', { bills: batch });
        await billRepository.markSynced(accepted, serverTime);
        synced += accepted.length;
      }
      await syncRepository.saveMeta({ lastSyncedAt: new Date().toISOString(), lastSyncCount: synced });
      await syncRepository.addLog({ type: 'success', count: synced });
      return { synced };
    } catch (err) {
      await syncRepository.addLog({ type: 'error', count: synced, message: err.message });
      throw err;
    }
  },

  getMeta: () => syncRepository.getMeta(),
  getRecentLogs: (limit) => syncRepository.getRecentLogs(limit),
  countPending: () => billRepository.countPending(),
};
