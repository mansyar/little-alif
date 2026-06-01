import { createFileRoute, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { logoutFn, validateSessionFn } from '~/server/auth-fns';
import { useI18nContext } from '~/lib/i18n';
import { LanguageToggle } from '~/components/parent/LanguageToggle';
import { ProfileList } from '~/components/parent/ProfileList';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await validateSessionFn();
    if (session === null) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router idiom: throw the redirect sentinel
      throw redirect({ to: '/login', search: { redirect: '/dashboard' } });
    }
    return { user: session.user };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { LL } = useI18nContext();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await logoutFn();
      window.location.href = '/';
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-sand-light bg-white px-5 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-dark">{LL.DASHBOARD_TITLE()}</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <span className="rounded-small bg-sand-light px-3 py-2 text-sm font-semibold text-text-dark">
            {LL.PROFILE_NAME()}
          </span>
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <LanguageToggle />
          <button
            type="button"
            onClick={() => {
              void handleLogout();
            }}
            disabled={signingOut}
            className="rounded-small px-3 py-2 text-left text-sm text-text-muted transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
          >
            {signingOut ? LL.DASHBOARD_SIGNING_OUT() : LL.DASHBOARD_SIGN_OUT()}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-8 py-8">
        <header className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-dark">{LL.PROFILE_NAME()}</h2>
          <button
            type="button"
            className="rounded-small bg-green px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-green/90"
          >
            {LL.DASHBOARD_ADD_CHILD()}
          </button>
        </header>

        <ProfileList />
      </main>
    </div>
  );
}
