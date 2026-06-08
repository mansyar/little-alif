# Little Alif

**Introducing the Arabic alphabet, one letter at a time.**

An interactive, self-hosted web application that helps young children (ages 3–6) get familiar with the Arabic alphabet (Hijaiyah). Designed as a digital companion for parent-led teaching — the parent introduces letters offline, then toggles them on in the app so the child can explore, tap, and hear pronunciations.

No gamification. No auto-progression. The parent controls the pace; the child enjoys the discovery.

---

## Features

### For Children (Ages 3–6)

- **28 Hijaiyah Letters** (ا to ي) displayed as a responsive, tappable grid with pastel-coded cards (≥64×64dp touch targets)
- **4 Vowel Modes (Harakat):** Plain, Fathah (َ), Kasrah (ِ), Dammah (ُ) — child can switch independently
- **Instant Audio Feedback:** Tap a letter to hear its pronunciation (< 150ms latency)
- **Letter Detail Overlay:** Full-screen glyph display with swipe navigation between letters
- **Reading Practice (Iqra' Mode):** 6-row grids with systematic + randomized letter-vowel combinations
- **Zero Text UI:** All interactions are visual, auditory, or tactile — no reading required
- **Child Mode:** Cookie-based persistent session — child enters without a password

### For Parents

- **Up to 4 Child Profiles** with name and avatar selection (8 themed SVG avatars)
- **Letter Toggle Management:** Granular ON/OFF control per letter per child, with bulk actions
- **Vowel Mode Selection:** Set the default harakat per child profile
- **Hidden Parent Gate:** Low-contrast lock icon on child routes, unlocked by long-press (1.5s) or 3 rapid taps
- **Mid-Session Child Switching:** Swap between profiles without leaving the learning screen
- **Bilingual UI:** English + Indonesian (typesafe-i18n), persisted via cookie
- **Self-Hosted & Private:** All data stays on your own server

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | TanStack Start (React 19 + SSR) |
| **Language** | TypeScript (strict mode) |
| **Build** | Vite 8 (Rolldown + Oxc) |
| **Styling** | Tailwind CSS v4 |
| **UI Primitives** | Radix UI |
| **Icons** | Lucide React |
| **State** | Zustand + TanStack React Query |
| **Auth** | Better Auth (email/password + HMAC child-mode cookies) |
| **Database** | SQLite via Drizzle ORM (libSQL client) |
| **Validation** | Zod v4 |
| **i18n** | typesafe-i18n (EN + ID) |
| **Audio** | Google Cloud TTS (MP3) + Web Speech API fallback |
| **Linting** | Oxlint (86 rules, type-aware) |
| **Formatting** | Oxfmt |
| **Testing** | Vitest (jsdom + in-memory SQLite) |
| **Deployment** | Docker, Coolify, Caddy |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** (not npm or yarn)

### Installation

```bash
git clone https://github.com/your-username/little-alif.git
cd little-alif
pnpm install
```

### Environment Variables

Copy the example env file and configure:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Secret for Better Auth sessions (≥ 32 chars) |
| `BETTER_AUTH_URL` | Base URL (e.g. `http://localhost:3000`) |
| `CHILD_MODE_SECRET` | HMAC secret for child-mode cookies (falls back to `BETTER_AUTH_SECRET`) |
| `DATABASE_URL` | SQLite file path (e.g. `file:./data/little-alif.db`) |

### Database Setup

```bash
# Push schema to database
pnpm db:push

# Seed 28 Hijaiyah letters
pnpm db:seed
```

### Development

```bash
pnpm dev
```

This starts the dev server and generates i18n types automatically.

### Audio Generation (Optional)

To generate the 112 pre-recorded MP3 files (28 letters × 4 harakat):

```bash
# Requires Google Cloud TTS credentials
pnpm generate:audio
```

Without this, the app falls back to the Web Speech API.

---

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start dev server (generates i18n types first) |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm test` | Run all tests (single run) |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm lint` | Oxlint (zero warnings enforced) |
| `pnpm lint:fix` | Oxlint with auto-fix |
| `pnpm format` | Format code with Oxfmt |
| `pnpm format:check` | Check formatting |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:studio` | Open Drizzle Studio (GUI) |
| `pnpm db:seed` | Seed letter data (idempotent) |
| `pnpm i18n` | Generate typesafe-i18n types |
| `pnpm generate:audio` | Generate MP3 files via Google Cloud TTS |

---

## Project Structure

```
app/
├── routes/                # File-based router (TanStack Router)
│   ├── index.tsx          # Landing → login or child-mode redirect
│   ├── login.tsx          # Parent login
│   ├── register.tsx       # Parent registration
│   ├── dashboard.tsx      # Profile management
│   ├── learn.tsx          # Child letter grid
│   └── learn/reading.tsx  # Reading practice (Iqra' mode)
├── components/
│   ├── child/             # Child-facing UI (grid, cards, audio, reading)
│   ├── parent/            # Parent-facing UI (dashboard, profiles, toggles)
│   └── ui/                # Shared UI primitives
├── server/                # Server functions (auth, profiles, letters, reading)
├── lib/
│   ├── audio/             # AudioEngine + preloader
│   ├── i18n/              # typesafe-i18n (generated)
│   ├── utils/             # cn, harakat, reading, child-mode
│   ├── validations/       # Zod schemas
│   └── constants/         # Letter IDs, colors
├── stores/                # Zustand stores (auth, child, UI)
├── db/
│   ├── schema.ts          # Drizzle schema (profiles, letters, letter_toggles)
│   ├── auth-schema.ts     # Better Auth tables
│   ├── seed.ts            # 28-letter seed script
│   └── migrations/        # Auto-generated SQL migrations
└── lib/i18n/              # Generated i18n files (don't edit)
```

---

## Routes

| Path | Auth | Purpose |
|---|---|---|
| `/` | None | Landing → login or child-mode redirect |
| `/login` | None | Parent login |
| `/register` | None | Parent registration |
| `/dashboard` | Parent JWT | Profile CRUD + letter toggle management |
| `/learn` | Parent JWT or child-mode cookie | Child letter grid with tappable cards |
| `/learn/reading` | Parent JWT or child-mode cookie | Reading practice (Iqra' mode) |
| `/api/auth/$` | N/A | Better Auth catch-all HTTP handler |

---

## Deployment

### Docker

```bash
docker compose up -d
```

The `docker-compose.yml` sets up:
- Multi-stage build (node:24-alpine)
- SQLite volume mount for persistent data
- Port 3000 exposed

### Coolify (Recommended)

1. Push to your Git repository
2. Connect Coolify to your repo
3. Set environment variables in Coolify dashboard
4. Deploy — Coolify handles Caddy reverse proxy and HTTPS automatically

---

## Testing

Tests are co-located with source files (`*.test.ts` / `*.test.tsx`).

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

**Coverage target:** ≥80% lines, statements, branches, functions.

- **Server/DB tests** use in-memory SQLite (`@libsql/client` sync driver)
- **Component tests** use jsdom with `@testing-library/react`
- **Audio tests** use a mock adapter (no browser needed)

---

## Architecture Highlights

- **Pure-helper + thin-wrapper pattern:** All server logic lives in pure functions that accept `(db, userId, ...)` for testability. Thin `createServerFn` wrappers handle session validation and HTTP concerns.
- **Dual-mode auth:** Parents authenticate via Better Auth (email/password, 30-day JWT). Children bypass auth via HMAC-SHA256 signed cookies with constant-time verification.
- **Unicode harakat composition:** `composeLetter(baseChar, vowelMode)` returns the correct glyph with combining diacritics, using precomposed fallbacks for 7 non-connecting Arabic letters.
- **Conductor methodology:** Structured development via tracks with specs, plans, and archived completions.

---

## License

Private project. Not licensed for public distribution.

---

## Acknowledgements

- [TanStack Start](https://tanstack.com/start) — Full-stack React framework
- [Better Auth](https://www.better-auth.com/) — Authentication library
- [Drizzle ORM](https://orm.drizzle.team/) — TypeScript ORM
- [Radix UI](https://www.radix-ui.com/) — Accessible UI primitives
- [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n) — Type-safe internationalization
- [Cairo](https://fonts.google.com/specimen/Cairo) — Arabic font by Google Fonts
- [Nunito](https://fonts.google.com/specimen/Nunito) — Latin font by Google Fonts
