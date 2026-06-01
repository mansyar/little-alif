import { createFileRoute } from '@tanstack/react-router';
import { getAuth } from '~/server/auth';

/**
 * Better Auth catch-all route.
 *
 * Forwards any `/api/auth/*` request to Better Auth's HTTP handler. The
 * handler routes the call to the right `auth.api.*` method internally.
 *
 * In practice the app uses the in-process `auth.api.*` methods via
 * server functions (see `~/server/auth-fns.ts`) for the SSR sign-in flow.
 * This route exists so any client-side request that bypasses the server
 * function (e.g. a `useSession` React hook) still has a working HTTP
 * target.
 */
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) =>
        getAuth().handler(request),
      POST: async ({ request }: { request: Request }) =>
        getAuth().handler(request),
    },
  },
});
