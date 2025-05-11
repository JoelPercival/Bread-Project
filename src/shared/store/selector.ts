/**
 * Utilities for creating optimized selectors and managing store performance
 */
import { StoreApi, UseBoundStore } from 'zustand';
import { shallow } from 'zustand/shallow';

/**
 * Helper to create a selector with shallow equality comparison for better performance
 * Using this avoids unnecessary re-renders when selecting multiple values from a store
 */
export function createSelector<T, U>(
  store: UseBoundStore<StoreApi<T>>,
  selector: (state: T) => U
) {
  return () => store(selector, shallow);
}

/**
 * Create a memoized selector that only recalculates when dependencies change
 */
export function createMemoizedSelector<T, D, U>(
  store: UseBoundStore<StoreApi<T>>,
  dependencySelector: (state: T) => D,
  transform: (dependencies: D) => U
) {
  // Store the last calculated value
  let lastValue: U | undefined;
  // Store the last dependencies
  let lastDependencies: D | undefined;

  return () => {
    // Get the current dependencies from the store
    const dependencies = store(dependencySelector, shallow);
    
    // If the dependencies haven't changed (shallow comparison)
    // return the last calculated value
    if (lastDependencies !== undefined && lastValue !== undefined && 
        shallow(dependencies, lastDependencies)) {
      return lastValue;
    }
    
    // Otherwise, calculate a new value
    const value = transform(dependencies);
    
    // Store the new value and dependencies
    lastValue = value;
    lastDependencies = dependencies;
    
    return value;
  };
}

/**
 * Hook to select a single item from a collection by ID
 */
export function createItemSelector<T, I extends { id: string }>(
  store: UseBoundStore<StoreApi<T>>,
  collectionSelector: (state: T) => I[]
) {
  return (id: string) => {
    return store(state => {
      const collection = collectionSelector(state);
      return collection.find(item => item.id === id);
    });
  };
}
