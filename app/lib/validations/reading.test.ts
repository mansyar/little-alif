import { describe, expect, it } from 'vitest';
import { getReadingDataSchema } from './reading';

describe('getReadingDataSchema', () => {
  it('accepts a valid UUID profileId', () => {
    const result = getReadingDataSchema.safeParse({
      profileId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing profileId', () => {
    const result = getReadingDataSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID format', () => {
    const result = getReadingDataSchema.safeParse({ profileId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects non-string profileId', () => {
    const result = getReadingDataSchema.safeParse({ profileId: 123 });
    expect(result.success).toBe(false);
  });
});
