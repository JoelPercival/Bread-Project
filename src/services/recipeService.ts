import { Recipe, FlourType, YeastType, Ingredient } from '../types';

// Types for calculation results
export interface CalculationResult {
  ingredients: Ingredient[];
  errors: {
    negativeFlour?: boolean;
    negativeWater?: boolean;
    [key: string]: boolean | undefined;
  };
}

// Types for pre-ferment details
export interface PreFermentDetails {
  flourGrams: number;
  waterGrams: number;
  yeastGrams: number;
  percentage: number;
}

// Pre-ferment types and their details
const preFermentTypes: string[] = [
  'Sourdough',
  'Poolish',
  'Biga',
  'Pâte fermentée',
  'Levain',
];

// Pre-ferment details
type PreFermentDetailsMap = {
  [key: string]: PreFermentDetails;
};

const preFermentDetails: PreFermentDetailsMap = {
  'Sourdough': {
    flourGrams: 100,
    waterGrams: 100,
    yeastGrams: 0,
    percentage: 20
  },
  'Poolish': {
    flourGrams: 100,
    waterGrams: 100,
    yeastGrams: 0.5,
    percentage: 20
  },
  'Biga': {
    flourGrams: 100,
    waterGrams: 60,
    yeastGrams: 0.5,
    percentage: 20
  },
  'Pâte fermentée': {
    flourGrams: 100,
    waterGrams: 60,
    yeastGrams: 0.5,
    percentage: 20
  },
  'Levain': {
    flourGrams: 100,
    waterGrams: 100,
    yeastGrams: 0,
    percentage: 20
  }
};

/**
 * Recipe Service - Handles all recipe-related business logic
 */
class RecipeService {
  /**
   * Get the percentage of yeast based on yeast type
   * @param yeastType The type of yeast
   * @returns The percentage of yeast
   */
  getYeastPercentage(yeastType?: YeastType): number {
    switch (yeastType) {
      case 'Sourdough':
        return 20; // 20% starter
      case 'Instant':
        return 1;  // 1% instant yeast
      case 'Fresh':
        return 2;  // 2% fresh yeast
      default:
        return 0;
    }
  }

  /**
   * Get the available pre-ferment types
   * @returns Array of pre-ferment type names
   */
  getPreFermentTypes(): string[] {
    return [...preFermentTypes];
  }

  /**
   * Get the details for a specific pre-ferment type
   * @param type The pre-ferment type
   * @returns The pre-ferment details
   */
  getPreFermentDetails(type: string): PreFermentDetails {
    // Handle empty type or undefined
    if (!type || type === '') {
      return {
        flourGrams: 100,
        waterGrams: 100,
        yeastGrams: 0,
        percentage: 20
      };
    }
    
    // Return the pre-ferment details if they exist, otherwise return default values
    return preFermentDetails[type] || {
      flourGrams: 100,
      waterGrams: 100,
      yeastGrams: 0,
      percentage: 20
    };
  }

  /**
   * Format a number to a specified number of decimal places
   * @param num The number to format
   * @param decimals The number of decimal places
   * @returns The formatted number as a string
   */
  formatNumber(num: number, decimals: number = 0): string {
    return num.toFixed(decimals);
  }

  /**
   * Calculate the ingredients for a recipe based on baker's percentages
   * @param recipe The recipe to calculate ingredients for
   * @returns The calculated ingredients and any errors
   */
  calculateIngredients(recipe: Partial<Recipe>): CalculationResult {
    if (!recipe.doughWeight || !recipe.hydration || !recipe.saltPercentage || !recipe.flourTypes) {
      return { ingredients: [], errors: {} };
    }
    
    const { doughWeight, hydration, saltPercentage, flourTypes, yeastType, preFerment } = recipe;
    const activeFlourTypes = flourTypes.filter(flour => flour.percentage > 0);
    
    // Make sure flour percentages add up to 100%
    const totalFlourPercentage = activeFlourTypes.reduce((sum, flour) => sum + flour.percentage, 0);
    const normalizedFlourTypes = activeFlourTypes.map(flour => ({
      ...flour,
      percentage: (flour.percentage / totalFlourPercentage) * 100
    }));
    
    // Calculate total flour weight based on baker's percentages
    const totalPercentage = 100 + hydration + saltPercentage + this.getYeastPercentage(yeastType);
    const totalFlourWeight = (doughWeight || 0) * (100 / totalPercentage);
    
    // Calculate pre-ferment amounts if present
    let preFermentFlourWeight = 0;
    let preFermentWaterWeight = 0;
    let preFermentYeastWeight = 0;
    
    if (preFerment && preFerment.flourGrams && preFerment.percentage > 0) {
      // Calculate pre-ferment flour weight based on percentage of total flour
      preFermentFlourWeight = totalFlourWeight * (preFerment.percentage / 100);
      
      // Scale the pre-ferment ingredients to match the calculated flour weight
      const scaleFactor = preFermentFlourWeight / preFerment.flourGrams;
      preFermentWaterWeight = preFerment.waterGrams * scaleFactor;
      preFermentYeastWeight = preFerment.yeastGrams * scaleFactor;
    }
    
    // Create ingredients array with exact weights first
    const exactIngredients: {name: string; exactWeight: number; percentage: number}[] = [];
    
    // Add flour ingredients (subtract pre-ferment flour from main dough)
    normalizedFlourTypes.forEach(flour => {
      const flourWeight = totalFlourWeight * (flour.percentage / 100);
      // For the main flour type used in pre-ferment, subtract the pre-ferment flour
      if (preFerment && flour.name === 'Bread Flour' && preFermentFlourWeight > 0) {
        exactIngredients.push({
          name: flour.name,
          exactWeight: flourWeight - preFermentFlourWeight,
          percentage: flour.percentage
        });
      } else {
        exactIngredients.push({
          name: flour.name,
          exactWeight: flourWeight,
          percentage: flour.percentage
        });
      }
    });
    
    // Add water (subtract pre-ferment water from main dough)
    const totalWaterWeight = totalFlourWeight * (hydration / 100);
    exactIngredients.push({
      name: 'Water',
      exactWeight: totalWaterWeight - preFermentWaterWeight,
      percentage: hydration
    });
    
    // Add salt
    const saltWeight = totalFlourWeight * (saltPercentage / 100);
    exactIngredients.push({
      name: 'Salt',
      exactWeight: saltWeight,
      percentage: saltPercentage
    });
    
    // Add yeast (subtract pre-ferment yeast from main dough if using same yeast type)
    const yeastPercentage = this.getYeastPercentage(yeastType);
    if (yeastPercentage > 0) {
      const totalYeastWeight = totalFlourWeight * (yeastPercentage / 100);
      // Only subtract pre-ferment yeast if not using sourdough (which doesn't use commercial yeast)
      const adjustedYeastWeight = yeastType === 'Sourdough' ? 
        totalYeastWeight : 
        Math.max(0, totalYeastWeight - preFermentYeastWeight);
      
      exactIngredients.push({
        name: yeastType === 'Sourdough' ? 'Sourdough Starter' : `${yeastType} Yeast`,
        exactWeight: adjustedYeastWeight,
        percentage: yeastPercentage
      });
    }
    
    // Convert to rounded ingredients
    const ingredients: Ingredient[] = [];
    let runningTotal = 0;
    
    // First, calculate the sum of all exact weights
    const totalExactWeight = exactIngredients.reduce((sum, ing) => sum + ing.exactWeight, 0);
    
    // Calculate the scaling factor to adjust to target dough weight
    const scalingFactor = doughWeight / totalExactWeight;
    
    // Round all ingredients except the last one
    for (let i = 0; i < exactIngredients.length - 1; i++) {
      const ingredient = exactIngredients[i];
      // Scale and round the weight
      const roundedWeight = Math.round(ingredient.exactWeight * scalingFactor);
      ingredients.push({
        name: ingredient.name,
        weight: roundedWeight,
        unit: 'g',
        percentage: ingredient.percentage
      });
      runningTotal += roundedWeight;
    }
    
    // Make the last ingredient adjust to ensure total equals dough weight exactly
    const lastIngredient = exactIngredients[exactIngredients.length - 1];
    const lastIngredientWeight = doughWeight - runningTotal;
    
    ingredients.push({
      name: lastIngredient.name,
      weight: lastIngredientWeight,
      unit: 'g',
      percentage: lastIngredient.percentage
    });
  
    // Check for negative values in main dough
    const errors = {
      negativeFlour: false,
      negativeWater: false
    };
    
    // Check if any flour ingredient has a negative weight
    const flourIngredients = ingredients.filter(ing => 
      normalizedFlourTypes.some(flour => flour.name === ing.name));
    if (flourIngredients.some(ing => ing.weight < 0)) {
      errors.negativeFlour = true;
    }
    
    // Check if water has a negative weight
    const waterIngredient = ingredients.find(ing => ing.name === 'Water');
    if (waterIngredient && waterIngredient.weight < 0) {
      errors.negativeWater = true;
    }
    
    return { ingredients, errors };
  }

  /**
   * Get default flour types for a new recipe
   * @returns Array of default flour types
   */
  getDefaultFlourTypes(): FlourType[] {
    return [
      { id: '1', name: 'Bread Flour', percentage: 80 },
      { id: '2', name: 'Whole Wheat Flour', percentage: 20 },
      { id: '3', name: 'Rye Flour', percentage: 0 },
    ];
  }
}

// Export a singleton instance
export const recipeService = new RecipeService();
