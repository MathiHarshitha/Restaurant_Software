// Chart tokens (validated reference palette). Categorical slots are assigned in fixed order
// and follow the entity: UPI is always slot 1, Cash slot 2, Card slot 3 — everywhere.
export const CHART = {
  series1: '#2a78d6',
  series2: '#eb6834',
  series3: '#1baf7a',
  previous: '#c3c2b7',
  grid: '#e1e0d9',
  axis: '#898781',
  highlight: '#2a78d6',
  muted: '#cde2fb',
};

export const PAYMENT_COLORS = { upi: CHART.series1, cash: CHART.series2, card: CHART.series3 };

export const axisProps = {
  tick: { fill: CHART.axis, fontSize: 12 },
  tickLine: false,
  axisLine: false,
};
