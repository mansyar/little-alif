// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

describe('/login route', () => {
  describe('validateSearch — open redirect prevention', () => {
    it('accepts a valid internal redirect path', async () => {
      const { Route } = await import('./login');
      const validateSearch = Route.options.validateSearch as (search: Record<string, unknown>) => {
        redirect: string;
      };

      const result = validateSearch({ redirect: '/dashboard' });
      expect(result.redirect).toBe('/dashboard');
    });

    it('falls back to /dashboard when redirect is missing', async () => {
      const { Route } = await import('./login');
      const validateSearch = Route.options.validateSearch as (search: Record<string, unknown>) => {
        redirect: string;
      };

      const result = validateSearch({});
      expect(result.redirect).toBe('/dashboard');
    });

    it('rejects protocol-relative redirect (//evil.com)', async () => {
      const { Route } = await import('./login');
      const validateSearch = Route.options.validateSearch as (search: Record<string, unknown>) => {
        redirect: string;
      };

      const result = validateSearch({ redirect: '//evil.com/phish' });
      expect(result.redirect).toBe('/dashboard');
    });

    it('rejects absolute URL redirect (https://evil.com)', async () => {
      const { Route } = await import('./login');
      const validateSearch = Route.options.validateSearch as (search: Record<string, unknown>) => {
        redirect: string;
      };

      const result = validateSearch({ redirect: 'https://evil.com' });
      expect(result.redirect).toBe('/dashboard');
    });

    it('rejects non-string redirect', async () => {
      const { Route } = await import('./login');
      const validateSearch = Route.options.validateSearch as (search: Record<string, unknown>) => {
        redirect: string;
      };

      const result = validateSearch({ redirect: 123 });
      expect(result.redirect).toBe('/dashboard');
    });

    it('accepts nested internal paths', async () => {
      const { Route } = await import('./login');
      const validateSearch = Route.options.validateSearch as (search: Record<string, unknown>) => {
        redirect: string;
      };

      const result = validateSearch({ redirect: '/learn/reading' });
      expect(result.redirect).toBe('/learn/reading');
    });
  });
});
