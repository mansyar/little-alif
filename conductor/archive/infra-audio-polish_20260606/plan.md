# Implementation Plan: Infrastructure & Audio Polish

**Track:** infra-audio-polish_20260606
**Est. Effort:** ~1.5-2h

---

## Phase 1: Break Circular Dependency (auth-fns.ts ↔ profiles.ts)

**Goal:** Eliminate the circular dependency by inlining profile userId lookups directly in `auth-fns.ts`, removing the import of `profiles.ts`.

- [x] Task: Verify existing tests pass before making changes (baseline)
  - [x] Run `pnpm test` — confirm all tests pass
- [x] Task: Inline profile lookup in `buildChildSession()` — already had inline query
- [x] Task: Inline profile lookup in `enableChildMode()` — replaced with inline `db.select({ name: profiles.name, avatar: profiles.avatar }).from(profiles).where(and(eq(profiles.id, profileId), eq(profiles.userId, userId)))` query
- [x] Task: Remove the `import { getActiveProfile } from './profiles'` statement from `auth-fns.ts`
- [x] Task: Remove the `import { getActiveProfile } from '../server/profiles'` or equivalent from test files if they relied on re-exports through `auth-fns.ts` — updated mocks instead
- [x] Task: Run full test suite — confirm all tests pass (Green phase) `[b96a750]`
  - [x] `pnpm test` — all tests pass (522/522)
  - [x] `pnpm typecheck` — no errors (pre-existing errors in profiles.test.ts)
  - [x] `pnpm lint` — clean (pre-existing errors unchanged)
- [x] Task: Verify circular dependency is resolved
  - [x] Run `codebase_graph_circular` — zero cycles reported
- [x] Task: Conductor - User Manual Verification 'Phase 1: Break Circular Dependency' (Protocol in workflow.md) ✅ User approved

---

## Phase 2: Docker Health Check Endpoint

**Goal:** Create a lightweight health check route and wire it into Docker Compose.

- [x] Task: Write failing tests for health endpoint (Red phase) `[5c3fac4]`
  - [x] Create `app/routes/api/health.test.ts` with test that verifies expected behavior
  - [x] Run test — confirms module doesn't exist (red phase passes)
- [x] Task: Create `app/routes/api/health.ts`
  - [x] Simple GET route returning `{ status: "ok" }` with 200 status
  - [x] No auth middleware
  - [x] No DB queries
- [x] Task: Run tests — confirm health endpoint tests pass (Green phase) — 3/3 pass
- [x] Task: Update `docker-compose.yml` with healthcheck directive
- [x] Task: Add `curl` to the Dockerfile
- [x] Task: Run full test suite — all 525 tests pass
- [x] Task: Conductor - User Manual Verification 'Phase 2: Docker Health Check Endpoint' ✅ Review verified

---

## Phase 3: Audio Generation Documentation

**Goal:** Write clear GCP setup guide so self-hosters can generate the 112 MP3 audio files.

- [x] Task: Create `docs/audio-setup.md` `[77007f7]`
  - [x] Section 1: Prerequisites (GCP account, billing enabled, gcloud CLI installed)
  - [x] Section 2: GCP Project Setup (create project, enable Cloud Text-to-Speech API)
  - [x] Section 3: Authentication (service account, ADC, `gcloud auth application-default-login`)
  - [x] Section 4: Generate Audio (run `pnpm generate:audio`)
  - [x] Section 5: Verification (check `public/audio/` directory for 112 files)
  - [x] Section 6: Troubleshooting (common issues: quota limits, auth errors, missing files)
  - [x] Section 7: Downloadable Archive (note about pre-generated archive option)
- [x] Task: Verify documentation is consistent with existing scripts
  - [x] Checked existing `scripts/generate-audio.ts` — docs match actual behavior
  - [x] Audio file naming convention documented correctly (`{letterId}_{vowelMode}.mp3`)
- [x] Task: Run `pnpm test` (525/525 pass), `pnpm typecheck` (only pre-existing errors), `pnpm lint` (only pre-existing errors)
- [x] Task: Conductor - User Manual Verification 'Phase 3: Audio Generation Documentation' ✅ User approved

---

## Phase 4: Final Verification

## Phase 4: Final Verification

- [x] Task: Run `codebase_graph_circular` — zero cycles confirmed
- [x] Task: Run full verification suite
  - [x] `pnpm test` — all tests pass (525/525)
  - [x] `pnpm typecheck` — only pre-existing errors remain
  - [x] `pnpm lint` — only pre-existing errors remain
- [x] Task: Conductor - User Manual Verification 'Phase 4: Final Verification' ✅ User approved
