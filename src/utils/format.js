const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const num = new Intl.NumberFormat('en-IN');

/** ₹1,85,240 — whole rupees */
export const formatCurrency = (value) => `₹${inr.format(Math.round(value || 0))}`;

/** ₹1,85,240.50 — paise precision, used on receipts */
export const formatCurrencyExact = (value) => `₹${inr2.format(value || 0)}`;

/** ₹4.8L / ₹1.2Cr / ₹38.2K — compact Indian notation for charts and tiles */
export function formatCurrencyCompact(value) {
  const v = Math.abs(value || 0);
  const sign = value < 0 ? '-' : '';
  if (v >= 1e7) return `${sign}₹${trim(v / 1e7)}Cr`;
  if (v >= 1e5) return `${sign}₹${trim(v / 1e5)}L`;
  if (v >= 1e3) return `${sign}₹${trim(v / 1e3)}K`;
  return `${sign}₹${Math.round(v)}`;
}

const trim = (n) => (n >= 100 ? Math.round(n).toString() : n.toFixed(n >= 10 ? 1 : 2).replace(/\.?0+$/, ''));

export const formatNumber = (value) => num.format(Math.round(value || 0));

export function formatPercent(value, { signed = false, digits = 1 } = {}) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  const s = Math.abs(value).toFixed(digits);
  if (!signed) return `${s}%`;
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${s}%`;
}

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const pluralize = (count, word, plural = `${word}s`) => `${formatNumber(count)} ${count === 1 ? word : plural}`;
