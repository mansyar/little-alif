// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const mockCreateProfile = vi.fn();
const mockUpdateProfile = vi.fn();

vi.mock('~/server/profiles', () => ({
  createProfileFn: (args: unknown) => mockCreateProfile(args) as Promise<unknown>,
  updateProfileFn: (args: unknown) => mockUpdateProfile(args) as Promise<unknown>,
}));

vi.mock('~/lib/i18n', () => ({
  useI18nContext: () => ({
    LL: {
      PROFILE_ADD_TITLE: () => 'Add Child Profile' as const,
      PROFILE_EDIT_TITLE: () => 'Edit Child Profile' as const,
      PROFILE_SAVE: () => 'Save' as const,
      PROFILE_CANCEL: () => 'Cancel' as const,
      PROFILE_NAME: () => 'Name' as const,
      PROFILE_AVATAR: () => 'Avatar' as const,
    },
  }),
}));

const mockProfile = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Aisyah',
  avatar: 'ba-boat' as const,
};

let queryClient: QueryClient;

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('ProfileEditor', () => {
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders add mode with empty form when no profile provided', async () => {
    const { ProfileEditor } = await import('./ProfileEditor');
    render(<ProfileEditor open={true} onOpenChange={vi.fn()} />, { wrapper: createWrapper() });

    expect(screen.getByText('Add Child Profile')).toBeTruthy();
    const nameInput = screen.getByLabelText<HTMLInputElement>(/name/i);
    expect(nameInput).toBeTruthy();
    expect(nameInput.value).toBe('');
  });

  it('renders edit mode with pre-filled form when profile provided', async () => {
    const { ProfileEditor } = await import('./ProfileEditor');
    render(<ProfileEditor open={true} onOpenChange={vi.fn()} profile={mockProfile} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText('Edit Child Profile')).toBeTruthy();
    const nameInput = screen.getByLabelText<HTMLInputElement>(/name/i);
    expect(nameInput.value).toBe('Aisyah');
  });

  it('calls createProfileFn on form submit in add mode', async () => {
    mockCreateProfile.mockResolvedValue({ id: 'new-id', name: 'Bilal', avatar: 'alif-lamp' });
    const onOpenChange = vi.fn();
    const { ProfileEditor } = await import('./ProfileEditor');
    render(<ProfileEditor open={true} onOpenChange={onOpenChange} />, { wrapper: createWrapper() });

    const user = userEvent.setup();
    const nameInput = await screen.findByLabelText(/name/i);
    await user.type(nameInput, 'Bilal');

    const saveBtn = screen.getByText('Save');
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockCreateProfile).toHaveBeenCalled();
    });
  });

  it('calls updateProfileFn on form submit in edit mode', async () => {
    mockUpdateProfile.mockResolvedValue({
      id: mockProfile.id,
      name: 'Aisyah Updated',
      avatar: 'ba-boat',
    });
    const onOpenChange = vi.fn();
    const { ProfileEditor } = await import('./ProfileEditor');
    render(<ProfileEditor open={true} onOpenChange={onOpenChange} profile={mockProfile} />, {
      wrapper: createWrapper(),
    });

    const user = userEvent.setup();
    const nameInput = await screen.findByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Aisyah Updated');

    const saveBtn = screen.getByText('Save');
    await user.click(saveBtn);

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalled();
    });
  });

  it('closes the dialog when cancel is clicked', async () => {
    const onOpenChange = vi.fn();
    const { ProfileEditor } = await import('./ProfileEditor');
    render(<ProfileEditor open={true} onOpenChange={onOpenChange} />, { wrapper: createWrapper() });

    const user = userEvent.setup();
    const cancelBtn = screen.getByText('Cancel');
    await user.click(cancelBtn);

    // Radix Dialog Close triggers onOpenChange(false)
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
