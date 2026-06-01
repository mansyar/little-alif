import { createAuthClient } from 'better-auth/react';

/**
 * Better Auth client for the React side of the app.
 *
 * `baseURL` is intentionally omitted — Better Auth defaults to the same
 * origin as the page, which is what we want in SSR (the server functions
 * handle the auth call directly via `auth.api.*`).
 */
export const authClient = createAuthClient();
