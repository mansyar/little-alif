<protect>
# Implementation Plan — T-09: Audio Service (Web Speech API)

## Phase 1: SpeechSynthesis Adapter & AudioEngine Singleton

**Goal:** Create the core AudioEngine class with voice selection, playback, cancel, and graceful degradation.

### Tasks

- [x] Task: Write failing tests for the SpeechSynthesis adapter layer (4d0738f)
  - [x] Create `app/lib/audio/audio-engine.test.ts`
  - [x] Test: `mockSpeechSynthesis` adapter factory returns controlled mock
  - [x] Test: `getVoice()` prefers `ar-SA` > `ar-XA` > any `ar` > default voice
  - [x] Test: `getVoice()` caches result (calls `getVoices()` only once)
  - [x] Confirm tests fail (red phase)

- [x] Task: Implement SpeechSynthesis adapter (4d0738f)
  - [x] Create `app/lib/audio/audio-engine.ts` with internal adapter interface
  - [x] Implement: `getVoice()` with caching, `speak(utterance)`, `cancel()`, `onvoiceschanged` handler
  - [x] Confirm tests pass (green phase)

- [x] Task: Write failing tests for AudioEngine public API (4d0738f)
  - [x] Test: `speak('ب', 'fathah')` calls `composeLetter('ب', 'fathah')` and produces utterance with correct text
  - [x] Test: `speak()` sets `utterance.rate` to `0.85`
  - [x] Test: Rapid `speak()` calls cancel previous utterance before starting new one
  - [x] Test: `speak()` returns a Promise that resolves on `onend` event
  - [x] Test: `isSupported` returns `false` when SpeechSynthesis is unavailable
  - [x] Test: `speak()` resolves silently when SpeechSynthesis is unavailable (no throw)
  - [x] Confirm tests fail (red phase)

- [x] Task: Implement AudioEngine public API (4d0738f)
  - [x] Implement `speak(letterChar, vowelMode): Promise<void>` using composeLetter
  - [x] Implement cancel-on-new-speak (track current utterance)
  - [x] Implement graceful degradation: check SpeechSynthesis availability
  - [x] Wire up Promise resolve/reject with utterance `onend` / `onerror` events
  - [x] Set `utterance.rate`, `utterance.voice` from cached voice
  - [x] Confirm tests pass (green phase)

- [ ] Task: Conductor - Phase Completion Verification 'Phase 1: SpeechSynthesis Adapter & AudioEngine Singleton' (Protocol in workflow.md)

## Phase 2: Idle Preloader

**Goal:** Implement idle-time voice preloading to warm up the SpeechSynthesis engine.

### Tasks

- [ ] Task: Write failing tests for the preloader
  - [ ] Create `app/lib/audio/__tests__/preloader.test.ts`
  - [ ] Test: `preloadOnIdle()` calls `speechSynthesis.speak()` with empty utterance
  - [ ] Test: Preloader is idempotent (calling twice does not trigger double warm-up)
  - [ ] Test: Preloader is non-blocking (returns immediately, no hanging promises)
  - [ ] Confirm tests fail (red phase)

- [ ] Task: Implement preloader
  - [ ] Create `app/lib/audio/preloader.ts`
  - [ ] Export `preloadOnIdle(audioEngine)` — uses `requestIdleCallback` or `setTimeout` fallback
  - [ ] Warm-up: create empty utterance with cached voice and `speak()` it
  - [ ] Internal guard prevents double warm-up
  - [ ] Confirm tests pass (green phase)

- [ ] Task: Conductor - Phase Completion Verification 'Phase 2: Idle Preloader' (Protocol in workflow.md)

## Phase 3: Final Verification & Cleanup

**Goal:** Run full test suite, verify all acceptance criteria, and finalize the track.

### Tasks

- [ ] Task: Run full test suite and verify acceptance criteria
  - [ ] Run `pnpm test` — all existing + new tests pass
  - [ ] Run `pnpm typecheck` — no type errors
  - [ ] Run `pnpm lint` — no lint errors
  - [ ] Verify code coverage > 70% for `app/lib/audio/`
  - [ ] Verify Acceptance Criteria 1–9 from spec.md

- [ ] Task: Conductor - Phase Completion Verification 'Phase 3: Final Verification & Cleanup' (Protocol in workflow.md)

## Phase: Review Fixes

- [x] Task: Apply review suggestions d6505d1
      </protect>
