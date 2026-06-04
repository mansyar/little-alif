# Initial Concept

Little Alif — Arabic alphabet learning app for children.

---

# Product Guide

## Overview

**Little Alif** is an interactive, self-hosted web application that helps young children (ages 3–6) get familiar with the Arabic alphabet (Hijaiyah). It is designed as a **digital companion for parent-led teaching** — the parent introduces letters offline, then toggles them on in the app so the child can explore, tap, and hear pronunciations.

The app is intentionally simple: no gamification, no tracing, no auto-progression. The parent controls the pace, the child enjoys the discovery.

**Tagline:** Introducing the Arabic alphabet, one letter at a time.

## Target Audience

- **Primary Users:** Children ages 3–6 being introduced to Hijaiyah letters
- **Administrators:** Parents who guide their children's learning journey

## Core Tenets

1. **Parent-Led Progress:** Only the parent decides which letters are visible to the child.
2. **Kid-Friendly UX:** Large touch targets, zero text instructions, instant audio feedback.
3. **Self-Hosted & Private:** All data stays on the parent's own VPS.
4. **Mobile-First:** Designed for the devices kids actually use — tablets and phones.

## User Personas

| Persona                 | Role     | Primary Needs                                                                                     |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| **The Child (Learner)** | End User | Tap letters, hear sounds, feel discovery. Cannot read text. Needs large touch targets (≥64x64dp). |
| **The Parent (Admin)**  | Manager  | Introduce letters at their pace, manage profiles, lock device into Child Mode.                    |

## Key Features (Phase 1)

- **Single parent account** per deployment with email/password authentication
- **Up to 4 child profiles** with name and avatar selection
- **28 Hijaiyah letters** (ا to ي) — parent-controlled ON/OFF toggles per child
- **4 vowel modes (Harakat):** Plain, Fathah (َ), Kasrah (ِ), Dammah (ُ)
- **Child-selectable vowel mode** — child can change independently from their grid view
- **Unicode combining diacritics** for dynamic vowel rendering (no separate glyphs)
- **Reading Practice (Iqra' Mode):** Dynamic groups of 3 letters, 6-row grid (1 systematic + 5 randomized)
- **Audio pronunciation playback** (pre-recorded MP3 via Google Cloud TTS, Web Speech API fallback)
- **Child Mode:** Cookie-based persistent mode bypassing auth for one profile per device
- **Bilingual parent UI:** English + Indonesian
- **Hidden parent gate** on child routes — low-contrast lock icon unlocked by long-press (1.5s) or 3 taps within 1s; opens a menu to switch child or exit to parent dashboard
- **Mid-session child switching** — parent can swap to a different child profile from the parent menu without going back to the dashboard

## Out of Scope (Phase 1)

- Tracing canvas / writing practice
- Stars, points, or gamification
- Automated letter unlocking / progression system
- Tanwin (nunation) or sukūn
- PWA / offline support
- Multiple parent accounts
- Audio recording / speech recognition
- Printable worksheets
- Progress reports or analytics

## Product Requirements

### Module 1: Parent Authentication

Auth powered by Better Auth with email/password registration, session management via HttpOnly secure cookies, CSRF protection, and 30-day session expiry.

### Module 2: Child Profiles

Authenticated parent can add up to 4 child profiles with name + avatar selection, edit, and delete (cascading).

### Module 3: Child Mode

Cookie-based mode that bypasses auth. Parent enables for one profile per device. On subsequent visits, the child goes straight to their letter grid.

### Module 4: Parent Dashboard — Letter Management

Dashboard shows all child profiles. Clicking a profile opens a letter management view with ON/OFF toggles for all 28 letters.

### Module 5: Child Letter Grid

Full-screen grid showing only parent-introduced letters. Large tappable cards (≥64x64dp) with Arabic glyph and subtle background. Tapping plays pronunciation.

### Module 6: Audio Engine

Hybrid audio: pre-recorded MP3 files (Google Cloud TTS, `ar-XA`) as primary playback, Web Speech API as silent fallback. Build-time script generates 112 MP3 files (28 letters × 4 harakat). Singleton AudioEngine with `speak(letterId, vowelMode, letterChar)` signature — MP3 on success, Web Speech on error. No idle preloading needed (MP3 has no cold-start latency).

### Module 7: Harakat (Vowel Modes)

Parent selects global vowel mode per child. Child can independently change mode from their grid. Unicode combining diacritics with precomposed fallbacks for non-connecting letters.

### Module 8: Reading Practice (Iqra' Mode)

Separate screen accessible from child grid. Dynamic groups of 3 letters from toggled-on set. Systematic + randomized practice rows. Minimum 3 letters required.

### Module 9: Parent Gate & Child Switching (T-13)

A hidden lock icon in the top-right corner of `/learn` and `/learn/reading` headers provides a parent-only escape hatch from child mode. The icon is styled at 40% muted-text opacity to be invisible to young children but discoverable to parents. Two unlock gestures: long-press for 1.5s, or three taps within 1s. Unlocking opens a Radix Dialog menu (z-60) with two actions: **Switch child** (opens an overlay listing the parent's other profiles, tapping one enables child mode for that profile and navigates to `/learn`) and **Exit to parent dashboard** (clears child-mode cookie, navigates to `/dashboard` or `/login` if no parent session is active). The `Back` text link previously visible in child route headers is removed — the parent gate is the only way out of child mode.

## Design Decisions

| #    | Decision                              | Rationale                                                           |
| ---- | ------------------------------------- | ------------------------------------------------------------------- |
| DD-1 | Alif (ا) gets no special treatment    | Pure vowel — renders correctly in grid, audio handles pronunciation |
| DD-2 | ز (zai) added to non-connecting list  | Same base shape as ر — needs same precomposed glyph treatment       |
| DD-3 | 3-letter minimum for Reading Practice | 1–2 letters produce sparse, confusing grid                          |
| DD-4 | Cairo font with `font-display: block` | Consistent harakat rendering across platforms                       |
| DD-5 | Sukun and tashdid are Phase 2         | Current scope is single-diacritic per letter                        |
| DD-6 | `composeLetter()` is a pure function  | Returns string, no DOM wrapper — usable everywhere                  |
| DD-7 | Parent gate is a hidden lock icon (not a visible "Back" link) | Child can't accidentally exit; parent discovers it. 40% opacity + two unlock gestures (long-press, 3-tap) prevent accidental activation. |
| DD-8 | ChildSwitcher lists only *other* profiles | Single-child households see empty state; prevents no-op switches. |
| DD-9 | Parent menu and ChildSwitcher use Radix Dialog at z-60 and z-70 | Layered above LetterDetail (z-50) so the menu is never occluded by the letter overlay. |
