import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BakeSession, Recipe } from '../../../types';
import { getBakeSessionsByRecipeId, getBakeSessionById, getCompletedBakeSessions } from '../../baking/store/bakingStore';
import { getRecipeById } from '../../recipes/store/recipeStore';
import { customStorage } from '../../../shared/store/storage';
// No longer using createMemoizedSelector in this file

interface AnalysisFilters {
  breadType: string | null;
  minHydration: number;
  maxHydration: number;
  flourType: string | null;
  minCrumbRating: number;
  minCrustRating: number;
  minFlavorRating: number;
}

interface AnalysisState {
  // Currently selected bake for analysis
  selectedBakeId: string | null;
  
  // Filters for the analysis view
  filters: AnalysisFilters;
  
  // Actions
  setSelectedBakeId: (id: string | null) => void;
  updateFilters: (filters: Partial<AnalysisFilters>) => void;
  resetFilters: () => void;
  
  // Helper methods
  getBakeStatistics: () => {
    totalBakes: number;
    averageRating: number;
    topRecipe: { id: string; name: string; count: number } | null;
    averageHydration: number;
  };
}

// Default filters
const defaultFilters: AnalysisFilters = {
  breadType: null,
  minHydration: 0,
  maxHydration: 100,
  flourType: null,
  minCrumbRating: 0,
  minCrustRating: 0,
  minFlavorRating: 0
};

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      selectedBakeId: null,
      filters: defaultFilters,
      
      setSelectedBakeId: (id) => {
        set({ selectedBakeId: id });
      },
      
      updateFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters }
        }));
      },
      
      resetFilters: () => {
        set({ filters: defaultFilters });
      },
      
      getBakeStatistics: () => {
        // This is a computed property that doesn't rely on the analysis store state,
        // but rather uses the baking store's data
        
        // Get all completed bake sessions
        const completedBakes = getAllBakes().filter(bake => bake.endTime);
        
        if (completedBakes.length === 0) {
          return {
            totalBakes: 0,
            averageRating: 0,
            topRecipe: null,
            averageHydration: 0
          };
        }
        
        // Calculate average rating
        const totalRatings = completedBakes.reduce((sum, bake) => {
          const { crumb, crust, flavor } = bake.ratings;
          const avgRating = (crumb + crust + flavor) / 3;
          return sum + avgRating;
        }, 0);
        
        const averageRating = totalRatings / completedBakes.length;
        
        // Find the most baked recipe
        const recipeCounts: Record<string, number> = {};
        completedBakes.forEach(bake => {
          const recipeId = bake.recipeId;
          recipeCounts[recipeId] = (recipeCounts[recipeId] || 0) + 1;
        });
        
        let topRecipeId = null;
        let topRecipeCount = 0;
        
        Object.entries(recipeCounts).forEach(([recipeId, count]) => {
          if (count > topRecipeCount) {
            topRecipeId = recipeId;
            topRecipeCount = count;
          }
        });
        
        const topRecipe = topRecipeId 
          ? {
              id: topRecipeId,
              name: getRecipeById(topRecipeId)?.name || 'Unknown Recipe',
              count: topRecipeCount
            } 
          : null;
        
        // Calculate average hydration
        const totalHydration = completedBakes.reduce((sum, bake) => {
          const recipe = getRecipeById(bake.recipeId);
          return sum + (recipe?.hydration || 0);
        }, 0);
        
        const averageHydration = totalHydration / completedBakes.length;
        
        return {
          totalBakes: completedBakes.length,
          averageRating,
          topRecipe,
          averageHydration
        };
      }
    }),
    {
      name: 'bread-master-analysis',
      storage: customStorage
    }
  )
);

// Optimized selectors for analysis functionality

// Type-safe memoized selector for getting all bakes
export const getAllBakes = (): BakeSession[] => {
  return getBakeSessionsByRecipeId('');
};

// Type-safe memoized selector for filtered bakes
export const getFilteredBakes = (): BakeSession[] => {
  const allBakes = getAllBakes();
  const { filters } = useAnalysisStore.getState();
  
  return allBakes.filter((bake: BakeSession) => {
      const recipe = getRecipeById(bake.recipeId);
      if (!recipe) return false;
      
      // Filter by bread type
      if (filters.breadType && recipe.breadType !== filters.breadType) {
        return false;
      }
      
      // Filter by hydration
      if ((recipe.hydration || 0) < filters.minHydration || 
          (recipe.hydration || 100) > filters.maxHydration) {
        return false;
      }
      
      // Filter by flour type
      if (filters.flourType && !recipe.flourTypes?.some(flour => 
        flour.name === filters.flourType && (flour.percentage || 0) > 0
      )) {
        return false;
      }
      
      // Filter by ratings
      const { crumb = 0, crust = 0, flavor = 0 } = bake.ratings || {};
      if (crumb < filters.minCrumbRating) return false;
      if (crust < filters.minCrustRating) return false;
      if (flavor < filters.minFlavorRating) return false;
      
      return true;
    });
  }

// Type-safe helper for getting the selected bake with its recipe
export const getSelectedBakeWithRecipe = (): { bake: BakeSession; recipe: Recipe } | null => {
  const { selectedBakeId } = useAnalysisStore.getState();
  if (!selectedBakeId) return null;
  
  const bake = getBakeSessionById(selectedBakeId);
  if (!bake) return null;
  
  const recipe = getRecipeById(bake.recipeId);
  if (!recipe) return null;
  
  return { bake, recipe };
};

// Type-safe helper for getting baking statistics
export const getBakingStatistics = () => {
  const completedBakes = getCompletedBakeSessions();
  if (completedBakes.length === 0) {
    return {
      totalBakes: 0,
      averageRating: 0,
      topRecipe: null,
      averageHydration: 0
    };
  }
    
  // Calculate average rating
  const totalRatings = completedBakes.reduce((sum: number, bake: BakeSession) => {
    const crumb = bake.ratings?.crumb || 0;
    const crust = bake.ratings?.crust || 0;
    const flavor = bake.ratings?.flavor || 0;
    const avgRating = (crumb + crust + flavor) / 3;
    return sum + avgRating;
  }, 0);
    
  const averageRating = totalRatings / completedBakes.length;
  
  // Find the most baked recipe
  const recipeCounts: Record<string, { count: number, name: string }> = {};
  completedBakes.forEach((bake: BakeSession) => {
    const recipeId = bake.recipeId;
    if (!recipeCounts[recipeId]) {
      const recipe = getRecipeById(recipeId);
      recipeCounts[recipeId] = { 
        count: 0, 
        name: recipe?.name || 'Unknown Recipe' 
      };
    }
    recipeCounts[recipeId].count++;
  });
    
  let topRecipe = null;
  let topRecipeCount = 0;
  
  Object.entries(recipeCounts).forEach(([recipeId, info]) => {
    if (info.count > topRecipeCount) {
      topRecipe = {
        id: recipeId,
        name: info.name,
        count: info.count
      };
      topRecipeCount = info.count;
    }
  });
    
  // Calculate average hydration
  const totalHydration = completedBakes.reduce((sum: number, bake: BakeSession) => {
    const recipe = getRecipeById(bake.recipeId);
    return sum + (recipe?.hydration || 0);
  }, 0);
  
  const averageHydration = totalHydration / completedBakes.length;
  
  return {
    totalBakes: completedBakes.length,
    averageRating,
    topRecipe,
    averageHydration
  };
};
