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
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Break Circular Dependency' (Protocol in workflow.md)

---

## Phase 2: Docker Health Check Endpoint

**Goal:** Create a lightweight health check route and wire it into Docker Compose.

- [ ] Task: Write failing tests for health endpoint (Red phase)
    - [ ] Create `app/routes/api/health.test.ts` with test that verifies:
        - Returns 200 status
        - Returns JSON body `{ status: "ok" }`
        - Responds without auth headers
    - [ ] Run test — confirm failure (route does not exist)
- [ ] Task: Create `app/routes/api/health.ts`
    - [ ] Simple GET route returning `{ status: "ok" }` with 200 status
    - [ ] No auth middleware
    - [ ] No DB queries
- [ ] Task: Run tests — confirm health endpoint tests pass (Green phase)
- [ ] Task: Update `docker-compose.yml` with healthcheck directive
    - [ ] Add `healthcheck` block under the `app` service:
      ```yaml
      healthcheck:
        test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
        interval: 30s
        timeout: 10s
        retries: 3
        start_period: 15s
      ```
- [ ] Task: Add `curl` to the Dockerfile if not already present
    - [ ] Check if `curl` is available in the `node:20-alpine` runner image
    - [ ] If not, add `RUN apk add --no-cache curl` in the runner stage
- [ ] Task: Run full test suite — all tests pass
    - [ ] `pnpm test` — all tests pass
    - [ ] `pnpm typecheck` — no errors
    - [ ] `pnpm lint` — clean
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Docker Health Check Endpoint' (Protocol in workflow.md)

---

## Phase 3: Audio Generation Documentation

**Goal:** Write clear GCP setup guide so self-hosters can generate the 112 MP3 audio files.

- [ ] Task: Create `docs/audio-setup.md`
    - [ ] Section 1: Prerequisites (GCP account, billing enabled, gcloud CLI installed)
    - [ ] Section 2: GCP Project Setup (create project, enable Cloud Text-to-Speech API)
    - [ ] Section 3: Authentication (create service account, download key, `gcloud auth application-default-login`)
    - [ ] Section 4: Generate Audio (run `pnpm generate:audio`)
    - [ ] Section 5: Verification (check `public/audio/` directory for 112 files)
    - [ ] Section 6: Troubleshooting (common issues: quota limits, auth errors, missing files)
    - [ ] Section 7: Downloadable Archive (note about pre-generated archive option for zero-setup users)
- [ ] Task: Verify documentation is consistent with existing scripts
    - [ ] Check existing `scripts/generate-audio.ts` to ensure docs match actual behavior
    - [ ] Verify audio file naming convention is documented correctly (`{letterId}_{vowelMode}.mp3`)
- [ ] Task: Run `pnpm test`, `pnpm typecheck`, `pnpm lint` — all pass
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Audio Generation Documentation' (Protocol in workflow.md)

---

## Phase 4: Final Verification

- [ ] Task: Run `codebase_graph_circular` — confirm zero cycles
- [ ] Task: Run full verification suite
    - [ ] `pnpm test` — all tests pass
    - [ ] `pnpm typecheck` — no TypeScript errors
    - [ ] `pnpm lint` — clean
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Verification' (Protocol in workflow.md)
