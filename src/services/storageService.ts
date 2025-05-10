/**
 * Storage Service - Handles data persistence operations
 * This abstraction allows for easy swapping of storage mechanisms in the future
 * (e.g., localStorage, IndexedDB, cloud storage, etc.)
 */

// Type for storage options
export type StorageBackend = 'localStorage' | 'sessionStorage' | 'indexedDB' | 'remote';

// Configuration for the storage service
export interface StorageConfig {
  backend: StorageBackend;
  prefix?: string;
  remoteUrl?: string;
  apiKey?: string;
}

// Default configuration
const DEFAULT_CONFIG: StorageConfig = {
  backend: 'localStorage',
  prefix: 'breadApp_'
};

// Storage provider interface
export interface StorageProvider {
  getItem<T>(key: string, defaultValue?: T | null): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(clearAll?: boolean): Promise<void>;
}

// Local Storage Provider
class LocalStorageProvider implements StorageProvider {
  private storage: Storage;
  private prefix: string;

  constructor(config: StorageConfig) {
    this.storage = config.backend === 'localStorage' 
      ? window.localStorage 
      : window.sessionStorage;
    this.prefix = config.prefix || 'breadApp_';
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async getItem<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    const item = this.storage.getItem(this.getKey(key));
    
    if (item === null) {
      return defaultValue;
    }
    
    try {
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error parsing item with key ${key}:`, error);
      return defaultValue;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      this.storage.setItem(this.getKey(key), serializedValue);
    } catch (error) {
      console.error(`Error setting item with key ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    this.storage.removeItem(this.getKey(key));
  }

  async clear(clearAll: boolean = false): Promise<void> {
    if (clearAll) {
      this.storage.clear();
      return;
    }

    // Only clear items with our prefix
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      this.storage.removeItem(key);
    });
  }
}

// IndexedDB Storage Provider
class IndexedDBProvider implements StorageProvider {
  private dbName: string;
  private storeName: string = 'breadAppStore';
  private db: IDBDatabase | null = null;

  constructor(config: StorageConfig) {
    this.dbName = config.prefix || 'breadApp_db';
    this.initDB();
  }

  private async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = (event) => {
        console.error('Error opening IndexedDB:', event);
        reject(new Error('Failed to open IndexedDB'));
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  private async getDBInstance(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    await this.initDB();
    if (!this.db) throw new Error('IndexedDB not initialized');
    return this.db;
  }

  async getItem<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    try {
      const db = await this.getDBInstance();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);
        
        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.value : defaultValue);
        };
        
        request.onerror = (event) => {
          console.error(`Error getting item with key ${key}:`, event);
          resolve(defaultValue);
        };
      });
    } catch (error) {
      console.error(`Error in getItem for key ${key}:`, error);
      return defaultValue;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.getDBInstance();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put({ id: key, value });
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(`Error setting item with key ${key}:`, event);
          reject(new Error('Failed to set item in IndexedDB'));
        };
      });
    } catch (error) {
      console.error(`Error in setItem for key ${key}:`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.getDBInstance();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(`Error removing item with key ${key}:`, event);
          reject(new Error('Failed to remove item from IndexedDB'));
        };
      });
    } catch (error) {
      console.error(`Error in removeItem for key ${key}:`, error);
    }
  }

  async clear(clearAll: boolean = false): Promise<void> {
    try {
      const db = await this.getDBInstance();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error('Error clearing IndexedDB store:', event);
          reject(new Error('Failed to clear IndexedDB store'));
        };
      });
    } catch (error) {
      console.error('Error in clear:', error);
    }
  }
}

// Remote Storage Provider (placeholder for future implementation)
class RemoteStorageProvider implements StorageProvider {
  private apiUrl: string;
  private apiKey?: string;

  constructor(config: StorageConfig) {
    this.apiUrl = config.remoteUrl || 'https://api.example.com/storage';
    this.apiKey = config.apiKey;
  }

  async getItem<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${key}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.value;
    } catch (error) {
      console.error(`Error fetching remote data for key ${key}:`, error);
      return defaultValue;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({ value })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error setting remote data for key ${key}:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${key}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error removing remote data for key ${key}:`, error);
      throw error;
    }
  }

  async clear(clearAll: boolean = false): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error clearing remote data:', error);
      throw error;
    }
  }
}

// Main Storage Service class
class StorageService {
  private provider: StorageProvider;
  private config: StorageConfig;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.provider = this.createProvider(this.config);
  }

  private createProvider(config: StorageConfig): StorageProvider {
    switch (config.backend) {
      case 'localStorage':
      case 'sessionStorage':
        return new LocalStorageProvider(config);
      case 'indexedDB':
        return new IndexedDBProvider(config);
      case 'remote':
        return new RemoteStorageProvider(config);
      default:
        return new LocalStorageProvider(config);
    }
  }

  // Update configuration and switch provider
  updateConfig(config: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...config };
    this.provider = this.createProvider(this.config);
  }

  // Get current configuration
  getConfig(): StorageConfig {
    return { ...this.config };
  }

  // Proxy methods to the current provider
  async getItem<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    return this.provider.getItem(key, defaultValue);
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    return this.provider.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    return this.provider.removeItem(key);
  }

  async clear(clearAll: boolean = false): Promise<void> {
    return this.provider.clear(clearAll);
  }
}

// Create and export default instance
const storageService = new StorageService();

// Export a factory function for creating storage services with different configs
export const createStorage = (config: Partial<StorageConfig> = {}): StorageService => {
  return new StorageService(config);
};

// Export the default instance
export default storageService;
