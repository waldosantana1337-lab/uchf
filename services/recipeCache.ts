import type { Recipe, Preferences } from '../types';

type CachedRecipe = Omit<Recipe, 'imageUrl'>;

const recipeCache = new Map<string, CachedRecipe[]>();

const generateCacheKey = (ingredients: string[], prefs: Preferences): string => {
    // Sort ingredients to ensure cache hits regardless of entry order
    const sortedIngredients = [...ingredients].sort().join(',');
    // Stringify sorted preferences for a consistent key
    const prefsString = JSON.stringify(Object.entries(prefs).sort(([keyA], [keyB]) => keyA.localeCompare(keyB)));
    return `${sortedIngredients}|${prefsString}`;
};

export const getCachedRecipes = (ingredients: string[], prefs: Preferences): CachedRecipe[] | null => {
    const key = generateCacheKey(ingredients, prefs);
    return recipeCache.get(key) || null;
};

export const setCachedRecipes = (ingredients: string[], prefs: Preferences, recipes: CachedRecipe[]): void => {
    const key = generateCacheKey(ingredients, prefs);
    recipeCache.set(key, recipes);
};
