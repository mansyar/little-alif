import { useState } from 'react';
import { audioEngine } from '~/lib/audio/audio-engine';
import type { VowelMode } from '~/lib/utils/harakat';

interface ReadingCellProps {
  glyph: string;
  letterId: string;
  vowelMode: VowelMode;
  letterChar: string;
}

export function ReadingCell({ glyph, letterId, vowelMode, letterChar }: ReadingCellProps) {
  const [flashed, setFlashed] = useState(false);

  const handleClick = () => {
    setFlashed(true);
    void audioEngine.speak(letterId, vowelMode, letterChar).finally(() => {
      setFlashed(false);
    });
  };

  return (
    <button
      type="button"
      data-flashed={flashed}
      aria-label={`${letterId} ${vowelMode}`}
      onClick={handleClick}
      className="flex aspect-square min-h-[56px] min-w-[56px] items-center justify-center rounded-small bg-sand-light text-3xl font-arabic data-[flashed=true]:bg-green-light transition-colors duration-200"
    >
      <span aria-hidden="true">{glyph}</span>
    </button>
  );
}
