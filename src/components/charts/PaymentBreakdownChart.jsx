import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PAYMENT_COLORS } from './theme';
import { PAYMENT_LABELS } from '../../config/app';
import { formatCurrency } from '../../utils/format';

export default function PaymentBreakdownChart({ payments }) {
  const data = Object.entries(payments || {})
    .filter(([, v]) => v.amount > 0)
    .map(([key, v]) => ({ key, name: PAYMENT_LABELS[key], value: v.amount, count: v.count }));

  const total = data.reduce((s, d) => s + d.value, 0);
  if (!total) {
    return <div className="flex h-40 items-center justify-center text-sm text-ink-400">No payment data</div>;
  }

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="h-[140px] w-[140px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={64}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.key} fill={PAYMENT_COLORS[d.key] ?? '#898781'} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="rounded-lg bg-white px-3 py-2 text-xs shadow-pop ring-1 ring-ink-900/5">
                    <p className="font-semibold text-ink-900">{d.name}</p>
                    <p className="text-ink-500">{formatCurrency(d.value)}</p>
                    <p className="text-ink-400">{((d.value / total) * 100).toFixed(0)}% · {d.count} bills</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-3 min-w-[160px]">
        {data.map((d) => (
          <div key={d.key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-medium text-ink-800">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: PAYMENT_COLORS[d.key] }} />
                {d.name}
              </span>
              <span className="num font-semibold text-ink-900">{formatCurrency(d.value)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(d.value / total) * 100}%`, background: PAYMENT_COLORS[d.key] }}
              />
            </div>
            <p className="mt-0.5 text-right text-xs text-ink-400">{((d.value / total) * 100).toFixed(0)}%</p>
          </div>
        ))}
      </div>
    </div>
  );
}
