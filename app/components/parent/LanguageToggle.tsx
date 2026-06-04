import { useI18nContext, locales } from '~/lib/i18n';
import { setLocaleCookie } from '~/lib/i18n/set-locale-fn';
import type { Locales } from '~/lib/i18n/i18n-types';

export function LanguageToggle() {
  const { locale, setLocale, LL } = useI18nContext();

  const nextLocale = locales.find((l) => l !== locale) ?? ('id' satisfies Locales);

  async function handleToggle() {
    await setLocaleCookie({ data: { locale: nextLocale } });
    setLocale(nextLocale);
  }

  return (
    <button
      onClick={() => {
        void handleToggle();
      }}
      type="button"
      className="focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2"
    >
      {LL.LOCALE_SWITCH()}
    </button>
  );
}
