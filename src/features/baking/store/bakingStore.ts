import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { BakeSession, BakingStage, StageProgress } from '../../../types';
import { useRecipeStore } from '../../recipes/store/recipeStore';
import { customStorage } from '../../../shared/store/storage';
import { createItemSelector, createMemoizedSelector } from '../../../shared/store/selector';

interface BakingState {
  bakeSessions: BakeSession[];
  currentBakeSession: BakeSession | null;
  
  // Bake session actions
  startBakeSession: (recipeId: string) => string;
  updateBakeSession: (id: string, session: Partial<BakeSession>) => void;
  completeBakeSession: (id: string, data: Partial<BakeSession>) => void;
  setCurrentBakeSession: (session: BakeSession | null) => void;
  
  // Baking stage actions
  updateStageProgress: (bakeId: string, stageId: string, data: Partial<StageProgress>) => void;
  markStageComplete: (bakeId: string, stageId: string) => void;
  
  // Helper functions
  getDefaultStages: () => BakingStage[];
}

// Default baking stages - using static IDs to ensure consistency
const defaultStages: BakingStage[] = [
  { id: 'stage-autolyse', name: 'Autolyse', order: 0, included: true, description: 'Mix flour and water, rest to hydrate flour' },
  { id: 'stage-mix', name: 'Mix', order: 1, included: true, description: 'Add remaining ingredients and mix until combined' },
  { id: 'stage-bulk-ferment', name: 'Bulk Ferment', order: 2, included: true, description: 'Let dough rise at room temperature' },
  { id: 'stage-shape', name: 'Shape', order: 3, included: true, description: 'Divide and shape dough' },
  { id: 'stage-proof', name: 'Proof', order: 4, included: true, description: 'Final rise before baking' },
  { id: 'stage-bake', name: 'Bake', order: 5, included: true, description: 'Bake until golden brown' },
];

export const useBakingStore = create<BakingState>()(
  persist(
    (set, get) => ({
      bakeSessions: [],
      currentBakeSession: null,
      
      startBakeSession: (recipeId) => {
        // Access recipe store's state directly instead of using the memoized selector
        const recipesState = useRecipeStore.getState();
        const recipe = recipesState.recipes?.find(r => r.id === recipeId);
        
        if (!recipe) {
          throw new Error(`Recipe with id ${recipeId} not found`);
        }
        
        const now = new Date();
        // Use recipe stages if available, otherwise use default stages
        const stages = Array.isArray(recipe.stages) && recipe.stages.length > 0 
          ? recipe.stages 
          : get().getDefaultStages();
        
        // Create stage progress from recipe stages with proper TypeScript safety
        const stageProgress: StageProgress[] = Array.isArray(stages) 
          ? stages
            .filter(stage => {
              // Include stages that have included=true or if included is undefined (for backward compatibility)
              return stage.included === true || stage.included === undefined;
            }) 
            .sort((a, b) => a.order - b.order)
            .map((stage, index) => ({
            id: stage.id,
            stageId: stage.id, // Add stageId to match interface
            stageName: stage.name,
            notes: '',
            completed: false,
            included: true, // Always set included to true for the stages we're using
            startTime: index === 0 ? now : undefined,
            endTime: undefined,
            duration: undefined,
            elapsedSeconds: 0, // Initialize elapsed time for timer persistence
            lastUpdated: now, // Initialize last updated time
            order: stage.order
          }))
          : [];
        
        const newBakeSession: BakeSession = {
          id: uuidv4(),
          recipeId,
          created: now,
          updated: now,
          startTime: now,
          endTime: undefined,
          stageProgress,
          ratings: {
            crumb: 0,
            crust: 0,
            flavor: 0
          },
          notes: {
            wentWell: '',
            tryNext: ''
          },
          photos: []
        };
        
        set((state) => ({
          bakeSessions: [...state.bakeSessions, newBakeSession],
          currentBakeSession: newBakeSession
        }));
        
        return newBakeSession.id;
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
        set((state) => {
          // Find the session
          const session = state.bakeSessions.find(s => s.id === bakeId);
          if (!session) return state;
          
          // Find the current stage and its index
          const stageIndex = session.stageProgress.findIndex(p => p.id === stageId);
          if (stageIndex === -1) return state;
          
          // Calculate the next stage index
          const nextStageIndex = stageIndex + 1;
          const hasNextStage = nextStageIndex < session.stageProgress.length;
          
          // Update the bake sessions
          const updatedBakeSessions = state.bakeSessions.map((session) => 
            session.id === bakeId 
              ? {
                  ...session,
                  stageProgress: session.stageProgress.map((progress, index) => {
                    // Mark the current stage as complete
                    if (progress.id === stageId) {
                      return { 
                        ...progress, 
                        completed: true,
                        endTime: now,
                        duration: progress.startTime && progress.startTime instanceof Date 
                          ? (now.getTime() - progress.startTime.getTime()) / 1000 / 60
                          : undefined
                      };
                    }
                    // Set start time for the next stage
                    if (hasNextStage && index === nextStageIndex) {
                      return {
                        ...progress,
                        startTime: now
                      };
                    }
                    // Return other stages unchanged
                    return progress;
                  }),
                  updated: now
                } 
              : session
          );
          
          // Update current bake session if it's the active one
          const updatedCurrentBakeSession = state.currentBakeSession?.id === bakeId 
            ? {
                ...state.currentBakeSession,
                stageProgress: state.currentBakeSession.stageProgress.map((progress, index) => {
                  // Mark the current stage as complete
                  if (progress.id === stageId) {
                    return { 
                      ...progress, 
                      completed: true,
                      endTime: now,
                      duration: progress.startTime && progress.startTime instanceof Date 
                        ? (now.getTime() - progress.startTime.getTime()) / 1000 / 60
                        : undefined
                    };
                  }
                  // Set start time for the next stage
                  if (hasNextStage && index === nextStageIndex) {
                    return {
                      ...progress,
                      startTime: now
                    };
                  }
                  // Return other stages unchanged
                  return progress;
                }),
                updated: now
              }
            : state.currentBakeSession;
          
          return {
            bakeSessions: updatedBakeSessions,
            currentBakeSession: updatedCurrentBakeSession
          };
        });
      },
      
      getDefaultStages: () => {
        return defaultStages.map(stage => ({
          ...stage,
          id: uuidv4()
        }));
      }
    }),
    {
      name: 'bread-master-baking',
      storage: customStorage
    }
  )
);

// Export optimized selectors for better performance

// Selector for getting a bake session by ID (memoized for performance)
export const getBakeSessionById = createItemSelector(useBakingStore, state => state.bakeSessions);

// Memoized selector for getting bake sessions by recipe ID
export const getBakeSessionsByRecipeId = (recipeId: string): BakeSession[] => {
  return createMemoizedSelector(
    useBakingStore,
    state => ({ sessions: state.bakeSessions, id: recipeId }),
    ({ sessions, id }) => {
      if (!id) return sessions;
      return sessions.filter(session => session.recipeId === id);
    }
  )();
};

// Memoized selector for getting active baking sessions
export const getActiveBakeSessions = createMemoizedSelector(
  useBakingStore,
  state => state.bakeSessions,
  (sessions) => sessions.filter(session => !session.endTime)
);

// Memoized selector for getting completed baking sessions
export const getCompletedBakeSessions = createMemoizedSelector(
  useBakingStore,
  state => state.bakeSessions,
  (sessions) => sessions.filter(session => !!session.endTime)
);
