# 📑 Product Requirements Document (PRD)

**Project Name:** Little Alif
**Tagline:** Introducing the Arabic alphabet, one letter at a time.
**Target Audience:** Children (Ages 3–6) being introduced to Hijaiyah letters.
**Tech Stack:** TanStack Start (React), Tailwind CSS v4, Zustand, Better Auth, Zod, Radix UI, Lucide React, typesafe-i18n, SQLite (via Drizzle ORM), Docker, Coolify on VPS.
**Version:** 1.1 (Revised — Reading-First Scope)

---

## 1. Executive Summary

Little Alif is an interactive, self-hosted web application that helps young children (ages 3–6) get familiar with the Arabic alphabet (Hijaiyah). It is designed as a **digital companion for parent-led teaching** — the parent introduces letters offline, then toggles them on in the app so the child can explore, tap, and hear pronunciations.

The app is intentionally simple: no gamification, no tracing, no auto-progression. The parent controls the pace, the child enjoys the discovery.

**Core Tenets:**

- **Parent-Led Progress:** Only the parent decides which letters are visible to the child.
- **Kid-Friendly UX:** Large touch targets, zero text instructions, instant audio feedback.
- **Self-Hosted & Private:** All data stays on the parent's own VPS.
- **Mobile-First:** Designed for the devices kids actually use — tablets and phones.

---

## 2. User Personas

| Persona                 | Role     | Primary Needs                                                                                                                   |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **The Child (Learner)** | End User | Tap letters, hear sounds, feel a sense of discovery. Cannot read text. Needs large touch targets (≥64x64dp).                    |
| **The Parent (Admin)**  | Manager  | Introduce letters at their own pace, see what each child has been exposed to, manage profiles, lock the device into Child Mode. |

---

## 3. System Architecture

A unified SSR application deployed inside a single Docker container. TanStack Start handles server rendering, routing, and data mutations via server functions — no separate backend.

```
                    ┌────────────────────────────┐
                    │   Coolify / Caddy Proxy     │
                    └───────────┬────────────────┘
                                │ (Port 3000)
                                ▼
                     ┌──────────────────────┐
                     │  TanStack Start App  │
                     │  (Single Container)  │
                     └───────┬──────┬───────┘
                             │      │
              ┌──────────────┘      └──────────────┐
              ▼ (Client-Side)                       ▼ (Server-Side)
     ┌──────────────────┐                  ┌──────────────────────┐
     │  Letter Grid     │                  │  Better Auth (lib)   │
     │  Audio Engine    │                  │  ├─ Email/Password   │
     │  Zustand Store   │                  │  ├─ Session Mgmt     │
     └──────────────────┘                  │  └─ CSRF Protection  │
                                           ├──────────────────────┤
                                           │  Server Functions:   │
                                           │  ├─ Letter Toggles   │
                                           │  └─ Profile CRUD     │
                                           └──────────┬───────────┘
                                                      ▼
                                           ┌──────────────────┐
                                           │  Drizzle ORM     │
                                           │  (+ Better Auth  │
                                           │   tables managed │
                                           │   automatically) │
                                           └────────┬─────────┘
                                                    ▼
                                           ┌──────────────────┐
                                           │  SQLite Database  │
                                           │  (Persistent Vol) │
                                           └──────────────────┘
```

**Key Decisions:**

- **No separate backend.** TanStack Start server functions replace an API server.
- **Better Auth for authentication.** Handles email/password auth, session management, CSRF protection, and cookie security. Integrates directly with Drizzle — its tables (user, session, account, verification) are managed automatically.
- **Zod for input validation.** Every server function validates its inputs against a Zod schema — prevents malformed data and provides type-safe errors.
- **Radix UI for accessible primitives.** Unstyled, accessible components for the parent dashboard: Switch (letter toggles), Dialog (profile editor), and future interactive elements.
- **Lucide for icons.** Lightweight, consistent icon library for UI affordances (speaker, lock, edit, toggle indicators).
- **SQLite.** Single-file database, mounted as a Docker volume. No database service needed.
- **Audio as static assets.** Preloaded on idle for instant playback.

---

## 4. Functional Requirements

### Module 1: Parent Authentication (Server-Side)

| ID      | Requirement                                                                                                            | Priority |
| ------- | ---------------------------------------------------------------------------------------------------------------------- | -------- |
| REQ-1.1 | Auth powered by Better Auth library (better-auth). Handles email/password registration with built-in password hashing. | P0       |
| REQ-1.2 | Session managed by Better Auth — stored in HttpOnly secure cookies with automatic refresh. No manual JWT management.   | P0       |
| REQ-1.3 | Session expiry after 30 days of inactivity (configurable via Better Auth options).                                     | P1       |
| REQ-1.4 | CSRF protection enabled via Better Auth middleware.                                                                    | P0       |
| REQ-1.5 | All `/parent/*` routes and profile-management server functions protected by Better Auth session check.                 | P0       |

### Module 2: Child Profiles (Server-Side + Client-Side)

| ID      | Requirement                                                                                                 | Priority |
| ------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| REQ-2.1 | Authenticated parent can add up to 4 child profiles. Each profile needs: name + avatar selection.           | P0       |
| REQ-2.2 | Avatar selection from a predefined set of themed illustrations (Hijaiyah-themed: Alif-lamp, Ba-boat, etc.). | P1       |
| REQ-2.3 | Parent can edit child name and avatar.                                                                      | P1       |
| REQ-2.4 | Parent can delete a child profile (cascading delete of their progress).                                     | P0       |

### Module 3: Child Mode (Client-Side)

| ID      | Requirement                                                                                                                      | Priority |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- | -------- |
| REQ-3.1 | After login, parent can enable "Child Mode" for a specific child profile.                                                        | P0       |
| REQ-3.2 | Child Mode stores a signed cookie identifying the active child profile.                                                          | P0       |
| REQ-3.3 | On subsequent visits, the app auto-detects Child Mode and skips auth entirely — goes straight to the letter grid for that child. | P0       |
| REQ-3.4 | Parent can disable Child Mode from the parent dashboard (clears cookie).                                                         | P0       |
| REQ-3.5 | Only one child can be in Child Mode at a time per device. Parent must switch if another child wants to use it.                   | P1       |

### Module 4: Parent Dashboard — Letter Management (Server-Side + Client-Side)

| ID      | Requirement                                                                                  | Priority |
| ------- | -------------------------------------------------------------------------------------------- | -------- |
| REQ-4.1 | Parent dashboard shows all child profiles as cards.                                          | P0       |
| REQ-4.2 | Clicking a child profile opens a letter management view: all 28 letters displayed in a grid. | P0       |
| REQ-4.3 | Each letter has a simple ON/OFF toggle. Default is OFF.                                      | P0       |
| REQ-4.4 | Toggle ON → letter appears on the child's learning grid. Toggle OFF → letter disappears.     | P0       |
| REQ-4.5 | Dashboard also shows which letters are currently visible to the child (summary view).        | P1       |
| REQ-4.6 | UI is bilingual — toggle between English and Indonesian.                                     | P1       |

### Module 5: Child Letter Grid (Client-Side)

| ID      | Requirement                                                                                                                        | Priority |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------- |
| REQ-5.1 | Full-screen grid displaying only the letters the parent has toggled ON for this child.                                             | P0       |
| REQ-5.2 | Each letter card shows: the Arabic glyph (large, centered), a subtle background color. No text labels.                             | P0       |
| REQ-5.3 | Letter cards are large, tappable targets (minimum 64x64dp, preferably larger on tablets).                                          | P0       |
| REQ-5.4 | Tapping a letter card plays its pronunciation via Web Audio API.                                                                   | P0       |
| REQ-5.5 | Pronunciation playback must start within 150ms of tap.                                                                             | P0       |
| REQ-5.6 | After playback completes (~1–2s), auto-return to the grid view.                                                                    | P1       |
| REQ-5.7 | Subtle tap animation on the card (scale bounce or color flash).                                                                    | P1       |
| REQ-5.8 | If no letters are toggled on yet, show a friendly illustration + "Ask your parent to add letters!" message (no text — icon-based). | P1       |

### Module 6: Audio Engine (Client-Side)

| ID      | Requirement                                                                                              | Priority |
| ------- | -------------------------------------------------------------------------------------------------------- | -------- |
| REQ-6.1 | Audio files preloaded during idle time (requestIdleCallback) for instant playback.                       | P0       |
| REQ-6.2 | Preload priority: letters currently visible on the grid first, then remaining letters in the background. | P1       |
| REQ-6.3 | Audio preload progress communicated if needed (no UI clutter — stored for readiness).                    | P2       |
| REQ-6.4 | Fallback to `<audio>` element if Web Audio API unavailable.                                              | P1       |

### Module 7: Harakat (Vowel Modes)

| ID      | Requirement                                                                                                                                                                                    | Priority |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| REQ-7.1 | Parent selects a global vowel mode per child profile from 4 options: Plain (no harakat), Fathah (َ a), Kasrah (ِ i), Dammah (ُ u).                                                             | P0       |
| REQ-7.2 | Vowel mode is applied dynamically to all letter glyphs in the child's grid via Unicode combining diacritics — no separate glyph images needed.                                                 | P0       |
| REQ-7.3 | Special handling for non-connecting letters (ا, و, ي, ر, د, ذ, ز) — precomposed fallback glyphs for visually correct rendering. ز shares the same base shape as ر and gets the same treatment. | P0       |
| REQ-7.4 | Font preloaded aggressively (Cairo via `<link rel="preload">` with `font-display: block`) to minimize FOUT/FOIT across Windows, macOS, and Linux.                                              | P1       |
| REQ-7.5 | Child can independently change the vowel mode from their grid — buttons toggle between the 4 modes.                                                                                            | P0       |
| REQ-7.6 | Child's vowel mode change is temporary (per-session or per-device) and does not affect the parent's global setting.                                                                            | P1       |
| REQ-7.7 | Audio playback plays the pronunciation matching the currently active vowel mode (e.g., بَ = "Ba", بِ = "Bi", بُ = "Bu").                                                                       | P0       |
| REQ-7.8 | A label above the child grid shows the current vowel mode (e.g., "Fathah (a) — listen with vowel").                                                                                            | P1       |
| REQ-7.9 | Parent vowel selector (on the toggle screen) also shows a preview of each letter with the selected harakat applied.                                                                            | P1       |

### Module 8: Reading Practice (Iqra' Mode)

| ID       | Requirement                                                                                                                                                                                                                                         | Priority |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| REQ-8.1  | A separate "Reading Practice" screen accessible from the child's letter grid via a prominent button.                                                                                                                                                | P0       |
| REQ-8.2  | Groups are dynamically generated from the child's toggled-on letters — 3 letters per group, in display order. Reading Practice button is disabled if fewer than 3 letters are toggled on (a group of 1–2 letters produces a sparse, unusable grid). | P0       |
| REQ-8.3  | Each group is presented as a 6-row grid. Row 1 is systematic: each letter with Fathah, then Kasrah, then Dammah (e.g., بَ بِ بُ تَ تِ تُ ثَ ثِ ثُ).                                                                                                 | P0       |
| REQ-8.4  | Rows 2–6 are randomized: each letter with each harakat shuffled into a random sequence.                                                                                                                                                             | P0       |
| REQ-8.5  | Each cell is tappable — tapping plays the pronunciation for that letter+vowel combination.                                                                                                                                                          | P0       |
| REQ-8.6  | Group navigation: pill-style buttons at the top let the user jump between groups.                                                                                                                                                                   | P1       |
| REQ-8.7  | A group header shows the Arabic letters of the current group.                                                                                                                                                                                       | P1       |
| REQ-8.8  | A "Shuffle" button re-randomizes rows 2–6 without changing the systematic row or group.                                                                                                                                                             | P1       |
| REQ-8.9  | A "Next Group" button advances to the next group (wraps around).                                                                                                                                                                                    | P1       |
| REQ-8.10 | Tap animation: cell briefly highlights green on tap to confirm interaction.                                                                                                                                                                         | P2       |

---

## 5. Scope Boundaries

### In Scope (Phase 1)

- Single parent account per deployment
- Up to 4 child profiles
- 28 isolated Hijaiyah letters (ا to ي)
- Parent-controlled ON/OFF toggles per letter per child
- 4 vowel modes (harakat): Plain, Fathah, Kasrah, Dammah — parent sets globally per child
- Child can change vowel mode independently from their grid view
- Unicode combining diacritics for dynamic vowel rendering (no separate glyphs)
- Reading Practice (Iqra' Mode): dynamic groups of 3 letters from toggled-on set, 6-row grid (1 systematic + 5 randomized)
- Web Audio API pronunciation playback (112 audio files: 28 letters × 4 vowel modes)
- Child Mode for one profile per device
- Bilingual parent UI (English + Indonesian)

### Out of Scope (Phase 2 / Future)

- Tracing canvas / writing practice
- Stars, points, or gamification
- Automated letter unlocking / progression system
- Tanwin (nunation) or sukūn
- PWA / offline support
- Multiple parent accounts
- Audio recording / speech recognition
- Printable worksheets
- Progress reports or analytics

---

## 6. Design Decisions

| #    | Decision                                                                                                                                                                                                                            | Rationale |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| DD-1 | **Alif (ا) gets no special treatment** despite being a pure vowel. The glyph اَ renders correctly in the grid, and the audio file handles the correct pronunciation (/a/, not /ʔa/). No labels or visual distinctions needed.       |
| DD-2 | **ز (zai) added to non-connecting exception list** alongside ر (ذ, د). It shares the same base letterform — if ر needs precomposed glyphs, ز does too.                                                                              |
| DD-3 | **3-letter minimum for Reading Practice.** A 1–2 letter group produces 3–6 cells in a 6-column grid → sparse, confusing layout. The button is disabled until the parent toggles at least 3 letters on.                              |
| DD-4 | **Cairo font preloaded with `font-display: block`.** Ensures consistent harakat rendering across Windows (Traditional Arabic), macOS, and Linux. Prevents FOUT/FOIT.                                                                |
| DD-5 | **Sukun (ْ) and tashdid (ّ) are Phase 2.** The current scope is single-diacritic per letter. Double diacritics add rendering complexity (stacking order, positioning) and are not needed for basic alphabet introduction.           |
| DD-6 | **`composeLetter()` is a pure function, not a component.** Single function returning a string — no DOM wrapper, no SVG, no CSS positioning. Can be used anywhere a string is needed (tooltips, buttons, grid cells, reading cells). |

---

## 7. Database Schema

> **Note:** Better Auth manages its own internal tables (`user`, `session`, `account`, `verification`) via its Drizzle adapter. These are not listed below — they are created and maintained automatically. The schema below covers only application-specific tables.

```sql
-- Users (Parents) — single user in Phase 1
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Child Profiles (max 4 per user)
CREATE TABLE profiles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,                   -- key like 'alif', 'ba', 'boat', 'star'
    vowel_mode TEXT NOT NULL DEFAULT 'fathah', -- 'none' | 'fathah' | 'kasrah' | 'dammah'
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Letter Master Data (seeded, not user-managed)
CREATE TABLE letters (
    id TEXT PRIMARY KEY,                     -- 'alif', 'ba', 'ta', ...
    character TEXT NOT NULL,                 -- Arabic glyph: ا, ب, ت, ...
    display_order INTEGER NOT NULL,          -- 1–28
    audio_files TEXT NOT NULL DEFAULT '{}'   -- JSON map: {"none":"alif.mp3","fathah":"alif_fathah.mp3","kasrah":"alif_kasrah.mp3","dammah":"alif_dammah.mp3"}
);

-- Per-child letter toggle (parent controls this)
CREATE TABLE letter_toggles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    profile_id TEXT NOT NULL,
    letter_id TEXT NOT NULL,
    is_visible INTEGER DEFAULT 0,            -- 0 = hidden, 1 = visible to child
    toggled_at TEXT,
    FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY(letter_id) REFERENCES letters(id),
    UNIQUE(profile_id, letter_id)
);

CREATE INDEX idx_toggles_profile ON letter_toggles(profile_id);
CREATE INDEX idx_toggles_letter ON letter_toggles(letter_id);
CREATE INDEX idx_letters_order ON letters(display_order);
```

---

## 8. Non-Functional Requirements

| Category             | Requirement                                                                                                                         | Target              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **Audio Latency**    | Tap to audible playback                                                                                                             | < 150ms             |
| **Touch Target**     | Minimum tappable area                                                                                                               | 64x64dp             |
| **Layout**           | Responsive; portrait-first, adapts to landscape                                                                                     | Mobile + Tablet     |
| **First Paint**      | Time to first meaningful paint (empty cache)                                                                                        | < 2s                |
| **Data Persistence** | SQLite file survives container rebuilds                                                                                             | Docker volume mount |
| **Accessibility**    | High contrast; respects prefers-reduced-motion; Radix UI primitives ensure keyboard navigation and screen reader support by default | WCAG AA             |
| **Security**         | All parent routes protected; CSRF protection via Better Auth; session cookies HttpOnly + Secure                                     | OWASP Top 10        |

---

## 9. User Flow

### Parent Flow

```
[Landing] → [Register / Login]
                │
                ▼
        [Parent Dashboard]
                │
        ┌───────┴───────┐
        ▼               ▼
 [Manage Profiles]  [Child: Aisyah]
                        │
                        ▼
              [Letter Toggle Grid]
              ┌──┐ ┌──┐ ┌──┐ ┌──┐
              │ON│ │ON│ │ON│ │OFF│  ← parent toggles
              └──┘ └──┘ └──┘ └──┘
              [Enable Child Mode]
                        │
                        ▼
              Hand tablet to child
```

### Child Flow

```
[App opens]
        │
        ▼
[Child Mode detected?] ──No──▶ [Parent Gate]
        │ Yes
        ▼
[Letter Grid (only parent-introduced letters)]
        │
        ├── Change vowel mode (button row) → Grid updates dynamically
        ├── Tap letter → Hear pronunciation → Auto-return to grid
        ├── Tap letter → Hear pronunciation → Auto-return to grid
        ├── (Repeat exploration)
        │
        └── "Reading Practice" button
                │
                ▼
        [Reading Practice Screen]
                │
        ├── Groups auto-generated from toggled-on letters (3 per group)
        ├── Row 1: systematic (each letter × each harakat)
        ├── Rows 2-6: randomized
        ├── Tap cell → Hear pronunciation
        ├── Group pills → Switch groups
        ├── Shuffle → Re-randomize rows 2-6
        └── "Done" → Back to grid
```

---

## 10. Glossary

| Term                              | Definition                                                                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Hijaiyah**                      | The Arabic alphabet — 28 letters from ا to ي                                                                                                                       |
| **Child Mode**                    | A persistent cookie-based mode that bypasses auth and takes the child directly to their letter grid                                                                |
| **Parent-Led Progression**        | The parent decides when a letter is introduced; no automated unlocking                                                                                             |
| **Letter Toggle**                 | An ON/OFF switch per letter per child, controlled from the parent dashboard                                                                                        |
| **Harakat**                       | Arabic vowel diacritics: Fathah (َ, /a/), Kasrah (ِ, /i/), Dammah (ُ, /u/)                                                                                         |
| **Combining Diacritic**           | A Unicode character that modifies the preceding base character — used to render harakat atop/below Arabic letters dynamically                                      |
| **Non-Connecting Letters**        | Letters (ا, و, ي, ر, د, ذ) that do not join to the following letter in Arabic script — require precomposed glyphs for correct harakat rendering                    |
| **Iqra' Mode / Reading Practice** | A linear reading exercise where groups of 3 letters are displayed in a 6-row grid with systematic and randomized sequences. Named after the classical Iqra' method |
| **Systematic Row**                | The first row of a reading practice grid — each letter appears with Fathah, then Kasrah, then Dammah in order                                                      |
| **Group Pills**                   | Navigation buttons displayed above the reading grid to jump between letter groups                                                                                  |
