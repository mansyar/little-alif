<protect>
# Implementation Plan — T-21: UX Enhancements (v1.1)

## Phase 1: Persist Child's Last Harakat Selection

- [x] Task: Write tests for harakat cookie (get, set, fallback) `980b3ca`
  - [x] Test: Cookie initializes from valid value on mount
  - [x] Test: Cookie falls back to profile vowelMode when missing/corrupt
  - [x] Test: Cookie updates when child taps a different harakat
  - [x] Test: Cookie value is a valid VowelMode
- [x] Task: Implement harakat cookie read on mount `980b3ca`
  - [x] Add `readHarakatCookie(): VowelMode | null` utility
  - [x] Modify `ChildHarakatBar` initial read: check cookie before profile vowelMode
- [x] Task: Implement harakat cookie write on change `980b3ca`
  - [x] Add `writeHarakatCookie(mode: VowelMode): void` utility
  - [x] Wire into `setHarakat()` path so every harakat change updates the cookie
- [x] Task: Conductor - User Manual Verification 'Phase 1: Harakat Cookie' (Protocol in workflow.md)

## Phase 2: Page Transitions

- [x] Task: Write component tests for entrance animation presence `c264fd3`
  - [x] Test: `/learn` main element has animation class on mount
  - [x] Test: `/learn/reading` main element has animation class on mount
  - [x] Test: `LetterDetail` overlay has entrance animation class on open
  - [x] Test: `prefers-reduced-motion` disables animations (matchMedia mock)
- [x] Task: Add CSS keyframes to `app.css` `c264fd3`
  - [x] `@keyframes fadeInUp` — opacity 0→1, translateY 8px→0, 200ms, ease-out
  - [x] `@keyframes bounceIn` — scale 0.9→1.0, opacity 0→1, 250ms, elastic cubic-bezier
  - [x] `@keyframes pulseReplay` — opacity 60→100%, 3s interval, for reading cells (reserved for Phase 3)
  - [x] Respect `@media (prefers-reduced-motion: reduce)` — existing CSS handles zero-duration
- [x] Task: Apply animations to route components `c264fd3`
  - [x] Add `animate-fadeInUp` class to root `<main>` in `/learn` route
  - [x] Add `animate-fadeInUp` class to root `<main>` in `/learn/reading` route
  - [x] Add `animate-bounceIn` class to `LetterDetail` overlay on open
- [x] Task: Conductor - User Manual Verification 'Phase 2: Page Transitions' (Protocol in workflow.md)

## Phase 3: Tap-Replay Hint on Reading Cells

- [x] Task: Write tests for replay hint behavior `17ba93f`
  - [x] Test: Systematic row cell shows replay pulse after first tap
  - [x] Test: Replay pulse does not show during green-flash state
  - [x] Test: Replay pulse stops on re-tap
  - [x] Test: Mixed row cells never show replay pulse
- [x] Task: Implement `data-replay` attribute logic in `ReadingCell` `17ba93f`
  - [x] Track `replayPhase` state: idle → flashing → replay-pulse
  - [x] Set `data-replay="true"` during replay-pulse phase
  - [x] Clear on re-tap (re-enters flash state)
- [x] Task: Add CSS animation for replay pulse `17ba93f`
  - [x] `@keyframes pulseReplay` — opacity 60→100%, 3s interval
  - [x] `data-[replay=true]` binds `.animate-pulseReplay` class
- [x] Task: Conductor - User Manual Verification 'Phase 3: Tap-Replay Hint' (Protocol in workflow.md)

## Phase 4: Group Header Speaks

- [x] Task: Write tests for group header audio playback `9a0a629`
  - [x] Test: Tapping group header calls audioEngine.speak() for each letter
  - [x] Test: Letters play sequentially with 300ms gap
  - [x] Test: Incomplete groups (1-2 letters) speak only available letters
  - [x] Test: Rapid retaps cancel previous sequence and start new one
- [x] Task: Convert GroupHeader to a tappable button `9a0a629`
  - [x] Change root element from `<div>` to `<button type="button">`
  - [x] Preserve existing visual styling (no visual change)
  - [x] Add `aria-label="Tap to hear letter names"`
- [x] Task: Implement sequential audio playback `9a0a629`
  - [x] `playLetterSequence(letters: string[], getCharById)` — plays each letter with 300ms interval
  - [x] Cancel previous sequence on new tap (use `audioEngine.cancel()`)
  - [x] Use `letterId` with vowelMode='none' for isolated letter names
- [x] Task: Conductor - User Manual Verification 'Phase 4: Group Header Speaks' (Protocol in workflow.md)

## Phase 5: Reading Row Progress Indicator

- [x] Task: Write tests for row progress tracking
  - [x] Test: Untapped row shows no completion indicator
  - [x] Test: Fully tapped row shows checkmark and green border
  - [x] Test: Partial row tap updates aria-label count
  - [x] Test: Complete row has aria-label "complete"
  - [x] Note: Progress reset on group switch/shuffle handled by key remount in route
- [x] Task: Implement tap tracking in ReadingGrid
  - [x] Add `useState<Set<string>>` for tapped cells keyed by `"rowIndex-cellIndex"`
  - [x] Pass `onTap` callback to `ReadingCell` with captured rowIndex/cellIndex
  - [x] Compute completed rows from the set
- [x] Task: Add visual indicators
  - [x] Completed row: 2px green border + green checkmark in circle
  - [x] Row counter: `aria-label` only (no visible text for pre-literate children)
- [x] Task: Conductor - User Manual Verification 'Phase 5: Reading Row Progress' (Protocol in workflow.md)

## Phase 6: Swipeable Letter Detail Overlay

- [x] Task: Write tests for swipe navigation `0684007`
  - [x] Test: Swipe left goes to next letter
  - [x] Test: Swipe right goes to previous letter
  - [x] Test: Wrap-around from last → first (and first → last)
  - [x] Test: Audio plays on swipe-navigated letter
  - [x] Test: Swipe during playback cancels previous utterance
  - [x] Test: Sub-threshold swipe (< 50px) does not navigate
  - [x] Test: Single letter: swipe is a no-op (stays on same letter)
- [x] Task: Add swipe handlers to LetterDetail `0684007`
  - [x] Track `mouseDown` position (x, y) and `mouseUp` position
  - [x] Calculate X-axis delta; if |delta| >= 50px and horizontal > vertical, trigger navigation
  - [x] Update `selectedLetterId` in store to the target letter
  - [x] Auto-play audio for the new letter
- [x] Task: Handle edge cases `0684007`
  - [x] Cancel previous utterance on swipe (audioEngine.cancel())
  - [x] Ignore vertical swipes (deltaY > deltaX)
  - [x] Disable pointer events during audio playback? No — swipes should still work
- [x] Task: Conductor - User Manual Verification 'Phase 6: Swipeable Overlay' (Protocol in workflow.md)

## Phase 7: Reading Completion Acknowledgement

- [x] Task: Write tests for completion animation
  - [x] Test: "Done" on last group triggers animation before redirect
  - [x] Test: Green pulse animation plays for ~1s
  - [x] Test: Checkmark icon appears during animation
  - [x] Test: Navigation to /learn fires after animation completes
  - [x] Test: Component unmount during animation safely navigates immediately
- [x] Task: Implement completion animation in reading route
  - [x] Detect when `onDone` is called on the last group
  - [x] Add green overlay pulse + checkmark animation state
  - [x] After 1s timeout, navigate to `/learn`
- [x] Task: Conductor - User Manual Verification 'Phase 7: Completion Acknowledgement' (Protocol in workflow.md)

## Phase 8: Review Fixes

- [x] Task: Apply review suggestions `929c150`

## Verification

- [x] Run full test suite: `pnpm test` — all 600 passing
- [x] Run type checker: `pnpm typecheck` — clean
- [x] Run linter: `pnpm lint` — 0 warnings/errors
- [x] Manual verification per Phase Completion protocol
      </protect>
