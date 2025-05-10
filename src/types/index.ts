export interface PreFerment {
  flour: string;
  flourGrams: number;
  waterGrams: number;
  yeastGrams: number;
  percentage: number;
}

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

export interface FlourType {
  id: string;
  name: string;
  percentage: number;
}

export type YeastType = 'Sourdough' | 'Instant' | 'Fresh';

export interface BakingStage {
  id: string;
  name: string;
  order: number;
  included: boolean;
  description?: string;
}

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

export interface Ingredient {
  name: string;
  weight: number;
  unit: string;
  percentage?: number;
}