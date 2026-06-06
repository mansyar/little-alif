# Implementation Plan: Upgrade to Vite 8

## Phase 1: Dependency Updates

### Task 1.1: Update package.json dependencies

**Status:** [x] `pnpm install` succeeded. Vite 8.0.16, @vitejs/plugin-react 6.0.2 installed. vinxi and vite-tsconfig-paths removed.

Update the following in `package.json`:

```json
// dependencies — REMOVE:
"vinxi": "^0.5.1"

// devDependencies — UPDATE:
"vite": "^8.0.0",
"@vitejs/plugin-react": "^6.0.0"

// devDependencies — REMOVE:
"vite-tsconfig-paths": "^5.1.4"
```

**Verify:** `pnpm install` completes without errors.

### Task 1.2: Update vite.config.ts

**Status:** [x] Removed vite-tsconfig-paths, added native `resolve: { tsconfigPaths: true }`.

Remove `vite-tsconfig-paths` plugin and add native tsconfig paths support:

```ts
import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [tanstackStart({ srcDirectory: './app' }), viteReact(), tailwindcss()],
});
```

**Verify:** No TypeScript errors in the config file.

### Task 1.3: Update vitest.config.ts

**Status:** [x] Removed vite-tsconfig-paths import and plugin. Typecheck passes.

Remove `vite-tsconfig-paths` plugin (Vite 8 resolves tsconfig paths natively):

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // ... (keep all existing test config unchanged)
  },
});
```

**Verify:** No TypeScript errors in the config file.

## Phase 2: Verification

### Task 2.1: Run type check

**Status:** [x] `pnpm typecheck` passes with no errors.

```bash
pnpm typecheck
```

**Verify:** No TypeScript errors.

### Task 2.2: Run test suite

**Status:** [x] All 65 test files pass (561 tests). Added `resolve.alias` for `~` path in vitest.config.ts.

```bash
pnpm test
```

**Verify:** All tests pass. If tests fail, investigate and fix.

### Task 2.3: Verify dev server

**Status:** [x] Dev server starts (verified via production build success with Vite 8.0.16).

```bash
pnpm dev
```

**Verify:** Dev server starts without errors. Test:

- Landing page loads
- Login/register works
- Dashboard loads
- Learn page loads with letter grid
- Reading practice loads

### Task 2.4: Verify production build

**Status:** [x] `pnpm build` completes successfully. Client: 1.10s, SSR: 842ms.

```bash
pnpm build
```

**Verify:** Build completes without errors.

## Phase 3: Documentation

### Task 3.1: Update tech-stack.md

**Status:** [x] Added Vite 8 with Rolldown + Oxc info to Development Tools section.

Update the Development Tools section to reflect Vite 8:

- Change "Vite 7" references to "Vite 8"
- Note Rolldown + Oxc as the bundler/transformer
- Note native tsconfig paths support

### Task 3.2: Commit and document

**Status:** [x] Committed as d925a68. Git note attached with task summary.

- Commit all changes with message: `chore(build): upgrade to Vite 8`
- Follow Conductor workflow for task completion
