// Connect Dhaba brand chart palette
// Primary series = Deep Maroon (high contrast, 11:1 on white)
// Gold accents for secondary series and highlights
export const CHART = {
  series1:  '#7A1E23',   // Deep Maroon — primary series (sales, revenue)
  series2:  '#C3542E',   // Accent Orange — second series
  series3:  '#8B5E3C',   // Earthy Brown — third series
  series4:  '#D4AF6B',   // Warm Gold — fourth / UPI
  previous: '#c2b9ac',   // muted comparison line
  grid:     '#ede9e3',
  axis:     '#9e9286',
  highlight:'#7A1E23',
  muted:    '#e0c9a0',   // soft gold fill for gradient
};

// Payment method colours — each payment type owns a fixed hue everywhere
export const PAYMENT_COLORS = {
  upi:  '#7A1E23',   // Maroon
  cash: '#8B5E3C',   // Brown
  card: '#C3542E',   // Accent Orange
};

export const axisProps = {
  tick:    { fill: CHART.axis, fontSize: 12 },
  tickLine: false,
  axisLine: false,
};
