import Dexie from 'dexie';
import { APP_CONFIG } from '../config/app';
import { uuid } from '../utils/device';

/**
 * Local IndexedDB database. Everything the restaurant needs to keep billing
 * without internet lives here. Only repositories import `db`; the UI goes
 * through services.
 *
 * Bills embed their line items (document model) — the same shape the future
 * MongoDB `bills` collection will use, so sync is a straight push.
 */
export const db = new Dexie(APP_CONFIG.dbName);

db.version(1).stores({
  menuItems: 'id, category, updatedAt',
  bills: 'id, &billNumber, billedAt, syncStatus, status',
  settings: 'id',
  syncLog: '++logId, at',
});

/** Adds the fields every synchronisable entity carries. */
export function withEntityMeta(data, now = new Date()) {
  const iso = now.toISOString();
  return {
    id: uuid(),
    restaurantId: APP_CONFIG.restaurantId,
    createdAt: iso,
    updatedAt: iso,
    ...data,
  };
}
