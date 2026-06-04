import { APIError } from 'better-auth';
import { createServerFn } from '@tanstack/react-start';
import { getCookie, getRequest, setCookie } from '@tanstack/react-start/server';
import { z } from 'zod';
import { getDb, type DbClient } from '~/db';
import { enableChildModeSchema, loginSchema, registerSchema } from '~/lib/validations/auth';
import { signChildModeCookie } from '~/lib/utils/child-mode';
import { getAuth } from './auth';
import { getActiveProfile } from './profiles';

/**
 * Pure helper — derives a display name from the email local-part.
 * Falls back to 'Parent' when the local-part is empty.
 */
export function deriveNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? '';
  return local.length > 0 ? local : 'Parent';
}

/**
 * Build the cookie header that we hand to Better Auth when we only
 * have a single session cookie value. The cookie name is what Better
 * Auth's TanStack Start integration reads on the response.
 */
export function buildCookieHeader(token: string): string {
  return `better-auth.session_token=${token}`;
}

/**
 * Register a new parent account with email + password.
 * Returns the created user object. Throws on validation or auth failure.
 */
export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(registerSchema)
  .handler(async ({ data }) => {
    const auth = getAuth();
    const request = getRequest();
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: deriveNameFromEmail(data.email),
          email: data.email,
          password: data.password,
        },
        headers: request.headers,
        returnHeaders: true,
      });
      return result.response.user;
    } catch (err) {
      if (err instanceof APIError) {
        throw new Error(err.message);
      }
      throw err;
    }
  });

/**
 * Sign in an existing parent account with email + password.
 * Returns the user object. Sets the session cookie via the response headers.
 */
export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(loginSchema)
  .handler(async ({ data }) => {
    const auth = getAuth();
    const request = getRequest();
    try {
      const result = await auth.api.signInEmail({
        body: { email: data.email, password: data.password },
        headers: request.headers,
        returnHeaders: true,
      });
      return result.response.user;
    } catch (err) {
      if (err instanceof APIError) {
        throw new Error(err.message);
      }
      throw err;
    }
  });

/**
 * Sign out the current session by invalidating the session token.
 */
export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const auth = getAuth();
  const request = getRequest();
  await auth.api.signOut({
    headers: request.headers,
  });
  return { success: true };
});

/**
 * Validate the current session cookie and return the active user, or null
 * when no valid session exists. Does not throw on missing session.
 */
export const validateSessionFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({}).optional())
  .handler(async () => {
    const auth = getAuth();
    const token = getCookie('better-auth.session_token');
    if (token === undefined) {
      return null;
    }
    const result = await auth.api.getSession({
      headers: new Headers({ cookie: buildCookieHeader(token) }),
    });
    return result ?? null;
  });

// ─── Child Mode Helpers ───────────────────────────────────────────────

/**
 * Validate profile ownership and return the data needed to sign a child-mode
 * cookie. Reuses `getActiveProfile` from the profiles module to ensure
 * consistent ownership checks.
 */
export async function enableChildMode(
  db: DbClient,
  userId: string,
  profileId: string,
): Promise<{ name: string; avatar: string }> {
  const profile = await getActiveProfile(db, userId, profileId);
  return { name: profile.name, avatar: profile.avatar };
}

/**
 * Enable child mode for a profile. Validates parent session and profile
 * ownership, then sets a signed `child_mode` cookie (Max-Age: 365 days,
 * HttpOnly: false, SameSite: Lax). Replaces any existing child-mode cookie.
 */
export const enableChildModeFn = createServerFn({ method: 'POST' })
  .inputValidator(enableChildModeSchema)
  .handler(async ({ data }) => {
    const session = await validateSessionFn();
    if (session === null) {
      throw new Error('Unauthenticated.');
    }

    const db = getDb();
    const { name, avatar } = await enableChildMode(db, session.user.id, data.profileId);

    const cookieValue = signChildModeCookie(data.profileId, name, avatar);
    setCookie('child_mode', cookieValue, {
      httpOnly: false,
      maxAge: 31_536_000,
      sameSite: 'lax',
      path: '/',
    });

    return { success: true, profile: { name, avatar } };
  });

/**
 * Disable child mode for the current device. Validates parent session, then
 * clears the `child_mode` cookie. Takes no input — the active cookie on this
 * device is what gets deleted.
 */
export const disableChildModeFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({}).optional())
  .handler(async () => {
    const session = await validateSessionFn();
    if (session === null) {
      throw new Error('Unauthenticated.');
    }

    setCookie('child_mode', '', {
      maxAge: 0,
      path: '/',
    });

    return { success: true };
  });
