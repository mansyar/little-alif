import { VOWEL_MODES, type VowelMode } from './harakat';

const COOKIE_NAME = 'little-alif-harakat';

/**
 * Read the harakat session cookie.
 *
 * Returns the VowelMode if a valid cookie exists, otherwise null.
 * Corrupt or invalid cookie values are silently ignored (fallback).
 */
export function readHarakatCookie(): VowelMode | null {
  const cookies = document.cookie.split(';').map((c) => c.trim());
  const harakatCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!harakatCookie) return null;

  const value = harakatCookie.slice(`${COOKIE_NAME}=`.length);
  if (!value) return null;

  return VOWEL_MODES.includes(value as VowelMode) ? (value as VowelMode) : null;
}

/**
 * Write the harakat session cookie.
 *
 * Sets a SameSite=Lax cookie with no MaxAge — auto-clears on tab close.
 * Called synchronously on every harakat change.
 */
export function writeHarakatCookie(mode: VowelMode): void {
  document.cookie = `${COOKIE_NAME}=${mode}; path=/; SameSite=Lax`;
}
