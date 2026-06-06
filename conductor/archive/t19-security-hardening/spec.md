# T-19 Specification: Security Hardening & Code Quality Fixes

## Problem Statement

A comprehensive security and code quality audit (2026-06-07, commit `ddd58fc`) identified 26 issues across the application. The most critical is a **path traversal vulnerability** in the Docker static file server that allows arbitrary file disclosure. Additional issues include insecure cookie configuration, missing security headers, code duplication, React performance problems, and database schema gaps.

## Audit Summary

| Severity | Count | Status |
| -------- | ----- | ------ |
| Critical | 1     | Open   |
| High     | 5     | Open   |
| Medium   | 10    | Open   |
| Low      | 10    | Open   |

## Requirements

### FR-1: Path Traversal Prevention (C-1)

The Docker static file server (`docker/server-entry.mjs`) must validate that resolved file paths remain within `CLIENT_DIR` before serving. A request like `GET /../../../etc/passwd` must return 403.

### FR-2: Child-Mode Cookie Hardening (H-1, H-2, H-4)

- Add `secure: process.env.NODE_ENV === 'production'` to child-mode cookie
- Set `httpOnly: true` (client-side `auth-store` already tracks `childProfileId` independently)
- Throw error at startup if no HMAC secret is available (no empty-string fallback)

### FR-3: Rate Limiting on Auth Endpoints (H-3)

Implement basic rate limiting on `registerFn` and `loginFn` server functions. Options:

- In-memory rate limiter (simple, sufficient for single-parent deployment)
- Or document reverse proxy rate limiting (Coolify/nginx)

### FR-4: Security Headers (H-5)

Add security headers in `docker/server-entry.mjs`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (basic, allowing self + Google Fonts)

### FR-5: Open Redirect Prevention (M-1)

Validate that the `redirect` search parameter in `login.tsx` starts with `/` and does not contain `//` or protocol schemes.

### FR-6: Docker Security (M-4)

Add non-root user to Dockerfile:

```dockerfile
RUN addgroup -g 1001 -S app && adduser -S app -u 1001
USER app
```

### FR-7: Cookie Lifetime Alignment (M-5, M-6)

- Reduce child-mode cookie max-age from 365 days to 30 days
- Add `secure` flag to locale cookie

### FR-8: Fix `<Link disabled>` (M-7)

Replace `<Link disabled>` in `learn.tsx` with a `<button>` that navigates programmatically when `canStartReading` is true.

### FR-9: LetterCard Performance (M-8)

Memoize `LetterCard` or optimize Zustand selectors to prevent all 28 cards re-rendering on every tap.

### FR-10: Database Schema Improvements (M-9)

- Add index on `profiles.userId`
- Add foreign key constraint from `profiles.userId` to `user.id`

### FR-11: Extract Shared `verifyProfileOwnership` (M-10)

Move duplicated `verifyProfileOwnership` from `letters.ts` and `reading.ts` into a shared module.

### FR-12: Auth Store Fix (Medium from code quality audit)

Fix `setChildMode` to set `isAuthenticated: true` when a child profile is active.

### FR-13: Accessibility Improvements (Low)

- Add `prefers-reduced-motion` media query to `app.css`
- Fix `--color-text-muted` contrast ratio (currently ~3.2:1, needs 4.5:1 for WCAG AA)

### FR-14: Testing Gaps

- Add tests for `login.tsx` and `register.tsx` route `beforeLoad` guards
- Add direct unit tests for `child-mode.server.ts` cookie signing/verification

## Out of Scope

- CSRF token implementation (mitigated by `sameSite: 'lax'`)
- Full password complexity rules (8+ chars is acceptable)
- Keyboard navigation tests (touch-first app)
- Removing `child-store.ts` if unused (separate cleanup track)

## Design Decisions

| #    | Decision                                   | Rationale                                                                         |
| ---- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| DD-1 | In-memory rate limiter over external proxy | Single-parent deployment; no need for Redis/external dependency                   |
| DD-2 | `httpOnly: true` for child-mode cookie     | Client-side store already tracks `childProfileId`; cookie only needed server-side |
| DD-3 | Throw on missing HMAC secret               | Fail-fast prevents silent misconfiguration in production                          |
| DD-4 | Basic CSP (not strict)                     | Self-hosted app with Google Fonts; strict CSP would break font loading            |
| DD-5 | FK constraint on `profiles.userId`         | Enforces referential integrity at DB level, not just application logic            |

## Verification Criteria

- [ ] `GET /../../../etc/passwd` returns 403 in Docker
- [ ] Child-mode cookie has `secure` (production) and `httpOnly: true`
- [ ] Empty HMAC secret causes startup error
- [ ] Auth endpoints reject rapid-fire requests
- [ ] Response headers include security headers
- [ ] `redirect` param validated as internal path
- [ ] Docker container runs as non-root
- [ ] Child-mode cookie expires in 30 days
- [ ] `<Link disabled>` replaced with proper `<button>`
- [ ] LetterCard does not re-render on unrelated store changes
- [ ] `profiles.userId` has index and FK constraint
- [ ] `verifyProfileOwnership` lives in one shared module
- [ ] `setChildMode` correctly sets `isAuthenticated`
- [ ] WCAG AA contrast on muted text
- [ ] `prefers-reduced-motion` respected
- [ ] Login/register routes have `beforeLoad` tests
- [ ] `child-mode.server.ts` has direct unit tests
