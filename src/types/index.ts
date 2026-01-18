// Baby profile types
export interface Baby {
  id: string;
  name: string;
  photoUrl?: string;
  birthDate: string; // ISO date string
  dueDate?: string; // For corrected age calculation
  wasPremature: boolean;
  gestationalWeeks?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Age calculation result
export interface AgeResult {
  months: number;
  weeks: number;
  days: number;
  totalDays: number;
}

// Developmental phases
export type Phase = 'phase_1' | 'phase_2' | 'phase_3';

// Food database types
export type FoodCategory = 'fruit' | 'vegetable' | 'protein' | 'grain' | 'dairy' | 'legume' | 'other';

export type AllergenType =
  | 'peanut'
  | 'tree_nut'
  | 'egg'
  | 'dairy'
  | 'wheat'
  | 'soy'
  | 'fish'
  | 'shellfish'
  | 'sesame';

export type IronContent = 'high' | 'medium' | 'low' | 'none';
export type IronType = 'heme' | 'non_heme';
export type ChokingRisk = 'high' | 'medium' | 'low';

export interface FoodPrepGuide {
  shape: string;
  preparation: string;
  serving_tip: string | null;
  safety_note: string | null;
}

// Video resource link types
export type VideoType = 'prep' | 'demo' | 'safety' | 'educational';

export interface VideoLink {
  title: string;
  url: string;
  source: string; // "Solid Starts" | "Feeding Littles" | "101 Before One" | etc.
  duration?: string; // "0:45" for shorts
  type: VideoType;
}

export interface Food {
  id: string;
  name: string;
  category: FoodCategory;
  is_allergen: boolean;
  allergen_type?: AllergenType;
  iron_content: IronContent;
  iron_type?: IronType;
  choking_risk: ChokingRisk;
  intro_age_months: number;
  avoid_until_months?: number;
  vitamin_c_rich?: boolean;
  omega_3_rich?: boolean;
  color?: string;
  cultural_tags?: string[];
  fun_fact?: string;
  video_links?: VideoLink[];
  prep_guides: {
    phase_1?: FoodPrepGuide;
    phase_2?: FoodPrepGuide;
    phase_3?: FoodPrepGuide;
  };
}

// Feeding log types
export type ServingMethod = 'stick' | 'mashed' | 'bite_sized' | 'preloaded_spoon' | 'whole' | 'other';

export type FeedingResponse = 'loved' | 'meh' | 'disliked' | 'gagged' | 'refused' | 'possible_reaction';

export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FeedingLog {
  id: string;
  babyId: string;
  foodId?: string;
  customFoodName?: string;
  loggedDate: string; // ISO date string
  mealTime?: MealTime;
  servingMethod: ServingMethod; // Primary method (for backwards compat)
  servingMethods?: ServingMethod[]; // Multiple methods allowed
  response: FeedingResponse;
  isFirstTime: boolean;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
}

// Badge types
export interface BadgeCriteria {
  type: string;
  value?: number | boolean | string;
  [key: string]: unknown;
}

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  emoji: string;
  criteria: BadgeCriteria;
  celebration_message: string;
}

export interface EarnedBadge {
  id: string;
  babyId: string;
  badgeId: string;
  earnedDate: string;
  triggeringLogId?: string;
}

// Allergen tracker types
export type ReactionSeverity = 'mild' | 'moderate' | 'severe';

export interface AllergenTracker {
  id: string;
  babyId: string;
  allergenType: AllergenType;
  introductionDate?: string;
  introductionLogId?: string;
  hadReaction: boolean;
  reactionNotes?: string;
  reactionSeverity?: ReactionSeverity;
  isCleared: boolean;
  lastExposureDate?: string;
}

// Response emoji mapping
export const RESPONSE_EMOJIS: Record<FeedingResponse, string> = {
  loved: '⭐',
  meh: '😐',
  disliked: '😖',
  gagged: '🤢',
  refused: '🚫',
  possible_reaction: '⚠️',
};

export const RESPONSE_LABELS: Record<FeedingResponse, string> = {
  loved: 'Loved it',
  meh: 'Meh',
  disliked: 'Disliked',
  gagged: 'Gagged',
  refused: 'Refused',
  possible_reaction: 'Possible reaction',
};

export const SERVING_METHOD_LABELS: Record<ServingMethod, string> = {
  stick: 'Stick/Spear',
  mashed: 'Mashed',
  bite_sized: 'Bite-sized',
  preloaded_spoon: 'Preloaded Spoon',
  whole: 'Whole',
  other: 'Other',
};

export const MEAL_TIME_LABELS: Record<MealTime, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

// All 9 major allergens
export const TOP_9_ALLERGENS: AllergenType[] = [
  'peanut',
  'tree_nut',
  'egg',
  'dairy',
  'wheat',
  'soy',
  'fish',
  'shellfish',
  'sesame',
];

export const ALLERGEN_LABELS: Record<AllergenType, string> = {
  peanut: 'Peanut',
  tree_nut: 'Tree Nuts',
  egg: 'Egg',
  dairy: 'Dairy',
  wheat: 'Wheat',
  soy: 'Soy',
  fish: 'Fish',
  shellfish: 'Shellfish',
  sesame: 'Sesame',
};
