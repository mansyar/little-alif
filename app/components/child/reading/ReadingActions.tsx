import type { ReadingGroup } from '~/lib/utils/reading';
import { useI18nContext } from '~/lib/i18n';
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
  const { LL } = useI18nContext();
  return (
    <div className="flex gap-3 justify-center">
      <button
        type="button"
        aria-label={LL.READING_RANDOMIZE()}
        onClick={onRandomizeHarakat}
        className="min-h-[56px] px-4 rounded-small bg-white border border-sand-dark hover:bg-sand-light active:scale-95 transition-transform flex items-center gap-2"
      >
        <Dices className="h-5 w-5 text-green" aria-hidden="true" />
        <span>{LL.READING_RANDOMIZE()}</span>
      </button>
      <button
        type="button"
        aria-label={LL.READING_SHUFFLE()}
        onClick={onShuffle}
        className="min-h-[56px] px-4 rounded-small bg-white border border-sand-dark hover:bg-sand-light active:scale-95 transition-transform flex items-center gap-2"
      >
        <Shuffle className="h-5 w-5 text-green" aria-hidden="true" />
        <span>{LL.READING_SHUFFLE()}</span>
      </button>
      {groups.length > 1 && (
        <button
          type="button"
          aria-label={LL.READING_NEXT_GROUP()}
          onClick={onNext}
          className="min-h-[56px] px-4 rounded-small bg-white border border-sand-dark hover:bg-sand-light active:scale-95 transition-transform flex items-center gap-2"
        >
          <ChevronRight className="h-5 w-5 text-green" aria-hidden="true" />
          <span>{LL.READING_NEXT_GROUP()}</span>
        </button>
      )}
      <button
        type="button"
        aria-label={LL.READING_DONE()}
        onClick={onDone}
        className="min-h-[56px] px-4 rounded-small bg-white border border-sand-dark hover:bg-sand-light active:scale-95 transition-transform flex items-center gap-2"
      >
        <Check className="h-5 w-5 text-green" aria-hidden="true" />
        <span>{LL.READING_DONE()}</span>
      </button>
    </div>
  );
}
