import { billRepository } from '../database/billRepository';
import { menuRepository } from '../database/menuRepository';
import {
  DAY_MS, addDays, addMonths, endOfDay, formatDate, formatDayMonth, formatMonthLong, formatMonthYear,
  formatWeekday, startOfDay, startOfMonth, startOfWeek, startOfYear,
} from '../utils/dates';
import { aggregateBills, bestDay, pctChange, peakWindow, slowMovingItems, topByQuantity, topByRevenue, weekendVsWeekday } from './analytics/aggregate';
import { buildInsights } from './analytics/insights';
import { computeHealthScore } from './analytics/healthScore';

/** Calendar period containing `anchor`. */
export function getPeriodRange(type, anchor) {
  const a = new Date(anchor);
  switch (type) {
    case 'day': {
      const start = startOfDay(a);
      return { type, start: start.getTime(), end: endOfDay(a).getTime(), bucket: 'hour', label: formatDate(start), sublabel: formatWeekday(start), versusLabel: 'the previous day', scopeLabel: 'on this day', prevAnchor: addDays(start, -1).getTime(), nextAnchor: addDays(start, 1).getTime() };
    }
    case 'week': {
      const start = startOfWeek(a);
      const last = addDays(start, 6);
      return { type, start: start.getTime(), end: endOfDay(last).getTime(), bucket: 'day', label: `${formatDayMonth(start)} – ${formatDate(last)}`, sublabel: 'Monday to Sunday', versusLabel: 'the previous week', scopeLabel: 'this week', prevAnchor: addDays(start, -7).getTime(), nextAnchor: addDays(start, 7).getTime() };
    }
    case 'month': {
      const start = startOfMonth(a);
      const next = addMonths(start, 1);
      return { type, start: start.getTime(), end: next.getTime() - 1, bucket: 'day', label: formatMonthYear(start), sublabel: '', versusLabel: formatMonthLong(addMonths(start, -1)), scopeLabel: 'this month', prevAnchor: addMonths(start, -1).getTime(), nextAnchor: next.getTime() };
    }
    case 'year': {
      const start = startOfYear(a);
      const next = new Date(start.getFullYear() + 1, 0, 1);
      return { type, start: start.getTime(), end: next.getTime() - 1, bucket: 'month', label: `${start.getFullYear()}`, sublabel: '', versusLabel: `${start.getFullYear() - 1}`, scopeLabel: 'this year', prevAnchor: new Date(start.getFullYear() - 1, 0, 1).getTime(), nextAnchor: next.getTime() };
    }
    default:
      throw new Error(`Unknown period type: ${type}`);
  }
}

const changeSet = (cur, prev) => ({
  sales: pctChange(cur.sales, prev.sales),
  orders: pctChange(cur.orders, prev.orders),
  avgBill: pctChange(cur.avgBill, prev.avgBill),
});

export const reportService = {
  /**
   * Full report for a calendar period. For a period still in progress, the comparison
   * period is cut to the same elapsed time (e.g. 1–7 Oct vs 1–7 Sep).
   */
  async getReport(type, anchor = Date.now()) {
    const now = Date.now();
    const range = getPeriodRange(type, anchor);
    const prevRange = getPeriodRange(type, range.prevAnchor);
    const elapsed = Math.min(range.end, now) - range.start;
    const prevCutoff = Math.min(prevRange.end, prevRange.start + elapsed);

    const [bills, prevBills, menu] = await Promise.all([
      billRepository.getByRange(range.start, range.end),
      billRepository.getByRange(prevRange.start, prevRange.end),
      menuRepository.getAllIncludingDeleted(),
    ]);

    const current = aggregateBills(bills, range);
    const prevFull = aggregateBills(prevBills, { start: prevRange.start, end: prevRange.end, bucket: range.bucket });
    const previous = aggregateBills(prevBills.filter((b) => b.billedAt <= prevCutoff), { start: prevRange.start, end: prevRange.end, bucket: range.bucket });

    const trend = current.buckets.map((b, i) => ({
      label: b.label,
      start: b.start,
      sales: b.start > now ? null : Math.round(b.sales),
      orders: b.start > now ? null : b.orders,
      previous: prevFull.buckets[i] ? Math.round(prevFull.buckets[i].sales) : null,
    }));

    const best = bestDay(current);
    const bestMonth = type === 'year'
      ? current.buckets.reduce((m, b) => (!m || b.sales > m.sales ? b : m), null)
      : null;
    const activeMonths = type === 'year' ? current.buckets.filter((b) => b.sales > 0).length : 0;

    return {
      type,
      range,
      prevRange: { ...prevRange, cutoff: prevCutoff },
      isPartial: range.end > now,
      hasData: current.orders > 0,
      current,
      previous,
      change: changeSet(current, previous),
      trend,
      topItems: topByQuantity(current, 5),
      topRevenue: topByRevenue(current, 5),
      peak: peakWindow(current.hours),
      bestDay: best,
      bestMonth: bestMonth && bestMonth.sales > 0 ? { ...bestMonth, label: formatMonthLong(bestMonth.start) } : null,
      avgMonthly: activeMonths ? current.sales / activeMonths : 0,
      weekend: weekendVsWeekday(current),
      slow: slowMovingItems(current, menu, range.start),
      insights: buildInsights({ current, previous, versusLabel: range.versusLabel, scopeLabel: range.scopeLabel, menu, periodStart: range.start }),
    };
  },

  /** Everything the dashboard shows, in one read. */
  async getDashboard() {
    const now = new Date();
    const nowMs = now.getTime();
    const today = startOfDay(now).getTime();
    const yesterday = today - DAY_MS;
    const last30 = startOfDay(addDays(now, -29)).getTime();
    const prev30 = startOfDay(addDays(now, -59)).getTime();

    const [bills, menu] = await Promise.all([
      billRepository.getByRange(prev30, endOfDay(now).getTime()),
      menuRepository.getAllIncludingDeleted(),
    ]);

    const within = (s, e) => bills.filter((b) => b.billedAt >= s && b.billedAt <= e);
    const todayAgg = aggregateBills(within(today, nowMs), { start: today, end: endOfDay(now).getTime(), bucket: 'hour' });
    const yesterdayAgg = aggregateBills(within(yesterday, yesterday + (nowMs - today)), { start: yesterday, end: today - 1, bucket: 'hour' });
    const recent = aggregateBills(within(last30, nowMs), { start: last30, end: nowMs, bucket: 'day' });
    const before = aggregateBills(within(prev30, last30 - 1), { start: prev30, end: last30 - 1, bucket: 'day' });

    return {
      generatedAt: nowMs,
      today: todayAgg,
      todayChange: changeSet(todayAgg, yesterdayAgg),
      last30: recent,
      topItems: topByQuantity(recent, 5),
      peak: peakWindow(recent.hours),
      dailyAvgHours: recent.hours.map((h) => ({ ...h, avgOrders: h.orders / 30 })),
      insights: buildInsights({ current: recent, previous: before, versusLabel: 'the previous 30 days', scopeLabel: 'in the last 30 days', menu, periodStart: last30 }),
      health: computeHealthScore({ current: recent, previous: before, menu, periodStart: last30 }),
    };
  },

  /** Rolling sales trend for the dashboard chart. */
  async getSalesTrend(rangeKey) {
    const now = new Date();
    const end = endOfDay(now).getTime();
    let start; let bucket;
    switch (rangeKey) {
      case 'today': start = startOfDay(now); bucket = 'hour'; break;
      case '7d': start = startOfDay(addDays(now, -6)); bucket = 'day'; break;
      case '30d': start = startOfDay(addDays(now, -29)); bucket = 'day'; break;
      case '3m': start = startOfWeek(addDays(now, -7 * 12)); bucket = 'week'; break;
      case '1y': start = startOfMonth(addMonths(now, -11)); bucket = 'month'; break;
      default: throw new Error(`Unknown trend range ${rangeKey}`);
    }
    // Never chart months before this restaurant's first bill.
    const first = await billRepository.getEarliestBillTime();
    if (bucket === 'month' && first && startOfMonth(first) > start) start = startOfMonth(first);

    const startMs = start.getTime();
    const span = end - startMs;
    const prevStart = rangeKey === 'today' ? startMs - DAY_MS : startMs - span - 1;
    const prevEnd = rangeKey === 'today' ? startMs - DAY_MS + (now.getTime() - startMs) : startMs - 1;

    const [bills, prevBills] = await Promise.all([
      billRepository.getByRange(startMs, end),
      billRepository.getByRange(prevStart, prevEnd),
    ]);
    const agg = aggregateBills(bills, { start: startMs, end, bucket });
    const prevSales = prevBills.reduce((s, b) => s + (b.status === 'paid' ? b.grandTotal : 0), 0);

    return {
      rangeKey,
      bucket,
      data: agg.buckets.map((b) => ({ label: b.label, start: b.start, sales: b.start > now.getTime() ? null : Math.round(b.sales), orders: b.orders })),
      total: agg.sales,
      orders: agg.orders,
      change: first && prevStart >= startOfDay(first).getTime() ? pctChange(agg.sales, prevSales) : null,
    };
  },
};
