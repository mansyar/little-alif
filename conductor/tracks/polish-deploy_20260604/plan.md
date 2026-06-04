<protect>
# Implementation Plan: Polish, Docker & Deployment

## Phase 1: Audio MP3 Generation [checkpoint: 7d109af]

- [x] Task: Generate 112 MP3 audio files via Google Cloud TTS
  - [x] Run `gcloud auth application-default-login` to authenticate
  - [x] Run `pnpm generate:audio` to generate all MP3 files
  - [x] Verify 112 files exist in `public/audio/letters/` (28 letters × 4 vowel modes)
  - [x] Verify AudioEngine plays MP3 correctly (tap a letter card in /learn)
- [x] Task: Conductor - User Manual Verification 'Phase 1: Audio MP3 Generation' (Protocol in workflow.md)

## Phase 2: Error Boundaries [checkpoint: aaa4a0a]

- [x] Task: Create reusable ErrorBoundary component (90ae33c)
  - [x] Write tests for ErrorBoundary (`app/components/ui/ErrorBoundary.test.tsx`) — verify it catches errors, renders fallback, resets on "Try Again"
  - [x] Implement `app/components/ui/ErrorBoundary.tsx` — React class component with `componentDidCatch`, fallback UI with "Try Again" button, `console.error` logging
- [x] Task: Wire Error Boundaries into route components (90ae33c)
  - [x] Wrap `/dashboard` route with ErrorBoundary
  - [x] Wrap `/learn` route with ErrorBoundary
  - [x] Wrap `/learn/reading` route with ErrorBoundary
- [x] Task: Conductor - User Manual Verification 'Phase 2: Error Boundaries' (Protocol in workflow.md)

## Phase 3: Toast Notifications [checkpoint: 27a529f]

- [x] Task: Create ToastContainer component
  - [x] Write tests for ToastContainer (`app/components/ui/ToastContainer.test.tsx`) — verify toasts render, auto-dismiss, dismiss on click
  - [x] Implement `app/components/ui/ToastContainer.tsx` — reads `toasts` from `useUiStore`, renders each toast with variant styling (success/error/info), auto-dismiss after 5s, dismiss on click
  - [x] Wire ToastContainer into `__root.tsx` — render below main content
- [x] Task: Wire toast notifications into server function error handlers (0af90a9)
  - [x] Wire toast in `letters.ts` server functions — toggle failure → Toast: "Could not save"
  - [x] Wire toast in `profiles.ts` server functions — max 4 → Toast: "Maximum 4 children", save failure → Toast: "Could not save"
  - [x] Wire toast in `profiles.ts` — vowel mode save failure → Toast: "Could not update vowel mode"
- [x] Task: Conductor - User Manual Verification 'Phase 3: Toast Notifications' (Protocol in workflow.md)

## Phase 4: Docker & Deployment Configuration [checkpoint: 4ed417b]

- [x] Task: Create Dockerfile (77b6022)
  - [x] Write `docker/Dockerfile` with multi-stage build (deps → build → runner, node:20-alpine)
  - [x] Verify `pnpm build` succeeds in production mode
  - [x] Test `docker build` produces a working image
- [x] Task: Create docker-compose.yml (77b6022)
  - [x] Write `docker-compose.yml` with app service, SQLite volume mount, env vars
  - [x] Add `docker/server-entry.mjs` (custom HTTP server wraps TanStack Start fetch handler)
  - [x] Test `docker compose up` starts the app successfully
- [x] Task: Update .env.example (77b6022)
  - [x] Add `BETTER_AUTH_URL` (was missing)
  - [x] Add `NODE_ENV`
  - [x] Add documentation comments for all variables
- [x] Task: Conductor - User Manual Verification 'Phase 4: Docker & Deployment' (Protocol in workflow.md)
  - [x] Docker compose now stays running (server listening on :3000)

## Phase 5: Verification & Audit [checkpoint: a76b0ac]

- [x] Task: Run full test suite and verify pass rate
  - [x] `pnpm test` — 51 files, 404 tests passing
  - [x] `pnpm typecheck` — no type errors
  - [x] `pnpm lint` — no lint errors
  - [x] `pnpm build` — production build succeeds (client 2010 + SSR 431 modules)
- [x] Task: Comprehensive manual verification (852ae50)
  - [x] Responsive design: letter grid centered; all routes fit at 360px–1024px
  - [x] Touch target audit: all interactive elements ≥ 64x64dp — feels right
  - [x] Performance check: first paint < 2s on Slow 3G — feels fast
  - [x] Accessibility check: keyboard navigation works, screen reader friendly
- [x] Task: Conductor - User Manual Verification 'Phase 5: Verification & Audit' (Protocol in workflow.md)
      </protect>
