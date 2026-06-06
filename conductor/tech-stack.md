# Technology Stack

## Runtime & Language

- **Runtime:** Node.js (v20 LTS)
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm

## Framework & Rendering

- **Framework:** TanStack Start (React 19 + TypeScript + Vite)
- **Routing:** TanStack Router (file-based routing)
- **Rendering:** Server-Side Rendering (SSR) with TanStack Start
- **Server Functions:** `createServerFn` for all data mutations

## UI & Styling

- **CSS Framework:** Tailwind CSS v4
- **Class Merge Utility:** clsx + tailwind-merge (via `cn.ts`)
- **UI Primitives:** Radix UI (@radix-ui/react-switch, react-dialog, react-alert-dialog, react-radio-group, @radix-ui/react-dropdown-menu)
- **Icons:** Lucide React
- **Fonts:** Cairo (Arabic) + Nunito (Latin) via Google Fonts
- **Arabic Rendering:** Unicode combining diacritics with precomposed fallbacks for non-connecting letters

## State Management

- **Client Data Fetching:** TanStack React Query (useMutation, useQuery for server functions)
- **Global State:** Zustand (auth-store, child-store, ui-store)

## Authentication

- **Library:** Better Auth (better-auth)
- **Database Adapter:** Drizzle ORM adapter (auto-managed tables: user, session, account, verification)
- **Sessions:** HttpOnly secure cookies with automatic refresh, 30-day expiry
- **CSRF:** Built-in Better Auth CSRF middleware

## Data Layer

- **Database:** SQLite (via libSQL client)
- **ORM:** Drizzle ORM with SQLite dialect
- **Migrations:** drizzle-kit (auto-generated)
- **Seed:** Manual seed script (app/db/seed.ts) for 28-letter master data

## Validation

- **Schema Validation:** Zod v4 (upgraded from v3 on 2026-06-04 during T-12 — safeParse/infer patterns unchanged)
- **Schemas:** Auth (email/password), Profiles (name/avatar/vowelMode), Letters (toggle operations)

## Internationalization

- **Library:** typesafe-i18n (compile-time type safety)
- **Locales:** English (en) + Indonesian (id)
- **Storage:** Cookie-based locale persistence
- **Scope:** Parent UI only (child UI is icon/glyph-based)

## Audio

- **Primary API:** Web Speech API (SpeechSynthesis) for pronunciation
- **Alternative:** Pre-recorded MP3 files via Web Audio API
- **Preloading:** Idle-time preloading via requestIdleCallback
- **Voice:** Arabic voice (ar-SA, ar-XA preferred)

## Deployment

- **Containerization:** Docker multi-stage build (node:20-alpine)
- **Orchestration:** docker-compose with SQLite volume mount
- **Hosting:** Coolify on VPS
- **Proxy:** Caddy (automatic HTTPS)

## Development Tools

- **Build Tool:** Vite 8 (Rolldown + Oxc for bundling and transforms, native tsconfig paths support)
- **Type Checking:** TypeScript 5.7 (strict, `tsc --noEmit --incremental`)
- **Linting:** Oxlint 1.68 (type-aware linting via `--type-aware` or config `typeAware: true`) with plugins: typescript, react, unicorn, oxc. 86 rules enabled. Zero warnings enforced via `--deny-warnings`.
- **Formatting:** Oxfmt 0.53 with `printWidth: 100`, `semi: true`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: 'all'`. Ignored: `node_modules`, `dist`, `.output`, `coverage`, `pnpm-lock.yaml`, `app/routeTree.gen.ts`, `app/db/migrations`.
- **Git Hooks:** Husky 9 (`.husky/pre-commit` invokes `oxlint --fix . && oxfmt --write . && pnpm typecheck`)
- **Testing:** Vitest 4 (unit + integration tests, jsdom environment for Radix UI)
