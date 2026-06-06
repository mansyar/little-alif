# Specification: Infrastructure & Audio Polish

**Track ID:** `infra-audio-polish_20260606`
**Type:** Chore/Polish
**Dependencies:** T-12 (Polish, Docker & Deployment)

## Overview

Improve production infrastructure and self-hosting ergonomics for Little Alif. Break the only circular dependency in the code graph (`auth-fns.ts` ↔ `profiles.ts`), add a Docker health check endpoint for orchestrator monitoring, and document the GCP TTS audio generation setup for self-hosters.

**PRD Ref:** §8 (Non-Functional Requirements)
**TDD Ref:** §12 (Deployment Configuration), §7 (Audio Architecture)
**Roadmap Ref:** T-17

---

## Functional Requirements

### FR-1: Break Circular Dependency

Break the only circular dependency in the codebase (`auth-fns.ts` ↔ `profiles.ts`). Currently, `auth-fns.ts` imports `getActiveProfile` from `profiles.ts`, while `profiles.ts` imports from `auth-fns.ts`.

- **Approach:** Inline the profile userId lookup directly into `buildChildSession()` in `auth-fns.ts`, removing the import of `profiles.ts` from `auth-fns.ts`.
- `buildChildSession()` already receives the `db` parameter and queries the `profiles` table — the only thing it needs from `profiles.ts` is a profile ownership check. This can be reduced to a direct `db.select({ userId: profiles.userId }).from(profiles).where(eq(profiles.id, payload.profileId))` query inline.
- The `enableChildMode` function in `auth-fns.ts` also imports from `profiles.ts` — replace with its own inline profile query.
- **Result:** `auth-fns.ts` no longer imports from `profiles.ts`. Circular dependency eliminated.
- **Verification:** `codebase_graph_circular` reports zero cycles.

### FR-2: Docker Health Check Endpoint

Create a lightweight health check endpoint for orchestrator (Docker, Coolify) monitoring.

- Create `app/routes/api/health.ts` — a GET route returning `200 { status: "ok" }`.
- No authentication required — liveness checks should never depend on auth.
- No database query — a failing DB should not prevent liveness detection.
- Simple JSON response, minimal processing.
- Add `healthcheck` directive to `docker-compose.yml`:
  - HTTP GET to `http://localhost:3000/api/health`
  - 30-second interval
  - 3 retries before marking unhealthy
  - 10-second timeout per check

### FR-3: Audio Generation Documentation

Write a clear GCP setup guide for self-hosters who want to generate the 112 MP3 audio files (28 letters × 4 harakat modes).

- Create `docs/audio-setup.md` covering:
  - GCP project creation steps
  - Cloud Text-to-Speech API enablement
  - Service account setup and authentication (`gcloud auth application-default-login`)
  - Running the existing `pnpm generate:audio` script
  - Note about downloadable archive option for users who want zero setup
- The `edge-tts` alternative script is **out of scope** per user decision.

---

## Non-Functional Requirements

- Health endpoint must respond in < 100ms under no load
- Circular dependency fix must not change any external behavior
- Documentation must be followable by someone with basic CLI experience

---

## Key Decisions

| #   | Decision                                                           | Rationale                                                               |
| --- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| KD-1 | Health endpoint is a static file route (no DB call)                | A failing DB should not prevent liveness detection                      |
| KD-2 | Circular dep fix by inlining, not by moving functions              | Preserves responsibility boundaries, minimal diff                       |
| KD-3 | GCP docs only; no edge-tts script                                  | Per user preference — GCP remains the primary path                      |
| KD-4 | Audio file naming convention stays unchanged                       | `{letterId}_{vowelMode}.mp3` — backward compatible                      |

---

## Edge Cases

- No audio files present → AudioEngine falls back to Web Speech API (existing behavior — no crash)
- Health endpoint called without env vars → still returns 200 (liveness check, not config check)
- `fetch` unavailable in older Node → use `http.get` in healthcheck command
- Partial audio files → engine plays what exists, falls back for the rest

---

## Acceptance Criteria

1. `codebase_graph_circular` reports zero cycles after the fix
2. `docker compose up` shows health status as `healthy`
3. `curl localhost:3000/api/health` returns `200 { status: "ok" }`
4. Self-hoster with no GCP account can follow `docs/audio-setup.md` and produce audio within 15 minutes
5. `pnpm test`, `pnpm typecheck`, `pnpm lint` all pass
6. All existing tests pass unchanged (non-breaking changes only)

---

## Out of Scope

- edge-tts / non-GCP audio generation script
- Audio engine changes or improvements
- Error classification system (T-18)
- Any user-facing feature changes
