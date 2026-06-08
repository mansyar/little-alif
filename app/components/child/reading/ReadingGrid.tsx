import { useMemo, useState, useCallback } from 'react';
import { useUiStore } from '~/stores/ui-store';
import { composeLetter, type VowelMode } from '~/lib/utils/harakat';
import { fisherYatesShuffle, type ReadingGroup } from '~/lib/utils/reading';
import { ReadingCell } from './ReadingCell';

interface CellData {
  glyph: string;
  letterId: string;
  letterChar: string;
  vowelMode: VowelMode;
}

interface ReadingGridProps {
  group: ReadingGroup;
  letterChars: Record<string, string>;
  randomHarakats?: VowelMode[][] | null;
}

export function ReadingGrid({ group, letterChars, randomHarakats }: ReadingGridProps) {
  const currentHarakat = useUiStore((state) => state.currentHarakat);
  // Track tapped cells per row. Resets naturally on remount (key prop in route
  // forces remount on group/shuffle change).
  // A "completed row" = all cells in that row have been tapped at least once.
  const [tappedCells, setTappedCells] = useState<Set<string>>(new Set());

  const handleCellTap = useCallback((rowIndex: number, cellIndex: number) => {
    setTappedCells((prev) => {
      const next = new Set(prev);
      next.add(`${rowIndex}-${cellIndex}`);
      return next;
    });
  }, []);

  const rows = useMemo(() => {
    if (randomHarakats) {
      // Per-cell random harakat mode — each row independently has random vowels
      return randomHarakats.map((rowHarakats, rowIndex) => {
        const cells = group.letters
          .map((letterId, ci) => {
            const char = letterChars[letterId];
            if (!char) return null;
            const harakat = rowHarakats[ci] ?? currentHarakat;
            return {
              glyph: composeLetter(char, harakat),
              letterId,
              letterChar: char,
              vowelMode: harakat,
            };
          })
          .filter(Boolean) as CellData[];
        return {
          type: rowIndex === 0 ? 'systematic' : 'mixed',
          cells: rowIndex === 0 ? cells : fisherYatesShuffle([...cells]),
        };
      });
    }

    // Normal mode: build cells with the current harakat applied uniformly
    const allCombos: CellData[] = [];
    for (const letterId of group.letters) {
      const char = letterChars[letterId];
      if (!char) continue;
      allCombos.push({
        glyph: composeLetter(char, currentHarakat),
        letterId,
        letterChar: char,
        vowelMode: currentHarakat,
      });
    }

    return [
      { type: 'systematic' as const, cells: [...allCombos] },
      { type: 'mixed' as const, cells: fisherYatesShuffle([...allCombos]) },
      { type: 'mixed' as const, cells: fisherYatesShuffle([...allCombos]) },
      { type: 'mixed' as const, cells: fisherYatesShuffle([...allCombos]) },
      { type: 'mixed' as const, cells: fisherYatesShuffle([...allCombos]) },
      { type: 'mixed' as const, cells: fisherYatesShuffle([...allCombos]) },
    ];
  }, [group, letterChars, currentHarakat, randomHarakats]);

  return (
    <div role="grid" aria-rowcount={6} className="flex flex-col gap-2">
      {rows.map((row, rowIndex) => {
        const cellsInRow = row.cells.length;
        const tappedCount = row.cells.filter((_, ci) =>
          tappedCells.has(`${rowIndex}-${ci}`),
        ).length;
        const isComplete = tappedCount === cellsInRow;

        return (
          <div
            key={rowIndex}
            className={`rounded-large p-2 transition-colors duration-300 ${
              isComplete ? 'border-2 border-green bg-green-light/10' : ''
            }`}
            aria-label={
              isComplete
                ? `Row ${rowIndex + 1}: complete`
                : `Row ${rowIndex + 1}: ${tappedCount} of ${cellsInRow} tapped`
            }
          >
            <div className="flex items-center gap-2">
              <div role="row" className="flex flex-1 flex-wrap gap-2" aria-rowindex={rowIndex + 1}>
                {row.cells.map((cell, cellIndex) => (
                  <ReadingCell
                    key={`${rowIndex}-${cellIndex}`}
                    glyph={cell.glyph}
                    letterId={cell.letterId}
                    vowelMode={cell.vowelMode}
                    letterChar={cell.letterChar}
                    isSystematicRow={rowIndex === 0}
                    onTap={() => handleCellTap(rowIndex, cellIndex)}
                  />
                ))}
              </div>
              {isComplete && (
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green text-white text-lg select-none"
                  aria-hidden="true"
                >
                  ✓
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
