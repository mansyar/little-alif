import { getCookie } from '@tanstack/react-start/server';
import { defaultLocale } from './index';

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
