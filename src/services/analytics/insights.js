import { formatCurrency, formatNumber, formatPercent } from '../../utils/format';
import { formatHour } from '../../utils/dates';
import { PAYMENT_LABELS } from '../../config/app';
import { pctChange, peakWindow, slowMovingItems, topByQuantity, weekendVsWeekday } from './aggregate';

const listNames = (names) =>
  names.length <= 1 ? names.join('') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

/**
 * Turns aggregates into plain-language, actionable statements.
 * @param {object} p
 * @param {object} p.current       aggregate for the period
 * @param {object} p.previous      aggregate for the comparable previous period
 * @param {string} p.versusLabel   e.g. "last month"
 * @param {string} p.scopeLabel    e.g. "this month"
 * @param {Array}  p.menu
 * @param {number} p.periodStart
 */
export function buildInsights({ current, previous, versusLabel, scopeLabel, menu, periodStart }) {
  if (!current.orders) return [];
  const out = [];

  const growth = pctChange(current.sales, previous.sales);
  if (growth !== null) {
    const up = growth >= 0;
    out.push({
      id: 'growth',
      tone: up ? 'positive' : 'warning',
      icon: up ? 'trending-up' : 'trending-down',
      title: `Sales ${up ? 'increased' : 'decreased'} ${formatPercent(Math.abs(growth))} compared with ${versusLabel}.`,
      detail: `${formatCurrency(current.sales)} against ${formatCurrency(previous.sales)} for the same number of days.`,
    });
  }

  const [top] = topByQuantity(current, 1);
  if (top) {
    out.push({
      id: 'top-item',
      tone: 'positive',
      icon: 'star',
      title: `${top.name} is your highest-selling item.`,
      detail: `${formatNumber(top.quantity)} sold ${scopeLabel}, bringing in ${formatPercent(top.share, { digits: 0 })} of food revenue.`,
    });
  }

  const peak = peakWindow(current.hours);
  out.push({
    id: 'peak',
    tone: 'neutral',
    icon: 'clock',
    title: `Your busiest period is between ${formatHour(peak.startHour)} and ${formatHour(peak.endHour)}.`,
    detail: `${formatPercent(peak.share, { digits: 0 })} of all orders arrive in these two hours — plan staff and kitchen prep around it.`,
  });

  const wk = weekendVsWeekday(current);
  if (wk.lift !== null && Math.abs(wk.lift) >= 10) {
    out.push({
      id: 'weekend',
      tone: 'neutral',
      icon: 'calendar',
      title: wk.lift > 0
        ? `Weekend sales are ${formatPercent(wk.lift, { digits: 0 })} higher than weekday sales.`
        : `Weekday sales are ${formatPercent(-wk.lift, { digits: 0 })} higher than weekend sales.`,
      detail: `Average ${formatCurrency(wk.weekend)} per weekend day vs ${formatCurrency(wk.weekday)} on weekdays.`,
    });
  }

  const slow = slowMovingItems(current, menu, periodStart).items;
  if (slow.length) {
    out.push({
      id: 'slow',
      tone: 'warning',
      icon: 'alert',
      title: `${slow.length} menu ${slow.length === 1 ? 'item has' : 'items have'} low sales ${scopeLabel}.`,
      detail: `${listNames(slow.slice(0, 3).map((s) => s.name))}${slow.length > 3 ? ' and others' : ''} — consider a combo offer or a menu refresh.`,
    });
  }

  const avgChange = pctChange(current.avgBill, previous.avgBill);
  if (avgChange !== null && Math.abs(avgChange) >= 1) {
    out.push({
      id: 'avg-bill',
      tone: avgChange > 0 ? 'positive' : 'warning',
      icon: 'receipt',
      title: `Average bill ${avgChange > 0 ? 'rose' : 'fell'} ${formatPercent(Math.abs(avgChange))} to ${formatCurrency(current.avgBill)}.`,
      detail: avgChange > 0 ? 'Customers are ordering more per visit.' : 'Suggest add-ons like beverages and desserts at billing.',
    });
  }

  const [method, data] = Object.entries(current.payments).sort((a, b) => b[1].amount - a[1].amount)[0];
  out.push({
    id: 'payments',
    tone: 'neutral',
    icon: 'wallet',
    title: `${PAYMENT_LABELS[method]} is your most-used payment method.`,
    detail: `${formatPercent((data.amount / current.sales) * 100, { digits: 0 })} of collections ${scopeLabel} came through ${PAYMENT_LABELS[method]}.`,
  });

  return out;
}
