import type { ReadingGroup } from '~/lib/utils/reading';
import { Shuffle, ChevronRight, Check, Dices } from 'lucide-react';

interface ReadingActionsProps {
  groups: ReadingGroup[];
  onShuffle: () => void;
  onNext: () => void;
  onDone: () => void;
  onRandomizeHarakat: () => void;
}

export function ReadingActions({
  groups,
  onShuffle,
  onNext,
  onDone,
  onRandomizeHarakat,
}: ReadingActionsProps) {
  return (
    <div className="flex gap-3 justify-center">
      <button
        type="button"
        aria-label="Randomize vowel"
        onClick={onRandomizeHarakat}
        className="min-h-[56px] px-4 rounded-lg bg-white border border-gray-200 active:scale-95 transition-transform flex items-center gap-2"
      >
        <Dices className="h-5 w-5" aria-hidden="true" />
        <span>Random</span>
      </button>
      <button
        type="button"
        aria-label="Shuffle rows"
        onClick={onShuffle}
        className="min-h-[56px] px-4 rounded-lg bg-white border border-gray-200 active:scale-95 transition-transform flex items-center gap-2"
      >
        <Shuffle className="h-5 w-5" aria-hidden="true" />
        <span>Shuffle</span>
      </button>
      {groups.length > 1 && (
        <button
          type="button"
          aria-label="Next group"
          onClick={onNext}
          className="min-h-[56px] px-4 rounded-lg bg-white border border-gray-200 active:scale-95 transition-transform flex items-center gap-2"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
          <span>Next Group</span>
        </button>
      )}
      <button
        type="button"
        aria-label="Done reading practice"
        onClick={onDone}
        className="min-h-[56px] px-4 rounded-lg bg-white border border-gray-200 active:scale-95 transition-transform flex items-center gap-2"
      >
        <Check className="h-5 w-5" aria-hidden="true" />
        <span>Done</span>
      </button>
    </div>
  );
}
