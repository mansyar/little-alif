import { useEffect, useRef } from 'react';
import { useUiStore } from '~/stores/ui-store';

const TOAST_DURATION = 5_000;

const variantStyles: Record<string, string> = {
  success: 'border-green/30 bg-green-light text-green-dark',
  error: 'border-coral/30 bg-coral/10 text-coral',
  info: 'border-sand-dark/30 bg-sand-light text-text-dark',
};

/**
 * Renders a stack of toast notifications from the Zustand ui-store.
 * Each toast auto-dismisses after 5 seconds or on click.
 * Renders nothing when the toasts array is empty.
 */
export function ToastContainer() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Set up auto-dismiss timers for each toast
  useEffect(() => {
    for (const toast of toasts) {
      if (timersRef.current.has(toast.id)) continue;

      const timer = setTimeout(() => {
        dismissToast(toast.id);
        timersRef.current.delete(toast.id);
      }, TOAST_DURATION);

      timersRef.current.set(toast.id, timer);
    }

    // Clean up timers for removed toasts
    const activeIds = new Set(toasts.map((t) => t.id));
    for (const [id, timer] of timersRef.current) {
      if (!activeIds.has(id)) {
        clearTimeout(timer);
        timersRef.current.delete(id);
      }
    }
  }, [toasts, dismissToast]);

  // Clean up all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2" aria-live="polite">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => dismissToast(toast.id)}
          className={`min-h-[44px] cursor-pointer rounded-large border px-4 py-3 text-sm font-medium shadow-card transition-opacity hover:opacity-90 ${variantStyles[toast.variant] ?? variantStyles.info}`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
