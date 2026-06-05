import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

function readJson<T>(relativePath: string): T {
  const fullPath = path.join(PROJECT_ROOT, relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf-8')) as T;
}

interface PackageJson {
  scripts?: Record<string, string>;
  'lint-staged'?: Record<string, string[]>;
}

describe('Tooling: Oxfmt', () => {
  it('has an .oxfmtrc.json file at the project root', () => {
    expect(existsSync(path.join(PROJECT_ROOT, '.oxfmtrc.json'))).toBe(true);
  });

  it('.oxfmtrc.json is valid JSON', () => {
    const raw = readFileSync(path.join(PROJECT_ROOT, '.oxfmtrc.json'), 'utf-8');
    expect(() => {
      JSON.parse(raw);
    }).not.toThrow();
  });

  it('.oxfmtrc.json preserves project formatting defaults', () => {
    const config = readJson<Record<string, unknown>>('.oxfmtrc.json');
    expect(config).toMatchObject({
      printWidth: 100,
      semi: true,
      singleQuote: true,
      tabWidth: 2,
    });
  });

  it('has a .oxlintignore file at the project root', () => {
    expect(existsSync(path.join(PROJECT_ROOT, '.oxlintignore'))).toBe(true);
  });

  it('.oxlintignore excludes build artifacts and lockfiles', () => {
    const raw = readFileSync(path.join(PROJECT_ROOT, '.oxlintignore'), 'utf-8');
    const entries = raw
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('#'));
    for (const required of [
      'node_modules/**',
      'dist/**',
      '.output/**',
      'coverage/**',
      'pnpm-lock.yaml',
      'app/routeTree.gen.ts',
      'app/db/migrations/**',
    ]) {
      expect(entries).toContain(required);
    }
  });
});

describe('Tooling: Oxlint', () => {
  it('has an .oxlintrc.json file at the project root', () => {
    expect(existsSync(path.join(PROJECT_ROOT, '.oxlintrc.json'))).toBe(true);
  });

  it('.oxlintrc.json is valid JSON', () => {
    const raw = readFileSync(path.join(PROJECT_ROOT, '.oxlintrc.json'), 'utf-8');
    expect(() => {
      JSON.parse(raw);
    }).not.toThrow();
  });

  it('.oxlintrc.json ignores generated files and build artifacts', () => {
    const config = readJson<{ ignorePatterns?: string[] }>('.oxlintrc.json');
    const ignores = config.ignorePatterns ?? [];
    for (const required of [
      'node_modules/**',
      'dist/**',
      '.output/**',
      'coverage/**',
      'app/db/migrations/**',
      'app/routeTree.gen.ts',
    ]) {
      expect(ignores).toContain(required);
    }
  });
});

describe('Tooling: Husky pre-commit', () => {
  it('has a .husky/pre-commit hook', () => {
    expect(existsSync(path.join(PROJECT_ROOT, '.husky', 'pre-commit'))).toBe(true);
  });

  it('.husky/pre-commit runs oxlint', () => {
    const raw = readFileSync(path.join(PROJECT_ROOT, '.husky', 'pre-commit'), 'utf-8');
    expect(raw).toContain('oxlint');
  });

  it('.husky/pre-commit runs oxfmt', () => {
    const raw = readFileSync(path.join(PROJECT_ROOT, '.husky', 'pre-commit'), 'utf-8');
    expect(raw).toContain('oxfmt');
  });

  it('.husky/pre-commit runs typecheck after linting', () => {
    const raw = readFileSync(path.join(PROJECT_ROOT, '.husky', 'pre-commit'), 'utf-8');
    expect(raw).toMatch(/oxlint[\s\S]*oxfmt[\s\S]*pnpm\s+typecheck/);
  });

  it('package.json typecheck script uses --incremental for fast pre-commit runs', () => {
    const pkg = readJson<PackageJson>('package.json');
    expect(pkg.scripts?.typecheck).toContain('--incremental');
  });

  it('package.json prepare script runs husky', () => {
    const pkg = readJson<PackageJson>('package.json');
    expect(pkg.scripts?.prepare).toBe('husky');
  });
});

describe('Tooling: package.json scripts', () => {
  it.each([
    ['format', 'oxfmt --write'],
    ['format:check', 'oxfmt --check'],
    ['lint', 'oxlint'],
    ['lint:fix', 'oxlint --fix'],
  ])('script "%s" invokes "%s"', (scriptName, expectedSubstring) => {
    const pkg = readJson<PackageJson>('package.json');
    const script = pkg.scripts?.[scriptName] ?? '';
    expect(script).toContain(expectedSubstring);
  });
});
