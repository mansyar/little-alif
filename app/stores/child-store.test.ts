import { describe, expect, it, beforeEach } from 'vitest';
import { useChildStore } from './child-store';

describe('useChildStore', () => {
  beforeEach(() => {
    useChildStore.setState({
      activeProfile: null,
      visibleLetters: [],
    });
  });

  it('starts with no active profile and no visible letters', () => {
    const state = useChildStore.getState();
    expect(state.activeProfile).toBeNull();
    expect(state.visibleLetters).toEqual([]);
  });

  it('setActiveProfile stores the profile reference', () => {
    useChildStore.getState().setActiveProfile({
      id: 'p1',
      name: 'Sara',
      avatar: 'alif-lamp',
      vowelMode: 'fathah',
    });
    expect(useChildStore.getState().activeProfile).toEqual({
      id: 'p1',
      name: 'Sara',
      avatar: 'alif-lamp',
      vowelMode: 'fathah',
    });
  });

  it('setVisibleLetters replaces the list of visible letters', () => {
    useChildStore.getState().setVisibleLetters([
      { id: 'alif', character: 'ا', displayOrder: 1 },
    ]);
    useChildStore.getState().setVisibleLetters([
      { id: 'ba', character: 'ب', displayOrder: 2 },
      { id: 'ta', character: 'ت', displayOrder: 3 },
    ]);
    expect(useChildStore.getState().visibleLetters).toHaveLength(2);
  });
});
