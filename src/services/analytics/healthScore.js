import { pctChange, slowMovingItems } from './aggregate';

const clamp = (v, lo = 0, hi = 100) => Math.round(Math.min(hi, Math.max(lo, v)));

/**
 * Restaurant Health (preview). A transparent, rule-based score from the last 30 days
 * compared with the 30 days before. Each factor is 0–100; the overall score is a weighted mean.
 */
export function computeHealthScore({ current, previous, menu, periodStart }) {
  const growth = pctChange(current.sales, previous.sales) ?? 0;
  const spend = pctChange(current.avgBill, previous.avgBill) ?? 0;

  const eligible = menu.filter((m) => !m.deletedAt && new Date(m.createdAt).getTime() <= periodStart).length || 1;
  const slow = slowMovingItems(current, menu, periodStart).items.length;

  const digital = current.sales ? (current.payments.upi.amount + current.payments.card.amount) / current.sales : 0;
  const cancelRate = current.orders + current.cancelled ? current.cancelled / (current.orders + current.cancelled) : 0;

  const daily = current.days.map((d) => d.sales);
  const mean = daily.reduce((s, v) => s + v, 0) / (daily.length || 1);
  const sd = Math.sqrt(daily.reduce((s, v) => s + (v - mean) ** 2, 0) / (daily.length || 1));
  const cv = mean ? sd / mean : 0;

  const factors = [
    { key: 'growth', label: 'Sales Growth', score: clamp(72 + growth * 2.2, 20, 98), hint: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% vs previous 30 days`, weight: 0.25 },
    { key: 'spend', label: 'Average Customer Spend', score: clamp(78 + spend * 3, 20, 98), hint: `${spend >= 0 ? '+' : ''}${spend.toFixed(1)}% change in average bill`, weight: 0.2 },
    { key: 'items', label: 'Item Performance', score: clamp(100 - (slow / eligible) * 220), hint: `${eligible - slow} of ${eligible} items selling steadily`, weight: 0.2 },
    { key: 'payments', label: 'Payment Collection', score: clamp(55 + digital * 45 - cancelRate * 400), hint: `${Math.round(digital * 100)}% collected digitally`, weight: 0.15 },
    { key: 'consistency', label: 'Sales Consistency', score: clamp(100 - cv * 150), hint: 'Day-to-day variation in sales', weight: 0.2 },
  ];

  const overall = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0));
  const band = overall >= 80 ? 'Healthy' : overall >= 60 ? 'Stable' : 'Needs attention';
  return { overall, band, factors };
}
