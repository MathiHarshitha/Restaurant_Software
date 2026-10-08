import { billRepository } from '../database/billRepository';
import { calculateBill, lineTotal } from '../utils/billCalculator';
import { buildBillRecord } from './billFactory';

/**
 * Bills are always written to the local database first (status "pending"),
 * so billing never depends on the network. syncService pushes them later.
 */
export const billingService = {
  /**
   * @param {{lines: Array, discount: {type:string, value:number}, paymentMethod: string}} order
   */
  async createBill({ lines, discount, paymentMethod }) {
    if (!lines?.length) throw new Error('Add at least one item to the bill.');
    if (!['cash', 'upi', 'card'].includes(paymentMethod)) throw new Error('Choose a payment method.');

    const normalized = lines.map((l) => ({ ...l, lineTotal: lineTotal(l) }));
    const totals = calculateBill(normalized, discount);
    return billRepository.createWithNextNumber((seq) =>
      buildBillRecord({ seq, lines: normalized, discount, totals, paymentMethod, at: new Date(), syncStatus: 'pending' }));
  },

  getBill: (id) => billRepository.getById(id),

  getBills: (filters) => billRepository.search(filters),

  getNextBillNumber: () => billRepository.peekNextBillNumber(),

  countPendingBills: () => billRepository.countPending(),
};
