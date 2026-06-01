# Implementation Plan: Initialize Project Scaffolding with TanStack Start, Database Schema, and Authentication

**Track:** `scaffolding_20260531`
**Status:** In Progress

---

## Phase 1: Project Scaffolding & Config

**Goal:** Initialize TanStack Start project with all foundational tooling, Tailwind CSS v4, and UI primitives.

- [x] Task: Initialize TanStack Start project with React + TypeScript + Vite (1e576fc)
  - [x] Run `pnpm create tanstack-app` with React + TypeScript template
  - [x] Verify project structure matches TDD §1
  - [x] Update `package.json` name/description for Little Alif
  - [x] Verify `pnpm dev` starts without errors

- [x] Task: Configure Tailwind CSS v4 with design tokens (1e576fc)
  - [x] Install Tailwind CSS v4 and dependencies
  - [x] Configure Tailwind in CSS with Cairo (Arabic) and Nunito (Latin) fonts
  - [x] Add design tokens: color palette, spacing scale, border-radius
  - [x] Create `app/lib/utils/cn.ts` — Tailwind class merging utility (clsx + tailwind-merge)
  - [x] Verify Tailwind classes apply on a test element

- [x] Task: Install UI primitives and icons (1e576fc)
  - [x] Install Radix UI: `@radix-ui/react-switch`, `@radix-ui/react-dialog`, `@radix-ui/react-alert-dialog`, `@radix-ui/react-radio-group`
  - [x] Install Lucide React icons
  - [x] Verify imports resolve correctly

- [x] Task: Scaffold Zustand stores (1e576fc)
  - [x] Install Zustand
  - [x] Create `app/stores/auth-store.ts` — auth + child mode state
  - [x] Create `app/stores/child-store.ts` — active child profile + letters
  - [x] Create `app/stores/ui-store.ts` — UI state: selected letter, loading, toasts
  - [x] Verify store creation compiles without errors

- [x] Task: Create configuration files (1e576fc)
  - [x] Create `vite.config.ts` — TanStack Start config (TanStack Start v1.168+ uses Vite plugin directly, no separate app.config.ts)
  - [x] Update `tsconfig.json` with strict mode and path aliases
  - [x] Create `.env.example` with required environment variables (DATABASE_URL, BETTER_AUTH_SECRET)
  - [x] Verify TypeScript compiles without errors

- [x] Task: Write tests for scaffolding verification (1e576fc)
  - [x] Create test for `cn.ts` utility — verify class merging works correctly
  - [x] Create test for Zustand stores — verify initial state is correct
  - [x] Run all tests, confirm they pass (21/21)

- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md) (user-approved)

---

## Phase 2: Database Schema & Seed Data

**Goal:** Define Drizzle schema, apply migrations, and seed the 28-letter Arabic alphabet master table.

- [x] Task: Install database dependencies (1e576fc)
  - [x] Install Drizzle ORM (`drizzle-orm`)
  - [x] Install libSQL driver (`@libsql/client`)
  - [x] Install Drizzle Kit (`drizzle-kit`) for migrations
  - [x] Configure `drizzle.config.ts` pointing to SQLite file

- [x] Task: Write Drizzle schema definitions (ce2f8e3)
  - [x] Create `app/db/schema.ts` with:
    - `profiles` table: id, name, avatar, vowel_mode, created_at, updated_at
    - `letters` table: id (text enum), character, display_order, audio_files (text/JSON)
    - `letter_toggles` table: id, profile_id (FK → profiles), letter_id (FK → letters), is_visible (integer, default 0)
  - [x] Configure cascade deletes: profile deletion → cascades to letter_toggles
  - [x] Verify schema types are correct

- [x] Task: Create DB client initialization (ce2f8e3)
  - [x] Create `app/db/index.ts` — initialize libSQL client and drizzle instance
  - [x] Support both local SQLite file and Turso remote (via DATABASE_URL)
  - [x] Verify client connects successfully

- [x] Task: Create seed script for 28 letters (ce2f8e3)
  - [x] Create `app/db/seed.ts` with:
    - Idempotent insert (check for existing data before inserting)
    - All 28 Arabic letters: character, display_order (1–28), audio_files (JSON string mapping modes)
    - Correct letter order per roadmap T-02
  - [x] Run seed script, verify 28 letters inserted

- [x] Task: Apply database migrations (ce2f8e3)
  - [x] Run `pnpm drizzle-kit push` to create tables
  - [x] Verify all tables exist: profiles, letters, letter_toggles
  - [x] Verify seed data is correct (28 letters)

- [x] Task: Write tests for database layer (ce2f8e3)
  - [x] Create test for DB schema — verify table structure matches expectations
  - [x] Create test for seed script — verify idempotency and data integrity
  - [x] Run all tests, confirm they pass (36/36)

- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Authentication (Better Auth)

**Goal:** Integrate Better Auth for email/password authentication with session management, CSRF protection, and route protection.

- [x] Task: Install and configure Better Auth (774b2f6)
  - [x] Install Better Auth (`better-auth`)
  - [x] Install Better Auth Drizzle adapter (`better-auth/adapters/drizzle`)
  - [x] Create Better Auth configuration with Drizzle adapter
  - [x] Configure session: HttpOnly, Secure, SameSite=Lax, 30-day expiry
  - [x] Verify Better Auth initializes without errors

- [x] Task: Create auth server functions (2387abe / 5dd5969)
  - [x] Create `app/server/auth.ts` with Better Auth singleton, drizzleAdapter, email/password, 30-day session
  - [x] Create `app/server/auth-fns.ts` with:
    - `registerFn` — email/password registration with Zod validation
    - `loginFn` — email/password login with session creation
    - `logoutFn` — session destruction
    - `validateSessionFn` — session check middleware
  - [x] Add Zod validation schemas for auth inputs (`app/lib/validations/auth.ts`)

- [x] Task: Create auth middleware (9d049f9)
  - [x] Configure `beforeLoad` hook for protected routes (dashboard.tsx)
  - [x] Verify unauthenticated requests redirect to `/login?redirect=/dashboard`
  - _Note: Middleware .server() requires returning Response; using beforeLoad in route definitions instead — cleaner for redirect-throwing flow._

- [x] Task: Create login and registration pages (9d049f9)
  - [x] Create `app/routes/login.tsx` — login form with email/password fields
  - [x] Create `app/routes/register.tsx` — registration form with email/password fields
  - [x] Add error handling and validation feedback
  - [x] Add loading states during form submission
  - _Note: Using plain HTML forms (not Radix Dialog) — Dialog is for modal interactions, not full pages._

- [x] Task: Create landing page with auth gate (9d049f9)
  - [x] Create/update `app/routes/index.tsx` — landing page with auth gate
  - [x] Add auth gate: check session → redirect to dashboard or login
  - [x] Create dashboard page for authenticated users (shows user.email + sign out)

- [x] Task: Write tests for authentication (c2d13eb / a68cffd / 29c2a32)
  - [x] Create test for register server function — verify user creation (helper + APIError translation tests; full integration verified via curl)
  - [x] Create test for login server function — verify session creation (helper tests; integration via curl)
  - [x] Create test for logout server function — verify session destruction (helper tests; integration via curl)
  - [x] Create test for auth middleware — verify route protection (curl: 307 to /login without auth, 200 with auth)
  - [x] Create test for Zod schemas — verify validation rules (8 tests pass)
  - [x] Run all tests, confirm they pass (59/59)

- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

---

## Phase: Review Fixes

- [x] Task: Apply review suggestions 22ba589
  - [x] Delete unused `app/lib/auth-client.ts` (exported `authClient` was never imported)
  - [x] Remove unused `out` field from `drizzle.config.ts` (migrations are not generated; `drizzle-kit push` is used)
  - [x] Remove no-op `font-display: block` from `.font-arabic` in `app/app.css` (the property only applies to `@font-face`; correct `display=block` is set via the Google Fonts URL in `__root.tsx`)
  - [x] Replace `<a href>` with TanStack `<Link>` in `login.tsx` and `register.tsx` for client-side navigation (and add the required `search={{ redirect: '/dashboard' }}` on the `/login` link to satisfy `validateSearch`)
  - [x] Replace `border-gray-200` with `border-sand-dark` in `login.tsx`, `register.tsx`, and `dashboard.tsx` to keep the form chrome within the design token palette
  - [x] Re-run `pnpm test` (59/59 pass) and `pnpm typecheck` (clean)
