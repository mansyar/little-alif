import { useCallback, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { disableChildModeFn } from '~/server/auth-fns';
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
    const user = useAuthStore.getState().user;
    navigate({ to: user ? '/dashboard' : '/login' });
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
