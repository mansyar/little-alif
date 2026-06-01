import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  // Auth gate is added in Phase 3 (Better Auth integration).
  // For now this is a simple placeholder route.
  component: function DashboardPlaceholder() {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Dashboard (auth-gated in Phase 3)</p>
      </main>
    );
  },
});
