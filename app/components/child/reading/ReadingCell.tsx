import { useState, useCallback } from 'react';
import { audioEngine } from '~/lib/audio/audio-engine';
import type { VowelMode } from '~/lib/utils/harakat';

interface ReadingCellProps {
  glyph: string;
  letterId: string;
  vowelMode: VowelMode;
  letterChar: string;
  /** True for cells in the first (systematic) row — enables replay-pulse hint. */
  isSystematicRow?: boolean;
  /** Called when the cell is tapped (fires immediately, before audio completes). */
  onTap?: () => void;
}

type ReplayPhase = 'idle' | 'flashing' | 'replay';

export function ReadingCell({
  glyph,
  letterId,
  vowelMode,
  letterChar,
  isSystematicRow = false,
  onTap,
}: ReadingCellProps) {
  const [replayPhase, setReplayPhase] = useState<ReplayPhase>('idle');

  const handleClick = useCallback(() => {
    setReplayPhase('flashing');
    onTap?.();
    void audioEngine.speak(letterId, vowelMode, letterChar).finally(() => {
      setReplayPhase((prev) =>
        prev === 'flashing' ? (isSystematicRow ? 'replay' : 'idle') : prev,
      );
    });
  }, [letterId, vowelMode, letterChar, isSystematicRow, onTap]);

  const flashed = replayPhase === 'flashing';
  const showReplay = replayPhase === 'replay';

  return (
    <button
      type="button"
      data-flashed={flashed}
      data-replay={showReplay}
      aria-label={`${letterId} ${vowelMode}`}
      onClick={handleClick}
      className="flex aspect-square min-h-[56px] min-w-[56px] items-center justify-center rounded-small bg-sand-light text-3xl font-arabic data-[flashed=true]:bg-green-light transition-colors duration-200 data-[replay=true]:animate-pulseReplay"
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
}
