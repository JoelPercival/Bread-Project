import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Card from '../../../components/UI/Card';
import Button from '../../../components/UI/Button';
import { ChevronDown, Save, PlayCircle, Undo, Redo } from 'lucide-react';
import { useRecipeStore } from '../store/recipeStore';
// The store has been migrated to feature-first structure, no need for the global store
import { Recipe, FlourType, YeastType, BakingStage } from '../../../types';
import { recipeService } from '../services/recipeService';
import FlourTypeSelector from './FlourTypeSelector';
import BakingStageEditor from './BakingStageEditor';
import CustomSlider from '../../../components/UI/CustomSlider';

interface RecipeFormProps {
  initialRecipe?: Partial<Recipe>;
  onSave?: (recipeId: string) => void;
  onStartBake?: (recipeId: string) => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({
  initialRecipe,
  onSave,
  onStartBake,
}) => {
  // Access functions directly from the recipe store
  const createRecipe = useRecipeStore(state => state.createRecipe);
  const updateRecipe = useRecipeStore(state => state.updateRecipe);
  const getPreFermentTypes = useRecipeStore(state => state.getPreFermentTypes);
  const getPreFermentDetails = useRecipeStore(state => state.getPreFermentDetails);
  
  // History state for undo/redo functionality
  const [history, setHistory] = useState<{
    past: Partial<Recipe>[];
    future: Partial<Recipe>[];
  }>({ past: [], future: [] });

  // Access the helper functions from the recipe store
  const getDefaultFlourTypesFunc = useRecipeStore(state => state.getDefaultFlourTypes);
  const getDefaultStagesFunc = useRecipeStore(state => state.getDefaultStages);
  
  // Get default values only once on component mount
  const handleUpdateFlourTypes = useCallback((newFlourTypes: FlourType[]) => getDefaultFlourTypesFunc(), []);
  const defaultStages = useMemo(() => getDefaultStagesFunc(), []);
  
  // Recipe state - initialize with default values and any provided initial recipe
  const [recipe, setRecipe] = useState<Partial<Recipe>>(() => ({
    name: 'New Bread Recipe',
    doughWeight: 1000,
    numberOfLoaves: 1,
    hydration: 70,
    flourTypes: handleUpdateFlourTypes([]),
    yeastType: 'Sourdough' as YeastType,
    saltPercentage: 2,
    stages: defaultStages,
    preFerment: {
      flour: '',
      flourGrams: 0,
      waterGrams: 0,
      yeastGrams: 0,
      percentage: 0,
    },
    ...initialRecipe,
  }));
  
  // Memoize the ingredient calculations to prevent unnecessary recalculations
  const { ingredients, calculationErrors } = useMemo(() => {
    try {
      const result = recipeService.calculateIngredients(recipe);
      return {
        ingredients: result.ingredients,
        calculationErrors: result.errors
      };
    } catch (error) {
      console.error('Error calculating ingredients:', error);
      return { ingredients: [], calculationErrors: ['Calculation error'] };
    }
  }, [recipe]); // Simplified dependency array to prevent excessive updates
  
  // Using recipeService.getYeastPercentage
  

  // Helper function to safely update pre-ferment
  const updatePreFerment = (updates: Partial<{
    flour: string;
    flourGrams: number;
    waterGrams: number;
    yeastGrams: number;
    percentage: number;
  }>) => {
    updateRecipeWithHistory(prev => {
      const currentPreFerment = prev.preFerment || {
        flour: '',
        flourGrams: 0,
        waterGrams: 0,
        yeastGrams: 0,
        percentage: 0
      };
      
      return {
        ...prev,
        preFerment: {
          ...currentPreFerment,
          ...updates
        }
      };
    });
  };
  
  // Memoize and update pre-ferment calculations when relevant values change
  const preFermentCalculations = useMemo(() => {
    if (recipe.preFerment?.percentage && recipe.doughWeight && recipe.flourTypes) {
      // Calculate total flour weight based on baker's percentages
      const totalPercentage = 100 + (recipe.hydration || 70) + (recipe.saltPercentage || 2) + recipeService.getYeastPercentage(recipe.yeastType);
      const totalFlourWeight = (recipe.doughWeight || 0) * (100 / totalPercentage);
      
      // Calculate pre-ferment flour weight based on percentage
      const preFermentFlourWeight = totalFlourWeight * (recipe.preFerment.percentage / 100);
      
      // Get the pre-ferment type and its hydration ratio
      const preFermentType = recipe.preFerment.flour || '';
      const preFermentDetails = getPreFermentDetails(preFermentType);
      const hydrationRatio = preFermentDetails.waterGrams / preFermentDetails.flourGrams;
      
      // Calculate values
      return {
        flourGrams: Math.round(preFermentFlourWeight),
        waterGrams: Math.round(preFermentFlourWeight * hydrationRatio),
        yeastGrams: preFermentDetails.yeastGrams > 0 
          ? Math.round(preFermentFlourWeight * (preFermentDetails.yeastGrams / preFermentDetails.flourGrams) * 10) / 10
          : 0
      };
    }
    return null;
  }, [recipe.preFerment?.percentage, recipe.doughWeight, recipe.flourTypes, recipe.hydration, recipe.saltPercentage, recipe.yeastType, recipe.preFerment?.flour]);
  
  // Apply pre-ferment calculations when they change
  useEffect(() => {
    if (preFermentCalculations) {
      // Update pre-ferment flour and water grams
      handleInputChange('preFerment.flourGrams', preFermentCalculations.flourGrams);
      handleInputChange('preFerment.waterGrams', preFermentCalculations.waterGrams);
      
      // Update yeast grams if applicable
      if (preFermentCalculations.yeastGrams > 0) {
        updatePreFerment({
          yeastGrams: preFermentCalculations.yeastGrams,
        });
      }
    }
  }, [preFermentCalculations]);
  
  // Undo the last recipe change
  const handleUndo = useCallback(() => {
    if (history.past.length === 0) return;
    
    const previous: Partial<Recipe> = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, history.past.length - 1);
    
    setHistory({
      past: newPast,
      future: [recipe, ...history.future]
    });
    
    setRecipe(previous);
  }, [history, recipe]);
  
  // Redo the last undone recipe change
  const handleRedo = useCallback(() => {
    if (history.future.length === 0) return;
    
    const next: Partial<Recipe> = history.future[0];
    const newFuture = history.future.slice(1);
    
    setHistory({
      past: [...history.past, recipe],
      future: newFuture
    });
    
    setRecipe(next);
  }, [history, recipe]);

  // Update recipe with history tracking
  const updateRecipeWithHistory = useCallback((updater: (prev: Partial<Recipe>) => Partial<Recipe>) => {
    setRecipe(prev => {
      // Save current state to history before updating
      setHistory(h => ({
        past: [...h.past, prev],
        future: [] // Clear redo stack when a new change is made
      }));
      
      // Apply the update
      return updater(prev);
    });
  }, []);

  const handleInputChange = (field: string, value: any) => {
    // Handle nested fields like 'preFerment.percentage'
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updateRecipeWithHistory(prev => {
        if (parent === 'preFerment') {
          const currentPreFerment = prev.preFerment || {
            flour: '',
            flourGrams: 0,
            waterGrams: 0,
            yeastGrams: 0,
            percentage: 0
          };
          
          return {
            ...prev,
            preFerment: {
              ...currentPreFerment,
              [child]: value
            }
          };
        } else if (parent === 'flourTypes') {
          const flourTypes = [...(prev.flourTypes || [])];
          return {
            ...prev,
            flourTypes
          };
        } else {
          return {
            ...prev,
            [parent]: { ...((prev as any)[parent] || {}), [child]: value }
          };
        }
      });
    } else {
      updateRecipeWithHistory(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleSave = () => {
    if (!recipe.name) return;
    
    if (recipe.id) {
      updateRecipe(recipe.id, recipe as Partial<Recipe>);
      if (onSave) onSave(recipe.id);
    } else {
      const id = createRecipe(recipe as Omit<Recipe, 'id' | 'created' | 'updated'>);
      if (onSave) onSave(id);
    }
  };
  
  const handleStartBake = () => {
    if (!recipe.name) return;
    
    if (recipe.id) {
      if (onStartBake) onStartBake(recipe.id);
    } else {
      const id = createRecipe(recipe as Omit<Recipe, 'id' | 'created' | 'updated'>);
      if (onStartBake) onStartBake(id);
    }
  };
  
  const breadTypes = [
    'Boule',
    'Baguette',
    'Focaccia',
    'Ciabatta',
    'Sandwich Loaf',
    'Pizza',
    'Rolls',
    'Other',
  ];
  
  const yeastTypes: YeastType[] = ['Sourdough', 'Instant', 'Fresh'];
  
  // Add type guard to check if calculationErrors is an object with the expected properties
  const hasNegativeFlour = typeof calculationErrors === 'object' && 
    !Array.isArray(calculationErrors) && 
    'negativeFlour' in calculationErrors && 
    calculationErrors.negativeFlour;
    
  const hasNegativeWater = typeof calculationErrors === 'object' && 
    !Array.isArray(calculationErrors) && 
    'negativeWater' in calculationErrors && 
    calculationErrors.negativeWater;
    
  const isFormValid = !!recipe.name && ingredients.length > 0 && !hasNegativeFlour && !hasNegativeWater;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6">
          <h2 className="font-serif text-xl text-bread-brown-800 mb-4">Basic Recipe Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-bread-brown-700 mb-1">
                Recipe Name
              </label>
              <input
                type="text"
                id="name"
                value={recipe.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-2 border border-bread-brown-300 rounded-md focus:ring-bread-crust focus:border-bread-crust"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="doughWeight" className="block text-sm font-medium text-bread-brown-700 mb-1">
                  Total Dough Weight (g)
                </label>
                <input
                  type="number"
                  id="doughWeight"
                  value={recipe.doughWeight || ''}
                  onChange={(e) => handleInputChange('doughWeight', Number(e.target.value))}
                  className="w-full p-2 border border-bread-brown-300 rounded-md focus:ring-bread-crust focus:border-bread-crust"
                />
              </div>
              
              <div>
                <label htmlFor="numberOfLoaves" className="block text-sm font-medium text-bread-brown-700 mb-1">
                  Number of Loaves
                </label>
                <input
                  type="number"
                  id="numberOfLoaves"
                  value={recipe.numberOfLoaves || ''}
                  onChange={(e) => handleInputChange('numberOfLoaves', Number(e.target.value))}
                  className="w-full p-2 border border-bread-brown-300 rounded-md focus:ring-bread-crust focus:border-bread-crust"
                />
              </div>
            </div>
            
            <div>
              <CustomSlider
                value={recipe.hydration || 70}
                onChange={(value: number) => handleInputChange('hydration', value)}
                min={50}
                max={100}
                step={1}
                className="w-full"
                valueFormatter={(value: number) => `${value}%`}
              />
            </div>
            
            <div>
              <CustomSlider
                value={recipe.saltPercentage || 2}
                onChange={(value: number) => handleInputChange('saltPercentage', value)}
                min={1}
                max={5}
                step={0.1}
                className="w-full"
                label="Salt %"
                valueFormatter={(value: number) => `${value}%`}
              />
            </div>
            
            <div>
              <label htmlFor="yeastType" className="block text-sm font-medium text-bread-brown-700 mb-1">
                Yeast Type
              </label>
              <div className="relative">
                <select
                  id="yeastType"
                  value={recipe.yeastType}
                  onChange={(e) => handleInputChange('yeastType', e.target.value as YeastType)}
                  className="w-full p-2 border border-bread-brown-300 rounded-md appearance-none focus:ring-bread-crust focus:border-bread-crust pr-10"
                >
                  {yeastTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  size={18} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bread-brown-400"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="preFermentType" className="block text-sm font-medium text-bread-brown-700 mb-1">
                Pre-ferment Type
              </label>
              <div className="relative">
                <select
                  id="preFermentType"
                  value={recipe.preFerment?.flour || ''}
                  onChange={(e) => {
                    try {
                      const selectedPreFermentType = e.target.value;
                      if (selectedPreFermentType) {
                        const preFermentDetails = getPreFermentDetails(selectedPreFermentType);
                        
                        // Update all pre-ferment values in a single state update to prevent partial updates
                        setRecipe(prev => ({
                          ...prev,
                          preFerment: {
                            flour: selectedPreFermentType,
                            flourGrams: preFermentDetails.flourGrams,
                            waterGrams: preFermentDetails.waterGrams,
                            yeastGrams: preFermentDetails.yeastGrams,
                            percentage: preFermentDetails.percentage
                          }
                        }));
                      } else {
                        // Handle empty selection
                        setRecipe(prev => ({
                          ...prev,
                          preFerment: {
                            flour: '',
                            flourGrams: 0,
                            waterGrams: 0,
                            yeastGrams: 0,
                            percentage: 0
                          }
                        }));
                      }
                    } catch (error) {
                      console.error('Error selecting pre-ferment type:', error);
                      // Fallback to empty pre-ferment
                      setRecipe(prev => ({
                        ...prev,
                        preFerment: {
                          flour: '',
                          flourGrams: 0,
                          waterGrams: 0,
                          yeastGrams: 0,
                          percentage: 0
                        }
                      }));
                    }
                  }}
                  className="w-full p-2 border border-bread-brown-300 rounded-md appearance-none focus:ring-bread-crust focus:border-bread-crust pr-10"
                >
                  <option value="">Select pre-ferment type</option>
                  {getPreFermentTypes().map((type: string) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <ChevronDown 
                  size={18} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bread-brown-400"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="breadType" className="block text-sm font-medium text-bread-brown-700 mb-1">
                Bread Type (Optional)
              </label>
              <div className="relative">
                <select
                  id="breadType"
                  value={recipe.breadType || ''}
                  onChange={(e) => handleInputChange('breadType', e.target.value)}
                  className="w-full p-2 border border-bread-brown-300 rounded-md appearance-none focus:ring-bread-crust focus:border-bread-crust pr-10"
                >
                  <option value="">Select a bread type</option>
                  {breadTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <Card className="p-6">
                <h3 className="font-serif text-xl text-bread-brown-800 mb-4">Pre-Ferment (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="preFermentPercentage" className="block text-sm font-medium text-bread-brown-700 mb-1">
                      Pre-ferment Percentage
                    </label>
                    <div className="relative">
                      <CustomSlider
                        value={recipe.preFerment?.percentage || 0}
                        onChange={(value: number) => handleInputChange('preFerment.percentage', value)}
                        min={0}
                        max={100}
                        step={1}
                        className="w-full"
                        valueFormatter={(value) => `${value}%`}
                      />
                      {/* Add proper type guards for calculationErrors */}
                      {((typeof calculationErrors === 'object' && 
                         !Array.isArray(calculationErrors) &&
                         ('negativeFlour' in calculationErrors && calculationErrors.negativeFlour || 
                          'negativeWater' in calculationErrors && calculationErrors.negativeWater))) && (
                        <div className="mt-2 text-red-600 text-sm font-medium">
                          Error: Pre-ferment percentage is too high. 
                          {typeof calculationErrors === 'object' && 
                           !Array.isArray(calculationErrors) &&
                           'negativeFlour' in calculationErrors &&
                           calculationErrors.negativeFlour && ' Not enough flour in main dough.'}
                          {typeof calculationErrors === 'object' && 
                           !Array.isArray(calculationErrors) &&
                           'negativeWater' in calculationErrors &&
                           calculationErrors.negativeWater && ' Not enough water in main dough.'}
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <label htmlFor="preFermentHydration" className="block text-sm font-medium text-bread-brown-700 mb-1">
                        Pre-ferment Hydration
                      </label>
                      <div className="relative">
                        <CustomSlider
                          value={recipe.preFerment?.waterGrams && recipe.preFerment?.flourGrams ? 
                            Math.round((recipe.preFerment.waterGrams / recipe.preFerment.flourGrams) * 100) : 100}
                          onChange={(value: number) => {
                            // Get current flour amount
                            const flourGrams = recipe.preFerment?.flourGrams || 0;
                            
                            // Calculate new water amount based on hydration
                            const waterGrams = Math.round(flourGrams * (value / 100));
                            
                            // Update water amount
                            handleInputChange('preFerment.waterGrams', waterGrams);
                          }}
                          min={0}
                          max={150}
                          step={1}
                          className="w-full"
                          valueFormatter={(value: number) => `${value}%`}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="bg-bread-crumb p-3 rounded-md">
                        <label className="block text-sm font-medium text-bread-brown-700 mb-1">
                          Flour
                        </label>
                        <div className="text-xl font-medium text-bread-brown-800">
                          {recipe.preFerment?.flourGrams || 0} g
                        </div>
                      </div>

                      <div className="bg-bread-crumb p-3 rounded-md">
                        <label className="block text-sm font-medium text-bread-brown-700 mb-1">
                          Water
                        </label>
                        <div className="text-xl font-medium text-bread-brown-800">
                          {recipe.preFerment?.waterGrams || 0} g
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="preFermentYeastGrams" className="block text-sm font-medium text-bread-brown-700 mb-1">
                        Yeast (g)
                      </label>
                      <input
                        type="number"
                        id="preFermentYeastGrams"
                        value={recipe.preFerment?.yeastGrams || ''}
                        onChange={(e) => handleInputChange('preFerment.yeastGrams', parseFloat(e.target.value))}
                        className="w-full p-2 border border-bread-brown-300 rounded-md focus:ring-bread-crust focus:border-bread-crust"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6">
              <Card className="p-6">
                <h3 className="font-serif text-xl text-bread-brown-800 mb-4">Flour Types</h3>
                <FlourTypeSelector
                  flourTypes={recipe.flourTypes || []}
                  onChange={(newFlourTypes: any) => handleInputChange('flourTypes', newFlourTypes)}
                  availableFlourTypes={getDefaultFlourTypesFunc()}
                />
              </Card>
            </div>
            <Card className="p-6">
              <h2 className="font-serif text-xl text-bread-brown-800 mb-4">Baking Process</h2>
              <BakingStageEditor
                stages={recipe.stages || []}
                onChange={(stages: any) => handleInputChange('stages', stages)}
              />
            </Card>
          </div>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        <div className="sticky top-24">
          <Card className="p-6">
            <h2 className="font-serif text-xl text-bread-brown-800 mb-4">Recipe Summary</h2>
            
            <div className="mb-6">
              <h3 className="text-bread-brown-700 font-medium mb-2">Ingredients</h3>
              <ul className="space-y-2">
                {ingredients
                  .filter((ingredient: { name: string; weight: number; percentage?: number }) => ingredient.name !== 'Sourdough Starter')
                  .map((ingredient: { name: string; weight: number; percentage?: number }) => (
                    <li key={ingredient.name} className="flex justify-between text-sm">
                      <span>{ingredient.name}</span>
                      <span className="font-medium">
                        {ingredient.weight} g
                        {ingredient.percentage ? (
                          <span className="text-xs text-bread-brown-500 ml-1">
                            ({recipeService.formatNumber(ingredient.percentage)}%)
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                {recipe.preFerment?.flourGrams ? (
                  <li key="pre-ferment" className="flex justify-between text-sm">
                    <span>Pre-ferment</span>
                    <span className="font-medium">
                      {recipe.preFerment.flourGrams + (recipe.preFerment.waterGrams || 0)} g
                      {recipe.preFerment.percentage ? (
                        <span className="text-xs text-bread-brown-500 ml-1">
                          ({recipeService.formatNumber(recipe.preFerment.percentage)}%)
                        </span>
                      ) : null}
                    </span>
                  </li>
                ) : null}
              </ul>
              <div className="mt-4 pt-4 border-t border-bread-brown-200">
                {/* Undo/Redo history controls */}
                <div className="flex justify-end mb-2">
                  <div className="flex space-x-1">
                    <Button 
                      onClick={handleUndo} 
                      variant="outline" 
                      disabled={history.past.length === 0}
                    >
                      <Undo className={`w-4 h-4 ${history.past.length === 0 ? 'text-gray-400' : 'text-bread-brown-600'}`} />
                    </Button>
                    <Button 
                      onClick={handleRedo} 
                      variant="outline" 
                      disabled={history.future.length === 0}
                    >
                      <Redo className={`w-4 h-4 ${history.future.length === 0 ? 'text-gray-400' : 'text-bread-brown-600'}`} />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-bread-brown-700">Total Dough Weight:</span>
                  <span className="font-bold text-bread-brown-800">
                    {recipe.doughWeight} g
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-bread-brown-700 font-medium mb-2">Baking Stages</h3>
              <ol className="space-y-2 list-decimal list-inside">
                {(recipe.stages || []).map((stage: BakingStage) => (
                  <li key={stage.id} className="text-sm">
                    {stage.name}
                  </li>
                ))}
              </ol>
            </div>
            
            <div className="space-y-2">
              <Button
                variant="primary"
                fullWidth
                onClick={handleSave}
                disabled={!isFormValid}
                icon={<Save size={18} />}
              >
                Save Recipe
              </Button>
              
              <Button
                variant="secondary"
                fullWidth
                onClick={handleStartBake}
                disabled={!isFormValid}
                icon={<PlayCircle size={18} />}
              >
                Start Bake
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
};

export default RecipeForm;
