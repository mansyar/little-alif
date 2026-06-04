// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const mockProfiles: {
  id: string;
  name: string;
  avatar: string;
  introducedCount: number;
}[] = [];

const mockListProfiles = vi.fn().mockResolvedValue(mockProfiles);

vi.mock('~/server/profiles', () => ({
  listProfilesFn: () => mockListProfiles() as Promise<typeof mockProfiles>,
}));

vi.mock('~/server/letters', () => ({
  getVisibleLettersFn: () => Promise.resolve([]),
  toggleLetterFn: () => Promise.resolve({ letterId: 'alif', isVisible: true }),
  bulkToggleLettersFn: () => Promise.resolve({ updatedCount: 0 }),
}));

vi.mock('~/server/auth-fns', () => ({
  enableChildModeFn: () =>
    Promise.resolve({ success: true, profile: { name: 'Test', avatar: 'alif-lamp' } }),
  disableChildModeFn: () => Promise.resolve({ success: true }),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      DASHBOARD_NO_CHILDREN: () => 'No child profiles yet. Add one to get started.' as const,
      PROFILE_LETTERS_LABEL: () => 'introduced' as const,
      PROFILE_MANAGE_LETTERS: () => 'Manage Letters' as const,
      PROFILE_EDIT: () => 'Edit' as const,
      PROFILE_DELETE: () => 'Delete' as const,
      ERROR_GENERIC: () => 'Something went wrong.' as const,
      PROFILE_CANCEL: () => 'Try again' as const,
      CHILDMODE_ENABLE: () => 'Enable Child Mode' as const,
      CHILDMODE_ACTIVE: () => 'Child Mode is active' as const,
    },
  }),
}));

const noop = () => {
  /* noop */
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('ProfileList', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows loading spinner while fetching', async () => {
    mockListProfiles.mockReturnValue(
      new Promise<typeof mockProfiles>(() => {
        /* never resolves */
      }),
    );
    const { ProfileList } = await import('./ProfileList');
    const { container } = render(<ProfileList onEdit={noop} onDelete={noop} />, {
      wrapper: createWrapper(),
    });
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  }, 15000);

  it('shows empty state when no profiles exist', async () => {
    mockListProfiles.mockResolvedValue([]);
    const { ProfileList } = await import('./ProfileList');
    render(<ProfileList onEdit={noop} onDelete={noop} />, { wrapper: createWrapper() });

    const message = await screen.findByText('No child profiles yet. Add one to get started.');
    expect(message).toBeTruthy();
  });

  it('renders profile cards with names and letter counts', async () => {
    mockListProfiles.mockResolvedValue([
      {
        id: '1',
        name: 'Aisyah',
        avatar: 'alif-lamp',
        vowelMode: 'fathah',
        introducedCount: 5,
      },
      {
        id: '2',
        name: 'Bilal',
        avatar: 'ba-boat',
        vowelMode: 'fathah',
        introducedCount: 12,
      },
    ]);

    const { ProfileList } = await import('./ProfileList');
    render(<ProfileList onEdit={noop} onDelete={noop} />, { wrapper: createWrapper() });

    expect(await screen.findByText('Aisyah')).toBeTruthy();
    expect(screen.getByText('Bilal')).toBeTruthy();
    expect(screen.getByText(/5\/28/)).toBeTruthy();
    expect(screen.getByText(/12\/28/)).toBeTruthy();
  });

  it('renders action buttons for each profile', async () => {
    mockListProfiles.mockResolvedValue([
      {
        id: '1',
        name: 'Aisyah',
        avatar: 'alif-lamp',
        vowelMode: 'fathah',
        introducedCount: 3,
      },
    ]);

    const { ProfileList } = await import('./ProfileList');
    render(<ProfileList onEdit={noop} onDelete={noop} />, { wrapper: createWrapper() });

    expect(await screen.findByText('Manage Letters')).toBeTruthy();
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
  });

  it('handles server error gracefully', async () => {
    mockListProfiles.mockRejectedValue(new Error('Failed to fetch'));

    const { ProfileList } = await import('./ProfileList');
    render(<ProfileList onEdit={noop} onDelete={noop} />, { wrapper: createWrapper() });

    const errorMsg = await screen.findByText('Failed to fetch');
    expect(errorMsg).toBeTruthy();
  });
});
