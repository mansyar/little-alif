<protect>
# Spec: Audio Preloader (Idle Warm-up)

## Overview

Implement idle-time voice preloading to warm up the SpeechSynthesis engine, reducing first-utterance latency from ~500ms to near-instant. This is Phase 2 of the AudioEngine work that was deferred from T-09. The preloader runs on mount of the `/learn` (child letter grid) route, using `requestIdleCallback` with a `setTimeout` fallback to call `speechSynthesis.speak()` with an empty utterance.

**PRD Ref:** §4 — Module 6 (Audio Engine), REQ-6.6
**TDD Ref:** §7 (Audio Architecture — Idle Preloading)
**Dependencies:** T-09 (Audio Service)

---

## Functional Requirements

### FR-1: Preloader Module (`app/lib/audio/preloader.ts`)

- Export a function `preloadOnIdle(engine: AudioEngine): void` that accepts an `AudioEngine` instance (dependency injection).
- Uses `requestIdleCallback` to schedule an empty utterance when the browser is idle.
- Falls back to `setTimeout(..., 1000)` for browsers that don't support `requestIdleCallback`.
- Creates a short empty/silent utterance using the cached Arabic voice from the AudioEngine.
- Calls `engine.adapter.speak(utterance)` to warm up the SpeechSynthesis engine.

### FR-2: Idempotency Guard

- Internal boolean guard (`let preloaded = false`) prevents double warm-up.
- If `preloadOnIdle()` is called multiple times, only the first call triggers warm-up. Subsequent calls are no-ops.
- Guard resets only on page reload (not needed between route navigations in SPA).

### FR-3: Non-blocking Execution

- `preloadOnIdle()` returns `void` (no Promise).
- No hanging promises or async state — fire-and-forget.

### FR-4: Graceful Skipping

- If the engine is not initialized or `SpeechSynthesis` is unavailable (`!engine.isSupported`), the preloader silently exits — no errors, no side effects.
- If voice cache is empty (voices not yet scanned), the preloader silently exits.

### FR-5: Integration

- Called on mount of the `/learn` route (child letter grid page).
- Uses the existing `audioEngine` singleton as the engine reference.

---

## Non-Functional Requirements

| Category          | Requirement                                        | Target                         |
| ----------------- | -------------------------------------------------- | ------------------------------ |
| **Latency**       | First utterance after preload                      | < 150ms                        |
| **Performance**   | Preloader must not block main thread               | Uses idle callback             |
| **Side Effects**  | Must not interfere with active playback            | Guard prevents during speaking |
| **Compatibility** | Works in all browsers supported by SpeechSynthesis | Same as T-09                   |

---

## Acceptance Criteria

1. `preloadOnIdle(engine)` triggers `speechSynthesis.speak()` with an empty utterance.
2. Calling `preloadOnIdle()` twice only triggers one warm-up (idempotent).
3. Function returns immediately (no async/await, no Promise).
4. When `SpeechSynthesis` is unavailable, function exits silently.
5. When engine adapter has no cached voice, function exits silently.
6. Preloader does not cancel or interfere with an active utterance.
7. First utterance latency after preload is < 150ms.

---

## Out of Scope

- Integration into routes other than `/learn` (e.g., root layout).
- Multiple preload utterances or progressive warming.
- Preloading audio files or pre-recorded MP3s.
- Progress indicators or UI feedback for preload state.
  </protect>
