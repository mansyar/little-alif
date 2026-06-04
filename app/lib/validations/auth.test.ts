import { describe, expect, it } from 'vitest';
import { enableChildModeSchema, loginSchema, registerSchema } from './auth';

describe('registerSchema', () => {
  it('accepts a valid email and password', () => {
    const result = registerSchema.safeParse({
      email: 'parent@example.com',
      password: 'correct-horse-battery-staple',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = registerSchema.safeParse({ password: 'longenough123' });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = registerSchema.safeParse({ email: 'a@b.co' });
    expect(result.success).toBe(false);
  });

  it('rejects malformed email', () => {
    const result = registerSchema.safeParse({
      email: 'not-an-email',
      password: 'longenough123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      email: 'parent@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('enableChildModeSchema', () => {
  it('accepts a valid profileId, name, and avatar', () => {
    const result = enableChildModeSchema.safeParse({
      profileId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Aisyah',
      avatar: 'ba-boat',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing profileId', () => {
    const result = enableChildModeSchema.safeParse({
      name: 'Aisyah',
      avatar: 'ba-boat',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID profileId', () => {
    const result = enableChildModeSchema.safeParse({
      profileId: 'not-a-uuid',
      name: 'Aisyah',
      avatar: 'ba-boat',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = enableChildModeSchema.safeParse({
      profileId: '550e8400-e29b-41d4-a716-446655440000',
      avatar: 'ba-boat',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = enableChildModeSchema.safeParse({
      profileId: '550e8400-e29b-41d4-a716-446655440000',
      name: '',
      avatar: 'ba-boat',
    });
    expect(result.success).toBe(false);
  });

  it('rejects name over 50 characters', () => {
    const result = enableChildModeSchema.safeParse({
      profileId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'A'.repeat(51),
      avatar: 'ba-boat',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid avatar key', () => {
    const result = enableChildModeSchema.safeParse({
      profileId: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Aisyah',
      avatar: 'invalid-avatar',
    });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({
      email: 'parent@example.com',
      password: 'any-password',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({ password: 'whatever' });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({ email: 'a@b.co' });
    expect(result.success).toBe(false);
  });
});
