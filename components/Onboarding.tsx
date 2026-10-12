
import React from 'react';
import type { UserProfile } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface OnboardingProps {
    userProfile: UserProfile;
    onDismiss: () => void;
}

const OnboardingStep: React.FC<{ title: string; description: string; isComplete: boolean }> = ({ title, description, isComplete }) => (
    <div className="flex items-center space-x-5 group">
        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2 ${isComplete ? 'bg-green-500 border-green-500 shadow-lg shadow-green-200' : 'bg-white border-gray-100 group-hover:border-green-200'}`}>
            {isComplete ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            ) : (
                 <div className="w-2 h-2 rounded-full bg-gray-200 group-hover:bg-green-400"></div>
            )}
        </div>
        <div>
            <h4 className={`text-lg font-black tracking-tight ${isComplete ? 'text-green-800' : 'text-[#333333]'}`}>{title}</h4>
            <p className="text-sm text-gray-500 font-medium">{description}</p>
        </div>
    </div>
);


export const Onboarding: React.FC<OnboardingProps> = ({ userProfile, onDismiss }) => {
    const { handleNavigate } = useAppContext();

    const hasPantryItems = (userProfile.pantry || []).length > 2;
    const hasSavedRecipes = (userProfile.savedRecipes || []).length > 0;
    const hasMealPlan = Object.keys(userProfile.mealPlan || {}).length > 0;

    const allComplete = hasPantryItems && hasSavedRecipes && hasMealPlan;

    React.useEffect(() => {
        if (allComplete && !userProfile.onboardingCompleted) {
            onDismiss();
        }
    }, [allComplete, userProfile.onboardingCompleted, onDismiss]);

    if (allComplete && !userProfile.onboardingCompleted) {
        return null;
    }

    const handleStepClick = (stepKey: 'pantry' | 'save' | 'plan') => {
        switch (stepKey) {
            case 'pantry':
                handleNavigate('profile', userProfile.username);
                break;
            case 'save':
                document.getElementById('ingredient-input-section')?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'plan':
                handleNavigate('mealPlanner');
                break;
        }
    };


    return (
        <div className="bg-gradient-to-br from-white to-green-50 p-10 rounded-[3rem] shadow-sm border border-green-100 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-green-200/20 rounded-full blur-3xl group-hover:bg-green-200/40 transition-all"></div>
            
            <button
                onClick={onDismiss}
                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 hover:bg-white rounded-full transition-all"
                aria-label="Dismiss onboarding"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="max-w-2xl">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#588517] bg-green-100 px-3 py-1 rounded-full mb-6 inline-block">Habit Foundation</span>
                <h3 className="text-3xl font-black text-[#333333] mb-4">Start your culinary journey</h3>
                <p className="text-gray-500 font-medium mb-10">Follow these 3 simple wins to unlock early confidence in your kitchen.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    <button onClick={() => handleStepClick('pantry')} className="w-full text-left" disabled={hasPantryItems}>
                        <OnboardingStep
                            title="Log your staples"
                            description="Tell us what you always have. This unlocks zero-waste magic."
                            isComplete={hasPantryItems}
                        />
                    </button>
                    <button onClick={() => handleStepClick('save')} className="w-full text-left" disabled={hasSavedRecipes}>
                        <OnboardingStep
                            title="Find a winner"
                            description="Generate your first recipe set and save a favorite to build your library."
                            isComplete={hasSavedRecipes}
                        />
                    </button>
                     <button onClick={() => handleStepClick('plan')} className="w-full text-left" disabled={hasMealPlan}>
                        <OnboardingStep
                            title="Master the week"
                            description="Schedule one meal to eliminate decision fatigue tomorrow."
                            isComplete={hasMealPlan}
                        />
                    </button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-green-100">
                    <p className="text-xs font-bold text-green-700 italic">"The secret to cooking is starting with what you love." — Chef Zephyr</p>
                </div>
            </div>
        </div>
    );
};
