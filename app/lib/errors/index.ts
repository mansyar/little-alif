/**
 * Error classification system for Little Alif.
 *
 * Provides a typed error hierarchy for server functions so that:
 * - Every thrown error carries a machine-readable code.
 * - Every thrown error carries a user-facing message for toasts / UI.
 * - Toast variants are derived from the error code, not free-text.
 */

// ────────────────────────── Error codes ──────────────────────────

export const ErrorCode = {
  VALIDATION: 'VALIDATION',
  AUTH: 'AUTH',
  NOT_FOUND: 'NOT_FOUND',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  NETWORK: 'NETWORK',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// ──────────────────────── Error class ────────────────────────────

export class ServerFunctionError extends Error {
  public readonly code: ErrorCode;
  public readonly userMessage: string;

  constructor(
    code: ErrorCode,
    userMessage: string,
    options?: ErrorOptions,
  ) {
    super(userMessage, options);
    this.name = 'ServerFunctionError';
    this.code = code;
    this.userMessage = userMessage;
  }
}

// ──────────────────────── Toast mapping ──────────────────────────

/**
 * Maps an ErrorCode to a toast variant.
 *
 * - `info`  → validation / not-found (inform the user without panic)
 * - `error` → auth / limit / network / unknown (action needed or unexpected)
 */
export const ERROR_TOAST_VARIANT: Record<string, 'error' | 'info'> = {
  [ErrorCode.VALIDATION]: 'info',
  [ErrorCode.AUTH]: 'error',
  [ErrorCode.NOT_FOUND]: 'info',
  [ErrorCode.LIMIT_EXCEEDED]: 'error',
  [ErrorCode.NETWORK]: 'error',
  [ErrorCode.UNKNOWN]: 'error',
};
