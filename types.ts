
export type Language = 'en' | 'es';

export interface Preferences {
  isGlutenFree: boolean;
  isVegan: boolean;
  isVegetarian: boolean;
  isKeto: boolean;
  isDairyFree: boolean;
  cuisine: string;
  servings: number;
  maxTime: number;
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  allergies: string;
  occasion?: string;
  creativeTwist?: string;
  equipment?: string[]; // e.g., ['air_fryer', 'slow_cooker', 'instant_pot', 'blender', 'oven', 'grill']
}

export interface Nutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  sugar: string;
  sodium: string;
}

export interface Recipe {
  recipeName: string;
  description: string;
  isHealthy: boolean;
  cuisine: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
  videoUri?: string; // AI Generated cinematic preview
  prepTime: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  visualPrompt?: string;
  nutrition: Nutrition;
  averageRating?: number;
  ratingCount?: number;
  pantryMatchPercentage?: number;
}

export interface SmartTip {
    term: string;
    definition: string;
}

export interface MealPlan {
    [date: string]: Recipe[]; // date format: YYYY-MM-DD
}

export interface GroceryStoreSuggestion {
  storeName: string;
  address: string;
  storeType: 'Supermarket' | 'Discount Store' | 'Specialty Grocer' | 'Local Market';
  reasoning: string;
}

export interface DailyTip {
  tip: string;
}

export interface IngredientSwap {
  originalIngredient: string;
  suggestedIngredient: string;
  reasoning: string;
}

export interface ChefSuggestion {
    hasSuggestion: boolean;
    suggestionText: string;
    problematicIngredient: string;
}

export interface Pairing {
    name: string;
    reason: string;
}

export interface PairingSuggestion {
    wine: Pairing;
    cocktail: Pairing;
    mocktail: Pairing;
}

export interface Leftover {
    id: string;
    name: string;
    quantity: string;
    category: 'Cooked Meat' | 'Grains' | 'Vegetables' | 'Takeout' | 'Other';
    addedDate: string;
    notes?: string;
}

export interface LeftoverIdea {
    ideaName: string;
    category: 'New Dish' | 'Enhancement' | 'Quick Snack';
    description: string;
    extraIngredients?: string[];
}

export type BadgeId =
  | 'FIRST_STEPS'
  | 'WASTE_WARRIOR_1'
  | 'WASTE_WARRIOR_2'
  | 'WASTE_WARRIOR_3'
  | 'MEAL_MASTER_1'
  | 'MEAL_MASTER_2'
  | 'PANTRY_PRO_1'
  | 'PANTRY_PRO_2'
  | 'SAVVY_SAVER_1'
  | 'SAVVY_SAVER_2'
  | 'SOCIAL_BUTTERFLY'
  | 'TOP_CREATOR'
  | 'LEFTOVER_SAVER_1'
  | 'AI_APPROVED';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    theme: string;
    isActive: boolean;
}

export interface PantryItem {
    name: string;
    inStock: boolean;
    expiresOn?: string;
}

export interface ShoppingListItem {
    name: string;
    forRecipe: string;
    isChecked?: boolean;
}

export interface Comment {
    username: string;
    profilePictureUrl: string;
    comment: string;
    timestamp: string;
}

export interface CookedHistoryItem {
    recipeName: string;
    cookedDate: string;
    notes?: string;
    rating?: number;
    photoUrl?: string;
}

export interface ActivityItem {
    type: 'SAVED_RECIPE' | 'UPLOADED_CREATION' | 'ADDED_FRIEND' | 'COOKED_RECIPE';
    timestamp: string;
    payload: {
        recipeName?: string;
        friendUsername?: string;
        imageUrl?: string;
    };
}

export interface Notification {
    id: string;
    type: 'NEW_CREATION' | 'SHARED_RECIPE' | 'NEW_FRIEND' | 'NEW_LIKE' | 'NEW_COMMENT' | 'ACHIEVEMENT' | 'REFERRAL';
    fromUsername?: string;
    title?: string;
    message?: string;
    read: boolean;
    timestamp: string;
    payload?: {
        recipeName?: string;
        creationImageUrl?: string;
    };
}

export interface UserCreation {
  recipeName: string;
  recipeImageUrl?: string;
  userImageUrl: string;
  notes?: string;
  likes: string[];
  comments: Comment[];
  aiScore?: number;
  aiCritique?: string;
  timestamp: string;
}

export type ChefPersonality = 'zephyr' | 'pierre' | 'sarge' | 'nonna';

export interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  profilePictureUrl: string;
  savedRecipes: Recipe[];
  creations: UserCreation[];
  friends: string[];
  preferences: Preferences;
  activity: ActivityItem[];
  notifications: Notification[];
  cookedHistory: CookedHistoryItem[];
  pantry: PantryItem[];
  leftovers: Leftover[];
  shoppingList: ShoppingListItem[];
  mealPlan: MealPlan;
  isPremium: boolean;
  selectedChef: ChefPersonality;
  onboardingCompleted?: boolean;
  integrations?: {
    alexaLinked?: boolean;
    samsungLinked?: boolean;
  };
  cookingStreak?: number;
  lastCookedDate?: string;
  xp: number;
  level: number;
}

export interface AllUsersData {
  [username: string]: UserProfile;
}
