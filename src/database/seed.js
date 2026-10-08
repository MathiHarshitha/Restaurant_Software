import { db, withEntityMeta } from './db';
import { menuRepository } from './menuRepository';
import { billRepository } from './billRepository';
import { settingsRepository } from './settingsRepository';
import { syncRepository } from './syncRepository';
import { APP_CONFIG } from '../config/app';
import { MENU_SEED, RESTAURANT_SEED } from '../data/menuSeed';
import { generateDemoBills } from '../data/demoDataGenerator';
import { buildBillRecord } from '../services/billFactory';

const SEED_ID = 'seed';
const CHUNK = 1500;

export async function isSeeded() {
  const meta = await settingsRepository.get(SEED_ID);
  return meta?.version === APP_CONFIG.seedVersion;
}

/** Populates the local database with the demo restaurant (menu, profile and ~9 months of bills). */
export async function seedDemoData(onProgress = () => {}) {
  onProgress(0.02, 'Setting up the menu');
  await Promise.all([db.menuItems.clear(), db.bills.clear(), db.settings.clear(), syncRepository.clear()]);

  // Seeded menu items are back-dated so reports treat them as long-standing items.
  const established = new Date(new Date().getFullYear() - 1, 0, 1);
  const menu = MENU_SEED.map(({ popularity, qty, ...item }, i) => ({
    ...withEntityMeta({
      ...item,
      gstRate: APP_CONFIG.defaultGstRate,
      isAvailable: true,
      sortOrder: i + 1,
      deletedAt: null,
      syncStatus: 'synced',
    }, established),
    popularity,
    qty,
  }));
  await menuRepository.bulkAdd(menu.map(({ popularity, qty, ...m }) => m));

  onProgress(0.08, 'Generating sales history');
  const { bills, lastSeq } = generateDemoBills({
    menu,
    now: new Date(),
    firstSeq: APP_CONFIG.firstBillSeq,
    makeBill: ({ lines, discount, totals, paymentMethod, status, at, seq }) =>
      buildBillRecord({ seq, lines, discount, totals, paymentMethod, status, at, syncStatus: 'synced' }),
  });

  for (let i = 0; i < bills.length; i += CHUNK) {
    await billRepository.bulkAdd(bills.slice(i, i + CHUNK));
    onProgress(0.1 + 0.85 * Math.min(1, (i + CHUNK) / bills.length), 'Saving bills on this device');
  }

  await billRepository.setCounter(lastSeq);
  await settingsRepository.put({ ...withEntityMeta(RESTAURANT_SEED), id: 'restaurant' });
  await syncRepository.saveMeta({ lastSyncedAt: new Date().toISOString(), lastSyncCount: 0 });
  await settingsRepository.put({ id: SEED_ID, version: APP_CONFIG.seedVersion, seededAt: new Date().toISOString(), billCount: bills.length });
  onProgress(1, 'Ready');
}

export async function ensureSeeded(onProgress) {
  if (await isSeeded()) return false;
  await seedDemoData(onProgress);
  return true;
}
