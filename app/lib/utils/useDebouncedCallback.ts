import { useCallback, useRef, useEffect } from 'react';

/**
 * Returns a debounced version of the provided callback.
 * Rapid successive calls will only invoke the callback once
 * after `delay` ms of inactivity.
 *
 * The returned function is stable across renders (identity only
 * depends on `delay`), so it is safe to pass into effect deps or
 * event handlers that expect referential stability.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callbackRef in sync so the timeout always calls the latest callback
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}
