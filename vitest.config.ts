/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest-setup.ts'],
    include: ['app/**/*.{test,spec}.{ts,tsx}'],
    // Default Vitest test timeout is 5s. Under the default worker pool, tests
    // that do a full DOM render with multiple async queries (e.g. route tests
    // waiting for `findByText` after a TanStack Query resolution) can exceed
    // 5s when the worker is contended. 30s is a pragmatic ceiling that still
    // catches genuine hangs while absorbing worker-pool scheduling jitter.
    // Coverage instrumentation roughly doubles per-test wall time, so 60s
    // covers both `pnpm test` and `pnpm test --coverage` runs.
    testTimeout: 60000,
    // Cap concurrent workers. The default uses all available CPUs which causes
    // tests that do full DOM renders (jsdom + React Query) to starve each
    // other when many test files run in the same pool. Limiting to 3 keeps
    // wall-clock time reasonable while reducing per-test contention.
    maxConcurrency: 10,
    maxWorkers: 3,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        'app/**/*.{test,spec}.{ts,tsx}',
        'app/db/migrations/**',
        'app/routes/**',
        // Generated files (not hand-authored; don't count toward coverage)
        'app/**/*.gen.ts',
        'app/**/i18n-util.ts',
        'app/**/i18n-util.async.ts',
        'app/**/i18n-util.sync.ts',
        'app/**/i18n-react.tsx',
        'app/**/i18n-types.ts',
        // Drizzle table definitions are declarative data, not executable code.
        // v8 reports 0% functions because sqliteTable(...) returns table
        // descriptors used as data — not a real coverage gap.
        'app/db/schema.ts',
        'app/db/auth-schema.ts',
      ],
      thresholds: {
        // Target: ≥80% code coverage for all modules.
        // Drizzle schema files are excluded above (declarative data).
        lines: 80,
        statements: 80,
        branches: 80,
        functions: 80,
      },
    },
  },
});
