import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './IconButton.jsx';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal = ({ open, onClose, title, children, footer }) => {
  const panelRef = useRef(null);
  const restoreTo = useRef(null);
  const titleId = useId();

  const trapFocus = useCallback((event) => {
    if (event.key !== 'Tab' || !panelRef.current) return;

    const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)];
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    restoreTo.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      trapFocus(event);
    };

    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.querySelector(FOCUSABLE)?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      restoreTo.current?.focus?.();
    };
  }, [open, onClose, trapFocus]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/45"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92dvh] w-full animate-sheet-up flex-col rounded-t-sheet bg-surface shadow-sheet sm:max-w-md sm:animate-fade-in sm:rounded-card lg:max-w-lg"
      >
        <header className="flex items-center justify-between px-5 pt-5 pb-1">
          <h2 id={titleId} className="text-lg font-semibold text-ink">
            {title}
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <X className="size-5" />
          </IconButton>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? <footer className="px-5 pt-1 pb-6">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
};
