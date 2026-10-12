import React, { useState } from 'react';
import type { UserProfile, Recipe, MealPlan } from '../types';
import { generateMealPlan } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import { useAppContext } from '../contexts/AppContext';

interface MealPlannerPageProps {}

const MealPlannerPage: React.FC<MealPlannerPageProps> = () => {
    const { 
        userProfile, 
        handleUpdateMealPlan, 
        handleGenerateShoppingList, 
        onUpgradeRequest 
    } = useAppContext();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    if (!userProfile) {
        return <div>Loading user profile...</div>;
    }

    const mealPlan = userProfile.mealPlan || {};
    
    const today = new Date();
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date;
    });

    const handleGeneratePlan = async () => {
        if (!userProfile.isPremium) {
            onUpgradeRequest();
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const pantryStock = (userProfile.pantry || []).filter(p => p.inStock).map(p => p.name);
            const recipes = await generateMealPlan(userProfile.preferences, pantryStock);
            
            const newPlan: MealPlan = {};
            const startDate = new Date();
            recipes.slice(0, 5).forEach((recipe, index) => {
                const date = new Date(startDate);
                date.setDate(startDate.getDate() + index);
                const dateString = date.toISOString().split('T')[0];
                newPlan[dateString] = [recipe];
            });

            handleUpdateMealPlan(newPlan);
            showToast("Generated a new 5-day meal plan!", 'success');

        } catch (err: any) {
            setError(err.message || "Failed to generate a meal plan. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRemoveFromPlan = (date: string, recipeName: string) => {
        const newPlan = { ...mealPlan };
        if (newPlan[date]) {
            newPlan[date] = newPlan[date].filter(r => r.recipeName !== recipeName);
            if (newPlan[date].length === 0) {
                delete newPlan[date];
            }
            handleUpdateMealPlan(newPlan);
        }
    };

    const handleClearPlan = () => {
        if (confirm("Are you sure you want to clear your entire meal plan for the week?")) {
            handleUpdateMealPlan({});
        }
    };

    const isPlanEmpty = Object.keys(mealPlan).length === 0;

    return (
        <div className="max-w-7xl mx-auto animate-fade-in-up">
            <header className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#333333] mb-2 tracking-tight">Weekly Meal Planner</h1>
                <p className="text-lg text-[#333333] text-balance">Plan your week, save time, and enjoy delicious&nbsp;meals.</p>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-md border mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={handleGeneratePlan}
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#588517] text-white font-bold text-base rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#588517] transition-transform transform hover:scale-105 duration-200 disabled:bg-green-300"
                >
                    {isLoading ? 'Generating...' : '✨ Generate Smart Plan'}
                    {!userProfile.isPremium && <span className="text-xs bg-yellow-300 text-yellow-800 font-bold px-2 py-0.5 rounded-full">PRO</span>}
                </button>
                <button 
                    onClick={handleGenerateShoppingList}
                    disabled={isPlanEmpty}
                    className="w-full sm:w-auto px-6 py-3 bg-[#333333] text-white font-bold text-base rounded-full hover:bg-opacity-90 disabled:bg-gray-300"
                >
                    Generate Shopping List
                </button>
                 <button 
                    onClick={handleClearPlan}
                    disabled={isPlanEmpty}
                    className="w-full sm:w-auto text-sm font-semibold text-[#333333] hover:text-red-600 disabled:text-gray-400"
                >
                    Clear Plan
                </button>
            </div>
            {error && <p className="text-center text-red-500 mb-4">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {weekDates.map(date => {
                    const dateString = date.toISOString().split('T')[0];
                    const recipesForDay = mealPlan[dateString] || [];
                    return (
                        <div key={dateString} className="bg-gray-50 rounded-lg p-4 border min-h-[200px]">
                            <h3 className="font-bold text-center text-[#333333]">{date.toLocaleDateString(undefined, { weekday: 'short' })}</h3>
                            <p className="text-center text-sm text-[#333333] mb-3">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            <div className="space-y-2">
                                {recipesForDay.length > 0 ? recipesForDay.map(recipe => (
                                    <div key={recipe.recipeName} className="bg-white p-2 rounded-md shadow-sm border text-sm relative">
                                        <p className="font-semibold text-[#333333] pr-5">{recipe.recipeName}</p>
                                        <button 
                                            onClick={() => handleRemoveFromPlan(dateString, recipe.recipeName)} 
                                            className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500 text-lg leading-none"
                                            aria-label={`Remove ${recipe.recipeName} from plan`}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )) : (
                                    <div className="text-center pt-8">
                                        <p className="text-xs text-gray-400">No meals planned.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MealPlannerPage;