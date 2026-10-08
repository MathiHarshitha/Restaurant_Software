import { useState } from 'react';
import {
  AlertCircle, ArrowUpRight, Calendar, CheckCircle2, Clock, Receipt, ShoppingBag, Star, TrendingDown,
  TrendingUp, Wallet,
} from 'lucide-react';
import { useDashboard, useSalesTrend } from '../hooks/useData';
import { formatCurrency, formatCurrencyCompact, formatNumber, formatPercent } from '../utils/format';
import { formatMonthYear, greeting } from '../utils/dates';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Segmented from '../components/ui/Segmented';
import { DeltaBadge, PageHeader, Skeleton } from '../components/ui/misc';
import SalesTrendChart from '../components/charts/SalesTrendChart';
import PaymentBreakdownChart from '../components/charts/PaymentBreakdownChart';
import PeakHoursChart from '../components/charts/PeakHoursChart';
import { cn } from '../utils/cn';

const TREND_RANGES = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '3m', label: '3 Months' },
  { value: '1y', label: '1 Year' },
];

const TONE_STYLES = {
  positive: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'text-emerald-600', iconBg: 'bg-emerald-100' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'text-amber-700', iconBg: 'bg-amber-100' },
  neutral: { bg: 'bg-ink-50', border: 'border-ink-200', icon: 'text-brand-600', iconBg: 'bg-brand-50' },
};

const INSIGHT_ICONS = {
  'trending-up': TrendingUp, 'trending-down': TrendingDown, 'star': Star,
  'clock': Clock, 'calendar': Calendar, 'alert': AlertCircle,
  'receipt': Receipt, 'wallet': Wallet,
};

function KpiCard({ label, value, delta, sub, loading }) {
  return (
    <div className="card card-pad">
      <p className="text-xs font-medium text-ink-500">{label}</p>
      {loading
        ? <Skeleton className="mt-2 h-9 w-32" />
        : <p className="mt-1.5 text-3xl font-semibold tracking-tight text-ink-900 num">{value}</p>
      }
      <div className="mt-2 flex items-center gap-1.5">
        {loading
          ? <Skeleton className="h-5 w-16" />
          : delta !== undefined && delta !== null
            ? <><DeltaBadge value={delta} /><span className="text-xs text-ink-400">vs yesterday</span></>
            : null
        }
        {sub && !loading && <span className="text-xs text-ink-400">{sub}</span>}
      </div>
    </div>
  );
}

function InsightCard({ insight }) {
  const s = TONE_STYLES[insight.tone] || TONE_STYLES.neutral;
  const Icon = INSIGHT_ICONS[insight.icon] || Star;
  return (
    <div className={cn('flex gap-3.5 rounded-xl border p-4', s.bg, s.border)}>
      <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', s.iconBg, s.icon)}>
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink-900">{insight.title}</p>
        {insight.detail && <p className="mt-0.5 text-xs text-ink-600 leading-relaxed">{insight.detail}</p>}
      </div>
    </div>
  );
}

function HealthBar({ label, score }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-brand-500' : 'bg-amber-500';
  return (
    <div>
      <div className="mb-1 flex justify-between text-[13px]">
        <span className="text-ink-700">{label}</span>
        <span className="num font-semibold text-ink-900">{score}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const user = useSelector((s) => s.auth.user);
  const [trendRange, setTrendRange] = useState('7d');
  const dash = useDashboard();
  const trend = useSalesTrend(trendRange);
  const navigate = useNavigate();

  const loading = !dash;
  const today = dash?.today;
  const todayChange = dash?.todayChange;
  const health = dash?.health;

  return (
    <div>
      <PageHeader
        title={`${greeting()}, ${user?.name ?? 'Chef'}!`}
        subtitle={`${formatMonthYear(new Date())} · Connect Dhaba`}
        actions={
          <button className="btn-primary" onClick={() => navigate('/billing')}>
            <Receipt size={16} />
            New Bill
          </button>
        }
      />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard label="Today's Sales" value={loading ? '—' : formatCurrency(today?.sales ?? 0)} delta={todayChange?.sales} loading={loading} />
        <KpiCard label="Orders" value={loading ? '—' : formatNumber(today?.orders ?? 0)} delta={todayChange?.orders} loading={loading} />
        <KpiCard label="Average Bill" value={loading ? '—' : formatCurrency(today?.avgBill ?? 0)} delta={todayChange?.avgBill} loading={loading} />
        <KpiCard
          label="Monthly Growth"
          value={loading ? '—' : formatPercent(dash?.todayChange?.sales ?? 0, { signed: true })}
          delta={null}
          sub="vs yesterday's pace"
          loading={loading}
        />
      </div>

      {/* Sales trend chart */}
      <div className="mt-5 card card-pad">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="card-title">Sales Trend</h2>
            {trend && (
              <p className="card-sub mt-0.5">
                {formatCurrency(trend.total)} · {formatNumber(trend.orders)} orders
                {trend.change !== null && trend.change !== undefined && (
                  <> · <DeltaBadge value={trend.change} className="ml-1" /></>
                )}
              </p>
            )}
          </div>
          <Segmented options={TREND_RANGES} value={trendRange} onChange={setTrendRange} ariaLabel="Trend period" />
        </div>
        {trend ? (
          <SalesTrendChart data={trend.data} bucket={trend.bucket} />
        ) : (
          <Skeleton className="h-[220px] w-full" />
        )}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[2fr_1fr]">
        {/* Left column */}
        <div className="space-y-5">
          {/* Top selling items */}
          <div className="card card-pad">
            <h2 className="card-title mb-4">Top Selling Items</h2>
            {loading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : (
              <div className="space-y-1">
                {(dash?.topItems ?? []).map((item, i) => {
                  const totalQty = dash.topItems.reduce((s, x) => s + x.quantity, 0);
                  const pct = totalQty ? (item.quantity / totalQty) * 100 : 0;
                  return (
                    <div key={item.menuItemId} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-ink-50">
                      <span className="w-5 text-center text-sm font-semibold text-ink-400 num">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-ink-800 truncate">{item.name}</span>
                          <span className="num ml-2 text-sm font-semibold text-ink-900">{formatCurrency(item.revenue)}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-100">
                            <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="num text-xs text-ink-500 w-14 text-right">{formatNumber(item.quantity)} sold</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Peak hours */}
          <div className="card card-pad">
            <div className="mb-1 flex items-start justify-between">
              <h2 className="card-title">Peak Hours</h2>
              {dash?.peak && (
                <span className="badge-blue">{dash.peak.label} · Peak</span>
              )}
            </div>
            <p className="card-sub mb-4">Order volume by hour (30-day average)</p>
            {loading ? <Skeleton className="h-[180px]" /> : (
              <PeakHoursChart
                hours={dash?.dailyAvgHours ?? []}
                peakStart={dash?.peak?.startHour ?? 19}
                peakEnd={dash?.peak?.endHour ?? 21}
              />
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Payment breakdown */}
          <div className="card card-pad">
            <h2 className="card-title mb-4">Payment Breakdown</h2>
            {loading ? <Skeleton className="h-40" /> : (
              <PaymentBreakdownChart payments={dash?.last30?.payments} />
            )}
          </div>

          {/* Restaurant health */}
          {health && (
            <div className="card card-pad">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="card-title">Restaurant Health</h2>
                  <p className="card-sub">{health.band}</p>
                </div>
                <div className="text-right">
                  <p className="num text-3xl font-bold text-ink-900">{health.overall}</p>
                  <p className="text-xs text-ink-400">out of 100</p>
                </div>
              </div>
              <div className="space-y-3">
                {health.factors.map((f) => (
                  <HealthBar key={f.key} label={f.label} score={f.score} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Business insights */}
      {dash?.insights?.length > 0 && (
        <div className="mt-5 card card-pad">
          <h2 className="card-title mb-4">Business Insights</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {dash.insights.map((ins) => (
              <InsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        </div>
      )}

      {/* Coming soon */}
      <div className="mt-5 card card-pad">
        <h2 className="card-title mb-1">Coming Soon</h2>
        <p className="card-sub mb-4">Planned features for the next release</p>
        <div className="flex flex-wrap gap-2">
          {['Inventory Management', 'Kitchen Display System', 'Owner Mobile Dashboard', 'WhatsApp Bills', 'Customer Loyalty', 'Advanced Analytics', 'Multi-Branch Management'].map((f) => (
            <span key={f} className="badge-neutral cursor-not-allowed opacity-60">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
