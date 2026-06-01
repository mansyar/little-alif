# Track Specification: Parent Dashboard & Child Profiles

## Overview

Build the parent dashboard showing child profile cards. Implement profile CRUD (add, edit, delete) with avatar selection, validated via Zod schemas. This track delivers the dashboard route, all profile management server functions, avatar SVGs, and the confirmation dialog for deletions.

## References

- **PRD:** §4 — Module 2 (Child Profiles), REQ-4.1 (Dashboard)
- **TDD:** §2 (Route Design — `/dashboard`), §3 (Profile Server Functions), §4 (Profile Zod Schemas)
- **Roadmap:** T-05 (Depends on T-02 Database, T-03 Auth)

## Functional Requirements

### FR-1: Dashboard Route & Layout

- Authenticated route `/dashboard` protected by JWT session check (Better Auth middleware)
- Layout: Sidebar + Content — left sidebar with title, link to child profiles overview, locale toggle, logout; main content area shows profile cards
- Reuses existing i18n keys from T-04 for dashboard labels (`DASHBOARD_TITLE`, `DASHBOARD_ADD_CHILD`, `DASHBOARD_NO_CHILDREN`, etc.)

### FR-2: Profile List

- `app/components/parent/ProfileList.tsx` — List of child profiles rendered as cards
- Each card displays: themed avatar SVG + child name + letter toggle summary (e.g., "5/28 introduced") + action buttons (Edit, Delete, Manage Letters placeholder)
- Empty state: "No child profiles yet. Add one to get started." message when no profiles exist

### FR-3: Profile CRUD — Server Functions (`app/server/profiles.ts`)

- `listProfilesFn()` — Returns all profiles for the authenticated parent, including letter toggle counts
- `createProfileFn({ name, avatar })` — Creates new profile with vowelMode defaulting to 'fathah', seeds 28 letter_toggles rows (all OFF). Enforces max 4 profiles server-side
- `updateProfileFn({ profileId, name?, avatar?, vowelMode? })` — Updates profile fields
- `deleteProfileFn({ profileId })` — Deletes profile with cascading delete of letter_toggles
- All functions require valid JWT (reject unauthenticated requests)
- Validates inputs against Zod schemas defined in `app/lib/validations/profiles.ts`

### FR-4: Profile Editor (Add/Edit) — `app/components/parent/ProfileEditor.tsx`

- Radix Dialog modal
- Add mode: name input + avatar picker + Save button
- Edit mode: pre-filled name + current avatar + Save/Cancel buttons
- Zod validation: name min 1 char, max 50 chars; avatar must be valid key

### FR-5: Avatar Picker — `app/components/parent/AvatarPicker.tsx`

- Grid of 8 themed avatar SVGs (inline React components in a single file)
- Single-select (Radix Radio Group)
- Avatars: Alif-lamp, Ba-boat, Ta-table, Tsa-butterfly, Jim-mountain, Ha-jar, Kho-hat, Dal-book

### FR-6: Delete Confirmation — `app/components/ui/ConfirmDialog.tsx` or Radix AlertDialog

- Two-step delete: click Delete → confirmation dialog → confirm/cancel
- Uses Radix AlertDialog for destructive action confirmation

### FR-7: Dashboard as Letter Management Entry Point

- Profile cards include a "Manage Letters" button (placeholder for T-06)
- Clicking navigates to the letter toggle view (implementation deferred to T-06)

## Non-Functional Requirements

- All server functions reject unauthenticated requests with proper error
- Max 4 profiles enforced server-side (Zod + DB count query)
- Avatar SVGs are inline — no external network requests
- Mobile-first responsive layout
- Touch targets ≥ 44x44dp minimum

## Acceptance Criteria

- [ ] Authenticated parent can see dashboard with profile cards
- [ ] Can add a new child profile (name + avatar selection)
- [ ] Can edit an existing child profile (name and/or avatar)
- [ ] Can delete a child profile with confirmation dialog
- [ ] Creating a profile auto-seeds 28 letter_toggles (all OFF)
- [ ] Max 4 profiles enforced — 5th attempt returns error
- [ ] Deleting a profile cascades to letter_toggles
- [ ] Profile cards show letter toggle count (X/28 introduced)
- [ ] Server functions reject unauthenticated requests
- [ ] Dashboard shows empty state when no profiles exist
- [ ] Avatar SVGs render correctly in picker and profile cards
- [ ] All UI text uses i18n translation keys

## Out of Scope

- Letter toggle grid management (T-06)
- Child mode enable/disable (T-11)
- Harakat selector in parent dashboard (T-07)
- Avatar custom uploads
