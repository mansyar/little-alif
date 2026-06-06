import { describe, expect, it, beforeEach } from 'vitest';
import {
  signChildModeCookie,
  verifyChildModeCookie,
  type ChildModePayload,
} from './child-mode.server';

// Set the secret before any imports run
const TEST_SECRET = 'test-secret-thirty-two-chars-long!!';

describe('signChildModeCookie', () => {
  beforeEach(() => {
    process.env.CHILD_MODE_SECRET = TEST_SECRET;
  });

  it('produces a string with a dot separator', () => {
    const result = signChildModeCookie('p1', 'Aisha', 'alif-lamp');
    expect(result).toContain('.');
  });

  it('produces a string where the first part is valid base64 JSON', () => {
    const result = signChildModeCookie('p1', 'Aisha', 'alif-lamp');
    const [payload] = result.split('.');
    const decoded = JSON.parse(
      Buffer.from(payload!, 'base64url').toString('utf-8'),
    ) as ChildModePayload;
    expect(decoded).toEqual({ profileId: 'p1', name: 'Aisha', avatar: 'alif-lamp' });
  });

  it('produces different signatures for different payloads', () => {
    const a = signChildModeCookie('p1', 'Aisha', 'alif-lamp');
    const b = signChildModeCookie('p2', 'Bilal', 'ba-boat');
    const [, sigA] = a.split('.');
    const [, sigB] = b.split('.');
    expect(sigA).not.toBe(sigB);
  });
});

describe('verifyChildModeCookie', () => {
  beforeEach(() => {
    process.env.CHILD_MODE_SECRET = TEST_SECRET;
  });

  it('returns the parsed payload for a valid cookie', () => {
    const cookie = signChildModeCookie('p1', 'Aisha', 'alif-lamp');
    const result = verifyChildModeCookie(cookie);
    expect(result).toEqual({ profileId: 'p1', name: 'Aisha', avatar: 'alif-lamp' });
  });

  it('returns null when the cookie value is empty', () => {
    expect(verifyChildModeCookie('')).toBeNull();
  });

  it('returns null when the cookie has no dot separator', () => {
    expect(verifyChildModeCookie('invalid-no-dot')).toBeNull();
  });

  it('returns null when the cookie has a tampered payload', () => {
    const cookie = signChildModeCookie('p1', 'Aisha', 'alif-lamp');
    const [, sig] = cookie.split('.');
    const tampered = Buffer.from('{"profileId":"p2","name":"EVIL","avatar":"hacker"}').toString(
      'base64url',
    );
    expect(verifyChildModeCookie(`${tampered}.${sig}`)).toBeNull();
  });

  it('returns null when the cookie has a tampered signature', () => {
    const cookie = signChildModeCookie('p1', 'Aisha', 'alif-lamp');
    const [payload] = cookie.split('.');
    expect(verifyChildModeCookie(`${payload}.deadbeefdeadbeef`)).toBeNull();
  });

  it('returns null when payload is not valid JSON', () => {
    const sig = 'deadbeef'; // won't verify anyway
    expect(verifyChildModeCookie(`not-json.${sig}`)).toBeNull();
  });

  it('throws when no secret is available (neither env var set)', () => {
    delete process.env.CHILD_MODE_SECRET;
    delete process.env.BETTER_AUTH_SECRET;
    expect(() => signChildModeCookie('p1', 'Aisha', 'alif-lamp')).toThrow(
      /CHILD_MODE_SECRET or BETTER_AUTH_SECRET must be set/,
    );
  });

  it('falls back to BETTER_AUTH_SECRET when CHILD_MODE_SECRET is not set', () => {
    delete process.env.CHILD_MODE_SECRET;
    process.env.BETTER_AUTH_SECRET = 'fallback-secret-at-least-32-chars!!';
    const cookie = signChildModeCookie('p1', 'Aisha', 'alif-lamp');
    const result = verifyChildModeCookie(cookie);
    expect(result).toEqual({ profileId: 'p1', name: 'Aisha', avatar: 'alif-lamp' });
  });
});
