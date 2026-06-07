# 🗺️ Development Roadmap — Little Alif

This document defines the **Conductor tracks** that will be created during development. Each track is a self-contained work unit with its own spec, plan, and metadata. Tracks are ordered by dependency — a track should not begin until its dependencies are complete.

---

## Track Overview

| ID    | Title                                | Depends On             | Complexity | Est. Effort | Status      |
| ----- | ------------------------------------ | ---------------------- | ---------- | ----------- | ----------- |
| T-01  | Project Scaffolding & Config         | —                      | Low        | 1–2h        | ✅ Complete |
| T-02  | Database Schema & Seed Data          | T-01                   | Low        | 2–3h        | ✅ Complete |
| T-03  | Authentication (Better Auth)         | T-02                   | Medium     | 3–5h        | ✅ Complete |
| —     | Code Quality Tooling                 | T-01                   | Low        | 1–2h        | ✅ Complete |
| —     | Oxlint Migration                     | —                      | Low        | ~2h         | ✅ Complete |
| T-04  | i18n Setup                           | T-01                   | Low        | 1–2h        | ✅ Complete |
| T-05  | Parent Dashboard & Child Profiles    | T-02, T-03             | Medium     | 4–6h        | ✅ Complete |
| T-06  | Letter Toggle Management             | T-02, T-03, T-05       | Medium     | 3–5h        | ✅ Complete |
| T-07  | Vowel Mode (Harakat)                 | T-02                   | Low        | 2–3h        | ✅ Complete |
| T-08  | Child Letter Grid                    | T-06, T-07, T-09       | Medium     | 4–6h        | ✅ Complete |
| T-09  | Audio Service (Web Speech API)       | T-01                   | Low        | 2–3h        | ✅ Complete |
| T-09b | Audio Preloader (Idle Warm-up)       | T-09                   | Low        | 1h          | ✅ Complete |
| T-10  | Reading Practice (Iqra' Mode)        | T-06, T-07, T-08, T-09 | High       | 5–8h        | ✅ Complete |
| T-11  | Child Mode                           | T-03, T-05             | Low        | 2–3h        | ✅ Complete |
| T-12  | Polish, Docker & Deployment          | T-10, T-11             | Medium     | 4–6h        | ✅ Complete |
| T-13  | Child Mode Parent Gate & Flow Polish | T-11, T-08             | Medium     | 3–5h        | ✅ Complete |
| T-14  | Reading Practice Visual Alignment    | T-10                   | Low        | 1–2h        | ✅ Complete |
| T-15  | Parent Dashboard De-clutter          | T-05, T-06             | Medium     | 4–6h        | ✅ Complete |
| T-16  | Code Quality Polish                  | T-02, T-10             | Low        | ~1h         | ✅ Complete |
| T-17  | Infrastructure & Audio Polish        | T-12                   | Low        | ~1.5-2h     | ✅ Complete |
| T-18  | Error Classification System          | T-12                   | Medium     | ~1-2h       | ✅ Complete |
| T-19  | Security Hardening & Code Quality    | T-12, T-18             | Medium     | ~3-5h       | ✅ Complete |
| T-20  | Vite 8 Upgrade                       | T-01                   | Low        | ~1-2h       | ✅ Complete |
| —     | Drizzle SQL Migration Workflow       | T-02, T-12             | Low        | ~1-2h       | ✅ Complete |

\***\*21 tracks complete.** Delivered effort: ~54–86 hours\*\*

### Implementation Status

| ID    | Title                                  | Status      | Archived Track                                                                                                   |
| ----- | -------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| T-01  | Project Scaffolding & Config           | ✅ Complete | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)                                             |
| T-02  | Database Schema & Seed Data            | ✅ Complete | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)                                             |
| T-03  | Authentication (Better Auth)           | ✅ Complete | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)                                             |
| —     | Code Quality (Prettier, ESLint, Husky) | ✅ Complete | [`code-quality_20260601`](../conductor/archive/code-quality_20260601/)                                           |
| —     | Oxlint + Oxfmt Migration               | ✅ Complete | [`oxlint_migration_20260605`](../conductor/archive/oxlint_migration_20260605/)                                   |
| T-04  | i18n Setup                             | ✅ Complete | [`i18n-setup_20260602`](../conductor/archive/i18n-setup_20260602/)                                               |
| T-05  | Parent Dashboard & Child Profiles      | ✅ Complete | [`parent-dashboard_20260602`](../conductor/archive/parent-dashboard_20260602/)                                   |
| T-06  | Letter Toggle Management               | ✅ Complete | [`letter-toggles_20260602`](../conductor/archive/letter-toggles_20260602/)                                       |
| T-07  | Vowel Mode (Harakat)                   | ✅ Complete | [`harakat_20260602`](../conductor/archive/harakat_20260602/)                                                     |
| T-08  | Child Letter Grid                      | ✅ Complete | [`child-letter-grid_20260603`](../conductor/archive/child-letter-grid_20260603/)                                 |
| T-09  | Audio Service (Web Speech API)         | ✅ Complete | [`audio-service_20260602`](../conductor/archive/audio-service_20260602/)                                         |
| T-09b | Audio Preloader (Idle Warm-up)         | ✅ Complete | [`audio-preloader_20260602`](../conductor/archive/audio-preloader_20260602/)                                     |
| T-10  | Reading Practice (Iqra' Mode)          | ✅ Complete | [`reading-practice_20260603`](../conductor/archive/reading-practice_20260603/)                                   |
| T-11  | Child Mode                             | ✅ Complete | [`child-mode_20260604`](../conductor/archive/child-mode_20260604/)                                               |
| T-12  | Polish, Docker & Deployment            | ✅ Complete | [`polish-deploy_20260604`](../conductor/archive/polish-deploy_20260604/)                                         |
| T-13  | Child Mode Parent Gate & Flow Polish   | ✅ Complete | [`t13-child-mode-parent-gate_20260605`](../conductor/archive/t13-child-mode-parent-gate_20260605/)               |
| T-14  | Reading Practice Visual Alignment      | ✅ Complete | [`reading-practice-visual-alignment_20260605`](../conductor/archive/reading-practice-visual-alignment_20260605/) |
| T-15  | Parent Dashboard De-clutter            | ✅ Complete | [`parent-dashboard-declutter_20260605`](../conductor/archive/parent-dashboard-declutter_20260605/)               |
| T-16  | Code Quality Polish                    | ✅ Complete | [`code-quality-polish_20260605`](../conductor/archive/code-quality-polish_20260605/)                             |
| T-17  | Infrastructure & Audio Polish          | ✅ Complete | [`infra-audio-polish_20260606`](../conductor/archive/infra-audio-polish_20260606/)                               |
| T-18  | Error Classification System            | ✅ Complete | [`error-classification_20260606`](../conductor/archive/error-classification_20260606/)                           |
| T-19  | Security Hardening & Code Quality      | ✅ Complete | [`t19-security-hardening`](../conductor/tracks/t19-security-hardening/)                                          |
| T-20  | Vite 8 Upgrade                         | ✅ Complete | [`vite-8-upgrade`](../conductor/archive/vite-8-upgrade/)                                                         |
| —     | Drizzle SQL Migration Workflow         | ✅ Complete | [`sql_migrations_20260607`](../conductor/archive/sql_migrations_20260607/)                                       |

> **Note:** T-01, T-02, and T-03 were combined into a single track `scaffolding_20260531` and delivered together. The `code-quality_20260601` track (Prettier, ESLint v9, Husky, lint-staged) was added as a bonus tooling track not present in the original roadmap — it establishes the pre-commit quality pipeline. The `oxlint_migration_20260605` track replaced ESLint + Prettier with Oxlint + Oxfmt, reducing dependencies by 9 and simplifying the pre-commit hook. Tracks T-16 through T-18 are post-launch polish recommendations from the architecture review — they improve maintainability, production reliability, and self-hosting ergonomics without adding new user-facing features. T-16 (Code Quality Polish), T-17 (Infrastructure & Audio Polish), and T-18 (Error Classification System) are now complete. T-20 (Vite 8 Upgrade) migrated the build toolchain from Vite 7 (esbuild) to Vite 8 (Rolldown + Oxc) and removed unused `vite-tsconfig-paths` and `vinxi` dependencies. The Drizzle SQL Migration Workflow replaced `drizzle-kit push` with version-controlled SQL migrations via `drizzle-kit generate` + `drizzle-kit migrate`, with auto-migration on server startup.

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

> **Note:** The original `drizzle-kit push`-based migration was replaced by a proper SQL migration workflow in a later track. See [`sql_migrations_20260607`](../conductor/archive/sql_migrations_20260607/).

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
**Status:** ✅ Complete (`code-quality_20260601`) — **Superseded by Oxlint Migration (`oxlint_migration_20260605`)**

> **Note:** This track established the original ESLint + Prettier + lint-staged pipeline. It was fully replaced in the Oxlint Migration track, which migrated to **Oxlint 1.68** (86 rules, type-aware) + **Oxfmt 0.53** with a simplified pre-commit hook (`oxlint --fix . && oxfmt --write . && pnpm typecheck`). The migration removed 9 dependencies (eslint, prettier, typescript-eslint, etc.) and 3 config files (eslint.config.js, .prettierrc, .prettierignore).

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

### T-12: Polish, Docker & Deployment ✅

**Dependencies:** T-10, T-11
**Status:** ✅ Complete ([`polish-deploy_20260604`](../conductor/archive/polish-deploy_20260604/))

**Description:**
Final polish: audio MP3 generation, error handling, toast notifications, Docker packaging, and verification. 30 files changed, 935 insertions, 178 deletions.

**PRD Ref:** §8 (Non-Functional Requirements)
**TDD Ref:** §12 (Deployment Configuration), §13 (Error Handling), §11 (Performance Budgets)

**Key Deliverables (all delivered):**

- **Audio MP3 Generation** — 112 MP3 files via Google Cloud TTS (`ar-XA` Wavenet, `speakingRate: 0.85`). Build-time script generates all 28 letters × 4 harakat modes.
- **Error Boundaries** — Reusable `<ErrorBoundary>` class component wrapping `/dashboard`, `/learn`, `/learn/reading`. `componentDidCatch` with "Try Again" fallback. 5 tests covering all states.
- **Toast Notifications** — `ToastContainer` reading from Zustand `useUiStore`, auto-dismiss 5s, dismiss on click, `aria-live="polite"`, empty state. Wired into `HarakatSelector`, `LetterToggleGrid`, `ProfileEditor`, `Dashboard` (delete/sign-out errors). 8 tests covering all variants.
- **Docker & Deployment** — Multi-stage Dockerfile (`deps → build → runner`, Node 20 Alpine), `docker-compose.yml` with SQLite volume mount, `docker/server-entry.mjs` custom HTTP server (SSR handler + static assets), `.env.example` with all vars documented.
- **Verification** — 404 tests passing across 51 files, `pnpm build` succeeds, `pnpm typecheck` clean, `pnpm lint` clean, code review completed with all findings addressed.

**TDD Ref:** §12 (Deployment Configuration — Dockerfile, docker-compose, env vars), §13 (Error Handling — toast + error boundary)

**Key Decisions:**

- `ErrorBoundary` is a class component (required by React for `componentDidCatch`)
- Toast system uses Zustand `useUiStore` (not a separate context) — consistent with existing state management
- Error boundaries protect route-level crashes; toast covers per-action server function errors
- Docker multi-stage build: `node:20-alpine`, 3 stages (deps → build → runner), custom `server-entry.mjs`
- `docker-compose.yml` at project root (Coolify convention), `Dockerfile` in `docker/` directory
- SQLite file mounted as Docker volume (`/app/data`) — survives container rebuilds
- Zod v3→v4 upgrade documented in tech-stack.md
- Coral design tokens used for toast error variants (matching project palette)

**Verification:**

- `pnpm build` produces production bundle
- `docker compose up` starts the app with SSR
- SQLite data persists after container restart
- All routes wrapped in ErrorBoundary
- Toast notifications on server function errors (5s auto-dismiss)
- 404 tests passing across 51 files
- `pnpm typecheck` clean, `pnpm lint` clean
- Code review completed — 1 Medium + 4 Low findings fixed, 3 flaky test issues resolved

---

### T-13: Child Mode Parent Gate & Flow Polish ✅

**Dependencies:** T-11 (Child Mode), T-08 (Child Letter Grid)
**Status:** ✅ Complete ([`t13-child-mode-parent-gate_20260605`](../conductor/archive/t13-child-mode-parent-gate_20260605/))

**Description:**
Replace the text "Back" link on child routes (`/learn`, `/learn/reading`) with a hidden gesture-based Parent Gate. A low-contrast lock icon in the top-right corner of the child header is invisible to children in normal use (40% muted text opacity) but unlockable by a parent via two gestures: long-press for 1.5s, or three taps within 1s. Unlocking opens a parent menu with two options: **Switch child** (opens a ChildSwitcher overlay listing other profiles) and **Exit to parent dashboard** (clears child-mode cookie, navigates to `/dashboard` or `/login`).

**PRD Ref:** §4 — Module 9 (Parent Gate)

**New Files Created:**

- `app/lib/utils/parent-gate.ts` — Gesture timing constants (LONG_PRESS_MS=1500, TAP_WINDOW_MS=1000, TAP_COUNT=3)
- `app/lib/utils/parent-gate.test.ts` — 4 tests for constants
- `app/lib/hooks/useParentGateHandlers.ts` — Shared `handleExit` / `handleSwitchChild` hook
- `app/lib/hooks/useParentGateHandlers.test.ts` — 6 tests for handler logic
- `app/components/child/ParentGate.tsx` — Lock icon + SVG progress ring + Radix Dialog menu (z-60)
- `app/components/child/ParentGate.test.tsx` — 13 tests covering long-press, 3-tap, disabled, menu interactions
- `app/components/parent/ChildSwitcher.tsx` — Profile picker overlay (Radix Dialog, z-70) with query + mutation
- `app/components/parent/ChildSwitcher.test.tsx` — 8 tests covering empty state, single/multi profile selection
- `app/server/profiles.ts` — `listProfilesForSwitch` pure helper + `listProfilesForSwitchFn` server function

**Files Modified:**

- `app/routes/learn.tsx` — Replaced `<Link to="/dashboard">Back</Link>` with `<ParentGate>` + `<ChildSwitcher>`
- `app/routes/learn/reading.tsx` — Same pattern
- `app/routes/learn.test.tsx` — Removed "Back" assertions, added ParentGate assertions
- `app/routes/learn/reading.test.tsx` — Same pattern
- `app/server/profiles.test.ts` — Added `listProfilesForSwitch` tests
- `vitest.config.ts` — Increased testTimeout to 60s, capped workers to 3 threads

**Key Decisions:**

- `useAuthStore.getState()` read on demand (not subscription) to avoid re-render churn
- Progress ring animated via SVG `strokeDasharray` (60fps, `requestAnimationFrame`-driven)
- Parent session validated via `validateSessionFn()` server call (not in-memory `user` field)
- `ChildSwitcher` filters out the currently-active profile — single-child households see empty state
- Both `ParentGate` menu and `ChildSwitcher` use Radix Dialog at z-60 and z-70 respectively (above LetterDetail's z-50)

**Edge Cases:**

- Hold < 1.5s then release → no menu, no tap registered
- Tap 3× with >1s between → no menu (tap window expired)
- Pointer drift off icon during hold → clean cancel (no stuck progress)
- `handleExit` with parent JWT present → routes to `/dashboard`
- `handleExit` with no parent JWT (child-only session) → routes to `/login`
- `ChildSwitcher` loading → spinner; error → empty state with close button
- Only 1 profile → empty state shown (no other children to switch to)
- Fallback avatar (`?` div) if avatar key not found in `AVATAR_MAP`

**Verification (all passing):**

- **442 tests passing** across 55 test files
- T-13 specific files: 97–100% line coverage
- `pnpm typecheck` clean, `pnpm lint` clean, `pnpm format:check` clean
- Code review completed (archived)

---

### T-14: Reading Practice Visual Alignment ✅

**Dependencies:** T-10 (Reading Practice)
**Status:** ✅ Complete ([`reading-practice-visual-alignment_20260605`](../conductor/archive/reading-practice-visual-alignment_20260605/))

**Description:**
Bring the reading practice screen visual language in line with the rest of the warm-toned app. Replace cold-gray Tailwind defaults with the project's design-system tokens. Unify button radii. Fix the GroupHeader label fallback bug so internal letter IDs are never exposed to the UI.

**PRD Ref:** §4 — Module 8 (Reading Practice visual polish)
**TDD Ref:** §5 (Reading Practice components — token alignment)

**Key Deliverables (all delivered):**

- [x] **Phase 1 (ReadingCell.tsx):** `bg-gray-50` → `bg-sand-light`, `rounded-lg` → `rounded-small`, `data-[flashed=true]:bg-emerald-200` → `data-[flashed=true]:bg-green-light`
- [x] **Phase 2 (ReadingActions.tsx):** All 4 buttons use `border-sand-dark`, `rounded-small`, `hover:bg-sand-light`, and `text-green` for Lucide icons
- [x] **Phase 3 (GroupPills.tsx):** Active: `bg-green text-white`, Complete: `border-green text-green-dark bg-white`, Incomplete: `border-sand-dark text-text-muted bg-white`; removed `cursor-not-allowed`
- [x] **Phase 4 (ReadingGrid.tsx):** Removed "Pattern" label div and its 2 test assertions
- [x] **Phase 5 (reading.ts):** `getCharById` return type `string → string|undefined`; fallback uses first successfully resolved character in group; new test confirms Arabic characters when resolver returns undefined

**Key Decisions:**

- No new Tailwind default color classes (`gray-`, `emerald-`, `amber-`) introduced in reading-practice components
- GroupPills active state matches HarakatSelector styling for visual consistency
- Pattern label removed entirely — the systematic row's predictable ordering is the visual signal
- Flash animation timing left unchanged (confirmed working)

**Edge Cases (all covered):**

- `getCharById` returns `undefined` → fallback uses first valid character in group (never exposes raw IDs)
- GroupPills incomplete state uses `aria-disabled` instead of `cursor-not-allowed` for accessibility
- All 73 reading-related tests pass (6 test files), 442/442 full suite

**Verification (all passing):**

- All reading-practice components use only design-system tokens
- GroupPills active state matches `bg-green text-white`
- GroupHeader always shows Arabic glyphs (never Latin IDs)
- Pattern label removed from ReadingGrid
- New test covers `getCharById` undefined fallback
- **442 tests passing** across 55 test files
- `pnpm typecheck` clean, `pnpm lint` clean
- Code review completed (archived)

---

### T-15: Parent Dashboard De-clutter ✅

**Dependencies:** T-05 (Parent Dashboard & Child Profiles), T-06 (Letter Toggle Management)
**Status:** ✅ Complete ([`parent-dashboard-declutter_20260605`](../conductor/archive/parent-dashboard-declutter_20260605/))

**Description:**
Mobile-first restructure of the parent dashboard: replace the sidebar with a top app bar, extract letter management to a dedicated deep-linkable route, add a profile dropdown menu with sign-out confirmation, and simplify the ProfileList from accordion-based to card-based navigation.

**PRD Ref:** §4 — Module 4 (Parent Dashboard — Letter Management), REQ-4.1 through REQ-4.6
**TDD Ref:** §19 (Parent Dashboard De-clutter)

**Key Deliverables (all delivered):**

- [x] `DashboardHeader` — Top app bar with title, language toggle, and ProfileMenu dropdown (replaces sidebar)
- [x] `ProfileMenu` — Radix DropdownMenu with "Manage Letters" link, sign-out button with `ConfirmDialog` (i18n'd)
- [x] `/dashboard/profiles/$id/letters` — Dedicated route for per-profile letter management (deep-linkable from profile cards)
- [x] `ProfileList` — Simplified to card-only (no accordion), each card links to the dedicated letters route
- [x] Dashboard `/` route renders `<Outlet />` for child routes, keeping DashboardHeader persistent
- [x] Skeleton loaders (3-card) for Dashboard placeholder state
- [x] Empty state uses AlifLamp avatar instead of generic Lucide icon
- [x] Favicon added (`public/favicon.svg`)
- [x] `-dashboard.test.tsx` — Proper router mocking for test isolation
- [x] 23 new tests (DashboardHeader, ProfileMenu, ProfileList, dashboard route, letters route), full suite passing

**Key Decisions:**

- DashboardHeader replaces the sidebar entirely — better mobile-first UX
- ProfileMenu uses ConfirmDialog for sign-out (prevents accidental logout)
- Dedicated `/dashboard/profiles/$id/letters` route enables deep-linking and back navigation
- Dashboard layout conditionally renders Outlet when a child route is active
- Skeleton loaders match card layout to reduce layout shift
- Favicon added for production polish

**Edge Cases (all covered):**

- Direct navigation to `/dashboard/profiles/$id/letters` works (deep-link)
- ProfileMenu dropdown closes on outside click (Radix default)
- ConfirmDialog for sign-out is i18n'd (EN + ID)
- DashboardHeader renders correctly on both `/dashboard` and child routes
- Empty profile state shows friendly message with AlifLamp avatar

**Verification (all passing):**

- Mobile-first layout renders correctly on small screens
- ProfileMenu dropdown navigates to letters route and triggers sign-out
- Dedicated letters route renders within dashboard layout with DashboardHeader
- ProfileList shows skeleton loaders while data loads
- Empty state shows polished illustration
- **All tests pass**, `pnpm typecheck` clean, `pnpm lint` clean
- Code review completed (archived)

---

### T-16: Code Quality Polish ✅

**Dependencies:** T-02 (Database Schema), T-10 (Reading Practice)
**Status:** ✅ Complete ([`code-quality-polish_20260605`](../conductor/archive/code-quality-polish_20260605/))
**Complexity:** Low
**Est. Effort:** ~1h

**Description:**
Bundle of small code quality fixes. Extract the 28-letter ID enum from its current duplication across 5+ files into a single shared config so renames no longer require coordinated multi-file changes. Also localize the reading practice button labels (Shuffle, Done, Next Group, Randomize) via existing i18n keys so parent-co-use text respects the parent's language preference.

**PRD Ref:** §7 (Database Schema), §4 — REQ-4.6 (Bilingual UI)
**TDD Ref:** §6 (Schema Definitions), §9 (Bilingual UI Implementation)

**Key Deliverables (all delivered):**

- [x] **Letter ID source of truth:**
  - [x] Create `app/lib/constants/letters.ts` exporting `LETTER_IDS` array, `LetterId` type, and `LETTER_BG_COLORS`
  - [x] Updated `app/db/seed.ts`, `app/lib/validations/letters.ts`, `LetterCard.tsx`, and related files to import from the shared source
  - [x] Verified `pnpm typecheck`, `pnpm test`, `pnpm lint` pass
- [x] **Reading practice i18n:**
  - [x] Added 4 keys to EN/ID translation files: `READING_SHUFFLE`, `READING_DONE`, `READING_NEXT_GROUP`, `READING_RANDOMIZE`
  - [x] Ran `pnpm i18n` to regenerate type files
  - [x] Updated `ReadingActions.tsx` to use `LL.*()` calls instead of hardcoded strings
  - [x] Updated component tests for i18n wrappers
  - [x] Verified `pnpm test`, `pnpm typecheck`, `pnpm lint` pass

**Key Decisions:**

- Constants file lives at `app/lib/constants/letters.ts` (co-located with other lib modules)
- Reading practice keys follow `SCREAMING_SNAKE_CASE` convention matching existing i18n keys
- Child-facing glyphs and icons remain untouched (no i18n needed for the child UI)
- Both fixes are independent — can be done in any order within the same track

**Verification (all passing):**

- `LETTER_IDS` is defined in exactly one place, all imports point there
- Toggle locale to ID → reading practice buttons show Indonesian text
- 525/525 tests passing across 61 test files
- `pnpm typecheck` clean, `pnpm lint` clean
- Code review completed, track archived

---

### T-17: Infrastructure & Audio Polish ✅

**Dependencies:** T-12 (Polish, Docker & Deployment)
**Status:** ✅ Complete ([`infra-audio-polish_20260606`](../conductor/archive/infra-audio-polish_20260606/))
**Complexity:** Low
**Est. Effort:** ~2h

**Description:**
Improve production infrastructure and self-hosting ergonomics. Broke the only circular dependency in the code graph (`auth-fns.ts` ↔ `profiles.ts`), added a Docker health check endpoint for orchestrator monitoring, and documented the GCP TTS audio generation setup.

**PRD Ref:** §8 (Non-Functional Requirements)
**TDD Ref:** §12 (Deployment Configuration), §7 (Audio Architecture)

**Key Deliverables (all delivered):**

- [x] **Break circular dependency:**
  - [x] `buildChildSession()` already had inline query — no change needed
  - [x] `enableChildMode()` replaced `getActiveProfile` call with inline `db.select({ name, avatar }).from(profiles).where(and(eq(id, profileId), eq(userId, userId)))`
  - [x] Removed `import { getActiveProfile } from './profiles'` from `auth-fns.ts`
  - [x] Updated test mocks to use inline DB mock instead of mocking `./profiles`
  - [x] Verified zero cycles via `codebase_graph_circular`
- [x] **Docker health check:**
  - [x] Created `app/routes/api/health.ts` returning `200 { status: "ok" }` — no auth, no DB query
  - [x] Added `curl` to Dockerfile runner stage (`apk add --no-cache curl`)
  - [x] Added `healthcheck` to `docker-compose.yml`: `curl -f http://localhost:3000/api/health`, 30s interval, 3 retries, 15s start period
  - [x] 3 new tests for health endpoint (200 status, JSON body, no-auth access)
- [x] **Audio generation documentation:**
  - [x] Created `docs/audio-setup.md` — 144-line comprehensive GCP setup guide (prerequisites, project setup, auth, script usage, verification, troubleshooting, downloadable archive option)
  - [x] Consistent with existing `scripts/generate-audio.ts`

**Key Decisions:**

- Health endpoint is a static route (no DB call) — a failing DB should not prevent liveness detection
- Circular dep fix by inlining, not by moving functions — preserves responsibility boundaries
- Audio file naming convention stays unchanged (`{letterId}_{vowelMode}.mp3`)
- `edge-tts` alternative deferred (GCP docs sufficient for self-hosters)

**Verification (all passing):**

- `codebase_graph_circular` reports zero cycles
- 525/525 tests passing across 61 test files
- `pnpm typecheck` — only pre-existing errors
- `pnpm lint` — only pre-existing errors
- Code review completed, track archived

---

### T-18: Error Classification System ✅

**Dependencies:** T-12 (Polish, Docker & Deployment — toast system)
**Status:** ✅ Complete ([`error-classification_20260606`](../conductor/archive/error-classification_20260606/))
**Complexity:** Medium
**Est. Effort:** ~1-2h

**Description:**
Server function errors previously surfaced as generic "Something went wrong" toasts. Created a lightweight error classification system with typed error codes that maps to contextual, bilingual toast messages — so the parent sees useful hints like "Connection lost. Check your internet." instead of a vague failure.

**PRD Ref:** §8 (Non-Functional Requirements — error handling)
**TDD Ref:** §13 (Error Handling — toast + error boundary)

**Key Deliverables (all delivered):**

- [x] `app/lib/errors/index.ts` — `ServerFunctionError` class with `ErrorCode` enum (`VALIDATION | AUTH | NOT_FOUND | LIMIT_EXCEEDED | NETWORK | UNKNOWN`) and `userMessage` field
- [x] Updated all server function handlers to throw `ServerFunctionError` instead of generic `Error('message')`:
  - `app/server/auth-fns.ts` — `requireParentSession`, `authorizeChildAccess`, `enableChildMode`, `registerFn`/`loginFn` catch
  - `app/server/profiles.ts` — `createProfile`, `updateProfile`, `deleteProfile`
  - `app/server/letters.ts` — `getVisibleLettersFn`, `toggleLetterFn`, `bulkToggleLettersFn` wrappers
  - `app/server/reading.ts` — `getReadingDataFn` wrapper
- [x] `app/lib/hooks/useTypedMutation.ts` — Thin wrapper around `useMutation` that catches `ServerFunctionError` and dispatches `pushToast` with the correct variant + i18n message
- [x] Error code → toast variant mapping:

  | Error Code       | Toast Variant | EN Message                                  | ID Message                                     |
  | ---------------- | ------------- | ------------------------------------------- | ---------------------------------------------- |
  | `VALIDATION`     | `info`        | "Check your input and try again."           | "Periksa input Anda dan coba lagi."            |
  | `AUTH`           | `error`       | "Please sign in again."                     | "Silakan masuk lagi."                          |
  | `NOT_FOUND`      | `info`        | "Item not found. It may have been deleted." | "Item tidak ditemukan. Mungkin sudah dihapus." |
  | `LIMIT_EXCEEDED` | `error`       | "Maximum reached."                          | "Batas maksimum tercapai."                     |
  | `NETWORK`        | `error`       | "Connection lost. Check your internet."     | "Koneksi terputus. Periksa internet Anda."     |
  | `UNKNOWN`        | `error`       | "Something went wrong. Please try again."   | "Terjadi kesalahan. Silakan coba lagi."        |

- [x] 6 new i18n keys in both EN and ID locales (`ERROR_VALIDATION`, `ERROR_AUTH`, `ERROR_NOT_FOUND`, `ERROR_LIMIT_EXCEEDED`, `ERROR_NETWORK`, `ERROR_UNKNOWN`)
- [x] `useTypedMutation` test suite covering all error codes + network error detection (`TypeError: Failed to fetch` → `NETWORK`)
- [x] Review fixes applied: lint compliance (unused params prefixed with `_`), network error detection for `NFR-4`, type safety improvements

**Key Decisions:**

- Lightweight class extending `Error` with a `code` property — not a full Result/Option type monad
- `useTypedMutation` is a thin wrapper, not a replacement for TanStack Query's `useMutation`
- Auth errors trigger redirect + toast (already partially handled by middleware)
- Error messages are user-facing and concise — debug logs go to `console.error`
- `NETWORK` code covers both server-side fetch failures and client-side `TypeError: Failed to fetch`

**Verification (all passing):**

- 552/552 tests passing across 62 test files
- `pnpm typecheck` clean, `pnpm lint` clean (7 pre-existing lint errors in unrelated test files)
- Code review completed, track archived

---

### T-19: Security Hardening & Code Quality ✅

**Dependencies:** T-12 (Polish, Docker & Deployment), T-18 (Error Classification System)
**Status:** ✅ Complete ([`t19-security-hardening`](../conductor/tracks/t19-security-hardening/))
**Complexity:** Medium
**Est. Effort:** ~3-5h

**Description:**
Address security vulnerabilities and code quality issues identified in the comprehensive audit conducted on 2026-06-07 (commit `ddd58fc`). The audit found 1 Critical, 5 High, 10 Medium, and 10 Low severity issues across Docker deployment, authentication, database schema, React components, and testing infrastructure.

**Audit Ref:** Full audit report (2026-06-07)

**Key Deliverables:**

**Phase 1 — Critical & High Security (1-2h):**

- [ ] Fix path traversal in `docker/server-entry.mjs` (C-1)
- [ ] Harden child-mode cookie: `secure` flag, `httpOnly: true` (H-1, H-2)
- [ ] Fail-fast on missing HMAC secret (H-4)
- [ ] In-memory rate limiting on auth endpoints (H-3)
- [ ] Security headers in Docker server entry (H-5)
- [ ] Open redirect prevention in login route (M-1)
- [ ] Docker non-root user (M-4)

**Phase 2 — Medium Security & Code Quality (1-2h):**

- [ ] Fix `<Link disabled>` invalid HTML in learn.tsx (M-7)
- [ ] Optimize LetterCard re-renders (M-8)
- [ ] Add index + FK on `profiles.userId` (M-9)
- [ ] Extract shared `verifyProfileOwnership` (M-10)
- [ ] Fix `setChildMode` not setting `isAuthenticated` (code quality)
- [ ] Reduce child-mode cookie max-age to 30 days (M-5)
- [ ] Add `secure` flag to locale cookie (M-6)

**Phase 3 — Low Priority & Polish (1h):**

- [ ] `prefers-reduced-motion` media query (L-9)
- [ ] Fix `--color-text-muted` WCAG AA contrast (L-10)
- [ ] Login/register route `beforeLoad` tests (testing gap)
- [ ] `child-mode.server.ts` direct unit tests (testing gap)
- [ ] Magic number constants, AGENTS.md coverage claim fix (L-5, docs)
- [ ] Full verification suite

**Key Decisions:**

- DD-1: In-memory rate limiter (no Redis/external dependency for single-parent deployment)
- DD-2: `httpOnly: true` for child-mode cookie (client-side store already tracks `childProfileId`)
- DD-3: Throw on missing HMAC secret (fail-fast prevents silent misconfiguration)
- DD-4: Basic CSP allowing self + Google Fonts (TanStack Start requires `'unsafe-inline'` for hydration)
- DD-5: FK constraint on `profiles.userId` enforces referential integrity at DB level

**Verification (complete):**

- [x] `GET /../../../etc/passwd` returns 403 in Docker
- [x] Child-mode cookie has `secure` + `httpOnly` flags
- [x] Empty HMAC secret causes startup error
- [x] Auth endpoints reject rapid-fire requests
- [x] Response headers include security headers
- [x] `<Link disabled>` replaced with proper element
- [x] LetterCard doesn't re-render on unrelated store changes
- [x] `profiles.userId` has index and FK constraint
- [x] All existing tests still pass (561 tests, 65 files)
- [x] `pnpm typecheck` clean, `pnpm lint` clean

---

### T-20: Vite 8 Upgrade ✅

**Dependencies:** T-01 (Project Scaffolding)
**Status:** ✅ Complete ([`vite-8-upgrade`](../conductor/archive/vite-8-upgrade/))
**Complexity:** Low
**Est. Effort:** ~1-2h

**Description:**
Upgrade the build toolchain from Vite 7 to Vite 8, which replaces esbuild with Rolldown (Rust-based bundler) and Oxc (Rust-based transformer). Remove the `vite-tsconfig-paths` and `vinxi` dependencies in favor of Vite 8's native `resolve.tsconfigPaths` support.

**Key Deliverables (all delivered):**

- [x] `vite` upgraded from ^7 to ^8 (8.0.16)
- [x] `@vitejs/plugin-react` upgraded from ^4 to ^6 (6.0.2)
- [x] Removed `vite-tsconfig-paths` dependency
- [x] Removed `vinxi` dependency
- [x] `vite.config.ts` — replaced `tsconfigPaths()` plugin with `resolve: { tsconfigPaths: true }`
- [x] `vitest.config.ts` — added `resolve.alias` for `~` path (Vitest uses own Vite instance)
- [x] `conductor/tech-stack.md` updated with Vite 8 info

**Key Decisions:**

- Vitest needs explicit `resolve.alias` because it uses its own Vite instance and doesn't inherit `resolve.tsconfigPaths` from `vite.config.ts`
- `vinxi` was unused (leftover from early scaffolding) — safe to remove
- Vite 8's Rolldown bundler produces identical output to esbuild but with faster builds

**Verification (all passing):**

- `pnpm typecheck` clean
- All 561 tests passing across 65 test files
- `pnpm build` succeeds (client: 1.10s, SSR: 842ms)
- Vite 8.0.16 confirmed in build output

---

### — : Drizzle SQL Migration Workflow ✅

**Dependencies:** T-02 (Database Schema), T-12 (Polish & Deploy)
**Status:** ✅ Complete ([`sql_migrations_20260607`](../conductor/archive/sql_migrations_20260607/))

**PRD Ref:** §7 (Database Schema)
**TDD Ref:** §6 (Database Schema & Init)

**Description:**
Replace `drizzle-kit push`-based schema management with a proper SQL migration workflow. Generated migration files are version-controlled for traceability, and `autoMigrate()` runs on every server start to ensure the database schema is always up to date.

**Key Deliverables (all delivered):**

- `drizzle.config.ts` — `out: './app/db/migrations'` configured
- `package.json` — `db:push` removed, `db:generate` + `db:migrate` scripts added
- `app/db/migrations/0000_*.sql` — Initial migration snapshot (7 tables, git-tracked)
- `app/db/migrate.ts` — `autoMigrate()` using `drizzle-orm/libsql/migrator`
- `app/db/index.ts` — `getDb()` now async, calls `autoMigrate()` on first invocation
- All 565 tests passing across 66 test files

**Key Decisions:**

- Migration runs on server startup before accepting requests (no separate entrypoint needed)
- `autoMigrate()` is idempotent — Drizzle tracks applied migrations in `__drizzle_migrations` table
- Docker deployment unchanged — the auto-migration at startup replaces the need for `docker-entrypoint` scripts
- No `--force` flag in any production path

---

## Track Dependencies Graph

```
 T-01 (Scaffolding)  ── ✅
 ├── T-02 (Database) ── ✅ ───────────────┐
 │    ├── T-03 (Auth) ── ✅               │
 │    │    ├── T-05 (Dashboard) ✅ ───────┤
 │    │    │    ├── T-06 (Toggles) ✅ ────┤
 │    │    │    │    ├── T-08 (Grid) ✅ ──┤
 │    │    │    │    │    └── T-10 (Reading) ✅
 │    │    │    │    │    │    └── T-16 (Code
 │    │    │    │    │    │         Quality) ✅
 │    │    │    │    │                    │
 │    │    │    │    └── T-15 (De-clutter) ✅
 │    │    │    │                         │
 │    │    │    └── T-11 (Child Mode) ✅ ─┤
 │    │    │                              │
 │    │    └── T-16 (Code Quality) ✅ ────┤
 │    └── T-07 (Harakat) ✅ ─────────────┤
 │                                        │
 T-03b (Code Quality) ── ✅               │
 T-04 (i18n — parallel) ✅                │
 T-09 (Audio — parallel) ✅               │
 T-20 (Vite 8 Upgrade) ✅                │
                                             ▼
                                        T-12 (Polish & Deploy) ✅
                                             │
                                   ┌────────┼─────────┐
                                   ▼        ▼         ▼
                             T-17 (Infra  T-18 (Error   └── T-16
                              & Audio) ✅  Classify) ✅      (cont.)
                                    │           │
                                    ▼           ▼
                             T-13 (Parent  T-19 (Security
                              Gate) ✅      Hardening) ✅
                                    │
                                    ▼
                             T-14 (Reading Visual
                                  Alignment) ✅
                                    │
                                    ▼
                             T-15 (Dashboard
                                  De-clutter) ✅
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
