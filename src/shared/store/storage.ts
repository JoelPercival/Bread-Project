import { createJSONStorage, StateStorage } from 'zustand/middleware';
import storageService from '../services/storageService';

/**
 * Custom storage adapter for Zustand to use our storage service
 */
export const customStorage = createJSONStorage<StateStorage>(() => ({
  getItem: (name) => {
    return storageService.getItem(name);
  },
  setItem: (name, value) => {
    return storageService.setItem(name, value);
  },
  removeItem: (name) => {
    return storageService.removeItem(name);
  }
}));
