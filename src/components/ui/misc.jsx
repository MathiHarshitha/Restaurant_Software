import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatPercent } from '../../utils/format';

export function PageHeader({ title, subtitle, actions, eyebrow }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[13px] font-medium text-ink-500">{eyebrow}</p>}
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Up/down change indicator. Colour is paired with an arrow and sign, never colour alone. */
export function DeltaBadge({ value, invert = false, className }) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <span className={cn('badge-neutral', className)}>No comparison</span>;
  }
  const flat = Math.abs(value) < 0.05;
  const good = invert ? value < 0 : value > 0;
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn(flat ? 'badge-neutral' : good ? 'badge-green' : 'badge-red', 'num', className)}>
      <Icon size={13} strokeWidth={2.5} />
      {formatPercent(value, { signed: true })}
    </span>
  );
}

export function DietMark({ isVeg, className }) {
  return (
    <span
      className={cn('diet-mark', isVeg ? 'border-emerald-600 text-emerald-600' : 'border-red-700 text-red-700', className)}
      title={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
    />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      {Icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-ink-100 text-ink-500">
          <Icon size={20} />
        </div>
      )}
      <p className="text-sm font-medium text-ink-800">{title}</p>
      {description && <p className="mt-1 max-w-xs text-[13px] text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-lg bg-ink-100', className)} />;
}

export function CardHeader({ title, subtitle, right, className }) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        <h3 className="card-title">{title}</h3>
        {subtitle && <p className="card-sub mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}
