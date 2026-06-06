import { createFileRoute } from '@tanstack/react-router';

/**
 * Health check endpoint for Docker/Coolify orchestrator monitoring.
 *
 * Returns a simple 200 `{ status: "ok" }` response. No authentication
 * required — liveness checks should never depend on auth. No database
 * queries — a failing DB should not prevent liveness detection.
 */
export const Route = createFileRoute('/api/health')({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    },
  },
});
