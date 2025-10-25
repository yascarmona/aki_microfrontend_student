import { QueuedScan } from '@/shared/types';

const QUEUE_STORAGE_KEY = 'aki_scan_queue';
const MAX_RETRIES = 3;

export class QueueStorage {
  static add(scan: Omit<QueuedScan, 'id' | 'timestamp' | 'retries'>): void {
    const queue = this.getAll();
    const queuedScan: QueuedScan = {
      ...scan,
      id: this.generateId(),
      timestamp: Date.now(),
      retries: 0,
    };
    queue.push(queuedScan);
    this.save(queue);
  }

  static getAll(): QueuedScan[] {
    try {
      const data = localStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to retrieve queue:', error);
      return [];
    }
  }

  static remove(id: string): void {
    const queue = this.getAll().filter((item) => item.id !== id);
    this.save(queue);
  }

  static incrementRetry(id: string): void {
    const queue = this.getAll();
    const item = queue.find((scan) => scan.id === id);
    if (item) {
      item.retries += 1;
      if (item.retries >= MAX_RETRIES) {
        this.remove(id);
      } else {
        this.save(queue);
      }
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(QUEUE_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear queue:', error);
    }
  }

  static count(): number {
    return this.getAll().length;
  }

  private static save(queue: QueuedScan[]): void {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save queue:', error);
    }
  }

  private static generateId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
