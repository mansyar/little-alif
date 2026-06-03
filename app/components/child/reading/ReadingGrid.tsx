import { useMemo } from 'react';
import { useUiStore } from '~/stores/ui-store';
import { composeLetter } from '~/lib/utils/harakat';
import { fisherYatesShuffle, type ReadingGroup } from '~/lib/utils/reading';
import { ReadingCell } from './ReadingCell';

interface CellData {
  glyph: string;
  letterId: string;
  letterChar: string;
}

interface ReadingGridProps {
  group: ReadingGroup;
  letterChars: Record<string, string>;
}

export function ReadingGrid({ group, letterChars }: ReadingGridProps) {
  const currentHarakat = useUiStore((state) => state.currentHarakat);

  const rows = useMemo(() => {
    const vowels = ['fathah', 'kasrah', 'dammah'] as const;

    // Build all letter × harakat combinations with metadata
    const allCombos: CellData[] = [];
    for (const letterId of group.letters) {
      const char = letterChars[letterId];
      if (!char) continue;
      for (const vowel of vowels) {
        allCombos.push({
          glyph: composeLetter(char, vowel),
          letterId,
          letterChar: char,
        });
      }
    }

    return [
      { type: 'systematic' as const, cells: [...allCombos] },
      { type: 'mixed' as const, cells: fisherYatesShuffle([...allCombos]) },
      { type: 'mixed' as const, cells: fisherYatesShuffle([...allCombos]) },
      { type: 'mixed' as const, cells: fisherYatesShuffle([...allCombos]) },
      { type: 'mixed' as const, cells: fisherYatesShuffle([...allCombos]) },
      { type: 'mixed' as const, cells: fisherYatesShuffle([...allCombos]) },
    ];
  }, [group, letterChars]);

  return (
    <div role="grid" aria-rowcount={6} className="flex flex-col gap-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex}>
          {rowIndex === 0 && (
            <div aria-hidden="true" className="text-sm text-gray-500 mb-1">
              Pattern
            </div>
          )}
          <div role="row" className="flex flex-wrap gap-2" aria-rowindex={rowIndex + 1}>
            {row.cells.map((cell, cellIndex) => (
              <ReadingCell
                key={`${rowIndex}-${cellIndex}`}
                glyph={cell.glyph}
                letterId={cell.letterId}
                vowelMode={currentHarakat}
                letterChar={cell.letterChar}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
