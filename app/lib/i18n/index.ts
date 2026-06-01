import TypesafeI18n, { useI18nContext } from './i18n-react';

export const defaultLocale = 'en' as const;

export const locales = ['en', 'id'] as const;

export { TypesafeI18n as I18nClient, useI18nContext };
