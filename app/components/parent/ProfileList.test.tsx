// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const mockListProfiles = vi.fn();
const mockNavigate = vi.fn();

vi.mock('~/server/profiles', () => ({
  listProfilesFn: () => mockListProfiles() as Promise<unknown>,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({
    to,
    children,
    params,
  }: {
    to: string;
    children: ReactNode;
    params?: Record<string, string>;
  }) => {
    const href = `${to}${params ? `/${params.id}` : ''}`;
    return <a href={href} onClick={() => { mockNavigate(to, params); }}>{children}</a>;
  },
  useNavigate: () => mockNavigate,
  useRouter: () => ({}),
}));

vi.mock('~/components/parent/ChildModeToggle', () => ({
  ChildModeToggle: () => <div data-testid="child-mode-toggle">Child Mode</div>,
}));

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      PROFILE_LETTERS_LABEL: () => 'letters' as const,
      PROFILE_MANAGE_LETTERS: () => 'Manage letters' as const,
      PROFILE_EDIT: () => 'Edit' as const,
      PROFILE_DELETE: () => 'Delete' as const,
      DASHBOARD_NO_CHILDREN: () => 'No children yet' as const,
      ERROR_GENERIC: () => 'Something went wrong.' as const,
      PROFILE_CANCEL: () => 'Retry' as const,
    },
  }),
  locales: ['en', 'id'],
  defaultLocale: 'en',
}));

const mockProfiles = [
  {
    id: 'profile-1',
    name: 'Aisyah',
    avatar: 'alif-lamp' as const,
    vowelMode: 'fathah' as const,
    introducedCount: 5,
  },
  {
    id: 'profile-2',
    name: 'Bilal',
    avatar: 'ba-boat' as const,
    vowelMode: 'kasrah' as const,
    introducedCount: 12,
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
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

  it('renders loading skeleton initially', async () => {
    mockListProfiles.mockReturnValue(new Promise(() => undefined)); // never resolves
    const { ProfileList } = await import('./ProfileList');
    render(
      <ProfileList onEdit={vi.fn()} onDelete={vi.fn()} />,
      { wrapper: createWrapper() },
    );

    // Loading skeleton has animate-pulse
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders profiles when data loads successfully', async () => {
    mockListProfiles.mockResolvedValue(mockProfiles);
    const { ProfileList } = await import('./ProfileList');
    render(
      <ProfileList onEdit={vi.fn()} onDelete={vi.fn()} />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByText('Aisyah')).toBeTruthy();
    expect(await screen.findByText('Bilal')).toBeTruthy();
  });

  it('shows introducedCount and letters label', async () => {
    mockListProfiles.mockResolvedValue(mockProfiles);
    const { ProfileList } = await import('./ProfileList');
    render(
      <ProfileList onEdit={vi.fn()} onDelete={vi.fn()} />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByText('5/28 letters')).toBeTruthy();
    expect(await screen.findByText('12/28 letters')).toBeTruthy();
  });

  it('renders empty state when no profiles exist', async () => {
    mockListProfiles.mockResolvedValue([]);
    const { ProfileList } = await import('./ProfileList');
    render(
      <ProfileList onEdit={vi.fn()} onDelete={vi.fn()} />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByText('No children yet')).toBeTruthy();
  });

  it('renders error state with retry button when query fails', async () => {
    mockListProfiles.mockRejectedValue(new Error('Network error'));
    const { ProfileList } = await import('./ProfileList');
    render(
      <ProfileList onEdit={vi.fn()} onDelete={vi.fn()} />,
      { wrapper: createWrapper() },
    );

    expect(await screen.findByText('Network error')).toBeTruthy();
    // Retry button renders
    expect(await screen.findByText('Retry')).toBeTruthy();
  });

  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    mockListProfiles.mockResolvedValue(mockProfiles);
    const { ProfileList } = await import('./ProfileList');
    render(
      <ProfileList onEdit={onEdit} onDelete={vi.fn()} />,
      { wrapper: createWrapper() },
    );

    const user = userEvent.setup();
    const editButtons = await screen.findAllByText('Edit');
    await user.click(editButtons[0]!);

    expect(onEdit).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'profile-1', name: 'Aisyah' }),
    );
  });

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = vi.fn();
    mockListProfiles.mockResolvedValue(mockProfiles);
    const { ProfileList } = await import('./ProfileList');
    render(
      <ProfileList onEdit={vi.fn()} onDelete={onDelete} />,
      { wrapper: createWrapper() },
    );

    const user = userEvent.setup();
    const deleteButtons = await screen.findAllByText('Delete');
    await user.click(deleteButtons[0]!);

    expect(onDelete).toHaveBeenCalledWith('profile-1');
  });

  it('calls onStartLearning when profile name area is clicked', async () => {
    const onStartLearning = vi.fn();
    mockListProfiles.mockResolvedValue(mockProfiles);
    const { ProfileList } = await import('./ProfileList');
    render(
      <ProfileList onEdit={vi.fn()} onDelete={vi.fn()} onStartLearning={onStartLearning} />,
      { wrapper: createWrapper() },
    );

    const user = userEvent.setup();
    const learnBtn = await screen.findByLabelText('Start learning with Aisyah');
    await user.click(learnBtn);

    expect(onStartLearning).toHaveBeenCalledWith('profile-1');
  });

  it('renders "Manage letters" link for each profile', async () => {
    mockListProfiles.mockResolvedValue(mockProfiles);
    const { ProfileList } = await import('./ProfileList');
    render(
      <ProfileList onEdit={vi.fn()} onDelete={vi.fn()} />,
      { wrapper: createWrapper() },
    );

    const links = await screen.findAllByText('Manage letters');
    expect(links).toHaveLength(2);
  });
});
