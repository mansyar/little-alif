# Implementation Plan: T-15 Parent Dashboard De-clutter

## Phase 1: Dashboard Header & ProfileMenu

### Task 1.1: Install @radix-ui/react-dropdown-menu dependency

- [ ] Install `@radix-ui/react-dropdown-menu` package via pnpm

### Task 1.2: Implement DashboardHeader component

- [ ] Write failing tests for `DashboardHeader` (renders title, language toggle, profile menu trigger)
- [ ] Implement `app/components/parent/DashboardHeader.tsx`
- [ ] Verify tests pass

### Task 1.3: Implement ProfileMenu component

- [ ] Write failing tests for `ProfileMenu` (renders dropdown items, opens ConfirmDialog on sign out)
- [ ] Implement `app/components/parent/ProfileMenu.tsx` with Radix DropdownMenu
- [ ] Integrate `ConfirmDialog` (danger variant) for sign-out confirmation
- [ ] Verify tests pass

### Task 1.4: Update dashboard layout

- [ ] Write failing tests for updated dashboard layout (no sidebar, header present)
- [ ] Update `app/routes/dashboard.tsx` — replace `<aside>` sidebar with `<DashboardHeader />`
- [ ] Remove sidebar-related classes and structure
- [ ] Profile cards become single-column list on mobile, 2-column on desktop
- [ ] Verify tests pass
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Dedicated Letter Management Route

### Task 2.1: Create letter management route

- [ ] Write failing tests for `/dashboard/profiles/$id/letters` route (renders LetterToggleGrid, has back link)
- [ ] Create `app/routes/dashboard/profiles.$id.letters.tsx`
- [ ] Render `LetterToggleGrid` with profileId from URL params
- [ ] Add "← Back to Profiles" link in page header
- [ ] Verify tests pass

### Task 2.2: Simplify ProfileList

- [ ] Write failing tests for updated ProfileList (link-based navigation, no inline accordion)
- [ ] Update `app/components/parent/ProfileList.tsx` — replace accordion button with `<Link>`
- [ ] Remove inline `LetterToggleGrid` rendering
- [ ] Add `min-h-[140px]` to profile cards
- [ ] Verify tests pass

### Task 2.3: Update existing tests

- [ ] Update `ProfileList.test.tsx` — assert link navigation instead of accordion
- [ ] Update `LetterToggleGrid.test.tsx` — assert renders correctly in both contexts
- [ ] Update `dashboard.test.tsx` — assert new layout, sign-out confirmation flow
- [ ] Verify all existing tests still pass
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Polish & Empty State

### Task 3.1: Add skeleton loaders

- [ ] Write failing tests for skeleton loaders in ProfileList
- [ ] Add 3-card skeleton placeholder with `animate-pulse` to ProfileList
- [ ] Verify tests pass

### Task 3.2: Replace empty state emoji

- [ ] Write failing tests for updated empty state (SVG illustration, not emoji)
- [ ] Replace "👤" emoji with low-opacity SVG avatar (`opacity-30`)
- [ ] Verify tests pass

### Task 3.3: Final verification

- [ ] Run full test suite: `pnpm test`
- [ ] Run typecheck: `pnpm typecheck`
- [ ] Run lint: `pnpm lint`
- [ ] Update `plan.md` with implementation notes and commit SHAs
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
