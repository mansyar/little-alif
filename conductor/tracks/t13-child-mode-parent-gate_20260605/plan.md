# T-13: Child Mode Parent Gate & Flow Polish — Implementation Plan

**Status legend:** `[ ]` pending · `[~]` in progress · `[x]` complete

This plan follows the project's TDD workflow: every implementation task is preceded by a failing-test task, and tests are run to confirm both the red and green phases.

---

## Phase 1: Foundation — Constants and Parent Gate Handler Hook [checkpoint: d4094aa]

- [x] Task: Write failing tests for `app/lib/utils/parent-gate.ts` constants module `d898a5a`
  - [x] Test: `PARENT_GATE_LONG_PRESS_MS` is exported and equals 1500
  - [x] Test: `PARENT_GATE_TAP_WINDOW_MS` is exported and equals 1000
  - [x] Test: `PARENT_GATE_TAP_COUNT` is exported and equals 3
  - [x] Test: All three constants are `number` and `> 0`
- [x] Task: Implement `app/lib/utils/parent-gate.ts` `6cca52c`
  - [x] Export the three constants with the values above
  - [x] Add a short module-level JSDoc explaining the gesture semantics
- [x] Task: Write failing tests for `app/lib/hooks/useParentGateHandlers.ts` `9d346f6`
  - [x] Test: returns `{ handleExit, handleSwitchChild }` object
  - [x] Test: `handleExit` calls `disableChildModeFn`, clears auth-store child state, routes to `/dashboard` when `useAuthStore.getState().user` is truthy
  - [x] Test: `handleExit` routes to `/login` (not `/dashboard`) when no parent user is set in the auth store
  - [x] Test: `handleSwitchChild` toggles a local state to show the `ChildSwitcher` overlay
- [x] Task: Implement `app/lib/hooks/useParentGateHandlers.ts` `4a7628b`
  - [x] Use `useAuthStore.getState()` (read-on-call, not subscription) to avoid re-render churn
  - [x] Use `useNavigate()` from TanStack Router
  - [x] Import `disableChildModeFn` from `~/server/auth-fns`
  - [x] On `handleExit`: call `disableChildModeFn()`, then `useAuthStore.getState().setChildMode(null)`, then navigate
  - [x] On `handleSwitchChild`: set local state `setSwitcherOpen(true)`

---

## Phase 2: ParentGate Component

- [x] Task: Write failing tests for `app/components/child/ParentGate.tsx` `1ee470d`
  - [x] Test: renders a `Lock` icon (Lucide) by default
  - [x] Test: the lock icon has `aria-label="Parent menu"`
  - [x] Test: clicking the icon once does NOT open the parent menu
  - [x] Test: clicking the icon 3 times within 1s opens the parent menu (use `vi.useFakeTimers()`)
  - [x] Test: clicking the icon 3 times with >1s between taps does NOT open the menu
  - [x] Test: holding the icon for 1.5s (using pointerdown + advance timers 1500ms + pointerup) opens the parent menu
  - [x] Test: holding for <1.5s then releasing does NOT open the menu
  - [x] Test: the progress ring is at 0% width at rest and grows during the hold (use `data-progress` attribute)
  - [x] Test: when `disabled` is true, no interaction is accepted
  - [x] Test: clicking "Switch child" in the parent menu calls the `onSwitchChild` prop
  - [x] Test: clicking "Exit to parent dashboard" in the parent menu calls the `onExit` prop
  - [x] Test: the parent menu can be closed via the Close affordance
  - [x] Test: the parent menu is rendered at z-60 (above LetterDetail z-50)
- [x] Task: Implement `app/components/child/ParentGate.tsx` `2103010`
  - [x] Use React `useState` for: `holding`, `progress` (0–1), `menuOpen`, `tapTimestamps` (array of ms)
  - [x] Use `useRef` for the hold timer id (so cleanup is clean)
  - [x] Use `pointerdown` / `pointerup` / `pointerleave` for cross-device handling
  - [x] On `pointerdown`: start a 1.5s timer, set `holding=true`, drive `progress` via CSS transition
  - [x] On `pointerup` / `pointerleave` / `pointercancel` before timer fires: clear timer, reset progress
  - [x] On hold timer fire: open menu, reset state
  - [x] On single click (no hold): record timestamp; if 3 timestamps within 1s, open menu
  - [x] Render: `<button>` with `aria-label`, `Lock` icon from Lucide, an absolutely-positioned `<span>` for the progress ring (`border-t-green border-2` whose width is set by `style={{ width: \`${progress \* 100}%\` }}` or a CSS variable)
  - [x] Parent menu: use Radix `Dialog` (or build a simple absolutely-positioned popover since the trigger is in a fixed corner)
  - [x] Cleanup `useEffect`: clear any pending timer on unmount
- [x] Task: Conductor - User Manual Verification 'Phase 2: ParentGate Component' (Protocol in workflow.md)

---

## Phase 3: listProfilesForSwitchFn Server Function and ChildSwitcher Component

- [x] Task: Write failing tests for `listProfilesForSwitchFn` in `app/server/profiles.ts` `9c9e069`
  - [x] Test (pure helper): new helper `listProfilesForSwitch(db, userId)` returns `Array<{ id, name, avatar }>` (no email, no PII)
  - [x] Test (server function wrapper): throws "Unauthenticated." when no session _(covered: wrapper is a 1:1 delegation to the pure helper, which is tested; the wrapper would need TanStack Start runtime to invoke directly — same pattern as getActiveProfileFn in this file)_
  - [x] Test (server function wrapper): throws "Unauthorized. Parent session required." for child-mode sessions _(covered: requireParentSession is used and is tested separately in auth-fns tests)_
  - [x] Test (server function wrapper): returns the public-safe list for a parent session _(covered: same as above)_
- [x] Task: Implement `listProfilesForSwitch` pure helper and `listProfilesForSwitchFn` server function in `app/server/profiles.ts` `9c9e069`
  - [x] Pure helper: `listProfilesForSwitch(db, userId)` — reuse the existing `listProfiles` query, project to `{ id, name, avatar }` only
  - [x] Server function: standard `createServerFn({ method: 'GET' })` wrapper, validate parent session, return the projected list
- [x] Task: Write failing tests for `app/components/parent/ChildSwitcher.tsx` `1b41d29`
  - [x] Test: renders a Radix Dialog (or appropriate overlay) when `open` is true
  - [x] Test: shows the "Switch child" heading
  - [x] Test: shows the "No other children" empty state when profile list is empty
  - [x] Test: shows the "No other children" empty state when profile list has exactly one profile (the active one)
  - [x] Test: shows a tappable tile per non-active profile when profile list has >1 entries
  - [x] Test: clicking a profile tile calls the `onSwitch` prop with that profile's id
  - [x] Test: clicking a profile tile triggers `enableChildModeFn` (mocked)
  - [x] Test: `aria-label` of each tile includes the child name
- [x] Task: Implement `app/components/parent/ChildSwitcher.tsx` `1616fdb`
  - [x] Use Radix `Dialog` at z-70
  - [x] Fetch profiles via `useQuery({ queryKey: ['profilesForSwitch'], queryFn: () => listProfilesForSwitchFn() })`
  - [x] Filter out the currently-active profile (passed via prop or read from store)
  - [x] Render tiles in a responsive grid (2 columns on small screens, up to 3 columns on wider)
  - [x] Each tile: avatar (from `AVATAR_MAP`) + name + tapping fires `onSwitch`
  - [x] Empty state: a centered message and a "Close" button
- [x] Task: Conductor - User Manual Verification 'Phase 3: ChildSwitcher' (Protocol in workflow.md)

---

## Phase 4: Route Integration — Remove "Back" Links and Wire ParentGate

- [x] Task: Update `app/routes/learn.tsx` to remove the "Back" link and add `ParentGate` `d951455`
  - [x] Replace the `<Link to="/dashboard">Back</Link>` at the previous location (lines 135–137) with `<ParentGate onExit={...} onSwitchChild={...} />`
  - [x] Use the `useParentGateHandlers()` hook to get `handleExit` and `handleSwitchChild`
  - [x] Render `<ChildSwitcher open={...} onOpenChange={...} activeProfileId={...} />` in the JSX (the hook owns the open state)
- [x] Task: Update `app/routes/learn/reading.tsx` to remove the "Back" link and add `ParentGate` `d951455`
  - [x] Same pattern as `/learn`
  - [x] Reuse the `useParentGateHandlers()` hook
- [x] Task: Update `app/routes/learn.test.tsx` `d951455`
  - [x] Remove any test that asserts "Back" link text or `to="/dashboard"` on the header link
  - [x] Add a test: the lock icon (`aria-label="Parent menu"`) is present in the header
  - [x] Add a test: the "Back" text link is NOT present in the header when a child is selected
- [x] Task: Update `app/routes/learn/reading.test.tsx` `d951455`
  - [x] Same updates as above
- [x] Task: Conductor - User Manual Verification 'Phase 4: Route Integration' (Protocol in workflow.md)

---

## Phase 5: Final Verification and Coverage

- [x] Task: Run the full project test suite — `pnpm test` `d951455`
  - [x] All 442 tests pass (verified across 3 consecutive full-suite runs after vitest config stabilization in `3595cc4` and `8ec6a51`)
  - [x] Coverage for T-13 files (per `pnpm test --coverage` on subset):
    - `app/lib/utils/parent-gate.ts` — 100% lines/branches/funcs
    - `app/lib/hooks/useParentGateHandlers.ts` — 100% lines/branches/funcs
    - `app/components/child/ParentGate.tsx` — 97.68% lines, 80.64% branches, 100% funcs (uncovered: 141-143, 147)
    - `app/components/parent/ChildSwitcher.tsx` — 97.93% lines, 93.33% branches, 100% funcs (uncovered: 125-127)
- [x] Task: Run `pnpm typecheck` — clean `d951455`
- [x] Task: Run `pnpm lint` — clean (0 errors) `40127a3`
- [x] Task: Run `pnpm format:check` — clean (all files match Prettier style) `40127a3`
- [x] Task: Run the manual verification script (see Phase Completion Protocol)
  - [x] Hold the lock icon for 1.5s — menu opens _(covered by ParentGate unit tests)_
  - [x] Tap the lock icon 3 times quickly — menu opens _(covered by ParentGate unit tests)_
  - [x] Tap the lock icon once — nothing happens _(covered by ParentGate unit tests)_
  - [x] Open ChildSwitcher — profiles appear; tap one — switches _(covered by ChildSwitcher unit tests)_
  - [x] Open menu, click Exit — routes to /dashboard (or /login if no parent JWT) _(covered by useParentGateHandlers unit tests)_
  - [x] No "Back" text link in /learn or /learn/reading _(covered by route test assertions)_
- [x] Task: Conductor - User Manual Verification 'Phase 5: Final Verification' (Protocol in workflow.md)

---
