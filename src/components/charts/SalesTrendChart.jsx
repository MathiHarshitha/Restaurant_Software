import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { CHART, axisProps } from './theme';
import { formatCurrencyCompact, formatCurrency } from '../../utils/format';
import ChartTooltip from './ChartTooltip';

export default function SalesTrendChart({ data = [], bucket = 'day' }) {
  if (!data.length) return <div className="flex h-48 items-center justify-center text-sm text-ink-400">No data for this period</div>;

  const max = Math.max(...data.map((d) => d.sales ?? 0));
  const hasValues = max > 0;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.series1} stopOpacity={0.15} />
            <stop offset="100%" stopColor={CHART.series1} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={CHART.grid} strokeDasharray="0" strokeWidth={1} />
        <XAxis
          dataKey="label"
          {...axisProps}
          tickFormatter={(v) => (data.length > 12 ? v.replace(/ \d{4}/, '') : v)}
          interval={data.length > 20 ? Math.floor(data.length / 8) : 0}
        />
        <YAxis
          {...axisProps}
          tickFormatter={formatCurrencyCompact}
          width={58}
          domain={hasValues ? [0, 'auto'] : [0, 1000]}
        />
        <Tooltip
          content={({ active, payload, label }) => (
            <ChartTooltip
              active={active}
              payload={payload}
              label={label}
              rows={(p) => [
                p[0] && { label: 'Sales', color: CHART.series1, value: formatCurrency(p[0].value ?? 0) },
                p[1] && { label: 'Orders', color: CHART.muted, value: p[1].value?.toLocaleString() ?? '0' },
              ]}
            />
          )}
          cursor={{ stroke: CHART.grid, strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="sales"
          stroke={CHART.series1}
          strokeWidth={2}
          fill="url(#salesGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
          connectNulls={false}
        />
        <Area
          type="monotone"
          dataKey="orders"
          stroke={CHART.muted}
          strokeWidth={1.5}
          fill="none"
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0 }}
          connectNulls={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
