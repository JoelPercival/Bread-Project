import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Recipe, FlourType } from '../../../types';
import { recipeService } from '../services/recipeService';
import { customStorage } from '../../../shared/store/storage';
import { createItemSelector, createMemoizedSelector } from '../../../shared/store/selector';

interface RecipeState {
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  
  // Recipe actions
  createRecipe: (recipe: Omit<Recipe, 'id' | 'created' | 'updated'>) => string;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  duplicateRecipe: (id: string) => string;
  
  // Data helpers
  getDefaultFlourTypes: () => FlourType[];
  getDefaultStages: () => any[]; // Add getDefaultStages function
  getPreFermentTypes: () => string[];
  getPreFermentDetails: (type: string) => {
    flourGrams: number;
    waterGrams: number;
    yeastGrams: number;
    percentage: number;
  };
}

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      recipes: [],
      currentRecipe: null,
      
      createRecipe: (recipeData) => {
        const now = new Date();
        const newRecipe: Recipe = {
          id: uuidv4(),
          created: now,
          updated: now,
          name: recipeData.name || 'New Recipe',
          doughWeight: recipeData.doughWeight || 1000,
          numberOfLoaves: recipeData.numberOfLoaves || 1,
          hydration: recipeData.hydration || 70,
          flourTypes: recipeData.flourTypes || get().getDefaultFlourTypes(),
          yeastType: recipeData.yeastType || 'Instant',
          saltPercentage: recipeData.saltPercentage || 2,
          stages: recipeData.stages || [],
          breadType: recipeData.breadType || 'Boule',
          preFerment: recipeData.preFerment,
        };
        
        set((state) => ({
          recipes: [...state.recipes, newRecipe],
          currentRecipe: newRecipe
        }));
        
        return newRecipe.id;
      },
      
      updateRecipe: (id, recipeData) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) => 
            recipe.id === id
              ? { ...recipe, ...recipeData, updated: new Date() }
              : recipe
          ),
          currentRecipe: state.currentRecipe?.id === id
            ? { ...state.currentRecipe, ...recipeData, updated: new Date() }
            : state.currentRecipe
        }));
      },
      
      deleteRecipe: (id) => {
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== id),
          currentRecipe: state.currentRecipe?.id === id ? null : state.currentRecipe
        }));
      },
      
      setCurrentRecipe: (recipe) => {
        set({ currentRecipe: recipe });
      },
      
      duplicateRecipe: (id) => {
        const { recipes } = get();
        const existingRecipe = recipes.find((recipe) => recipe.id === id);
        
        if (!existingRecipe) {
          throw new Error(`Recipe with id ${id} not found`);
        }
        
        const now = new Date();
        const newRecipe: Recipe = {
          ...existingRecipe,
          id: uuidv4(),
          created: now,
          updated: now,
          name: `${existingRecipe.name} (Copy)`,
          stages: existingRecipe.stages.map(stage => ({
            ...stage,
            id: uuidv4()
          })),
          flourTypes: existingRecipe.flourTypes.map(flour => ({
            ...flour,
            id: uuidv4()
          }))
        };
        
        set((state) => ({
          recipes: [...state.recipes, newRecipe],
          currentRecipe: newRecipe
        }));
        
        return newRecipe.id;
      },
      
      getDefaultFlourTypes: () => {
        return recipeService.getDefaultFlourTypes().map(flour => ({
          ...flour,
          id: uuidv4()
        }));
      },
      
      getDefaultStages: () => {
        return [
          { id: uuidv4(), name: 'Autolyse', duration: 30, order: 1 },
          { id: uuidv4(), name: 'Bulk Fermentation', duration: 120, order: 2 },
          { id: uuidv4(), name: 'Shaping', duration: 15, order: 3 },
          { id: uuidv4(), name: 'Final Proof', duration: 60, order: 4 },
          { id: uuidv4(), name: 'Baking', duration: 35, order: 5 },
          { id: uuidv4(), name: 'Cooling', duration: 60, order: 6 }
        ];
      },
      getPreFermentTypes: () => recipeService.getPreFermentTypes(),
      getPreFermentDetails: (type: string) => recipeService.getPreFermentDetails(type)
    }),
    {
      name: 'bread-master-recipes',
      storage: customStorage
    }
  )
);

// Export optimized selectors for better performance

// Selector for getting a recipe by ID (memoized for performance)
export const getRecipeById = createItemSelector(useRecipeStore, state => state.recipes);

// Memoized selector for filtered recipes
export const getFilteredRecipes = (searchTerm: string = '') => {
  return createMemoizedSelector(
    useRecipeStore,
    state => ({ recipes: state.recipes, term: searchTerm }),
    ({ recipes, term }) => {
      if (!term.trim()) return recipes;
      
      const lowerTerm = term.toLowerCase();
      return recipes.filter(recipe => 
        recipe.name?.toLowerCase().includes(lowerTerm) ||
        recipe.breadType?.toLowerCase().includes(lowerTerm) ||
        recipe.flourTypes?.some(flour => 
          flour.name?.toLowerCase().includes(lowerTerm)
        ) || false
      );
    }
  )();
};

// Memoized selector for bread types
export const getBreadTypes = createMemoizedSelector(
  useRecipeStore,
  state => state.recipes,
  (recipes) => {
    const types = new Set<string>();
    recipes.forEach(recipe => {
      if (recipe.breadType) {
        types.add(recipe.breadType);
      }
    });
    return Array.from(types);
  }
);
