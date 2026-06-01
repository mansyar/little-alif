import TypesafeI18n, { useI18nContext } from './i18n-react';
import { loadedLocales, loadedFormatters } from './i18n-util';
import { initFormatters } from './formatters';
import en from './en';
import id from './id';

export const defaultLocale = 'en' as const;

export const locales = ['en', 'id'] as const;

export { TypesafeI18n as I18nClient, useI18nContext };

// Pre-load translations synchronously so LL.*() functions return strings
// immediately when the I18nClient provider mounts.
loadedLocales.en = en;
loadedLocales.id = id;
loadedFormatters.en = initFormatters('en');
loadedFormatters.id = initFormatters('id');
