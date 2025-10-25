const DEVICE_STORAGE_KEY = import.meta.env.VITE_DEVICE_STORAGE_KEY || 'aki_student_device';

export interface DeviceData {
  device_id: string;
  cpf: string;
  registered_at: string;
}

export class DeviceStorage {
  static save(data: DeviceData): void {
    try {
      localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save device data:', error);
    }
  }

  static get(): DeviceData | null {
    try {
      const data = localStorage.getItem(DEVICE_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to retrieve device data:', error);
      return null;
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(DEVICE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear device data:', error);
    }
  }

  static isRegistered(): boolean {
    return this.get() !== null;
  }

  static getDeviceId(): string {
    const data = this.get();
    return data?.device_id || this.generateDeviceId();
  }

  private static generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
