import { describe, expect, it, beforeEach } from 'vitest';
import { useUiStore } from './ui-store';

describe('useUiStore', () => {
  beforeEach(() => {
    useUiStore.setState({
      selectedLetterId: null,
      isLoading: false,
      toasts: [],
      currentHarakat: 'fathah',
    });
  });

  it('starts with no selection, not loading, no toasts, and default harakat', () => {
    const state = useUiStore.getState();
    expect(state.selectedLetterId).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.toasts).toEqual([]);
    expect(state.currentHarakat).toBe('fathah');
  });

  it('setSelectedLetter stores the active letter id', () => {
    useUiStore.getState().setSelectedLetter('ba');
    expect(useUiStore.getState().selectedLetterId).toBe('ba');
  });

  it('setLoading toggles the global loading flag', () => {
    useUiStore.getState().setLoading(true);
    expect(useUiStore.getState().isLoading).toBe(true);
  });

  it('pushToast appends a toast with a unique id', () => {
    useUiStore.getState().pushToast({ variant: 'success', message: 'Saved' });
    const toasts = useUiStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0]?.variant).toBe('success');
    expect(toasts[0]?.message).toBe('Saved');
    expect(toasts[0]?.id).toBeTruthy();
  });

  it('dismissToast removes the toast with the matching id', () => {
    useUiStore.getState().pushToast({ variant: 'error', message: 'Boom' });
    const id = useUiStore.getState().toasts[0]!.id;
    useUiStore.getState().dismissToast(id);
    expect(useUiStore.getState().toasts).toEqual([]);
  });

  it('pushToast can append multiple toasts', () => {
    useUiStore.getState().pushToast({ variant: 'success', message: 'A' });
    useUiStore.getState().pushToast({ variant: 'error', message: 'B' });
    expect(useUiStore.getState().toasts).toHaveLength(2);
    const ids = useUiStore.getState().toasts.map((t) => t.id);
    expect(new Set(ids).size).toBe(2);
  });

  describe('currentHarakat', () => {
    it('starts with default fathah', () => {
      expect(useUiStore.getState().currentHarakat).toBe('fathah');
    });

    it('setHarakat updates the vowel mode to kasrah', () => {
      useUiStore.getState().setHarakat('kasrah');
      expect(useUiStore.getState().currentHarakat).toBe('kasrah');
    });

    it('setHarakat updates the vowel mode to dammah', () => {
      useUiStore.getState().setHarakat('dammah');
      expect(useUiStore.getState().currentHarakat).toBe('dammah');
    });

    it('setHarakat updates the vowel mode to none', () => {
      useUiStore.getState().setHarakat('none');
      expect(useUiStore.getState().currentHarakat).toBe('none');
    });

    it('setHarakat can cycle through all 4 vowel modes', () => {
      const modes = ['none', 'fathah', 'kasrah', 'dammah'] as const;
      for (const mode of modes) {
        useUiStore.getState().setHarakat(mode);
        expect(useUiStore.getState().currentHarakat).toBe(mode);
      }
    });
  });
});
