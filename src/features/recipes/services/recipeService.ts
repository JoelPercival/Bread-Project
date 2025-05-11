import { Recipe, FlourType, YeastType, Ingredient } from '../../../types';

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
    waterGrams: 70,
    yeastGrams: 1,
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
    if (!yeastType) return 0.5; // Default to instant yeast
    
    switch (yeastType) {
      case 'Sourdough':
        return 0; // Sourdough starter is calculated separately
      case 'Fresh':
        return 1.5; // Fresh yeast typically uses more weight
      case 'Instant':
        return 0.5; // Instant dry yeast
      default:
        return 0.5; // Default to instant yeast
    }
  }
  
  /**
   * Get the available pre-ferment types
   * @returns Array of pre-ferment type names
   */
  getPreFermentTypes(): string[] {
    return preFermentTypes;
  }
  
  /**
   * Get the details for a specific pre-ferment type
   * @param type The pre-ferment type
   * @returns The pre-ferment details
   */
  getPreFermentDetails(type: string): PreFermentDetails {
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
    const result: CalculationResult = {
      ingredients: [],
      errors: {}
    };
    
    // Early return if we don't have the minimal required values
    if (!recipe.doughWeight || !recipe.flourTypes || recipe.flourTypes.length === 0) {
      return result;
    }
    
    // Get baker's percentages
    const hydration = recipe.hydration || 70;
    const saltPercentage = recipe.saltPercentage || 2;
    const yeastPercentage = this.getYeastPercentage(recipe.yeastType);
    
    // Calculate sum of percentages (flour is always 100%)
    const totalPercentage = 100 + hydration + saltPercentage + yeastPercentage;
    
    // Calculate flour weight based on dough weight and baker's percentages
    const totalFlourWeight = (recipe.doughWeight * 100) / totalPercentage;
    
    // Check if we have a pre-ferment and calculate main dough ingredients
    let preFermentFlourWeight = 0;
    let preFermentWaterWeight = 0;
    
    if (recipe.preFerment?.flour && recipe.preFerment.percentage > 0) {
      preFermentFlourWeight = recipe.preFerment.flourGrams || 0;
      preFermentWaterWeight = recipe.preFerment.waterGrams || 0;
    }
    
    // Error checking for negative values
    const mainDoughFlourWeight = totalFlourWeight - preFermentFlourWeight;
    const mainDoughWaterWeight = (totalFlourWeight * hydration / 100) - preFermentWaterWeight;
    
    if (mainDoughFlourWeight < 0) {
      result.errors.negativeFlour = true;
    }
    
    if (mainDoughWaterWeight < 0) {
      result.errors.negativeWater = true;
    }
    
    // Add flour types as ingredients
    if (recipe.flourTypes) {
      // Sort flour types by percentage (highest first)
      const sortedFlours = [...recipe.flourTypes]
        .filter(flour => flour.percentage > 0)
        .sort((a, b) => b.percentage - a.percentage);
      
      // Add each flour as an ingredient
      sortedFlours.forEach(flour => {
        const flourWeight = (totalFlourWeight * flour.percentage) / 100;
        result.ingredients.push({
          name: flour.name,
          weight: Math.round(flourWeight),
          percentage: flour.percentage
        });
      });
    }
    
    // Add water
    result.ingredients.push({
      name: 'Water',
      weight: Math.round((totalFlourWeight * hydration) / 100),
      percentage: hydration
    });
    
    // Add salt
    result.ingredients.push({
      name: 'Salt',
      weight: Math.round((totalFlourWeight * saltPercentage) / 100),
      percentage: saltPercentage
    });
    
    // Add yeast if not using sourdough
    if (recipe.yeastType !== 'Sourdough') {
      result.ingredients.push({
        name: `${recipe.yeastType || 'Instant'} Yeast`,
        weight: Math.round((totalFlourWeight * yeastPercentage) / 100),
        percentage: yeastPercentage
      });
    }
    
    return result;
  }
  
  /**
   * Get default flour types for a new recipe
   * @returns Array of default flour types
   */
  getDefaultFlourTypes(): FlourType[] {
    return [
      {
        id: '1',
        name: 'Bread Flour',
        percentage: 80,
        protein: 12.5
      },
      {
        id: '2',
        name: 'Whole Wheat Flour',
        percentage: 20,
        protein: 14
      },
      {
        id: '3',
        name: 'Rye Flour',
        percentage: 0,
        protein: 9
      },
      {
        id: '4',
        name: 'All-Purpose Flour',
        percentage: 0,
        protein: 11
      }
    ];
  }
}

// Export a singleton instance
export const recipeService = new RecipeService();
