import { describe, expect, it } from 'vitest';
import { createProfileSchema, updateProfileSchema, deleteProfileSchema } from './profiles';

describe('createProfileSchema', () => {
  it('accepts a valid name and avatar', () => {
    const result = createProfileSchema.safeParse({
      name: 'Aisyah',
      avatar: 'ba-boat',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing name', () => {
    const result = createProfileSchema.safeParse({ avatar: 'ba-boat' });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = createProfileSchema.safeParse({ name: '', avatar: 'ba-boat' });
    expect(result.success).toBe(false);
  });

  it('rejects name over 50 characters', () => {
    const result = createProfileSchema.safeParse({
      name: 'A'.repeat(51),
      avatar: 'ba-boat',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing avatar', () => {
    const result = createProfileSchema.safeParse({ name: 'Aisyah' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid avatar key', () => {
    const result = createProfileSchema.safeParse({
      name: 'Aisyah',
      avatar: 'unicorn-star',
    });
    expect(result.success).toBe(false);
  });

  it('accepts all 8 valid avatar keys', () => {
    const keys = [
      'alif-lamp',
      'ba-boat',
      'ta-table',
      'tsa-butterfly',
      'jim-mountain',
      'ha-jar',
      'kho-hat',
      'dal-book',
    ] as const;
    for (const avatar of keys) {
      const result = createProfileSchema.safeParse({ name: 'Test', avatar });
      expect(result.success).toBe(true);
    }
  });
});

describe('updateProfileSchema', () => {
  const uuid = '550e8400-e29b-41d4-a716-446655440000';

  it('accepts a valid profileId with optional fields', () => {
    const result = updateProfileSchema.safeParse({
      profileId: uuid,
      name: 'Updated Name',
      avatar: 'dal-book',
    });
    expect(result.success).toBe(true);
  });

  it('accepts only profileId (no updates)', () => {
    const result = updateProfileSchema.safeParse({ profileId: uuid });
    expect(result.success).toBe(true);
  });

  it('rejects missing profileId', () => {
    const result = updateProfileSchema.safeParse({ name: 'Test' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid profileId format', () => {
    const result = updateProfileSchema.safeParse({
      profileId: 'not-a-uuid',
      name: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid avatar key in update', () => {
    const result = updateProfileSchema.safeParse({
      profileId: uuid,
      avatar: 'invalid-key',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid vowelMode values', () => {
    for (const mode of ['none', 'fathah', 'kasrah', 'dammah'] as const) {
      const result = updateProfileSchema.safeParse({ profileId: uuid, vowelMode: mode });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid vowelMode', () => {
    const result = updateProfileSchema.safeParse({
      profileId: uuid,
      vowelMode: 'tanwin',
    });
    expect(result.success).toBe(false);
  });
});

describe('deleteProfileSchema', () => {
  it('accepts a valid profileId', () => {
    const result = deleteProfileSchema.safeParse({
      profileId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing profileId', () => {
    const result = deleteProfileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID format', () => {
    const result = deleteProfileSchema.safeParse({ profileId: 'abc' });
    expect(result.success).toBe(false);
  });
});
