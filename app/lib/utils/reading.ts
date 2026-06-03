/**
 * Pure utility functions for the Reading Practice (Iqra' Mode) screen.
 *
 * These functions are intentionally side-effect-free: no React, no DOM, no I/O.
 * Each function is fully deterministic given its inputs, making them easy to
 * unit-test in isolation.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReadingGroup {
  id: number;
  letters: string[]; // 1–3 letter IDs
  label: string; // Arabic chars separated by spaces, e.g. 'ا ب ت'
  isComplete: boolean; // true when letters.length === 3
}

export interface PracticeRow {
  type: 'systematic' | 'mixed';
  cells: string[]; // precomposed glyphs
}

// ---------------------------------------------------------------------------
// Fisher–Yates shuffle (in-place)
// ---------------------------------------------------------------------------

export function fisherYatesShuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = tmp;
  }
  return copy;
}

// ---------------------------------------------------------------------------
// generateReadingGroups
// ---------------------------------------------------------------------------

/**
 * Slice visible letter IDs into groups of up to 3, preserving display order.
 *
 * @param visibleLetterIds - The list of toggled-ON letter IDs in display order.
 * @param getCharById - Optional callback to resolve a letter ID to its Arabic
 *   character for the `label` field. If omitted, the ID itself is used.
 * @returns An array of ReadingGroup chunks. Returns `[]` if fewer than 3 IDs.
 */
export function generateReadingGroups(
  visibleLetterIds: string[],
  getCharById?: (id: string) => string,
): ReadingGroup[] {
  if (visibleLetterIds.length < 3) return [];

  const resolve = getCharById ?? ((id: string) => id);
  const groups: ReadingGroup[] = [];

  for (let i = 0; i < visibleLetterIds.length; i += 3) {
    const chunk = visibleLetterIds.slice(i, i + 3);
    groups.push({
      id: groups.length + 1,
      letters: chunk,
      label: chunk.map(resolve).join(' '),
      isComplete: chunk.length === 3,
    });
  }

  return groups;
}

// ---------------------------------------------------------------------------
// generatePracticeRow
// ---------------------------------------------------------------------------

/**
 * Build a single practice row of precomposed glyphs.
 *
 * For a **systematic** row: for each letter in `groupLetters` order, compose
 * the letter with each vowel mode (fathah, kasrah, dammah) in order.
 *
 * For a **mixed** row: generate the same set of composed strings as the
 * systematic row, then Fisher–Yates shuffle them.
 *
 * @param groupLetters - The letter IDs in the current group (1–3 letters).
 * @param rowType - `'systematic'` for ordered, `'mixed'` for shuffled.
 * @param composeFn - A function `(char: string, vowel: string) => string`
 *   that composes a base character with a vowel mark (e.g. `composeLetter`).
 * @param getCharById - A function that resolves a letter ID to its Arabic
 *   base character.
 * @returns An array of precomposed glyph strings.
 */
export function generatePracticeRow(
  groupLetters: string[],
  rowType: 'systematic' | 'mixed',
  composeFn: (char: string, vowel: string) => string,
  getCharById: (id: string) => string,
): string[] {
  const vowels = ['fathah', 'kasrah', 'dammah'] as const;
  const cells: string[] = [];

  for (const letterId of groupLetters) {
    const char = getCharById(letterId);
    for (const vowel of vowels) {
      cells.push(composeFn(char, vowel));
    }
  }

  if (rowType === 'mixed') {
    return fisherYatesShuffle(cells);
  }

  return cells;
}

// ---------------------------------------------------------------------------
// generatePracticeGrid
// ---------------------------------------------------------------------------

/**
 * Build a 6-row practice grid for a single group.
 *
 * Row 0 is systematic (ordered); rows 1–5 are each independently shuffled
 * (mixed). This gives the child one reference row plus 5 rows of varied
 * practice.
 *
 * @param groupLetters - The letter IDs in the current group (1–3 letters).
 * @param composeFn - A function `(char: string, vowel: string) => string`.
 * @param getCharById - A function that resolves a letter ID to its Arabic
 *   base character.
 * @returns An array of 6 PracticeRow entries.
 */
export function generatePracticeGrid(
  groupLetters: string[],
  composeFn: (char: string, vowel: string) => string,
  getCharById: (id: string) => string,
): PracticeRow[] {
  const grid: PracticeRow[] = [];

  // Row 0: systematic
  grid.push({
    type: 'systematic',
    cells: generatePracticeRow(groupLetters, 'systematic', composeFn, getCharById),
  });

  // Rows 1–5: mixed (each independently shuffled)
  for (let i = 0; i < 5; i++) {
    grid.push({
      type: 'mixed',
      cells: generatePracticeRow(groupLetters, 'mixed', composeFn, getCharById),
    });
  }

  return grid;
}
