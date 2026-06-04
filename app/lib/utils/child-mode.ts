import { createHmac } from 'node:crypto';

/**
 * Child Mode cookie signing and verification.
 *
 * The `child_mode` cookie is a signed, tamper-evident token that lets a child
 * profile bypass parent authentication. The cookie value is:
 *
 *   <base64url-encoded JSON> || '.' || <HMAC-SHA256 hex signature>
 *
 * where the JSON payload is `{ profileId, name, avatar }`.
 *
 * The signature is computed over the base64 payload using HMAC-SHA256 with
 * `CHILD_MODE_SECRET` (falling back to `BETTER_AUTH_SECRET`).
 */

export interface ChildModePayload {
  profileId: string;
  name: string;
  avatar: string;
}

/**
 * Derive the HMAC secret from environment variables.
 * Prefers `CHILD_MODE_SECRET`; falls back to `BETTER_AUTH_SECRET`.
 */
function getSecret(): string {
  return process.env.CHILD_MODE_SECRET ?? process.env.BETTER_AUTH_SECRET ?? '';
}

/**
 * Sign a child-mode cookie value for the given profile.
 *
 * Returns a string of the form `<base64url_payload>.<hex_signature>`.
 */
export function signChildModeCookie(profileId: string, name: string, avatar: string): string {
  const payload: ChildModePayload = { profileId, name, avatar };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = getSecret();
  const hmac = createHmac('sha256', secret).update(encoded).digest('hex');
  return `${encoded}.${hmac}`;
}

/**
 * Verify and parse a child-mode cookie value.
 *
 * Returns the decoded payload if the signature is valid, or `null` if the
 * cookie is missing, malformed, or tampered with.
 */
export function verifyChildModeCookie(cookieValue: string): ChildModePayload | null {
  if (!cookieValue) return null;

  const dotIndex = cookieValue.indexOf('.');
  if (dotIndex === -1) return null;

  const encoded = cookieValue.slice(0, dotIndex);
  const signature = cookieValue.slice(dotIndex + 1);

  if (!encoded || !signature) return null;

  const secret = getSecret();
  const expected = createHmac('sha256', secret).update(encoded).digest('hex');

  // Constant-time comparison to prevent timing attacks
  if (!constantTimeEqual(expected, signature)) return null;

  try {
    const raw = Buffer.from(encoded, 'base64url').toString('utf-8');
    const payload = JSON.parse(raw) as ChildModePayload;
    // Validate payload shape
    if (
      typeof payload.profileId !== 'string' ||
      typeof payload.name !== 'string' ||
      typeof payload.avatar !== 'string'
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks on HMAC comparison.
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
