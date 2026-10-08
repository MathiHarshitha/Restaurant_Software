import { Bar, BarChart, CartesianGrid, Cell, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART, axisProps } from './theme';
import { OPEN_HOURS } from '../../services/analytics/aggregate';
import { formatHour } from '../../utils/dates';

export default function PeakHoursChart({ hours = [], peakStart = 19, peakEnd = 21 }) {
  const visible = hours.filter((h) => OPEN_HOURS.includes(h.hour));
  const max = Math.max(...visible.map((h) => h.orders), 1);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={visible} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="0" />
        <XAxis
          dataKey="hour"
          {...axisProps}
          tickFormatter={formatHour}
          interval={1}
        />
        <YAxis {...axisProps} width={28} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: CHART.grid, opacity: 0.5 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-lg bg-white px-3 py-2 text-xs shadow-pop ring-1 ring-ink-900/5">
                <p className="font-semibold text-ink-900">{formatHour(d.hour)}</p>
                <p className="text-ink-500">{d.orders} orders · avg {(d.orders / 30).toFixed(1)}/day</p>
                {d.hour >= peakStart && d.hour < peakEnd && (
                  <p className="mt-1 font-medium text-brand-600">Peak period</p>
                )}
              </div>
            );
          }}
        />
        <Bar dataKey="orders" radius={[4, 4, 0, 0]} maxBarSize={28} shape={<Rectangle />}>
          {visible.map((h) => (
            <Cell
              key={h.hour}
              fill={h.hour >= peakStart && h.hour < peakEnd ? CHART.series1 : CHART.muted}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
