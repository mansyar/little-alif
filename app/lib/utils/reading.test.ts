import { describe, expect, it } from 'vitest';
import {
  generateReadingGroups,
  generatePracticeRow,
  generatePracticeGrid,
  type ReadingGroup,
  type PracticeRow,
} from './reading';

// --- Helper mocks for composeFn and getCharById ---

const CHAR_MAP: Record<string, string> = {
  alif: '\u0627', // ا
  ba: '\u0628', // ب
  ta: '\u062A', // ت
  tsa: '\u062B', // ث
  jim: '\u062C', // ج
  ha: '\u062D', // ح
  kho: '\u062E', // خ
  ra: '\u0631', // ر
  zai: '\u0632', // ز
};

/** Mock compose function: appends a suffix for the vowel mode */
function mockCompose(char: string, vowel: string): string {
  if (vowel === 'none') return char;
  return `${char}_${vowel}`;
}

/** Mock compose that uses real-ish logic for a non-connecting letter test */
function realCompose(char: string, vowel: string): string {
  if (vowel === 'none') return char;
  if (char === '\u0631' && vowel === 'kasrah') return '\u0631\u0650';
  return `${char}_${vowel}`;
}

function getCharById(id: string): string {
  return CHAR_MAP[id] ?? '';
}

/** Helper to assert ReadingGroup array at a given index. */
function groupAt(groups: ReadingGroup[], index: number): ReadingGroup {
  const g = groups[index];
  if (!g) throw new Error(`Expected group at index ${index}`);
  return g;
}

/** Helper to assert PracticeRow array at a given index. */
function rowAt(grid: PracticeRow[], index: number): PracticeRow {
  const r = grid[index];
  if (!r) throw new Error(`Expected row at index ${index}`);
  return r;
}

/** Helper to assert string array at a given index. */
function cellAt(cells: string[], index: number): string {
  const c = cells[index];
  if (c === undefined) throw new Error(`Expected cell at index ${index}`);
  return c;
}

// =========================================================================
// generateReadingGroups
// =========================================================================

describe('generateReadingGroups', () => {
  it('returns [] when given an empty array', () => {
    expect(generateReadingGroups([])).toEqual([]);
  });

  it('returns [] when given fewer than 3 letters', () => {
    expect(generateReadingGroups(['alif', 'ba'])).toEqual([]);
  });

  it('returns 1 complete group for exactly 3 letters', () => {
    const groups = generateReadingGroups(['alif', 'ba', 'ta'], getCharById);
    expect(groups).toHaveLength(1);
    expect(groupAt(groups, 0).letters).toEqual(['alif', 'ba', 'ta']);
    expect(groupAt(groups, 0).isComplete).toBe(true);
    expect(groupAt(groups, 0).label).toBe('\u0627 \u0628 \u062A');
  });

  it('returns 2 groups for 4 letters: first complete, second incomplete (1 letter)', () => {
    const groups = generateReadingGroups(['alif', 'ba', 'ta', 'tsa'], getCharById);
    expect(groups).toHaveLength(2);
    expect(groupAt(groups, 0).letters).toEqual(['alif', 'ba', 'ta']);
    expect(groupAt(groups, 0).isComplete).toBe(true);
    expect(groupAt(groups, 1).letters).toEqual(['tsa']);
    expect(groupAt(groups, 1).isComplete).toBe(false);
    expect(groupAt(groups, 1).label).toBe('\u062B');
  });

  it('returns 2 groups for 5 letters: first complete (3), second incomplete (2)', () => {
    const groups = generateReadingGroups(['alif', 'ba', 'ta', 'tsa', 'jim'], getCharById);
    expect(groups).toHaveLength(2);
    expect(groupAt(groups, 0).letters).toEqual(['alif', 'ba', 'ta']);
    expect(groupAt(groups, 0).isComplete).toBe(true);
    expect(groupAt(groups, 0).label).toBe('\u0627 \u0628 \u062A');
    expect(groupAt(groups, 1).letters).toEqual(['tsa', 'jim']);
    expect(groupAt(groups, 1).isComplete).toBe(false);
    expect(groupAt(groups, 1).label).toBe('\u062B \u062C');
  });

  it('returns 2 complete groups for exactly 6 letters', () => {
    const groups = generateReadingGroups(['alif', 'ba', 'ta', 'tsa', 'jim', 'ha'], getCharById);
    expect(groups).toHaveLength(2);
    expect(groupAt(groups, 0).letters).toEqual(['alif', 'ba', 'ta']);
    expect(groupAt(groups, 0).isComplete).toBe(true);
    expect(groupAt(groups, 1).letters).toEqual(['tsa', 'jim', 'ha']);
    expect(groupAt(groups, 1).isComplete).toBe(true);
  });

  it('returns 3 groups for 7 letters: 3, 3, 1', () => {
    const groups = generateReadingGroups(
      ['alif', 'ba', 'ta', 'tsa', 'jim', 'ha', 'kho'],
      getCharById,
    );
    expect(groups).toHaveLength(3);
    expect(groupAt(groups, 0).letters).toEqual(['alif', 'ba', 'ta']);
    expect(groupAt(groups, 0).isComplete).toBe(true);
    expect(groupAt(groups, 1).letters).toEqual(['tsa', 'jim', 'ha']);
    expect(groupAt(groups, 1).isComplete).toBe(true);
    expect(groupAt(groups, 2).letters).toEqual(['kho']);
    expect(groupAt(groups, 2).isComplete).toBe(false);
  });

  it('emits groups in the same order as the input letters', () => {
    const groups = generateReadingGroups(
      ['jim', 'ha', 'kho', 'dal', 'dzal', 'ra', 'zai'],
      getCharById,
    );
    expect(groupAt(groups, 0).letters).toEqual(['jim', 'ha', 'kho']);
    expect(groupAt(groups, 1).letters).toEqual(['dal', 'dzal', 'ra']);
    expect(groupAt(groups, 2).letters).toEqual(['zai']);
  });

  it('assigns incrementing numeric ids starting from 1', () => {
    const groups = generateReadingGroups(['alif', 'ba', 'ta', 'tsa', 'jim', 'ha'], getCharById);
    expect(groupAt(groups, 0).id).toBe(1);
    expect(groupAt(groups, 1).id).toBe(2);
  });

  it('uses first resolved character as fallback when resolver returns undefined', () => {
    // Resolver returns undefined for 'ba' — fallback should use 'ا' (from 'alif')
    // Current bug: join converts undefined to empty string, producing "ا   ا" (double space)
    const groups = generateReadingGroups(['alif', 'ba', 'ta'], (id) =>
      id === 'ba' ? undefined : 'ا',
    );
    expect(groups).toHaveLength(1);
    // All three positions should resolve to Arabic characters, no gaps
    expect(groups[0]!.label).toBe('\u0627 \u0627 \u0627');
  });
});

// =========================================================================
// generatePracticeRow (systematic)
// =========================================================================

describe('generatePracticeRow (systematic)', () => {
  const letterChars = ['alif', 'ba', 'ta'];

  it('returns 9 cells for 3 letters in systematic order', () => {
    const cells = generatePracticeRow(letterChars, 'systematic', mockCompose, getCharById);
    expect(cells).toHaveLength(9);
    // For each letter in order: fathah, kasrah, dammah
    expect(cellAt(cells, 0)).toBe('\u0627_fathah');
    expect(cellAt(cells, 1)).toBe('\u0627_kasrah');
    expect(cellAt(cells, 2)).toBe('\u0627_dammah');
    expect(cellAt(cells, 3)).toBe('\u0628_fathah');
    expect(cellAt(cells, 4)).toBe('\u0628_kasrah');
    expect(cellAt(cells, 5)).toBe('\u0628_dammah');
    expect(cellAt(cells, 6)).toBe('\u062A_fathah');
    expect(cellAt(cells, 7)).toBe('\u062A_kasrah');
    expect(cellAt(cells, 8)).toBe('\u062A_dammah');
  });

  it('returns 3 cells for a single letter', () => {
    const cells = generatePracticeRow(['ba'], 'systematic', mockCompose, getCharById);
    expect(cells).toHaveLength(3);
    expect(cellAt(cells, 0)).toBe('\u0628_fathah');
    expect(cellAt(cells, 1)).toBe('\u0628_kasrah');
    expect(cellAt(cells, 2)).toBe('\u0628_dammah');
  });

  it('returns 6 cells for 2 letters', () => {
    const cells = generatePracticeRow(['alif', 'ba'], 'systematic', mockCompose, getCharById);
    expect(cells).toHaveLength(6);
    expect(cellAt(cells, 0)).toBe('\u0627_fathah');
    expect(cellAt(cells, 3)).toBe('\u0628_fathah');
  });

  it('uses real composeLetter for non-connecting letter ر with kasrah', () => {
    const cells = generatePracticeRow(['ra'], 'systematic', realCompose, getCharById);
    expect(cells).toHaveLength(3);
    // ر with kasrah should be the precomposed glyph رِ
    expect(cellAt(cells, 1)).toBe('\u0631\u0650');
  });
});

// =========================================================================
// generatePracticeRow (mixed — shuffled)
// =========================================================================

describe('generatePracticeRow (mixed)', () => {
  const letterChars = ['alif', 'ba', 'ta'];

  it('returns 9 cells for 3 letters', () => {
    const cells = generatePracticeRow(letterChars, 'mixed', mockCompose, getCharById);
    expect(cells).toHaveLength(9);
  });

  it('returns cells with the same set of composed strings as the systematic row', () => {
    const systematic = generatePracticeRow(letterChars, 'systematic', mockCompose, getCharById);
    const mixed = generatePracticeRow(letterChars, 'mixed', mockCompose, getCharById);
    expect(mixed).toHaveLength(systematic.length);
    expect(mixed.sort()).toEqual(systematic.sort());
  });

  it('returns 6 cells for 2 letters', () => {
    const cells = generatePracticeRow(['alif', 'ba'], 'mixed', mockCompose, getCharById);
    expect(cells).toHaveLength(6);
  });

  it('returns 3 cells for 1 letter', () => {
    const cells = generatePracticeRow(['ba'], 'mixed', mockCompose, getCharById);
    expect(cells).toHaveLength(3);
  });

  it('produces different order across consecutive calls (shuffle randomness)', () => {
    // Run many times to assert that at least sometimes the order differs
    // (Fisher–Yates with Math.random should nearly always produce different orders)
    const results = Array.from({ length: 20 }, () =>
      generatePracticeRow(letterChars, 'mixed', mockCompose, getCharById),
    );
    const firstStr = results[0]?.join(',') ?? '';
    const allSame = results.every((r) => r.join(',') === firstStr);
    expect(allSame).toBe(false);
  });
});

// =========================================================================
// generatePracticeGrid
// =========================================================================

describe('generatePracticeGrid', () => {
  const letterChars = ['alif', 'ba', 'ta'];

  it('returns 6 rows', () => {
    const grid = generatePracticeGrid(letterChars, mockCompose, getCharById);
    expect(grid).toHaveLength(6);
  });

  it('row 0 is systematic with 9 cells', () => {
    const grid = generatePracticeGrid(letterChars, mockCompose, getCharById);
    expect(rowAt(grid, 0).type).toBe('systematic');
    expect(rowAt(grid, 0).cells).toHaveLength(9);
  });

  it('rows 1–5 are all mixed', () => {
    const grid = generatePracticeGrid(letterChars, mockCompose, getCharById);
    for (let i = 1; i < 6; i++) {
      expect(rowAt(grid, i).type).toBe('mixed');
    }
  });

  it('each mixed row has the same set of 9 cells as the systematic row', () => {
    const grid = generatePracticeGrid(letterChars, mockCompose, getCharById);
    const systematicCells = [...rowAt(grid, 0).cells].sort();
    for (let i = 1; i < 6; i++) {
      expect([...rowAt(grid, i).cells].sort()).toEqual(systematicCells);
    }
  });

  it('each mixed row has 9 cells', () => {
    const grid = generatePracticeGrid(letterChars, mockCompose, getCharById);
    for (let i = 1; i < 6; i++) {
      expect(rowAt(grid, i).cells).toHaveLength(9);
    }
  });

  it('works with a single letter (3 cells per row)', () => {
    const grid = generatePracticeGrid(['alif'], mockCompose, getCharById);
    expect(grid).toHaveLength(6);
    expect(rowAt(grid, 0).cells).toHaveLength(3);
    for (let i = 1; i < 6; i++) {
      expect(rowAt(grid, i).cells).toHaveLength(3);
    }
  });

  it('handles missing getCharById (empty string returned) gracefully', () => {
    const grid = generatePracticeGrid(['unknown'], mockCompose, getCharById);
    expect(rowAt(grid, 0).cells).toHaveLength(3);
    // The cells should still be strings (not undefined)
    grid.forEach((row) => {
      row.cells.forEach((cell) => {
        expect(typeof cell).toBe('string');
      });
    });
  });
});
