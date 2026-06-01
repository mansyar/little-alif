import { describe, it, expect } from 'vitest';
import {
  profiles,
  letters,
  letterToggles,
  LETTER_IDS,
  VOWEL_MODES,
  AVATAR_KEYS,
} from './schema';

const DRIZZLE_NAME = Symbol.for('drizzle:Name');
const DRIZZLE_COLUMNS = Symbol.for('drizzle:Columns');

function tableName(t: unknown): string {
  return (t as Record<symbol, string>)[DRIZZLE_NAME]!;
}

function tableColumns(t: unknown): string[] {
  const cols = (t as Record<symbol, Record<string, unknown>>)[DRIZZLE_COLUMNS]!;
  return Object.keys(cols);
}

describe('schema tables', () => {
  it('exposes profiles, letters, letter_toggles with expected names', () => {
    expect(tableName(profiles)).toBe('profiles');
    expect(tableName(letters)).toBe('letters');
    expect(tableName(letterToggles)).toBe('letter_toggles');
  });

  it('profiles has id, userId, name, avatar, vowelMode, createdAt, updatedAt', () => {
    expect(tableColumns(profiles).sort()).toEqual(
      ['avatar', 'createdAt', 'id', 'name', 'updatedAt', 'userId', 'vowelMode'].sort(),
    );
  });

  it('letters has id, character, displayOrder, audioFiles', () => {
    expect(tableColumns(letters).sort()).toEqual(
      ['audioFiles', 'character', 'displayOrder', 'id'].sort(),
    );
  });

  it('letter_toggles has id, profileId, letterId, isVisible, toggledAt', () => {
    expect(tableColumns(letterToggles).sort()).toEqual(
      ['id', 'isVisible', 'letterId', 'profileId', 'toggledAt'].sort(),
    );
  });
});

describe('schema enums', () => {
  it('LETTER_IDS has 28 unique Hijaiyah IDs in canonical order', () => {
    expect(LETTER_IDS).toHaveLength(28);
    expect(new Set(LETTER_IDS).size).toBe(28);
    expect(LETTER_IDS[0]).toBe('alif');
    expect(LETTER_IDS[27]).toBe('ya');
  });

  it('VOWEL_MODES is the 4 expected modes', () => {
    expect([...VOWEL_MODES].sort()).toEqual(['dammah', 'fathah', 'kasrah', 'none']);
  });

  it('AVATAR_KEYS has 8 themed avatars', () => {
    expect(AVATAR_KEYS).toHaveLength(8);
    expect(AVATAR_KEYS).toContain('alif-lamp');
    expect(AVATAR_KEYS).toContain('dal-book');
  });
});
