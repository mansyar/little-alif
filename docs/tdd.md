# 🔧 Technical Design Document (TDD)

**Project:** Little Alif
**Version:** 1.14 (Security Hardening complete)
**Based on:** PRD v1.8

### Implementation Status

> Sections marked **✅ Implemented** are delivered in the archived tracks. Sections marked **⬜ Pending** are planned for future tracks.

| §   | Section                              | Status                    | Track                                                                                                                                                                                                                                                                                                                 |
| --- | ------------------------------------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Project Structure                    | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)                                                                                                                                                                                                                                                  |
| 2   | Route Design                         | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/), [`parent-dashboard_20260602`](../conductor/archive/parent-dashboard_20260602/), [`child-letter-grid_20260603`](../conductor/archive/child-letter-grid_20260603/)                                                                                |
| 3   | Server Functions                     | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/), [`parent-dashboard_20260602`](../conductor/archive/parent-dashboard_20260602/), [`letter-toggles_20260602`](../conductor/archive/letter-toggles_20260602/), [`child-letter-grid_20260603`](../conductor/archive/child-letter-grid_20260603/)    |
| 4   | Zod Schemas                          | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/), [`parent-dashboard_20260602`](../conductor/archive/parent-dashboard_20260602/), [`letter-toggles_20260602`](../conductor/archive/letter-toggles_20260602/), [`child-letter-grid_20260603`](../conductor/archive/child-letter-grid_20260603/)    |
| 5   | UI Component Library                 | ✅ Implemented            | [`letter-toggles_20260602`](../conductor/archive/letter-toggles_20260602/), [`harakat_20260602`](../conductor/archive/harakat_20260602/), [`child-letter-grid_20260603`](../conductor/archive/child-letter-grid_20260603/), [`reading-practice_20260603`](../conductor/archive/reading-practice_20260603/)            |
| 6   | State Management (stores scaffolded) | ✅ Implemented (scaffold) | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)                                                                                                                                                                                                                                                  |
| 7   | Audio Architecture                   | ✅ Implemented            | [`audio-service_20260602`](../conductor/archive/audio-service_20260602/), [`hybrid-audio_20260604`](../conductor/archive/audio-preloader_20260602/), [`child-letter-grid_20260603`](../conductor/archive/child-letter-grid_20260603/), [`reading-practice_20260603`](../conductor/archive/reading-practice_20260603/) |
| 8   | Database Schema                      | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)                                                                                                                                                                                                                                                  |
| 9   | Component Data Flow                  | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/), [`child-letter-grid_20260603`](../conductor/archive/child-letter-grid_20260603/)                                                                                                                                                                |
| 10  | Auth Flow                            | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)                                                                                                                                                                                                                                                  |
| 11  | Bilingual UI                         | ✅ Implemented            | [`i18n-setup_20260602`](../conductor/archive/i18n-setup_20260602/)                                                                                                                                                                                                                                                    |
| 12  | Component Interaction Map            | ✅ Implemented            | [`child-letter-grid_20260603`](../conductor/archive/child-letter-grid_20260603/), [`reading-practice_20260603`](../conductor/archive/reading-practice_20260603/)                                                                                                                                                      |
| 13  | Performance Budgets                  | ✅ Implemented            | [`child-letter-grid_20260603`](../conductor/archive/child-letter-grid_20260603/)                                                                                                                                                                                                                                      |
| 14  | Deployment Configuration             | ✅ Implemented            | [`polish-deploy_20260604`](../conductor/archive/polish-deploy_20260604/)                                                                                                                                                                                                                                              |
| 15  | Error Handling                       | ✅ Implemented            | [`polish-deploy_20260604`](../conductor/archive/polish-deploy_20260604/)                                                                                                                                                                                                                                              |
| 16  | Code Quality & Tooling               | ✅ Implemented            | [`code-quality_20260601`](../conductor/archive/code-quality_20260601/), [`oxlint_migration_20260605`](../conductor/archive/oxlint_migration_20260605/)                                                                                                                                                                |
| 17  | Parent Gate & Child Switcher         | ✅ Implemented            | [`t13-child-mode-parent-gate_20260605`](../conductor/archive/t13-child-mode-parent-gate_20260605/)                                                                                                                                                                                                                    |
| 18  | Reading Practice Visual Alignment    | ✅ Implemented            | [`reading-practice-visual-alignment_20260605`](../conductor/archive/reading-practice-visual-alignment_20260605/)                                                                                                                                                                                                      |
| 19  | Parent Dashboard De-clutter          | ✅ Implemented            | [`parent-dashboard-declutter_20260605`](../conductor/archive/parent-dashboard-declutter_20260605/)                                                                                                                                                                                                                    |
| 20  | Code Quality Polish                  | ✅ Implemented            | [`code-quality-polish_20260605`](../conductor/archive/code-quality-polish_20260605/)                                                                                                                                                                                                                                  |
| 21  | Infrastructure & Audio Polish        | ✅ Implemented            | [`infra-audio-polish_20260606`](../conductor/archive/infra-audio-polish_20260606/)                                                                                                                                                                                                                                    |
| 22  | Error Classification System          | ✅ Implemented            | [`error-classification_20260606`](../conductor/archive/error-classification_20260606/)                                                                                                                                                                                                                                |
| 23  | Security Hardening                   | ✅ Implemented            | [`t19-security-hardening`](../conductor/archive/t19-security-hardening/)                                                                                                                                                                                                                                              |

---

## 1. Project Structure

```
little-alif/
├── app/
│   ├── routes/
│   │   ├── __root.tsx               # Root layout, global providers, font preload (Cairo w/ <link rel="preload"> + font-display:block)
│   │   ├── index.tsx                # Landing / auth gate / child mode redirect
│   │   ├── login.tsx                # Parent login page
│   │   ├── register.tsx             # Parent registration page
│   │   ├── dashboard.tsx            # Parent dashboard — profile list + per-child letter toggles
│   │   ├── learn.tsx                # Child letter grid (only accessible in child mode)
│   │   ├── learn/
│   │   │   └── reading.tsx          # Child reading practice (Iqra' mode)
│   │   └── dashboard/
│   │       └── profiles.$id.letters.tsx  # Dedicated letter management route per profile
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGate.tsx         # Decides: login vs child mode skip
│   │   ├── parent/
│   │   │   ├── DashboardHeader.tsx  # Top app bar with title + language toggle + profile menu
│   │   │   ├── ProfileMenu.tsx      # Radix DropdownMenu — Manage Letters + Sign out with ConfirmDialog
│   │   │   ├── ProfileList.tsx      # List of child profiles as cards
│   │   │   ├── ProfileEditor.tsx    # Add/edit child profile modal (Radix Dialog)
│   │   │   ├── AvatarPicker.tsx     # Avatar selection grid
│   │   │   ├── LetterToggleGrid.tsx # 28-letter grid (Radix Switch per letter)
│   │   │   ├── HarakatSelector.tsx  # Vowel mode selector (parent toggle screen)
│   │   │   ├── ChildModeToggle.tsx  # Enable/disable child mode for a profile
│   │   │   └── ChildSwitcher.tsx    # Mid-session profile picker overlay (Radix Dialog, z-70)
│   │   ├── child/
│   │   │   ├── LetterGrid.tsx       # The child's letter exploration grid
│   │   │   ├── LetterCard.tsx       # Single letter card (glyph + tap handler)
│   │   │   ├── LetterDetail.tsx     # Full-screen letter display during playback
│   │   │   ├── ChildHarakatBar.tsx  # Vowel mode buttons for the child grid
│   │   │   ├── EmptyState.tsx       # "No letters yet" illustration
│   │   │   ├── ProfileBadge.tsx     # Shows the active child's avatar + name
│   │   │   ├── ParentGate.tsx       # Hidden lock icon + progress ring + parent menu (Radix Dialog, z-60)
│   │   │   └── reading/
│   │   │       ├── ReadingGrid.tsx       # The 6-row reading practice grid
│   │   │       ├── ReadingCell.tsx       # Single tappable cell in the grid
│   │   │       ├── GroupHeader.tsx       # Shows the 3 letters of the current group
│   │   │       ├── GroupPills.tsx        # Navigation pills between groups
│   │   │       └── ReadingActions.tsx    # Shuffle / Next Group / Done buttons
│   │   └── ui/
│   │       ├── LoadingSpinner.tsx
│   │       ├── Toast.tsx            # Error/success notifications
│   │       ├── ToastContainer.tsx   # Toast display manager (reads Zustand ui-store)
│   │       ├── ToastContainer.test.tsx
│   │       ├── ErrorBoundary.tsx    # Route-level crash boundary (class component)
│   │       ├── ErrorBoundary.test.tsx
│   │       └── ConfirmDialog.tsx    # Confirm destructive actions (Radix Dialog)
│   ├── lib/
│   │   ├── audio/
│   │   │   ├── audio-engine.ts      # Hybrid audio: MP3 primary, Web Speech fallback
│   │   │   └── audio-engine.test.ts # Unit tests
│   │   ├── i18n/
│   │   │   ├── index.ts             # i18n init + locale detection (SSR + client)
│   │   │   ├── en/
│   │   │   │   └── index.ts         # English strings (satisfies BaseTranslation)
│   │   │   ├── id/
│   │   │   │   └── index.ts         # Indonesian strings (satisfies Translation)
│   │   │   ├── i18n-util.ts         # Generated by typesafe-i18n
│   │   │   ├── i18n-util.async.ts   # Generated async loader
│   │   │   ├── i18n-util.sync.ts    # Generated sync loader
│   │   │   ├── i18n-react.tsx       # Generated React adapter
│   │   │   └── i18n-types.ts        # Generated TypeScript types
│   │   ├── validations/
│   │   │   ├── auth.ts              # Zod schemas for login/register
│   │   │   ├── profiles.ts          # Zod schemas for profile CRUD
│   │   │   └── letters.ts           # Zod schemas for letter toggles
│   │   └── utils/
│   │       ├── cn.ts                # Tailwind class merge utility
│   │       └── parent-gate.ts       # Gesture timing constants (LONG_PRESS_MS, TAP_WINDOW_MS, TAP_COUNT)
│   │   └── hooks/
│   │       └── useParentGateHandlers.ts # Shared handleExit/handleSwitchChild hook for child routes
│   ├── stores/
│   │   ├── auth-store.ts            # Auth + child mode state
│   │   ├── child-store.ts           # Active child profile + letters
│   │   └── ui-store.ts              # UI state: selected letter, loading, toasts
│   ├── db/
│   │   ├── schema.ts                # Drizzle schema definitions
│   │   ├── index.ts                 # DB client initialization
│   │   ├── seed.ts                  # Seed 28 letters
│   │   └── migrations/              # Auto-generated by Drizzle Kit
│   ├── server/
│   │   ├── auth.ts                  # Auth server functions
│   │   ├── profiles.ts              # Profile CRUD server functions
│   │   ├── letters.ts               # Letter toggle server functions
│   │   └── middleware.ts            # Auth middleware
│   └── config.ts                    # App-wide constants
├── public/
│   ├── audio/
│   │   └── letters/                  # Pre-recorded MP3 files (28 letters × 4 harakat)
│   │       ├── alif.mp3
│   │       ├── alif_fathah.mp3
│   │       ├── alif_kasrah.mp3
│   │       ├── alif_dammah.mp3
│   │       └── ...
│   └── images/
│       └── avatars/                 # Themed avatar SVGs
├── drizzle.config.ts
├── scripts/
│   └── generate-audio.ts              # Google Cloud TTS — generates 112 MP3 files
├── docker/
│   ├── Dockerfile
│   └── server-entry.mjs           # Custom HTTP server for production (static + SSR)
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── app.config.ts                    # TanStack Start config
└── .env.example
```

---

## 2. Route Design (TanStack Router)

| Route                             | Auth Required                  | Description                                                                             |
| --------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| `/`                               | No                             | Landing. Checks child-mode cookie → redirects to `/learn` or `/login`.                  |
| `/login`                          | No                             | Parent login form.                                                                      |
| `/register`                       | No                             | Parent registration form.                                                               |
| `/dashboard`                      | Yes (parent JWT)               | Parent dashboard — profile listing + per-child letter management.                       |
| `/learn`                          | Yes (child-mode cookie or JWT) | Child letter grid. Shows only parent-introduced letters. Includes harakat mode buttons. |
| `/learn/reading`                  | Yes (child-mode cookie or JWT) | Child reading practice (Iqra' mode). Dynamic groups from toggled-on letters.            |
| `/dashboard/profiles/$id/letters` | Yes (parent JWT)               | Dedicated letter management route per profile. Deep-linkable from profile cards.        |

**Middleware Chain (applied to `/dashboard` and `/learn`):**

```
beforeLoad →
  1. Read cookies: jwt + child-mode
  2. If child-mode cookie present and valid →
     Inject { mode: 'child', profileId } into router context
     Allow access (for /learn only)
  3. If jwt valid → Inject { mode: 'parent', user } into router context
     Allow access
  4. Otherwise → redirect to /login
```

**Child Mode Cookie spec:**

```
Name: child_mode
Value: signed({ profileId: string, expires: number })
HttpOnly: true (prevents client-side JS access — store tracks childProfileId via server response)
Secure: true in production
SameSite: Lax
Max-Age: 2,592,000 (30 days)
```

---

## 3. Server Function Contracts

### Auth (`app/server/auth.ts`)

```typescript
registerFn({ email: string, password: string })
  → { success: true } | { error: string }
  // Validates: email format, password >= 8 chars
  // Creates user, returns success

loginFn({ email: string, password: string })
  → { success: true, user: { id, email } } | { error: string }
  // Sets: jwt cookie (HttpOnly, secure, path=/, maxAge=30d)

logoutFn()
  → { success: true }
  // Clears: jwt + child-mode cookies

enableChildModeFn({ profileId: string })
  → { success: true }
  // Sets: child-mode cookie (signed, path=/)

disableChildModeFn()
  → { success: true }
  // Clears: child-mode cookie

validateSessionFn()
  → {
      authenticated: boolean,
      mode: 'parent' | 'child' | null,
      user?: { id: string, email: string },
      childProfileId?: string
    }
```

### Profiles (`app/server/profiles.ts`)

```typescript
listProfilesFn()
  → { profiles: Profile[] }
  // Requires: valid JWT
  // Profile includes: { id, name, avatar, vowelMode, letterCount }

createProfileFn({ name: string, avatar: string })
  → { profile: Profile } | { error: string }
  // Requires: valid JWT
  // Validates: max 4 profiles
  // Defaults: vowelMode = 'fathah'
  // Seeds: letter_toggles for all 28 letters (default: OFF)

updateProfileFn({ profileId: string, name?: string, avatar?: string, vowelMode?: string })
  → { profile: Profile }
  // Requires: valid JWT
  // vowelMode: 'none' | 'fathah' | 'kasrah' | 'dammah'

deleteProfileFn({ profileId: string })
  → { success: true }
  // Requires: valid JWT
  // Cascading delete: letter_toggles + profile

getActiveProfileFn({ profileId: string })
  → { id: string, name: string, avatar: string, vowelMode: VowelMode }
  // Requires: valid JWT (parent) OR child-mode cookie (matches profileId)
  // Used by /learn route to populate ProfileBadge without embedding PII
  // in the child-mode cookie. Throws if profile is missing or not owned.

listProfilesForSwitchFn()
  → Array<{ id: string, name: string, avatar: AvatarKey }>
  // Requires: valid JWT (parent only — children cannot enumerate profiles)
  // Used by ChildSwitcher overlay to list non-active profiles.
  // Pure helper: listProfilesForSwitch(db, userId) returns public-safe shape.
```

### Letters (`app/server/letters.ts`)

```typescript
// GET — fetch toggles for a specific child
getVisibleLettersFn({ profileId: string })
  → { letters: Array<{ letterId, character, audioFile, isVisible }> }
  // Requires: valid JWT (parent) OR child-mode cookie matching profileId

// POST — toggle a single letter
toggleLetterFn({ profileId: string, letterId: string, isVisible: boolean })
  → { letterId: string, isVisible: boolean }
  // Requires: valid JWT (parent only — children cannot toggle)
  // Updates: letter_toggles table

// POST — bulk toggle (optional for initial setup)
bulkToggleLettersFn({ profileId: string, letterIds: string[], isVisible: boolean })
  → { updatedCount: number }
  // Requires: valid JWT (parent only)
```

### Reading Practice (`app/server/reading.ts`)

```typescript
// GET — fetch reading data for a child profile
getReadingDataFn({ profileId: string })
  → {
      letters: Array<{ letterId: string, character: string }>,
      vowelMode: string       // 'none' | 'fathah' | 'kasrah' | 'dammah'
    }
  // Requires: valid child-mode cookie or parent JWT
  // Returns: toggled-on letters sorted by display_order + current vowel mode
  // The client generates reading groups from the returned letters
```

---

## 4. Input Validation (Zod Schemas)

Every server function validates its inputs against a Zod schema. This ensures type safety across the client-server boundary and prevents malformed data from reaching the database.

### Auth Schemas (`app/lib/validations/auth.ts`)

```typescript
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
```

### Profile Schemas (`app/lib/validations/profiles.ts`)

```typescript
import { z } from 'zod';

const AVATAR_KEYS = [
  'alif-lamp',
  'ba-boat',
  'ta-table',
  'tsa-butterfly',
  'jim-mountain',
  'ha-jar',
  'kho-hat',
  'dal-book',
] as const;

export const VOWEL_MODES = ['none', 'fathah', 'kasrah', 'dammah'] as const;

export const createProfileSchema = z.object({
  name: z.string().min(1).max(50),
  avatar: z.enum(AVATAR_KEYS),
  vowelMode: z.enum(VOWEL_MODES).default('fathah'),
});

export const updateProfileSchema = z.object({
  profileId: z.string().uuid(),
  name: z.string().min(1).max(50).optional(),
  avatar: z.enum(AVATAR_KEYS).optional(),
  vowelMode: z.enum(VOWEL_MODES).optional(),
});

export const deleteProfileSchema = z.object({
  profileId: z.string().uuid(),
});

export const getActiveProfileSchema = z.object({
  profileId: z.string().uuid({ message: 'Invalid profile ID.' }),
});
```

### Letter Schemas (`app/lib/validations/letters.ts`)

```typescript
import { z } from 'zod';

export const toggleLetterSchema = z.object({
  profileId: z.string().uuid(),
  letterId: z.enum([
    'alif',
    'ba',
    'ta',
    'tsa',
    'jim',
    'ha',
    'kho',
    'dal',
    'dzal',
    'ra',
    'zai',
    'sin',
    'syin',
    'shad',
    'dhad',
    'tha',
    'dzha',
    'ain',
    'ghain',
    'fa',
    'qaf',
    'kaf',
    'lam',
    'mim',
    'nun',
    'waw',
    'hae',
    'ya',
  ] as const),
  // Note: 'ha' = ح (throaty ḥāʼ), 'hae' = ه (soft hāʼ)
  isVisible: z.boolean(),
});

export const getVisibleLettersSchema = z.object({
  profileId: z.string().uuid(),
});

export const getReadingDataSchema = z.object({
  profileId: z.string().uuid(),
});
```

### Harakat Composer (`app/lib/utils/harakat.ts`)

```typescript
import { z } from 'zod';

// Unicode combining diacritics for Arabic
export const HARAKAT_COMBINING = {
  none: '', // No diacritic
  fathah: '\u064E', // Fathah (a) ـَ
  kasrah: '\u0650', // Kasrah (i) ـِ
  dammah: '\u064F', // Dammah (u) ـُ
} as const;

export const VOWEL_MODES = ['none', 'fathah', 'kasrah', 'dammah'] as const;
export type VowelMode = (typeof VOWEL_MODES)[number];

// Letters that don't connect to following letters — need precomposed glyphs
const NON_CONNECTING: Record<string, Record<string, string>> = {
  ا: { fathah: 'اَ', kasrah: 'اِ', dammah: 'اُ' },
  و: { fathah: 'وَ', kasrah: 'وِ', dammah: 'وُ' },
  ي: { fathah: 'يَ', kasrah: 'يِ', dammah: 'يُ' },
  ر: { fathah: 'رَ', kasrah: 'رِ', dammah: 'رُ' },
  ز: { fathah: 'زَ', kasrah: 'زِ', dammah: 'زُ' }, // same base shape as ر
  د: { fathah: 'دَ', kasrah: 'دِ', dammah: 'دُ' },
  ذ: { fathah: 'ذَ', kasrah: 'ذِ', dammah: 'ذُ' },
};

/**
 * Compose an Arabic letter with a harakat diacritic.
 * Uses Unicode combining diacritics for most letters.
 * Falls back to precomposed glyphs for non-connecting letters
 * where combining diacritics may render incorrectly.
 *
 * Note: Alif (ا) is a pure vowel (اَ = /a/, not /ʔa/) — the glyph
 * renders correctly in the grid and audio files handle the
 * pronunciation difference. No special treatment needed.
 */
export function composeLetter(baseChar: string, harakat: VowelMode): string {
  if (harakat === 'none') return baseChar;

  const special = NON_CONNECTING[baseChar];
  if (special?.[harakat]) return special[harakat];

  return baseChar + HARAKAT_COMBINING[harakat];
}
```

### Reading Practice Utilities (`app/lib/utils/reading.ts`)

```typescript
import type { VowelMode } from './harakat';

interface ReadingGroup {
  id: number;
  letters: string[]; // letter IDs (e.g., ['alif', 'ba', 'ta'])
  label: string; // Arabic chars separated by spaces (e.g., 'ا ب ت')
}

/**
 * Generate reading practice groups from visible letters.
 * Groups letters into chunks of 3 in display order.
 * Returns an empty array if fewer than 3 letters are available
 * (the Reading Practice button is disabled below this threshold).
 */
export function generateReadingGroups(visibleLetterIds: string[]): ReadingGroup[] {
  // Require at least 3 letters — fewer produces a sparse broken grid
  if (visibleLetterIds.length < 3) return [];

  const groups: ReadingGroup[] = [];
  for (let i = 0; i < visibleLetterIds.length; i += 3) {
    const chunk = visibleLetterIds.slice(i, i + 3);
    groups.push({
      id: groups.length,
      letters: chunk,
      label: chunk.join(' '),
    });
  }
  return groups;
}

/**
 * Generate a single practice row.
 * Row 1 (systematic): each letter × 3 harakat modes in order.
 * Rows 2+ (mixed): all combinations shuffled randomly.
 */
export function generatePracticeRow(
  groupLetters: string[],
  rowType: 'systematic' | 'mixed',
  composeFn: (char: string, mode: VowelMode) => string,
  getCharById: (id: string) => string | undefined,
): string[] {
  const modes: VowelMode[] = ['fathah', 'kasrah', 'dammah'];
  const cells: string[] = [];

  if (rowType === 'systematic') {
    for (const mode of modes) {
      for (const lid of groupLetters) {
        const ch = getCharById(lid);
        if (ch) cells.push(composeFn(ch, mode));
      }
    }
  } else {
    const expanded: string[] = [];
    for (const lid of groupLetters) {
      for (const mode of modes) {
        const ch = getCharById(lid);
        if (ch) expanded.push(composeFn(ch, mode));
      }
    }
    // Fisher-Yates shuffle
    for (let i = expanded.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [expanded[i], expanded[j]] = [expanded[j], expanded[i]];
    }
    cells.push(...expanded);
  }

  return cells;
}
```

### Usage Pattern in Server Functions

```typescript
import { createServerFn } from '@tanstack/start';
import { loginSchema } from '~/lib/validations/auth';

export const loginFn = createServerFn({ method: 'POST' })
  .validator(loginSchema) // <-- Zod validation at the boundary
  .handler(async ({ data }) => {
    // data is fully typed: { email: string, password: string }
    // If Zod rejects, TanStack Start returns a structured error automatically
    const { email, password } = data;
    // ... auth logic
  });
```

---

## 5. UI Component Library

Radix UI primitives provide accessible, unstyled components. Tailwind handles the visual layer. This combination gives full control over the look while ensuring keyboard navigation, screen reader support, and focus management out of the box.

### Component Mapping

| PRD Feature           | Radix Primitive                 | Purpose                                                          |
| --------------------- | ------------------------------- | ---------------------------------------------------------------- |
| Letter ON/OFF toggles | `@radix-ui/react-switch`        | Accessible toggle switch for each letter in the parent dashboard |
| Profile editor        | `@radix-ui/react-dialog`        | Modal for adding/editing child profiles                          |
| Delete confirmation   | `@radix-ui/react-alert-dialog`  | Destructive action confirmation                                  |
| Avatar picker         | `@radix-ui/react-radio-group`   | Single-select avatar grid                                        |
| Profile dropdown menu | `@radix-ui/react-dropdown-menu` | ProfileMenu — Manage Letters + Sign out with ConfirmDialog       |
| Dashboard header      | —(composite)                    | DashboardHeader — title, LanguageToggle, ProfileMenu             |

### Styling Pattern

```tsx
// Example: LetterToggle with Radix Switch + Tailwind
import * as Switch from '@radix-ui/react-switch';

function LetterToggle({ checked, onCheckedChange }: Props) {
  return (
    <Switch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center
        rounded-full border-2 border-transparent transition-colors
        data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-gray-200"
    >
      <Switch.Thumb
        className="pointer-events-none block h-5 w-5 rounded-full bg-white
          shadow-lg ring-0 transition-transform
          data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      />
    </Switch.Root>
  );
}
```

### Icon Usage (Lucide React)

```tsx
import { Volume2, Lock, Pencil, Trash2, ToggleLeft, ArrowLeft } from 'lucide-react'

// Child grid: speaker icon on letter cards (subtle, bottom-right corner)
<Volume2 className="h-4 w-4 text-white/60" />

// Parent dashboard: edit/delete actions on profile cards
<Pencil className="h-4 w-4" />
<Trash2 className="h-4 w-4 text-red-500" />

// Navigation: back button from child mode
<ArrowLeft className="h-6 w-6" />
```

---

## 6. State Management (Zustand Stores)

### Auth Store (`app/stores/auth-store.ts`)

```typescript
interface AuthState {
  mode: 'parent' | 'child' | 'guest';
  user: { id: string; email: string } | null;
  childProfileId: string | null; // set when in child mode
  isLoading: boolean;

  // Actions
  checkSession: () => Promise<void>; // called on app mount
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  enableChildMode: (profileId: string) => Promise<void>;
  disableChildMode: () => Promise<void>;
}
```

### Child Store (`app/stores/child-store.ts`)

```typescript
interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
}

interface VisibleLetter {
  letterId: string;
  character: string; // Arabic glyph
  audioFile: string;
  isVisible: boolean;
}

interface ChildState {
  profiles: ChildProfile[]; // populated for parent
  visibleLetters: VisibleLetter[]; // populated for child view
  activeProfile: ChildProfile | null;
  isLoading: boolean;

  // Actions (parent)
  loadProfiles: () => Promise<void>;
  createProfile: (name: string, avatar: string) => Promise<void>;
  updateProfile: (id: string, name?: string, avatar?: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;

  // Actions (child)
  loadVisibleLetters: (profileId: string) => Promise<void>;
  toggleLetter: (profileId: string, letterId: string, isVisible: boolean) => Promise<void>;

  // Actions (shared)
  selectProfile: (profile: ChildProfile) => void;
}
```

### UI Store (`app/stores/ui-store.ts`)

```typescript
interface UIState {
  selectedLetterId: string | null;
  isPlaying: boolean; // audio currently playing
  currentHarakat: 'none' | 'fathah' | 'kasrah' | 'dammah'; // child-side vowel override
  audioPreloadProgress: number; // 0–100
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' }>;

  // Actions
  selectLetter: (id: string | null) => void;
  setPlaying: (playing: boolean) => void;
  setHarakat: (mode: 'none' | 'fathah' | 'kasrah' | 'dammah') => void;
  setPreloadProgress: (progress: number) => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  removeToast: (id: string) => void;
}
```

---

## 7. Audio Architecture

### Overview

Audio uses a **hybrid approach**: pre-recorded MP3 files (Google Cloud TTS) as the primary playback mechanism, with Web Speech API (SpeechSynthesis) as a silent fallback. MP3 playback has immediate, consistent latency and works identically across all browsers and operating systems — no voice availability issues, no async loading, no browser-specific bugs.

### Audio Files

112 MP3 files (28 letters × 4 vowel modes) reside in `public/audio/letters/`:

```
public/audio/letters/
├── alif.mp3          # alif (no harakat)
├── alif_fathah.mp3   # alif + fathah
├── alif_kasrah.mp3   # alif + kasrah
├── alif_dammah.mp3   # alif + dammah
├── ba.mp3
├── ba_fathah.mp3
└── ... (112 total)
```

Naming convention: `{letterId}.mp3` for plain, `{letterId}_{vowelMode}.mp3` for vowel modes.

### Audio Generation (`scripts/generate-audio.ts`)

A build-time Node.js script that:

1. Reads `SEED_LETTERS` from the seed data and `VOWEL_MODES` from harakat constants.
2. Composes Arabic text via `composeLetter()` from `app/lib/utils/harakat.ts`.
3. Calls **Google Cloud Text-to-Speech** with `ar-XA` voice (Wavenet, FEMALE) at `speakingRate: 0.85`.
4. Writes each MP3 file to `public/audio/letters/`.

**Alif dammah special case:** TTS input uses `ttsInputText()` which maps alif+vowel to standard hamza-carrying form (`أَ` / `إِ` / `أُ`) for correct pronunciation, while the app display still shows the simplified `ا` for young learners.

**Idempotent:** Skips existing files. Re-run `pnpm generate:audio` to fill in missing files.

**Run:** `pnpm generate:audio`. Requires `gcloud auth application-default-login` first.

### AudioEngine (`app/lib/audio/audio-engine.ts`)

`AudioEngine` is a singleton class with **hybrid MP3 + Web Speech playback**:

```typescript
class AudioEngine {
  // Properties
  get isSupported(): boolean; // true when Audio API is available

  // Speak a letter — plays MP3, falls back to Web Speech on failure
  speak(letterId: string, vowelMode: VowelMode, letterChar: string): Promise<void>;

  // Cancel any ongoing playback immediately
  cancel(): void;

  // Tear down engine, release resources
  dispose(): void;
}

// Singleton convenience instance
export const audioEngine = new AudioEngine();
```

### Playback Flow

1. `speak(letterId, vowelMode, letterChar)` constructs the MP3 URL from `letterId` and `vowelMode`.
2. Creates an `HTMLAudioElement` with the URL.
3. On `ended` event → resolves the Promise (playback complete).
4. On `error` event or `play()` rejection → **falls back to Web Speech API**:
   - Creates a `SpeechSynthesisUtterance` with `composeLetter(letterChar, vowelMode)`.
   - Sets `utterance.rate = 0.85`, `utterance.lang = 'ar-SA'`.
   - Uses any available Arabic voice (`ar-*`).
   - Chrome workaround: always `cancel()` before `speak()`.
5. Returns a Promise that resolves when either path completes.
6. If a previous playback is in progress, `cancel()` is called first — the old Promise resolves immediately.

### Graceful Degradation

- If `Audio` API is unavailable: `isSupported` returns `false` → `speak()` resolves silently.
- If MP3 fails to load/play: transparent fallback to Web Speech API (user hears no difference).
- If both fail: Promise resolves silently — no visual error state.
- No idle preloading needed — MP3 files have no cold-start delay.

### Web Speech Fallback State

- Lazy initialization (`ensureAdapter()`) creates a browser SpeechSynthesis adapter only on first fallback use.
- Voice scan runs once: prefers `ar-*` voices, caches result.
- `onvoiceschanged` event triggers re-scan for async voice loading in Chrome.

### Test Architecture

- Test file: `app/lib/audio/audio-engine.test.ts` (currently TBD count after refactor)
- Tests mock the `Audio` constructor and `window.speechSynthesis` to cover both the MP3 success path and the Web Speech fallback path.
- Preloader removed entirely — no cold-start delay with MP3 files.

### Key Decisions

1. **MP3 primary, Web Speech fallback:** Pre-recorded audio provides consistent, cross-browser quality with no voice-availability issues. Web Speech is retained as a fallback for development environments or missing audio files.
2. **Singleton pattern** (not React context) — matches existing functional pattern used by `harakat.ts`.
3. **Promise-based `speak()`** — resolves on audio `ended` event, enabling sequential playback and composable async patterns.
4. **`speak(letterId, vowelMode, letterChar)`** — the 3-arg signature supports both MP3 URL construction (from `letterId`) and Web Speech fallback (from `letterChar`).
5. **No preloader** — MP3 files have no cold-start latency (unlike Web Speech which needs a warm-up utterance).
6. **Google Cloud TTS** for audio generation — high-quality Wavenet voices in `ar-XA`. Script is idempotent, build-time only, not part of the app runtime.
7. **Alif hamza carrier mapping** — TTS input uses `أَ`/`إِ`/`أُ` for correct pronunciation while display uses simplified `ا` for child-friendly orthography.

---

## 6. Database Schema (Drizzle ORM)

### `app/db/schema.ts`

```typescript
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const profiles = sqliteTable('profiles', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  avatar: text('avatar').notNull(),
  // Avatar keys: 'alif-lamp', 'ba-boat', 'ta-table', 'tsa-butterfly',
  //              'jim-mountain', 'ha-jar', 'kho-hat', 'dal-book'
  vowelMode: text('vowel_mode', { enum: ['none', 'fathah', 'kasrah', 'dammah'] })
    .notNull()
    .default('fathah'),
  createdAt: text('created_at').default(sql`(datetime('now'))`),
});

export const letters = sqliteTable('letters', {
  id: text('id').primaryKey(), // 'alif', 'ba', 'ta', ...
  character: text('character').notNull(), // Arabic glyph
  displayOrder: integer('display_order').notNull(),
  audioFiles: text('audio_files').notNull().default('{}'),
  // JSON map of vowel mode to filename:
  // {"none":"alif.mp3","fathah":"alif_fathah.mp3","kasrah":"alif_kasrah.mp3","dammah":"alif_dammah.mp3"}
});

export const letterToggles = sqliteTable(
  'letter_toggles',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    profileId: text('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    letterId: text('letter_id')
      .notNull()
      .references(() => letters.id),
    isVisible: integer('is_visible', { mode: 'boolean' }).default(false),
    toggledAt: text('toggled_at').default(sql`(datetime('now'))`),
  },
  (table) => ({
    unq: uniqueIndex('unq_profile_letter').on(table.profileId, table.letterId),
  }),
);
```

### Seed Data (`app/db/seed.ts`)

```typescript
const SEED_LETTERS = [
  {
    id: 'alif',
    character: 'ا',
    displayOrder: 1,
    audioFiles: {
      none: 'alif.mp3',
      fathah: 'alif_fathah.mp3',
      kasrah: 'alif_kasrah.mp3',
      dammah: 'alif_dammah.mp3',
    },
  },
  {
    id: 'ba',
    character: 'ب',
    displayOrder: 2,
    audioFiles: {
      none: 'ba.mp3',
      fathah: 'ba_fathah.mp3',
      kasrah: 'ba_kasrah.mp3',
      dammah: 'ba_dammah.mp3',
    },
  },
  {
    id: 'ta',
    character: 'ت',
    displayOrder: 3,
    audioFiles: {
      none: 'ta.mp3',
      fathah: 'ta_fathah.mp3',
      kasrah: 'ta_kasrah.mp3',
      dammah: 'ta_dammah.mp3',
    },
  },
  {
    id: 'tsa',
    character: 'ث',
    displayOrder: 4,
    audioFiles: {
      none: 'tsa.mp3',
      fathah: 'tsa_fathah.mp3',
      kasrah: 'tsa_kasrah.mp3',
      dammah: 'tsa_dammah.mp3',
    },
  },
  {
    id: 'jim',
    character: 'ج',
    displayOrder: 5,
    audioFiles: {
      none: 'jim.mp3',
      fathah: 'jim_fathah.mp3',
      kasrah: 'jim_kasrah.mp3',
      dammah: 'jim_dammah.mp3',
    },
  },
  {
    id: 'ha',
    character: 'ح',
    displayOrder: 6,
    audioFiles: {
      none: 'ha.mp3',
      fathah: 'ha_fathah.mp3',
      kasrah: 'ha_kasrah.mp3',
      dammah: 'ha_dammah.mp3',
    },
  },
  {
    id: 'kho',
    character: 'خ',
    displayOrder: 7,
    audioFiles: {
      none: 'kho.mp3',
      fathah: 'kho_fathah.mp3',
      kasrah: 'kho_kasrah.mp3',
      dammah: 'kho_dammah.mp3',
    },
  },
  {
    id: 'dal',
    character: 'د',
    displayOrder: 8,
    audioFiles: {
      none: 'dal.mp3',
      fathah: 'dal_fathah.mp3',
      kasrah: 'dal_kasrah.mp3',
      dammah: 'dal_dammah.mp3',
    },
  },
  {
    id: 'dzal',
    character: 'ذ',
    displayOrder: 9,
    audioFiles: {
      none: 'dzal.mp3',
      fathah: 'dzal_fathah.mp3',
      kasrah: 'dzal_kasrah.mp3',
      dammah: 'dzal_dammah.mp3',
    },
  },
  {
    id: 'ra',
    character: 'ر',
    displayOrder: 10,
    audioFiles: {
      none: 'ra.mp3',
      fathah: 'ra_fathah.mp3',
      kasrah: 'ra_kasrah.mp3',
      dammah: 'ra_dammah.mp3',
    },
  },
  {
    id: 'zai',
    character: 'ز',
    displayOrder: 11,
    audioFiles: {
      none: 'zai.mp3',
      fathah: 'zai_fathah.mp3',
      kasrah: 'zai_kasrah.mp3',
      dammah: 'zai_dammah.mp3',
    },
  },
  {
    id: 'sin',
    character: 'س',
    displayOrder: 12,
    audioFiles: {
      none: 'sin.mp3',
      fathah: 'sin_fathah.mp3',
      kasrah: 'sin_kasrah.mp3',
      dammah: 'sin_dammah.mp3',
    },
  },
  {
    id: 'syin',
    character: 'ش',
    displayOrder: 13,
    audioFiles: {
      none: 'syin.mp3',
      fathah: 'syin_fathah.mp3',
      kasrah: 'syin_kasrah.mp3',
      dammah: 'syin_dammah.mp3',
    },
  },
  {
    id: 'shad',
    character: 'ص',
    displayOrder: 14,
    audioFiles: {
      none: 'shad.mp3',
      fathah: 'shad_fathah.mp3',
      kasrah: 'shad_kasrah.mp3',
      dammah: 'shad_dammah.mp3',
    },
  },
  {
    id: 'dhad',
    character: 'ض',
    displayOrder: 15,
    audioFiles: {
      none: 'dhad.mp3',
      fathah: 'dhad_fathah.mp3',
      kasrah: 'dhad_kasrah.mp3',
      dammah: 'dhad_dammah.mp3',
    },
  },
  {
    id: 'tha',
    character: 'ط',
    displayOrder: 16,
    audioFiles: {
      none: 'tha.mp3',
      fathah: 'tha_fathah.mp3',
      kasrah: 'tha_kasrah.mp3',
      dammah: 'tha_dammah.mp3',
    },
  },
  {
    id: 'dzha',
    character: 'ظ',
    displayOrder: 17,
    audioFiles: {
      none: 'dzha.mp3',
      fathah: 'dzha_fathah.mp3',
      kasrah: 'dzha_kasrah.mp3',
      dammah: 'dzha_dammah.mp3',
    },
  },
  {
    id: 'ain',
    character: 'ع',
    displayOrder: 18,
    audioFiles: {
      none: 'ain.mp3',
      fathah: 'ain_fathah.mp3',
      kasrah: 'ain_kasrah.mp3',
      dammah: 'ain_dammah.mp3',
    },
  },
  {
    id: 'ghain',
    character: 'غ',
    displayOrder: 19,
    audioFiles: {
      none: 'ghain.mp3',
      fathah: 'ghain_fathah.mp3',
      kasrah: 'ghain_kasrah.mp3',
      dammah: 'ghain_dammah.mp3',
    },
  },
  {
    id: 'fa',
    character: 'ف',
    displayOrder: 20,
    audioFiles: {
      none: 'fa.mp3',
      fathah: 'fa_fathah.mp3',
      kasrah: 'fa_kasrah.mp3',
      dammah: 'fa_dammah.mp3',
    },
  },
  {
    id: 'qaf',
    character: 'ق',
    displayOrder: 21,
    audioFiles: {
      none: 'qaf.mp3',
      fathah: 'qaf_fathah.mp3',
      kasrah: 'qaf_kasrah.mp3',
      dammah: 'qaf_dammah.mp3',
    },
  },
  {
    id: 'kaf',
    character: 'ك',
    displayOrder: 22,
    audioFiles: {
      none: 'kaf.mp3',
      fathah: 'kaf_fathah.mp3',
      kasrah: 'kaf_kasrah.mp3',
      dammah: 'kaf_dammah.mp3',
    },
  },
  {
    id: 'lam',
    character: 'ل',
    displayOrder: 23,
    audioFiles: {
      none: 'lam.mp3',
      fathah: 'lam_fathah.mp3',
      kasrah: 'lam_kasrah.mp3',
      dammah: 'lam_dammah.mp3',
    },
  },
  {
    id: 'mim',
    character: 'م',
    displayOrder: 24,
    audioFiles: {
      none: 'mim.mp3',
      fathah: 'mim_fathah.mp3',
      kasrah: 'mim_kasrah.mp3',
      dammah: 'mim_dammah.mp3',
    },
  },
  {
    id: 'nun',
    character: 'ن',
    displayOrder: 25,
    audioFiles: {
      none: 'nun.mp3',
      fathah: 'nun_fathah.mp3',
      kasrah: 'nun_kasrah.mp3',
      dammah: 'nun_dammah.mp3',
    },
  },
  {
    id: 'waw',
    character: 'و',
    displayOrder: 26,
    audioFiles: {
      none: 'waw.mp3',
      fathah: 'waw_fathah.mp3',
      kasrah: 'waw_kasrah.mp3',
      dammah: 'waw_dammah.mp3',
    },
  },
  {
    id: 'ha',
    character: 'ه',
    displayOrder: 27,
    audioFiles: {
      none: 'ha.mp3',
      fathah: 'ha_fathah.mp3',
      kasrah: 'ha_kasrah.mp3',
      dammah: 'ha_dammah.mp3',
    },
  },
  {
    id: 'ya',
    character: 'ي',
    displayOrder: 28,
    audioFiles: {
      none: 'ya.mp3',
      fathah: 'ya_fathah.mp3',
      kasrah: 'ya_kasrah.mp3',
      dammah: 'ya_dammah.mp3',
    },
  },
];
```

### DB Initialization (`app/db/index.ts`)

```typescript
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: process.env.DATABASE_URL ?? 'file:./data/little-alif.db',
});

export const db = drizzle(client, { schema });
```

---

## 7. Component Data Flow

### Parent Dashboard Flow

```
/dashboard route (protected by middleware)
  │
  ├── On mount:
  │     ├── auth-store.checkSession() → confirms JWT
  │     └── child-store.loadProfiles() → fetch from listProfilesFn()
  │
  ├── Render:
  │     └── ProfileList
  │           └── ProfileCard × N
  │                 ├── Shows avatar + name
  │                 ├── "Manage Letters" button → navigates to letter toggle view
  │                 ├── "Edit Profile" button → opens ProfileEditor
  │                 └── "Enable Child Mode" button → calls enableChildModeFn()
  │
  └── LetterToggleGrid (per child):
        ├── Fetches: getVisibleLettersFn(profileId)
        └── Renders: 28 toggle switches
              └── onChange → toggleLetterFn(profileId, letterId, !isVisible)
```

### Child Grid Flow

```
/learn route (protected by middleware)
  │
  ├── On mount:
  │     ├── Read childProfileId from useAuthStore.childProfileId
  │     ├── useQuery(['activeProfile', profileId]) → getActiveProfileFn (T-08)
  │     └── useQuery(['visibleLetters', profileId]) → getVisibleLettersFn (T-06)
  │
  ├── If profileId is missing:
  │     └── Render "Select a child profile from the dashboard" + back link
  │
  ├── If either query is loading:
  │     └── Render LoadingSpinner (T-08)
  │
  ├── If either query errors:
  │     └── Render inline error with retry button (T-08)
  │
  ├── If visibleLetters.filter(l => l.isVisible).length === 0:
  │     └── Render EmptyState (icon-only, no text — REQ-5.8)
  │
  ├── If visible letters exist:
  │     └── LetterGrid (auto-fill, minmax(80px, 1fr) — REQ-5.1)
  │           └── LetterCard × N
  │                 ├── Shows: composed glyph via composeLetter(char, currentHarakat) (T-07)
  │                 ├── 28 pastel backgrounds keyed by letterId (KD-3)
  │                 ├── min 64×64dp touch target (REQ-5.3)
  │                 ├── active:scale-95 transition-transform (REQ-5.7)
  │                 ├── aria-label={letterId}, glyph aria-hidden (T-08)
  │                 └── onClick:
  │                       ├── ui-store.setSelectedLetter(letterId) — opens overlay
  │                       ├── audioEngine.speak(letter.character, currentHarakat)
  │                       │     └── Promise resolves on utterance end (or on cancel)
  │                       └── .finally(() => setSelectedLetter(null))
  │                             └── Honest auto-dismiss tied to actual playback (KD-4)
  │
  ├── During playback: LetterDetail overlay (full-screen, text-9xl, z-50)
  │
  ├── After grid: "Reading Practice" button
  │     └── disabled={visibleLetters.length < 3} (DD-3)
  │
  └── On unmount:
        └── Audio engine singleton persists across mounts (no dispose on unmount)
```

### Child Grid — Harakat Selector

```
Child grid renders →
  ├── HarakatIndicator: "Fathah (a) — listen with vowel"
  └── ChildHarakatBar:
        └── 4 buttons: Plain, Fathah, Kasrah, Dammah
              └── onClick(mode) →
                    ├── currentHarakat = mode
                    ├── Re-render all letter cards with composeLetter(char, mode)
                    ├── Update indicator text
                    └── Preload audio for the new mode on visible letters
```

### Reading Practice Flow

**Entrance gating:** The "Reading Practice" button on the child grid checks `visibleLetters.length >= 3`. If fewer than 3 letters are toggled on, the button is disabled/grayed out.

```
/learn/reading route (protected by middleware)
  │
  ├── Guard: generateReadingGroups(visibleLetterIds)
  │     ├── If < 3 letters → return empty array
  │     └── Button stays disabled on /learn
  │
  ├── On mount:
  │     ├── Fetch: getReadingDataFn(profileId)
  │     │     → { letters: VisibleLetter[], vowelMode: string }
  │     ├── Generate groups: generateReadingGroups(visibleLetterIds)
  │     ├── Initialize AudioEngine (if not already)
  │     └── Set currentGroupIndex = 0
  │
  ├── Render:
  │     ├── GroupPills (1 per group, highlights active)
  │     │     └── onClick(i) → currentGroupIndex = i → re-render
  │     ├── GroupHeader:
  │     │     └── Shows 3 Arabic chars of current group
   │     ├── ReadingGrid (6 rows):
   │     │     ├── Row 0: systematic (letters in display order)
   │     │     └── Rows 1-5: randomized (letters shuffled per row)
   │     │           └── ReadingCell × N per row (1 per letter)
   │     │                 └── onClick → audioEngine.play(composed glyph)
   │     │                              → brief green flash on cell
   │     └── ReadingActions:
   │           ├── "Randomize" → assign per-cell random vowels across all 6 rows
   │           ├── "Shuffle" → re-shuffle rows 2-6 (same group)
   │           ├── "Next Group" → currentGroupIndex++ → re-render
   │           └── "Done" → navigate back to /learn
   │
   └── Key behaviors:
         ├── Groups are auto-derived — no manual group management
         ├── Normal mode: all cells use the current harakat from the harakat bar
         ├── Randomize mode: each cell gets an independent random vowel (cleared on harakat bar change)
         └── Harakat audio matches what the child sees in each cell
```

---

## 8. Auth Flow

### Registration

```
[Register Form] → createServerFn('POST')
  │
  ├── Validate: email format, password ≥ 8 chars
  ├── Hash: bcrypt (salt rounds = 12)
  ├── Insert: users table
  └── Response → set JWT cookie → redirect to /dashboard

  JWT Payload: { sub: userId, email, iat, exp }
  JWT Secret: process.env.JWT_SECRET (min 32 chars)
  Cookie: httpOnly, secure, sameSite=lax, path=/, maxAge=30d
```

### Login

```
[Login Form] → createServerFn('POST')
  │
  ├── Validate: email + password present
  ├── Lookup: users table by email
  ├── Verify: bcrypt.compare(password, user.passwordHash)
  └── Success → set JWT cookie → redirect to /dashboard
```

### Child Mode (Parent Enables)

```
Parent clicks "Enable Child Mode" for Aisyah
  │
  ├── enableChildModeFn({ profileId: 'aisyah-id' })
  │     └── Server signs cookie: child_mode = { profileId, expires }
  │
  └── Redirect to /learn → child sees Aisyah's letter grid
```

### Subsequent Visit (No Auth Required)

```
App opens on / → validateSessionFn()
  │
  ├── Reads cookies: jwt, child_mode
  │
  ├── If child_mode cookie valid:
  │     └── Redirect to /learn (child grid, auto-selected)
  │
  ├── If jwt valid (parent):
  │     └── Redirect to /dashboard
  │
  └── Neither valid:
        └── Show /login page
```

---

## 9. Bilingual UI Implementation (typesafe-i18n)

Using `typesafe-i18n` v5 — a compile-time i18n library that generates TypeScript types from translation files. Mistype a key and it won't compile.

### Dependencies

```json
{
  "devDependencies": {
    "typesafe-i18n": "^5.26.0"
  }
}
```

### Project Structure

typesafe-i18n v5 uses locale folders with `index.ts` files rather than a flat `translations/` directory. Configuration is minimal — adapter and locales are auto-detected.

```
app/
└── lib/
    └── i18n/
        ├── index.ts              # i18n init + locale detection (SSR + client)
        ├── en/
        │   └── index.ts          # English strings (satisfies BaseTranslation)
        ├── id/
        │   └── index.ts          # Indonesian strings (satisfies Translation)
        ├── i18n-types.ts         # Generated TypeScript types
        ├── i18n-util.ts          # Generated util
        ├── i18n-util.async.ts    # Generated async loader
        ├── i18n-util.sync.ts     # Generated sync loader
        └── i18n-react.tsx        # Generated React adapter
```

`.typesafe-i18n.json` at project root:

```json
{
  "outputPath": "./app/lib/i18n",
  "baseLocale": "en"
}
```

### Translation Files

**`app/lib/i18n/en/index.ts`** — English base locale (uses `satisfies BaseTranslation` for strict type checking):

```typescript
import type { BaseTranslation } from '../i18n-types';

const en = {
  LOGIN_TITLE: 'Parent Login',
  LOGIN_SUBTITLE: 'Sign in to manage your child profiles.',
  LOGIN_EMAIL: 'Email',
  LOGIN_PASSWORD: 'Password',
  LOGIN_SUBMIT: 'Sign in',
  LOGIN_SUBMITTING: 'Signing in\u2026',
  LOGIN_SIGNUP_LINK: 'No account? Create one',
  REGISTER_TITLE: 'Create Account',
  REGISTER_SUBTITLE: 'A parent account is the first step in your child\u2019s learning journey.',
  REGISTER_SUBMIT: 'Create account',
  REGISTER_SUBMITTING: 'Creating account\u2026',
  REGISTER_PASSWORD_HINT: 'At least 8 characters.',
  REGISTER_SIGNIN_LINK: 'Already have an account? Sign in',
  DASHBOARD_TITLE: 'Dashboard',
  DASHBOARD_ADD_CHILD: 'Add Child',
  DASHBOARD_NO_CHILDREN: 'No child profiles yet. Add one to get started.',
  LETTERS_SHOW: 'Show',
  LETTERS_HIDE: 'Hide',
  CHILDMODE_ENABLE: 'Enable Child Mode',
  CHILDMODE_DISABLE: 'Disable Child Mode',
  CHILDMODE_ACTIVE: 'Child Mode is active',
  PROFILE_NAME: 'Name',
  PROFILE_AVATAR: 'Avatar',
  PROFILE_SAVE: 'Save',
  PROFILE_DELETE: 'Delete',
  PROFILE_DELETE_CONFIRM: 'Are you sure you want to delete this profile?',
  LOCALE_SWITCH: 'Bahasa Indonesia',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_INVALID_EMAIL: 'Please enter a valid email address.',
  ERROR_SHORT_PASSWORD: 'Password must be at least 8 characters.',
} satisfies BaseTranslation;

export default en;
```

**`app/lib/i18n/id/index.ts`** — Base locale uses `satisfies BaseTranslation`, locale variants use `satisfies Translation`:

```typescript
import type { Translation } from '../i18n-types';

const id = {
  LOGIN_TITLE: 'Masuk Orang Tua',
  LOGIN_SUBTITLE: 'Masuk untuk mengelola profil anak Anda.',
  LOGIN_EMAIL: 'Email',
  LOGIN_PASSWORD: 'Kata Sandi',
  LOGIN_SUBMIT: 'Masuk',
  LOGIN_SUBMITTING: 'Memasuki\u2026',
  LOGIN_SIGNUP_LINK: 'Belum punya akun? Buat satu',
  REGISTER_TITLE: 'Buat Akun',
  REGISTER_SUBTITLE: 'Akun orang tua adalah langkah awal dalam perjalanan belajar anak Anda.',
  REGISTER_SUBMIT: 'Buat akun',
  REGISTER_SUBMITTING: 'Membuat akun\u2026',
  REGISTER_PASSWORD_HINT: 'Minimal 8 karakter.',
  REGISTER_SIGNIN_LINK: 'Sudah punya akun? Masuk',
  DASHBOARD_TITLE: 'Dasbor',
  DASHBOARD_ADD_CHILD: 'Tambah Anak',
  DASHBOARD_NO_CHILDREN: 'Belum ada profil anak. Tambahkan satu untuk memulai.',
  LETTERS_SHOW: 'Tampilkan',
  LETTERS_HIDE: 'Sembunyikan',
  CHILDMODE_ENABLE: 'Aktifkan Mode Anak',
  CHILDMODE_DISABLE: 'Nonaktifkan Mode Anak',
  CHILDMODE_ACTIVE: 'Mode Anak Aktif',
  PROFILE_NAME: 'Nama',
  PROFILE_AVATAR: 'Avatar',
  PROFILE_SAVE: 'Simpan',
  PROFILE_DELETE: 'Hapus',
  PROFILE_DELETE_CONFIRM: 'Yakin ingin menghapus profil ini?',
  LOCALE_SWITCH: 'English',
  ERROR_GENERIC: 'Terjadi kesalahan. Silakan coba lagi.',
  ERROR_INVALID_EMAIL: 'Masukkan alamat email yang valid.',
  ERROR_SHORT_PASSWORD: 'Kata sandi minimal 8 karakter.',
} satisfies Translation;

export default id;
```

> Translation files use `satisfies` (not type annotations) so TypeScript infers the literal type — this enables autocomplete on `LL.*()` and catches missing keys at compile time.

### Initialization

**`app/lib/i18n/index.ts`** — Manually configured instead of using `createI18nServer`/`createI18nClient` wrappers:

```typescript
import { locales as loadedLocales } from './i18n-util';
import type { Locales } from './i18n-types';

export const defaultLocale: Locales = 'en';
export const locales = ['en', 'id'] as const;

export { I18nContext, useI18nContext } from './i18n-react';
export { default as I18nClient } from './i18n-react';
export { setLocaleCookie } from './set-locale-fn';
```

### Component Usage

```tsx
import { useI18nContext, LL } from '~/lib/i18n';

function LoginForm() {
  const { LL } = useI18nContext();
  // LL is fully typed — autocomplete works, mistyped keys fail to compile
  return (
    <form>
      <h1>{LL.LOGIN_TITLE()}</h1>
      <label>{LL.LOGIN_EMAIL()}</label>
      <input type="email" />
      <button>{LL.LOGIN_SUBMIT()}</button>
    </form>
  );
}
```

### Locale Switching

```tsx
import { useI18nContext, setLocale } from '~/lib/i18n';
import { setLocaleCookie } from '~/lib/i18n/set-locale-fn';

function LocaleToggle() {
  const { locale, setLocale } = useI18nContext();
  const locales = ['en', 'id'] as const;

  const handleToggle = async () => {
    const next = locales.find((l) => l !== locale) ?? 'id';
    await setLocaleCookie(next); // server function sets cookie with 1-year expiry
    setLocale(next); // instant client-side switch
  };

  return <button onClick={handleToggle}>{LL.LOCALE_SWITCH()}</button>;
}
```

### Root Provider

Wrap the app in `__root.tsx`:

```tsx
import { I18nClient } from '~/lib/i18n';

export function RootLayout({ children }: { children: React.ReactNode }) {
  return <I18nClient locale="en">{children}</I18nClient>;
}
```

> Note: `locale="en"` is hardcoded for now. Dynamic SSR locale detection is deferred to a follow-up track when the full locale SSR flow is implemented.

### Server-Side Locale Detection

**`app/lib/i18n/get-server-locale.ts`** — Reads locale from cookie for SSR:

```typescript
import { defaultLocale } from './index';
import type { Locales } from './i18n-types';

export function getServerLocale(request: Request): Locales {
  try {
    const cookie = request.headers.get('cookie') ?? '';
    const match = cookie.match(/locale=(en|id)/);
    return (match?.[1] as Locales) ?? defaultLocale;
  } catch {
    return defaultLocale;
  }
}
```

### Set Locale Server Function

**`app/lib/i18n/set-locale-fn.ts`** — Zod-validated POST endpoint that sets the locale cookie:

```typescript
import { createServerFn } from '@tanstack/start';
import { z } from 'zod';

export const setLocaleCookie = createServerFn({ method: 'POST' })
  .validator(z.object({ locale: z.enum(['en', 'id']) }))
  .handler(async ({ data }) => {
    // Cookie set with 1-year expiry, sameSite lax
    // ...
  });
```

### Build Configuration

In `package.json`:

```json
{
  "scripts": {
    "i18n": "typesafe-i18n --no-watch",
    "dev": "typesafe-i18n --no-watch && vite dev",
    "build": "typesafe-i18n --no-watch && vite build"
  }
}
```

> The `--no-watch` flag prevents the typesafe-i18n CLI from entering watch mode, which would hang the pipeline.

The generator reads the translation files and produces `i18n-types.ts`, `i18n-util.ts`, `i18n-util.sync.ts`, `i18n-util.async.ts`, and `i18n-react.tsx` automatically. Generated files are checked into git with `/* eslint-disable */` headers and are excluded from ESLint and Prettier via config.

### Generated File Safety

Generated i18n files are excluded from:

- **ESLint** — listed in `eslint.config.js` `ignores` array
- **Prettier** — listed in `.prettierignore`

This prevents lint/format tools from fighting with the typesafe-i18n generator's output format.

---

## 10. Component Interaction Map (Visual)

```
                     ┌────────────────────────────────────┐
                     │          __root.tsx                │
                     │  (AuthGate + Providers +           │
                     │   ToastContainer)                  │
                     └──────────┬─────────────────────────┘
                                │
           ┌─────────────────────┼──────────────────────┐
           ▼                     ▼                      ▼
    ┌───────────┐       ┌──────────────┐          ┌───────────────┐
    │  /login   │       │  /dashboard  │          │   /learn      │
    │ LoginForm │       │  (Parent)    │          │  (Child)      │
    └───────────┘       │  ┌──────────┐│          │  ┌──────────┐ │
                        │  │ErrorBound││          │  │ErrorBound│ │
                        │  └──────────┘│          │  └──────────┘ │
                        │ DashboardHdr │          │ LetterGrid    │
                        │  ├─►LangToggle│         │  └─►LetterCard│
                        │  └─►ProfileMenu│        │  ├─►ChildHarakatBar│
                        │    └►ConfirmDialog│     │  ├─►HarakatIndicator│
                        │ ProfileList  │          │               │
                        │  ├─►ProfileEditor│      │ AudioEngine   │
                        │  └─►ChildModeToggle│    │ (singleton)   │
                        │              │          └───────┬───────┘
                        │ (child route)│                  │
                        │ /dashboard/  │          ┌───────▼───────┐
                        │ profiles/$id │          │ /learn/reading│
                        │  /letters    │          │  (Child)      │
                        │  └─►Letter   │          │  ┌──────────┐ │
                        │     ToggleGrd│          │  │ErrorBound│ │
                        │     ├─►Harakat│         │  └──────────┘ │
                        │     │ Selector│         │ GroupPills    │
                        └──────────────┘          │ GroupHeader   │
                                                  │ ReadingGrid   │
                                                  │  └─►ReadingCell│
                                                  │ ReadingActions│
                                                  └───────────────┘
                                                ┌───────▼───────┐
                                                │ /learn/reading│
                                                │  (Child)      │
                                                │  ┌──────────┐ │
                                                │  │ErrorBound│ │
                                                │  └──────────┘ │
                                                │ GroupPills    │
                                                │ GroupHeader   │
                                                │ ReadingGrid   │
                                                │  └─►ReadingCell│
                                                │ ReadingActions│
                                                └───────────────┘

        Global (app-wide):
        ┌──────────────────────────────────────────────────────┐
        │  Zustand Stores: auth-store, child-store,            │
        │  ui-store (includes toasts[])                        │
        │  i18n: translations by cookie                        │
        │  AudioEngine: lazy-init on first tap                 │
        │  harakat.ts: composeLetter() utility                 │
        │  reading.ts: generateReadingGroups() utility         │
        │  ToastContainer: top-level, reads ui-store.toasts    │
        │  ErrorBoundary: wraps dashboard, learn, reading      │
        └──────────────────────────────────────────────────────┘
```

---

## 11. Performance Budgets

| Metric                             | Target                      | Measurement             |
| ---------------------------------- | --------------------------- | ----------------------- |
| **LCP (Largest Contentful Paint)** | < 2.5s                      | Lighthouse              |
| **FID (First Input Delay)**        | < 100ms                     | Lighthouse / RUM        |
| **Audio Tap-to-Play**              | < 150ms                     | Custom Performance.mark |
| **Harakat Mode Switch Re-render**  | < 50ms                      | React DevTools Profiler |
| **Audio File Load**                | < 100ms (typical size ~3KB) | Network tab             |
| **Bundle Size (initial JS)**       | < 120KB gzipped             | Bundler analyzer        |
| **SQLite Query (single row)**      | < 10ms                      | Drizzle logging         |

---

## 12. Deployment Configuration

### Dockerfile (`docker/Dockerfile`)

Multi-stage build: deps → build → runner. Three distinct stages minimize the final image size. Runner stage uses a non-root user (`app:1001`) for security.

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN pnpm build

# Stage 3: Runner (production)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY docker/server-entry.mjs ./docker/server-entry.mjs
EXPOSE 3000
CMD ["node", "docker/server-entry.mjs"]
```

### docker-compose.yml (`docker-compose.yml` at project root)

```yaml
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET:?BETTER_AUTH_SECRET is required}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL:-http://localhost:3000}
      - DATABASE_URL=${DATABASE_URL:-file:./data/little-alif.db}
      - CHILD_MODE_SECRET=${CHILD_MODE_SECRET:-}
    volumes:
      - little-alif-data:/app/data
    restart: unless-stopped

volumes:
  little-alif-data:
```

### server-entry.mjs (`docker/server-entry.mjs`)

A custom Node.js HTTP server that serves static assets from `public/` and delegates all other requests to the TanStack Start SSR handler. Ships as an ES module (`.mjs`) to avoid CommonJS/ESM conflicts.

**Security features (T-19):**

- Path traversal prevention: resolved path must stay within `CLIENT_DIR` (returns 403 otherwise)
- Security headers on all responses: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 0`, `Content-Security-Policy` (self + Google Fonts + unsafe-inline/eval for TanStack Start hydration)

### Environment Variables

| Variable             | Required | Description                                                     |
| -------------------- | -------- | --------------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | Yes      | Secret for signing Better Auth session cookies (min 32 chars)   |
| `BETTER_AUTH_URL`    | No       | Public URL of the app. Default: `http://localhost:3000`         |
| `DATABASE_URL`       | No       | SQLite path. Default: `file:./data/little-alif.db`              |
| `CHILD_MODE_SECRET`  | No       | Secret for signing child-mode cookies. Generated if not set.    |
| `NODE_ENV`           | No       | `production` or `development`. Default: `production` in runner. |

---

## 13. Error Handling

Two complementary error handling layers:

1. **Error Boundaries** — Catch route-level React crashes (rendering errors). Display a full-page "Try Again" fallback.
2. **Toast Notifications** — Catch per-action server function errors (network failures, validation errors). Display a dismissable, auto-expiring notification.

### Error Boundary

A reusable class component (`app/components/ui/ErrorBoundary.tsx`) that wraps each protected route:

```tsx
// ErrorBoundary wraps the route component
// On error → shows fallback UI with "Try Again" button
// On recover → re-renders children normally
```

**Pattern (in each route):**

```tsx
export default function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
```

- Routes wrapped: `/dashboard`, `/learn`, `/learn/reading`
- `componentDidCatch` captures error info
- `Try Again` button calls `setState({ hasError: false })` to re-render children
- Fallback UI shows a subtle error icon + message in the app's design language
- 5 tests covering: renders children, catches errors, fallback renders, Try Again recovers, sets hasError state

### Toast Notifications

A Zustand-driven toast system (`app/components/ui/ToastContainer.tsx`) that reads from `useUiStore`:

```typescript
// ui-store.ts — toast state
toasts: Array<{ id: string; message: string; type: 'success' | 'error' }>;
addToast(message: string, type: 'success' | 'error') => void;
removeToast(id: string) => void;
```

- `ToastContainer` renders at the app layout level (above route content)
- Auto-dismiss after 5 seconds (setTimeout in `addToast`)
- Dismiss on click (calls `removeToast`)
- `aria-live="polite"` for screen reader announcements
- Renders nothing when `toasts.length === 0` (empty state)
- Styled with project design tokens: `border-coral/30 bg-coral/10 text-coral` for errors, green for success
- 8 tests covering: rendering, success/error variants, auto-dismiss, dismiss on click, multiple toasts, empty state

**Wired into server function error handlers:**
| Component | Scenario | Toast Type | Message |
| ------------------------ | -------------------------------- | ---------- | ---------------------------- |
| `HarakatSelector` | Vowel mode save fails | `error` | Generic error |
| `LetterToggleGrid` | Toggle save fails | `error` | Generic error |
| `ProfileEditor` | Profile create/update fails | `error` | Generic error |
| `Dashboard` | Delete profile fails | `error` | Generic error |
| `Dashboard` | Sign out fails | `error` | Generic error |

### Error Matrix

| Scenario                                     | UX                                                  | Layer            |
| -------------------------------------------- | --------------------------------------------------- | ---------------- |
| Auth session expired                         | Silent redirect to `/login`                         | Router           |
| Route rendering crash                        | Full-page "Try Again" fallback                      | ErrorBoundary    |
| Server function network error                | Toast: "Connection lost. Check your internet."      | useTypedMutation |
| Auth failure (session invalid)               | Toast: "Please sign in again." + redirect           | useTypedMutation |
| Validation failure                           | Toast: "Check your input and try again." (info)     | useTypedMutation |
| Resource not found                           | Toast: "Item not found. It may have been deleted."  | useTypedMutation |
| Business limit exceeded                      | Toast: "Maximum reached."                           | useTypedMutation |
| Unclassified server error                    | Toast: "Something went wrong. Please try again."    | useTypedMutation |
| Audio file not found                         | Silent — skip playback                              | AudioEngine      |
| Letter toggle save fails                     | Toast error via useTypedMutation                    | useTypedMutation |
| Profile creation exceeds 4                   | Toast: "Maximum reached."                           | useTypedMutation |
| Vowel mode save fails                        | Toast error via useTypedMutation                    | useTypedMutation |
| Reading practice: no visible letters         | Show empty state with "Ask parent to add letters"   | Component        |
| Reading practice: single group (< 3 letters) | Show group with what's available (grid still works) | Component        |
| SQLite write failure                         | Toast: "Something went wrong." (UNKNOWN)            | useTypedMutation |
| Invalid child-mode cookie                    | Clear cookie → redirect to `/login`                 | Middleware       |

---

## 15. Error Classification System

Server function errors use a typed classification system (`ServerFunctionError` + `ErrorCode`) that replaces generic `Error('message')` throws. This enables contextual, bilingual toast messages instead of vague "Something went wrong" notifications.

### Error Type System (`app/lib/errors/index.ts`)

```typescript
export type ErrorCode =
  | 'VALIDATION' // Input validation failures
  | 'AUTH' // Authentication/authorization failures
  | 'NOT_FOUND' // Resource not found
  | 'LIMIT_EXCEEDED' // Business rule limits (e.g., max 4 profiles)
  | 'NETWORK' // Transport-level failures (fetch errors)
  | 'UNKNOWN'; // Fallback for unclassified errors

export class ServerFunctionError extends Error {
  code: ErrorCode;
  userMessage: string;
  cause?: unknown;

  constructor(code: ErrorCode, userMessage: string, cause?: unknown) {
    super(userMessage);
    this.name = 'ServerFunctionError';
    this.code = code;
    this.userMessage = userMessage;
    this.cause = cause;
  }
}
```

### Error Code → Toast Variant Mapping

| Error Code       | Toast Variant | EN Message                                  | ID Message                                     |
| ---------------- | ------------- | ------------------------------------------- | ---------------------------------------------- |
| `VALIDATION`     | `info`        | "Check your input and try again."           | "Periksa input Anda dan coba lagi."            |
| `AUTH`           | `error`       | "Please sign in again."                     | "Silakan masuk lagi."                          |
| `NOT_FOUND`      | `info`        | "Item not found. It may have been deleted." | "Item tidak ditemukan. Mungkin sudah dihapus." |
| `LIMIT_EXCEEDED` | `error`       | "Maximum reached."                          | "Batas maksimum tercapai."                     |
| `NETWORK`        | `error`       | "Connection lost. Check your internet."     | "Koneksi terputus. Periksa internet Anda."     |
| `UNKNOWN`        | `error`       | "Something went wrong. Please try again."   | "Terjadi kesalahan. Silakan coba lagi."        |

### `useTypedMutation` Hook (`app/lib/hooks/useTypedMutation.ts`)

A thin wrapper around TanStack Query's `useMutation` that catches `ServerFunctionError` and dispatches `pushToast` with the correct variant and i18n message:

```typescript
export function useTypedMutation<TData, TVariables>(
  options: UseTypedMutationOptions<TData, TVariables>,
) {
  const { pushToast } = useUiStore();
  const { LL } = useI18nContext();

  return useMutation({
    ...options,
    onError: (error, variables, context) => {
      if (error instanceof ServerFunctionError) {
        const variant = ERROR_TOAST_VARIANT[error.code];
        const message = getErrorMessage(error.code, LL);
        pushToast({ variant, message });
      } else {
        // Fallback: detect network errors from fetch failures
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          pushToast({ variant: 'error', message: LL.ERROR_NETWORK() });
        } else {
          pushToast({ variant: 'error', message: LL.ERROR_UNKNOWN() });
        }
      }
      options.onError?.(error, variables, context);
    },
  });
}
```

### Server Function Error Mapping

All server function handlers throw `ServerFunctionError` with appropriate codes:

| Current Message                                | Error Code       |
| ---------------------------------------------- | ---------------- |
| "Maximum of 4 child profiles reached."         | `LIMIT_EXCEEDED` |
| "Profile not found or does not belong to you." | `NOT_FOUND`      |
| "Unauthenticated."                             | `AUTH`           |
| "Unauthorized. Parent session required."       | `AUTH`           |
| Better Auth APIError rethrows                  | `AUTH`           |
| All other server errors                        | `UNKNOWN`        |

### i18n Keys

6 new keys added to both EN and ID locales:

- `ERROR_VALIDATION`, `ERROR_AUTH`, `ERROR_NOT_FOUND`, `ERROR_LIMIT_EXCEEDED`, `ERROR_NETWORK`, `ERROR_UNKNOWN`

### Key Design Decisions

- Lightweight `Error` subclass — not a full Result/Option monad
- `useTypedMutation` wraps `useMutation`, doesn't replace it
- Network errors detected client-side via `TypeError: Failed to fetch` → `NETWORK` code
- Backward compatible — old `Error` subclasses still work, uncaught errors fall through to `UNKNOWN`

---

## 16. Security Hardening (T-19)

Security hardening addressing vulnerabilities identified in the 2026-06-07 audit. Covers Docker deployment, authentication, database schema, and client-side security.

### Path Traversal Prevention

`docker/server-entry.mjs` resolves the file path and verifies it stays within `CLIENT_DIR` before serving. Returns 403 for any path that escapes the allowed directory.

### Child-Mode Cookie Hardening

- `httpOnly: true` — prevents client-side JS access (store tracks `childProfileId` via server function response)
- `secure: true` in production
- `maxAge: 2,592,000` (30 days, reduced from 365 days)

### HMAC Secret Fail-Fast

`getSecret()` in `app/lib/utils/child-mode.server.ts` throws immediately if neither `CHILD_MODE_SECRET` nor `BETTER_AUTH_SECRET` is set. Prevents silent misconfiguration where cookies are signed with an empty string.

### Rate Limiting

In-memory rate limiter (`app/lib/utils/rate-limit.ts`) applied to `registerFn` and `loginFn`:

- 5 attempts per minute per IP
- IP extracted from `x-forwarded-for` header or `req.socket.remoteAddress`
- Returns `ServerFunctionError(ErrorCode.AUTH)` on limit exceeded

No external dependencies (Redis, etc.) — appropriate for single-parent deployment.

### Security Headers

Added to all responses in `docker/server-entry.mjs`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 0`
- `Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data:; connect-src 'self'`

> TanStack Start's SSR + hydration requires `'unsafe-inline'` and `'unsafe-eval'` for scripts. This is a known limitation of CSP with Vite-based frameworks.

### Open Redirect Prevention

`login.tsx` `validateSearch` validates the `redirect` parameter:

- Must start with `/`
- Must not start with `//` (prevents `//evil.com` redirects)
- Falls back to `/dashboard` if invalid

### Docker Non-Root User

Runner stage creates `app` user (UID 1001) and runs as non-root:

```dockerfile
RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app
RUN chown -R app:app /app
USER app
```

### Database Schema Improvements

- `profiles.userId` now has explicit FK constraint: `.references(() => user.id, { onDelete: 'cascade' })`
- Added index `idx_profiles_user_id` on `profiles.userId`

### Accessibility Improvements

- `--color-text-muted` changed from `#8a8a9a` to `#6b6b7b` (~4.6:1 contrast on warm background) for WCAG AA compliance
- Added `@media (prefers-reduced-motion: reduce)` media query to disable animations

---

## 14. Code Quality & Tooling

The project ships with automated code-quality tooling wired to run on every commit. Formatting, lint, and type errors are caught locally before code reaches the remote.

### Tooling

| Tool        | Purpose                           | Config               |
| ----------- | --------------------------------- | -------------------- |
| Prettier    | Code formatting                   | `.prettierrc.json`   |
| ESLint      | Linting (flat config, TS + React) | `eslint.config.js`   |
| TypeScript  | Static type checking              | `tsconfig.json`      |
| Vitest      | Test runner                       | `vitest.config.ts`   |
| Husky       | Git hook orchestrator             | `.husky/pre-commit`  |
| lint-staged | Run gates only on staged files    | `.lintstagedrc.json` |

### Pre-Commit Pipeline

`.husky/pre-commit` runs in order:

1. **`pnpm lint-staged`** — Prettier + ESLint on staged files (`*.{ts,tsx}` and `*.{json,md,css}`)
2. **`pnpm typecheck`** — `tsc --noEmit --incremental` over the whole project

If any step exits non-zero, the commit is rejected. `tsc` is intentionally **outside** the lint-staged glob: TypeScript cannot meaningfully scope a type check to a single file (it always walks the project's import graph), so the whole-project check lives in the hook itself.

### Style Guides

Authoritative style rules live in `conductor/code_styleguides/` (one file per concern: TypeScript, React, HTML/CSS, SQL). Lint and formatter rules are derived from them where possible. Always read them before contributing.

### Quality Gates (Manual)

| Command              | Checks                             |
| -------------------- | ---------------------------------- |
| `pnpm format:check`  | Verify Prettier compliance         |
| `pnpm lint`          | Run ESLint                         |
| `pnpm typecheck`     | Run `tsc --noEmit`                 |
| `pnpm test`          | Run Vitest suite                   |
| `pnpm test:coverage` | Run Vitest with V8 coverage report |

The full tool versions and configuration are listed in [Tech Stack — Development Tools](./tech-stack.md#development-tools). The pipeline itself is detailed in [Workflow — Pre-Commit Quality Gates](./workflow.md#pre-commit-quality-gates).
