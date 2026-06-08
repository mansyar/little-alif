import { useEffect, useRef } from 'react';
import { composeLetter, type VowelMode } from '~/lib/utils/harakat';
import { useUiStore } from '~/stores/ui-store';
import { audioEngine } from '~/lib/audio/audio-engine';
import type { VisibleLetter } from '~/server/letters';

interface LetterDetailProps {
  /** The letters currently visible to the active child (used to look up the character). */
  visibleLetters: VisibleLetter[];
  /** Current harakat for composition (read from useUiStore, but passed for explicit coupling). */
  currentHarakat: VowelMode;
}

/**
 * Full-screen overlay that surfaces the letter currently being spoken (FR-4, KD-4).
 *
 * Open state: `useUiStore.selectedLetterId !== null` (KD-6 — no new state).
 * Audio lifecycle: auto-plays on mount / swipe navigation, auto-dismisses on completion.
 * Swipe: horizontal pointer gestures (≥50px) navigate between letters with wrap-around.
 */
export function LetterDetail({ visibleLetters, currentHarakat }: LetterDetailProps) {
  const selectedLetterId = useUiStore((state) => state.selectedLetterId);
  const setSelectedLetter = useUiStore((state) => state.setSelectedLetter);

  // Hooks must be called unconditionally — before any early return
  const prevLetterIdRef = useRef<string | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const letter = selectedLetterId
    ? visibleLetters.find((l) => l.letterId === selectedLetterId)
    : undefined;

  // Audio lifecycle: auto-play when opened / navigated, auto-dismiss on completion.
  // Cleanup cancels any in-flight utterance when the letter changes.
  useEffect(() => {
    if (!selectedLetterId || !letter) return;

    prevLetterIdRef.current = selectedLetterId;
    let cancelled = false;

    audioEngine
      .speak(letter.letterId, currentHarakat, letter.character)
      .then(() => {
        if (!cancelled && useUiStore.getState().selectedLetterId === selectedLetterId) {
          setSelectedLetter(null);
        }
      })
      .catch(() => {
        // Ignore rejection — promise is cancelled on cleanup
      });

    return () => {
      cancelled = true;
      audioEngine.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLetterId, letter?.letterId]);

  if (selectedLetterId === null) {
    return null;
  }

  if (!letter) {
    return null;
  }

  const glyph = composeLetter(letter.character, currentHarakat);

  /**
   * Swipe detection uses pointer events (onPointerDown / onPointerUp) for
   * uniform handling of touch, pen, and mouse input. The `touch-none` class
   * prevents the browser from processing touch gestures (scroll, zoom).
   *
   * Note: jsdom does not implement PointerEvent, so unit tests dispatch
   * MouseEvent instead (touch devices synthesize mouse events; this is
   * functionally equivalent for unit test purposes).
   */
  const handlePointerDown = (e: React.MouseEvent<HTMLDivElement>) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pointerStart.current) return;

    const deltaX = e.clientX - pointerStart.current.x;
    const deltaY = e.clientY - pointerStart.current.y;
    const absDx = Math.abs(deltaX);
    const absDy = Math.abs(deltaY);
    pointerStart.current = null;

    // Ignore if below threshold or more vertical than horizontal
    if (absDx < 50 || absDx < absDy) return;

    const currentIndex = visibleLetters.findIndex((l) => l.letterId === selectedLetterId);
    if (currentIndex === -1 || visibleLetters.length <= 1) return;

    const targetIndex =
      deltaX > 0
        ? (currentIndex - 1 + visibleLetters.length) % visibleLetters.length // swipe right → previous
        : (currentIndex + 1) % visibleLetters.length; // swipe left → next

    const targetLetter = visibleLetters[targetIndex];
    if (targetLetter) {
      setSelectedLetter(targetLetter.letterId);
    }
  };

  return (
    <div
      role="dialog"
      aria-label={`Letter ${letter.letterId}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-dark/30 animate-bounceIn touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
    >
      <span
        aria-hidden="true"
        className="font-arabic text-9xl font-bold text-text-dark select-none"
      >
        {glyph}
      </span>
    </div>
  );
}
