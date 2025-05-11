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
      console.error(`Error parsing item from storage: ${key}`, error);
      return defaultValue;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      this.storage.setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error(`Error saving item to storage: ${key}`, error);
      throw error;
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
    const keys = Object.keys(this.storage);
    for (const key of keys) {
      if (key.startsWith(this.prefix)) {
        this.storage.removeItem(key);
      }
    }
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
    if (this.db) {
      return; // DB already initialized
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = (event) => {
        console.error(`IndexedDB error: ${(event.target as any).error}`);
        reject((event.target as any).error);
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }
  
  private async getDBInstance(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDB();
    }
    
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }
    
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
          resolve(request.result || defaultValue);
        };
        
        request.onerror = (event) => {
          console.error(`Error getting item from IndexedDB: ${key}`, event);
          reject((event.target as any).error);
        };
      });
    } catch (error) {
      console.error(`Error accessing IndexedDB`, error);
      return defaultValue;
    }
  }
  
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.getDBInstance();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(value, key);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error(`Error saving item to IndexedDB: ${key}`, event);
          reject((event.target as any).error);
        };
      });
    } catch (error) {
      console.error(`Error accessing IndexedDB`, error);
      throw error;
    }
  }
  
  async removeItem(key: string): Promise<void> {
    try {
      const db = await this.getDBInstance();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error(`Error removing item from IndexedDB: ${key}`, event);
          reject((event.target as any).error);
        };
      });
    } catch (error) {
      console.error(`Error accessing IndexedDB`, error);
      throw error;
    }
  }
  
  async clear(clearAll: boolean = false): Promise<void> {
    try {
      if (clearAll) {
        // Delete the entire database
        return new Promise((resolve, reject) => {
          const request = indexedDB.deleteDatabase(this.dbName);
          
          request.onsuccess = () => {
            this.db = null;
            resolve();
          };
          
          request.onerror = (event) => {
            console.error(`Error deleting IndexedDB database`, event);
            reject((event.target as any).error);
          };
        });
      }
      
      // Clear just our store
      const db = await this.getDBInstance();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();
        
        request.onsuccess = () => {
          resolve();
        };
        
        request.onerror = (event) => {
          console.error(`Error clearing IndexedDB store`, event);
          reject((event.target as any).error);
        };
      });
    } catch (error) {
      console.error(`Error accessing IndexedDB`, error);
      throw error;
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
  
  // Helper for making authenticated API requests
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<T> {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      
      const options: RequestInit = {
        method,
        headers,
        credentials: 'include', // for handling cookies if needed
      };
      
      if (body) {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Handle empty responses
      if (response.status === 204) {
        return {} as T;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request error: ${method} ${endpoint}`, error);
      throw error;
    }
  }
  
  async getItem<T>(key: string, defaultValue: T | null = null): Promise<T | null> {
    try {
      const data = await this.makeRequest<T>('GET', `/items/${key}`);
      return data;
    } catch (error) {
      console.error(`Error fetching item from API: ${key}`, error);
      return defaultValue;
    }
  }
  
  async setItem<T>(key: string, value: T): Promise<void> {
    await this.makeRequest<void>('PUT', `/items/${key}`, value);
  }
  
  async removeItem(key: string): Promise<void> {
    await this.makeRequest<void>('DELETE', `/items/${key}`);
  }
  
  async clear(clearAll: boolean = false): Promise<void> {
    await this.makeRequest<void>('DELETE', clearAll ? '/items' : '/items?prefix=1');
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
        console.warn(`Unknown storage backend: ${config.backend}, falling back to localStorage`);
        return new LocalStorageProvider({ ...config, backend: 'localStorage' });
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
export function createStorage(config: Partial<StorageConfig> = {}): StorageService {
  return new StorageService(config);
}

// Export the default instance
export default storageService;
