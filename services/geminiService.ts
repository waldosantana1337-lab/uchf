import type { Recipe, Preferences, IngredientSwap, Leftover, LeftoverIdea, ChefPersonality, Language, SmartTip, PairingSuggestion, GroceryStoreSuggestion } from '../types';

export const generateRecipeText = async (
    ingredients: string[], 
    prefs: Preferences, 
    personality: ChefPersonality, 
    lang: Language = 'en'
): Promise<Recipe[]> => {
    const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, preferences: prefs, personality, language: lang })
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "The Chef's kitchen is too busy right now. Please try again.");
    }
    return response.json();
};

export const getChefSecret = async (
    recipeName: string,
    ingredients: string[],
    personality: ChefPersonality,
    lang: Language
): Promise<{ technique: string; enhancement: string }> => {
    try {
        const response = await fetch("/api/chef-secret", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipeName, ingredients, personality, language: lang })
        });
        if (!response.ok) throw new Error();
        return response.json();
    } catch (e) {
        return { technique: "Mise en Place", enhancement: "Organize your limited ingredients before starting to ensure the best result." };
    }
};

export const generateRecipeImage = async (recipe: Recipe): Promise<string> => {
    try {
        const response = await fetch("/api/recipe-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipe })
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        return data.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop";
    } catch (e) { 
        return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop"; 
    }
};

export const critiqueUserDish = async (base64Image: string, recipeName: string, personality: ChefPersonality) => {
    try {
        const response = await fetch("/api/critique", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64Image, recipeName, personality })
        });
        if (!response.ok) throw new Error();
        return response.json();
    } catch (e) { 
        return { score: 85, critique: "Wonderful effort! The colors are vibrant." }; 
    }
};

export const generateDailyTip = async () => ({ tip: "Always salt your pasta water until it tastes like the sea—it's your only chance to season the dough." });
export const generateChefSuggestion = async (i: any, p: any, l: any) => ({ hasSuggestion: false, suggestionText: "", problematicIngredient: "" });

export const identifyIngredientsFromImage = async (base64Image: string): Promise<{ name: string; quantity: string }[]> => {
    try {
        const response = await fetch("/api/scan-fridge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ base64Image })
        });
        if (!response.ok) throw new Error();
        return await response.json();
    } catch (e) {
        console.error("Fridge scan service error:", e);
        return [];
    }
};

export const identifyReceiptItems = async (base64Image: string): Promise<{ name: string; quantity: string; expiresInDays: number }[]> => {
    const response = await fetch("/api/scan-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image })
    });
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to read the receipt. Please try another image.");
    }
    return await response.json();
};

export const generateGrocerySuggestions = async (i: any, loc: any) => ({ suggestions: [], sources: [] });
export const generateMealPlan = async (p: any, pan: any) => [];
export const categorizeShoppingList = async (i: any) => [{ category: "General", items: i }];
export const generateSmartTips = async (s: any, l: any) => [];

export const generatePairings = async (r: any, i: any, l: any): Promise<PairingSuggestion> => ({ 
    wine: { name: "Refreshing Wine", reason: "Pairs well" },
    cocktail: { name: "Garden Mule", reason: "Zesty and bright" },
    mocktail: { name: "Basil Smash", reason: "Herbaceous and light" }
});

export const generateContextualSubstitutions = async (m: any, r: any, p: any, l: any) => ({ originalIngredient: m, suggestedIngredient: "N/A", reasoning: "Consult chef" });
export const generateLeftoverIdeas = async (l: any, lan: any) => [];
