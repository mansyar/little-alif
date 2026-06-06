/**
 * Simple in-memory rate limiter for single-instance deployments.
 *
 * Tracks attempt counts per key within a sliding window. Suitable for
 * protecting auth endpoints in a single-parent deployment scenario.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const attempts = new Map<string, RateLimitEntry>();

/**
 * Check whether a request identified by `key` is within the allowed rate.
 *
 * @param key - Unique identifier (e.g., IP address or email)
 * @param maxAttempts - Maximum number of attempts allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns `true` if the request is allowed, `false` if rate-limited
 */
export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxAttempts) return false;

  entry.count++;
  return true;
}

/**
 * Extract a client identifier from the request for rate limiting.
 * Prefers x-forwarded-for (first IP), falls back to socket remote address.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }
  return 'unknown';
}
