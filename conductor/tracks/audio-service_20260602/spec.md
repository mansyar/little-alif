# T-09: Audio Service (Web Speech API)

## Overview

Implement an audio service using the **Web Speech API (SpeechSynthesis)** to provide Arabic letter pronunciation for the child learning experience. The service is a singleton class (`AudioEngine`) that manages voice selection, utterance lifecycle, and idle-time preloading. It is consumed by both the Child Letter Grid (T-08) and Reading Practice (T-10) components.

This track **replaces** the original pre-recorded MP3 approach from the TDD §7 with TTS-based pronunciation — no audio file generation or management is needed for Phase 1.

## References

- **PRD:** §4 — Module 6 (Audio Engine), REQ-6.1 through REQ-6.4
- **TDD:** §1 — `app/lib/audio/AudioEngine.ts`, `app/lib/audio/preloader.ts`
- **Tech Stack:** §Audio — Web Speech API primary, Arabic voice (ar-SA preferred), idle-time preloading via requestIdleCallback

## Files to Create

- `app/lib/audio/AudioEngine.ts` — Singleton managing SpeechSynthesis lifecycle
- `app/lib/audio/preloader.ts` — Idle-time voice preloading utilities
- `app/lib/audio/__tests__/AudioEngine.test.ts` — Unit tests with mocked SpeechSynthesis
- `app/lib/audio/__tests__/preloader.test.ts` — Preloader unit tests

## Functional Requirements

### FR-1: Voice Selection

- On first `speak()` call, scan available voices for an Arabic match (`ar-SA` > `ar-XA` > any voice with `lang` starting with `'ar'`).
- Cache the selected voice — do not re-scan on every call.
- If no Arabic voice is available, fall back to the browser's default voice.

### FR-2: Pronunciation Playback

- `speak(letterChar: string, vowelMode: VowelMode): Promise<void>` — builds the full pronunciation text using `composeLetter()` from `app/lib/utils/harakat.ts`, then calls `speechSynthesis.speak()`.
- Returns a Promise that resolves when the utterance ends (`onend` event).
- `speakingRate` set to `0.85` (slower for children).
- If a previous utterance is still playing when `speak()` is called again, cancel it first before starting the new one.

### FR-3: Graceful Degradation

- If `SpeechSynthesis` is unavailable (very rare — older browsers, some iOS WebViews), `speak()` resolves silently without error. Components check `AudioEngine.isSupported` to disable audio-related UI if needed.
- No audio fallback UI needed for Phase 1 (letters highlight visually but make no sound).

### FR-4: Idle Preloading

- On idle (via `requestIdleCallback`), call `speechSynthesis.speak()` with an empty/short utterance to warm up the SpeechSynthesis engine.
- Voice preloading reduces latency on the first real utterance from ~500ms to near-instant.
- Preloader is idempotent and non-blocking.

### FR-5: API Pattern — Singleton Class

- `AudioEngine` is a singleton class (module-level instance). Components import and call directly — no React context or hooks wrapper.
- Exposes: `init()`, `speak()`, `cancel()`, `isSupported: boolean`, `dispose()`.
- Matching the existing functional pattern used by `app/lib/utils/harakat.ts`.

## Non-Functional Requirements

### NFR-1: Latency

- First utterance after voice load: < 600ms.
- Subsequent utterances (after preloading): < 150ms.

### NFR-2: Error Handling

- All errors caught internally — no unhandled promise rejections.
- Silent no-op when SpeechSynthesis is unavailable.

### NFR-3: Testability (Adapter Pattern)

- `AudioEngine` uses a thin internal adapter/facade over `window.speechSynthesis`.
- Adapter is injectable/mockable in unit tests.
- Tests verify: voice selection logic, utterance configuration (rate, text), cancel behavior, error paths.

## Acceptance Criteria

1. `AudioEngine.speak('ب', 'fathah')` → pronounces "ba" using Arabic voice
2. `AudioEngine.speak('ب', 'kasrah')` → pronounces "bi" using Arabic voice
3. `AudioEngine.speak('ب', 'dammah')` → pronounces "bu" using Arabic voice
4. Rapid successive `speak()` calls → previous utterance cancelled, only last one plays
5. Voice selection prefers `ar-SA` > `ar-XA` > any `ar` > default
6. `AudioEngine.isSupported` is `false` when SpeechSynthesis is unavailable
7. `speak()` resolves silently when SpeechSynthesis is unavailable
8. Preloader runs on idle and warms up the engine without side effects
9. All unit tests pass with mocked SpeechSynthesis

## Out of Scope

- Pre-recorded MP3 audio files (deferred — use MP3s if TTS quality proves insufficient)
- Volume/gain control (device volume handles this)
- Audio visualizations or waveform display
- Recording or speech recognition
