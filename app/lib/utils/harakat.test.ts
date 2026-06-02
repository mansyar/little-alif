import { describe, expect, it } from 'vitest';
import { composeLetter, VOWEL_MODES, HARAKAT_COMBINING, NON_CONNECTING } from './harakat';

describe('HARAKAT_COMBINING', () => {
  it('defines Unicode diacritics for all 3 vowel modes', () => {
    expect(HARAKAT_COMBINING).toEqual({
      fathah: '\u064E',
      kasrah: '\u0650',
      dammah: '\u064F',
    });
  });
});

describe('VOWEL_MODES', () => {
  it('exports the 4 vowel modes in order', () => {
    expect(VOWEL_MODES).toEqual(['none', 'fathah', 'kasrah', 'dammah']);
  });
});

describe('NON_CONNECTING', () => {
  it('contains the 7 non-connecting letters', () => {
    expect(NON_CONNECTING).toEqual({
      '\u0627': { fathah: '\u0627\u064E', kasrah: '\u0627\u0650', dammah: '\u0627\u064F' }, // ا
      '\u0648': { fathah: '\u0648\u064E', kasrah: '\u0648\u0650', dammah: '\u0648\u064F' }, // و
      '\u064A': { fathah: '\u064A\u064E', kasrah: '\u064A\u0650', dammah: '\u064A\u064F' }, // ي
      '\u0631': { fathah: '\u0631\u064E', kasrah: '\u0631\u0650', dammah: '\u0631\u064F' }, // ر
      '\u0632': { fathah: '\u0632\u064E', kasrah: '\u0632\u0650', dammah: '\u0632\u064F' }, // ز
      '\u062F': { fathah: '\u062F\u064E', kasrah: '\u062F\u0650', dammah: '\u062F\u064F' }, // د
      '\u0630': { fathah: '\u0630\u064E', kasrah: '\u0630\u0650', dammah: '\u0630\u064F' }, // ذ
    });
  });
});

describe('composeLetter', () => {
  it('returns the base character unchanged when harakat is "none"', () => {
    expect(composeLetter('\u0628', 'none')).toBe('\u0628'); // ب
  });

  it('applies fathah combining diacritic for connecting letters', () => {
    const result = composeLetter('\u0628', 'fathah'); // ب + فتحة
    expect(result).toBe('\u0628\u064E');
  });

  it('applies kasrah combining diacritic for connecting letters', () => {
    const result = composeLetter('\u062A', 'kasrah'); // ت + كسرة
    expect(result).toBe('\u062A\u0650');
  });

  it('applies dammah combining diacritic for connecting letters', () => {
    const result = composeLetter('\u062B', 'dammah'); // ث + ضمة
    expect(result).toBe('\u062B\u064F');
  });

  it('uses precomposed fallback for non-connecting letter ر with kasrah', () => {
    // Per AC-2: composeLetter('ر', 'kasrah') returns 'رِ'
    const result = composeLetter('\u0631', 'kasrah'); // ر + كسرة
    expect(result).toBe('\u0631\u0650');
  });

  it('uses precomposed fallback for non-connecting letter ر with fathah', () => {
    const result = composeLetter('\u0631', 'fathah'); // ر + فتحة
    expect(result).toBe('\u0631\u064E');
  });

  it('uses precomposed fallback for non-connecting letter ر with dammah', () => {
    const result = composeLetter('\u0631', 'dammah'); // ر + ضمة
    expect(result).toBe('\u0631\u064F');
  });

  it('handles all 7 non-connecting letters with all 3 harakat modes', () => {
    const nonConnectingChars = [
      '\u0627', // ا (alif)
      '\u0648', // و (waw)
      '\u064A', // ي (ya)
      '\u0631', // ر (ra)
      '\u0632', // ز (zai)
      '\u062F', // د (dal)
      '\u0630', // ذ (dzal)
    ];

    for (const char of nonConnectingChars) {
      for (const mode of ['fathah', 'kasrah', 'dammah'] as const) {
        const result = composeLetter(char, mode);
        // Result should be longer than the base char (diacritic appended)
        expect(result.length).toBeGreaterThanOrEqual(char.length);
        // Result should not be identical to the unmodified char
        expect(result).not.toBe(char);
      }
    }
  });

  it('applies no special treatment for Alif (ا) — DD-1', () => {
    // Alif is treated the same as other non-connecting letters
    const result = composeLetter('\u0627', 'fathah');
    expect(result).toBe('\u0627\u064E');
  });

  it('handles all 4 vowel modes without throwing', () => {
    for (const mode of VOWEL_MODES) {
      expect(() => composeLetter('\u0628', mode)).not.toThrow();
    }
  });

  it('returns a plain string (no React element) — DD-6', () => {
    const result = composeLetter('\u0628', 'fathah');
    expect(typeof result).toBe('string');
  });
});
