import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Minus, Plus, Printer, Receipt as ReceiptIcon, RefreshCw, Search, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  addItem, clearCart, decrementItem, incrementItem, removeItem, selectCart, selectCartTotals, setDiscount,
  setPaymentMethod, syncPrices,
} from '../store/cartSlice';
import { useMenuItems, useRestaurant } from '../hooks/useData';
import { billingService } from '../services/billingService';
import { printService } from '../services/printService';
import { formatCurrency } from '../utils/format';
import { DietMark } from '../components/ui/misc';
import { cn } from '../utils/cn';
import Modal from '../components/ui/Modal';
import BillReceipt from '../components/receipt/Receipt';
import { PAYMENT_METHODS } from '../config/app';
import { CATEGORIES } from '../data/categories';

/* ─── Item card on the menu grid ─── */
function ItemCard({ item, quantity, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-start rounded-xl border p-3 text-left transition-all',
        'bg-white hover:border-gold-400 hover:shadow-md focus-visible:ring-2 focus-visible:ring-gold-400',
        quantity ? 'border-gold-400 shadow-sm' : 'border-ink-200',
        !item.isAvailable && 'opacity-40 pointer-events-none',
      )}
    >
      <div className="flex w-full items-start gap-1.5">
        <DietMark isVeg={item.isVeg} className="mt-0.5 shrink-0" />
        <span className="flex-1 text-sm font-medium text-ink-900 leading-snug">{item.name}</span>
      </div>
      <p className="mt-1.5 num text-sm font-semibold text-ink-900">{formatCurrency(item.price)}</p>
      {quantity > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold num" style={{ background: '#7A1E23', color: '#F7EAD6' }}>
          {quantity}
        </span>
      )}
    </button>
  );
}

/* ─── Cart line item ─── */
function CartLine({ line, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-ink-100 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <DietMark isVeg={line.isVeg} className="shrink-0" />
          <span className="text-sm font-medium text-ink-900 truncate">{line.name}</span>
        </div>
        <p className="mt-0.5 num text-xs text-ink-500">{formatCurrency(line.price)} each</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" className="icon-btn h-7 w-7" onClick={onDecrement}><Minus size={13} /></button>
        <span className="num w-5 text-center text-sm font-semibold text-ink-900">{line.quantity}</span>
        <button type="button" className="icon-btn h-7 w-7" onClick={onIncrement}><Plus size={13} /></button>
      </div>
      <span className="num w-16 text-right text-sm font-semibold text-ink-900">{formatCurrency(line.price * line.quantity)}</span>
      <button type="button" className="icon-btn h-7 w-7 text-red-400 hover:bg-red-50 hover:text-red-600" onClick={onRemove}><Trash2 size={13} /></button>
    </div>
  );
}

export default function Billing() {
  const dispatch = useDispatch();
  const cart = useSelector(selectCart);
  const totals = useSelector(selectCartTotals);
  const menuItems = useMenuItems();
  const restaurant = useRestaurant();

  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null); // bill object after generation

  // Keep open-order prices in sync when the menu changes
  useEffect(() => {
    if (menuItems) dispatch(syncPrices(menuItems));
  }, [menuItems, dispatch]);

  const available = useMemo(() => (menuItems ?? []).filter((m) => m.isAvailable), [menuItems]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return available.filter((m) =>
      (category === 'All' || m.category === category) &&
      (!q || m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)),
    );
  }, [available, category, search]);

  const qtyMap = useMemo(() => {
    const m = new Map();
    cart.lines.forEach((l) => m.set(l.menuItemId, l.quantity));
    return m;
  }, [cart.lines]);

  const handleGenerate = async () => {
    if (!cart.lines.length) { toast.error('Add at least one item to the bill.'); return; }
    setBusy(true);
    try {
      const bill = await billingService.createBill({ lines: cart.lines, discount: cart.discount, paymentMethod: cart.paymentMethod });
      setPreview(bill);
      dispatch(clearCart());
      toast.success('Bill generated', { description: `${bill.billNumber} — ${formatCurrency(bill.grandTotal)}` });
    } catch (err) {
      toast.error('Could not generate bill', { description: err.message });
    } finally {
      setBusy(false);
    }
  };

  const handlePrint = () => {
    if (preview) printService.printBill(preview, restaurant);
  };

  const categories = ['All', ...CATEGORIES.filter((c) => available.some((m) => m.category === c))];

  return (
    <div className="flex h-full gap-5" style={{ minHeight: 'calc(100vh - 112px)' }}>
      {/* ── Left: menu panel ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            className="input pl-9"
            placeholder="Search food items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 icon-btn h-5 w-5" onClick={() => setSearch('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all',
                category !== c && 'bg-white text-ink-600 ring-1 ring-gold-400/30 hover:bg-cream-200/50',
              )}
              style={category === c ? { background: '#7A1E23', color: '#F7EAD6' } : {}}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Item grid */}
        <div className="flex-1 overflow-y-auto scroll-thin pr-1">
          {filtered.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-ink-400">No items found</div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filtered.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  quantity={qtyMap.get(item.id) ?? 0}
                  onClick={() => dispatch(addItem(item))}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: order panel ── */}
      <div className="w-[340px] shrink-0 flex flex-col card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <ReceiptIcon size={16} className="text-maroon-600" />
            <span className="text-sm font-semibold text-ink-900">Current Order</span>
            {cart.lines.length > 0 && <span className="badge-neutral num">{totals.itemCount} items</span>}
          </div>
          {cart.lines.length > 0 && (
            <button type="button" className="btn-ghost btn-sm text-red-500 hover:bg-red-50 hover:text-red-700" onClick={() => dispatch(clearCart())}>
              <Trash2 size={13} />Clear
            </button>
          )}
        </div>

        {/* Lines */}
        <div className="flex-1 overflow-y-auto scroll-thin px-4">
          {cart.lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-10">
              <ReceiptIcon size={32} className="mb-3 text-ink-200" />
              <p className="text-sm text-ink-400">No items added yet</p>
              <p className="mt-1 text-xs text-ink-300">Tap a food item on the left to add it</p>
            </div>
          ) : (
            <div className="py-2">
              {cart.lines.map((line) => (
                <CartLine
                  key={line.menuItemId}
                  line={line}
                  onIncrement={() => dispatch(incrementItem(line.menuItemId))}
                  onDecrement={() => dispatch(decrementItem(line.menuItemId))}
                  onRemove={() => dispatch(removeItem(line.menuItemId))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Totals & payment */}
        {cart.lines.length > 0 && (
          <div className="border-t border-ink-100 px-4 py-3 space-y-2">
            {/* Discount */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-500 w-20">Discount</span>
              <select
                className="h-7 rounded-md border border-ink-200 bg-white px-2 text-xs text-ink-700"
                value={cart.discount.type}
                onChange={(e) => dispatch(setDiscount({ ...cart.discount, type: e.target.value }))}
              >
                <option value="amount">₹ Amount</option>
                <option value="percent">% Percent</option>
              </select>
              <input
                type="number"
                min="0"
                className="h-7 w-20 rounded-md border border-ink-200 bg-white px-2 text-right text-xs num"
                value={cart.discount.value}
                onChange={(e) => dispatch(setDiscount({ ...cart.discount, value: e.target.value }))}
              />
            </div>

            <div className="space-y-1 pt-1 text-sm">
              <div className="flex justify-between text-ink-600">
                <span>Subtotal</span><span className="num">{formatCurrency(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span><span className="num">−{formatCurrency(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-600">
                <span>GST (CGST + SGST)</span><span className="num">{formatCurrency(totals.gstAmount)}</span>
              </div>
              {totals.roundOff !== 0 && (
                <div className="flex justify-between text-ink-400">
                  <span>Round off</span><span className="num">{totals.roundOff > 0 ? '+' : ''}{formatCurrency(totals.roundOff)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-ink-200 pt-2 text-base font-bold text-ink-900">
                <span>Grand Total</span><span className="num">{formatCurrency(totals.grandTotal)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="flex gap-2 pt-1">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={cn(
                    'flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors',
                    cart.paymentMethod === m.id
                      ? 'border-gold-400 bg-cream-200/60 text-maroon-700'
                      : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50',
                  )}
                  onClick={() => dispatch(setPaymentMethod(m.id))}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn-primary btn-lg w-full"
              onClick={handleGenerate}
              disabled={busy}
            >
              <ReceiptIcon size={17} />
              {busy ? 'Generating…' : 'Generate Bill'}
            </button>
          </div>
        )}
      </div>

      {/* Bill preview modal */}
      <Modal
        open={!!preview}
        onClose={() => setPreview(null)}
        title="Bill Preview"
        size="sm"
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setPreview(null)}>
              <RefreshCw size={15} /> New Bill
            </button>
            <button type="button" className="btn-primary" onClick={handlePrint}>
              <Printer size={15} /> Print Bill
            </button>
          </>
        }
      >
        {preview && <BillReceipt bill={preview} restaurant={restaurant} />}
      </Modal>
    </div>
  );
}
