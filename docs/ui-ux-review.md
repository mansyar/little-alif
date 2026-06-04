# 🎨 UI/UX Review — Little Alif

**Review Date:** 2026-06-05
**Reviewer:** Conductor (read-only review — no code changes)
**Scope:** All implemented UI across parent routes (`/`, `/login`, `/register`, `/dashboard`) and child routes (`/learn`, `/learn/reading`)
**Status:** Findings only — not yet prioritized into tracks

---

## Context

A first-pass UI/UX review of the implemented Little Alif application. The review is based on:

- The product definition ([`product.md`](../conductor/product.md), [`product-guidelines.md`](../conductor/product-guidelines.md))
- The functional + technical specs ([`prd.md`](./prd.md), [`tdd.md`](./tdd.md))
- The current implementation under `app/` (T-01 through T-12 complete)
- The target personas: **Child (3–6, pre-literate)** and **Parent (admin)**

Findings are organized by severity. Each finding references specific files and line numbers so it can be located and reproduced without re-reading the codebase.

---

## TL;DR

| #   | Severity    | Area                     | Finding                                                                                                 |
| --- | ----------- | ------------------------ | ------------------------------------------------------------------------------------------------------- |
| 1   | 🔴 Critical | Letter management IA     | `LetterToggleGrid` expanded inline inside a profile card produces a ~1200px tall card                   |
| 2   | 🔴 Critical | Child mode flow          | No parent-escape affordance once a child is in `/learn`                                                 |
| 3   | 🔴 Critical | Build / color            | `text-red` is not a valid Tailwind v4 utility — likely build warning + invisible error text             |
| 4   | 🔴 Critical | Sign-out UX              | Destructive action in low-contrast `text-text-muted` button, no confirmation                            |
| 5   | 🟠 High     | Reading practice visuals | Cold grays (`bg-gray-50`, `border-gray-200`) inside an otherwise warm-toned app                         |
| 6   | 🟠 High     | Visual rhythm            | `rounded-lg` (8px) used where the system defines only `rounded-small` (10px) and `rounded-large` (24px) |
| 7   | 🟠 High     | Dashboard layout         | 256px sidebar is a desktop artifact in a mobile-first app                                               |
| 8   | 🟠 High     | Child mode navigation    | "Back" text link in child-facing header is meaningless to a 3-year-old                                  |
| 9   | 🟡 Medium   | Various                  | See "Medium-priority findings" below                                                                    |

The **three recommended tracks** (`T-13`, `T-14`, `T-15`) bundle the critical and high-priority findings into TDD-able scopes. The full list of medium-priority polish items is captured below for any future `T-16` polish pass.

---

## What's working well

These are the strengths to preserve when refactoring.

- **Color system is coherent.** `app/app.css:3-30` defines the warm sand/green/orange/coral palette exactly as the product guidelines specify. No random hex values scattered around the codebase.
- **Themed avatars hit the brief.** `app/components/parent/avatars.tsx` — 8 Hijaiyah-themed inline SVGs (alif-lamp, ba-boat, ta-table, tsa-butterfly, jim-mountain, ha-jar, kho-hat, dal-book) match PRD REQ-2.2. No network requests, no broken images.
- **Child UI is glyph-only where it matters.** `app/components/child/EmptyState.tsx:11-21` uses a single `BookOpen` icon with no text (REQ-5.8). `app/components/child/LetterDetail.tsx:36-48` is a clean full-screen overlay at z-50. Good.
- **No gamification leaks.** No stars, no progress bars, no confetti — consistent with the "digital companion, not a game" core tenet.
- **Radix primitives everywhere parent-facing.** Switch, Dialog, RadioGroup, AlertDialog — accessibility foundation is solid.
- **Reading practice UX has nice touches.** Separate Randomize (vowels) vs. Shuffle (positions) — that distinction is non-obvious and the TDD calls it out correctly in `app/routes/learn/reading.tsx:199-219`.
- **Hybrid audio architecture.** MP3 primary + Web Speech fallback, with a 112-MP3 build-time generator. Singleton `AudioEngine` with cancel-on-new-speak. Well-tested.

---

## Critical findings (real bugs / broken UX)

### C1. LetterToggleGrid expansion explodes the dashboard card height

**File:** `app/components/parent/ProfileList.tsx:142-146`
**PRD Ref:** §4 REQ-4.2 (Letter Management View)

When expanded, a single profile card contains: profile header + 4-button action row + harakat selector + Show All/Hide All toolbar + 28 letter cards (each with switch). On a 768px tablet the card reaches ~1200px tall. This breaks the "profile list" mental model and pushes other children off-screen.

**Recommended fix:** Move letter management to a dedicated route (`/dashboard/profiles/:id/letters`). The parent navigates, sees a focused full-screen editor, and returns via a "Back to Profiles" button. The profile card itself only needs a count summary + a "Manage Letters →" affordance.

---

### C2. `text-red` is not a valid Tailwind v4 utility

**Files:**

- `app/routes/login.tsx:79` — `<p className="text-red text-sm" role="alert">`
- `app/routes/register.tsx:74` — same pattern

In Tailwind v4, `text-red` without a numeric suffix does not resolve to a defined color token. This likely produces a build-time warning and may render with no color at all, leaving error messages invisible.

**Recommended fix:** Replace with `text-red-600` (Tailwind default palette) or, to stay in the design system, `text-coral` (the existing design token for destructive states, per `app/app.css:13`).

---

### C3. No parent-escape affordance once a child is in `/learn`

**File:** `app/routes/learn.tsx:135-137`
**PRD Ref:** §4 REQ-3.4 (Parent can disable Child Mode from the parent dashboard)

If a parent's tablet is in child mode and the parent picks it up, the only way back to parent territory is a small, text-muted "Back" link. "Back" is ambiguous (where?) and a 3-year-old might tap it accidentally. There is no obvious "exit to parent" affordance, and a child who taps the right area can't accidentally end the session.

**Recommended fix:** Add a small lock icon in a corner that requires either a long-press (≥1.5s) or 3 rapid taps in the same corner to trigger the exit flow. This is the standard kid-app parent gate pattern (YouTube Kids, Khan Academy Kids both do this). On exit, route to `/dashboard` (if parent JWT) or `/login` (if child-mode cookie only).

---

### C4. "Back" link in `/learn` is parent-facing text in a child-facing UI

**File:** `app/routes/learn.tsx:135-137`

`<Link to="/dashboard" className="text-sm text-text-muted hover:text-text-dark">Back</Link>` — meaningful only to a literate parent. Children will ignore it; parents won't see it. Even worse, it's the same visual weight as the `ProfileBadge` next to it, but carries a destructive outcome.

**Recommended fix:** Roll this into the C3 parent gate (the lock icon). Remove the "Back" link entirely from the visible `/learn` chrome. The escape hatch IS the parent gate.

---

### C5. Sign-out is a low-contrast destructive action with no confirmation

**File:** `app/routes/dashboard.tsx:121-131`
**PRD Ref:** §4 REQ-1.2 (Session management)

`<button ... className="rounded-small px-3 py-2 text-left text-sm text-text-muted transition-colors hover:bg-red-50 hover:text-red-600">` — the only visual cue that this is destructive is a hover state. A casual click = logged out, no confirmation, no toast feedback.

The delete-profile flow uses `ConfirmDialog` with `variant="danger"` (`app/components/parent/ProfileList.tsx` → `app/components/ui/ConfirmDialog.tsx`). Sign out deserves the same pattern.

**Recommended fix:** Either:

1. Move "Sign out" into a profile menu (avatar dropdown) so it isn't a primary chrome element, OR
2. Wrap it in `ConfirmDialog` (danger variant) for explicit confirmation.

Option 1 is preferred — destructive actions shouldn't compete with neutral controls in the sidebar.

---

## High-priority findings (visual inconsistencies, accessibility, IA)

### H1. Cold grays in a warm-toned app

**Files:**

- `app/components/child/reading/ReadingCell.tsx:28` — `bg-gray-50` for cells
- `app/components/child/reading/ReadingActions.tsx:25, 34, 44, 54` — `bg-white` + `border-gray-200` for action buttons
- `app/components/child/reading/ReadingGrid.tsx:75` — `text-gray-500` for "Pattern" label
- `app/components/child/reading/GroupPills.tsx:20-25` — `bg-emerald-500` (Tailwind default, not the design-system `green`)

The rest of the app uses warm tones (`bg-sand-light`, `bg-sand-dark`, `text-text-muted`, `bg-green`). The reading practice screen feels visually disconnected.

**Recommended fix (one-to-one token mapping):**

- Cells → `bg-sand-light` with `text-text-dark`
- Action buttons → `bg-white` with `border-sand-dark` and `hover:bg-sand-light`
- Secondary text → `text-text-muted`
- Group pill active state → `bg-green text-white` (matches HarakatSelector)
- Group pill complete state → `border-green text-green-dark bg-white`

---

### H2. `rounded-lg` (8px) used where the system defines only `rounded-small` (10px) and `rounded-large` (24px)

**Files:**

- `app/components/child/reading/ReadingCell.tsx:28` — `rounded-lg`
- `app/components/child/reading/ReadingActions.tsx:25, 34, 44, 54` — `rounded-lg`
- `app/components/child/reading/GroupPills.tsx:17` — `rounded-full` (intentional, but adjacent to the inconsistency)

`app/app.css:20-21` defines only two design radii: `--radius-small: 10px` and `--radius-large: 24px`. `rounded-lg` (Tailwind default, 8px) is a third radius that doesn't exist in the spec.

**Recommended fix:** Either migrate all reading-practice buttons to `rounded-small`, or add a third `--radius-control: 8px` token to `app.css` and apply it consistently. The former is preferred — fewer tokens, simpler system.

---

### H3. 256px sidebar is a desktop artifact in a mobile-first app

**File:** `app/routes/dashboard.tsx:108-132`
**Product Guideline:** §"Mobile-First Responsive" — "Primary Breakpoint: Portrait phone (360px+)."

`flex w-64 shrink-0 flex-col border-r border-sand-light bg-white px-5 py-8` — the sidebar is 256px. On a 768px tablet, that's 33% of the width. On a 360px phone, it would be unworkable. The product guidelines are explicit that the primary target is portrait phones.

**Recommended fix:** Replace the sidebar with a top app bar:

- Left: app name + nav (only one item — "Profiles")
- Right: language toggle + profile menu (avatar dropdown with Settings, Sign out)
- Hide the sidebar entirely; everything fits in the top bar

This is a structural change that touches `dashboard.tsx` and the dashboard route test (`-dashboard.test.tsx`).

---

### H4. No optimistic update on letter toggles

**File:** `app/components/parent/LetterToggleGrid.tsx:47-56`

Toggle click → debounce 300ms → server roundtrip → invalidation → re-render. On a slow connection, the switch visually "lags" then snaps. For a parent toggling 10 letters in a row, the perceived latency is high.

**Recommended fix:** Add `onMutate` to `toggleMutation` that flips the local cache optimistically, and roll back on error. Pure presentational change; existing tests still pass.

---

### H5. Switch height is 20px — below WCAG 2.5.5 touch target

**Files:**

- `app/components/parent/LetterToggleGrid.tsx:129` — `h-5 w-9`
- `app/components/parent/ChildModeToggle.tsx:65` — `h-5 w-9`
  **Product Guideline:** "Large Touch Targets: Minimum 64x64dp tap area" (parent UI inherits WCAG AA target)

20×36px is below the WCAG 2.5.5 minimum of 44×44dp. The Radix Switch primitive renders an invisible larger hit area but the visible switch is small. Bump to `h-6 w-11` (24×44) without changing the surrounding card layout.

---

### H6. No focus-visible styles on some plain buttons

**Files:**

- `app/routes/dashboard.tsx:121-130` (Sign out) — only `hover:` styles
- `app/routes/learn.tsx:135-137` (Back link)
- `app/components/parent/LanguageToggle.tsx:14-25` — no `focus-visible:` ring

Radix handles focus for its primitives, but plain HTML buttons need explicit focus styles. Keyboard users tabbing to "Sign out" see no focus indicator.

**Recommended fix:** Add `focus-visible:ring-2 focus-visible:ring-green focus-visible:ring-offset-2` consistently across all plain `<button>` and `<Link>` elements. Could be a global rule in `app.css` for all `button:not([class*="focus-"])` but explicit per-component is safer.

---

### H7. Toast z-index vs. LetterDetail overlay (z-50) is undocumented

**Files:** `app/components/child/LetterDetail.tsx:40` (z-50), `app/components/ui/ToastContainer.tsx` (z-index not yet inspected)

If a server error fires while a child has a letter open, the toast may render behind the playback overlay. The child sees a silent failure.

**Recommended fix:** Make toasts `z-[60]` and verify they float above the playback overlay with a visual test.

---

### H8. Landing page has two equal CTAs

**File:** `app/routes/index.tsx:26-40`
**Product Guideline:** "The app is intentionally simple" + "self-hosted" typical flow (install → first-time register)

"Parent Login" and "Create Account" are visually equal. For a self-hosted app where the typical first-time flow is registration, "Create Account" should be the primary (filled, green) and "Parent Login" should be the secondary (outlined). Currently the inverse is true.

**Recommended fix:** Swap the visual treatments:

- `Create Account` → `bg-green text-white` (primary)
- `Parent Login` → `border-2 border-green text-green` (secondary outline)

---

### H9. "Reading Practice" button is the only secondary action in `/learn` and easy to miss

**File:** `app/routes/learn.tsx:148-156`
**Product Guideline:** "Orange: Child mode accents, Reading Practice button"

Currently a plain green button at the bottom. Per the guideline, Reading Practice should use the `orange` accent to distinguish it from letter taps. The PRD also implies this is a separate, exciting destination.

**Recommended fix:** Use `bg-orange text-white` (or `bg-orange-light`) for the button. Optionally add a small icon (Lucide `BookOpen` or `Sparkles`) for visual interest.

---

### H10. No "switch child" affordance once in `/learn`

**File:** `app/routes/learn.tsx:133-138`
**PRD Ref:** §4 REQ-3.5 (Only one child can be in Child Mode at a time per device)

If two siblings share a tablet, the parent has to: back to dashboard → toggle child mode off → toggle for sibling → re-enter `/learn`. A 30-second task becomes a 2-second task with a "Switch child" affordance.

**Recommended fix:** A small avatar icon button in the `/learn` header (next to the ProfileBadge) that, when long-pressed, opens a profile picker overlay. Avoid a single tap on the avatar — children will tap it accidentally. Alternatively, surface this only inside the C3 parent-gate menu.

---

### H11. GroupHeader label is built from letter IDs, not Arabic glyphs (potential bug)

**File:** `app/components/child/reading/GroupPills.tsx:44`

`{group.label}` comes from `generateReadingGroups()` joining letter IDs by space. The fallback at `app/routes/learn/reading.tsx:94` uses `chars[id] ?? id` — so it _usually_ shows Arabic ("ا ب ت"), but on partial data it falls back to Latin IDs ("alif ba ta"). More importantly, the pill width is computed from this string, so the group navigation visibly shifts when letter sets change.

**Recommended fix:** Compute the label from the actual Arabic characters unconditionally; never expose internal IDs in the UI. Add a unit test for the partial-data fallback case.

---

## Medium-priority findings (polish)

These are not urgent but should be addressed in a future polish pass. They are listed for completeness, with the same file:line precision.

### M1. `--color-background-warm: #faf8f5` is barely visible

**File:** `app/app.css:14`
The "warm" feeling doesn't register on most monitors — it reads as white. Either darken to `#F5F0E8` for a more obvious warm tint, or use it as the background only on the parent dashboard and keep child routes on white.

### M2. `LetterDetail` overlay uses `bg-background-warm/95` — same as page bg

**File:** `app/components/child/LetterDetail.tsx:40`
The overlay feels like a slight darkening, not a modal. Use a stronger backdrop (`bg-text-dark/30` or `bg-green-dark/20`) so the transition is felt.

### M3. Empty parent state uses emoji; child empty state uses SVG

**Files:**

- `app/components/parent/ProfileList.tsx:74` — `<div className="mb-4 text-5xl text-sand-dark">👤</div>` (emoji)
- `app/components/child/EmptyState.tsx:18` — Lucide `BookOpen` SVG

The avatar system is one of the strongest design elements; the parent empty state should use the same vocabulary (one of the existing avatars at low opacity, or a custom "empty group" illustration).

### M4. Letter card background palette split is arbitrary

**File:** `app/components/child/LetterCard.tsx:18-47`
Letters 1–14 use `-100` shades, 15–28 use `-200` shades. The split point is the 15th entry with no documented rationale. Some colors have poor contrast for the dark glyph+diacritic (e.g. `bg-yellow-100` for ث, `bg-pink-100` for ظ). Use a single lightness family, or assign by thematic grouping (e.g. sun letters: warm, moon letters: cool).

### M5. Avatar Picker selected state is too subtle

**File:** `app/components/parent/AvatarPicker.tsx:34-35`
Selected: `border-green bg-green/10`. Unselected: `border-sand-dark/30 bg-white`. The 10% green wash is barely visible. Try `border-green border-4 bg-green/15` with a small checkmark badge, or a scale-up (`scale-105`) on the selected tile.

### M6. Profile card action row has 4 buttons + a switch, on a small card

**File:** `app/components/parent/ProfileList.tsx:113-140`
On a 360px screen, the row wraps or overflows. The "Manage Letters" → "Cancel" toggle text change also resizes the row when expanded. Consider a kebab/overflow menu (3 dots) for Edit + Delete, leaving the row clean: `[Manage] [ChildMode switch] [⋮]`.

### M7. No skeleton / shimmer for initial dashboard load

**File:** `app/components/parent/ProfileList.tsx:44-50`
Full spinner block, then suddenly the grid appears. A 4-card skeleton (gray rectangles shaped like the cards) would feel less abrupt. Trivial to add with `animate-pulse`.

### M8. No micro-motion on idle letter cards

**File:** `app/components/child/LetterCard.tsx:78-87`
Static pastel cards. A very gentle breathing scale (`animate-pulse` at 4s, or a slow 1.0 → 1.02 scale loop with `prefers-reduced-motion` respected) would make the grid feel alive without being distracting.

### M9. The 64dp touch target is the _minimum_, not the target

**File:** `app/components/child/LetterCard.tsx:83`
On a 360px portrait phone with 6 letters visible, cards shrink to ~50–55px effective. Consider raising the floor to 80px on `min-[360px]:min-h-[80px]`.

### M10. ReadingCell flash is the only "alive" feedback on a tap

**File:** `app/components/child/reading/ReadingCell.tsx:28`
`data-[flashed=true]:bg-emerald-200` is subtle. The regular `LetterCard` (`app/components/child/LetterCard.tsx:78-87`) has _no_ flash at all (just `active:scale-95`). Add a brief scale-up + color flash to `LetterCard` to confirm the tap registered, or add a brief onomatopoeic visual (e.g. expanding ripple from the card center) to make the moment of "I tapped it" unmistakable for a 3-year-old. PRD REQ-5.7 calls for "subtle tap animation" — current is _too_ subtle.

### M11. No empty state for the reading practice "fewer than 3 letters" guard

**File:** `app/routes/learn/reading.tsx:120-124`
Redirects to `/learn` when there are <3 letters. But if a child-mode session opens the reading practice URL directly (deep link, bookmark), they get a silent redirect with no feedback. Show a "Your parent needs to add 3 or more letters" message.

### M12. The logo on the landing page is just a 6xl glyph

**File:** `app/routes/index.tsx:21`
Product guideline says: "Stylized لا (Lam-Alif ligature) in green gradient box". Currently it's a text heading. Wrap it in a rounded-large box with `bg-gradient-to-br from-green to-green-light` and white text. It would feel like a brand mark.

### M13. `GroupHeader` font size mismatch

**File:** `app/components/child/reading/GroupHeader.tsx:17`
`text-5xl` (3rem) for Arabic letters in the group header, but the regular `LetterDetail` is `text-9xl` (8rem). Visual hierarchy: detail > header > cells, but the difference between text-5xl and text-3xl (cells) is just 0.5rem per glyph. Consider `text-7xl` for the group header.

---

## Recommended tracks

Three new tracks are proposed to address the critical and high-priority findings. Each is TDD-able, has clear file-level scope, and builds on the existing T-12 foundation.

### T-13: Child Mode Parent Gate & Flow Polish

**Dependencies:** T-11 (Child Mode — ✅), T-08 (Child Letter Grid — ✅)
**Estimated Complexity:** Medium
**Estimated Effort:** 3–5 hours
**Status:** ⬜ Not Started

**Description:**
Replace the "Back" text link in `/learn` with a proper parent-gate affordance (corner lock icon, long-press or 3-tap exit). Hide the `ProfileBadge`-adjacent escape path so the child UI is fully locked down. Add a "Switch child" affordance inside the parent gate so a parent can hand the device between siblings without going back through the dashboard.

**PRD Ref:** §4 REQ-3.4 (Parent can disable Child Mode), REQ-3.5 (Only one child can be in Child Mode at a time)
**TDD Ref:** §2 (Route Design — child mode cookie), §3 (`enableChildModeFn` / `disableChildModeFn`)

**Key Deliverables:**

- [ ] `app/components/child/ParentGate.tsx` — Corner lock icon (Lucide `Lock`), long-press ≥1.5s OR 3 rapid taps in 1s triggers `disableChildModeFn()`, route to `/dashboard` (parent JWT) or `/login` (child cookie only)
- [ ] Update `app/routes/learn.tsx` — remove "Back" link, add `<ParentGate />` to top-right of header
- [ ] Update `app/routes/learn/reading.tsx` — same pattern
- [ ] `app/components/parent/ChildSwitcher.tsx` — Profile picker overlay, accessible only via `ParentGate`
- [ ] Unit tests: `ParentGate.test.tsx` (long-press timing, 3-tap detection, disabled state), `ChildSwitcher.test.tsx`
- [ ] Update `learn.test.tsx` and `learn/reading.test.tsx` to remove assertions about "Back" link
- [ ] Manual verification: lock icon is visible to parents (test with parent JWT) but not distracting to children (test in child mode with no parent context)

**Key Decisions:**

- Long-press threshold: 1.5 seconds (industry standard for kid-app parent gates)
- 3-tap alternative: 3 taps within 1 second in the same corner (for parents who can't long-press)
- Lock icon placement: top-right corner, 24×24px, `text-text-muted/40` (low contrast — child should not notice it)
- ChildSwitcher is rendered conditionally inside ParentGate, not always present
- No visual feedback on the icon itself when tapped (would teach the child where it is)

**Edge Cases:**

- Child taps the icon 3 times slowly (>1s apart) → no activation
- Child holds the icon indefinitely → activation only at 1.5s threshold
- ParentGate active in `/learn/reading` (deep link from notification) → still works
- Parent JWT absent (child cookie only) → after exit, route to `/login` not `/dashboard`
- Multiple profiles in switcher → up to 4 per PRD; show avatar + name grid

**Verification:**

- Long-press lock for 1.5s → cookie cleared, route to `/dashboard`
- 3 quick taps on lock → same as above
- Tap lock once → nothing happens
- Open ChildSwitcher → see all profiles, tap another → `enableChildModeFn` called for new profile, route to `/learn` with new profile
- All existing tests pass; new tests cover long-press timing, tap counting, profile switching
- `pnpm typecheck`, `pnpm lint`, `pnpm test` clean
- Manual: child cannot accidentally exit; parent can exit in ≤3 seconds

---

### T-14: Reading Practice Visual Alignment

**Dependencies:** T-10 (Reading Practice — ✅)
**Estimated Complexity:** Low
**Estimated Effort:** 2–3 hours
**Status:** ⬜ Not Started

**Description:**
Bring the reading practice screen visual language in line with the rest of the warm-toned app. Replace cold grays with design-system tokens. Unify button radii with the existing `rounded-small` / `rounded-large` tokens. Fix the `GroupHeader` label fallback bug so internal letter IDs are never exposed to the UI.

**PRD Ref:** §4 Module 8 (Reading Practice), DD-3 (3-letter minimum)
**TDD Ref:** §5 (Reading Practice utilities — `app/lib/utils/reading.ts`)

**Key Deliverables:**

- [ ] `ReadingCell.tsx` — `bg-gray-50` → `bg-sand-light`; `rounded-lg` → `rounded-small`; `bg-emerald-200` (flash) → `bg-green-light`
- [ ] `ReadingActions.tsx` — `bg-white` + `border-gray-200` → `bg-white` + `border-sand-dark`; `rounded-lg` → `rounded-small`; `hover:bg-gray-50` → `hover:bg-sand-light`; icons use `text-green` not default
- [ ] `ReadingGrid.tsx` — `text-gray-500` (Pattern label) → `text-text-muted`; or remove the label and rely on the systematic row being visually distinct
- [ ] `GroupPills.tsx` — `bg-emerald-500 text-white` → `bg-green text-white`; `border-emerald-500 text-emerald-700` → `border-green text-green-dark`; `border-gray-300 text-gray-400` → `border-sand-dark text-text-muted`
- [ ] `app/lib/utils/reading.ts` — `generateReadingGroups()`: change the label contract so it always returns Arabic characters, not IDs. Add a new parameter or return shape that distinguishes "label for display" from "letters for logic"
- [ ] Unit test: `generateReadingGroups()` returns Arabic characters even when `getCharById` returns undefined for a fallback id
- [ ] Component tests updated to assert new class names
- [ ] Visual snapshot test (optional, vitest `toMatchSnapshot` on rendered output)

**Key Decisions:**

- Keep `ReadingCell` flash color green (positive feedback) but use the design-system `green-light` for visual consistency
- Remove the "Pattern" label entirely (the systematic row's predictable order is the visual signal) — or keep it as a `text-xs text-text-muted` helper text above the row
- GroupPills active state matches `HarakatSelector` active state (`bg-green text-white`)
- The `group.label` bug fix: change return type to `{ id, letterIds, displayLabel }` and update all consumers

**Edge Cases:**

- Partial data: `getCharById(id)` returns undefined → label is still Arabic (use the first letter's char, or an em-dash `—`)
- Letter set changes mid-session (parent toggles a letter off) → label updates without remounting the pill
- Group pill `cursor-not-allowed` state for incomplete groups → still readable in warm palette

**Verification:**

- All reading-practice components use only design-system tokens (no Tailwind default grays, no `rounded-lg`)
- GroupHeader always shows Arabic glyphs in group pills
- Visual diff: reading practice now visually matches the rest of the app
- All 365+ existing tests pass; new tests for the label fix
- `pnpm typecheck`, `pnpm lint`, `pnpm test` clean

---

### T-15: Parent Dashboard De-clutter

**Dependencies:** T-05 (Parent Dashboard — ✅), T-06 (Letter Toggles — ✅)
**Estimated Complexity:** Medium-High
**Estimated Effort:** 5–7 hours
**Status:** ⬜ Not Started

**Description:**
Restructure the parent dashboard for mobile-first use. Replace the desktop-sidebar layout with a top app bar. Move letter management from an inline accordion into a dedicated route. Move the sign-out action into a profile dropdown menu. This is the largest of the three proposed tracks and touches the most files, but it produces the single biggest UX improvement for parents on phones and tablets.

**PRD Ref:** §4 Module 2 (Child Profiles), REQ-4.1 (Dashboard), REQ-1.2 (Session management)
**TDD Ref:** §2 (Route Design — `/dashboard`), §3 (Profile server functions)

**Key Deliverables:**

**Layout:**

- [ ] `app/components/parent/DashboardHeader.tsx` — Top app bar: left = "Profiles" title, right = language toggle + profile menu (avatar dropdown)
- [ ] `app/components/parent/ProfileMenu.tsx` — Radix DropdownMenu with: Settings (placeholder), Sign out (with confirmation via `ConfirmDialog` danger variant)
- [ ] `app/routes/dashboard.tsx` — Replace `<aside>` sidebar with `<DashboardHeader />`; main content becomes a single-column card list (no more 256px sidebar)
- [ ] Sign-out action: wrap in `ConfirmDialog` (danger variant), same pattern as delete-profile

**Letter management route:**

- [ ] `app/routes/dashboard/profiles.$id.letters.tsx` — New dedicated route, renders `LetterToggleGrid` for the given profile ID
- [ ] `app/components/parent/ProfileList.tsx` — Remove inline accordion; replace "Manage Letters" button with a `<Link to="...">` that navigates to the dedicated route
- [ ] Add "← Back to Profiles" link in the new route's header
- [ ] Update `LetterToggleGrid` props to require `profileId` (already does) and add `vowelMode` (already does); no API change

**Polish:**

- [ ] Add skeleton loaders for profile list (3-card placeholder with `animate-pulse`)
- [ ] Profile cards: add `min-h-[140px]` to prevent height jitter between profiles
- [ ] Replace "👤" emoji in empty state with a low-opacity SVG illustration (one of the existing avatars at 0.4 opacity, or a custom empty-group illustration)

**Tests:**

- [ ] New: `DashboardHeader.test.tsx`, `ProfileMenu.test.tsx`
- [ ] New: `routes/dashboard/profiles.$id.letters.test.tsx` — renders LetterToggleGrid, has back link
- [ ] Update: `dashboard.test.tsx` (`-dashboard.test.tsx`) — assert new layout, sign-out confirmation flow
- [ ] Update: `ProfileList.test.tsx` — assert link-based navigation instead of accordion
- [ ] Update: `LetterToggleGrid.test.tsx` — assert renders correctly in both contexts (inline and dedicated route)

**Key Decisions:**

- Dedicated route pattern matches existing `learn/reading.tsx` (nested file-based routing under `/learn`)
- ProfileMenu uses Radix DropdownMenu (not yet installed, but consistent with existing Radix primitives)
- Sign-out confirmation: `ConfirmDialog` with danger variant (already exists in `app/components/ui/ConfirmDialog.tsx`)
- No destructive action in the main chrome — both Edit and Sign out live behind the profile menu
- Empty state illustration: reuse one of the 8 existing avatars at `opacity-30` and add a small "Add your first child" CTA

**Edge Cases:**

- Profile menu open + user clicks outside → closes (Radix default)
- Sign out confirmation cancel → no action
- Letter management deep link (bookmark) → loads correctly with `profileId` from URL params
- Mobile (360px): header collapses gracefully (avatar remains visible, title truncates)
- No profiles + sign out → empty state still renders correctly
- Profile deletion while on letter management route → redirect to `/dashboard` with toast

**Verification:**

- Dashboard at 360px width: no horizontal scroll, header is single row, profile cards stack vertically
- Dashboard at 1280px width: header still single row, profile cards in 2-column grid
- Letter management route loads in ≤500ms (no extra server functions, just route change)
- Sign out: opens confirmation, cancel returns to dashboard, confirm clears cookies and routes to `/login`
- All existing tests pass; new tests cover new components and routes
- `pnpm typecheck`, `pnpm lint`, `pnpm test` clean
- Manual: parent can complete the full add-child → manage-letters → enable-child-mode flow on a 360px phone in ≤60 seconds

---

## Quick wins (no track required)

These are 1–3 line fixes that don't warrant a full track. Bundle them into a `fix(ui):` commit or roll into a future polish track.

| #   | File:line                                         | Change                                                                   |
| --- | ------------------------------------------------- | ------------------------------------------------------------------------ |
| Q1  | `app/routes/login.tsx:79` and `register.tsx:74`   | `text-red` → `text-red-600` (or `text-coral`)                            |
| Q2  | `app/components/parent/LanguageToggle.tsx:14-25`  | Add `focus-visible:ring-2 focus-visible:ring-green`                      |
| Q3  | `app/routes/index.tsx:30, 36`                     | Swap primary/secondary CTA treatments (green filled vs outline)          |
| Q4  | `app/components/parent/ProfileList.tsx:74`        | Replace `👤` emoji with low-opacity SVG illustration                     |
| Q5  | `app/components/parent/ChildModeToggle.tsx:65`    | `h-5 w-9` → `h-6 w-11` (WCAG 2.5.5 touch target)                         |
| Q6  | `app/components/parent/LetterToggleGrid.tsx:129`  | `h-5 w-9` → `h-6 w-11`                                                   |
| Q7  | `app/components/child/reading/ReadingGrid.tsx:75` | Remove the "Pattern" label or change `text-gray-500` → `text-text-muted` |
| Q8  | `app/components/child/LetterDetail.tsx:40`        | `bg-background-warm/95` → `bg-text-dark/30` for stronger backdrop        |

---

## Suggested prioritization

| Order | Track / Quick win group            | Impact  | Effort  | Rationale                                                                                                                                            |
| ----- | ---------------------------------- | ------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | T-14 (Reading Practice visuals)    | High    | Low     | Smallest, lowest risk. Warms up the most-used child screen.                                                                                          |
| 2     | Quick wins Q1–Q8                   | Medium  | Trivial | 1–3 line fixes, no architectural change, no new tests needed.                                                                                        |
| 3     | T-13 (Child Mode parent gate)      | High    | Medium  | Replaces a broken UX with a proper parent escape. Affects daily use.                                                                                 |
| 4     | T-15 (Parent Dashboard de-clutter) | Highest | High    | Biggest structural change. Best done after T-13 (the parent gate gives parents a way to escape on mobile while the dashboard is being restructured). |

After T-13 + T-15, the medium-priority findings (M1–M13) can be collected into a `T-16: Visual Polish` track. None of them are urgent.

---

## Verification plan (for the whole review)

After all three tracks are complete, the following should hold:

1. **Build is clean** — `pnpm typecheck`, `pnpm lint`, `pnpm format:check` all pass.
2. **Tests pass** — All 365+ existing tests + new tests for T-13, T-14, T-15.
3. **No new Tailwind default colors in child/parent components** — Only design-system tokens (`green`, `sand-light`, `text-text-muted`, etc.) used in `app/components/`. (Quick grep verification: `rg "gray-|emerald-|amber-" app/components/` should return empty.)
4. **Mobile audit at 360px** — All routes (`/`, `/login`, `/register`, `/dashboard`, `/dashboard/profiles/:id/letters`, `/learn`, `/learn/reading`) render without horizontal scroll.
5. **Tablet audit at 768px** — All routes render with reasonable whitespace; no oversized sidebar pushes content off-screen.
6. **Manual child-mode test** — A 3-year-old should be unable to exit child mode accidentally; a parent should be able to exit in ≤3 seconds.
7. **Manual parent flow** — Adding a child, toggling 5 letters, and enabling child mode should take ≤60 seconds on a 360px phone.
8. **Audio latency** — Tap-to-audible still < 150ms (regression check; T-09 established this).

---

## Out of scope for this review

The following are intentionally not addressed in this document:

- **Tracing / writing practice** — Phase 2 per PRD §5
- **Gamification** — Explicitly out of scope per product tenets
- **Multiple parent accounts** — Out of scope for Phase 1
- **Analytics / progress reports** — Out of scope for Phase 1
- **Tanwin / sukun** — Phase 2 harakat features per DD-5
- **PWA / offline** — Out of scope for Phase 1

These are mentioned only to be clear about what _isn't_ a finding.
