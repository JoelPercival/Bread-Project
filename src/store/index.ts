/**
 * Main store index file - exports all feature-specific stores
 * This file serves as the entry point for the application's state management
 */

// Re-export the feature-specific stores
export { useRecipeStore, getRecipeById } from '../features/recipes/store/recipeStore';
export { 
  useBakingStore, 
  getBakeSessionsByRecipeId, 
  getBakeSessionById 
} from '../features/baking/store/bakingStore';
export { 
  useAnalysisStore, 
  getAllBakes, 
  getFilteredBakes, 
  getSelectedBakeWithRecipe 
} from '../features/analysis/store/analysisStore';

// For backwards compatibility with existing components, export a default store
// that provides access to all stores
import { useRecipeStore } from '../features/recipes/store/recipeStore';
import { useBakingStore } from '../features/baking/store/bakingStore';
import { useAnalysisStore } from '../features/analysis/store/analysisStore';

// Combine all stores into a single hook for easier access
const useStore = () => {
  const recipeStore = useRecipeStore();
  const bakingStore = useBakingStore();
  const analysisStore = useAnalysisStore();
  
  return {
    // Recipe store
    recipes: recipeStore.recipes,
    currentRecipe: recipeStore.currentRecipe,
    createRecipe: recipeStore.createRecipe,
    updateRecipe: recipeStore.updateRecipe,
    deleteRecipe: recipeStore.deleteRecipe,
    setCurrentRecipe: recipeStore.setCurrentRecipe,
    duplicateRecipe: recipeStore.duplicateRecipe,
    
    // Baking store
    bakeSessions: bakingStore.bakeSessions,
    currentBakeSession: bakingStore.currentBakeSession,
    startBakeSession: bakingStore.startBakeSession,
    updateBakeSession: bakingStore.updateBakeSession,
    completeBakeSession: bakingStore.completeBakeSession,
    setCurrentBakeSession: bakingStore.setCurrentBakeSession,
    updateStageProgress: bakingStore.updateStageProgress,
    markStageComplete: bakingStore.markStageComplete,
    
    // Analysis store
    selectedBakeId: analysisStore.selectedBakeId,
    filters: analysisStore.filters,
    setSelectedBakeId: analysisStore.setSelectedBakeId,
    updateFilters: analysisStore.updateFilters,
    resetFilters: analysisStore.resetFilters,
    getBakeStatistics: analysisStore.getBakeStatistics,
    
    // Helper methods
    getDefaultStages: bakingStore.getDefaultStages,
    getDefaultFlourTypes: recipeStore.getDefaultFlourTypes,
    getPreFermentTypes: recipeStore.getPreFermentTypes,
    getPreFermentDetails: recipeStore.getPreFermentDetails,
  };
};

// Export the combined hook as the default
export default useStore;
