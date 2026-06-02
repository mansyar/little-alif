/**
 * Unicode combining diacritics for Arabic vowel marks (harakat).
 *
 * These characters are placed after the base letter and rendered as
 * combining marks above or below it by the font shaper.
 */
export const HARAKAT_COMBINING = {
  fathah: '\u064E',
  kasrah: '\u0650',
  dammah: '\u064F',
} as const;

/**
 * The 4 vowel modes supported by the app.
 */
export const VOWEL_MODES = ['none', 'fathah', 'kasrah', 'dammah'] as const;
export type VowelMode = (typeof VOWEL_MODES)[number];

/**
 * Precomposed fallback glyph strings for the 7 non-connecting letters.
 *
 * Non-connecting letters (ا, و, ي, ر, ز, د, ذ) do not join to the
 * following letter, which can cause rendering issues with combining
 * diacritics in some environments. These precomposed strings use the
 * combining diacritic directly appended to the base letter as a
 * reliable fallback.
 *
 * DD-2: ز (zai) is included alongside ر (ra), د (dal), ذ (dzal).
 * DD-1: Alif (ا) gets no special treatment despite being a pure vowel.
 */
export const NON_CONNECTING: Record<string, { fathah: string; kasrah: string; dammah: string }> = {
  // ا (alif)
  '\u0627': {
    fathah: '\u0627\u064E',
    kasrah: '\u0627\u0650',
    dammah: '\u0627\u064F',
  },
  // و (waw)
  '\u0648': {
    fathah: '\u0648\u064E',
    kasrah: '\u0648\u0650',
    dammah: '\u0648\u064F',
  },
  // ي (ya)
  '\u064A': {
    fathah: '\u064A\u064E',
    kasrah: '\u064A\u0650',
    dammah: '\u064A\u064F',
  },
  // ر (ra)
  '\u0631': {
    fathah: '\u0631\u064E',
    kasrah: '\u0631\u0650',
    dammah: '\u0631\u064F',
  },
  // ز (zai) — DD-2
  '\u0632': {
    fathah: '\u0632\u064E',
    kasrah: '\u0632\u0650',
    dammah: '\u0632\u064F',
  },
  // د (dal)
  '\u062F': {
    fathah: '\u062F\u064E',
    kasrah: '\u062F\u0650',
    dammah: '\u062F\u064F',
  },
  // ذ (dzal)
  '\u0630': {
    fathah: '\u0630\u064E',
    kasrah: '\u0630\u0650',
    dammah: '\u0630\u064F',
  },
};

/**
 * Compose a base Arabic letter with a vowel mark (harakat).
 *
 * Returns a Unicode string with the combining diacritic appended.
 * For non-connecting letters, uses precomposed fallback strings.
 *
 * DD-6: This is a pure function returning a string, not a React component.
 *
 * @param baseChar - The base Arabic letter (e.g., 'ب', 'ر')
 * @param harakat - The vowel mode to apply
 * @returns The composed letter string with the vowel mark
 */
export function composeLetter(baseChar: string, harakat: VowelMode): string {
  if (harakat === 'none') {
    return baseChar;
  }

  // Use precomposed fallback for non-connecting letters
  const fallback = NON_CONNECTING[baseChar];
  if (fallback) {
    return fallback[harakat];
  }

  // For connecting letters, append the combining diacritic
  const diacritic = HARAKAT_COMBINING[harakat];
  return baseChar + diacritic;
}
