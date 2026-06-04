import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { loginFn } from '~/server/auth-fns';
import { useI18nContext } from '~/lib/i18n';
import { LanguageToggle } from '~/components/parent/LanguageToggle';

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => {
    const redirect = search.redirect;
    return {
      redirect: typeof redirect === 'string' ? redirect : '/dashboard',
    };
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { LL } = useI18nContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginFn({ data: { email, password } });
      await navigate({ to: redirect });
    } catch (err) {
      setError(err instanceof Error ? err.message : LL.ERROR_GENERIC());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background-warm relative">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        className="w-full max-w-md bg-white rounded-large shadow-card p-8 flex flex-col gap-5"
      >
        <h1 className="text-2xl font-bold text-text-dark">{LL.LOGIN_TITLE()}</h1>
        <p className="text-text-muted -mt-3">{LL.LOGIN_SUBTITLE()}</p>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-text-dark">{LL.LOGIN_EMAIL()}</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border border-sand-dark rounded-small focus:outline-none focus:ring-2 focus:ring-green"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-text-dark">{LL.LOGIN_PASSWORD()}</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border border-sand-dark rounded-small focus:outline-none focus:ring-2 focus:ring-green"
          />
        </label>

        {error !== null && (
          <p className="text-coral text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-small bg-green text-white font-semibold hover:bg-green-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? LL.LOGIN_SUBMITTING() : LL.LOGIN_SUBMIT()}
        </button>

        <p className="text-sm text-text-muted text-center">
          <Link to="/register" className="text-green font-semibold hover:underline">
            {LL.LOGIN_SIGNUP_LINK()}
          </Link>
        </p>
      </form>
    </main>
  );
}
