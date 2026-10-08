import { withEntityMeta } from '../database/db';
import { formatBillNumber } from '../database/billRepository';
import { getDeviceId, uuid } from '../utils/device';
import { lineTotal } from '../utils/billCalculator';

/**
 * Shapes a bill entity exactly as it is stored locally and sent to the server.
 * Line items are embedded and snapshot name/price/GST at billing time,
 * so later menu edits never change historical bills.
 */
export function buildBillRecord({ seq, lines, discount, totals, paymentMethod, status = 'paid', at = new Date(), syncStatus = 'pending' }) {
  return withEntityMeta({
    billNumber: formatBillNumber(seq),
    billSeq: seq,
    deviceId: getDeviceId(),
    billedAt: at.getTime(),
    items: lines.map((l) => ({
      id: uuid(),
      menuItemId: l.menuItemId,
      name: l.name,
      category: l.category,
      price: l.price,
      quantity: l.quantity,
      gstRate: l.gstRate,
      lineTotal: l.lineTotal ?? lineTotal(l),
    })),
    itemCount: totals.itemCount,
    subtotal: totals.subtotal,
    discountType: discount.type,
    discountValue: Number(discount.value) || 0,
    discountAmount: totals.discountAmount,
    taxableAmount: totals.taxableAmount,
    gstAmount: totals.gstAmount,
    cgst: totals.cgst,
    sgst: totals.sgst,
    roundOff: totals.roundOff,
    grandTotal: totals.grandTotal,
    paymentMethod,
    status,
    syncStatus,
    syncedAt: syncStatus === 'synced' ? at.toISOString() : null,
  }, at);
}
