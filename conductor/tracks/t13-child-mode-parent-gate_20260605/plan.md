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

- [ ] Task: Write failing tests for `listProfilesForSwitchFn` in `app/server/profiles.ts`
  - [ ] Test (pure helper): new helper `listProfilesForSwitch(db, userId)` returns `Array<{ id, name, avatar }>` (no email, no PII)
  - [ ] Test (server function wrapper): throws "Unauthenticated." when no session
  - [ ] Test (server function wrapper): throws "Unauthorized. Parent session required." for child-mode sessions
  - [ ] Test (server function wrapper): returns the public-safe list for a parent session
- [ ] Task: Implement `listProfilesForSwitch` pure helper and `listProfilesForSwitchFn` server function in `app/server/profiles.ts`
  - [ ] Pure helper: `listProfilesForSwitch(db, userId)` — reuse the existing `listProfiles` query, project to `{ id, name, avatar }` only
  - [ ] Server function: standard `createServerFn({ method: 'GET' })` wrapper, validate parent session, return the projected list
- [ ] Task: Write failing tests for `app/components/parent/ChildSwitcher.tsx`
  - [ ] Test: renders a Radix Dialog (or appropriate overlay) when `open` is true
  - [ ] Test: shows the "Switch child" heading
  - [ ] Test: shows the "No other children" empty state when profile list is empty
  - [ ] Test: shows the "No other children" empty state when profile list has exactly one profile (the active one)
  - [ ] Test: shows a tappable tile per non-active profile when profile list has >1 entries
  - [ ] Test: clicking a profile tile calls the `onSwitch` prop with that profile's id
  - [ ] Test: clicking a profile tile triggers `enableChildModeFn` (mocked)
  - [ ] Test: `aria-label` of each tile includes the child name
- [ ] Task: Implement `app/components/parent/ChildSwitcher.tsx`
  - [ ] Use Radix `Dialog` at z-70
  - [ ] Fetch profiles via `useQuery({ queryKey: ['profilesForSwitch'], queryFn: () => listProfilesForSwitchFn() })`
  - [ ] Filter out the currently-active profile (passed via prop or read from store)
  - [ ] Render tiles in a responsive grid (2 columns on small screens, up to 4 columns on wider)
  - [ ] Each tile: avatar (from `AVATAR_MAP`) + name + tapping fires `onSwitch`
  - [ ] Empty state: a centered message and a "Close" button
- [ ] Task: Conductor - User Manual Verification 'Phase 3: ChildSwitcher' (Protocol in workflow.md)

---

## Phase 4: Route Integration — Remove "Back" Links and Wire ParentGate

- [ ] Task: Update `app/routes/learn.tsx` to remove the "Back" link and add `ParentGate`
  - [ ] Replace the `<Link to="/dashboard">Back</Link>` at the previous location (lines 135–137) with `<ParentGate onExit={...} onSwitchChild={...} />`
  - [ ] Use the `useParentGateHandlers()` hook to get `handleExit` and `handleSwitchChild`
  - [ ] Render `<ChildSwitcher open={...} onSwitch={...} />` in the JSX (the hook owns the open state)
- [ ] Task: Update `app/routes/learn/reading.tsx` to remove the "Back" link and add `ParentGate`
  - [ ] Same pattern as `/learn`
  - [ ] Reuse the `useParentGateHandlers()` hook
- [ ] Task: Update `app/routes/learn.test.tsx`
  - [ ] Remove any test that asserts "Back" link text or `to="/dashboard"` on the header link
  - [ ] Add a test: the lock icon (`aria-label="Parent menu"`) is present in the header
  - [ ] Add a test: the "Back" text link is NOT present in the header when a child is selected
- [ ] Task: Update `app/routes/learn/reading.test.tsx`
  - [ ] Same updates as above
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Route Integration' (Protocol in workflow.md)

---

## Phase 5: Final Verification and Coverage

- [ ] Task: Run the full project test suite — `CI=true pnpm test`
  - [ ] All existing tests pass
  - [ ] All new tests pass
  - [ ] Coverage report: `pnpm test -- --coverage` shows the new files at >70% lines/statements/branches/functions
- [ ] Task: Run `pnpm typecheck` — no new TypeScript errors
- [ ] Task: Run `pnpm lint` — no new lint errors
- [ ] Task: Run `pnpm format:check` — no formatting drift
- [ ] Task: Run the manual verification script (see Phase Completion Protocol)
  - [ ] Hold the lock icon for 1.5s — menu opens
  - [ ] Tap the lock icon 3 times quickly — menu opens
  - [ ] Tap the lock icon once — nothing happens
  - [ ] Open ChildSwitcher — profiles appear; tap one — switches
  - [ ] Open menu, click Exit — routes to /dashboard (or /login if no parent JWT)
  - [ ] No "Back" text link in /learn or /learn/reading
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Final Verification' (Protocol in workflow.md)

---
