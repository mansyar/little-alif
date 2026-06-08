import { useCallback, useRef } from 'react';
import { composeLetter } from '~/lib/utils/harakat';
import type { VowelMode } from '~/lib/utils/harakat';
import type { ReadingGroup } from '~/lib/utils/reading';
import { audioEngine } from '~/lib/audio/audio-engine';

interface GroupHeaderProps {
  group: ReadingGroup;
  vowelMode: VowelMode;
  letterChars: Record<string, string>;
}

export function GroupHeader({ group, vowelMode, letterChars }: GroupHeaderProps) {
  const chars = group.label.split(' ');
  const sequenceRef = useRef(0);

  const handleClick = useCallback(() => {
    // Cancel any in-progress audio
    audioEngine.cancel();

    // Increment sequence ID so stale timeouts from a previous
    // tap are ignored (handles rapid retaps).
    const seqId = ++sequenceRef.current;
    const currentLetters = group.letters;
    const currentChars = letterChars;

    // Play each letter with 300ms gap
    currentLetters.forEach((letterId, index) => {
      const char = currentChars[letterId];
      if (!char) return;

      setTimeout(() => {
        if (sequenceRef.current !== seqId) return;
        void audioEngine.speak(letterId, 'none', char);
      }, index * 300);
    });
  }, [group.letters, letterChars]);

  return (
    <button
      type="button"
      aria-label="Tap to hear letter names"
      className="flex flex-col items-center gap-6 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-center gap-6" aria-label={`Current group: ${group.label}`}>
        {chars.map((char, index) => (
          <span key={index} aria-hidden="true" className="font-arabic text-5xl text-text-dark">
            {composeLetter(char, vowelMode)}
          </span>
        ))}
      </div>
      {!group.isComplete && (
        <span className="text-sm text-gray-500 mt-2">({group.letters.length}/3)</span>
      )}
    </button>
  );
}
