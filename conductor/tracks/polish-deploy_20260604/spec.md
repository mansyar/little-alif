# Specification: Polish, Docker & Deployment

## Overview

Final polish track covering error handling infrastructure (Error Boundaries + Toast notifications), Docker containerization for Coolify deployment, audio MP3 generation, and comprehensive verification (responsive, touch targets, performance, accessibility).

**Track ID:** polish-deploy_20260604
**Type:** Feature
**Dependencies:** T-10 (Reading Practice), T-11 (Child Mode)
**Est. Effort:** 4–6h
**PRD Ref:** §8 (Non-Functional Requirements)
**TDD Ref:** §9 (Error Handling), §11 (Performance Budgets), §12 (Deployment Configuration), §13 (Error Handling), §14 (Code Quality & Tooling — existing)

## Functional Requirements

### FR-1: Audio MP3 Generation

- Run `pnpm generate:audio` to generate 112 MP3 files (28 letters × 4 vowel modes) via Google Cloud TTS (`ar-XA` Wavenet, FEMALE, speakingRate: 0.85)
- Files placed in `public/audio/letters/` — naming: `{letterId}.mp3` and `{letterId}_{vowelMode}.mp3`
- The existing AudioEngine already supports MP3-primary + Web Speech fallback — no code changes needed
- Script is idempotent (skips existing files)
- Requires `gcloud auth application-default-login` before running

### FR-2: Error Boundaries

- Create a reusable `<ErrorBoundary>` component (React class component with `componentDidCatch`)
- Wrap each route component (at minimum: `/dashboard`, `/learn`, `/learn/reading`) with an Error Boundary
- Error boundary renders a friendly fallback UI with a "Try Again" button that resets the error state
- Log errors to `console.error` for debugging

### FR-3: Toast Notifications for Server Function Errors

- Create a `<ToastContainer>` UI component using Zustand `ui-store` (already has `toasts` array, `pushToast`, `dismissToast` actions)
- Wire toast notifications for the following server function error scenarios from TDD §13:
  - Server function network error → Toast: "Connection error" with retry
  - Letter toggle save fails → Toast: "Could not save" + revert toggle visually
  - Profile creation exceeds 4 → Toast: "Maximum 4 children"
  - Vowel mode save fails → Toast: "Could not update vowel mode"
  - SQLite write failure → Toast: "Could not save changes"

### FR-4: Docker & Deployment

- **`docker/Dockerfile`**: Multi-stage Node.js build:
  - Stage 1 (deps): `node:20-alpine`, copy `package.json` + `pnpm-lock.yaml`, `pnpm install --frozen-lockfile`
  - Stage 2 (build): Copy source, `pnpm build`
  - Stage 3 (runner): Copy `.output/`, `public/`, `node_modules`, `package.json`; `EXPOSE 3000`; `CMD ["node", ".output/server/index.mjs"]`
- **`docker-compose.yml`**: App service on port 3000 with:
  - Environment: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL` (default: `file:./data/little-alif.db`)
  - Volume mount: `little-alif-data:/app/data` for SQLite persistence
  - `restart: unless-stopped`
- **`.env.example`**: Update with ALL required env vars documented in TDD §12
- Verify `pnpm build` succeeds in production mode

### FR-5: Verification (Manual)

- **Responsive Design**: Test mobile 360px → tablet 1024px. All routes: `/dashboard`, `/learn`, `/learn/reading`
- **Touch Target Audit**: All interactive elements ≥ 44x44dp minimum, ≥ 64x64dp preferred
- **Performance Check**: First paint < 2s (simulated 3G), audio latency < 150ms
- **Accessibility Check**: Keyboard navigation works, screen reader support (Radix UI handles most)

## Non-Functional Requirements

| Category         | Requirement                                    | Target              |
| ---------------- | ---------------------------------------------- | ------------------- |
| Audio Latency    | Tap to audible playback                        | < 150ms             |
| Touch Target     | Minimum tappable area                          | 64x64dp             |
| Layout           | Responsive, portrait-first                     | Mobile + Tablet     |
| First Paint      | Empty cache                                    | < 2s                |
| Data Persistence | SQLite survives container rebuilds             | Docker volume mount |
| Accessibility    | High contrast, respects prefers-reduced-motion | WCAG AA             |
| Security         | Session cookies HttpOnly + Secure              | OWASP Top 10        |

## Acceptance Criteria

1. [ ] `pnpm generate:audio` produces 112 MP3 files; AudioEngine plays MP3 with Web Speech fallback
2. [ ] Error Boundaries catch rendering crashes on all major routes with "Try Again" fallback
3. [ ] Toast notifications appear for all documented error scenarios
4. [ ] `docker compose up` starts the app; SQLite data persists after container restart
5. [ ] `pnpm build` succeeds with no errors
6. [ ] All routes work on mobile viewports (360px+)
7. [ ] Touch targets meet minimum size
8. [ ] All existing tests pass after changes

## Out of Scope

- PWA / offline support
- Google Cloud TTS audio generation is a one-time build step (not part of the runtime)
- Automated visual regression testing
- CI/CD pipeline configuration
