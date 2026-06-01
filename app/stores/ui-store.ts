import { create } from 'zustand';

export interface Toast {
  id: string;
  variant: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  selectedLetterId: string | null;
  isLoading: boolean;
  toasts: Toast[];
  setSelectedLetter: (id: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  pushToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

/**
 * Ephemeral UI state: the currently selected letter, a global loading flag,
 * and a stack of transient toast notifications.
 */
export const useUiStore = create<UiState>((set) => ({
  selectedLetterId: null,
  isLoading: false,
  toasts: [],
  setSelectedLetter: (id) => set({ selectedLetterId: id }),
  setLoading: (isLoading) => set({ isLoading }),
  pushToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
