import { composeLetter } from '~/lib/utils/harakat';
import type { VowelMode } from '~/lib/utils/harakat';
import type { ReadingGroup } from '~/lib/utils/reading';

interface GroupHeaderProps {
  group: ReadingGroup;
  vowelMode: VowelMode;
}

export function GroupHeader({ group, vowelMode }: GroupHeaderProps) {
  const chars = group.label.split(' ');

  return (
    <div className="flex flex-col items-center gap-6" aria-label={`Current group: ${group.label}`}>
      <div className="flex items-center gap-6">
        {chars.map((char, index) => (
          <span key={index} aria-hidden="true" className="font-arabic text-5xl text-text-dark">
            {composeLetter(char, vowelMode)}
          </span>
        ))}
      </div>
      {!group.isComplete && (
        <span className="text-sm text-gray-500 mt-2">({group.letters.length}/3)</span>
      )}
    </div>
  );
}
