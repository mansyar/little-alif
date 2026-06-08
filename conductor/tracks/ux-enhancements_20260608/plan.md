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
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Group Header Speaks' (Protocol in workflow.md)

## Phase 5: Reading Row Progress Indicator

- [ ] Task: Write tests for row progress tracking
  - [ ] Test: Untapped row shows no completion indicator
  - [ ] Test: Fully tapped row shows checkmark and green border
  - [ ] Test: Row counter updates as cells are tapped
  - [ ] Test: Progress resets on group switch
  - [ ] Test: Progress resets on shuffle
- [ ] Task: Implement tap tracking in ReadingGrid
  - [ ] Add `useRef<Set<string>>` for tapped cells keyed by `"rowIndex-cellIndex"`
  - [ ] Pass `onCellTap(rowIndex, cellIndex)` callback to `ReadingCell`
  - [ ] Compute completed rows from the set
- [ ] Task: Add visual indicators
  - [ ] Completed row: 2px green border + checkmark icon
  - [ ] Row counter: `aria-label` only (no visible text for pre-literate children)
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Reading Row Progress' (Protocol in workflow.md)

## Phase 6: Swipeable Letter Detail Overlay

- [ ] Task: Write tests for swipe navigation
  - [ ] Test: Swipe left goes to next letter
  - [ ] Test: Swipe right goes to previous letter
  - [ ] Test: Wrap-around from last → first (and first → last)
  - [ ] Test: Audio plays on swipe-navigated letter
  - [ ] Test: Swipe during playback cancels previous utterance
  - [ ] Test: Sub-threshold swipe (< 50px) does not navigate
  - [ ] Test: Single letter: swipe is a no-op (stays on same letter)
- [ ] Task: Add swipe handlers to LetterDetail
  - [ ] Track `pointerDown` position (x, y) and `pointerUp` position
  - [ ] Calculate X-axis delta; if |delta| >= 50px and horizontal > vertical, trigger navigation
  - [ ] Update `selectedLetterId` in store to the target letter
  - [ ] Auto-play audio for the new letter
- [ ] Task: Handle edge cases
  - [ ] Cancel previous utterance on swipe (audioEngine.cancel())
  - [ ] Ignore vertical swipes (deltaY > deltaX)
  - [ ] Disable pointer events during audio playback? No — swipes should still work
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Swipeable Overlay' (Protocol in workflow.md)

## Phase 7: Reading Completion Acknowledgement

- [ ] Task: Write tests for completion animation
  - [ ] Test: "Done" on last group triggers animation before redirect
  - [ ] Test: Green pulse animation plays for ~1s
  - [ ] Test: Checkmark icon appears during animation
  - [ ] Test: Navigation to /learn fires after animation completes
  - [ ] Test: Component unmount during animation safely navigates immediately
- [ ] Task: Implement completion animation in reading route
  - [ ] Detect when `onDone` is called on the last group
  - [ ] Add green overlay pulse + checkmark animation state
  - [ ] After 1s timeout, navigate to `/learn`
- [ ] Task: Conductor - User Manual Verification 'Phase 7: Completion Acknowledgement' (Protocol in workflow.md)

## Verification

- [ ] Run full test suite: `pnpm test` — all passing
- [ ] Run type checker: `pnpm typecheck` — clean
- [ ] Run linter: `pnpm lint` — no new warnings
- [ ] Manual verification per Phase Completion protocol
      </protect>
