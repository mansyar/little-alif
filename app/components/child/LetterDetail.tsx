import { composeLetter, type VowelMode } from '~/lib/utils/harakat';
import { useUiStore } from '~/stores/ui-store';
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
 * Auto-dismiss: not handled here. `LetterCard` clears `selectedLetterId` in a
 * `.finally()` when `audioEngine.speak(...)` resolves (or is cancelled).
 *
 * No manual dismiss handler: PRD REQ-5.6 requires playback to complete before
 * returning, so the backdrop is not clickable.
 */
export function LetterDetail({ visibleLetters, currentHarakat }: LetterDetailProps) {
  const selectedLetterId = useUiStore((state) => state.selectedLetterId);

  if (selectedLetterId === null) {
    return null;
  }

  const letter = visibleLetters.find((l) => l.letterId === selectedLetterId);
  if (!letter) {
    return null;
  }

  const glyph = composeLetter(letter.character, currentHarakat);

  return (
    <div
      role="dialog"
      aria-label={`Letter ${letter.letterId}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background-warm/95"
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
