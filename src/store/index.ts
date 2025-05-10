import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Recipe, BakeSession, BakingStage, FlourType, YeastType, StageProgress } from '../types';
import { recipeService } from '../services/recipeService';
import storageService, { StorageConfig } from '../services/storageService';

interface AppState {
  recipes: Recipe[];
  bakeSessions: BakeSession[];
  currentRecipe: Recipe | null;
  currentBakeSession: BakeSession | null;
  
  // Recipe actions
  createRecipe: (recipe: Omit<Recipe, 'id' | 'created' | 'updated'>) => string;
  updateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  setCurrentRecipe: (recipe: Recipe | null) => void;
  duplicateRecipe: (id: string) => string;
  
  // Bake session actions
  startBakeSession: (recipeId: string) => string;
  updateBakeSession: (id: string, session: Partial<BakeSession>) => void;
  completeBakeSession: (id: string, data: Partial<BakeSession>) => void;
  setCurrentBakeSession: (session: BakeSession | null) => void;
  
  // Baking stage actions
  updateStageProgress: (bakeId: string, stageId: string, data: Partial<StageProgress>) => void;
  markStageComplete: (bakeId: string, stageId: string) => void;
  
  // Default data
  getDefaultStages: () => BakingStage[];
  getDefaultFlourTypes: () => FlourType[];
  getPreFermentTypes: () => string[];
  getPreFermentDetails: (type: string) => {
    flourGrams: number;
    waterGrams: number;
    yeastGrams: number;
    percentage: number;
  };
}

// Default baking stages
const defaultStages: BakingStage[] = [
  { id: uuidv4(), name: 'Autolyse', order: 0, included: true, description: 'Mix flour and water, rest to hydrate flour' },
  { id: uuidv4(), name: 'Mix', order: 1, included: true, description: 'Add remaining ingredients and mix until combined' },
  { id: uuidv4(), name: 'Bulk Ferment', order: 2, included: true, description: 'Let dough rise at room temperature' },
  { id: uuidv4(), name: 'Shape', order: 3, included: true, description: 'Divide and shape dough' },
  { id: uuidv4(), name: 'Proof', order: 4, included: true, description: 'Final rise before baking' },
  { id: uuidv4(), name: 'Bake', order: 5, included: true, description: 'Bake until golden brown' },
];

// Default flour types are now provided by recipeService
// Pre-ferment types and details are now provided by recipeService

// We'll use the standard Zustand persistence with localStorage
// but add a state listener to sync with our storage service

const useStore = create(
  persist<AppState>(
    (set, get) => ({
  recipes: [],
  bakeSessions: [],
  currentRecipe: null,
  currentBakeSession: null,
  
  createRecipe: (recipeData) => {
    const id = uuidv4();
    const now = new Date();
    const newRecipe: Recipe = {
      ...recipeData,
      id,
      created: now,
      updated: now,
    };
    
    set((state) => ({
      recipes: [...state.recipes, newRecipe]
    }));
    
    return id;
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
    const recipe = recipes.find(r => r.id === id);
    
    if (!recipe) return '';
    
    const newId = uuidv4();
    const now = new Date();
    
    const newRecipe: Recipe = {
      ...recipe,
      id: newId,
      name: `${recipe.name} (Copy)`,
      created: now,
      updated: now,
      stages: recipe.stages.map(stage => ({
        ...stage,
        id: uuidv4()
      })),
      flourTypes: recipe.flourTypes.map(flour => ({
        ...flour,
        id: uuidv4()
      }))
    };
    
    set((state) => ({
      recipes: [...state.recipes, newRecipe]
    }));
    
    return newId;
  },
  
  startBakeSession: (recipeId) => {
    const { recipes } = get();
    const recipe = recipes.find(r => r.id === recipeId);
    
    if (!recipe) return '';
    
    const id = uuidv4();
    const now = new Date();
    
    const newBakeSession: BakeSession = {
      id,
      recipeId,
      startTime: now,
      stageProgress: recipe.stages
        .filter(stage => stage.included)
        .map(stage => ({
          id: uuidv4(),
          stageId: stage.id,
          stageName: stage.name,
          startTime: new Date(),
          notes: '',
          completed: false
        })),
      photos: [],
      ratings: {
        crumb: 0,
        crust: 0,
        flavor: 0
      },
      notes: {
        wentWell: '',
        tryNext: ''
      },
      created: now,
      updated: now
    };
    
    set((state) => ({
      bakeSessions: [...state.bakeSessions, newBakeSession],
      currentBakeSession: newBakeSession
    }));
    
    return id;
  },
  
  updateBakeSession: (id, sessionData) => {
    set((state) => ({
      bakeSessions: state.bakeSessions.map((session) => 
        session.id === id 
          ? { ...session, ...sessionData, updated: new Date() } 
          : session
      ),
      currentBakeSession: state.currentBakeSession?.id === id 
        ? { ...state.currentBakeSession, ...sessionData, updated: new Date() }
        : state.currentBakeSession
    }));
  },
  
  completeBakeSession: (id, data) => {
    set((state) => ({
      bakeSessions: state.bakeSessions.map((session) => 
        session.id === id 
          ? { 
              ...session, 
              ...data, 
              endTime: new Date(),
              updated: new Date() 
            } 
          : session
      ),
      currentBakeSession: null
    }));
  },
  
  setCurrentBakeSession: (session) => {
    set({ currentBakeSession: session });
  },
  
  updateStageProgress: (bakeId, stageId, data) => {
    set((state) => ({
      bakeSessions: state.bakeSessions.map((session) => 
        session.id === bakeId 
          ? {
              ...session,
              stageProgress: session.stageProgress.map((progress) =>
                progress.id === stageId
                  ? { ...progress, ...data }
                  : progress
              ),
              updated: new Date()
            } 
          : session
      ),
      currentBakeSession: state.currentBakeSession?.id === bakeId 
        ? {
            ...state.currentBakeSession,
            stageProgress: state.currentBakeSession.stageProgress.map((progress) =>
              progress.id === stageId
                ? { ...progress, ...data }
                : progress
            ),
            updated: new Date()
          }
        : state.currentBakeSession
    }));
  },
  
  markStageComplete: (bakeId, stageId) => {
    const now = new Date();
    set((state) => ({
      bakeSessions: state.bakeSessions.map((session) => 
        session.id === bakeId 
          ? {
              ...session,
              stageProgress: session.stageProgress.map((progress) =>
                progress.id === stageId
                  ? { 
                      ...progress, 
                      completed: true,
                      endTime: now,
                      duration: progress.startTime 
                        ? (now.getTime() - progress.startTime.getTime()) / 1000 / 60
                        : undefined
                    }
                  : progress
              ),
              updated: now
            } 
          : session
      ),
      currentBakeSession: state.currentBakeSession?.id === bakeId 
        ? {
            ...state.currentBakeSession,
            stageProgress: state.currentBakeSession.stageProgress.map((progress) =>
              progress.id === stageId
                ? { 
                    ...progress, 
                    completed: true,
                    endTime: now,
                    duration: progress.startTime 
                      ? (now.getTime() - progress.startTime.getTime()) / 1000 / 60
                      : undefined
                  }
                : progress
            ),
            updated: now
          }
        : state.currentBakeSession
    }));
  },
  
  getDefaultStages: () => {
    return defaultStages.map(stage => ({
      ...stage,
      id: uuidv4()
    }));
  },
  
  getDefaultFlourTypes: () => {
    return recipeService.getDefaultFlourTypes().map(flour => ({
      ...flour,
      id: uuidv4()
    }));
  },
  
  getPreFermentTypes: () => recipeService.getPreFermentTypes(),
  getPreFermentDetails: (type: string) => recipeService.getPreFermentDetails(type)
}), {
  name: 'bread-master-storage',
  storage: createJSONStorage(() => ({
    getItem: (name) => {
      return storageService.getItem(name);
    },
    setItem: (name, value) => {
      return storageService.setItem(name, value);
    },
    removeItem: (name) => {
      return storageService.removeItem(name);
    }
  }))
}));

// Add a listener to sync state changes with our storage service
useStore.subscribe((state) => {
  // We only sync the recipes and bake sessions, not the current selections
  const { recipes, bakeSessions } = state;
  
  // Store recipes in our storage service
  storageService.setItem('recipes', recipes);
  
  // Store bake sessions in our storage service
  storageService.setItem('bakeSessions', bakeSessions);
});

export default useStore;