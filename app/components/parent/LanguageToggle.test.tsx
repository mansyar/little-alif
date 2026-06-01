// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockSetLocale = vi.fn();
const mockSetLocaleCookie = vi.fn().mockResolvedValue({ success: true });

let mockLocale: 'en' | 'id' = 'en';

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    locale: mockLocale,
    setLocale: mockSetLocale,
    LL: {
      LOCALE_SWITCH: () => (mockLocale === 'en' ? 'Bahasa Indonesia' : 'English'),
    },
  }),
  locales: ['en', 'id'],
  defaultLocale: 'en',
  I18nClient: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('~/lib/i18n/set-locale-fn', () => ({
  setLocaleCookie: (...args: unknown[]) =>
    mockSetLocaleCookie(...args) as Promise<{ success: boolean }>,
}));

describe('LanguageToggle', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocale = 'en';
  });

  it('renders the toggle button with "Bahasa Indonesia" when locale is en', async () => {
    const { LanguageToggle } = await import('./LanguageToggle');
    const { container } = render(<LanguageToggle />);
    expect(container.textContent).toBe('Bahasa Indonesia');
  });

  it('displays "English" label when in Indonesian locale', async () => {
    mockLocale = 'id';
    const { LanguageToggle } = await import('./LanguageToggle');
    const { container } = render(<LanguageToggle />);
    expect(container.textContent).toBe('English');
  });

  it('calls setLocaleCookie and setLocale when clicked', async () => {
    mockLocale = 'en';
    const { LanguageToggle } = await import('./LanguageToggle');
    render(<LanguageToggle />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Bahasa Indonesia' }));

    expect(mockSetLocaleCookie).toHaveBeenCalledTimes(1);
    expect(mockSetLocaleCookie).toHaveBeenCalledWith({ data: { locale: 'id' } });
    expect(mockSetLocale).toHaveBeenCalledTimes(1);
    expect(mockSetLocale).toHaveBeenCalledWith('id');
  });

  it('toggles to "en" when current locale is "id"', async () => {
    mockLocale = 'id';
    const { LanguageToggle } = await import('./LanguageToggle');
    render(<LanguageToggle />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'English' }));

    expect(mockSetLocaleCookie).toHaveBeenCalledWith({ data: { locale: 'en' } });
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });
});
