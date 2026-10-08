import { DAY_MS, addDays, formatDayMonth, formatHour, formatMonthShort, formatWeekdayShort, startOfDay } from '../../utils/dates';

export const OPEN_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

const dayIndex = (start, ms) => Math.round((startOfDay(ms).getTime() - startOfDay(start).getTime()) / DAY_MS);

/** Empty time buckets covering [start, end] at the given granularity. */
export function buildBuckets(start, end, bucket) {
  const s = new Date(start);
  if (bucket === 'hour') {
    return OPEN_HOURS.map((h) => {
      const at = new Date(s); at.setHours(h, 0, 0, 0);
      return { key: h, start: at.getTime(), label: formatHour(h), sales: 0, orders: 0 };
    });
  }
  if (bucket === 'month') {
    const out = [];
    for (let d = new Date(s.getFullYear(), s.getMonth(), 1); d.getTime() <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
      out.push({ key: out.length, start: d.getTime(), label: formatMonthShort(d), sales: 0, orders: 0 });
    }
    return out;
  }
  const step = bucket === 'week' ? 7 : 1;
  const out = [];
  for (let d = startOfDay(s); d.getTime() <= end; d = addDays(d, step)) {
    const label = bucket === 'week' ? formatDayMonth(d)
      : (end - start) <= 8 * DAY_MS ? `${formatWeekdayShort(d)} ${d.getDate()}` : formatDayMonth(d);
    out.push({ key: out.length, start: d.getTime(), label, sales: 0, orders: 0 });
  }
  return out;
}

function bucketIndex(ms, start, bucket) {
  if (bucket === 'hour') return OPEN_HOURS.indexOf(new Date(ms).getHours());
  if (bucket === 'month') {
    const a = new Date(start); const b = new Date(ms);
    return (b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth();
  }
  const i = dayIndex(start, ms);
  return bucket === 'week' ? Math.floor(i / 7) : i;
}

/**
 * Reduces a list of bills into every figure the dashboard and reports display.
 * Cancelled bills are counted separately and excluded from sales.
 */
export function aggregateBills(bills, { start, end, bucket = 'day' }) {
  const buckets = buildBuckets(start, end, bucket);
  const hours = Array.from({ length: 24 }, (_, h) => ({ hour: h, label: formatHour(h), orders: 0, sales: 0 }));
  const payments = { upi: { amount: 0, count: 0 }, cash: { amount: 0, count: 0 }, card: { amount: 0, count: 0 } };
  const items = new Map();
  const days = new Map();

  let sales = 0, orders = 0, cancelled = 0, discount = 0, gst = 0, subtotal = 0, itemsSold = 0;

  for (const b of bills) {
    if (b.status !== 'paid') { cancelled++; continue; }
    orders++;
    sales += b.grandTotal;
    discount += b.discountAmount;
    gst += b.gstAmount;
    subtotal += b.subtotal;

    const p = payments[b.paymentMethod];
    if (p) { p.amount += b.grandTotal; p.count++; }

    const h = hours[new Date(b.billedAt).getHours()];
    h.orders++; h.sales += b.grandTotal;

    const bi = bucketIndex(b.billedAt, start, bucket);
    if (buckets[bi]) { buckets[bi].sales += b.grandTotal; buckets[bi].orders++; }

    const dk = startOfDay(b.billedAt).getTime();
    const day = days.get(dk) || { date: dk, sales: 0, orders: 0 };
    day.sales += b.grandTotal; day.orders++;
    days.set(dk, day);

    for (const it of b.items) {
      const row = items.get(it.menuItemId) || { menuItemId: it.menuItemId, name: it.name, category: it.category, quantity: 0, revenue: 0 };
      row.quantity += it.quantity;
      row.revenue += it.lineTotal;
      items.set(it.menuItemId, row);
      itemsSold += it.quantity;
    }
  }

  const itemList = [...items.values()];
  const itemRevenue = itemList.reduce((s, i) => s + i.revenue, 0);
  itemList.forEach((i) => { i.share = itemRevenue ? (i.revenue / itemRevenue) * 100 : 0; });

  return {
    sales,
    orders,
    cancelled,
    avgBill: orders ? sales / orders : 0,
    discount,
    gst,
    subtotal,
    itemsSold,
    payments,
    buckets,
    hours,
    days: [...days.values()].sort((a, b) => a.date - b.date),
    items: itemList,
  };
}

export const pctChange = (current, previous) => (previous > 0 ? ((current - previous) / previous) * 100 : null);

export const topByQuantity = (agg, n = 5) => [...agg.items].sort((a, b) => b.quantity - a.quantity).slice(0, n);
export const topByRevenue = (agg, n = 5) => [...agg.items].sort((a, b) => b.revenue - a.revenue).slice(0, n);

/** Busiest consecutive window of `width` hours by order count. */
export function peakWindow(hours, width = 2) {
  let best = { start: 19, orders: -1 };
  for (let h = 0; h <= 24 - width; h++) {
    const orders = hours.slice(h, h + width).reduce((s, x) => s + x.orders, 0);
    if (orders > best.orders) best = { start: h, orders };
  }
  const total = hours.reduce((s, x) => s + x.orders, 0);
  return {
    startHour: best.start,
    endHour: best.start + width,
    label: `${formatHour(best.start)} – ${formatHour(best.start + width)}`,
    orders: best.orders,
    share: total ? (best.orders / total) * 100 : 0,
  };
}

export function bestDay(agg) {
  return agg.days.reduce((best, d) => (!best || d.sales > best.sales ? d : best), null);
}

/** Average daily sales on weekends (Sat/Sun) vs weekdays, using days that had sales. */
export function weekendVsWeekday(agg) {
  const wk = { sum: 0, n: 0 }; const we = { sum: 0, n: 0 };
  for (const d of agg.days) {
    const dow = new Date(d.date).getDay();
    const t = dow === 0 || dow === 6 ? we : wk;
    t.sum += d.sales; t.n++;
  }
  const weekday = wk.n ? wk.sum / wk.n : 0;
  const weekend = we.n ? we.sum / we.n : 0;
  return { weekday, weekend, lift: weekday && we.n ? ((weekend - weekday) / weekday) * 100 : null };
}

/**
 * Slow-moving items: menu items selling under half the median item's volume in the period.
 * Items created after the period began are skipped — a brand-new dish isn't "slow".
 * The same list drives the "Items That Need Attention" card and the insight count.
 */
export function slowMovingItems(agg, menu, periodStart) {
  const sold = new Map(agg.items.map((i) => [i.menuItemId, i]));
  const rows = menu
    .filter((m) => !m.deletedAt && new Date(m.createdAt).getTime() <= periodStart)
    .map((m) => ({ menuItemId: m.id, name: m.name, category: m.category, quantity: sold.get(m.id)?.quantity || 0, revenue: sold.get(m.id)?.revenue || 0 }))
    .sort((a, b) => a.quantity - b.quantity);
  if (!rows.length || agg.orders === 0) return { items: [], median: 0 };
  const median = rows[Math.floor(rows.length / 2)].quantity;
  return { items: rows.filter((r) => r.quantity < median * 0.5), median };
}
