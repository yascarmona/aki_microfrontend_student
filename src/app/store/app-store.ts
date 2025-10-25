import { create } from 'zustand';

interface AppState {
  isOnline: boolean;
  queueCount: number;
  setOnline: (online: boolean) => void;
  setQueueCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: navigator.onLine,
  queueCount: 0,
  setOnline: (online) => set({ isOnline: online }),
  setQueueCount: (count) => set({ queueCount: count }),
}));
