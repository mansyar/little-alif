import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
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
        <a
          href="/login"
          className="px-6 py-3 rounded-small bg-green text-white font-semibold hover:bg-green-light transition-colors"
        >
          Parent Login
        </a>
        <a
          href="/register"
          className="px-6 py-3 rounded-small border-2 border-green text-green font-semibold hover:bg-green hover:text-white transition-colors"
        >
          Create Account
        </a>
      </div>
    </main>
  );
}
