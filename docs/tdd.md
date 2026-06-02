# 🔧 Technical Design Document (TDD)

**Project:** Little Alif
**Version:** 1.2 (Development Update)
**Based on:** PRD v1.2

### Implementation Status

> Sections marked **✅ Implemented** are delivered in the archived tracks. Sections marked **⬜ Pending** are planned for future tracks.

| §   | Section                              | Status                    | Track                                                                                                                                                |
| --- | ------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Project Structure                    | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)                                                                                 |
| 2   | Route Design                         | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/), [`parent-dashboard_20260602`](../conductor/archive/parent-dashboard_20260602/) |
| 3   | Server Functions                     | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/), [`parent-dashboard_20260602`](../conductor/archive/parent-dashboard_20260602/) |
| 4   | Zod Schemas                          | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/), [`parent-dashboard_20260602`](../conductor/archive/parent-dashboard_20260602/) |
| 5   | UI Component Library                 | ⬜ Pending                | —                                                                                                                                                    |
| 6   | State Management (stores scaffolded) | ✅ Implemented (scaffold) | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)                                                                                 |
| 7   | Audio Architecture                   | ⬜ Pending                | —                                                                                                                                                    |
| 8   | Database Schema                      | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)                                                                                 |
| 9   | Component Data Flow                  | ⬜ Pending                | —                                                                                                                                                    |
| 10  | Auth Flow                            | ✅ Implemented            | [`scaffolding_20260531`](../conductor/archive/scaffolding_20260531/)                                                                                 |
| 11  | Bilingual UI                         | ✅ Implemented            | [`i18n-setup_20260602`](../conductor/archive/i18n-setup_20260602/)                                                                                   |
| 12  | Component Interaction Map            | ⬜ Pending                | —                                                                                                                                                    |
| 13  | Performance Budgets                  | ⬜ Pending                | —                                                                                                                                                    |
| 14  | Deployment Configuration             | ⬜ Pending                | —                                                                                                                                                    |
| 15  | Error Handling                       | ⬜ Pending                | —                                                                                                                                                    |
| 16  | Code Quality & Tooling               | ✅ Implemented            | [`code-quality_20260601`](../conductor/archive/code-quality_20260601/)                                                                               |

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
│   │   └── learn/
│   │       └── reading.tsx          # Child reading practice (Iqra' mode)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── AuthGate.tsx         # Decides: login vs child mode skip
│   │   ├── parent/
│   │   │   ├── ProfileList.tsx      # List of child profiles as cards
│   │   │   ├── ProfileEditor.tsx    # Add/edit child profile modal (Radix Dialog)
│   │   │   ├── AvatarPicker.tsx     # Avatar selection grid
│   │   │   ├── LetterToggleGrid.tsx # 28-letter grid (Radix Switch per letter)
│   │   │   ├── HarakatSelector.tsx  # Vowel mode selector (parent toggle screen)
│   │   │   └── ChildModeToggle.tsx  # Enable/disable child mode for a profile
│   │   ├── child/
│   │   │   ├── LetterGrid.tsx       # The child's letter exploration grid
│   │   │   ├── LetterCard.tsx       # Single letter card (glyph + tap handler)
│   │   │   ├── LetterDetail.tsx     # Full-screen letter display during playback
│   │   │   ├── ChildHarakatBar.tsx  # Vowel mode buttons for the child grid
│   │   │   ├── EmptyState.tsx       # "No letters yet" illustration
│   │   │   ├── ProfileBadge.tsx     # Shows the active child's avatar + name
│   │   │   └── reading/
│   │   │       ├── ReadingGrid.tsx       # The 6-row reading practice grid
│   │   │       ├── ReadingCell.tsx       # Single tappable cell in the grid
│   │   │       ├── GroupHeader.tsx       # Shows the 3 letters of the current group
│   │   │       ├── GroupPills.tsx        # Navigation pills between groups
│   │   │       └── ReadingActions.tsx    # Shuffle / Next Group / Done buttons
│   │   └── ui/
│   │       ├── LoadingSpinner.tsx
│   │       ├── Toast.tsx            # Error/success notifications
│   │       └── ConfirmDialog.tsx    # Confirm destructive actions (Radix Dialog)
│   ├── lib/
│   │   ├── audio/
│   │   │   ├── AudioEngine.ts       # Web Audio API manager
│   │   │   └── preloader.ts         # Idle-time audio preloading
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
│   │       └── cn.ts                # Tailwind class merge utility
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
│   ├── audio/                       # Pronunciation .mp3 files
│   │   ├── alif.mp3
│   │   ├── ba.mp3
│   │   └── ...
│   └── images/
│       └── avatars/                 # Themed avatar SVGs
├── drizzle.config.ts
├── docker/
│   └── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── app.config.ts                    # TanStack Start config
└── .env.example
```

---

## 2. Route Design (TanStack Router)

| Route            | Auth Required                  | Description                                                                             |
| ---------------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| `/`              | No                             | Landing. Checks child-mode cookie → redirects to `/learn` or `/login`.                  |
| `/login`         | No                             | Parent login form.                                                                      |
| `/register`      | No                             | Parent registration form.                                                               |
| `/dashboard`     | Yes (parent JWT)               | Parent dashboard — profile listing + per-child letter management.                       |
| `/learn`         | Yes (child-mode cookie or JWT) | Child letter grid. Shows only parent-introduced letters. Includes harakat mode buttons. |
| `/learn/reading` | Yes (child-mode cookie or JWT) | Child reading practice (Iqra' mode). Dynamic groups from toggled-on letters.            |

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
HttpOnly: false (readable by JS for UX hints)
Secure: true in production
SameSite: Lax
Max-Age: indefinite (no expiry — cleared on parent logout)
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

| PRD Feature           | Radix Primitive                | Purpose                                                          |
| --------------------- | ------------------------------ | ---------------------------------------------------------------- |
| Letter ON/OFF toggles | `@radix-ui/react-switch`       | Accessible toggle switch for each letter in the parent dashboard |
| Profile editor        | `@radix-ui/react-dialog`       | Modal for adding/editing child profiles                          |
| Delete confirmation   | `@radix-ui/react-alert-dialog` | Destructive action confirmation                                  |
| Avatar picker         | `@radix-ui/react-radio-group`  | Single-select avatar grid                                        |

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

### Preloading Strategy

```
App Mount (Child Mode) →
  1. Determine which letters are visible for this child
  2. Preload visible letters' audio immediately
  3. On idle → preload remaining letters (round-robin)
  4. Store decoded AudioBuffer in Map<string, AudioBuffer>

On Letter Tap →
  1. If buffer exists → play instantly (< 10ms latency)
  2. If not loaded → fallback to <audio> element with preload="auto"
```

### AudioEngine (`app/lib/audio/AudioEngine.ts`)

```typescript
class AudioEngine {
  private context: AudioContext | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private gainNode: GainNode | null = null;
  private preloadQueue: string[] = [];
  private isPreloading: boolean = false;

  // Must be called from user gesture (browser autoplay policy)
  async init(): Promise<void>;

  // Preload a single letter+vowel combination
  // audioKey: "{letterId}_{vowelMode}" e.g., "alif_fathah"
  async preload(audioKey: string): Promise<void>;

  // Preload a batch — used on idle
  async preloadBatch(audioKeys: string[]): Promise<void>;

  // Play letter+vowel pronunciation. Returns a promise that resolves when done.
  // audioKey: "{letterId}_{vowelMode}"
  async play(audioKey: string): Promise<void>;

  // Preload all 4 vowel modes for a set of letter IDs
  async preloadAllModes(letterIds: string[]): Promise<void>;

  // Get preload progress
  getProgress(): { loaded: number; total: number };

  // Cleanup
  dispose(): void;
}
```

**Harakat-Aware Preloading:**

```
App Mount (Child Mode) →
  1. Determine visible letters + current vowel mode
  2. Preload visible letters' audio for the current vowel mode only
  3. When child switches vowel mode → preload new mode's files
  4. On idle → preload remaining vowel modes for visible letters
```

**Audio File Requirements:**

- Format: MP3 (128kbps CBR, 44.1kHz, mono)
- Duration: 1–2 seconds per letter+vowel combination
- Total files: **112** (28 letters × 4 vowel modes: plain, fathah, kasrah, dammah)
- Naming: `{letterId}_{vowelMode}.mp3` (e.g., `alif_fathah.mp3`, `ba_kasrah.mp3`). Plain mode files may omit the suffix: `alif.mp3`
- Source: Public domain / open-source Hijaiyah audio recordings

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
  │     ├── Read childProfileId from child-mode cookie (or URL param)
  │     ├── Initialize AudioEngine on first tap (browser policy)
  │     ├── child-store.loadVisibleLetters(profileId)
  │     └── Start audio preloader for visible letters
  │
  ├── If visibleLetters.length === 0:
  │     └── Render EmptyState (friendly illustration)
  │
  ├── If visibleLetters.length > 0:
  │     └── LetterGrid
  │           └── LetterCard × N
  │                 ├── Shows: Arabic glyph (large), colored background
  │                 ├── onClick:
  │                 │     ├── ui-store.selectLetter(letterId)
  │                 │     ├── audioEngine.play(letterId)
  │                 │     ├── ui-store.setPlaying(true)
  │                 │     ├── After playback completes (~1-2s):
  │                 │     │     ├── Handler: AudioEngine play resolves
  │                 │     │     ├── ui-store.setPlaying(false)
  │                 │     │     └── ui-store.selectLetter(null) (auto-return)
  │                 │     └── Show brief scale animation on card
  │                 └── During playback: LetterDetail overlay (full-screen letter)
  │
  └── On unmount:
        └── Dispose AudioEngine
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
  │     │     ├── Row 0: systematic (generatePracticeRow('systematic'))
  │     │     └── Rows 1-5: randomized (generatePracticeRow('mixed'))
  │     │           └── ReadingCell × 9 per row
  │     │                 └── onClick → audioEngine.play(`${letterId}_${vowelMode}`)
  │     │                              → brief green flash on cell
  │     └── ReadingActions:
  │           ├── "Shuffle" → re-generate rows 2-6 (same group)
  │           ├── "Next Group" → currentGroupIndex++ → re-render
  │           └── "Done" → navigate back to /learn
  │
  └── Key behaviors:
        ├── Groups are auto-derived — no manual group management
        ├── All 3 harakat modes appear in every group (systematic + mixed rows)
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
                     ┌──────────────────────────┐
                     │        __root.tsx         │
                     │  (AuthGate + Providers)   │
                     └──────────┬───────────────┘
                                │
           ┌─────────────────────┼──────────────────────┐
           ▼                     ▼                      ▼
    ┌───────────┐       ┌──────────────┐       ┌───────────────┐
    │  /login   │       │  /dashboard  │       │   /learn      │
    │ LoginForm │       │  (Parent)    │       │  (Child)      │
    └───────────┘       │              │       │               │
                        │ ProfileList  │       │ LetterGrid    │
                        │  ├─►ProfileEditor│   │  └─►LetterCard│
                        │  └─►ChildModeToggle│ │  ├─►ChildHarakatBar│
                        │              │       │  └─►HarakatIndicator│
                        │ LetterToggle │       │               │
                        │  Grid        │       │ AudioEngine   │
                        │  ├─►Harakat  │       │ (singleton)   │
                        │  │  Selector │       └───────┬───────┘
                        └──────────────┘               │
                                                ┌───────▼───────┐
                                                │ /learn/reading│
                                                │  (Child)      │
                                                │               │
                                                │ GroupPills    │
                                                │ GroupHeader   │
                                                │ ReadingGrid   │
                                                │  └─►ReadingCell│
                                                │ ReadingActions│
                                                └───────────────┘

        Global (app-wide):
        ┌──────────────────────────────────────────────────┐
        │  Zustand Stores: auth-store, child-store,        │
        │  ui-store                                        │
        │  i18n: translations by cookie                    │
        │  AudioEngine: lazy-init on first tap             │
        │  harakat.ts: composeLetter() utility             │
        │  reading.ts: generateReadingGroups() utility     │
        └──────────────────────────────────────────────────┘
```

---

## 11. Performance Budgets

| Metric                             | Target            | Measurement             |
| ---------------------------------- | ----------------- | ----------------------- |
| **LCP (Largest Contentful Paint)** | < 2.5s            | Lighthouse              |
| **FID (First Input Delay)**        | < 100ms           | Lighthouse / RUM        |
| **Audio Tap-to-Play**              | < 150ms           | Custom Performance.mark |
| **Harakat Mode Switch Re-render**  | < 50ms            | React DevTools Profiler |
| **First Preload Batch**            | Within 3s of idle | requestIdleCallback     |
| **Bundle Size (initial JS)**       | < 120KB gzipped   | Bundler analyzer        |
| **SQLite Query (single row)**      | < 10ms            | Drizzle logging         |

---

## 12. Deployment Configuration

### Dockerfile

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM base AS runner
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

EXPOSE 3000
CMD ["node", "./dist/server/index.js"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=file:./data/little-alif.db
    volumes:
      - little-alif-data:/app/data
    restart: unless-stopped

volumes:
  little-alif-data:
```

### Environment Variables

| Variable       | Required | Description                                        |
| -------------- | -------- | -------------------------------------------------- |
| `JWT_SECRET`   | Yes      | Secret for signing JWT tokens (min 32 chars)       |
| `DATABASE_URL` | No       | SQLite path. Default: `file:./data/little-alif.db` |
| `NODE_ENV`     | No       | `production` or `development`                      |

---

## 13. Error Handling

| Scenario                                     | UX                                                  | Logging       |
| -------------------------------------------- | --------------------------------------------------- | ------------- |
| Auth session expired                         | Silent redirect to `/login`                         | None          |
| Server function network error                | Toast: "Connection error" + retry                   | console.error |
| Audio file not found                         | Silent — skip playback                              | console.warn  |
| Letter toggle save fails                     | Toast: "Could not save" + revert toggle visually    | console.error |
| Profile creation exceeds 4                   | Toast: "Maximum 4 children"                         | None          |
| Vowel mode save fails                        | Toast: "Could not update vowel mode"                | console.error |
| Reading practice: no visible letters         | Show empty state with "Ask parent to add letters"   | None          |
| Reading practice: single group (< 3 letters) | Show group with what's available (grid still works) | None          |
| SQLite write failure                         | Toast: "Could not save changes"                     | console.error |
| Invalid child-mode cookie                    | Clear cookie → redirect to `/login`                 | console.warn  |

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
