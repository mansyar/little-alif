import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { validateSessionFn } from '~/server/auth-fns';

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await validateSessionFn();
    if (session !== null) {
      const destination =
        'isChild' in session.user && session.user.isChild ? '/learn' : '/dashboard';
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- TanStack Router idiom: throw the redirect sentinel
      throw redirect({ to: destination });
    }
    return { user: null };
  },
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-background-warm">
      <h1 className="font-arabic text-6xl font-bold text-green mb-4">لا</h1>
      <h2 className="text-3xl font-bold text-text-dark mb-2">Little Alif</h2>
      <p className="text-text-muted mb-8 max-w-md">
        Introducing the Arabic alphabet, one letter at a time.
      </p>
      <div className="flex gap-4 flex-col sm:flex-row">
        <Link
          to="/register"
          className="px-6 py-3 rounded-small bg-green text-white font-semibold hover:bg-green-light transition-colors"
        >
          Create Account
        </Link>
        <Link
          to="/login"
          search={{ redirect: '/dashboard' }}
          className="px-6 py-3 rounded-small border-2 border-green text-green font-semibold hover:bg-green hover:text-white transition-colors"
        >
          Parent Login
        </Link>
      </div>
    </main>
  );
}
