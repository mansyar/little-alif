<protect>
# Implementation Plan: Parent Dashboard & Child Profiles

## Phase 1: Validation Schemas & Avatar Components [checkpoint: a77e160]

**Goal:** Create Zod validation schemas for profile CRUD and inline SVG avatar components.

## Phase 2: Profile Server Functions [checkpoint: 1aaf146]

**Goal:** Create server functions for profile CRUD operations with Drizzle ORM queries, Zod validation, and JWT session checks.

- [x] Task: Create Zod validation schemas (`app/lib/validations/profiles.ts`) [294900b]
  - [ ] Create `createProfileSchema` with name (1-50 chars), avatar (enum from AVATAR_KEYS), optional vowelMode defaulting to 'fathah'
  - [ ] Create `updateProfileSchema` with profileId (uuid), optional name, avatar, vowelMode
  - [ ] Create `deleteProfileSchema` with profileId (uuid)
  - [ ] Write tests: `app/lib/validations/profiles.test.ts` — valid input, missing name, invalid avatar key, too-long name
- [x] Task: Create inline avatar SVG components (`app/components/parent/avatars.tsx`) [294900b]
  - [ ] Create 8 themed avatar SVG components as named exports: `AlifLamp`, `BaBoat`, `TaTable`, `TsaButterfly`, `JimMountain`, `HaJar`, `KhoHat`, `DalBook`
  - [ ] Export an `AVATAR_MAP` constant mapping avatar key → component for lookup
- [ ] Task: Conductor - User Manual Verification 'Validation Schemas & Avatar Components' (Protocol in workflow.md)

- [x] Task: Write tests for profile server functions [b9510d9]
  - [x] Test `listProfilesFn` — returns profiles for authenticated user, rejects unauthenticated
  - [x] Test `createProfileFn` — creates profile, seeds 28 letter_toggles, enforces max 4, rejects unauthenticated
  - [x] Test `updateProfileFn` — updates name/avatar/vowelMode, rejects unauthenticated, rejects non-owned profile
  - [x] Test `deleteProfileFn` — deletes profile, cascades to toggles, rejects unauthenticated
- [x] Task: Implement `app/server/profiles.ts` [b9510d9]
  - [x] Implement `listProfilesFn()` — queries profiles by userId, joins letter_toggles count
  - [x] Implement `createProfileFn({ name, avatar })` — validates Zod, checks max 4 profiles, inserts profile + 28 letter_toggles (default OFF)
  - [x] Implement `updateProfileFn({ profileId, name?, avatar?, vowelMode? })` — validates ownership, updates fields
  - [x] Implement `deleteProfileFn({ profileId })` — validates ownership, deletes profile (cascade handles toggles)
  - [x] All functions use `.inputValidator()` with Zod schemas and require JWT session validation
- [x] Task: Conductor - User Manual Verification 'Profile Server Functions' (Protocol in workflow.md)

## Phase 3: Dashboard Route & Profile Components

**Goal:** Refactor the dashboard route with sidebar layout, profile list with cards, empty state, and i18n integration.

- [x] Task: Write tests for dashboard components [6604fe4]
  - [ ] Test `ProfileList` — renders profile cards, shows empty state, displays letter toggle counts
  - [ ] Test dashboard route rendering — sidebar, header, locale toggle, logout button
- [x] Task: Create `app/components/parent/ProfileList.tsx` [6604fe4]
  - [ ] Fetch profiles via `listProfilesFn()` on mount
  - [ ] Render profile cards with avatar SVG + child name + "X/28 introduced" summary + action buttons (Edit, Delete, Manage Letters placeholder)
  - [ ] Empty state: icon + localized message when no profiles
- [x] Task: Refactor `app/routes/dashboard.tsx` [6604fe4]
  - [ ] Sidebar layout: left sidebar with dashboard title, locale toggle (LanguageToggle), logout button; main content area shows ProfileList
  - [ ] Add "Add Child" button that opens ProfileEditor (placeholder for Phase 4)
  - [ ] Replace placeholder text with full profile management UI
  - [ ] Wire up i18n for all dashboard strings
- [ ] Task: Conductor - User Manual Verification 'Dashboard Route & Profile Components' (Protocol in workflow.md)

## Phase 4: Profile Editor, Avatar Picker & Delete Confirmation

**Goal:** Build the interactive profile CRUD UI with modals and confirmations.

- [ ] Task: Write tests for editor components
  - [ ] Test `AvatarPicker` — renders 8 avatars, single-select, selection updates correctly
  - [ ] Test `ProfileEditor` — add mode renders empty form, edit mode pre-fills, save calls createFn/updateFn, cancel closes dialog
  - [ ] Test `ConfirmDialog` — shows title/message, confirm triggers action, cancel dismisses
- [ ] Task: Create `app/components/parent/AvatarPicker.tsx`
  - [ ] Radix Radio Group grid layout
  - [ ] Each avatar renders inline SVG component, highlights on selection
- [ ] Task: Create `app/components/parent/ProfileEditor.tsx`
  - [ ] Radix Dialog modal
  - [ ] Add mode: empty name input + AvatarPicker + Save button
  - [ ] Edit mode: pre-filled name + current avatar selected + Save/Cancel
  - [ ] Client-side validation on submit, show Zod errors
  - [ ] On success: close dialog, refresh profile list
- [ ] Task: Create or use existing `app/components/ui/ConfirmDialog.tsx`
  - [ ] Radix AlertDialog for destructive action confirmation
  - [ ] Reusable with customizable title, message, confirm/cancel labels
- [ ] Task: Wire up ProfileEditor + delete flow in ProfileList
  - [ ] "Add Child" button opens ProfileEditor in add mode
  - [ ] Edit button opens ProfileEditor in edit mode
  - [ ] Delete button opens ConfirmDialog → confirms → calls deleteProfileFn → refreshes list
- [ ] Task: Conductor - User Manual Verification 'Profile Editor & Delete Confirmation' (Protocol in workflow.md)
      </protect>
