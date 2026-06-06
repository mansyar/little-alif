import { create } from 'zustand';

export type AuthMode = 'parent' | 'child' | null;

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  mode: AuthMode;
  childProfileId: string | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setChildMode: (profileId: string | null) => void;
  clear: () => void;
}

/**
 * Holds the active authentication context for the client.
 *
 * In a parent session, `user` is set and `mode` is `'parent'`.
 * In a child session, `mode` is `'child'` and `childProfileId` is set.
 * When neither is set, the store is empty.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  mode: null,
  childProfileId: null,
  isAuthenticated: false,
  setUser: (user) =>
    set({
      user,
      mode: user ? 'parent' : null,
      isAuthenticated: user !== null,
    }),
  setChildMode: (profileId) =>
    set((state) => ({
      childProfileId: profileId,
      mode: profileId ? 'child' : state.user ? 'parent' : null,
      isAuthenticated: profileId ? true : state.isAuthenticated,
    })),
  clear: () =>
    set({
      user: null,
      mode: null,
      childProfileId: null,
      isAuthenticated: false,
    }),
}));
