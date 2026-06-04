// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '~/stores/auth-store';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockDisableChildMode = vi.fn();
const mockValidateSession = vi.fn();
const mockNavigate = vi.fn();

vi.mock('~/server/auth-fns', () => ({
  disableChildModeFn: () => mockDisableChildMode() as Promise<unknown>,
  validateSessionFn: () => mockValidateSession() as Promise<unknown>,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

// ── Helpers ────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.getState().clear();
  mockDisableChildMode.mockResolvedValue({ success: true });
});

// ── Tests ──────────────────────────────────────────────────────────────

describe('useParentGateHandlers', () => {
  it('returns an object containing handleExit and handleSwitchChild', async () => {
    const { useParentGateHandlers } = await import('./useParentGateHandlers');
    const { result } = renderHook(() => useParentGateHandlers());

    expect(result.current.handleExit).toBeTypeOf('function');
    expect(result.current.handleSwitchChild).toBeTypeOf('function');
  });

  it('handleExit calls disableChildModeFn', async () => {
    mockValidateSession.mockResolvedValue({ user: { id: 'p' } });
    const { useParentGateHandlers } = await import('./useParentGateHandlers');
    const { result } = renderHook(() => useParentGateHandlers());

    await act(async () => {
      await result.current.handleExit();
    });

    expect(mockDisableChildMode).toHaveBeenCalledTimes(1);
  });

  it('handleExit clears the auth-store child state via setChildMode(null)', async () => {
    mockValidateSession.mockResolvedValue({ user: { id: 'p' } });
    useAuthStore.getState().setChildMode('child-1');

    const { useParentGateHandlers } = await import('./useParentGateHandlers');
    const { result } = renderHook(() => useParentGateHandlers());

    await act(async () => {
      await result.current.handleExit();
    });

    expect(useAuthStore.getState().childProfileId).toBeNull();
  });

  it('handleExit navigates to /dashboard when a parent session is valid', async () => {
    // Simulates the common case: user logged in (parent JWT cookie is still
    // present), then entered child mode. After disableChildModeFn clears the
    // child_mode cookie, the parent JWT is still valid.
    mockValidateSession.mockResolvedValue({ user: { id: 'parent-1', email: 'p@example.com' } });

    const { useParentGateHandlers } = await import('./useParentGateHandlers');
    const { result } = renderHook(() => useParentGateHandlers());

    await act(async () => {
      await result.current.handleExit();
    });

    expect(mockValidateSession).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' });
  });

  it('handleExit navigates to /login (not /dashboard) when no parent session is valid', async () => {
    // Simulates the edge case: the user only ever used child mode (e.g. a
    // shared family device) and there is no parent JWT cookie to fall back to.
    mockValidateSession.mockResolvedValue(null);

    const { useParentGateHandlers } = await import('./useParentGateHandlers');
    const { result } = renderHook(() => useParentGateHandlers());

    await act(async () => {
      await result.current.handleExit();
    });

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
    expect(mockNavigate).not.toHaveBeenCalledWith({ to: '/dashboard' });
  });

  it('handleSwitchChild toggles the switcher-open local state from false to true', async () => {
    const { useParentGateHandlers } = await import('./useParentGateHandlers');
    const { result } = renderHook(() => useParentGateHandlers());

    // State may not be public on the returned object — but it must change somewhere.
    // The hook exposes the open state via the returned object so the route can render
    // <ChildSwitcher open={switcherOpen} onOpenChange={setSwitcherOpen} />.
    const initial = (result.current as { switcherOpen: boolean }).switcherOpen;
    expect(initial).toBe(false);

    act(() => {
      result.current.handleSwitchChild();
    });

    expect((result.current as { switcherOpen: boolean }).switcherOpen).toBe(true);
  });
});
