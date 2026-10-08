import { db } from './db';
import { settingsRepository } from './settingsRepository';
import { APP_CONFIG } from '../config/app';

const COUNTER_ID = 'counters';

export const formatBillNumber = (seq) => `${APP_CONFIG.billPrefix}${seq}`;

export const billRepository = {
  /**
   * Allocates the next bill number and stores the bill atomically,
   * so two quick taps can never produce duplicate numbers.
   * @param {(seq:number, billNumber:string) => object} build
   */
  async createWithNextNumber(build) {
    return db.transaction('rw', db.bills, db.settings, async () => {
      const counters = (await db.settings.get(COUNTER_ID)) || { id: COUNTER_ID, billSeq: APP_CONFIG.firstBillSeq - 1 };
      const seq = counters.billSeq + 1;
      const bill = build(seq, formatBillNumber(seq));
      await db.bills.add(bill);
      await db.settings.put({ ...counters, billSeq: seq });
      return bill;
    });
  },

  async peekNextBillNumber() {
    const counters = await settingsRepository.get(COUNTER_ID);
    return formatBillNumber((counters?.billSeq ?? APP_CONFIG.firstBillSeq - 1) + 1);
  },

  setCounter(billSeq) {
    return settingsRepository.put({ id: COUNTER_ID, billSeq });
  },

  getById(id) {
    return db.bills.get(id);
  },

  /** Bills with billedAt in [startMs, endMs], oldest first. */
  getByRange(startMs, endMs) {
    return db.bills.where('billedAt').between(startMs, endMs, true, true).toArray();
  },

  /** Newest-first listing for the Bills screen with in-memory filtering and paging. */
  async search({ startMs, endMs, text = '', payment = 'all', offset = 0, limit = 25 }) {
    let coll = db.bills.where('billedAt').between(startMs, endMs, true, true).reverse();
    const q = text.trim().toLowerCase();
    if (q || payment !== 'all') {
      coll = coll.filter((b) =>
        (payment === 'all' || b.paymentMethod === payment) &&
        (!q || b.billNumber.toLowerCase().includes(q) || b.items.some((i) => i.name.toLowerCase().includes(q))));
    }
    const all = await coll.toArray();
    const paid = all.filter((b) => b.status === 'paid');
    return {
      rows: all.slice(offset, offset + limit),
      total: all.length,
      paidTotal: paid.reduce((s, b) => s + b.grandTotal, 0),
    };
  },

  getPending() {
    return db.bills.where('syncStatus').equals('pending').sortBy('billedAt');
  },

  countPending() {
    return db.bills.where('syncStatus').equals('pending').count();
  },

  async markSynced(ids, syncedAt) {
    await db.bills.where('id').anyOf(ids).modify({ syncStatus: 'synced', syncedAt });
  },

  count() {
    return db.bills.count();
  },

  async getEarliestBillTime() {
    const first = await db.bills.orderBy('billedAt').first();
    return first ? new Date(first.billedAt) : null;
  },

  async bulkAdd(bills) {
    await db.bills.bulkAdd(bills);
  },

  clear() {
    return db.bills.clear();
  },
};
