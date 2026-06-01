import { create } from 'zustand';

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  vowelMode: 'none' | 'fathah' | 'kasrah' | 'dammah';
}

export interface Letter {
  id: string;
  character: string;
  displayOrder: number;
}

interface ChildState {
  activeProfile: ChildProfile | null;
  visibleLetters: Letter[];
  setActiveProfile: (profile: ChildProfile | null) => void;
  setVisibleLetters: (letters: Letter[]) => void;
}

/**
 * Holds the currently active child profile (in the parent UI or child mode)
 * and the letters that the parent has enabled for that profile.
 */
export const useChildStore = create<ChildState>((set) => ({
  activeProfile: null,
  visibleLetters: [],
  setActiveProfile: (profile) => set({ activeProfile: profile }),
  setVisibleLetters: (letters) => set({ visibleLetters: letters }),
}));
