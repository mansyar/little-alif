# Implementation Plan: i18n Setup

**Track ID:** `i18n-setup_20260602`

---

## Phase 1: Install & Configure typesafe-i18n

**Goal:** Set up the typesafe-i18n toolchain so the generator runs cleanly.

- [ ] Task: Install `typesafe-i18n@^5.26.0` as a devDependency
  - [ ] Run `pnpm add -D typesafe-i18n@^5.26.0`
- [ ] Task: Create `.typesafe-i18n.json` configuration at project root
  - [ ] Set `adapter: "react"`, `outputPath: "./app/lib/i18n"`, `baseLocale: "en"`, `locales: ["en", "id"]`
- [ ] Task: Create the `app/lib/i18n/translations/` directory structure
  - [ ] Create `app/lib/i18n/translations/en.ts` (placeholder stub)
  - [ ] Create `app/lib/i18n/translations/id.ts` (placeholder stub)
- [ ] Task: Run `pnpm i18n` to generate type files from stubs
  - [ ] Verify `i18n-types.ts`, `i18n-util.ts`, `i18n-util.async.ts` are generated in `app/lib/i18n/`
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Write Translation Files

**Goal:** Create complete English and Indonesian translation files matching the initial key set.

- [ ] Task: Write failing test for translation key completeness (Red phase)
  - [ ] Create `app/lib/i18n/translations.test.ts`
  - [ ] Test that `en.ts` exports all expected Translation keys
  - [ ] Test that `id.ts` exports all expected Translation keys
  - [ ] Run tests and confirm they fail (no translation files exist yet)
- [ ] Task: Write `app/lib/i18n/translations/en.ts` with all English strings
  - [ ] Auth keys: `LOGIN_TITLE`, `LOGIN_EMAIL`, `LOGIN_PASSWORD`, `LOGIN_SUBMIT`, `LOGIN_NO_ACCOUNT`, `REGISTER_TITLE`, `REGISTER_SUBMIT`
  - [ ] Dashboard keys: `DASHBOARD_TITLE`, `DASHBOARD_ADD_CHILD`, `DASHBOARD_NO_CHILDREN`
  - [ ] Letter keys: `LETTERS_SHOW`, `LETTERS_HIDE`
  - [ ] Child Mode keys: `CHILDMODE_ENABLE`, `CHILDMODE_DISABLE`, `CHILDMODE_ACTIVE`
  - [ ] Profile keys: `PROFILE_NAME`, `PROFILE_AVATAR`, `PROFILE_SAVE`, `PROFILE_DELETE`, `PROFILE_DELETE_CONFIRM`
  - [ ] Locale key: `LOCALE_SWITCH` (value: "Bahasa Indonesia")
  - [ ] Error keys: `ERROR_GENERIC`, `ERROR_INVALID_EMAIL`, `ERROR_SHORT_PASSWORD`
- [ ] Task: Write `app/lib/i18n/translations/id.ts` with all Indonesian translations
  - [ ] Same key structure as `en.ts`, values in Bahasa Indonesia
- [ ] Task: Run `pnpm i18n` to regenerate type files with full translations
- [ ] Task: Run tests — confirm translation tests now pass (Green phase)
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Create i18n Initialization & Root Provider

**Goal:** Set up locale detection, SSR + client i18n init, and wrap the app root.

- [ ] Task: Write failing tests for i18n initialization (Red phase)
  - [ ] Test that `createI18nServer` initializes with correct locale detection
  - [ ] Test that locale cookie is read correctly (`locale=en` → `en`, `locale=id` → `id`, missing → `en`)
  - [ ] Test that `app/lib/i18n/index.ts` exports all expected modules
  - [ ] Run tests and confirm they fail
- [ ] Task: Implement `app/lib/i18n/index.ts`
  - [ ] Export `defaultLocale = 'en'`, `locales = ['en', 'id']`
  - [ ] Create `I18nServer` via `createI18nServer()` with cookie-based locale detection
  - [ ] Create `I18nClient` and export `{ I18nClient, useI18nContext, setLocale }`
- [ ] Task: Run `pnpm i18n` to regenerate (index.ts may trigger type changes)
- [ ] Task: Run tests — confirm i18n init tests pass (Green phase)
- [ ] Task: Integrate I18nClient provider into `app/routes/__root.tsx`
  - [ ] Import `I18nClient` from `~/lib/i18n`
  - [ ] Wrap children in `<I18nClient>` provider
  - [ ] Update `<html lang="en">` to dynamical lang attribute when locale support is ready
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

---

## Phase 4: Create Language Toggle Component

**Goal:** Build the dashboard navbar locale toggle that switches between EN and ID.

- [ ] Task: Write failing tests for LanguageToggle component (Red phase)
  - [ ] Create `app/components/parent/LanguageToggle.test.tsx`
  - [ ] Test that the toggle renders with correct initial label
  - [ ] Test that clicking the toggle switches locale
  - [ ] Test that locale cookie is updated on toggle
  - [ ] Run tests and confirm they fail
- [ ] Task: Implement `app/components/parent/LanguageToggle.tsx`
  - [ ] Import `useI18nContext` and `setLocale` from `~/lib/i18n`
  - [ ] Read current locale from context
  - [ ] On click: toggle between `en` and `id`, update cookie, call `setLocale(next)`
  - [ ] Render with `LL.LOCALE_SWITCH()` as button label
- [ ] Task: Run tests — confirm LanguageToggle tests pass (Green phase)
- [ ] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)

---

## Phase 5: Integrate i18n into Existing Pages

**Goal:** Replace all hardcoded strings in login and register pages with type-safe i18n keys.

- [ ] Task: Update `app/routes/login.tsx` to use i18n
  - [ ] Replace `"Parent Login"` with `{LL.LOGIN_TITLE()}`
  - [ ] Replace `"Sign in to manage your child profiles."` with `{LL.LOGIN_SUBTITLE()}`
  - [ ] Replace `"Email"` label with `{LL.LOGIN_EMAIL()}`
  - [ ] Replace `"Password"` label with `{LL.LOGIN_PASSWORD()}`
  - [ ] Replace `"Signing in…"/"Sign in"` with `{submitting ? LL.LOGIN_SUBMITTING() : LL.LOGIN_SUBMIT()}`
  - [ ] Replace `"No account? Create one"` with i18n keys
- [ ] Task: Update translation files with new keys from login page integration
  - [ ] Add `LOGIN_SUBTITLE`, `LOGIN_SUBMITTING`, `LOGIN_SIGNUP_LINK` to both `en.ts` and `id.ts`
- [ ] Task: Update `app/routes/register.tsx` to use i18n
  - [ ] Replace `"Create Account"` with `{LL.REGISTER_TITLE()}`
  - [ ] Replace subtitle with `{LL.REGISTER_SUBTITLE()}`
  - [ ] Replace `"Email"` and `"Password"` labels
  - [ ] Replace `"At least 8 characters."` hint with `{LL.REGISTER_PASSWORD_HINT()}`
  - [ ] Replace `"Creating account…"/"Create account"` with i18n keys
  - [ ] Replace `"Already have an account? Sign in"` with i18n keys
- [ ] Task: Update translation files with new keys from register page
  - [ ] Add `REGISTER_SUBTITLE`, `REGISTER_PASSWORD_HINT`, `REGISTER_SUBMITTING`, `REGISTER_SIGNIN_LINK` to both `en.ts` and `id.ts`
- [ ] Task: Run `pnpm i18n` to regenerate types with new keys
- [ ] Task: Run full test suite — confirm all tests pass
- [ ] Task: Conductor - User Manual Verification 'Phase 5' (Protocol in workflow.md)

---

## Phase 6: Final Verification & Checkpoint

**Goal:** Run full verification — automated tests + manual review of locale switching.

- [ ] Task: Run `pnpm typecheck` and `pnpm lint` — fix any issues
- [ ] Task: Run `pnpm test` — verify all tests pass (including coverage)
- [ ] Task: Run `pnpm dev` and manually verify:
  - [ ] Login page renders with English strings by default
  - [ ] Navigating to `/register` shows English strings
  - [ ] Toggle to Indonesian — all text switches
  - [ ] Refresh page — locale persists
  - [ ] Toggle back to English — text switches back
- [ ] Task: Conductor - User Manual Verification 'Phase 6' (Protocol in workflow.md)

---

**Checkpoint:** Implementation complete, track ready for closure.
