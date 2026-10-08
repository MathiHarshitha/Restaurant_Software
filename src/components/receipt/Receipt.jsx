import { PAYMENT_LABELS } from '../../config/app';
import { formatDate, formatTime } from '../../utils/dates';
import { formatCurrencyExact } from '../../utils/format';

const Rule = ({ double = false }) => (
  <div className={double ? 'my-2 border-t-[3px] border-double border-black' : 'my-2 border-t border-dashed border-black'} />
);

const Row = ({ label, value, strong = false }) => (
  <div className={`flex justify-between ${strong ? 'text-[15px] font-bold' : ''}`}>
    <span>{label}</span>
    <span className="num">{value}</span>
  </div>
);

/** Thermal-style 80mm receipt. Used both in the on-screen preview and for printing. */
export default function Receipt({ bill, restaurant }) {
  const rates = [...new Set(bill.items.map((i) => i.gstRate))];
  const half = rates.length === 1 ? ` ${rates[0] / 2}%` : '';

  return (
    <div className="mx-auto w-[72mm] max-w-full bg-white px-1 py-2 font-mono text-[12px] leading-[1.45] text-black">
      <div className="text-center">
        <p className="text-[15px] font-bold uppercase tracking-tight">{restaurant?.name}</p>
        {restaurant?.address && <p className="text-[11px]">{restaurant.address}</p>}
        {restaurant?.phone && <p className="text-[11px]">Ph: {restaurant.phone}</p>}
        {restaurant?.gstin && <p className="text-[11px]">GSTIN: {restaurant.gstin}</p>}
        <p className="mt-1.5 text-[11px] font-bold tracking-widest">TAX INVOICE</p>
      </div>
      <Rule />
      <div className="grid grid-cols-2 gap-x-2 text-[11px]">
        <span>Bill No: <b>{bill.billNumber}</b></span>
        <span className="text-right">Date: {formatDate(bill.billedAt)}</span>
        <span>Payment: {PAYMENT_LABELS[bill.paymentMethod]}</span>
        <span className="text-right">Time: {formatTime(bill.billedAt)}</span>
      </div>
      <Rule />
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 text-[11px] font-bold">
        <span>Item</span><span className="text-right">Qty</span><span className="w-[68px] text-right">Amount</span>
      </div>
      <Rule />
      <div className="space-y-1">
        {bill.items.map((it) => (
          <div key={it.id} className="grid grid-cols-[1fr_auto_auto] gap-x-3">
            <span className="break-words">
              {it.name}
              <span className="block text-[10px] text-black/70">@ {formatCurrencyExact(it.price)}</span>
            </span>
            <span className="num text-right">{it.quantity}</span>
            <span className="num w-[68px] text-right">{formatCurrencyExact(it.lineTotal)}</span>
          </div>
        ))}
      </div>
      <Rule />
      <Row label={`Subtotal (${bill.itemCount} items)`} value={formatCurrencyExact(bill.subtotal)} />
      {bill.discountAmount > 0 && (
        <Row label={`Discount${bill.discountType === 'percent' ? ` ${bill.discountValue}%` : ''}`} value={`-${formatCurrencyExact(bill.discountAmount)}`} />
      )}
      <Row label={`CGST${half}`} value={formatCurrencyExact(bill.cgst)} />
      <Row label={`SGST${half}`} value={formatCurrencyExact(bill.sgst)} />
      {bill.roundOff !== 0 && <Row label="Round off" value={formatCurrencyExact(bill.roundOff)} />}
      <Rule double />
      <Row label="TOTAL" value={formatCurrencyExact(bill.grandTotal)} strong />
      <Rule double />
      {bill.status === 'cancelled' && <p className="text-center font-bold">*** CANCELLED ***</p>}
      <p className="text-center text-[11px]">Paid by {PAYMENT_LABELS[bill.paymentMethod]}</p>
      <p className="mt-2 text-center font-bold">{restaurant?.receiptFooter || 'Thank You. Visit Again.'}</p>
    </div>
  );
}
