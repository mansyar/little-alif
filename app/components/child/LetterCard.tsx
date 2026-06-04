import { audioEngine } from '~/lib/audio/audio-engine';
import { composeLetter } from '~/lib/utils/harakat';
import { type LetterId } from '~/db/schema';
import { useUiStore } from '~/stores/ui-store';
import type { VisibleLetter } from '~/server/letters';

interface LetterCardProps {
  letter: VisibleLetter;
}

/**
 * 28 deterministic soft pastel colors keyed by `letterId` (KD-3).
 *
 * Defined inline — no design tokens file, no external config. Tailwind's
 * standard 100-level palette is used so each cell stays soft and never
 * competes with the dark glyph rendered on top of it.
 */
const LETTER_BG: Record<LetterId, string> = {
  alif: 'bg-rose-100',
  ba: 'bg-orange-100',
  ta: 'bg-amber-100',
  tsa: 'bg-yellow-100',
  jim: 'bg-lime-100',
  ha: 'bg-green-100',
  kho: 'bg-emerald-100',
  dal: 'bg-teal-100',
  dzal: 'bg-cyan-100',
  ra: 'bg-sky-100',
  zai: 'bg-blue-100',
  sin: 'bg-indigo-100',
  syin: 'bg-violet-100',
  shad: 'bg-purple-100',
  dhad: 'bg-fuchsia-100',
  tha: 'bg-pink-100',
  dzha: 'bg-rose-200',
  ain: 'bg-orange-200',
  ghain: 'bg-amber-200',
  fa: 'bg-yellow-200',
  qaf: 'bg-lime-200',
  kaf: 'bg-green-200',
  lam: 'bg-emerald-200',
  mim: 'bg-teal-200',
  nun: 'bg-cyan-200',
  waw: 'bg-sky-200',
  hae: 'bg-blue-200',
  ya: 'bg-indigo-200',
};

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
  const bg = LETTER_BG[letter.letterId as LetterId] ?? 'bg-sand-light';

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
