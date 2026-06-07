import { APIError } from 'better-auth';
import { createServerFn } from '@tanstack/react-start';
import { getCookie, getRequest, setCookie } from '@tanstack/react-start/server';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { getDb, type DbClient } from '~/db';
import { profiles } from '~/db/schema';
import { ErrorCode, ServerFunctionError } from '~/lib/errors';
import { enableChildModeSchema, loginSchema, registerSchema } from '~/lib/validations/auth';
import { getAuth } from './auth';
import { checkRateLimit, getClientIp } from '~/lib/utils/rate-limit';

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
    const request = getRequest();
    const ip = getClientIp(request);
    if (!checkRateLimit(`register:${ip}`, 5, 60_000)) {
      throw new ServerFunctionError(ErrorCode.AUTH, 'ERROR_AUTH');
    }

    const auth = await getAuth();
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
        throw new ServerFunctionError(ErrorCode.AUTH, 'ERROR_AUTH', { cause: err });
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
    const request = getRequest();
    const ip = getClientIp(request);
    if (!checkRateLimit(`login:${ip}`, 5, 60_000)) {
      throw new ServerFunctionError(ErrorCode.AUTH, 'ERROR_AUTH');
    }

    const auth = await getAuth();
    try {
      const result = await auth.api.signInEmail({
        body: { email: data.email, password: data.password },
        headers: request.headers,
        returnHeaders: true,
      });
      return result.response.user;
    } catch (err) {
      if (err instanceof APIError) {
        throw new ServerFunctionError(ErrorCode.AUTH, 'ERROR_AUTH', { cause: err });
      }
      throw err;
    }
  });

/**
 * Sign out the current session by invalidating the session token.
 */
export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const auth = await getAuth();
  const request = getRequest();
  await auth.api.signOut({
    headers: request.headers,
  });
  return { success: true };
});

/**
 * Build a child session from a valid child-mode cookie.
 *
 * Verifies the HMAC signature, looks up the profile's parent userId from
 * the DB, and returns a session-like object compatible with the shape that
 * BetterAuth's getSession() returns. Returns null if the cookie is invalid,
 * tampered, or the profile has been deleted.
 */
export async function buildChildSession(
  db: DbClient,
  cookieValue: string,
): Promise<{
  user: { id: string; email: string; isChild: true; childProfileId: string };
  session: { token: string; expiresAt: string; userId: string };
} | null> {
  const { verifyChildModeCookie } = await import('~/lib/utils/child-mode.server');
  const payload = verifyChildModeCookie(cookieValue);
  if (!payload) return null;

  const profile = await db
    .select({ userId: profiles.userId })
    .from(profiles)
    .where(eq(profiles.id, payload.profileId))
    .then((rows) => rows[0] ?? null);

  if (!profile) return null;

  return {
    user: {
      id: profile.userId,
      email: '',
      isChild: true,
      childProfileId: payload.profileId,
    },
    session: {
      token: '',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      userId: profile.userId,
    },
  };
}

/**
 * Validate the current session cookie or child-mode cookie and return
 * the active user, or null when no valid session exists.
 *
 * Priority order:
 *   1. Parent JWT session (better-auth.session_token)
 *   2. Child-mode cookie (child_mode)
 *
 * Does not throw on missing session.
 */
export const validateSessionFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({}).optional())
  .handler(async () => {
    const auth = await getAuth();
    const token = getCookie('better-auth.session_token');

    // Priority 1: parent JWT session
    if (token !== undefined) {
      const result = await auth.api.getSession({
        headers: new Headers({ cookie: buildCookieHeader(token) }),
      });
      if (result) return result;
    }

    // Priority 2: child-mode cookie
    const childCookie = getCookie('child_mode');
    if (childCookie !== undefined) {
      const db = await getDb();
      const childSession = await buildChildSession(db, childCookie);
      if (childSession) return childSession;
    }

    return null;
  });

/**
 * Verify that the session is a parent JWT session, rejecting child-mode
 * sessions. Parent-only operations (create/update/delete profile, toggle
 * letters, etc.) must call this before proceeding.
 *
 * Throws `'Unauthorized. Parent session required.'` for child sessions.
 * Returns `void` on success.
 */
export function requireParentSession(
  session: { user: Record<string, unknown> } | null,
): asserts session is { user: { id: string } } {
  if (session === null) {
    throw new ServerFunctionError(ErrorCode.AUTH, 'ERROR_AUTH');
  }
  if (session.user.isChild === true) {
    throw new ServerFunctionError(ErrorCode.AUTH, 'ERROR_AUTH');
  }
}

/**
 * Verify that a child session is allowed to access the given profile.
 *
 * When the session is a child-mode session (has `isChild: true`), this
 * ensures the requested `profileId` matches the `childProfileId` in the
 * session — preventing a child from accessing another child's data.
 *
 * When the session is a parent JWT session, this check is a no-op (the
 * existing profile-ownership checks in each function handle authorization).
 *
 * Throws `'Unauthorized.'` on mismatch. Returns `void` on success.
 */
export function authorizeChildAccess(
  session: { user: Record<string, unknown> },
  profileId: string,
): void {
  if (session.user.isChild === true) {
    if (session.user.childProfileId !== profileId) {
      throw new ServerFunctionError(ErrorCode.AUTH, 'ERROR_AUTH');
    }
  }
}

// ─── Child Mode Helpers ───────────────────────────────────────────────

/**
 * Validate profile ownership and return the data needed to sign a child-mode
 * cookie. Uses inline profile query to avoid a circular dependency with the
 * profiles module.
 */
export async function enableChildMode(
  db: DbClient,
  userId: string,
  profileId: string,
): Promise<{ name: string; avatar: string }> {
  const profile = await db
    .select({ name: profiles.name, avatar: profiles.avatar })
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))
    .then((rows) => rows[0] ?? null);

  if (!profile) {
    throw new ServerFunctionError(ErrorCode.NOT_FOUND, 'ERROR_NOT_FOUND');
  }

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
    requireParentSession(session);

    const db = await getDb();
    const { name, avatar } = await enableChildMode(db, session.user.id, data.profileId);

    const { signChildModeCookie } = await import('~/lib/utils/child-mode.server');
    const cookieValue = signChildModeCookie(data.profileId, name, avatar);
    setCookie('child_mode', cookieValue, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
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
    requireParentSession(session);

    setCookie('child_mode', '', {
      maxAge: 0,
      path: '/',
    });

    return { success: true };
  });
