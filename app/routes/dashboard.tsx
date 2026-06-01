import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { useState } from 'react';
import { logoutFn, validateSessionFn } from '~/server/auth-fns';

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const session = await validateSessionFn();
    if (session === null) {
      throw redirect({ to: '/login', search: { redirect: '/dashboard' } });
    }
    return { user: session.user };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = Route.useRouteContext();
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
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-text-dark">Dashboard</h1>
        <button
          type="button"
          onClick={handleLogout}
          disabled={signingOut}
          className="px-4 py-2 rounded-small border border-sand-dark text-text-muted hover:text-text-dark transition-colors disabled:opacity-60"
        >
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </header>

      <section className="bg-white rounded-large shadow-card p-6 mb-6">
        <h2 className="text-xl font-semibold text-text-dark mb-1">Welcome, {user.email}</h2>
        <p className="text-text-muted">Child profile management lands in the next milestone.</p>
      </section>

      <Link to="/" className="text-green font-semibold hover:underline">
        Back to home
      </Link>
    </main>
  );
}
