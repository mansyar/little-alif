# 🗺️ Development Roadmap — Little Alif

This document defines the **Conductor tracks** that will be created during development. Each track is a self-contained work unit with its own spec, plan, and metadata. Tracks are ordered by dependency — a track should not begin until its dependencies are complete.

---

## Track Overview

| ID    | Title                             | Depends On             | Complexity | Est. Effort | Status      |
| ----- | --------------------------------- | ---------------------- | ---------- | ----------- | ----------- |
| T-01  | Project Scaffolding & Config      | —                      | Low        | 1–2h        | ✅ Complete |
| T-02  | Database Schema & Seed Data       | T-01                   | Low        | 2–3h        | ✅ Complete |
| T-03  | Authentication (Better Auth)      | T-02                   | Medium     | 3–5h        | ✅ Complete |
| —     | Code Quality Tooling              | T-01                   | Low        | 1–2h        | ✅ Complete |
| T-04  | i18n Setup                        | T-01                   | Low        | 1–2h        | ✅ Complete |
| T-05  | Parent Dashboard & Child Profiles | T-02, T-03             | Medium     | 4–6h        | ✅ Complete |
| T-06  | Letter Toggle Management          | T-02, T-03, T-05       | Medium     | 3–5h        | ✅ Complete |
| T-07  | Vowel Mode (Harakat)              | T-02                   | Low        | 2–3h        | ✅ Complete |
| T-08  | Child Letter Grid                 | T-06, T-07, T-09       | Medium     | 4–6h        | ✅ Complete |
| T-09  | Audio Service (Web Speech API)    | T-01                   | Low        | 2–3h        | ✅ Complete |
| T-09b | Audio Preloader (Idle Warm-up)    | T-09                   | Low        | 1h          | ✅ Complete |
| T-10  | Reading Practice (Iqra' Mode)     | T-06, T-07, T-08, T-09 | High       | 5–8h        | ✅ Complete |
| T-11  | Child Mode                        | T-03, T-05             | Low        | 2–3h        | ⬜ Pending  |
| T-12  | Polish, Docker & Deployment       | T-10, T-11             | Medium     | 4–6h        | ⬜ Pending  |

**Total estimated effort: ~32–52 hours**

### Implementation Status

| ID    | Title                                  | Status      | Archived Track                                                                   |
| ----- | -------------------------------------- | ----------- | -------------------------------------------------------------------------------- |
| T-01  | Project Scaffolding & Config           | ✅ Complete | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)             |
| T-02  | Database Schema & Seed Data            | ✅ Complete | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)             |
| T-03  | Authentication (Better Auth)           | ✅ Complete | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)             |
| —     | Code Quality (Prettier, ESLint, Husky) | ✅ Complete | [`code-quality_20260601`](../conductor/archive/code-quality_20260601/)           |
| T-04  | i18n Setup                             | ✅ Complete | [`i18n-setup_20260602`](../conductor/archive/i18n-setup_20260602/)               |
| T-05  | Parent Dashboard & Child Profiles      | ✅ Complete | [`parent-dashboard_20260602`](../conductor/archive/parent-dashboard_20260602/)   |
| T-06  | Letter Toggle Management               | ✅ Complete | [`letter-toggles_20260602`](../conductor/archive/letter-toggles_20260602/)       |
| T-07  | Vowel Mode (Harakat)                   | ✅ Complete | [`harakat_20260602`](../conductor/archive/harakat_20260602/)                     |
| T-08  | Child Letter Grid                      | ✅ Complete | [`child-letter-grid_20260603`](../conductor/archive/child-letter-grid_20260603/) |
| T-09  | Audio Service (Web Speech API)         | ✅ Complete | [`audio-service_20260602`](../conductor/archive/audio-service_20260602/)         |
| T-09b | Audio Preloader (Idle Warm-up)         | ✅ Complete | [`audio-preloader_20260602`](../conductor/archive/audio-preloader_20260602/)     |
| T-10  | Reading Practice (Iqra' Mode)          | ✅ Complete | [`reading-practice_20260603`](../conductor/archive/reading-practice_20260603/)   |
| T-11  | Child Mode                             | ⬜ Pending  | —                                                                                |
| T-12  | Polish, Docker & Deployment            | ⬜ Pending  | —                                                                                |

> **Note:** T-01, T-02, and T-03 were combined into a single track `scaffolding_20260531` and delivered together. The `code-quality_20260601` track (Prettier, ESLint v9, Husky, lint-staged) was added as a bonus tooling track not present in the original roadmap — it establishes the pre-commit quality pipeline.

---

## Track Details

### T-01: Project Scaffolding & Config ✅

**Dependencies:** None
**Status:** ✅ Complete (`scaffolding_20260531`)

**Description:**
Initialize the TanStack Start project with all foundational tooling. Set up the project structure, install dependencies, configure Tailwind CSS v4, and verify the dev server runs.

**PRD Ref:** §3 (System Architecture)
**TDD Ref:** §1 (Project Structure)

**Key Deliverables (all delivered):**

- [x] `pnpm create tanstack-app` with React + TypeScript + Vite
- [x] Tailwind CSS v4 configuration with design tokens (Cairo + Nunito fonts)
- [x] Radix UI primitives installed (`@radix-ui/react-switch`, `dialog`, `alert-dialog`, `radio-group`)
- [x] Lucide React icons installed
- [x] Zustand store scaffolding (`app/stores/`) — auth-store, child-store, ui-store
- [x] Drizzle ORM + SQLite configuration (`app/db/`)
- [x] Vite config, `tsconfig.json`, `drizzle.config.ts`
- [x] `.env.example` with required environment variables
- [x] Folder structure matching TDD §1
- [x] `app/lib/utils/cn.ts` for Tailwind class merging (clsx + tailwind-merge)
- [x] Tests: 21/21 passing for scaffolding verification

**Key Decisions:**

- Use `pnpm` as package manager (already set up)
- TanStack Start router (`@tanstack/react-router`) for file-based routing
- Server functions (`createServerFn`) for all data mutations
- `app/lib/utils/cn.ts` for Tailwind class merging (clsx + tailwind-merge pattern)

**Verification (all passing):**

- `pnpm dev` starts without errors
- `/` route renders a placeholder page
- Tailwind classes apply correctly
- Drizzle can introspect the database

---

### T-02: Database Schema & Seed Data ✅

**Dependencies:** T-01
**Status:** ✅ Complete (`scaffolding_20260531`)

**Description:**
Define all Drizzle schema files, apply migrations, and seed the 28-letter master table. Better Auth manages its own tables — only application tables need manual creation.

**PRD Ref:** §7 (Database Schema)
**TDD Ref:** §1 (Project Structure — `app/db/`), §6 (Schema Definitions)

**Key Deliverables (all delivered):**

- [x] `app/db/schema.ts` — Drizzle schemas for `profiles`, `letters`, `letter_toggles`
- [x] `app/db/index.ts` — DB client initialization (libSQL driver)
- [x] `app/db/seed.ts` — Seed script for 28 letters with character, display_order, and audio_file paths
- [x] Migration applied (via `drizzle-kit push`)
- [x] `drizzle.config.ts` pointing to the SQLite file
- [x] Tests: 36/36 passing for database layer

**Zod Ref:** `app/lib/validations/profiles.ts`, `app/lib/validations/letters.ts`

**Key Decisions:**

- `letters.audio_files` stored as JSON string (TEXT column) — map of mode → file path
- Profile `vowel_mode` defaults to `'fathah'` (TEXT)
- `letter_toggles.is_visible` defaults to 0 (OFF) — parent explicitly enables each letter
- Timestamps use ISO 8601 strings (SQLite has no native datetime)

**Edge Cases:**

- Profile deletion must cascade to `letter_toggles` (Drizzle `onDelete: 'cascade'`)
- Letter IDs must match `z.enum()` exactly — any rename requires a migration
- Seed script is idempotent (checks for existing data before inserting)

**Verification (all passing):**

- `pnpm drizzle-kit push` creates all tables
- `pnpm tsx app/db/seed.ts` inserts 28 letters
- DB file contains correct record count

---

### T-03: Authentication (Better Auth) ✅

**Dependencies:** T-02
**Status:** ✅ Complete (`scaffolding_20260531`)

**Description:**
Integrate Better Auth for email/password authentication. Configure session management, CSRF protection, and the auth middleware chain for route protection.

**PRD Ref:** §4 — Module 1 (Parent Authentication)
**TDD Ref:** §2 (Route Design — middleware chain), §3 (Auth Server Functions)

**Key Deliverables (all delivered):**

- [x] Better Auth Drizzle adapter configuration
- [x] `app/server/auth.ts` — Better Auth singleton with email/password + 30-day session
- [x] `app/server/auth-fns.ts` — Server functions: `registerFn`, `loginFn`, `logoutFn`, `validateSessionFn`
- [x] Auth middleware in router `beforeLoad` (checks session, injects context)
- [x] `app/routes/login.tsx` — Login form
- [x] `app/routes/register.tsx` — Registration form
- [x] Session cookie configuration (HttpOnly, Secure, SameSite=Lax, 30-day expiry)
- [x] CSRF protection via Better Auth middleware
- [x] Landing page with auth gate (`app/routes/index.tsx`)
- [x] `app/lib/validations/auth.ts` — Zod schemas for login/register
- [x] Tests: 59/59 passing (auth + schema + middleware)

**Key Decisions:**

- Single parent account per deployment (Phase 1 constraint — Better Auth supports multi-user but Phase 1 only uses one)
- Better Auth's built-in session management vs manual JWT — Better Auth handles this automatically
- CSRF middleware applied to all `/dashboard` and `/parent/*` routes

**Edge Cases:**

- Session expiry mid-session → redirect to login with a toast
- Registration with existing email → return validation error
- Both JWT and child-mode cookie present → child mode takes precedence for `/learn` routes
- Server-side session validation on every protected server function

**Verification (all passing):**

- Can register a new account
- Can log in with valid credentials
- Invalid credentials return proper error
- Protected routes redirect to `/login` when unauthenticated
- Session persists across page reloads
- CSRF token present in mutation requests

---

### T-03b: Code Quality Tooling (Prettier, ESLint, Husky) ✅

**Dependencies:** T-01
**Status:** ✅ Complete (`code-quality_20260601`)

**Description:**
Establish a Git pre-commit hook pipeline that enforces TypeScript type-checking, ESLint linting, and Prettier formatting on staged files before commits can be created. This track was added as a bonus tooling track not present in the original roadmap.

**PRD Ref:** None (developer tooling)
**TDD Ref:** §14 (Code Quality & Tooling)

**Key Deliverables (all delivered):**

- [x] **Prettier:** `.prettierrc` (printWidth: 100, semi, singleQuote, tabWidth: 2), `.prettierignore`, `format`/`format:check` scripts
- [x] **ESLint v9:** Flat config (`eslint.config.js`) with TypeScript strict + stylistic rules, React + React-Hooks plugins, `lint`/`lint:fix` scripts
- [x] **Husky v9:** `.husky/pre-commit` hook running `pnpm lint-staged` + `pnpm typecheck`
- [x] **lint-staged:** Runs `eslint --fix`, `prettier --write`, `tsc --noEmit` on staged `*.{ts,tsx}`; `prettier --write` on `*.{json,md,css}`
- [x] **Meta-tests:** `app/lib/tooling/quality-hooks.test.ts` validates all tooling configs
- [x] **Documentation:** Updated `conductor/workflow.md` and `conductor/tech-stack.md`

**Key Decisions:**

- `tsc --noEmit` runs outside lint-staged (full-project check, not per-file)
- Initial ESLint rules set to `warn` to avoid blocking on pre-existing style debt (can tighten later)
- `git commit --no-verify` escape hatch documented for emergencies
- Pre-commit pipeline completes in <10s for typical commits (1–5 files)

**Verification (all passing):**

- Prettier formats staged files on commit
- ESLint violations reject commits (after auto-fix attempted)
- TypeScript type errors reject commits
- `git commit --no-verify` bypasses all checks
- All 59 scaffolding tests + meta-tests pass

---

### T-04: i18n Setup ✅

**Dependencies:** T-01
**Status:** ✅ Complete ([`i18n-setup_20260602`](../conductor/archive/i18n-setup_20260602/))

**Description:**
Initialize typesafe-i18n v5 with English and Indonesian locales. Generate TypeScript types so all translation keys are compile-time checked. Parent-facing text in login and register pages is fully localized.

**PRD Ref:** §4 — REQ-4.6 (Bilingual UI)
**TDD Ref:** §11 (Bilingual UI Implementation)

**Key Deliverables (all delivered):**

- `typesafe-i18n@^5.26.0` installed as dev dependency, `.typesafe-i18n.json` with minimal config (auto-detects adapter + locales)
- `app/lib/i18n/en/index.ts` — 27 English strings (`satisfies BaseTranslation`)
- `app/lib/i18n/id/index.ts` — 27 Indonesian strings (`satisfies Translation`)
- Generated type files: `i18n-types.ts`, `i18n-util.ts`, `i18n-util.sync.ts`, `i18n-util.async.ts`, `i18n-react.tsx`
- `app/lib/i18n/index.ts` — i18n init, locale detection, re-exports
- `app/lib/i18n/get-server-locale.ts` — SSR cookie-based locale detection
- `app/lib/i18n/set-locale-fn.ts` — Zod-validated server function for locale cookie (1-year expiry, sameSite lax)
- `app/components/parent/LanguageToggle.tsx` — Toggle button using `useI18nContext`, toggles between EN/ID
- `app/routes/__root.tsx` — Wrapped with `<I18nClient locale="en">` provider
- `app/routes/login.tsx` — All hardcoded strings replaced with `LL.*()`, LanguageToggle added
- `app/routes/register.tsx` — Same pattern as login
- ESLint + Prettier config updated to ignore auto-generated i18n files
- Generated files have `/* eslint-disable */` headers

**Key Decisions:**

- typesafe-i18n v5 auto-detects adapter (`react`) and locales (`['en', 'id']`) — no explicit config needed
- Locale persisted in cookie (not localStorage) for SSR access
- Set locale via server function (`set-locale-fn.ts`) rather than direct `document.cookie` — validates input via Zod
- Cookie: 1-year expiry, `sameSite: 'lax'`, accessible to both server and client
- Translation key naming: `SCREAMING_SNAKE_CASE` (typesafe-i18n convention)
- 27 keys covering: auth (login/register), dashboard, child mode, profile, locale switch, error messages
- Child UI does not use i18n (icons + letter glyphs only)
- `__root.tsx` hardcodes `locale="en"` — dynamic SSR locale detection deferred to follow-up

**Translation Keys (27 total):**

- Auth: `LOGIN_TITLE`, `LOGIN_SUBTITLE`, `LOGIN_EMAIL`, `LOGIN_PASSWORD`, `LOGIN_SUBMIT`, `LOGIN_SUBMITTING`, `LOGIN_SIGNUP_LINK`
- Register: `REGISTER_TITLE`, `REGISTER_SUBTITLE`, `REGISTER_SUBMIT`, `REGISTER_SUBMITTING`, `REGISTER_PASSWORD_HINT`, `REGISTER_SIGNIN_LINK`
- Dashboard: `DASHBOARD_TITLE`, `DASHBOARD_ADD_CHILD`, `DASHBOARD_NO_CHILDREN`
- Letters: `LETTERS_SHOW`, `LETTERS_HIDE`
- Child Mode: `CHILDMODE_ENABLE`, `CHILDMODE_DISABLE`, `CHILDMODE_ACTIVE`
- Profile: `PROFILE_NAME`, `PROFILE_AVATAR`, `PROFILE_SAVE`, `PROFILE_DELETE`, `PROFILE_DELETE_CONFIRM`
- Locale: `LOCALE_SWITCH`
- Errors: `ERROR_GENERIC`, `ERROR_INVALID_EMAIL`, `ERROR_SHORT_PASSWORD`

**Edge Cases:**

- Missing Indonesian key → falls back to English (typesafe-i18n built-in behavior)
- Invalid locale cookie value → defaults to `en` (fallback in `getServerLocale`)
- Auto-generated i18n files ignored by ESLint + Prettier — no formatting conflicts on regeneration

**Verification (all passing):**

- `pnpm i18n` generates type files without errors
- Mistyping `LL.LOGIN_TITLE` as `LL.LOGIN_TITL` causes a compile error
- Language toggle switches EN ↔ ID instantly (client-side, no server round-trip)
- Locale persists in cookie across page reloads (1-year expiry)
- Login and register pages display correct localized text
- 103/103 tests pass, typecheck clean, lint clean
- Coverage: 84.16%

---

### T-05: Parent Dashboard & Child Profiles ✅

**Dependencies:** T-02, T-03
**Status:** ✅ Complete ([`parent-dashboard_20260602`](../conductor/archive/parent-dashboard_20260602/))

**Description:**
Build the parent dashboard showing child profile cards. Implement profile CRUD (add, edit, delete) with avatar selection, validated via Zod schemas.

**PRD Ref:** §4 — Module 2 (Child Profiles), REQ-4.1 (Dashboard)
**TDD Ref:** §2 (Route Design — `/dashboard`), §3 (Profile Server Functions), §4 (Profile Zod Schemas)

**Key Deliverables (all delivered):**

- `app/routes/dashboard.tsx` — Authenticated dashboard page with sidebar layout, locale toggle, logout, and profile CRUD
- `app/components/parent/ProfileList.tsx` — Profile cards with inline avatar SVGs + name + "X/28 introduced" count + action buttons
- `app/components/parent/ProfileEditor.tsx` — Add/edit profile (Radix Dialog) with name input, AvatarPicker, client-side Zod validation
- `app/components/parent/AvatarPicker.tsx` — Avatar selection grid (Radix Radio Group) with 8 themed inline SVG avatars
- `app/components/ui/ConfirmDialog.tsx` — Reusable delete confirmation (Radix AlertDialog) with danger/default variants
- `app/components/parent/avatars.tsx` — 8 inline SVG components (AlifLamp, BaBoat, TaTable, TsaButterfly, JimMountain, HaJar, KhoHat, DalBook) + AVATAR_MAP lookup
- `app/server/profiles.ts` — `listProfilesFn`, `createProfileFn`, `updateProfileFn`, `deleteProfileFn` — pure functions + server function wrappers
- `app/lib/validations/profiles.ts` — `createProfileSchema`, `updateProfileSchema`, `deleteProfileSchema`
- `__root.tsx` — Wrapped with `QueryClientProvider` for TanStack Query
- `vitest-setup.ts` — ResizeObserver polyfill for Radix Dialog jsdom tests
- Profile CRUD tests: 6 test files with 44 new tests covering all CRUD operations, accessibility, and edge cases
- i18n keys added: `DASHBOARD_SIGN_OUT`, `DASHBOARD_SIGNING_OUT`, `PROFILE_EDIT`, `PROFILE_CANCEL`, `PROFILE_ADD_TITLE`, `PROFILE_EDIT_TITLE`, `PROFILE_MANAGE_LETTERS`, `PROFILE_LETTERS_LABEL`

**TDD Ref:** §3 (Server Functions — full signatures), §4 (Zod Schemas)

**Key Decisions:**

- 8 themed avatars as inline SVG components (no network requests)
- Profile creation auto-seeds 28 `letter_toggles` rows (all OFF)
- Max 4 profiles enforced server-side (Zod + DB count query)
- Pure helper functions (`listProfiles`, `createProfile`, `updateProfile`, `deleteProfile`) accept `db` parameter for testability
- Server function wrappers handle session validation + error handling
- TanStack Query for client-side data fetching (loading, error, success states)
- Avatar SVGs set `viewBox="0 0 64 64"` for consistent sizing

**Edge Cases:**

- Attempt to create 5th profile → throws error with i18n message
- Delete profile → confirm dialog with danger variant (Radix AlertDialog)
- Edit with no changes → returns existing profile as-is
- Missing avatar in AVATAR_MAP → renders `?` fallback
- Server error → error state with retry button using `refetch()`
- Loading state → spinner animation

**Verification (all passing):**

- 152 tests passing across 22 test files
- Can create, view, edit, and delete child profiles
- Avatar selection shows correct inline SVGs
- Max 4 profiles enforced server-side
- Deleted profile cascades to letter_toggles
- Server functions reject unauthenticated requests
- ProfileEditor shows field-level Zod validation errors
- Pre-commit pipeline passes: ESLint, Prettier, TypeScript all clean

---

### T-06: Letter Toggle Management ✅

**Dependencies:** T-02, T-03, T-05
**Status:** ✅ Complete ([`letter-toggles_20260602`](../conductor/archive/letter-toggles_20260602/))

**Description:**
Implement the per-child letter toggle grid on the parent dashboard. Each letter has an ON/OFF switch. Toggle state persists to the database.

**PRD Ref:** §4 — Module 4 (Parent Dashboard — Letter Management), REQ-4.2 through REQ-4.5
**TDD Ref:** §2 (Route Design), §3 (Letter Server Functions), §4 (Letter Zod Schemas)

**Key Deliverables (all delivered):**

- [x] `app/lib/validations/letters.ts` — Zod schemas: `toggleLetterSchema`, `getVisibleLettersSchema`, `bulkToggleLettersSchema`
- [x] `app/server/letters.ts` — Pure helper functions + server function wrappers: `getVisibleLettersFn`, `toggleLetterFn`, `bulkToggleLettersFn`
- [x] `app/components/parent/LetterToggleGrid.tsx` — 28-letter grid with Radix Switch per letter, Show All/Hide All bulk actions, error banner with 5s auto-dismiss
- [x] `app/lib/utils/useDebouncedCallback.ts` — 300ms debounce for rapid toggling
- [x] Dashboard integration: accordion expand/collapse inline toggle grid per profile card
- [x] Cache invalidation: `['visibleLetters']` + `['profiles']` invalidated on every mutation
- [x] Server function tests: 9 tests (letters.test.ts)
- [x] Component tests: 8 tests (LetterToggleGrid.test.tsx)
- [x] Integration tests: 4 tests (letter-toggle-flow.test.ts)
- [x] Debounce hook tests: 5 tests (useDebouncedCallback.test.ts)
- [x] Existing ProfileList tests updated to mock letter server functions
- [x] 178/178 tests passing across 26 test files

**TDD Ref:** §3 (Server Functions — full signatures), §4 (Letter Zod Schemas)

**Key Decisions:**

- Toggle state reads from `letter_toggles` table, not a client-side array
- ON/OFF switch uses Radix UI Switch (accessible by default)
- Toggle mutations use `createServerFn` with POST method
- Summary view on profile card shows ON count (e.g., "5/28 introduced")
- Pure helper functions + server function wrappers pattern (matching existing profile.ts pattern)
- TanStack Query for client-side data fetching with cache invalidation on mutations
- Accordion pattern: only one profile's toggle grid expanded at a time

**Edge Cases (all covered):**

- Rapid toggling → debounce requests (300ms) — verified with test
- Network error during toggle → show error banner with 5s auto-dismiss — verified with test
- Switch is disabled while server function is in flight — verified with test
- Cross-user isolation: User B cannot toggle/read User A's profile — verified with integration test
- Profile card introducedCount stays in sync after individual + bulk toggles — verified with integration test

**Verification (all passing):**

- Letters render in correct order (1–28)
- Toggle ON → letter visible in child grid (verify across sessions)
- Toggle OFF → letter disappears from child grid
- Server function rejects toggles for non-owned profiles
- Bulk toggle (all ON / all OFF) works correctly
- 178/178 tests pass, `pnpm typecheck` clean, `pnpm lint` clean
- Coverage: 89.2% lines (all new files > 84%)

---

### T-07: Vowel Mode (Harakat) ✅

**Dependencies:** T-02
**Status:** ✅ Complete ([`harakat_20260602`](../conductor/archive/harakat_20260602/))

**Description:**
Implement Unicode combining diacritics for dynamic vowel rendering. Build `composeLetter()` with precomposed fallbacks for 7 non-connecting letters. Add parent harakat selector and child harakat bar.

**PRD Ref:** §4 — Module 7 (Harakat), §6 — DD-1, DD-2, DD-4, DD-5, DD-6
**TDD Ref:** §5 (Harakat Composer — `app/lib/utils/harakat.ts`)

**Key Deliverables (all delivered):**

- [x] `app/lib/utils/harakat.ts` — `composeLetter()` pure function, `VowelMode` type, `HARAKAT_COMBINING` map, `NON_CONNECTING` precomposed fallbacks (7 letters: ا و ي ر ز د ذ)
- [x] `app/lib/utils/harakat.test.ts` — 14 unit tests covering all modes, connecting/non-connecting letters, and edge cases
- [x] `app/stores/ui-store.ts` — `currentHarakat` state (default `'fathah'`) + `setHarakat()` action
- [x] `app/stores/ui-store.test.ts` — 5 new tests for harakat state management
- [x] `app/components/parent/HarakatSelector.tsx` — Radix radio group with 4 options, mutation with loading/error states, i18n labels
- [x] `app/components/parent/HarakatSelector.test.tsx` — 4 tests covering rendering, active state, and mutation calls
- [x] `app/components/child/ChildHarakatBar.tsx` — 4-button bar (44px touch targets), aria-pressed for accessibility, uses ui-store
- [x] `app/components/child/ChildHarakatBar.test.tsx` — 4 tests covering rendering, click updates store, visual active state
- [x] `app/components/parent/LetterToggleGrid.tsx` — Integrated HarakatSelector with `vowelMode` prop
- [x] `app/components/parent/ProfileList.tsx` — Passes `vowelMode` from profile data to LetterToggleGrid
- [x] `app/lib/i18n/en/index.ts` + `id/index.ts` + `i18n-types.ts` — Harakat label keys (HARAKAT_PLAIN, HARAKAT_FATHAH, HARAKAT_KASRAH, HARAKAT_DAMMAH)
- [x] 205/205 tests passing, typecheck clean, lint clean
- [x] Review fixes applied: Unicode combining order corrected (Alif+Kasrah), i18n integration completed

**Key Decisions (from DD-1 through DD-6):**

- DD-1: Alif (ا) gets no special treatment despite being a pure vowel.
- DD-2: ز (zai) included in non-connecting exception list alongside ر, د, ذ.
- DD-4: Cairo font preloaded aggressively to minimize FOUT/FOIT.
- DD-5: Sukun and tashdid are Phase 2 (out of scope).
- DD-6: `composeLetter()` is a pure function returning a string, not a React component.

**Edge Cases (all covered):**

- Font not loaded → diacritics may render as tofu (boxes). Mitigated by aggressive preload + `font-display: block`
- Child changes vowel mode → grid re-renders all letter glyphs. Parent's global setting is preserved in DB
- Vowel mode change on child side is temporary (session-only, does not update DB)
- Mutation error → error banner with 5s auto-dismiss
- Unicode combining mark ordering: Alif+Kasrah corrected to standard ordering

**Verification (all passing):**

- `composeLetter('ب', 'fathah')` returns `'بَ'` (Unicode combining)
- `composeLetter('ر', 'kasrah')` returns `'رِ'` (precomposed fallback)
- All 7 exception letters render correctly with all 3 harakat modes
- Font preloads before paint (check Network tab)
- 205/205 tests pass, 29 test files
- `pnpm typecheck` clean, `pnpm lint` clean

---

### T-08: Child Letter Grid ✅

**Dependencies:** T-06, T-07, T-09
**Status:** ✅ Complete ([`child-letter-grid_20260603`](../conductor/archive/child-letter-grid_20260603/))

**Description:**
Build the child-facing letter grid showing only parent-introduced letters with dynamic harakat rendering. Each letter card is a large tappable target that plays audio.

**PRD Ref:** §4 — Module 5 (Child Letter Grid), Module 6 (Audio Engine)
**TDD Ref:** §2 (Route Design — `/learn`)

**Key Deliverables (all delivered):**

- [x] `getActiveProfileFn` — new server function returning `{ id, name, avatar, vowelMode }` for `/learn`
- [x] `getActiveProfileSchema` — Zod schema in `app/lib/validations/profiles.ts`
- [x] `app/routes/learn.tsx` — Real grid replaces the placeholder
- [x] `app/components/child/ProfileBadge.tsx` — Active child avatar + name (AVATAR_MAP + Lucide `User` fallback)
- [x] `app/components/child/EmptyState.tsx` — Icon-only (Lucide `BookOpen`, ~96px, `py-24`) — no text per REQ-5.8
- [x] `app/components/child/LetterCard.tsx` — `<button>` with composed glyph, 28 pastel backgrounds, `min-h-[64px] min-w-[64px]`, `active:scale-95`
- [x] `app/components/child/LetterDetail.tsx` — Full-screen overlay (`fixed inset-0 z-50 bg-background-warm/95`, `text-9xl`)
- [x] `app/components/child/LetterGrid.tsx` — Orchestrator with `grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-3 p-4`
- [x] "Reading Practice" button — `disabled={visibleLetters.length < 3}` (DD-3)
- [x] Loading + error states in route (LoadingSpinner + retry)
- [x] Tests: 5 component test files (ProfileBadge 7, EmptyState 4, LetterCard 9, LetterDetail 6, LetterGrid 4) + 4 server-side tests in `profiles.test.ts` + 7 route tests
- [x] 278/278 tests pass, `pnpm typecheck` clean, `pnpm lint` clean, `pnpm format:check` clean

**PRD Ref:** REQ-5.1 through REQ-5.8 — all satisfied

**Key Decisions (KD-1 through KD-6 from spec):**

- KD-1: "Reading Practice" label kept literal (not icon-only) — disabled state aids parent co-use scenarios.
- KD-2: `getActiveProfileFn` lives in `app/server/profiles.ts` next to existing profile server functions, reuses `validateSessionFn` and the `verifyProfileOwnership` shape.
- KD-3: 28 pastel backgrounds defined inline as `LETTER_BG: Record<LetterId, string>` in `LetterCard.tsx` — no design tokens file.
- KD-4: `LetterDetail` auto-dismiss is honest — driven by the `audioEngine.speak()` Promise's `.finally()`, not a separate timeout.
- KD-5: Tapping the same letter during playback restarts the utterance (T-09 cancel-on-new-speak).
- KD-6: `useUiStore.selectedLetterId` is the overlay's open/closed flag — no new state.
- Harakat re-render uses `useUiStore.currentHarakat` read at render time, no refetch on vowel change (FR-9).

**Edge Cases (all covered by tests):**

- Zero visible letters → `EmptyState` (icon-only, no text)
- Child changes vowel mode → all cards recompose via `composeLetter()`, no refetch
- `getActiveProfileFn` rejects wrong-owner / missing profile / invalid UUID
- Rapid card taps → previous utterance cancelled, overlay re-targeted to new letter
- Speak promise rejection → `.finally()` still clears the overlay
- Missing `profileId` in auth store → "Select a child" message + back link (no crash)
- Loading state → `LoadingSpinner`
- Error state → inline message + retry button (`refetch()`)
- Less than 3 visible letters → "Reading Practice" button disabled

**Verification (all passing):**

- `/learn` shows only `isVisible === true` letters from `getVisibleLettersFn`
- Letters render in `displayOrder` (1–28)
- Tap a card → composed glyph pronounced via `audioEngine.speak(letter.character, currentHarakat)`
- Overlay opens immediately on tap, auto-dismisses on `onend` (or cancellation)
- Vowel mode toggle on `ChildHarakatBar` re-renders all cards without refetching
- Zero visible letters → `EmptyState` renders
- "Reading Practice" button: disabled < 3 letters, enabled ≥ 3
- Touch targets ≥ 64×64dp; tested in portrait and landscape
- 278/278 tests pass, typecheck/lint/format clean
- Manual browser verification approved (Phase 3: "Approve & finalize")
- Code review completed — 1 Medium cleanup applied, 2 Low items noted

---

### T-09: Audio Service (Web Speech API) ✅

**Dependencies:** T-01
**Status:** ✅ Complete ([`audio-service_20260602`](../conductor/archive/audio-service_20260602/))

**Description:**
Implement the audio service using the Web Speech API (`SpeechSynthesis`). A singleton `AudioEngine` class manages voice selection (prefers Arabic `ar-SA` > `ar-XA` > any `ar-*` > default), utterance lifecycle (cancel-on-new-speak, Promise-based completion), and graceful degradation (silent no-op when SpeechSynthesis is unavailable).

**PRD Ref:** §4 — Module 6 (Audio Engine), REQ-6.1 through REQ-6.5
**TDD Ref:** §7 (Audio Architecture — updated for Web Speech API)

**Key Deliverables (all delivered):**

- `app/lib/audio/audio-engine.ts` — Singleton class with adapter pattern, 183 lines
- `app/lib/audio/audio-engine.test.ts` — 22 unit tests covering voice selection, speak behavior, cancel, graceful degradation, dispose
- `SpeechSynthesisAdapter` interface — injectable/mockable for unit tests in Node.js
- `createBrowserAdapter()` factory — wraps `window.speechSynthesis`
- `audioEngine` singleton instance — module-level export, no React context needed
- Voice selection: `ar-SA` > `ar-XA` > any `ar-*` > browser default (cached after first scan)
- `speak(letterChar, vowelMode): Promise<void>` — uses `composeLetter()` for pronunciation text
- `utterance.rate = 0.85` — slower for children
- Cancel-on-new-speak — previous utterance cancelled before new one starts
- `onvoiceschanged` wired to `resetVoiceScan()` — handles async voice loading in Chrome
- `resetVoiceScan()` — allows re-scanning available voices
- `cancel()` — stops current utterance, resolves pending promise
- `dispose()` — tears down engine, sets `isSupported = false`
- All 227 project tests pass, typecheck clean, lint clean

**Key Decisions:**

- Web Speech API chosen over pre-recorded MP3 files (TTS quality for isolated letters is acceptable; zero file management; instant setup)
- Singleton pattern (not React context) — matches existing functional pattern used by `harakat.ts`
- Adapter pattern enables full unit test coverage without a browser
- Promise-based `speak()` resolves on `onend` event — enables sequential playback
- No `init()` call needed — constructor handles initialization (SpeechSynthesis has no autoplay restrictions)
- Voice cache on first call avoids re-scanning `getVoices()` on every tap
- `onvoiceschanged` handler set in constructor — handles async voice loading in Chrome
- Style guide fixes applied: `_adapter` renamed to `adapter`, `currentResolve` tracks pending promises (no leak)

**Edge Cases (all covered by tests):**

- SpeechSynthesis unavailable → `speak()` resolves silently, `isSupported` returns `false`
- Rapid successive speak calls → previous utterance cancelled, Promise resolves (no hanging promises)
- `onerror` fires → Promise resolves silently (no throw)
- `cancel()` called mid-utterance → utterance stops, Promise resolves
- `dispose()` called → subsequent `speak()` resolves silently
- No Arabic voice available → falls back to browser default
- `resetVoiceScan()` allows re-scanning after `onvoiceschanged`

**Verification (all passing):**

- `AudioEngine.speak('ب', 'fathah')` → pronounces "ba" using Arabic voice
- `AudioEngine.speak('ب', 'kasrah')` → pronounces "bi" using Arabic voice
- `AudioEngine.speak('ب', 'dammah')` → pronounces "bu" using Arabic voice
- Rapid successive `speak()` calls → previous utterance cancelled, last one plays
- Voice selection prefers `ar-SA` > `ar-XA` > any `ar` > default
- `AudioEngine.isSupported` is `false` when SpeechSynthesis is unavailable
- `speak()` resolves silently when SpeechSynthesis is unavailable
- Idle preloader warms up engine on `/learn` route mount (see T-09b)
- 29 audio tests pass (22 engine + 7 preloader), typecheck clean, lint clean

---

### T-09b: Audio Preloader (Idle Warm-up) ✅

**Dependencies:** T-09
**Status:** ✅ Complete ([`audio-preloader_20260602`](../conductor/archive/audio-preloader_20260602/))

**Description:**
Implement idle-time voice preloading to warm up the SpeechSynthesis engine. On idle (via `requestIdleCallback`), call `speechSynthesis.speak()` with an empty/short utterance to reduce first-utterance latency from ~500ms to near-instant. This is Phase 2 of the original T-09 plan that was deferred.

**PRD Ref:** §4 — Module 6 (Audio Engine), REQ-6.6
**TDD Ref:** §7 (Audio Architecture — Idle Preloading)

**Key Deliverables:**

- `app/lib/audio/preloader.ts` — Preloader module
- `preloadOnIdle(audioEngine)` — Uses `requestIdleCallback` with `setTimeout` fallback
- Empty utterance with cached voice to warm up the engine
- Idempotent guard — prevents double warm-up
- Non-blocking — returns immediately, no hanging promises
- `app/lib/audio/__tests__/preloader.test.ts` — Unit tests:
  - Calls `speechSynthesis.speak()` with empty utterance
  - Idempotent (calling twice does not trigger double warm-up)
  - Non-blocking (returns immediately)

**Key Decisions:**

- Uses `requestIdleCallback` with `setTimeout(..., 1000)` fallback for browsers that don't support it
- Single empty utterance is sufficient to warm up the engine — no need for multiple utterances
- Internal guard boolean prevents double warm-up even if called multiple times
- Non-blocking by design — the preloader does not return a promise
- Voice should already be cached by AudioEngine before preloader runs

**Edge Cases:**

- `requestIdleCallback` not supported → `setTimeout(..., 1000)` fallback
- `AudioEngine` not yet initialized → preloader silently skips
- Preloader called while utterance is playing → guard prevents interference
- Preloader called multiple times → second call is a no-op

**Verification:**

- `preloadOnIdle(engine)` triggers `speechSynthesis.speak()` with empty utterance
- Calling `preloadOnIdle()` twice only triggers one warm-up
- Function returns immediately (no async/await)
- First utterance latency after preload < 150ms
- No side effects during normal playback

---

### T-10: Reading Practice (Iqra' Mode) ✅

**Dependencies:** T-06, T-07, T-08, T-09
**Status:** ✅ Complete ([`reading-practice_20260603`](../conductor/archive/reading-practice_20260603/))

**Description:**
Implement the reading practice screen with dynamic letter groups, systematic + randomized rows, navigation pills, and shuffle support.

**PRD Ref:** §4 — Module 8 (Reading Practice), DD-3 (3-letter minimum gate)
**TDD Ref:** §5 (Reading Practice — `app/lib/utils/reading.ts`)

**Key Deliverables (all delivered):**

- `app/routes/learn/reading.tsx` — Reading practice page with per-letter random harakat, harakat bar clears random mode
- `app/components/child/reading/ReadingGrid.tsx` — 6-row grid (1 systematic + 5 shuffled), per-cell random harakat support
- `app/components/child/reading/ReadingCell.tsx` — Single tappable cell with tap highlight animation
- `app/components/child/reading/GroupHeader.tsx` — Shows the 3 Arabic glyphs of the current group
- `app/components/child/reading/GroupPills.tsx` — Pill navigation for groups, highlights active
- `app/components/child/reading/ReadingActions.tsx` — Randomize / Shuffle / Next Group / Done buttons
- `app/lib/utils/reading.ts` — `generateReadingGroups()`, `generatePracticeRow()`, `generatePracticeGrid()`
- `app/server/reading.ts` — `getReadingDataFn` server function
- `app/lib/utils/reading.test.ts` — Unit tests for utility functions
- `app/components/child/reading/*.test.tsx` — Component tests for all 5 reading components

**TDD Ref:** §3 (Reading server function), §5 (Reading utilities — full implementation details)

**Grid Structure (per group):**

- Rows 1–6: 1 cell per letter (N cells for an N-letter group). Row 1 is systematic (display order), rows 2–6 are independently shuffled (Fisher–Yates).
- Normal mode: all cells composed with the current harakat from the harakat bar.
- Randomize mode: each cell gets an independent random vowel (fathah/kasrah/dammah). Cleared when the harakat bar is changed or group is switched.

**Key Decisions:**

- 3-letter minimum gate (DD-3) — button disabled if fewer than 3 letters toggled
- Groups generated on the client from server data (letters + vowel mode), not pre-computed
- Cell tap plays audio via same AudioService used by the letter grid
- Green flash on tap to confirm interaction
- Per-letter random harakat replaces the original 3-harakat-per-cell design — simpler grid, randomized practice
- Randomize mode cleared on harakat bar change (Zustand subscribe pattern) or group switch
- Zustand `subscribe` used instead of `useEffect` setState to satisfy ESLint `set-state-in-effect` rule

**Edge Cases (all handled):**

- Exactly 3 letters → single group, Next Group wraps to same group
- 4–5 letters → last group has 1–2 letters (renders fewer cells, still functional)
- 6+ letters → multiple full groups, all navigable via pills
- Empty visible letters → back to /learn with "Select a child" message
- Vowel mode changed during reading session → grid re-renders, random mode cleared
- Randomize + Shuffle sequence works correctly

**Verification (all passing):**

- Groups of 3 generated from toggled-on letters, sequential navigation works
- Row 1 is systematic, rows 2–6 are shuffled differently each time
- Randomize assigns per-cell random vowels across all rows
- Shuffle re-randomizes rows 2–6 without clearing random harakat mode
- Next Group wraps around from last to first
- < 3 letters → button disabled on /learn parent dashboard
- Harakat bar change → random mode cleared, grid re-renders
- 365/365 tests pass, typecheck/lint/format clean
- Code review completed — applied fixes (GroupHeader text size, back link, spec update, ESLint refactor)

---

### T-11: Child Mode

**Dependencies:** T-03, T-05

**Description:**
Implement cookie-based child mode that bypasses auth. One profile per device. Parent enables from dashboard, child auto-detects on next visit.

**PRD Ref:** §4 — Module 3 (Child Mode)
**TDD Ref:** §2 (Child Mode Cookie spec), §3 (enableChildModeFn, disableChildModeFn)

**Key Deliverables:**

- Child mode cookie: signed `{ profileId, name, avatar }`, HttpOnly: false, Secure: true in prod
- `enableChildModeFn({ profileId })` — Sets cookie, redirects to `/learn`
- `disableChildModeFn()` — Clears cookie, redirects to `/dashboard`
- `app/routes/index.tsx` — Landing page checks child-mode cookie → redirects to `/learn` or `/login`
- `app/components/parent/ChildModeToggle.tsx` — Enable/disable toggle per profile
- Router middleware: `/learn` route accepts either JWT or child-mode cookie

**Key Decisions:**

- Cookie is NOT HttpOnly (JS needs to read profile info for UI hints) — signed to prevent tampering
- Only one profile per device in child mode (setting new clears old)
- Child mode has no expiry (persists until parent logs out or explicitly disables)
- Child mode cookie is cleared on parent logout

**Edge Cases:**

- Child mode cookie expired/malformed/signed incorrectly → treat as no cookie → redirect to `/login`
- Parent deletes the profile that has child mode active → clear child mode cookie on next request
- Both JWT and child mode cookie present → child mode wins for `/learn` routes

**Verification:**

- Enable child mode → cookie set with correct profile data
- Close tab, reopen → auto-redirects to `/learn`
- Disable child mode → cookie cleared → redirects to `/login`
- Only one profile can be in child mode at a time
- Delete profile in child mode → cookie cleared

---

### T-12: Polish, Docker & Deployment

**Dependencies:** T-10, T-11

**Description:**
Final polish: error handling, responsive testing, performance optimization. Package the app in Docker for Coolify deployment.

**PRD Ref:** §8 (Non-Functional Requirements)
**TDD Ref:** §1 (Docker files), §9 (Error Handling), §10 (Performance Budgets)

**Key Deliverables:**

- `docker/Dockerfile` — Multi-stage build with Node.js
- `docker-compose.yml` — App service + SQLite volume mount
- `.env.example` — Complete environment variable reference
- Error boundaries for all route components
- Toast notifications for server function errors
- Responsive design verification (mobile 360px → tablet 1024px)
- Touch target audit (all interactive elements ≥ 44x44dp minimum, ≥ 64x64dp preferred)
- Performance check: first paint < 2s, audio latency < 150ms
- Accessibility check: keyboard navigation, screen reader support (Radix UI handles most)
- `pnpm build` succeeds

**TDD Ref:** §9 (Error Handling strategies), §10 (Performance budgets: 150ms audio, 2s first paint)

**Key Decisions:**

- Docker multi-stage build: `node:20-alpine` → `nginx:alpine` (static files) or keep as Node.js for SSR
- SQLite file mounted as Docker volume (survives container rebuilds)
- Coolify deploy: connect Git repo → set env vars → deploy
- Error states: toast for recoverable errors, error boundary page for crashes

**Verification:**

- `pnpm build` produces production bundle
- `docker compose up` starts the app
- SQLite data persists after container restart
- All routes work on mobile viewports
- Touch targets meet minimum size
- First paint < 2s on simulated 3G

---

## Track Dependencies Graph

```
 T-01 (Scaffolding)  ── ✅
 ├── T-02 (Database) ── ✅
 │    ├── T-03 (Auth) ── ✅
 │    │    ├── T-05 (Dashboard & Profiles) ✅
 │    │    │    ├── T-06 (Letter Toggles) ✅
 │    │    │    │    ├── T-08 (Child Grid) ✅
 │    │    │    │    │    └── T-10 (Reading Practice) ⬜ ─┐
 │    │    │    │    └── T-11 (Child Mode) ⬜ ────────────┤
 │    │    │    └── T-11 (Child Mode) ⬜ ─────────────────┤
 │    │    └── T-11 (Child Mode) ⬜ ──────────────────────┤
 │    └── T-07 (Harakat) ✅ ──────────────────────────────┤
 │                                                        │
 T-03b (Code Quality) ── ✅                                │
 T-04 (i18n — parallel to T-02/T-03) ✅                    │
 T-09 (Audio — parallel to T-02/T-03) ✅                   │
                                                            ▼
                                                     T-12 (Polish & Deploy) ⬜
```

## Track Format

Each track will be created as a Conductor track with the following files:

```
conductor/tracks/<track-id>/
├── index.md        # Track index with links to spec + plan
├── spec.md         # Specification (what to build, references to PRD/TDD)
├── plan.md         # Implementation plan (step-by-step, files to touch)
└── metadata.json   # Track metadata (status, dependencies, effort)
```

Tracks are registered in `conductor/tracks.md` (the Tracks Registry) once defined.
