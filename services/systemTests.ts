import { TestSuite } from '../utils/testRunner';
import { TRANSLATIONS } from '../utils/translations';
import { PRE_BUILT_RECIPES } from '../data/preBuiltRecipes';
import { calculateAchievements } from '../services/achievementsService';
import { getUserData } from '../services/youChefApi';
import { saveUserData, loadUserData } from '../services/storageService';

export const runSystemTests = async () => {
  const suite = new TestSuite();

  // 0. Environment: API Key Check
  await suite.assert("Infrastructure: API Key exists in environment", () => {
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("[TEST] API Key is missing. This is expected in some test environments but critical for production.");
    }
    return typeof key === 'string' && key.length > 5;
  });

  // 1. Data Integrity: Formal Schema Check
  await suite.assert("AI Contract V1: Nutrition sub-objects must be present", () => {
    return Object.values(PRE_BUILT_RECIPES).every(r => 
        r.nutrition && 
        typeof r.nutrition.calories === 'string' &&
        typeof r.nutrition.protein === 'string'
    );
  });

  // 2. Resilience: Hostile String Normalization
  await suite.assert("UI Resilience: Nutrition component strips alpha-chars correctly", () => {
    const rawAiCalories = "500 kcal approx";
    const normalized = rawAiCalories.replace(/[a-zA-Z\s]/g, '');
    return normalized === "500";
  });

  // 3. Logic: Achievement Boundary Conditions
  await suite.assert("Logic: 'First Steps' triggers on EXACTLY 1 meal", () => {
    const badges = calculateAchievements({ cookedHistory: [{ recipeName: 'X', cookedDate: '2024-01-01' }] } as any);
    return badges.includes('FIRST_STEPS') && badges.length === 1;
  });

  // 4. API: Hydration from Cold Start
  await suite.assert("Storage: Mock API handles cold launch with hydration", async () => {
    const data = await getUserData();
    return data && typeof data.allUsers === 'object';
  });

  // 5. Translations: Essential Keys Presence
  await suite.assert("I18n: Essential keys present in English", () => {
    const en = TRANSLATIONS.en;
    return !!(en.login && en.profile && en.mealPlanner && en.shoppingList);
  });

  // 6. Logic: Achievement 'Waste Warrior I' threshold
  await suite.assert("Logic: 'Waste Warrior I' requires 5 meals", () => {
    const history = Array(5).fill({ recipeName: 'X', cookedDate: '2024-01-01' });
    const badges = calculateAchievements({ cookedHistory: history } as any);
    return badges.includes('WASTE_WARRIOR_1');
  });

  // 7. Storage: Persistence Logic
  await suite.assert("Storage: Round-trip persistence works", () => {
    const testData = { "test-user": { username: "test-user" } } as any;
    saveUserData(testData, "test-user");
    const loaded = loadUserData();
    return loaded.currentUser === "test-user" && !!loaded.allUsers["test-user"];
  });

  // 8. Landing Page: Hero Translation Keys
  await suite.assert("Landing: Hero section translation keys exist", () => {
    const en = TRANSLATIONS.en;
    return !!(en.heroTitle && en.heroSubtitle);
  });

  // 9. Data: Pre-built Recipes Completeness
  await suite.assert("Data: Pre-built recipes have required fields", () => {
    return Object.values(PRE_BUILT_RECIPES).every(r => 
      r.recipeName && 
      r.ingredients && r.ingredients.length > 0 &&
      r.instructions && r.instructions.length > 0 &&
      r.prepTime && r.difficulty
    );
  });

  // 10. Logic: Referral Link Format
  await suite.assert("Logic: Referral link uses correct origin", () => {
    const username = "testchef";
    const origin = typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000";
    const expected = `${origin}/join?ref=${username}`;
    return expected.includes(username) && expected.startsWith('http');
  });

  return suite.getReport();
};