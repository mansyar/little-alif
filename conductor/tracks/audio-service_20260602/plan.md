# Implementation Plan — T-09: Audio Service (Web Speech API)

## Phase 1: SpeechSynthesis Adapter & AudioEngine Singleton

**Goal:** Create the core AudioEngine class with voice selection, playback, cancel, and graceful degradation.

### Tasks

- [ ] Task: Write failing tests for the SpeechSynthesis adapter layer
  - [ ] Create `app/lib/audio/__tests__/AudioEngine.test.ts`
  - [ ] Test: `mockSpeechSynthesis` adapter factory returns controlled mock
  - [ ] Test: `getVoice()` prefers `ar-SA` > `ar-XA` > any `ar` > default voice
  - [ ] Test: `getVoice()` caches result (calls `getVoices()` only once)
  - [ ] Confirm tests fail (red phase)

- [ ] Task: Implement SpeechSynthesis adapter
  - [ ] Create `app/lib/audio/AudioEngine.ts` with internal adapter interface
  - [ ] Implement: `getVoice()` with caching, `speak(utterance)`, `cancel()`, `onvoiceschanged` handler
  - [ ] Confirm tests pass (green phase)

- [ ] Task: Write failing tests for AudioEngine public API
  - [ ] Test: `speak('ب', 'fathah')` calls `composeLetter('ب', 'fathah')` and produces utterance with correct text
  - [ ] Test: `speak()` sets `utterance.rate` to `0.85`
  - [ ] Test: Rapid `speak()` calls cancel previous utterance before starting new one
  - [ ] Test: `speak()` returns a Promise that resolves on `onend` event
  - [ ] Test: `isSupported` returns `false` when SpeechSynthesis is unavailable
  - [ ] Test: `speak()` resolves silently when SpeechSynthesis is unavailable (no throw)
  - [ ] Confirm tests fail (red phase)

- [ ] Task: Implement AudioEngine public API
  - [ ] Implement `speak(letterChar, vowelMode): Promise<void>` using composeLetter
  - [ ] Implement cancel-on-new-speak (track current utterance)
  - [ ] Implement graceful degradation: check SpeechSynthesis availability
  - [ ] Wire up Promise resolve/reject with utterance `onend` / `onerror` events
  - [ ] Set `utterance.rate`, `utterance.voice` from cached voice
  - [ ] Confirm tests pass (green phase)

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
