import { describe, expect, it, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
  });

  it('starts unauthenticated with no mode', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.mode).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.childProfileId).toBeNull();
  });

  it('setUser marks the session as parent mode and authenticated', () => {
    useAuthStore.getState().setUser({ id: 'u1', email: 'p@example.com' });
    const state = useAuthStore.getState();
    expect(state.user).toEqual({ id: 'u1', email: 'p@example.com' });
    expect(state.mode).toBe('parent');
    expect(state.isAuthenticated).toBe(true);
  });

  it('setUser(null) clears the parent session', () => {
    useAuthStore.getState().setUser({ id: 'u1', email: 'p@example.com' });
    useAuthStore.getState().setUser(null);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.mode).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setChildMode switches to child mode and stores profile id', () => {
    useAuthStore.getState().setChildMode('profile-42');
    const state = useAuthStore.getState();
    expect(state.mode).toBe('child');
    expect(state.childProfileId).toBe('profile-42');
  });

  it('setChildMode(null) leaves parent mode intact', () => {
    useAuthStore.getState().setUser({ id: 'u1', email: 'p@example.com' });
    useAuthStore.getState().setChildMode('profile-42');
    useAuthStore.getState().setChildMode(null);
    const state = useAuthStore.getState();
    expect(state.mode).toBe('parent');
    expect(state.childProfileId).toBeNull();
  });

  it('clear resets the entire store', () => {
    useAuthStore.getState().setUser({ id: 'u1', email: 'p@example.com' });
    useAuthStore.getState().clear();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.mode).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.childProfileId).toBeNull();
  });
});
