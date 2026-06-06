# Specification: Upgrade to Vite 8

## Overview

Upgrade the Little Alif build toolchain from Vite 7 to Vite 8, which replaces esbuild + Rollup with Rolldown (Rust) + Oxc for significantly faster builds and a unified toolchain.

## Motivation

- **Performance:** Rolldown is 10-30x faster than Rollup for production builds
- **Unified toolchain:** Single bundler (Rolldown) replaces esbuild + Rollup
- **Native features:** Built-in tsconfig paths, Lightning CSS minification, Oxc transforms
- **Ecosystem alignment:** TanStack Start, Tailwind CSS, and Vitest all support Vite 8

## Current State

| Package | Current Version | Target Version |
|---|---|---|
| `vite` | 7.3.3 | ^8.0.0 |
| `@vitejs/plugin-react` | 4.7.0 | ^6.0.0 |
| `@tanstack/react-start` | 1.168.18 | (no change) |
| `@tailwindcss/vite` | 4.3.0 | (no change) |
| `vitest` | 4.1.8 | (no change) |
| `vite-tsconfig-paths` | 5.1.4 | REMOVE |
| `vinxi` | 0.5.1 | REMOVE (dead dependency) |

## Scope

### In Scope

1. Update `vite` to ^8.0.0
2. Update `@vitejs/plugin-react` to ^6.0.0
3. Remove `vite-tsconfig-paths` (replaced by native `resolve.tsconfigPaths`)
4. Remove `vinxi` (dead dependency, not imported anywhere)
5. Update `vite.config.ts` — remove tsconfig-paths plugin, add native tsconfig paths
6. Update `vitest.config.ts` — remove tsconfig-paths plugin
7. Verify all tests pass
8. Verify dev server starts and works
9. Verify production build succeeds
10. Update `tech-stack.md` with Vite 8 info

### Out of Scope

- Upgrading other dependencies (TanStack, Tailwind, etc.)
- Migrating deprecated `esbuild` options to `oxc` (no custom esbuild config exists)
- Migrating deprecated `build.rollupOptions` to `build.rolldownOptions` (TanStack plugin handles this internally)

## Known Risks

### SSR Dev-Server Issues (Accepted)

TanStack Start has known issues with Vite 8's SSR module runner:

- **Server functions returning `undefined`** during client-side navigation in dev mode
- **`createMiddleware is not a function`** on cold SSR start
- **HMR re-evaluation** issues with `export *` re-exports

These are **dev-server only** issues. Production builds work correctly. Upstream fixes are in progress (Vite PR #22493). Workaround: page refresh resolves most dev-server issues.

### CJS Interop Changes (Low Risk)

Vite 8 handles CommonJS imports differently. Packages like `better-auth`, `drizzle-kit`, and `@libsql/client` need verification but are unlikely to break since they're server-side dependencies.

## Success Criteria

1. `pnpm dev` starts without errors
2. `pnpm build` produces a working production build
3. `pnpm test` passes all tests
4. `pnpm typecheck` passes
5. No peer dependency warnings for Vite 8
6. `vite-tsconfig-paths` and `vinxi` are removed from dependencies
