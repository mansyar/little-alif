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

- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Database Schema & Seed Data

**Goal:** Define Drizzle schema, apply migrations, and seed the 28-letter Arabic alphabet master table.

- [ ] Task: Install database dependencies
    - [ ] Install Drizzle ORM (`drizzle-orm`)
    - [ ] Install libSQL driver (`@libsql/client`)
    - [ ] Install Drizzle Kit (`drizzle-kit`) for migrations
    - [ ] Configure `drizzle.config.ts` pointing to SQLite file

- [ ] Task: Write Drizzle schema definitions
    - [ ] Create `app/db/schema.ts` with:
        - `profiles` table: id, name, avatar, vowel_mode, created_at, updated_at
        - `letters` table: id (text enum), character, display_order, audio_files (text/JSON)
        - `letter_toggles` table: id, profile_id (FK → profiles), letter_id (FK → letters), is_visible (integer, default 0)
    - [ ] Configure cascade deletes: profile deletion → cascades to letter_toggles
    - [ ] Verify schema types are correct

- [ ] Task: Create DB client initialization
    - [ ] Create `app/db/index.ts` — initialize libSQL client and drizzle instance
    - [ ] Support both local SQLite file and Turso remote (via DATABASE_URL)
    - [ ] Verify client connects successfully

- [ ] Task: Create seed script for 28 letters
    - [ ] Create `app/db/seed.ts` with:
        - Idempotent insert (check for existing data before inserting)
        - All 28 Arabic letters: character, display_order (1–28), audio_files (JSON string mapping modes)
        - Correct letter order per roadmap T-02
    - [ ] Run seed script, verify 28 letters inserted

- [ ] Task: Apply database migrations
    - [ ] Run `pnpm drizzle-kit push` to create tables
    - [ ] Verify all tables exist: profiles, letters, letter_toggles
    - [ ] Verify seed data is correct (28 letters)

- [ ] Task: Write tests for database layer
    - [ ] Create test for DB schema — verify table structure matches expectations
    - [ ] Create test for seed script — verify idempotency and data integrity
    - [ ] Run all tests, confirm they pass

- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Authentication (Better Auth)

**Goal:** Integrate Better Auth for email/password authentication with session management, CSRF protection, and route protection.

- [ ] Task: Install and configure Better Auth
    - [ ] Install Better Auth (`better-auth`)
    - [ ] Install Better Auth Drizzle adapter (`better-auth/adapters/drizzle`)
    - [ ] Create Better Auth configuration with Drizzle adapter
    - [ ] Configure session: HttpOnly, Secure, SameSite=Lax, 30-day expiry
    - [ ] Verify Better Auth initializes without errors

- [ ] Task: Create auth server functions
    - [ ] Create `app/server/auth.ts` with:
        - `registerFn` — email/password registration with Zod validation
        - `loginFn` — email/password login with session creation
        - `logoutFn` — session destruction
        - `validateSessionFn` — session check middleware
    - [ ] Add Zod validation schemas for auth inputs (`app/lib/validations/auth.ts`)

- [ ] Task: Create auth middleware
    - [ ] Create `app/server/middleware.ts` with session check
    - [ ] Configure `beforeLoad` hook for protected routes
    - [ ] Verify unauthenticated requests redirect to `/login`

- [ ] Task: Create login and registration pages
    - [ ] Create `app/routes/login.tsx` — login form with email/password fields
    - [ ] Create `app/routes/register.tsx` — registration form with email/password fields
    - [ ] Use Radix UI Dialog for forms
    - [ ] Add error handling and validation feedback
    - [ ] Add loading states during form submission

- [ ] Task: Create landing page with auth gate
    - [ ] Create/update `app/routes/index.tsx` — landing page
    - [ ] Add auth gate: check session → redirect to dashboard or login
    - [ ] Create placeholder dashboard page for authenticated users

- [ ] Task: Write tests for authentication
    - [ ] Create test for register server function — verify user creation
    - [ ] Create test for login server function — verify session creation
    - [ ] Create test for logout server function — verify session destruction
    - [ ] Create test for auth middleware — verify route protection
    - [ ] Create test for Zod schemas — verify validation rules
    - [ ] Run all tests, confirm they pass

- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
