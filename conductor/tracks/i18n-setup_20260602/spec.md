<protect>
# Specification: i18n Setup

**Track ID:** `i18n-setup_20260602`
**Type:** Feature

## Overview

Initialize [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n) v5 with English and Indonesian locales
for the parent-facing UI. All translation keys are compile-time type-checked — mistyping a key produces a
TypeScript error. The child UI uses icons and letter glyphs (no text) and does not need i18n.

**References:**

- **PRD:** §4 — REQ-4.6 (Bilingual UI)
- **TDD:** §1 (Project Structure — `app/lib/i18n/`), §9 (Bilingual UI Implementation)
- **Tech Stack:** §Internationalization (`typesafe-i18n`, EN + ID locales, cookie-based)
- **Roadmap:** T-04 (i18n Setup — depends on T-01)

## Functional Requirements

### FR-1: Install & Configure typesafe-i18n

- Install `typesafe-i18n@^5.26.0` as a dev dependency
- Create `.typesafe-i18n.json` config pointing to `./app/lib/i18n/` as output path
- Default locale: `en`, locales: `['en', 'id']`
- Adapter: `react`

### FR-2: Create Directory Structure

```
app/lib/i18n/
├── index.ts                    # i18n init + locale detection (SSR + client)
├── .typesafe-i18n.json         # Generator configuration
├── i18n-types.ts               # Generated TypeScript types
├── i18n-util.ts                # Generated util
├── i18n-util.async.ts          # Generated async loader
└── translations/
    ├── en.ts                   # English strings
    └── id.ts                   # Indonesian strings
```

### FR-3: Locale Detection

- **Server-side:** Read locale from cookie (`locale=(en|id)`), fallback to `en`
- **Client-side:** Read locale from cookie, fallback to `en`
- Locale is persisted in a cookie with 1-year expiry

### FR-4: Translation Keys (Initial Set)

Following TDD §9, the initial keys cover:

- **Auth:** `LOGIN_TITLE`, `LOGIN_EMAIL`, `LOGIN_PASSWORD`, `LOGIN_SUBMIT`, `LOGIN_NO_ACCOUNT`,
  `REGISTER_TITLE`, `REGISTER_SUBMIT`
- **Dashboard:** `DASHBOARD_TITLE`, `DASHBOARD_ADD_CHILD`, `DASHBOARD_NO_CHILDREN`
- **Letters:** `LETTERS_SHOW`, `LETTERS_HIDE`
- **Child Mode:** `CHILDMODE_ENABLE`, `CHILDMODE_DISABLE`, `CHILDMODE_ACTIVE`
- **Profile:** `PROFILE_NAME`, `PROFILE_AVATAR`, `PROFILE_SAVE`, `PROFILE_DELETE`,
  `PROFILE_DELETE_CONFIRM`
- **Locale:** `LOCALE_SWITCH` (EN: "Bahasa Indonesia", ID: "English")
- **Errors:** `ERROR_GENERIC`, `ERROR_INVALID_EMAIL`, `ERROR_SHORT_PASSWORD`

### FR-5: Build Pipeline Integration

- Add script: `"i18n": "typesafe-i18n"`
- Update `"dev"` to: `typesafe-i18n && vite dev`
- Update `"build"` to: `typesafe-i18n && vite build`

### FR-6: Language Toggle Component

- A simple button in the **dashboard navbar header**
- Toggles between English and Indonesian
- Updates `locale` cookie on toggle
- Instantly switches locale client-side via `setLocale()`

### FR-7: Existing Page Integration

- Update `app/routes/__root.tsx` — wrap with `I18nClient` provider
- Update `app/routes/login.tsx` — replace hardcoded strings with `LL.LOGIN_*(...)`
- Update `app/routes/register.tsx` — replace hardcoded strings with `LL.REGISTER_*(...)`

## Non-Functional Requirements

- **Type Safety:** All translation keys must be compile-time type-checked
- **Bundle Impact:** Minimal (~2KB gzipped for generated types + runtime)
- **Performance:** Locale switch is instant (client-side, no server round-trip)

## Acceptance Criteria

- [ ] `pnpm i18n` generates type files without errors
- [ ] Translation keys are fully typed — mistyping `LL.LOGIN_TITLE` as `LL.LOGIN_TITL` causes a compile error
- [ ] Language toggle appears in the dashboard navbar header
- [ ] Switching from EN → ID changes all parent-facing text to Indonesian
- [ ] Switching from ID → EN changes all parent-facing text to English
- [ ] Locale persists in cookie across page reloads
- [ ] Fallback to English when a key is missing in Indonesian
- [ ] Child-facing pages (`/learn`, `/learn/reading`) are unaffected by locale

## Out of Scope

- Additional translation keys beyond the initial TDD set
- i18n for child-facing UI
- SSR locale detection from `Accept-Language` header
- Dynamic locale switching on the server during SSR
  </protect>
