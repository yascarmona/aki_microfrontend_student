import { create } from "zustand";

interface AppStore {
  isOnline: boolean;
  queueCount: number;
  setOnline: (status: boolean) => void;
  setQueueCount: (count: number) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isOnline: navigator.onLine,
  queueCount: 0,
  setOnline: (status) => set({ isOnline: status }),
  setQueueCount: (count) => set({ queueCount: count }),
}));

// Mantém o estado sincronizado com a conexão real
window.addEventListener("online", () => useAppStore.getState().setOnline(true));
window.addEventListener("offline", () => useAppStore.getState().setOnline(false));
