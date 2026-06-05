import { describe, expect, it } from 'vitest';
import { LETTER_IDS, LETTER_BG_COLORS } from './letters';

describe('LETTER_IDS', () => {
  it('contains exactly 28 letter IDs', () => {
    expect(LETTER_IDS).toHaveLength(28);
  });

  it('contains unique values', () => {
    expect(new Set(LETTER_IDS).size).toBe(28);
  });

  it('starts with alif and ends with ya', () => {
    expect(LETTER_IDS[0]).toBe('alif');
    expect(LETTER_IDS[LETTER_IDS.length - 1]).toBe('ya');
  });

  it('includes ha and hae as distinct entries', () => {
    expect(LETTER_IDS).toContain('ha');
    expect(LETTER_IDS).toContain('hae');
  });
});

describe('LETTER_BG_COLORS', () => {
  it('has an entry for every LETTER_IDS member', () => {
    for (const id of LETTER_IDS) {
      expect(LETTER_BG_COLORS).toHaveProperty(id);
    }
  });

  it('has exactly 28 entries', () => {
    expect(Object.keys(LETTER_BG_COLORS)).toHaveLength(28);
  });

  it('every entry is a Tailwind bg-* class string', () => {
    for (const bg of Object.values(LETTER_BG_COLORS)) {
      expect(bg).toMatch(/^bg-/);
    }
  });
});
