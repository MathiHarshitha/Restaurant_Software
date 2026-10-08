/** Shared tooltip card for Recharts. `rows` maps payload entries to label/value text. */
export default function ChartTooltip({ active, payload, label, rows, title }) {
  if (!active || !payload?.length) return null;
  const items = rows(payload).filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="min-w-[160px] rounded-lg bg-white px-3 py-2.5 text-[13px] shadow-pop ring-1 ring-ink-900/5">
      <p className="mb-1.5 font-medium text-ink-900">{title ? title(payload, label) : label}</p>
      <div className="space-y-1">
        {items.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-ink-500">
              {r.color && <span className="h-2 w-2 rounded-full" style={{ background: r.color }} />}
              {r.label}
            </span>
            <span className="num font-medium text-ink-900">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
