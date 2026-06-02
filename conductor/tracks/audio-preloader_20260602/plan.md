<protect>
# Plan: Audio Preloader (Idle Warm-up)

**Track:** audio-preloader_20260602
**Dependencies:** T-09 (Audio Service — AudioEngine singleton + adapter pattern)
**Est. Effort:** ~1h

---

## Phase 1: Implement Audio Preloader Module

### Phase 1 Tasks

- [x] **Task: Create preloader module (`app/lib/audio/preloader.ts`)** `[714c7f3]`
  - [x] **Write failing tests** — Created `app/lib/audio/preloader.test.ts` with 7 tests covering all ACs
  - [x] Confirm tests fail (Red phase) — Confirmed: module not found error
  - [x] **Implement `preloadOnIdle(engine: AudioEngine): void`** — Main function with `requestIdleCallback`, `setTimeout` fallback
  - [x] **Implement idempotency guard** — `let preloaded = false` prevents double warm-up
  - [x] **Implement graceful skipping** — Silent exit when: engine not supported, voice cache empty, or utterance active
  - [x] Run tests and verify they pass (Green phase) — All 234 tests pass (31 files)

- [x] **Task: Integrate preloader into `/learn` route** `[979fce7]`
  - [x] Import `preloadOnIdle` and `audioEngine` singleton in `app/routes/learn.tsx`
  - [x] Call `preloadOnIdle(audioEngine)` on route mount (in component's `useEffect`)
  - [x] Verified no side effects — route is minimal placeholder, preloader fires once on mount

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Implement Audio Preloader Module' (Protocol in workflow.md)**
      </protect>
