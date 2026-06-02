/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    setupFiles: ['./vitest-setup.ts'],
    include: ['app/**/*.{test,spec}.{ts,tsx}'],
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
        'app/**/i18n-types.ts',
        // Drizzle table definitions are declarative data, not executable code.
        // v8 reports 0% functions because sqliteTable(...) returns table
        // descriptors used as data — not a real coverage gap.
        'app/db/schema.ts',
        'app/db/auth-schema.ts',
      ],
      thresholds: {
        // workflow.md target: >70% code coverage for all modules.
        // Drizzle schema files are excluded above (declarative data).
        lines: 70,
        statements: 70,
        branches: 70,
        functions: 70,
      },
    },
  },
});
