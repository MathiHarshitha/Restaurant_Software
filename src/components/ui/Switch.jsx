import { cn } from '../../utils/cn';

export default function Switch({ checked, onChange, label, disabled = false, size = 'md' }) {
  const dims = size === 'sm' ? ['h-5 w-9', 'h-4 w-4', 'translate-x-4'] : ['h-6 w-11', 'h-5 w-5', 'translate-x-5'];
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50',
        dims[0],
        checked ? 'bg-emerald-600' : 'bg-ink-300',
      )}
    >
      <span className={cn('rounded-full bg-white shadow transition-transform', dims[1], checked ? dims[2] : 'translate-x-0')} />
    </button>
  );
}
