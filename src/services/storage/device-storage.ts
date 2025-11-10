// src/utils/DeviceStorage.ts

export interface DeviceData {
  id: string;
  studentCpf: string;
  latitude?: number;
  longitude?: number;
}

const DEVICE_KEY = "aki_device";

export const DeviceStorage = {
  get(): DeviceData | null {
    const raw = localStorage.getItem(DEVICE_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  save(data: DeviceData) {
    localStorage.setItem(DEVICE_KEY, JSON.stringify(data));
  },

  clear() {
    localStorage.removeItem(DEVICE_KEY);
  },

  isRegistered(): boolean {
    return !!localStorage.getItem(DEVICE_KEY);
  },
};
