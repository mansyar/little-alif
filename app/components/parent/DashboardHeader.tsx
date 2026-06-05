import { useI18nContext } from '~/lib/i18n';
import { LanguageToggle } from './LanguageToggle';
import { ProfileMenu } from './ProfileMenu';

export function DashboardHeader() {
  const { LL } = useI18nContext();

  return (
    <header className="flex items-center justify-between border-b border-sand-light bg-white px-5 py-4">
      <h1 className="text-xl font-bold text-text-dark">{LL.DASHBOARD_TITLE()}</h1>
      <div className="flex items-center gap-3">
        <LanguageToggle />
        <ProfileMenu />
      </div>
    </header>
  );
}
