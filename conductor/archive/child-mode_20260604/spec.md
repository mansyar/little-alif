<protect>
# Spec: Child Mode

**Track ID:** `child-mode_20260604`
**Type:** Feature
**Dependencies:** T-03 (Authentication — Better Auth), T-05 (Parent Dashboard & Child Profiles)
**Status:** New

## Overview

Implement cookie-based child mode that bypasses parent authentication. The parent enables child mode for a specific profile from the dashboard. A signed cookie (`child_mode`) is set in the browser. On subsequent visits, the app auto-detects the cookie and takes the child directly to `/learn` without requiring login.

This implements **Module 3 (Child Mode)** from the PRD.

## Functional Requirements

| ID      | Requirement                                                                                                               | Priority |
| ------- | ------------------------------------------------------------------------------------------------------------------------- | -------- |
| REQ-3.1 | After login, parent can enable "Child Mode" for a specific child profile from the dashboard.                              | P0       |
| REQ-3.2 | Child Mode stores a signed cookie (`child_mode`) identifying the active child profile: `{ profileId, name, avatar }`.     | P0       |
| REQ-3.3 | On subsequent visits, the app auto-detects Child Mode and skips auth entirely — goes straight to `/learn` for that child. | P0       |
| REQ-3.4 | Parent can disable Child Mode from the parent dashboard (clears cookie).                                                  | P0       |
| REQ-3.5 | Only one child can be in Child Mode at a time per device. Enabling for a new profile clears any existing cookie.          | P1       |

## Non-Functional Requirements

- **Security:** Cookie signed with HMAC-SHA256 to prevent tampering. Invalid/malformed cookie is treated as "no cookie."
- **Persistence:** No expiry — persists until parent explicitly disables it.
- **Logout independence:** Parent logout does NOT clear child mode cookie.

## Tech Design

### Cookie Spec

```
Name: child_mode
Value: <base64_json> || '.' || <hmac_signature_hex>
  where JSON = { profileId: string, name: string, avatar: string }
HttpOnly: false (readable by JS for UI hints)
Secure: true in production
SameSite: Lax
Max-Age: 365 days
Path: /
```

### Cookie Signing (`app/lib/utils/child-mode.ts` — NEW)

HMAC-SHA256 using a secret from `CHILD_MODE_SECRET` env var (fallback to `JWT_SECRET`).

- `signChildModeCookie(profileId, name, avatar): string` — creates signed cookie value
- `verifyChildModeCookie(cookieValue): { profileId, name, avatar } | null` — verifies + parses, returns null on tampering

### Server Functions (`app/server/auth-fns.ts` — UPDATED)

| Function                           | Signature                                                          | Notes                                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `enableChildModeFn({ profileId })` | POST → `{ success: true }`                                         | Validates profile ownership. Sets signed `child_mode` cookie. Clears existing child cookie first (one-profile-per-device). |
| `disableChildModeFn()`             | POST → `{ success: true }`                                         | Deletes the `child_mode` cookie.                                                                                           |
| `validateSessionFn()`              | GET → `{ user: { id, email, isChild?, childProfileId? } } \| null` | **Enhanced:** Also checks `child_mode` cookie. If valid, returns child session.                                            |

### Router Updates

| Route                | Change                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` (index.tsx)      | BeforeLoad: Check `child_mode` cookie first. If valid → redirect to `/learn`. Else check parent JWT → redirect to `/dashboard`. Else show landing page. |
| `/learn` (learn.tsx) | **Add beforeLoad:** Accept either parent JWT or child-mode cookie. Child mode sets `useAuthStore.childProfileId` from cookie data.                      |
| `/dashboard`         | **No change** to auth (still requires parent JWT only).                                                                                                 |

### Server Function Auth Updates

**Dual auth:** `validateSessionFn()` is enhanced to return both parent and child session info. Server functions check context-appropriately:

- **Child-allowed functions** (read-only child operations): `getVisibleLettersFn`, `getActiveProfileFn`, `getReadingDataFn` — accept either parent JWT or child-mode cookie. When child-mode, the `profileId` from the cookie must match the requested `profileId`.
- **Parent-only functions** (mutations): `toggleLetterFn`, `bulkToggleLettersFn`, `listProfilesFn`, `createProfileFn`, `updateProfileFn`, `deleteProfileFn` — still require parent JWT. `validateSessionFn()` returns null for child-mode on these.

### New Component: ChildModeToggle (`app/components/parent/ChildModeToggle.tsx`)

Radix Switch-based toggle per profile card on the dashboard:

- **OFF state:** Shows "Enable Child Mode" button.
- **ON state:** Shows active child name + avatar + "Disable" button.
- Calls `enableChildModeFn({ profileId })` or `disableChildModeFn()`.
- Reads active status from a server-side check or from client-side Zustand.

### Zustand Auth Store Updates (`app/stores/auth-store.ts`)

- `setChildMode(profileId)` gets called from `/learn` beforeLoad when child-mode cookie is detected.
- `clear()` remains unchanged (clears everything).
- No structural changes needed — existing `childProfileId` and `setChildMode` already support this.

## Edge Cases

| Scenario                                          | Behavior                                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Cookie tampered / malformed signature             | `verifyChildModeCookie()` returns null → treated as no cookie → redirect to `/login`                 |
| Parent deletes profile that has child mode active | Next request to validate child cookie → profile lookup fails → cookie cleared → redirect to `/login` |
| Both JWT and child cookie present on `/learn`     | Child mode wins (sets childProfileId from cookie)                                                    |
| JWT present on `/learn` without child cookie      | Normal parent session — can access /learn if they navigated directly                                 |
| Enabling child mode for 2nd profile               | Replaces existing cookie — only the last-enabled profile has active child mode                       |

## Out of Scope

- Multiple simultaneous child mode profiles per device
- Child mode PIN/biometrics protection
- Child mode switching from the `/learn` UI (parent must use dashboard)
- Offline child mode detection

## Verification

1. Enable child mode for a profile → cookie set with signed profile data
2. Close tab, reopen → auto-redirects to `/learn` without login
3. Disable child mode → cookie cleared → redirects to `/login`
4. Only one profile can be in child mode at a time
5. Delete profile in child mode → cookie cleared on next request
6. Tampered cookie → treated as no cookie
7. Parent logout → child mode still works (cookie preserved)
   </protect>
