# Track: T-16 — Code Quality Polish

**Type:** Refactor/Chore

## Overview

Bundle of two independent code quality improvements:

1. **Letter ID Source of Truth** — Consolidate the 28-letter ID enum (`LETTER_IDS` + `LetterId` type) from its current definition in `app/db/schema.ts` into a dedicated shared constants file. Update all consumers to import from the new single source.
2. **Reading Practice i18n** — Localize the 5 reading practice action labels that are currently hardcoded as English strings in `ReadingActions.tsx` and `GroupPills.tsx`.

Both fixes are independent and can be completed in any order.

---

## Deliverable A: Letter ID Source of Truth

Currently, `LETTER_IDS` and the `LetterId` type are defined in `app/db/schema.ts` and imported by **14 files** across the codebase. Additionally, `LetterCard.tsx` hardcodes all 28 IDs as keys in the `LETTER_BG` color mapping, and `seed.test.ts` hardcodes a full `expectedIds` array. The goal is a single canonical source.

### Steps

1. Create `app/lib/constants/letters.ts` defining `LETTER_IDS` and `LetterId` as the canonical source of truth.
2. Include a `LETTER_BG_COLORS: Record<LetterId, string>` map (28 pastel Tailwind classes) generated from `LETTER_IDS` to eliminate the hardcoded duplicate in `LetterCard.tsx`.
3. Update `app/db/schema.ts` to import `LETTER_IDS` from the constants file (no redefinition).
4. Update all other importing files to point directly to `~/lib/constants/letters`.
5. Update `seed.test.ts`: derive `expectedIds` dynamically from `SEED_LETTERS.map(l => l.id)` instead of hardcoding.

### Files to Modify

| File                                              | Change                                                            |
| ------------------------------------------------- | ----------------------------------------------------------------- |
| `app/lib/constants/letters.ts`                    | **Create** — defines `LETTER_IDS`, `LetterId`, `LETTER_BG_COLORS` |
| `app/db/schema.ts`                                | Remove `LETTER_IDS`/`LetterId`, import from constants             |
| `app/lib/validations/letters.ts`                  | Update import path                                                |
| `app/db/seed.ts`                                  | Update import path                                                |
| `app/db/seed-data.ts`                             | Update import path                                                |
| `app/db/schema.test.ts`                           | Update import path                                                |
| `app/components/parent/LetterToggleGrid.tsx`      | Update import path                                                |
| `app/components/parent/LetterToggleGrid.test.tsx` | Update import path                                                |
| `app/components/child/LetterCard.tsx`             | Update import path, use `LETTER_BG_COLORS`                        |
| `app/components/child/LetterCard.test.tsx`        | Update import path                                                |
| `app/server/profiles.ts`                          | Update import path                                                |
| `app/server/profiles.test.ts`                     | Update import path                                                |
| `app/server/letters.test.ts`                      | Update import path                                                |
| `app/server/child-mode-fns.test.ts`               | Update import path                                                |
| `app/server/__tests__/reading.test.ts`            | Update import path                                                |
| `app/server/__tests__/letter-toggle-flow.test.ts` | Update import path                                                |
| `app/db/seed.test.ts`                             | Derive `expectedIds` from `SEED_LETTERS`                          |

---

## Deliverable B: Reading Practice i18n

Currently, 5 reading practice action labels are hardcoded English strings in `ReadingActions.tsx` and `GroupPills.tsx`.

### Keys to Add (EN/ID)

| Key                     | English    | Indonesian      |
| ----------------------- | ---------- | --------------- |
| `READING_SHUFFLE`       | Shuffle    | Acak            |
| `READING_DONE`          | Done       | Selesai         |
| `READING_NEXT_GROUP`    | Next Group | Grup Berikutnya |
| `READING_RANDOMIZE`     | Randomize  | Acak Vokal      |
| `READING_PATTERN_LABEL` | Pattern    | Pola            |

### Steps

1. Add 5 keys to `app/lib/i18n/en/index.ts` and `app/lib/i18n/id/index.ts`.
2. Run `pnpm i18n` to regenerate the types file (`i18n-types.ts`).
3. Update `app/components/child/reading/ReadingActions.tsx` to use `LL` calls instead of hardcoded strings.
4. Update `app/components/child/reading/GroupPills.tsx` to use `LL` calls where applicable.
5. Update component tests to wrap components in `<I18nContext.Provider>` where needed.
6. Verify `pnpm test`, `pnpm typecheck`, `pnpm lint` all pass.

---

## Acceptance Criteria

- [ ] `LETTER_IDS` is defined in exactly one place (`app/lib/constants/letters.ts`)
- [ ] All 14 files import from `~/lib/constants/letters` (not `~/db/schema`)
- [ ] `schema.ts` re-imports from constants for its own use
- [ ] `seed.test.ts` derives `expectedIds` from seed data, no hardcoded array
- [ ] `LetterCard.tsx` uses `LETTER_BG_COLORS` from the constants file
- [ ] 5 new i18n keys added with EN and ID translations
- [ ] Reading practice buttons show Indonesian text when locale is switched to ID
- [ ] `pnpm test`, `pnpm typecheck`, `pnpm lint` all pass
- [ ] Existing tests pass unchanged (or updated for i18n wrappers where needed)

---

## Out of Scope

- No changes to child-facing UI (glyphs and icons remain untouched)
- No changes to `scripts/generate-audio.ts` or `app/db/seed-data.ts` structural data
- No changes to the 7 files that use `letterId: string` instead of `LetterId` (type tightening is separate work)
- No i18n for the reading practice grid cells or GroupHeader (child-facing)

---

## Key Decisions

- `app/lib/constants/letters.ts` chosen as the location (co-located with other lib modules)
- `LETTER_BG_COLORS` moved alongside `LETTER_IDS` to keep it type-safe and auto-synced
- `schema.ts` re-imports from constants (schema.ts does NOT own the letter definitions)
- All 14 importing files updated for consistency (not just the 4 listed in the roadmap)
- Missing Indonesian key → falls back to English (typesafe-i18n built-in behavior)
