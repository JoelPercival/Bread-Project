import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import { useRecipeStore } from '../../recipes/store/recipeStore';
import { useBakingStore } from '../store/bakingStore';
import { BakingStage } from '../../../types';
import { ArrowRight, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';

const StageSelectionPage: React.FC = () => {
  const { recipeId } = useParams<{ recipeId?: string }>();
  const navigate = useNavigate();
  
  // Get recipe and store functions
  const recipes = useRecipeStore(state => state.recipes);
  const defaultStages = useBakingStore(state => state.getDefaultStages());
  
  // Get the recipe or use undefined if not found
  const recipe = recipeId && Array.isArray(recipes) 
    ? recipes.find(r => r.id === recipeId) 
    : undefined;
  
  // Create the initial stages - all selected by default
  const initialStages = (() => {
    // Determine which stages to use
    const baseStages = (Array.isArray(recipe?.stages) && recipe.stages.length > 0)
      ? recipe.stages
      : defaultStages;
    
    // Debug: See what stages we're starting with
    console.log('Base stages:', baseStages);
      
    // Return a copy with all stages marked as included
    const stages = baseStages.map(stage => ({
      ...stage,
      included: true // Force all stages to be included by default
    }));
    
    // Debug: See what our initial stages look like
    console.log('Initial stages (all included):', stages);
    return stages;
  })();
  
  // Stage selection state
  const [selectedStages, setSelectedStages] = useState<BakingStage[]>(initialStages);
  
  // Toggle a stage's selection
  const toggleStage = (stageId: string) => {
    setSelectedStages(prevStages => {
      const newStages = prevStages.map(stage => {
        if (stage.id === stageId) {
          // Toggle the included property and ensure it's a boolean
          const newIncluded = stage.included === true ? false : true;
          console.log(`Toggling stage ${stage.name || stage.id}: ${stage.included} → ${newIncluded}`);
          return { ...stage, included: newIncluded };
        }
        return stage;
      });
      console.log('Updated stages after toggle:', newStages);
      return newStages;
    });
  };
  
  // Start the baking session with the selected stages
  const handleStartBake = () => {
    if (!recipeId) return;
    
    // Log what we're about to save
    console.log('Selected stages being saved:', selectedStages);
    
    // Update the recipe with our stage selection
    const updateRecipe = useRecipeStore.getState().updateRecipe;
    if (recipe) {
      updateRecipe(recipe.id, { stages: selectedStages });
    }
    
    // Start the bake session with the selected stages
    const startBakeSession = useBakingStore.getState().startBakeSession;
    const bakeSessionId = startBakeSession(recipeId);
    
    // Navigate to the bake timer
    navigate(`/timings/${bakeSessionId}`);
  };
  
  return (
    <Layout title="Select Baking Stages">
      <div className="space-y-6">
        <Button
          variant="outline"
          size="sm"
          className="mb-6"
          onClick={() => navigate(`/recipes/${recipeId}`)}
          icon={<ArrowLeft size={16} />}
        >
          Back to Recipe
        </Button>
        
        <p className="text-gray-600 mb-4">
          All stages are selected by default. Unselect any stages you don't want to include in this bake.
        </p>
        
        <div className="space-y-4">
          {selectedStages.map((stage) => (
            <Card 
              key={stage.id} 
              className={`cursor-pointer ${stage.included === true ? 'border-green-500 border-2' : 'border hover:border-gray-300'}`} 
              onClick={() => toggleStage(stage.id)}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{stage.name}</h3>
                  {stage.description && (
                    <p className="text-gray-600 text-sm mt-1">{stage.description}</p>
                  )}
                </div>
                <div className="ml-4">
                  {stage.included === true ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-400" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-end space-x-4 mt-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/recipes/${recipeId}`)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleStartBake}
            icon={<ArrowRight className="ml-2 h-4 w-4" />}
            disabled={!selectedStages.some(stage => stage.included)}
          >
            Start Baking
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default StageSelectionPage;
