import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Rendered inline (not portalled) so it stays inside #root and is hidden when printing.
 */
export default function Modal({ open, onClose, title, description, children, footer, size = 'md', hideClose = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:pt-[8vh]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="fixed inset-0 bg-ink-900/40" onClick={onClose} />
      <div className={cn('relative w-full card shadow-pop', width)}>
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 px-5 pt-5">
            <div>
              {title && <h2 className="text-base font-semibold text-ink-900">{title}</h2>}
              {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
            </div>
            {!hideClose && (
              <button type="button" className="icon-btn -mr-1.5 -mt-1" onClick={onClose} aria-label="Close">
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-ink-100 px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}
