# Implementation Plan: T-15 Parent Dashboard De-clutter

## Phase 1: Dashboard Header & ProfileMenu

### Task 1.1: Install @radix-ui/react-dropdown-menu dependency

- [x] Install `@radix-ui/react-dropdown-menu` package via pnpm [28fd76a]

### Task 1.2: Implement DashboardHeader component

- [x] Write failing tests for `DashboardHeader` (renders title, language toggle, profile menu trigger) [4973f82]
- [x] Implement `app/components/parent/DashboardHeader.tsx` [4973f82]
- [x] Verify tests pass [4973f82]

### Task 1.3: Implement ProfileMenu component

- [x] Write failing tests for `ProfileMenu` (renders dropdown items, opens ConfirmDialog on sign out) [0d84925]
- [x] Implement `app/components/parent/ProfileMenu.tsx` with Radix DropdownMenu [4973f82]
- [x] Integrate `ConfirmDialog` (danger variant) for sign-out confirmation [4973f82]
- [x] Verify tests pass [0d84925]

### Task 1.4: Update dashboard layout

- [x] Write failing tests for updated dashboard layout (no sidebar, header present) [b332550]
- [x] Update `app/routes/dashboard.tsx` — replace `<aside>` sidebar with `<DashboardHeader />` [b332550]
- [x] Remove sidebar-related classes and structure [b332550]
- [x] Profile cards become single-column list on mobile, 2-column on desktop [b332550]
- [x] Verify tests pass [b332550]
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Dedicated Letter Management Route [checkpoint: 4e12ad3]

### Task 2.1: Create letter management route

- [x] Write failing tests for `/dashboard/profiles/$id/letters` route (renders LetterToggleGrid, has back link)
- [x] Create `app/routes/dashboard/profiles.$id.letters.tsx` [4973f82]
- [x] Render `LetterToggleGrid` with profileId from URL params [4973f82]
- [x] Add "← Back to Profiles" link in page header [4973f82]
- [x] Verify tests pass [fcf07fb]

### Task 2.2: Simplify ProfileList

- [x] Write failing tests for updated ProfileList (link-based navigation, no inline accordion) [b3462f5]
- [x] Update `app/components/parent/ProfileList.tsx` — replace accordion button with `<Link>` [b3462f5]
- [x] Remove inline `LetterToggleGrid` rendering [b3462f5]
- [x] Add `min-h-[140px]` to profile cards [b3462f5]
- [x] Verify tests pass [b3462f5]

### Task 2.3: Update existing tests

- [x] No remaining references to removed props (expandedProfileId, onToggleLetters) found in codebase
- [x] All 58 test files, 458 tests pass
- [~] Task: Conductor - User Manual Verification 'Phase 2' (deferred — will be done in Phase 3 final verification)

## Phase 3: Polish & Empty State [checkpoint: pending]

### Task 3.1: Add skeleton loaders

- [x] Write failing tests for skeleton loaders in ProfileList [fa283ac]
- [x] Add 3-card skeleton placeholder with `animate-pulse` to ProfileList [fa283ac]
- [x] Verify tests pass [fa283ac]

### Task 3.2: Replace empty state emoji

- [x] Write failing tests for updated empty state (profile avatar SVG with viewBox 0 0 64 64) [531d79e]
- [x] Replace lucide-react `User` icon with `AlifLamp` avatar at `opacity-30` [531d79e]
- [x] Verify tests pass [531d79e]

### Task 3.3: Final verification

- [x] Run full test suite: `pnpm test` — 58 files, 458 tests passed ✅
- [x] Run typecheck: `pnpm typecheck` — clean ✅
- [x] Run lint: `pnpm lint` — clean ✅
- [x] Update `plan.md` with implementation notes and commit SHAs
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
