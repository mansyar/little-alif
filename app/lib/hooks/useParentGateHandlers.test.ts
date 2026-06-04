// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '~/stores/auth-store';

// ── Mocks ──────────────────────────────────────────────────────────────

const mockDisableChildMode = vi.fn();
const mockNavigate = vi.fn();

vi.mock('~/server/auth-fns', () => ({
  disableChildModeFn: () => mockDisableChildMode() as Promise<unknown>,
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

function setParentUser() {
  useAuthStore.getState().setUser({ id: 'parent-1', email: 'p@example.com' });
}

// ── Tests ──────────────────────────────────────────────────────────────

describe('useParentGateHandlers', () => {
  it('returns an object containing handleExit and handleSwitchChild', async () => {
    const { useParentGateHandlers } = await import('./useParentGateHandlers');
    const { result } = renderHook(() => useParentGateHandlers());

    expect(result.current.handleExit).toBeTypeOf('function');
    expect(result.current.handleSwitchChild).toBeTypeOf('function');
  });

  it('handleExit calls disableChildModeFn', async () => {
    setParentUser();
    const { useParentGateHandlers } = await import('./useParentGateHandlers');
    const { result } = renderHook(() => useParentGateHandlers());

    await act(async () => {
      await result.current.handleExit();
    });

    expect(mockDisableChildMode).toHaveBeenCalledTimes(1);
  });

  it('handleExit clears the auth-store child state via setChildMode(null)', async () => {
    setParentUser();
    useAuthStore.getState().setChildMode('child-1');

    const { useParentGateHandlers } = await import('./useParentGateHandlers');
    const { result } = renderHook(() => useParentGateHandlers());

    await act(async () => {
      await result.current.handleExit();
    });

    expect(useAuthStore.getState().childProfileId).toBeNull();
  });

  it('handleExit navigates to /dashboard when a parent user is set in the auth store', async () => {
    setParentUser();

    const { useParentGateHandlers } = await import('./useParentGateHandlers');
    const { result } = renderHook(() => useParentGateHandlers());

    await act(async () => {
      await result.current.handleExit();
    });

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' });
  });

  it('handleExit navigates to /login (not /dashboard) when no parent user is set', async () => {
    // No parent user set
    useAuthStore.getState().setChildMode('child-1');

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
