<protect>
# T-06: Letter Toggle Management — Specification

## Overview

Implement the per-child letter toggle management view on the parent dashboard. Each of the 28 Hijaiyah letters has an ON/OFF switch that controls whether the letter is visible to the child in their learning grid. Toggle state is persisted in the `letter_toggles` database table.

**Dependencies:** T-02 (Database Schema), T-03 (Authentication), T-05 (Parent Dashboard & Child Profiles)
**PRD Ref:** §4 — Module 4 (Parent Dashboard — Letter Management), REQ-4.2 through REQ-4.5
**TDD Ref:** §2 (Route Design), §3 (Letter Server Functions), §4 (Letter Zod Schemas)

## Functional Requirements

### FR-1: Letter Toggle Grid (Parent Dashboard)

The dashboard page shows an inline, expandable 28-letter grid under each child profile card.

- Clicking a profile card's "Manage Letters" button expands the grid inline (accordion pattern).
- The grid displays all 28 letters in display order (1–28), each with:
  - The Arabic character glyph
  - A Radix UI Switch (ON/OFF)
  - Default state: OFF (requires parent to explicitly enable)
- Toggling a switch calls the server function to persist the change.
- While the server function is in flight, the switch is visually disabled.

### FR-2: Bulk Toggle Actions

- "Show All" button: Sets all 28 letters to ON for the selected child profile.
- "Hide All" button: Sets all 28 letters to OFF for the selected child profile.
- Both operations are backed by `bulkToggleLettersFn`.

### FR-3: Toggle Behavior & Error Handling

- **Debounce:** Rapid toggles are debounced at 300ms to prevent a flood of server requests.
- **Network Error:** If a toggle server function fails:
  - The switch reverts to its previous state (no optimistic-only update that could desync).
  - An error toast notification is displayed to the parent.
- **Disable During Flight:** The switch is disabled while its server function is in progress.

### FR-4: Server Functions

**`getVisibleLettersFn({ profileId })`**

- Method: GET / read
- Zod Schema: `getVisibleLettersSchema` (profileId: uuid)
- Auth: Parent JWT OR child-mode cookie
- Returns: `{ letters: Array<{ letterId, character, audioFile, isVisible }> }`
- Purpose: Fetch the current toggle state for all 28 letters for a child profile.

**`toggleLetterFn({ profileId, letterId, isVisible })`**

- Method: POST
- Zod Schema: `toggleLetterSchema` (profileId: uuid, letterId: enum of 28 letter IDs, isVisible: boolean)
- Auth: Parent JWT only (children cannot toggle)
- Returns: `{ letterId, isVisible }`
- Purpose: Toggle a single letter ON or OFF. Updates the `letter_toggles` table.

**`bulkToggleLettersFn({ profileId, letterIds, isVisible })`**

- Method: POST
- Zod Schema: derived from toggleLetterSchema (profileId: uuid, letterIds: array of enums, isVisible: boolean)
- Auth: Parent JWT only
- Returns: `{ updatedCount: number }`
- Purpose: Set multiple letters ON or OFF in a single operation (used by Show All / Hide All).

### FR-5: Profile Card Integration (Existing from T-05)

The profile card already shows "X/28 introduced" summary (e.g., "5/28 introduced") as part of T-05. The count is computed server-side by `listProfilesFn` via a `LEFT JOIN` on `letter_toggles` with a conditional `COUNT(CASE WHEN is_visible = 1 THEN 1 END)`.

No changes needed to the profile card for this track, but after any toggle mutation (individual or bulk), the TanStack Query `['profiles']` cache must be invalidated so the `introducedCount` refreshes automatically on the dashboard.

## Non-Functional Requirements

| Category           | Requirement                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| **Performance**    | Toggle state update should feel instant — debounce at 300ms for rapid toggling                     |
| **Security**       | Mutations require parent JWT. `getVisibleLettersFn` allows read-only access via child-mode cookie. |
| **Accessibility**  | Radix Switch provides keyboard navigation, role=switch, and aria-checked by default.               |
| **Data Integrity** | `letter_toggles` table uses `UNIQUE(profile_id, letter_id)` constraint.                            |

## Acceptance Criteria

1. All 28 letters display in correct order (1–28) in the toggle grid
2. Toggling a switch ON immediately updates the database and the child grid reflects the change
3. Toggling a switch OFF removes the letter from the child grid
4. "Show All" sets all letters to ON in a single operation
5. "Hide All" sets all letters to OFF in a single operation
6. Rapid toggling is debounced (no request flood)
7. Network errors revert the switch and show an error toast
8. Server functions reject toggle requests from unauthenticated or unauthorized users
9. Server functions reject toggle requests for profiles the parent does not own

## Out of Scope

- Child-side toggle (children cannot change toggle state — this track is parent-only)
- Vowel mode / harakat integration (handled in T-07)
- Child letter grid rendering (handled in T-08)
- Profile CRUD (handled in T-05)
  </protect>
