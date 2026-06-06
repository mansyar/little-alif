// @vitest-environment jsdom
import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ServerFunctionError, ErrorCode } from '~/lib/errors';
import type { ReactNode } from 'react';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockPushToast = vi.fn();

vi.mock('~/stores/ui-store', () => ({
  useUiStore: (selector: (state: unknown) => unknown) =>
    selector({ pushToast: mockPushToast }),
}));

// ── Helpers ────────────────────────────────────────────────────────────

let queryClient: QueryClient;

function createWrapper() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const MOCK_LL = {
  ERROR_AUTH: () => 'Please sign in again.',
  ERROR_VALIDATION: () => 'Check your input and try again.',
  ERROR_NOT_FOUND: () => 'Item not found.',
  ERROR_LIMIT_EXCEEDED: () => 'Maximum reached.',
  ERROR_NETWORK: () => 'Connection lost.',
  ERROR_UNKNOWN: () => 'Something went wrong.',
} as const;

const mockMutationFn = vi.fn<() => Promise<unknown>>();

// ── Tests ──────────────────────────────────────────────────────────────

describe('useTypedMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutationFn.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    queryClient?.clear();
  });

  it('calls pushToast with error variant and message for ServerFunctionError(AUTH)', async () => {
    mockMutationFn.mockRejectedValueOnce(
      new ServerFunctionError(ErrorCode.AUTH, 'ERROR_AUTH'),
    );

    const { useTypedMutation } = await import('./useTypedMutation');
    const { result } = renderHook(
      () =>
        useTypedMutation(
          {
            mutationFn: () => mockMutationFn(),
          },
          MOCK_LL,
        ),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.mutateAsync(undefined).catch(() => { /* expected rejection */ });
    });

    expect(mockPushToast).toHaveBeenCalledTimes(1);
    expect(mockPushToast).toHaveBeenCalledWith({
      variant: 'error',
      message: 'Please sign in again.',
    });
  });

  it('calls pushToast with info variant for ServerFunctionError(VALIDATION)', async () => {
    mockMutationFn.mockRejectedValueOnce(
      new ServerFunctionError(ErrorCode.VALIDATION, 'ERROR_VALIDATION'),
    );

    const { useTypedMutation } = await import('./useTypedMutation');
    const { result } = renderHook(
      () =>
        useTypedMutation(
          {
            mutationFn: () => mockMutationFn(),
          },
          MOCK_LL,
        ),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.mutateAsync(undefined).catch(() => { /* expected rejection */ });
    });

    expect(mockPushToast).toHaveBeenCalledWith({
      variant: 'info',
      message: 'Check your input and try again.',
    });
  });

  it('calls pushToast with info variant for ServerFunctionError(NOT_FOUND)', async () => {
    mockMutationFn.mockRejectedValueOnce(
      new ServerFunctionError(ErrorCode.NOT_FOUND, 'ERROR_NOT_FOUND'),
    );

    const { useTypedMutation } = await import('./useTypedMutation');
    const { result } = renderHook(
      () =>
        useTypedMutation(
          {
            mutationFn: () => mockMutationFn(),
          },
          MOCK_LL,
        ),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.mutateAsync(undefined).catch(() => { /* expected rejection */ });
    });

    expect(mockPushToast).toHaveBeenCalledWith({
      variant: 'info',
      message: 'Item not found.',
    });
  });

  it('falls back to ERROR_UNKNOWN for non-ServerFunctionError errors', async () => {
    mockMutationFn.mockRejectedValueOnce(new Error('Network failure'));

    const { useTypedMutation } = await import('./useTypedMutation');
    const { result } = renderHook(
      () =>
        useTypedMutation(
          {
            mutationFn: () => mockMutationFn(),
          },
          MOCK_LL,
        ),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.mutateAsync(undefined).catch(() => { /* expected rejection */ });
    });

    expect(mockPushToast).toHaveBeenCalledWith({
      variant: 'error',
      message: 'Something went wrong.',
    });
  });

  it('maps TypeError: Failed to fetch to ERROR_NETWORK toast', async () => {
    mockMutationFn.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const { useTypedMutation } = await import('./useTypedMutation');
    const { result } = renderHook(
      () =>
        useTypedMutation(
          {
            mutationFn: () => mockMutationFn(),
          },
          MOCK_LL,
        ),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.mutateAsync(undefined).catch(() => { /* expected rejection */ });
    });

    expect(mockPushToast).toHaveBeenCalledWith({
      variant: 'error',
      message: 'Connection lost.',
    });
  });

  it('does NOT call pushToast on successful mutation', async () => {
    const { useTypedMutation } = await import('./useTypedMutation');
    const { result } = renderHook(
      () =>
        useTypedMutation(
          {
            mutationFn: () => mockMutationFn(),
          },
          MOCK_LL,
        ),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.mutateAsync(undefined);
    });

    expect(mockPushToast).not.toHaveBeenCalled();
  });
});
