import type { VowelMode } from '~/lib/utils/harakat';
import type { VisibleLetter } from '~/server/letters';
import { EmptyState } from './EmptyState';
import { LetterCard } from './LetterCard';
import { LetterDetail } from './LetterDetail';

interface LetterGridProps {
  visibleLetters: VisibleLetter[];
  currentHarakat: VowelMode;
}

/**
 * The child-facing letter grid (FR-2).
 *
 * - Empty: render `EmptyState` (icon-only, no text — PRD REQ-5.8).
 * - Populated: render a responsive CSS grid (`auto-fill, minmax(80px, 1fr)`)
 *   with one `LetterCard` per visible letter.
 * - Always: render `LetterDetail` at the end. It's a fixed overlay (not
 *   grid-positioned), so it floats above the grid whenever the UI store
 *   reports a selected letter.
 *
 * Loading/error states live in the route (Phase 3) — this component is purely
 * presentational.
 */
export function LetterGrid({ visibleLetters, currentHarakat }: LetterGridProps) {
  if (visibleLetters.length === 0) {
    return (
      <>
        <EmptyState />
        <LetterDetail visibleLetters={visibleLetters} currentHarakat={currentHarakat} />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3 p-4">
        {visibleLetters.map((letter) => (
          <LetterCard key={letter.letterId} letter={letter} />
        ))}
      </div>
      <LetterDetail visibleLetters={visibleLetters} currentHarakat={currentHarakat} />
    </>
  );
}
