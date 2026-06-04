<protect>
# Plan: Child Mode

**Track ID:** `child-mode_20260604`

---

## Phase 1: Cookie Signing Utility [checkpoint: 23812a2]

- [x] Task: Create `app/lib/utils/child-mode.ts` — HMAC cookie sign/verify `bb925fd`
  - [x] Write unit tests for `signChildModeCookie()` and `verifyChildModeCookie()`
  - [x] Implement `signChildModeCookie(profileId, name, avatar): string`
  - [x] Implement `verifyChildModeCookie(cookieValue): ChildModePayload | null`
  - [x] Add `CHILD_MODE_SECRET` env var fallback logic (falls back to `BETTER_AUTH_SECRET`)
  - [x] Verify tests pass
- [x] Task: Conductor - User Manual Verification 'Phase 1: Cookie Signing Utility' (Protocol in workflow.md)

---

## Phase 2: Server Functions (enableChildModeFn & disableChildModeFn)

- [x] Task: Add Zod schemas for child mode operations `7f52a4f`
  - [x] Add `enableChildModeSchema` to `app/lib/validations/auth.ts` `7f52a4f`
- [x] Task: Implement `enableChildModeFn` in `app/server/auth-fns.ts` `71f8d2f`
  - [x] Write unit tests for `enableChildModeFn`
  - [x] Implement: validate profile ownership → sign cookie → set cookie → return success
- [x] Task: Implement `disableChildModeFn` in `app/server/auth-fns.ts` `71f8d2f`
  - [x] Write unit tests for `disableChildModeFn`
  - [x] Implement: delete `child_mode` cookie → return success
- [x] Task: Update `validateSessionFn` for dual auth `cfc0d3a`
  - [x] Write tests for child-mode cookie validation path
  - [x] Implement: check `child_mode` cookie → verify → return child session shape
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Server Functions' (Protocol in workflow.md)

---

## Phase 3: Landing Page & Learn Route Protection

- [ ] Task: Update landing page (`app/routes/index.tsx`) beforeLoad
  - [ ] Write route tests for child-mode redirect flow
  - [ ] Implement: check child cookie first → redirect to `/learn`, else check JWT → `/dashboard`, else landing
- [ ] Task: Add beforeLoad guard to `/learn` route (`app/routes/learn.tsx`)
  - [ ] Write route tests for learn route auth
  - [ ] Implement: accept parent JWT or child-mode cookie → set authStore.childProfileId
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Route Protection' (Protocol in workflow.md)

---

## Phase 4: ChildModeToggle Component

- [ ] Task: Create `app/components/parent/ChildModeToggle.tsx`
  - [ ] Write component tests for enable/disable flow
  - [ ] Implement toggle UI with Radix Switch
  - [ ] Wire to `enableChildModeFn` and `disableChildModeFn`
  - [ ] Show active status (which profile has child mode enabled)
- [ ] Task: Integrate ChildModeToggle into dashboard (`app/routes/dashboard.tsx`)
  - [ ] Add toggle to profile cards in `ProfileList`
  - [ ] Verify navigation flow: enable → redirect to /learn
- [ ] Task: Conductor - User Manual Verification 'Phase 4: ChildModeToggle Component' (Protocol in workflow.md)

---

## Phase 5: Server Function Dual Auth — Child-Allowed Functions

- [ ] Task: Update `getVisibleLettersFn` for child-mode auth
  - [ ] Write integration tests for child-mode letter fetching
  - [ ] Update: accept child session → verify cookie profileId matches request → return letters
- [ ] Task: Update `getActiveProfileFn` for child-mode auth
  - [ ] Write tests for child-mode profile fetching
  - [ ] Update: accept child session → verify cookie profileId matches → return profile
- [ ] Task: Update `getReadingDataFn` for child-mode auth (in `app/server/reading.ts`)
  - [ ] Write tests for child-mode reading data
  - [ ] Update: accept child session → verify cookie profileId matches → return reading data
- [ ] Task: Verify parent-only functions still reject child sessions
  - [ ] Write tests that `toggleLetterFn`, `bulkToggleLettersFn`, mutation profile functions reject child-mode
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Dual Auth Integration' (Protocol in workflow.md)

---

## Phase 6: Edge Cases & Final Verification

- [ ] Task: Handle cookie deletion on profile deletion
  - [ ] Update `deleteProfile` in `app/server/profiles.ts` to clear child cookie if the deleted profile was in child mode
  - [ ] Write tests for this scenario
- [ ] Task: Run full test suite and verify coverage
  - [ ] `pnpm test` — all tests pass
  - [ ] `pnpm typecheck` — clean
  - [ ] `pnpm lint` — clean
  - [ ] `pnpm format:check` — clean
- [ ] Task: Conductor - User Manual Verification 'Phase 6: Edge Cases & Final Verification' (Protocol in workflow.md)
      </protect>
