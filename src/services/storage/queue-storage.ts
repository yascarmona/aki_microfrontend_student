const QUEUE_KEY = "aki_queue";

export const QueueStorage = {
  getAll() {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  add(record: any) {
    const all = QueueStorage.getAll();
    all.push(record);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(all));
  },

  remove(index: number) {
    const all = QueueStorage.getAll();
    all.splice(index, 1);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(all));
  },

  clear() {
    localStorage.removeItem(QUEUE_KEY);
  },

  count() {
    return QueueStorage.getAll().length;
  },
};
