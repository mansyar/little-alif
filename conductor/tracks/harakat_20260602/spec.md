<protect>
# Specification: Vowel Mode (Harakat)

**Track ID:** `harakat_20260602`
**Type:** Feature
**Dependencies:** T-02 (Database Schema)
**PRD Ref:** §4 — Module 7 (Harakat), §6 — DD-1, DD-2, DD-4, DD-5, DD-6
**TDD Ref:** §5 (Harakat Composer — `app/lib/utils/harakat.ts`)

---

## Overview

Implement Unicode combining diacritics for dynamic Arabic vowel (harakat) rendering on hijaiyah letters. This enables the child to see and hear letters with Fathah (َ /a/), Kasrah (ِ /i/), and Dammah (ُ /u/) diacritics applied dynamically — no separate glyph images needed. The feature has three parts: a pure `composeLetter()` utility, a parent-facing harakat selector, and a child-facing harakat bar.

## Functional Requirements

### 1. `composeLetter()` utility (`app/lib/utils/harakat.ts`)

- Pure function `composeLetter(baseChar: string, harakat: VowelMode): string`
- Uses Unicode combining diacritics (`\u064E`, `\u0650`, `\u064F`) for most letters
- Precomposed fallback glyphs for 7 non-connecting letters: ا, و, ي, ر, ز, د, ذ
- Supports 4 modes: `'none'`, `'fathah'`, `'kasrah'`, `'dammah'`
- DD-1: Alif (ا) gets no special treatment despite being a pure vowel
- DD-2: ز (zai) included in non-connecting list alongside ر, د, ذ
- DD-5: Sukun and tashdid are out of scope
- DD-6: `composeLetter()` is a pure function returning a string, not a React component

### 2. HarakatSelector (`app/components/parent/HarakatSelector.tsx`)

- Appears in the **LetterToggleGrid header** area (per-child, in the accordion expand)
- Dropdown or radio group selecting from: Plain, Fathah, Kasrah, Dammah
- On change, calls `updateProfileFn({ profileId, vowelMode })` to persist globally
- Zod schema already supports `VOWEL_MODES` in `updateProfileSchema`

### 3. ChildHarakatBar (`app/components/child/ChildHarakatBar.tsx`)

- Persistent **top toolbar** between the page header and the letter grid on `/learn`
- 4 buttons: Plain, Fathah, Kasrah, Dammah
- Active mode highlighted visually
- Child's change is **session-only** (stored in Zustand `ui-store.currentHarakat`, not sent to DB)
- On mode change → re-renders all letter glyphs using `composeLetter()`

### 4. Font Preloading (already in place)

- Cairo font preloaded via `<link rel="preload">` + `font-display: block` in `__root.tsx`
- Already configured — verified during audit

### 5. Backend (already in place)

- `updateProfileFn` already accepts `vowelMode` parameter
- `updateProfileSchema` already validates `vowelMode`
- No backend changes needed

## Non-Functional Requirements

- `composeLetter()` must be a pure function with no side effects
- Unicode combining diacritics used for all connecting letters (21 of 28)
- Precomposed fallbacks for the 7 non-connecting letters
- Font preloading must complete before first paint

## Acceptance Criteria

1. `composeLetter('ب', 'fathah')` returns `'بَ'` (Unicode combining for connecting letters)
2. `composeLetter('ر', 'kasrah')` returns `'رِ'` (precomposed fallback for non-connecting)
3. All 7 exception letters render correctly with all 3 harakat modes
4. HarakatSelector in LetterToggleGrid header persists the chosen vowel mode via `updateProfileFn`
5. ChildHarakatBar on `/learn` shows 4 buttons; clicking one updates all letter glyphs immediately (via ui-store)
6. Child's vowel mode change is session-only (does not persist to DB)
7. Font preloads before paint (verified via Network tab)

## Out of Scope

- Sukun (ْ) and tashdid (ّ) — Phase 2 (DD-5)
- Letter preview in HarakatSelector (REQ-7.9 — P1, deferred)
- Label showing current vowel mode above child grid (REQ-7.8 — P1, part of T-08)
- Audio playback integration with harakat modes (handled in T-08/T-09)
  </protect>
