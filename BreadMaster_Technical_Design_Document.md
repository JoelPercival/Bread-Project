# BreadMaster: Bread Recipe Calculator
## Technical Design Document

**Author:** Joel Percival  
**Date:** May 10, 2025  
**Version:** 1.0

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [Frontend Implementation](#frontend-implementation)
4. [State Management](#state-management)
5. [Data Models](#data-models)
6. [Core Calculation Logic](#core-calculation-logic)
7. [Component Structure](#component-structure)
8. [User Interface Design](#user-interface-design)
9. [Error Handling](#error-handling)
10. [Future Enhancements](#future-enhancements)

---

## 1. Introduction

BreadMaster is a specialized web application designed for bread baking enthusiasts. It provides a sophisticated calculator for bread recipes, allowing users to precisely control ingredient proportions using baker's percentages, manage pre-ferments, and track the baking process.

### 1.1 Project Objectives

- Create an intuitive interface for bread recipe calculation
- Implement baker's percentage calculations for accurate recipe scaling
- Support pre-ferment management with various types (sourdough, poolish, biga, etc.)
- Enable recipe storage and retrieval
- Provide baking session tracking

### 1.2 Technology Stack

- **Frontend Framework**: React with TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Package Manager**: npm

---

## 2. System Architecture

BreadMaster follows a client-side architecture with local storage persistence. The application is structured as a single-page application (SPA) with component-based design principles.

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────┐
│             User Interface          │
│  ┌─────────────┐    ┌─────────────┐ │
│  │   Recipe    │    │    Bake     │ │
│  │ Components  │    │ Components  │ │
│  └─────────────┘    └─────────────┘ │
├─────────────────────────────────────┤
│           State Management          │
│  ┌─────────────┐    ┌─────────────┐ │
│  │   Recipe    │    │    Bake     │ │
│  │    Store    │    │    Store    │ │
│  └─────────────┘    └─────────────┘ │
├─────────────────────────────────────┤
│           Core Calculations         │
│  ┌─────────────┐    ┌─────────────┐ │
│  │  Baker's %  │    │ Pre-ferment │ │
│  │ Calculator  │    │ Calculator  │ │
│  └─────────────┘    └─────────────┘ │
├─────────────────────────────────────┤
│              Persistence            │
│  ┌─────────────────────────────────┐│
│  │        Local Storage            ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### 2.2 Data Flow

1. User interacts with UI components
2. Components dispatch actions to the store
3. Store updates state and triggers re-renders
4. Calculation utilities process recipe data
5. Updated state is persisted to local storage
6. UI reflects the current state

---

## 3. Frontend Implementation

### 3.1 Project Structure

```
project/
├── public/
│   └── bread-icon.svg
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   ├── Recipe/
│   │   └── UI/
│   ├── pages/
│   ├── store/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── package.json
└── vite.config.ts
```

### 3.2 Key Directories

- **components/**: Reusable UI components
  - **Layout/**: Page layout components
  - **Recipe/**: Recipe-specific components
  - **UI/**: Generic UI components (buttons, cards, etc.)
- **pages/**: Page components for routing
- **store/**: Zustand store implementation
- **types/**: TypeScript type definitions
- **utils/**: Utility functions and calculations

---

## 4. State Management

BreadMaster uses Zustand for state management, providing a simple yet powerful approach to managing application state.

### 4.1 Store Implementation

The main store is implemented in `src/store/index.ts` and includes:

```typescript
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
```

### 4.2 Persistence

The store uses Zustand's persist middleware to save state to local storage:

```typescript
const useStore = create(
  persist<AppState>(
    (set, get) => ({
      // Store implementation
    }),
    {
      name: 'bread-master-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

---

## 5. Data Models

### 5.1 Core Data Types

The application uses several key data types defined in `src/types/index.ts`:

#### 5.1.1 Recipe

```typescript
export interface Recipe {
  id: string;
  name: string;
  doughWeight: number;
  numberOfLoaves: number;
  hydration: number;
  flourTypes: FlourType[];
  yeastType: YeastType;
  saltPercentage: number;
  breadType?: string;
  stages: BakingStage[];
  preFerment?: {
    flour: string;
    flourGrams: number;
    waterGrams: number;
    yeastGrams: number;
    percentage: number;
  };
  created: Date;
  updated: Date;
}
```

#### 5.1.2 FlourType

```typescript
export interface FlourType {
  id: string;
  name: string;
  percentage: number;
}
```

#### 5.1.3 YeastType

```typescript
export type YeastType = 'Sourdough' | 'Instant' | 'Fresh';
```

#### 5.1.4 BakingStage

```typescript
export interface BakingStage {
  id: string;
  name: string;
  order: number;
  included: boolean;
  description?: string;
}
```

#### 5.1.5 BakeSession

```typescript
export interface BakeSession {
  id: string;
  recipeId: string;
  startTime: Date;
  endTime?: Date;
  stageProgress: StageProgress[];
  photos: string[];
  ratings: {
    crumb: number;
    crust: number;
    flavor: number;
  };
  notes: {
    wentWell: string;
    tryNext: string;
  };
  created: Date;
  updated: Date;
}
```

#### 5.1.6 StageProgress

```typescript
export interface StageProgress {
  id: string;
  stageId: string;
  stageName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  notes: string;
  completed: boolean;
}
```

#### 5.1.7 Ingredient

```typescript
export interface Ingredient {
  name: string;
  weight: number;
  unit: string;
  percentage?: number;
}
```

---

## 6. Core Calculation Logic

The heart of the application is the calculation logic implemented in `src/utils/calculations.ts`.

### 6.1 Baker's Percentage Calculations

Baker's percentages are a way of expressing ingredient quantities as a percentage of the total flour weight (which is always considered 100%). This allows for easy scaling and consistency in bread recipes.

```typescript
export const calculateIngredients = (recipe: Partial<Recipe>): CalculationResult => {
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
  const totalPercentage = 100 + hydration + saltPercentage + getYeastPercentage(yeastType);
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
  const yeastPercentage = getYeastPercentage(yeastType);
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
  
  // Convert to rounded ingredients with scaling to match target weight
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
};
```

### 6.2 Pre-ferment Handling

Pre-ferments (like sourdough starter, poolish, and biga) are handled with special care to ensure accurate calculations:

```typescript
// Pre-ferment types and their details
const preFermentTypes: string[] = [
  'Sourdough',
  'Poolish',
  'Biga',
  'Pâte fermentée',
  'Levain',
];

// Pre-ferment details
type PreFermentDetails = {
  [key: string]: {
    flourGrams: number;
    waterGrams: number;
    yeastGrams: number;
    percentage: number;
  }
};

const preFermentDetails: PreFermentDetails = {
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

// Get pre-ferment details
const getPreFermentDetails = (type: string) => {
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
};
```

### 6.3 Yeast Percentage Calculation

Different yeast types require different percentages:

```typescript
export const getYeastPercentage = (yeastType?: string): number => {
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
};
```

---

## 7. Component Structure

### 7.1 Key Components

#### 7.1.1 RecipeForm

The RecipeForm component (`src/components/Recipe/RecipeForm.tsx`) is the central component for recipe creation and editing. It handles:

- Input for recipe parameters (name, weight, hydration, etc.)
- Flour type selection
- Pre-ferment configuration
- Baking stage customization
- Real-time calculation of ingredient weights

```typescript
const RecipeForm: React.FC<RecipeFormProps> = ({
  initialRecipe,
  onSave,
  onStartBake,
}) => {
  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    name: 'New Bread Recipe',
    doughWeight: 1000,
    numberOfLoaves: 1,
    hydration: 70,
    flourTypes: getDefaultFlourTypes(),
    yeastType: 'Sourdough',
    saltPercentage: 2,
    stages: getDefaultStages(),
    preFerment: {
      flour: '',
      flourGrams: 0,
      waterGrams: 0,
      yeastGrams: 0,
      percentage: 0,
    },
    ...initialRecipe,
  });
  
  const [ingredients, setIngredients] = useState<ReturnType<typeof calculateIngredients>['ingredients']>([]);
  const [calculationErrors, setCalculationErrors] = useState<ReturnType<typeof calculateIngredients>['errors']>({});
  
  // Effect to calculate ingredients when recipe changes
  useEffect(() => {
    const result = calculateIngredients(recipe);
    setIngredients(result.ingredients);
    setCalculationErrors(result.errors);
  }, [recipe.doughWeight, recipe.flourTypes, recipe.hydration, recipe.saltPercentage, recipe.preFerment?.percentage, recipe.preFerment?.flourGrams, recipe.preFerment?.waterGrams, recipe.preFerment?.yeastGrams, recipe.preFerment?.flour]);
  
  // Effect to update pre-ferment values when percentage changes
  useEffect(() => {
    if (recipe.preFerment?.percentage && recipe.doughWeight && recipe.flourTypes) {
      // Calculate total flour weight based on baker's percentages
      const totalPercentage = 100 + (recipe.hydration || 70) + (recipe.saltPercentage || 2) + getYeastPercentage(recipe.yeastType);
      const totalFlourWeight = (recipe.doughWeight || 0) * (100 / totalPercentage);
      
      // Calculate pre-ferment flour weight based on percentage
      const preFermentFlourWeight = totalFlourWeight * (recipe.preFerment.percentage / 100);
      
      // Get the pre-ferment type and its hydration ratio
      const preFermentType = recipe.preFerment.flour || '';
      const preFermentDetails = getPreFermentDetails(preFermentType);
      const hydrationRatio = preFermentDetails.waterGrams / preFermentDetails.flourGrams;
      
      // Update pre-ferment flour and water grams
      handleInputChange('preFerment.flourGrams', Math.round(preFermentFlourWeight));
      handleInputChange('preFerment.waterGrams', Math.round(preFermentFlourWeight * hydrationRatio));
      
      // Update yeast grams if applicable
      if (preFermentDetails.yeastGrams > 0) {
        const yeastRatio = preFermentDetails.yeastGrams / preFermentDetails.flourGrams;
        updatePreFerment({
          yeastGrams: Math.round(preFermentFlourWeight * yeastRatio * 10) / 10,
        });
      }
    }
  }, [recipe.preFerment?.percentage, recipe.doughWeight, recipe.flourTypes, recipe.hydration, recipe.saltPercentage, recipe.yeastType]);
  
  // Input change handler with type-safe approach for nested fields
  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setRecipe(prev => {
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
      setRecipe(prev => ({ ...prev, [field]: value }));
    }
  };
  
  // Helper function to safely update pre-ferment
  const updatePreFerment = (updates: Partial<{
    flour: string;
    flourGrams: number;
    waterGrams: number;
    yeastGrams: number;
    percentage: number;
  }>) => {
    setRecipe(prev => {
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
  
  // Render UI
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recipe inputs */}
      {/* Pre-ferment section */}
      {/* Flour types section */}
      {/* Recipe summary */}
    </div>
  );
};
```

#### 7.1.2 FlourTypeSelector

The FlourTypeSelector component (`src/components/Recipe/FlourTypeSelector.tsx`) allows users to adjust the percentages of different flour types in their recipe.

#### 7.1.3 BakingStageEditor

The BakingStageEditor component (`src/components/Recipe/BakingStageEditor.tsx`) provides a drag-and-drop interface for customizing the baking stages.

### 7.2 UI Components

The application includes several reusable UI components:

- **Button**: Customizable button with variants
- **Card**: Container with consistent styling
- **Slider**: Custom range input with label and value display

---

## 8. User Interface Design

### 8.1 Design Principles

The UI follows these key principles:

1. **Clarity**: Clear presentation of baker's percentages and weights
2. **Responsiveness**: Adapts to different screen sizes
3. **Immediate feedback**: Real-time calculation updates
4. **Visual hierarchy**: Important information is emphasized

### 8.2 Color Scheme

The application uses a bread-themed color palette:

```css
colors: {
  'bread-crust': '#8B4513',
  'bread-crumb': '#F5DEB3',
  'bread-brown': {
    50: '#FAF5EF',
    100: '#F5EAD8',
    200: '#EAD5B2',
    300: '#DFBF8C',
    400: '#D4AA66',
    500: '#C99540',
    600: '#A17733',
    700: '#795926',
    800: '#513C1A',
    900: '#281E0D',
  },
}
```

### 8.3 Layout Structure

The application uses a responsive grid layout:

```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2 space-y-6">
    {/* Recipe inputs */}
  </div>
  <div className="lg:col-span-1">
    <div className="sticky top-24">
      {/* Recipe summary */}
    </div>
  </div>
</div>
```

---

## 9. Error Handling

### 9.1 Validation

The application includes several validation mechanisms:

1. **Pre-ferment percentage validation**: Ensures the pre-ferment percentage doesn't result in negative main dough ingredients
2. **Flour percentage validation**: Ensures flour percentages add up to 100%
3. **Input validation**: Ensures required fields have valid values

### 9.2 Error Display

Errors are displayed to the user in context:

```jsx
{calculationErrors.negativeFlour && (
  <div className="mt-2 text-red-500 text-sm">
    Pre-ferment percentage is too high, resulting in negative flour in the main dough.
  </div>
)}

{calculationErrors.negativeWater && (
  <div className="mt-2 text-red-500 text-sm">
    Pre-ferment percentage is too high, resulting in negative water in the main dough.
  </div>
)}
```

### 9.3 Type Safety

TypeScript is used throughout the application to ensure type safety and catch potential errors at compile time.

---

## 10. Future Enhancements

### 10.1 Planned Features

1. **Recipe Export/Import**: Allow users to export and import recipes in various formats
2. **Cloud Synchronization**: Enable synchronization across devices
3. **Baking Timer**: Integrated timer for tracking baking stages
4. **Recipe Sharing**: Social features for sharing recipes with other users
5. **Advanced Analytics**: Track baking results over time to improve recipes

### 10.2 Technical Improvements

1. **Unit Testing**: Implement comprehensive test suite
2. **Performance Optimization**: Optimize calculation logic for large recipes
3. **Offline Support**: Implement service workers for offline functionality
4. **Accessibility Improvements**: Ensure WCAG compliance

---

## Conclusion

The BreadMaster application provides a sophisticated tool for bread baking enthusiasts, with accurate calculations based on baker's percentages and support for various pre-ferment types. The implementation uses modern web technologies and follows best practices for state management, component design, and type safety.

The application's modular architecture allows for easy extension and maintenance, while the user interface is designed to be intuitive and responsive. Future enhancements will focus on adding more features for recipe management and baking process tracking, as well as improving the overall user experience.

---

© 2025 Joel Percival. All rights reserved.
