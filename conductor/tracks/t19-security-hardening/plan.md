# T-19 Implementation Plan: Security Hardening & Code Quality Fixes

## Phase 1: Critical & High Security Fixes (1-2h)

### Task 1.1: Fix Path Traversal in Docker Server [C-1]

**File:** `docker/server-entry.mjs`
**Effort:** 10min

Add resolved-path containment check before serving static files:

```js
// After: let filePath = join(CLIENT_DIR, url.pathname);
const resolved = resolve(filePath);
if (!resolved.startsWith(CLIENT_DIR)) {
  res.writeHead(403);
  res.end();
  return;
}
```

**Test:** Verify `GET /../../../etc/passwd` returns 403.

---

### Task 1.2: Harden Child-Mode Cookie [H-1, H-2]

**File:** `app/server/auth-fns.ts` (lines 254-259)
**Effort:** 10min

Update cookie options:

```ts
setCookie('child_mode', cookieValue, {
  httpOnly: true, // was: false
  maxAge: 31_536_000, // keep: 1 year (or reduce to 30 days in Phase 2)
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production', // ADD
});
```

**Note:** Since `httpOnly: true` prevents client-side reading, verify that `auth-store` doesn't rely on reading the cookie directly (it uses `childProfileId` from the store, which is set by the server function response).

**Test:** Update `child-mode-fns.test.ts` to verify `httpOnly` and `secure` flags.

---

### Task 1.3: Fail-Fast on Missing HMAC Secret [H-4]

**File:** `app/lib/utils/child-mode.server.ts` (line 28)
**Effort:** 10min

Replace empty-string fallback with startup error:

```ts
function getSecret(): string {
  const secret = process.env.CHILD_MODE_SECRET ?? process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'CHILD_MODE_SECRET or BETTER_AUTH_SECRET must be set. ' +
        'Child-mode cookie signing requires a secret.',
    );
  }
  return secret;
}
```

**Test:** Add test that verifies error is thrown when both env vars are missing.

---

### Task 1.4: Add Rate Limiting to Auth Endpoints [H-3]

**Files:** `app/server/auth-fns.ts`, new `app/lib/utils/rate-limit.ts`
**Effort:** 30min

Create a simple in-memory rate limiter:

```ts
// app/lib/utils/rate-limit.ts
const attempts = new Map<string, { count: number; resetAt: number }>();

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
```

Apply to `registerFn` and `loginFn`:

- 5 attempts per minute per IP
- Extract IP from `x-forwarded-for` header or `req.socket.remoteAddress`

**Test:** Unit tests for rate limiter logic (window reset, max attempts exceeded).

---

### Task 1.5: Add Security Headers [H-5]

**File:** `docker/server-entry.mjs`
**Effort:** 10min

Add headers before SSR handler:

```js
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
res.setHeader('X-XSS-Protection', '0'); // Modern browsers don't need this, but safe default
```

For CSP, add a basic policy allowing self + Google Fonts:

```js
res.setHeader(
  'Content-Security-Policy',
  "default-src 'self'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " + // TanStack Start needs inline scripts
    "img-src 'self' data:; " +
    "connect-src 'self';",
);
```

**Note:** TanStack Start's SSR + hydration requires `'unsafe-inline'` and `'unsafe-eval'` for scripts. This is a known limitation of CSP with Vite-based frameworks.

**Test:** Verify headers are present in response.

---

### Task 1.6: Prevent Open Redirect [M-1]

**File:** `app/routes/login.tsx` (lines 8-12)
**Effort:** 5min

Validate redirect parameter:

```ts
validateSearch: (search: Record<string, unknown>) => {
  const redirect = search.redirect;
  const isValidRedirect = typeof redirect === 'string'
    && redirect.startsWith('/')
    && !redirect.startsWith('//');
  return {
    redirect: isValidRedirect ? redirect : '/dashboard',
  };
},
```

**Test:** Add test for `//evil.com` and `https://evil.com` redirect values.

---

### Task 1.7: Docker Non-Root User [M-4]

**File:** `docker/Dockerfile`
**Effort:** 5min

Add before CMD:

```dockerfile
RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app
RUN chown -R app:app /app
USER app
```

**Test:** Verify container runs and serves requests as non-root.

---

## Phase 2: Medium Security & Code Quality (1-2h)

### Task 2.1: Fix `<Link disabled>` in learn.tsx [M-7]

**File:** `app/routes/learn.tsx` (lines 157-163)
**Effort:** 10min

Replace `<Link disabled>` with conditional rendering:

```tsx
{
  canStartReading ? (
    <Link to="/learn/reading" className="...">
      Reading Practice
    </Link>
  ) : (
    <span className="... opacity-50 cursor-not-allowed" aria-disabled="true">
      Reading Practice
    </span>
  );
}
```

Or use a `<button>` with `onClick` that calls `navigate()`.

**Test:** Update route test to verify disabled state renders `<span>` or `<button>`.

---

### Task 2.2: Optimize LetterCard Re-renders [M-8]

**File:** `app/components/child/LetterCard.tsx`
**Effort:** 20min

Option A (recommended): Use Zustand `useShallow` selector:

```ts
const currentHarakat = useUiStore((s) => s.currentHarakat);
const setSelectedLetter = useUiStore((s) => s.setSelectedLetter);
// Don't subscribe to selectedLetterId — each card doesn't need it
```

Option B: Wrap in `React.memo` and pass props:

```tsx
export const LetterCard = React.memo(function LetterCard({
  letter,
  currentHarakat,
  onSelect,
}: Props) {
  // ...
});
```

**Test:** Verify that tapping one card doesn't cause other cards to re-render (use `React.Profiler` or mock render count).

---

### Task 2.3: Add Database Index + Foreign Key [M-9]

**File:** `app/db/schema.ts`
**Effort:** 15min

Add index and FK to `profiles`:

```ts
export const profiles = sqliteTable(
  'profiles',
  {
    // ... existing columns
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    idxUserId: index('idx_profiles_user_id').on(table.userId),
  }),
);
```

**Note:** This requires a migration. Use `drizzle-kit push --force` for development.

**Test:** Verify FK constraint prevents orphaned profiles.

---

### Task 2.4: Extract Shared `verifyProfileOwnership` [M-10]

**Files:** `app/server/letters.ts`, `app/server/reading.ts`, new `app/server/helpers.ts`
**Effort:** 15min

Create `app/server/helpers.ts`:

```ts
export async function verifyProfileOwnership(
  db: DbClient,
  userId: string,
  profileId: string,
): Promise<void> {
  const profile = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))
    .then((rows) => rows[0] ?? null);

  if (!profile) {
    throw new ServerFunctionError(ErrorCode.NOT_FOUND, 'ERROR_NOT_FOUND');
  }
}
```

Update imports in `letters.ts` and `reading.ts`.

**Test:** Existing tests should pass without changes (behavior unchanged).

---

### Task 2.5: Fix Auth Store `setChildMode` [Code Quality]

**File:** `app/stores/auth-store.ts` (lines 38-42)
**Effort:** 5min

Update `setChildMode` to set `isAuthenticated`:

```ts
setChildMode: (profileId) =>
  set((state) => ({
    childProfileId: profileId,
    mode: profileId ? 'child' : state.user ? 'parent' : null,
    isAuthenticated: profileId ? true : state.isAuthenticated,
  })),
```

**Test:** Add test verifying `isAuthenticated` is `true` after `setChildMode('some-id')`.

---

### Task 2.6: Reduce Child-Mode Cookie Max-Age [M-5]

**File:** `app/server/auth-fns.ts` (line 256)
**Effort:** 5min

Change from 365 days to 30 days:

```ts
maxAge: 60 * 60 * 24 * 30,  // 30 days (was: 31_536_000 = 365 days)
```

**Test:** Verify cookie `max-age` value in test.

---

### Task 2.7: Add `secure` Flag to Locale Cookie [M-6]

**File:** `app/lib/i18n/set-locale-fn.ts` (lines 14-18)
**Effort:** 5min

Add `secure` flag:

```ts
setCookie('locale', data.locale, {
  maxAge: YEAR_IN_SECONDS,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});
```

**Test:** Verify cookie flags in test.

---

## Phase 3: Low Priority & Polish (1h)

### Task 3.1: Add `prefers-reduced-motion` Media Query [L-9]

**File:** `app/app.css`
**Effort:** 5min

Add to base layer:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Test:** Visual verification only (CSS change).

---

### Task 3.2: Fix Text Muted Contrast Ratio [L-10]

**File:** `app/app.css` (line 17)
**Effort:** 5min

Change `--color-text-muted` from `#8a8a9a` to a darker value that achieves 4.5:1 contrast on `#faf8f5`:

```css
--color-text-muted: #6b6b7b; /* ~4.6:1 contrast on warm background */
```

Or use `#76768a` (~4.5:1).

**Test:** Verify contrast ratio with a contrast checker.

---

### Task 3.3: Add Login/Register Route Tests [Testing Gap]

**Files:** `app/routes/login.test.tsx`, `app/routes/register.test.tsx` (new)
**Effort:** 20min

Test `beforeLoad` redirect behavior:

- Unauthenticated user on `/login` → stays on login
- Authenticated user on `/login` → redirects to `/dashboard`
- Unauthenticated user on `/register` → stays on register
- Authenticated user on `/register` → redirects to `/dashboard`

Pattern: Follow `app/routes/-index.test.tsx` for router mocking approach.

---

### Task 3.4: Add Child-Mode Server Utility Tests [Testing Gap]

**File:** `app/lib/utils/child-mode.server.test.ts` (new)
**Effort:** 15min

Direct unit tests for:

- `signChildModeCookie()` produces valid HMAC signature
- `verifyChildModeCookie()` accepts valid cookie
- `verifyChildModeCookie()` rejects tampered cookie
- `verifyChildModeCookie()` rejects expired cookie
- `verifyChildModeCookie()` rejects cookie with missing fields
- Error thrown when no secret is available (after Task 1.3)

---

### Task 3.5: Minor Code Quality Fixes [Low]

**Effort:** 10min

- [x] Extract magic number `4` in `profiles.ts:56` to `MAX_PROFILES_PER_PARENT` constant
- [x] Extract magic number `5` in `reading.ts:152` to `MIXED_ROW_COUNT` constant (N/A — file only 81 lines after refactor)
- [x] Add comment explaining `sql\`${data.letterId}\``usage in`letters.ts:97,130`
- [x] Update AGENTS.md coverage claim from ">70%" to "80%" to match `vitest.config.ts`

---

### Task 3.6: Verification & Documentation

**Effort:** 15min

- [x] Run full test suite: `pnpm test` — 561 tests passed (65 files)
- [x] Run typecheck: `pnpm typecheck` — clean
- [x] Run lint: `pnpm lint` — 0 errors, 0 warnings
- [x] Run format check: `pnpm format:check` — all files formatted
- [ ] Verify Docker build: `docker compose build && docker compose up` (skipped — no Docker runtime available)
- [ ] Update `conductor/tech-stack.md` if any new patterns introduced (no changes needed)
- [ ] Update `docs/roadmap.md` with T-19 completion (no roadmap file exists)

---

## File Change Summary

| File                                      | Change Type | Tasks         |
| ----------------------------------------- | ----------- | ------------- |
| `docker/server-entry.mjs`                 | Modify      | 1.1, 1.5      |
| `docker/Dockerfile`                       | Modify      | 1.7           |
| `app/server/auth-fns.ts`                  | Modify      | 1.2, 1.4, 2.6 |
| `app/lib/utils/child-mode.server.ts`      | Modify      | 1.3           |
| `app/lib/utils/rate-limit.ts`             | Create      | 1.4           |
| `app/routes/login.tsx`                    | Modify      | 1.6           |
| `app/routes/learn.tsx`                    | Modify      | 2.1           |
| `app/components/child/LetterCard.tsx`     | Modify      | 2.2           |
| `app/db/schema.ts`                        | Modify      | 2.3           |
| `app/server/helpers.ts`                   | Create      | 2.4           |
| `app/server/letters.ts`                   | Modify      | 2.4           |
| `app/server/reading.ts`                   | Modify      | 2.4           |
| `app/stores/auth-store.ts`                | Modify      | 2.5           |
| `app/lib/i18n/set-locale-fn.ts`           | Modify      | 2.7           |
| `app/app.css`                             | Modify      | 3.1, 3.2      |
| `app/routes/login.test.tsx`               | Create      | 3.3           |
| `app/routes/register.test.tsx`            | Create      | 3.3           |
| `app/lib/utils/child-mode.server.test.ts` | Create      | 3.4           |
| `app/server/profiles.ts`                  | Modify      | 3.5           |
| `app/lib/utils/reading.ts`                | Modify      | 3.5           |
| `AGENTS.md`                               | Modify      | 3.5           |
