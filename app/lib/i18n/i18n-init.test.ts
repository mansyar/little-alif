import { describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-start/server', () => ({
  getCookie: vi.fn(),
}));

describe('getServerLocale', () => {
  it('returns "en" when cookie locale is "en"', async () => {
    const { getCookie } = await import('@tanstack/react-start/server');
    vi.mocked(getCookie).mockReturnValue('en');
    const { getServerLocale } = await import('./index');
    expect(getServerLocale()).toBe('en');
  });

  it('returns "id" when cookie locale is "id"', async () => {
    const { getCookie } = await import('@tanstack/react-start/server');
    vi.mocked(getCookie).mockReturnValue('id');
    const { getServerLocale } = await import('./index');
    expect(getServerLocale()).toBe('id');
  });

  it('returns "en" when cookie is missing', async () => {
    const { getCookie } = await import('@tanstack/react-start/server');
    vi.mocked(getCookie).mockReturnValue(undefined);
    const { getServerLocale } = await import('./index');
    expect(getServerLocale()).toBe('en');
  });

  it('returns "en" when getCookie throws (SSR not available)', async () => {
    const { getCookie } = await import('@tanstack/react-start/server');
    vi.mocked(getCookie).mockImplementation(() => {
      throw new Error('no SSR');
    });
    const { getServerLocale } = await import('./index');
    expect(getServerLocale()).toBe('en');
  });
});

describe('module exports', () => {
  it('exports defaultLocale, locales, I18nClient, useI18nContext', async () => {
    const mod = await import('./index');
    expect(mod.defaultLocale).toBe('en');
    expect(mod.locales).toEqual(['en', 'id']);
    expect(typeof mod.I18nClient).toBe('function');
    expect(typeof mod.useI18nContext).toBe('function');
    expect(typeof mod.getServerLocale).toBe('function');
  });
});
