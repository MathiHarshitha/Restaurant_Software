import { round2 } from './format';

/**
 * Single source of truth for bill arithmetic. Used by the billing screen,
 * the bill service and the demo data generator so every number agrees.
 *
 * GST is charged on the taxable value (subtotal minus discount), item by item
 * at each item's own rate, then split equally into CGST and SGST.
 * The grand total is rounded to the nearest rupee with an explicit round-off.
 *
 * @param {{price:number, quantity:number, gstRate:number}[]} lines
 * @param {{type:'amount'|'percent', value:number}} discount
 */
export function calculateBill(lines, discount = { type: 'amount', value: 0 }) {
  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  let discountAmount = discount.type === 'percent'
    ? (subtotal * (Number(discount.value) || 0)) / 100
    : Number(discount.value) || 0;
  discountAmount = round2(Math.min(Math.max(discountAmount, 0), subtotal));

  const taxableAmount = round2(subtotal - discountAmount);
  const ratio = subtotal > 0 ? taxableAmount / subtotal : 0;
  const gstAmount = round2(
    lines.reduce((s, l) => s + (l.price * l.quantity * (l.gstRate || 0)) / 100, 0) * ratio,
  );
  const cgst = round2(gstAmount / 2);
  const sgst = round2(gstAmount - cgst);

  const exact = taxableAmount + gstAmount;
  const grandTotal = Math.round(exact);
  const roundOff = round2(grandTotal - exact);

  return { subtotal, itemCount, discountAmount, taxableAmount, gstAmount, cgst, sgst, roundOff, grandTotal };
}

export const lineTotal = (line) => round2(line.price * line.quantity);
