import { useEffect, useMemo, useState } from 'react';
import { Eye, Printer, Search } from 'lucide-react';
import { toast } from 'sonner';
import { billingService } from '../services/billingService';
import { printService } from '../services/printService';
import { useRestaurant } from '../hooks/useData';
import { formatCurrency, formatNumber } from '../utils/format';
import { endOfDay, formatDate, formatTime, startOfDay, toInputDate, fromInputDate } from '../utils/dates';
import { EmptyState, PageHeader } from '../components/ui/misc';
import Modal from '../components/ui/Modal';
import Receipt from '../components/receipt/Receipt';
import { PAYMENT_METHODS } from '../config/app';
import { cn } from '../utils/cn';

const PAGE = 25;

export default function Bills() {
  const restaurant = useRestaurant();
  const today = new Date();

  const [start, setStart] = useState(toInputDate(startOfDay(today)));
  const [end, setEnd] = useState(toInputDate(endOfDay(today)));
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState('all');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [paidTotal, setPaidTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [viewBill, setViewBill] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const from = fromInputDate(start);
      const to = endOfDay(fromInputDate(end));
      const res = await billingService.getBills({
        startMs: from.getTime(),
        endMs: to.getTime(),
        text: search,
        payment,
        offset: page * PAGE,
        limit: PAGE,
      });
      setRows(res.rows);
      setTotal(res.total);
      setPaidTotal(res.paidTotal);
    } catch {
      toast.error('Could not load bills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [start, end, search, payment, page]);

  const totalPages = Math.ceil(total / PAGE);

  const statusBadge = (s) => s === 'paid'
    ? <span className="badge-green">Paid</span>
    : <span className="badge-red">Cancelled</span>;

  return (
    <div>
      <PageHeader title="Bills" subtitle="All billing history stored on this device" />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <input type="date" className="input h-9 w-38 text-sm" value={start} onChange={(e) => { setStart(e.target.value); setPage(0); }} />
          <span className="text-ink-400 text-sm">to</span>
          <input type="date" className="input h-9 w-38 text-sm" value={end} onChange={(e) => { setEnd(e.target.value); setPage(0); }} />
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            placeholder="Search bill / item…"
            className="input h-9 w-52 pl-8 text-sm"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <select
          className="input h-9 w-32 text-sm"
          value={payment}
          onChange={(e) => { setPayment(e.target.value); setPage(0); }}
        >
          <option value="all">All payments</option>
          {PAYMENT_METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="text-ink-500">{formatNumber(total)} bills</span>
          <span className="font-semibold text-ink-900 num">{formatCurrency(paidTotal)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                {['Bill No.', 'Date', 'Time', 'Items', 'Amount', 'Payment', 'Status', ''].map((h) => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading && rows.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-sm text-ink-400">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Search}
                      title="No bills found"
                      description="Try adjusting the date range or search text."
                    />
                  </td>
                </tr>
              ) : rows.map((b) => (
                <tr key={b.id} className="hover:bg-ink-50/50 transition-colors">
                  <td className="table-td font-mono font-medium text-maroon-600 text-xs">{b.billNumber}</td>
                  <td className="table-td text-ink-600">{formatDate(b.billedAt)}</td>
                  <td className="table-td text-ink-600 num">{formatTime(b.billedAt)}</td>
                  <td className="table-td text-ink-600">
                    <span className="num">{b.itemCount}</span>
                    {b.items?.length > 0 && (
                      <span className="block text-xs text-ink-400 truncate max-w-[180px]">
                        {b.items.map((i) => i.name).join(', ')}
                      </span>
                    )}
                  </td>
                  <td className="table-td font-semibold num">{formatCurrency(b.grandTotal)}</td>
                  <td className="table-td text-ink-600">{b.paymentMethod?.toUpperCase()}</td>
                  <td className="table-td">{statusBadge(b.status)}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="icon-btn"
                        title="View bill"
                        onClick={() => setViewBill(b)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        title="Print bill"
                        onClick={() => printService.printBill(b, restaurant)}
                      >
                        <Printer size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-ink-100 px-4 py-3 text-sm">
            <span className="text-ink-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button className="btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
              <button className="btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Bill detail modal */}
      <Modal
        open={!!viewBill}
        onClose={() => setViewBill(null)}
        title="Bill Details"
        size="sm"
        footer={
          <button type="button" className="btn-primary" onClick={() => { printService.printBill(viewBill, restaurant); }}>
            <Printer size={15} /> Print
          </button>
        }
      >
        {viewBill && <Receipt bill={viewBill} restaurant={restaurant} />}
      </Modal>
    </div>
  );
}
