import { describe, it, expect } from 'vitest';
import { SEED_LETTERS } from './seed-data';

describe('SEED_LETTERS', () => {
  it('contains exactly 28 letters', () => {
    expect(SEED_LETTERS).toHaveLength(28);
  });

  it('has unique IDs', () => {
    const ids = SEED_LETTERS.map((l) => l.id);
    expect(new Set(ids).size).toBe(28);
  });

  it('has unique displayOrder values from 1 to 28', () => {
    const orders = SEED_LETTERS.map((l) => l.displayOrder).sort((a, b) => a - b);
    expect(orders).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
  });

  it('first letter is alif (ا) with displayOrder 1', () => {
    const alif = SEED_LETTERS.find((l) => l.id === 'alif');
    expect(alif).toBeDefined();
    expect(alif?.character).toBe('ا');
    expect(alif?.displayOrder).toBe(1);
  });

  it('last letter is ya (ي) with displayOrder 28', () => {
    const ya = SEED_LETTERS.find((l) => l.id === 'ya');
    expect(ya).toBeDefined();
    expect(ya?.character).toBe('ي');
    expect(ya?.displayOrder).toBe(28);
  });

  it('every letter has audioFiles for none, fathah, kasrah, dammah modes', () => {
    for (const letter of SEED_LETTERS) {
      expect(Object.keys(letter.audioFiles).sort()).toEqual(['dammah', 'fathah', 'kasrah', 'none']);
    }
  });

  it('audioFiles use the documented {letterId}_{vowelMode}.mp3 pattern', () => {
    for (const letter of SEED_LETTERS) {
      expect(letter.audioFiles.none).toBe(`${letter.id}.mp3`);
      expect(letter.audioFiles.fathah).toBe(`${letter.id}_fathah.mp3`);
      expect(letter.audioFiles.kasrah).toBe(`${letter.id}_kasrah.mp3`);
      expect(letter.audioFiles.dammah).toBe(`${letter.id}_dammah.mp3`);
    }
  });

  it('includes the canonical Hijaiyah order (alif → ya)', () => {
    const ordered = [...SEED_LETTERS].sort((a, b) => a.displayOrder - b.displayOrder);
    // Note: ha = ح (ḥāʼ), hae = ه (soft hāʼ) per docs/tdd.md §6
    const expectedIds = [
      'alif',
      'ba',
      'ta',
      'tsa',
      'jim',
      'ha',
      'kho',
      'dal',
      'dzal',
      'ra',
      'zai',
      'sin',
      'syin',
      'shad',
      'dhad',
      'tha',
      'dzha',
      'ain',
      'ghain',
      'fa',
      'qaf',
      'kaf',
      'lam',
      'mim',
      'nun',
      'waw',
      'hae',
      'ya',
    ];
    expect(ordered.map((l) => l.id)).toEqual(expectedIds);
  });
});
