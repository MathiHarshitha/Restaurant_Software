import { useState } from 'react';
import { AlertCircle, Calendar, ChevronLeft, ChevronRight, Clock, Receipt, Star, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useReport } from '../hooks/useData';
import { formatCurrency, formatCurrencyCompact, formatNumber, formatPercent } from '../utils/format';
import { formatDate } from '../utils/dates';
import { DeltaBadge, EmptyState, PageHeader, Skeleton } from '../components/ui/misc';
import Segmented from '../components/ui/Segmented';
import SalesTrendChart from '../components/charts/SalesTrendChart';
import PaymentBreakdownChart from '../components/charts/PaymentBreakdownChart';
import PeakHoursChart from '../components/charts/PeakHoursChart';
import ChartTooltip from '../components/charts/ChartTooltip';
import { CHART, axisProps } from '../components/charts/theme';
import { PAYMENT_LABELS } from '../config/app';
import { cn } from '../utils/cn';

const PERIODS = [
  { value: 'day', label: 'Daily' },
  { value: 'week', label: 'Weekly' },
  { value: 'month', label: 'Monthly' },
  { value: 'year', label: 'Yearly' },
];

const INSIGHT_ICONS = {
  'trending-up': TrendingUp, 'trending-down': TrendingDown, 'star': Star,
  'clock': Clock, 'calendar': Calendar, 'alert': AlertCircle,
  'receipt': Receipt, 'wallet': Wallet,
};

const TONE_STYLES = {
  positive: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-700', iconBg: 'bg-amber-100' },
  neutral: { bg: 'bg-ink-50', border: 'border-ink-200', icon: 'text-brand-600', iconBg: 'bg-brand-50' },
};

function StatCard({ label, value, delta, deltaLabel, loading }) {
  return (
    <div className="card card-pad">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      {loading
        ? <Skeleton className="mt-2 h-8 w-28" />
        : <p className="mt-1.5 text-2xl font-semibold num text-ink-900">{value}</p>
      }
      {delta !== undefined && delta !== null && !loading && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <DeltaBadge value={delta} />
          {deltaLabel && <span className="text-xs text-ink-400">{deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight }) {
  const s = TONE_STYLES[insight.tone] || TONE_STYLES.neutral;
  const Icon = INSIGHT_ICONS[insight.icon] || Star;
  return (
    <div className={cn('flex gap-3 rounded-xl border p-4', s.bg, s.border)}>
      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', s.iconBg, s.icon)}>
        <Icon size={15} />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-ink-900">{insight.title}</p>
        {insight.detail && <p className="mt-0.5 text-xs text-ink-500 leading-relaxed">{insight.detail}</p>}
      </div>
    </div>
  );
}

export default function Reports() {
  const [type, setType] = useState('month');
  const [anchor, setAnchor] = useState(Date.now());
  const report = useReport(type, anchor);

  const r = report;
  const loading = !r;
  const cur = r?.current;
  const chg = r?.change;
  const deltaLabel = r ? `vs ${r.range.versusLabel}` : '';

  const navPrev = () => r && setAnchor(r.range.prevAnchor);
  const navNext = () => r && setAnchor(r.range.nextAnchor);
  const isToday = r && r.range.nextAnchor > Date.now();

  return (
    <div>
      {/* Header with period navigator */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-ink-900">
            {loading ? <Skeleton className="inline-block h-8 w-48" /> : r.range.label}
          </h1>
          {r?.range.sublabel && <p className="mt-0.5 text-sm text-ink-500">{r.range.sublabel}</p>}
          {r?.isPartial && <span className="badge-amber mt-1">Partial period — in progress</span>}
        </div>
        <div className="flex items-center gap-3">
          <Segmented options={PERIODS} value={type} onChange={(v) => { setType(v); setAnchor(Date.now()); }} ariaLabel="Report period" />
          <div className="flex items-center">
            <button type="button" className="icon-btn" onClick={navPrev} disabled={loading} aria-label="Previous period">
              <ChevronLeft size={18} />
            </button>
            <button type="button" className="icon-btn" onClick={navNext} disabled={loading || isToday} aria-label="Next period">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {r && !r.hasData && !loading ? (
        <EmptyState icon={Receipt} title="No sales data for this period" description="Try navigating to a different period." />
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Total Sales" value={loading ? '—' : formatCurrency(cur?.sales ?? 0)} delta={chg?.sales} deltaLabel={deltaLabel} loading={loading} />
            <StatCard label="Bills" value={loading ? '—' : formatNumber(cur?.orders ?? 0)} delta={chg?.orders} deltaLabel={deltaLabel} loading={loading} />
            <StatCard label="Average Bill" value={loading ? '—' : formatCurrency(cur?.avgBill ?? 0)} delta={chg?.avgBill} deltaLabel={deltaLabel} loading={loading} />
            <StatCard label="GST Collected" value={loading ? '—' : formatCurrency(cur?.gst ?? 0)} loading={loading} />
          </div>

          {/* Secondary row */}
          <div className="mt-4 grid grid-cols-3 gap-4 xl:grid-cols-6">
            {[
              { label: 'UPI', value: cur?.payments?.upi?.amount },
              { label: 'Cash', value: cur?.payments?.cash?.amount },
              { label: 'Card', value: cur?.payments?.card?.amount },
              { label: 'Discounts', value: cur?.discount },
              { label: 'Items Sold', value: cur?.itemsSold, fmt: formatNumber },
              { label: 'Cancelled', value: cur?.cancelled, fmt: formatNumber },
            ].map(({ label, value, fmt = formatCurrency }) => (
              <div key={label} className="card px-4 py-3">
                <p className="text-xs text-ink-500">{label}</p>
                <p className="num mt-1 text-lg font-semibold text-ink-900">{loading ? '—' : fmt(value ?? 0)}</p>
              </div>
            ))}
          </div>

          {/* Trend chart */}
          <div className="mt-5 card card-pad">
            <h2 className="card-title mb-4">Sales Trend</h2>
            {loading ? <Skeleton className="h-[220px]" /> : (
              <SalesTrendChart data={r.trend} bucket={r.range.bucket} />
            )}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            {/* Top selling items */}
            <div className="card card-pad">
              <h2 className="card-title mb-4">Top Selling Items</h2>
              {loading ? <Skeleton className="h-48" /> : (
                <div className="space-y-3">
                  {r.topItems.map((item, i) => (
                    <div key={item.menuItemId} className="flex items-center gap-3">
                      <span className="num w-4 text-sm text-ink-400">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-ink-800 truncate">{item.name}</span>
                          <span className="num font-semibold text-ink-900 ml-2">{formatCurrency(item.revenue)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1 flex-1 bg-ink-100 rounded-full overflow-hidden">
                            <div className="h-full bg-brand-500 rounded-full" style={{ width: `${item.share.toFixed(1)}%` }} />
                          </div>
                          <span className="num text-xs text-ink-500 w-16 text-right">{formatNumber(item.quantity)} sold</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment breakdown */}
            <div className="card card-pad">
              <h2 className="card-title mb-4">Payment Breakdown</h2>
              {loading ? <Skeleton className="h-48" /> : (
                <PaymentBreakdownChart payments={cur?.payments} />
              )}
            </div>
          </div>

          {/* Peak hours */}
          <div className="mt-5 card card-pad">
            <div className="mb-1 flex items-start justify-between">
              <h2 className="card-title">Peak Hours</h2>
              {r?.peak && <span className="badge-blue">{r.peak.label} · Peak</span>}
            </div>
            <p className="card-sub mb-4">Order volume by hour during this period</p>
            {loading ? <Skeleton className="h-[180px]" /> : (
              <PeakHoursChart
                hours={cur?.hours ?? []}
                peakStart={r?.peak?.startHour ?? 19}
                peakEnd={r?.peak?.endHour ?? 21}
              />
            )}
          </div>

          {/* Yearly monthly bars */}
          {type === 'year' && r && (
            <div className="mt-5 card card-pad">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="card-title">Monthly Revenue</h2>
                  {r.bestMonth && <p className="card-sub">Best month: {r.bestMonth.label} ({formatCurrency(r.bestMonth.sales)})</p>}
                </div>
                <div className="text-right text-sm">
                  <p className="text-ink-500">Annual total</p>
                  <p className="num font-bold text-ink-900">{formatCurrency(cur?.sales)}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={r.trend} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke={CHART.grid} />
                  <XAxis dataKey="label" {...axisProps} />
                  <YAxis {...axisProps} tickFormatter={formatCurrencyCompact} width={58} />
                  <Tooltip
                    content={({ active, payload, label }) => (
                      <ChartTooltip active={active} payload={payload} label={label}
                        rows={(p) => [{ label: 'Sales', color: CHART.series1, value: formatCurrency(p[0]?.value ?? 0) }]} />
                    )}
                  />
                  <Bar dataKey="sales" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {r.trend.map((d, i) => (
                      <Cell key={i} fill={d.label === r.bestMonth?.label ? CHART.series2 : CHART.series1} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Slow moving items */}
          {r?.slow?.items?.length > 0 && (
            <div className="mt-5 card card-pad">
              <h2 className="card-title">Items That Need Attention</h2>
              <p className="card-sub mb-4">These items generated relatively low sales during this period. Consider a combo offer or a menu refresh.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-ink-100 bg-ink-50">
                    <tr>
                      {['Item', 'Category', 'Qty Sold', 'Revenue'].map((h) => <th key={h} className="table-th">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {r.slow.items.map((item) => (
                      <tr key={item.menuItemId}>
                        <td className="table-td font-medium text-ink-800">{item.name}</td>
                        <td className="table-td text-ink-500">{item.category}</td>
                        <td className="table-td num">{formatNumber(item.quantity)}</td>
                        <td className="table-td num">{formatCurrency(item.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Business insights */}
          {r?.insights?.length > 0 && (
            <div className="mt-5 card card-pad">
              <h2 className="card-title mb-4">Business Insights</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {r.insights.map((ins) => <InsightCard key={ins.id} insight={ins} />)}
              </div>
            </div>
          )}

          {/* Best day */}
          {r?.bestDay && type !== 'day' && (
            <div className="mt-5 card card-pad">
              <h2 className="card-title mb-3">Best Day</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink-600">{formatDate(r.bestDay.date)}</p>
                  <p className="num mt-1 text-2xl font-bold text-ink-900">{formatCurrency(r.bestDay.sales)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-500">Orders</p>
                  <p className="num text-xl font-bold text-ink-900">{formatNumber(r.bestDay.orders)}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
