
export const db = {
  name: 'CoffeeHeadDB',
  version: 1,
  store: 'app_data',

  init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, this.version);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(this.store);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async set(key: string, value: any): Promise<void> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(this.store, 'readwrite');
      const request = transaction.objectStore(this.store).put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async get(key: string): Promise<any> {
    const database = await this.init();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(this.store, 'readonly');
      const request = transaction.objectStore(this.store).get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
};

// Request persistent storage on mobile devices
export async function requestPersistence() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persist();
    console.log(`Storage persisted: ${isPersisted}`);
  }
}
