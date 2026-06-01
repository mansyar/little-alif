import { getCookie } from '@tanstack/react-start/server';
import TypesafeI18n, { useI18nContext } from './i18n-react';

export const defaultLocale = 'en' as const;

export const locales = ['en', 'id'] as const;

export { TypesafeI18n as I18nClient, useI18nContext };

/**
 * Read the locale from the `locale` cookie on the server.
 * Falls back to `'en'` if the cookie is absent or SSR is unavailable.
 */
export function getServerLocale(): string {
  try {
    return getCookie('locale') ?? defaultLocale;
  } catch {
    return defaultLocale;
  }
}
