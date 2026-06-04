import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { disableChildModeFn, validateSessionFn } from '~/server/auth-fns';
import { useAuthStore } from '~/stores/auth-store';

export interface UseParentGateHandlersResult {
  /** Async — disables child mode, clears local auth state, and navigates. */
  handleExit: () => Promise<void>;
  /** Opens the ChildSwitcher overlay. */
  handleSwitchChild: () => void;
  /** Whether the ChildSwitcher overlay is open. */
  switcherOpen: boolean;
  /** Setter for the ChildSwitcher overlay open state. */
  setSwitcherOpen: (open: boolean) => void;
}

/**
 * Shared handlers for the ParentGate on the child routes.
 *
 * Centralised so `/learn` and `/learn/reading` route files don't duplicate
 * the "exit" / "switch child" wiring. Reads `useAuthStore` via `getState()`
 * inside the callback (not via subscription) to avoid re-render churn from
 * the store being read on every render.
 */
export function useParentGateHandlers(): UseParentGateHandlersResult {
  const navigate = useNavigate();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const handleExit = useCallback(async () => {
    await disableChildModeFn();
    useAuthStore.getState().setChildMode(null);
    // Re-validate the parent session from the server rather than reading the
    // in-memory `user` field — `setUser` is only invoked in tests, so in
    // production the store's `user` is always null even when the parent JWT
    // cookie is valid. After `disableChildModeFn` clears the child-mode
    // cookie, the parent JWT (if any) is what `validateSessionFn` finds.
    const session = await validateSessionFn();
    void navigate({ to: session ? '/dashboard' : '/login' });
  }, [navigate]);

  const handleSwitchChild = useCallback(() => {
    setSwitcherOpen(true);
  }, []);

  return {
    handleExit,
    handleSwitchChild,
    switcherOpen,
    setSwitcherOpen,
  };
}
