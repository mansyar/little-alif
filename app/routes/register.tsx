import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { registerFn } from '~/server/auth-fns';

export const Route = createFileRoute('/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await registerFn({ data: { email, password } });
      await navigate({ to: '/dashboard' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background-warm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-large shadow-card p-8 flex flex-col gap-5"
      >
        <h1 className="text-2xl font-bold text-text-dark">Create Account</h1>
        <p className="text-text-muted -mt-3">
          A parent account is the first step — child profiles come next.
        </p>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-text-dark">Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-small focus:outline-none focus:ring-2 focus:ring-green"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-text-dark">Password</span>
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-small focus:outline-none focus:ring-2 focus:ring-green"
          />
          <span className="text-xs text-text-muted">At least 8 characters.</span>
        </label>

        {error !== null && (
          <p className="text-red text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 rounded-small bg-green text-white font-semibold hover:bg-green-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-sm text-text-muted text-center">
          Already have an account?{' '}
          <a href="/login" className="text-green font-semibold hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </main>
  );
}
