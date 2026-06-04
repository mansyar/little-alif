import { useCallback, useEffect, useRef, useState } from 'react';
import { Lock, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  PARENT_GATE_LONG_PRESS_MS,
  PARENT_GATE_TAP_COUNT,
  PARENT_GATE_TAP_WINDOW_MS,
} from '~/lib/utils/parent-gate';

interface ParentGateProps {
  /** Called when the gate is unlocked and "Exit" is chosen. */
  onExit: () => void | Promise<void>;
  /** Called when the gate is unlocked and "Switch child" is chosen. */
  onSwitchChild: () => void;
  /** Disables all interactions (e.g., while a request is in flight). */
  disabled?: boolean;
}

/**
 * Hidden parent-only escape hatch from the child routes.
 *
 * Visual: a low-contrast Lock icon in the top-right corner of the child
 * route header. Designed to be invisible to a 3-year-old in normal use
 * (40% muted text colour) but discoverable to a parent.
 *
 * Unlocked by either of two gestures (defined in `parent-gate.ts`):
 *  - Long-press the icon for PARENT_GATE_LONG_PRESS_MS.
 *  - Tap the icon PARENT_GATE_TAP_COUNT times within PARENT_GATE_TAP_WINDOW_MS.
 *
 * Unlocking opens a small Radix Dialog menu (z-60, above LetterDetail's
 * z-50 overlay) with two actions: "Switch child" and "Exit to parent
 * dashboard". The menu can be closed via the close affordance.
 */
export function ParentGate({ onExit, onSwitchChild, disabled = false }: ParentGateProps) {
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const [tapTimestamps, setTapTimestamps] = useState<number[]>([]);

  // Refs for animation/timer state — kept in refs so the cleanup
  // function in useEffect can cancel them regardless of stale closures.
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);
  const holdCompletedRef = useRef(false);

  const clearHold = useCallback(() => {
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    holdStartTimeRef.current = null;
    setHolding(false);
    setProgress(0);
  }, []);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (holdTimerRef.current !== null) clearTimeout(holdTimerRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const openMenu = useCallback(() => {
    holdCompletedRef.current = true; // suppress next pointerup-as-tap
    clearHold();
    setMenuOpen(true);
    setTapTimestamps([]);
  }, [clearHold]);

  const startHold = useCallback(() => {
    if (disabled) return;
    holdStartTimeRef.current = performance.now();
    holdCompletedRef.current = false;
    setHolding(true);
    setProgress(0);

    const tick = () => {
      if (holdStartTimeRef.current === null) return;
      const elapsed = performance.now() - holdStartTimeRef.current;
      const next = Math.min(elapsed / PARENT_GATE_LONG_PRESS_MS, 1);
      setProgress(next);
      if (next < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      rafRef.current = null;
      openMenu();
    }, PARENT_GATE_LONG_PRESS_MS);
  }, [disabled, openMenu]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      // Only left-button / touch / pen
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      startHold();
    },
    [startHold],
  );

  const handlePointerUp = useCallback(() => {
    // If the long-press timer already fired and opened the menu, this
    // pointerup is the release of the long-press and should NOT count
    // as a tap.
    if (holdCompletedRef.current) {
      holdCompletedRef.current = false;
      return;
    }

    // Otherwise: cancel the pending long-press and record as a tap.
    clearHold();
    if (disabled) return;

    const now = performance.now();
    const recent = tapTimestamps.filter((t) => now - t <= PARENT_GATE_TAP_WINDOW_MS);
    const updated = [...recent, now];
    if (updated.length >= PARENT_GATE_TAP_COUNT) {
      setTapTimestamps([]);
      // Defer the open so this setState doesn't conflict with the one above.
      setTimeout(() => {
        holdCompletedRef.current = true;
        setMenuOpen(true);
      }, 0);
    } else {
      setTapTimestamps(updated);
    }
  }, [clearHold, disabled, tapTimestamps]);

  const handlePointerLeave = useCallback(() => {
    // Drifting off the button cancels the long-press but does NOT
    // register a tap.
    if (holdTimerRef.current !== null || rafRef.current !== null) {
      clearHold();
    }
  }, [clearHold]);

  const handlePointerCancel = useCallback(() => {
    clearHold();
  }, [clearHold]);

  return (
    <>
      <button
        type="button"
        aria-label="Parent menu"
        data-progress={progress.toFixed(3)}
        data-holding={holding}
        disabled={disabled}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onPointerCancel={handlePointerCancel}
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-text-muted/40 hover:text-text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Lock
          className={`pointer-events-none h-6 w-6 transition-colors ${holding ? 'text-text-muted/70' : ''}`}
          aria-hidden="true"
        />
        {/* Decorative progress ring. Uses SVG so it animates via dasharray
            and never blocks pointer events. */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-11 w-11 -rotate-90"
          viewBox="0 0 44 44"
        >
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-green"
            strokeDasharray={`${(progress * 2 * Math.PI * 20).toFixed(3)} ${(2 * Math.PI * 20).toFixed(3)}`}
          />
        </svg>
      </button>

      <Dialog.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed right-4 top-20 z-[60] w-[18rem] max-w-[calc(100vw-2rem)] rounded-large bg-white p-4 shadow-large"
          >
            <div className="mb-3 flex items-center justify-between">
              <Dialog.Title className="text-base font-semibold text-text-dark">
                Parent menu
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close parent menu"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-sand-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onSwitchChild();
                }}
                className="rounded-small bg-green px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
              >
                Switch child
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void Promise.resolve(onExit()).catch(() => {
                    /* swallow — parent owns error display */
                  });
                }}
                className="rounded-small border-2 border-green bg-white px-4 py-3 text-sm font-semibold text-green transition-colors hover:bg-green hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
              >
                Exit to parent dashboard
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
