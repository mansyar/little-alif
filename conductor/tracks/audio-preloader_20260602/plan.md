<protect>
# Plan: Audio Preloader (Idle Warm-up)

**Track:** audio-preloader_20260602
**Dependencies:** T-09 (Audio Service — AudioEngine singleton + adapter pattern)
**Est. Effort:** ~1h

---

## Phase 1: Implement Audio Preloader Module

### Phase 1 Tasks

- [ ] **Task: Create preloader module (`app/lib/audio/preloader.ts`)**
  - [ ] **Write failing tests** — Create `app/lib/audio/__tests__/preloader.test.ts` with tests covering:
    - Calling `preloadOnIdle(engine)` triggers `speechSynthesis.speak()` with an empty utterance
    - Calling `preloadOnIdle()` twice only triggers one warm-up (idempotent)
    - Function returns immediately (no async/await, no Promise — verify `void` return type)
    - When `SpeechSynthesis` is unavailable (`!engine.isSupported`), function exits silently
    - When engine adapter has no cached voice, function exits silently
    - Preloader does not cancel or interfere with an active utterance
  - [ ] Confirm tests fail (Red phase) — Run `CI=true pnpm test -- --run src/lib/audio/__tests__/preloader.test.ts`
  - [ ] **Implement `preloadOnIdle(engine: AudioEngine): void`** — Main function:
    - Accept `AudioEngine` instance (dependency injection)
    - Use `requestIdleCallback` to schedule an empty utterance when browser is idle
    - Fall back to `setTimeout(..., 1000)` for browsers without `requestIdleCallback`
    - Create empty utterance using the cached Arabic voice from AudioEngine
    - Call `engine.adapter.speak(utterance)` to warm up
  - [ ] **Implement idempotency guard** — `let preloaded = false` boolean prevents double warm-up; second call is no-op
  - [ ] **Implement graceful skipping** — Exit silently when: engine not supported, voice cache empty, or utterance already active
  - [ ] Run tests and verify they pass (Green phase) — `CI=true pnpm test -- --run src/lib/audio/__tests__/preloader.test.ts`

- [ ] **Task: Integrate preloader into `/learn` route**
  - [ ] Import `preloadOnIdle` and `audioEngine` singleton in `app/routes/learn.tsx`
  - [ ] Call `preloadOnIdle(audioEngine)` on route mount (in component's `useEffect` or `onMount`)
  - [ ] Verify no side effects during active playback or navigation

- [ ] **Task: Conductor - User Manual Verification 'Phase 1: Implement Audio Preloader Module' (Protocol in workflow.md)**
      </protect>
