<protect>
# Implementation Plan: i18n Setup

**Track ID:** `i18n-setup_20260602`

---

## Phase 1: Install & Configure typesafe-i18n

**Goal:** Set up the typesafe-i18n toolchain so the generator runs cleanly.

- [x] Task: Install `typesafe-i18n@^5.26.0` as a devDependency `6775a35`
  - [x] Run `pnpm add -D typesafe-i18n@^5.26.0`
- [x] Task: Create `.typesafe-i18n.json` configuration at project root `6775a35`
  - [x] Set `adapter: "react"`, `outputPath: "./app/lib/i18n"`, `baseLocale: "en"`, `locales: ["en", "id"]`
- [x] Task: Create the directory structure and translation files `6775a35`
  - [x] Created `app/lib/i18n/en/index.ts` (English base locale with all keys)
  - [x] Created `app/lib/i18n/id/index.ts` (Indonesian locale with all translations)
- [x] Task: Run `pnpm i18n` to generate type files `6775a35`
  - [x] Verify `i18n-types.ts` includes both `'en'` and `'id'` locales with 27 typed keys
  - [x] Verify `i18n-util.ts` has `locales = ['en', 'id']`
  - [x] Verify `i18n-util.async.ts` has locale loaders for both locales
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

---

## Phase 2: Write Translation Files

**Goal:** Create complete English and Indonesian translation files matching the initial key set.

- [x] Task: Write failing test for translation key completeness (Red phase) `7e1d447`
  - [x] Create `app/lib/i18n/translation-keys.test.ts`
  - [x] Test that `en/index.ts` exports all 27 expected translation keys
  - [x] Test that `id/index.ts` exports all 27 expected translation keys
  - [x] Run tests — 4 translation tests pass (Green phase)
- [x] Task: Write `app/lib/i18n/en/index.ts` with all English strings `6775a35`
  - [x] Already done during Phase 1 v5 setup
- [x] Task: Write `app/lib/i18n/id/index.ts` with all Indonesian translations `6775a35`
  - [x] Already done during Phase 1 v5 setup
- [x] Task: Run `pnpm i18n` to regenerate type files with full translations `6775a35`
  - [x] Already done — types have 27 keys for both locales
- [x] Task: Run tests — confirm translation tests now pass (Green phase) `7e1d447`
  - [x] 4/4 translation tests pass, 94/94 total tests pass
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

---

## Phase 3: Create i18n Initialization & Root Provider

**Goal:** Set up locale detection, SSR + client i18n init, and wrap the app root.

- [x] Task: Write failing tests for i18n initialization (Red phase)
  - [x] 5 tests for `getServerLocale` and module exports
  - [x] Tests confirmed failing — index.ts didn't exist
- [x] Task: Implement `app/lib/i18n/index.ts`
  - [x] Export `defaultLocale = 'en'`, `locales = ['en', 'id']`
  - [x] Export `I18nClient` (TypesafeI18n provider) and `useI18nContext`
  - [x] Create `getServerLocale()` for SSR cookie-based locale detection
- [x] Task: Run `pnpm i18n` to regenerate (no changes needed — index.ts doesn't affect types)
- [x] Task: Run tests — confirm i18n init tests pass (Green phase)
  - [x] 5/5 i18n init tests pass, 99/99 total tests pass
- [x] Task: Integrate I18nClient provider into `app/routes/__root.tsx` `b8feb3a`
  - [x] Import `I18nClient` from `~/lib/i18n`
  - [x] Wrap children in `<I18nClient locale="en">` provider
  - [ ] Skip: `<html lang="en">` — defer dynamic lang to follow-up when locale SSR flow is complete
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

---

## Phase 4: Create Language Toggle Component [checkpoint: 2e5fa75]

**Goal:** Build the dashboard navbar locale toggle that switches between EN and ID.

- [x] Task: Write failing tests for LanguageToggle component (Red phase) `3c9b4dd`
  - [x] Create `app/components/parent/LanguageToggle.test.tsx`
  - [x] Test that the toggle renders with correct initial label
  - [x] Test that clicking the toggle switches locale
  - [x] Test that locale cookie is updated on toggle
  - [x] Run tests and confirm they fail
- [x] Task: Implement `app/components/parent/LanguageToggle.tsx` `3c9b4dd`
  - [x] Import `useI18nContext` and `setLocale` from `~/lib/i18n`
  - [x] Read current locale from context
  - [x] On click: toggle between `en` and `id`, update cookie, call `setLocale(next)`
  - [x] Render with `LL.LOCALE_SWITCH()` as button label
- [x] Task: Run tests — confirm LanguageToggle tests pass (Green phase) `3c9b4dd`
  - [x] 4 LanguageToggle tests pass, 103/103 total tests pass
  - [x] `pnpm lint` clean, `pnpm typecheck` clean
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
</protect>
