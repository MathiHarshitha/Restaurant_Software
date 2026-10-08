import { calculateBill, lineTotal } from '../utils/billCalculator';
import { addDays, daysInMonth, startOfYear } from '../utils/dates';

/**
 * Generates a believable sales history from 1 January of the current year up to "now".
 * Deterministic (seeded) so every install shows the same story; all dashboard and report
 * figures are later computed from these bill records, so they stay internally consistent.
 */

// Full-month revenue targets (₹) — gentle growth with a monsoon dip and a festive October.
const MONTH_TARGETS = [380000, 410000, 430000, 418000, 452000, 401000, 412000, 438000, 432000, 483000, 455000, 520000];

// Monday..Sunday demand multipliers — weekends are clearly busier.
const DOW_FACTORS = [0.82, 0.8, 0.85, 0.9, 1.05, 1.3, 1.4];
const DOW_MEAN = DOW_FACTORS.reduce((a, b) => a + b, 0) / 7;

// Orders by hour of day (restaurant open 11 AM – 11 PM). Dinner peak 7–9 PM.
const HOUR_WEIGHTS = { 11: 3, 12: 7, 13: 10, 14: 7, 15: 3, 16: 2, 17: 3, 18: 6, 19: 12, 20: 13, 21: 9, 22: 4 };

const LINES_DIST = [[1, 50], [2, 30], [3, 13], [4, 5], [5, 2]];
const QTY_PROFILES = {
  main: [[1, 88], [2, 10], [3, 2]],
  bread: [[2, 45], [3, 30], [4, 25]],
  drink: [[1, 45], [2, 40], [3, 15]],
};
const PAYMENT_DIST = [['upi', 56], ['cash', 28], ['card', 16]];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pickWeighted = (rand, pairs) => {
  const total = pairs.reduce((s, p) => s + p[1], 0);
  let r = rand() * total;
  for (const [value, w] of pairs) {
    r -= w;
    if (r <= 0) return value;
  }
  return pairs[pairs.length - 1][0];
};

const HOUR_PAIRS = Object.entries(HOUR_WEIGHTS).map(([h, w]) => [Number(h), w]);

/**
 * @param {object} opts
 * @param {Array} opts.menu  stored menu items, each with `popularity` and `qty` profile
 * @param {Date} opts.now
 * @param {number} opts.firstSeq
 * @param {(item) => object} opts.makeBill  wraps raw bill data into a stored entity
 */
export function generateDemoBills({ menu, now = new Date(), firstSeq, makeBill }) {
  const rand = mulberry32(20261007);
  const itemPairs = menu.map((m) => [m, m.popularity]);
  const raw = [];

  for (let day = startOfYear(now); day <= now; day = addDays(day, 1)) {
    const month = day.getMonth();
    const perDay = MONTH_TARGETS[month] / daysInMonth(day.getFullYear(), month);
    const dow = (day.getDay() + 6) % 7;
    const noise = 0.92 + rand() * 0.16;
    const target = perDay * (DOW_FACTORS[dow] / DOW_MEAN) * noise;

    let revenue = 0;
    while (revenue < target) {
      const bill = buildBill(rand, itemPairs);
      revenue += bill.totals.grandTotal;
      const hour = pickWeighted(rand, HOUR_PAIRS);
      const at = new Date(day);
      at.setHours(hour, Math.floor(rand() * 60), Math.floor(rand() * 60), 0);
      // Today's history stops at the current moment — no bills from the future.
      if (at > now) continue;
      raw.push({ ...bill, at });
    }
  }

  raw.sort((a, b) => a.at - b.at);
  let seq = firstSeq;
  const bills = raw.map((b) => makeBill({ ...b, seq: seq++ }));
  return { bills, lastSeq: seq - 1 };
}

function buildBill(rand, itemPairs) {
  const lineCount = pickWeighted(rand, LINES_DIST);
  const chosen = new Set();
  const lines = [];
  let guard = 0;
  while (lines.length < lineCount && guard++ < 20) {
    const item = pickWeighted(rand, itemPairs);
    if (chosen.has(item.id)) continue;
    chosen.add(item.id);
    const quantity = pickWeighted(rand, QTY_PROFILES[item.qty] || QTY_PROFILES.main);
    lines.push({
      menuItemId: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      gstRate: item.gstRate,
      quantity,
    });
  }
  lines.forEach((l) => { l.lineTotal = lineTotal(l); });

  // Occasional discount on larger family orders
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  let discount = { type: 'amount', value: 0 };
  if (subtotal >= 600 && rand() < 0.08) discount = { type: 'percent', value: rand() < 0.6 ? 5 : 10 };

  const totals = calculateBill(lines, discount);
  const paymentMethod = pickWeighted(rand, PAYMENT_DIST);
  const status = rand() < 0.006 ? 'cancelled' : 'paid';
  return { lines, discount, totals, paymentMethod, status };
}
