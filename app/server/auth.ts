import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { getDb } from '~/db';

function buildAuth() {
  return betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: 'sqlite',
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days in seconds
      updateAge: 60 * 60 * 24, // refresh once a day
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5, // 5 minutes
      },
    },
    advanced: {
      cookies: {
        session_token: {
          attributes: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          },
        },
      },
    },
    plugins: [tanstackStartCookies()],
  });
}

export type AuthInstance = ReturnType<typeof buildAuth>;

let _auth: AuthInstance | null = null;

/**
 * Lazily build and return the singleton Better Auth instance.
 *
 * The Drizzle adapter expects a DB whose schema contains the canonical
 * `user`, `session`, `account`, `verification` tables — all defined in
 * `app/db/auth-schema.ts` and re-exported via `app/db/index.ts`.
 *
 * The `tanstackStartCookies` plugin wires up `setCookie` from
 * `@tanstack/react-start/server` so auth cookies land on the response
 * after sign-in / sign-out handlers.
 */
export function getAuth(): AuthInstance {
  _auth ??= buildAuth();
  return _auth;
}
