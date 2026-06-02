import { AudioEngine } from './audio-engine';

// ---------------------------------------------------------------------------
// Idempotency guard — prevents double warm-up within the same page lifetime.
// Resets on page reload (not SPA navigation), which is the desired behaviour.
// ---------------------------------------------------------------------------

let preloaded = false;

/**
 * Warm up the SpeechSynthesis engine during browser idle time so the first
 * real utterance has near-instant latency instead of ~500ms cold-start delay.
 *
 * - Fire-and-forget: returns `void`, no Promise or async state.
 * - Idempotent: only the first call triggers warm-up.
 * - Graceful: silently exits when SpeechSynthesis is unavailable, voices
 *   haven't been scanned yet, or an utterance is actively playing.
 *
 * @param engine - An initialised `AudioEngine` instance (singleton).
 */
export function preloadOnIdle(engine: AudioEngine): void {
  // Idempotency guard
  if (preloaded) return;
  if (!engine.isSupported) return;

  const adapter = engine.adapter!;
  // Don't interfere with active playback
  if (adapter.speaking) return;

  const voice = engine.voice;
  // Graceful skip if voices haven't been scanned yet
  if (!voice) return;

  // Mark as preloaded immediately to prevent double scheduling
  preloaded = true;

  // Schedule warm-up during browser idle time
  // Fallback to setTimeout for browsers without requestIdleCallback
  const schedule =
    typeof requestIdleCallback !== 'undefined'
      ? (cb: () => void) => requestIdleCallback(cb)
      : (cb: () => void) => setTimeout(cb, 1000);

  schedule(() => {
    const utterance = adapter.createUtterance('');
    utterance.voice = voice;
    adapter.speak(utterance);
  });
}

/**
 * Reset the idempotency guard. Useful in tests between runs.
 */
export function resetPreloader(): void {
  preloaded = false;
}
