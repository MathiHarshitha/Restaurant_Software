// Small, dependency-free date helpers. All calculations use the device's local time,
// which is what a restaurant owner reads on the bill.

export const DAY_MS = 86_400_000;

export const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
export const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const addMonths = (d, n) => { const x = new Date(d); x.setDate(1); x.setMonth(x.getMonth() + n); return x; };
export const startOfMonth = (d) => { const x = startOfDay(d); x.setDate(1); return x; };
export const startOfYear = (d) => { const x = startOfDay(d); x.setMonth(0, 1); return x; };
export const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

/** Week starts on Monday */
export function startOfWeek(d) {
  const x = startOfDay(d);
  const dow = (x.getDay() + 6) % 7;
  return addDays(x, -dow);
}

export const isSameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

const fmt = (opts) => new Intl.DateTimeFormat('en-IN', opts);
const fDayMonth = fmt({ day: '2-digit', month: 'short' });
const fFull = fmt({ day: '2-digit', month: 'short', year: 'numeric' });
const fTime = fmt({ hour: '2-digit', minute: '2-digit', hour12: true });
const fMonthYear = fmt({ month: 'long', year: 'numeric' });
const fMonthShort = fmt({ month: 'short' });
const fMonthLong = fmt({ month: 'long' });
const fWeekday = fmt({ weekday: 'long' });
const fWeekdayShort = fmt({ weekday: 'short' });

export const formatDate = (d) => fFull.format(new Date(d));
export const formatDayMonth = (d) => fDayMonth.format(new Date(d));
export const formatTime = (d) => fTime.format(new Date(d)).toUpperCase();
export const formatMonthYear = (d) => fMonthYear.format(new Date(d));
export const formatMonthShort = (d) => fMonthShort.format(new Date(d));
export const formatMonthLong = (d) => fMonthLong.format(new Date(d));
export const formatWeekday = (d) => fWeekday.format(new Date(d));
export const formatWeekdayShort = (d) => fWeekdayShort.format(new Date(d));

/** "7 PM" style label for an hour of day */
export function formatHour(h) {
  const hour = ((h % 24) + 24) % 24;
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12} ${suffix}`;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/** yyyy-mm-dd for <input type="date"> in local time */
export function toInputDate(d) {
  const x = new Date(d);
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${x.getFullYear()}-${m}-${day}`;
}

export function fromInputDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
