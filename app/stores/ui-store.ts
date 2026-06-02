import { create } from 'zustand';
import type { VowelMode } from '~/lib/utils/harakat';

export interface Toast {
  id: string;
  variant: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  selectedLetterId: string | null;
  isLoading: boolean;
  toasts: Toast[];
  currentHarakat: VowelMode;
  setSelectedLetter: (id: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
  setHarakat: (mode: VowelMode) => void;
}

/**
 * Ephemeral UI state: the currently selected letter, a global loading flag,
 * a stack of transient toast notifications, and the current child-session
 * vowel mode (harakat) for the /learn page.
 */
export const useUiStore = create<UiState>((set) => ({
  selectedLetterId: null,
  isLoading: false,
  toasts: [],
  currentHarakat: 'fathah',
  setSelectedLetter: (id) => set({ selectedLetterId: id }),
  setLoading: (isLoading) => set({ isLoading }),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  setHarakat: (mode) => set({ currentHarakat: mode }),
}));
