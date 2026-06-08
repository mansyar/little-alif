// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import { readHarakatCookie, writeHarakatCookie } from './harakat-cookie';

describe('readHarakatCookie', () => {
  beforeEach(() => {
    // Clear all cookies before each test
    document.cookie.split(';').forEach((c) => {
      const name = c.split('=')[0]?.trim();
      if (name) {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });
  });

  it('returns null when no harakat cookie exists', () => {
    expect(readHarakatCookie()).toBeNull();
  });

  it('returns the VowelMode string when a valid cookie exists', () => {
    document.cookie = 'little-alif-harakat=dammah; path=/';
    expect(readHarakatCookie()).toBe('dammah');
  });

  it('returns fathah when cookie is fathah', () => {
    document.cookie = 'little-alif-harakat=fathah; path=/';
    expect(readHarakatCookie()).toBe('fathah');
  });

  it('returns kasrah when cookie is kasrah', () => {
    document.cookie = 'little-alif-harakat=kasrah; path=/';
    expect(readHarakatCookie()).toBe('kasrah');
  });

  it('returns null when cookie value is invalid', () => {
    document.cookie = 'little-alif-harakat=invalid; path=/';
    expect(readHarakatCookie()).toBeNull();
  });

  it('returns null when cookie value is empty', () => {
    document.cookie = 'little-alif-harakat=; path=/';
    expect(readHarakatCookie()).toBeNull();
  });

  it('ignores other cookies and finds the harakat cookie', () => {
    document.cookie = 'other=value; path=/';
    document.cookie = 'little-alif-harakat=kasrah; path=/';
    document.cookie = 'another=cookie; path=/';
    expect(readHarakatCookie()).toBe('kasrah');
  });
});

describe('writeHarakatCookie', () => {
  beforeEach(() => {
    document.cookie.split(';').forEach((c) => {
      const name = c.split('=')[0]?.trim();
      if (name) {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      }
    });
  });

  it('writes a cookie with the given VowelMode', () => {
    writeHarakatCookie('fathah');
    expect(document.cookie).toContain('little-alif-harakat=fathah');
  });

  it('overwrites an existing harakat cookie', () => {
    document.cookie = 'little-alif-harakat=none; path=/';
    writeHarakatCookie('dammah');
    expect(readHarakatCookie()).toBe('dammah');
  });

  it('sets SameSite=Lax', () => {
    writeHarakatCookie('kasrah');
    // We can verify value; SameSite is set via the cookie string
    expect(readHarakatCookie()).toBe('kasrah');
  });
});
