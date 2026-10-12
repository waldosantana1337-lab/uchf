import type { MealPlan, PantryItem, ShoppingListItem, Recipe } from '../types';

export const generateConsolidatedShoppingList = (mealPlan: MealPlan, pantry: PantryItem[]): ShoppingListItem[] => {
    const requiredIngredients = new Map<string, { forRecipes: Set<string> }>();
    const pantryStock = new Set(pantry.filter(p => p.inStock).map(p => p.name.toLowerCase()));

    // Aggregate all ingredients from the meal plan
    Object.values(mealPlan).forEach(recipesOnDate => {
        recipesOnDate.forEach(recipe => {
            recipe.ingredients.forEach(ingredient => {
                const lowerIngredient = ingredient.toLowerCase();
                if (!requiredIngredients.has(lowerIngredient)) {
                    requiredIngredients.set(lowerIngredient, { forRecipes: new Set() });
                }
                requiredIngredients.get(lowerIngredient)!.forRecipes.add(recipe.recipeName);
            });
        });
    });

    // Filter out ingredients already in the pantry
    const missingIngredients: ShoppingListItem[] = [];
    requiredIngredients.forEach((data, name) => {
        if (!pantryStock.has(name)) {
            // Join recipe names for a clear "forRecipe" string.
            // If it's for many recipes, simplify the label.
            const forRecipeLabel = data.forRecipes.size > 2
                ? 'Multiple Recipes'
                : Array.from(data.forRecipes).join(' & ');

            missingIngredients.push({ name, forRecipe: `Meal Plan: ${forRecipeLabel}` });
        }
    });

    return missingIngredients;
};
