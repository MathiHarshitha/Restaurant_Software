import { cn } from '../../utils/cn';

/** Compact segmented control for mutually exclusive options. */
export default function Segmented({ options, value, onChange, size = 'md', className, ariaLabel }) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn('inline-flex rounded-lg p-0.5', className)} style={{ background: '#ede9e3' }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-[13px]',
              active ? 'text-cream-200 shadow-sm' : 'text-ink-500 hover:text-ink-800',
            )}
            style={active ? { background: '#7A1E23' } : {}}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
