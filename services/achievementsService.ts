import type { UserProfile, Badge, BadgeId } from '../types';

export const BADGE_DEFINITIONS: Record<BadgeId, Badge> = {
    FIRST_STEPS: {
        id: 'FIRST_STEPS',
        name: 'First Steps',
        description: 'You cooked your first meal with YouChef!',
        icon: '🧑‍🍳',
    },
    WASTE_WARRIOR_1: {
        id: 'WASTE_WARRIOR_1',
        name: 'Waste Warrior I',
        description: 'Cooked 5 meals, saving food from the bin.',
        icon: '♻️',
    },
    WASTE_WARRIOR_2: {
        id: 'WASTE_WARRIOR_2',
        name: 'Waste Warrior II',
        description: 'Cooked 20 meals. You\'re a sustainability star!',
        icon: '🌍',
    },
    WASTE_WARRIOR_3: {
        id: 'WASTE_WARRIOR_3',
        name: 'Waste Warrior III',
        description: 'Cooked 50 meals! A true hero for your kitchen and the planet.',
        icon: '🏆',
    },
    MEAL_MASTER_1: {
        id: 'MEAL_MASTER_1',
        name: 'Meal Master I',
        description: 'Planned your first full week of meals.',
        icon: '🗓️',
    },
    MEAL_MASTER_2: {
        id: 'MEAL_MASTER_2',
        name: 'Meal Master II',
        description: 'Planned meals for a whole month.',
        icon: '📅',
    },
    PANTRY_PRO_1: {
        id: 'PANTRY_PRO_1',
        name: 'Pantry Pro I',
        description: 'Stocked over 10 items in your pantry.',
        icon: '🥫',
    },
    PANTRY_PRO_2: {
        id: 'PANTRY_PRO_2',
        name: 'Pantry Pro II',
        description: 'Became a true prepper with over 30 pantry items.',
        icon: '🗄️',
    },
    SAVVY_SAVER_1: {
        id: 'SAVVY_SAVER_1',
        name: 'Savvy Saver I',
        description: 'Saved your first 5 recipes.',
        icon: '❤️',
    },
    SAVVY_SAVER_2: {
        id: 'SAVVY_SAVER_2',
        name: 'Savvy Saver II',
        description: 'Curated a collection of over 25 saved recipes.',
        icon: '📚',
    },
    SOCIAL_BUTTERFLY: {
        id: 'SOCIAL_BUTTERFLY',
        name: 'Social Butterfly',
        description: 'Made your first 5 friends on YouChef.',
        icon: '👋',
    },
    TOP_CREATOR: {
        id: 'TOP_CREATOR',
        name: 'Top Creator',
        description: 'Uploaded your first delicious creation.',
        icon: '📸',
    },
    LEFTOVER_SAVER_1: {
        id: 'LEFTOVER_SAVER_1',
        name: 'Leftover Saver',
        description: 'Saved your first leftover item from the bin!',
        icon: '📦',
    },
    AI_APPROVED: {
        id: 'AI_APPROVED',
        name: 'Chef Approved',
        description: 'Received a score over 90 from our Master Chefs!',
        icon: '🤖',
    }
};

export const calculateAchievements = (userProfile: UserProfile): BadgeId[] => {
    if (!userProfile) return [];
    const earned: BadgeId[] = [];
    
    const cookedHistory = userProfile.cookedHistory || [];
    const mealPlan = userProfile.mealPlan || {};
    const pantry = userProfile.pantry || [];
    const savedRecipes = userProfile.savedRecipes || [];
    const friends = userProfile.friends || [];
    const creations = userProfile.creations || [];
    const leftovers = userProfile.leftovers || [];

    // Cooked History Badges
    if (cookedHistory.length >= 1) earned.push('FIRST_STEPS');
    if (cookedHistory.length >= 5) earned.push('WASTE_WARRIOR_1');
    if (cookedHistory.length >= 20) earned.push('WASTE_WARRIOR_2');
    if (cookedHistory.length >= 50) earned.push('WASTE_WARRIOR_3');

    // Meal Plan Badges
    const plannedDays = Object.keys(mealPlan || {}).length;
    if (plannedDays >= 7) earned.push('MEAL_MASTER_1');
    if (plannedDays >= 30) earned.push('MEAL_MASTER_2');

    // Pantry Badges
    if (pantry.length >= 10) earned.push('PANTRY_PRO_1');
    if (pantry.length >= 30) earned.push('PANTRY_PRO_2');

    // Saved Recipes Badges
    if (savedRecipes.length >= 5) earned.push('SAVVY_SAVER_1');
    if (savedRecipes.length >= 25) earned.push('SAVVY_SAVER_2');
    
    // Social Badges
    if (friends.length >= 5) earned.push('SOCIAL_BUTTERFLY');
    if (creations.length >= 1) earned.push('TOP_CREATOR');
    
    // Leftovers Badge
    if (leftovers.length >= 1) earned.push('LEFTOVER_SAVER_1');

    return earned;
};