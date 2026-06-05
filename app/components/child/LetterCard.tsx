import { audioEngine } from '~/lib/audio/audio-engine';
import { composeLetter } from '~/lib/utils/harakat';
import { type LetterId, LETTER_BG_COLORS } from '~/lib/constants/letters';
import { useUiStore } from '~/stores/ui-store';
import type { VisibleLetter } from '~/server/letters';

interface LetterCardProps {
  letter: VisibleLetter;
}

/**
 * 28 deterministic soft pastel colors keyed by `letterId` (KD-3).
 *
 * Defined in the canonical constants file so the palette stays in sync
 * with the letter ID list automatically.
 */

/**
 * A single tappable letter card on the /learn grid.
 *
 * Tap behaviour (FR-3, KD-4, KD-5):
 *   1. `setSelectedLetter(letterId)` opens the `LetterDetail` overlay.
 *   2. `await audioEngine.speak(...)` pronounces the composed glyph.
 *   3. `.finally(() => setSelectedLetter(null))` auto-dismisses the overlay
 *      whether the utterance ended normally or was cancelled.
 *
 * The `currentHarakat` is read at render time from `useUiStore` (DD-6). When
 * the child switches vowel mode via the harakat bar, all cards re-render
 * reactively with the new composed glyph (FR-9).
 */
export function LetterCard({ letter }: LetterCardProps) {
  const currentHarakat = useUiStore((state) => state.currentHarakat);
  const setSelectedLetter = useUiStore((state) => state.setSelectedLetter);

  const glyph = composeLetter(letter.character, currentHarakat);
  // `letter.letterId` is typed as `string` on VisibleLetter, but every row
  // returned by the server is a known LetterId. Cast for the indexed lookup.
  const bg = LETTER_BG_COLORS[letter.letterId as LetterId] ?? 'bg-sand-light';

  const handleClick = () => {
    setSelectedLetter(letter.letterId);
    void audioEngine.speak(letter.letterId, currentHarakat, letter.character).finally(() => {
      setSelectedLetter(null);
    });
  };

  return (
    <button
      type="button"
      aria-label={letter.letterId}
      onClick={handleClick}
      className={`flex aspect-square min-h-[64px] min-w-[64px] items-center justify-center rounded-large font-arabic text-3xl font-bold text-text-dark shadow-sm active:scale-95 transition-transform ${bg}`}
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
}
