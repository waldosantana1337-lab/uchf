import React from 'react';
import { useAppContext } from './contexts/AppContext';
import { Loader } from './components/Loader';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HeroSection, LandingPage } from './components/LandingPage';
import { IngredientInput } from './components/IngredientInput';
import { RecipeDisplay } from './components/RecipeDisplay';
import RecipeDetailPage from './components/RecipeDetailPage';
import MealPlannerPage from './components/MealPlannerPage';
import ProfilePage from './components/ProfilePage';
import Dashboard from './components/Dashboard';
import AuthModal from './components/AuthModal';
import { ShoppingListModal } from './components/ShoppingListModal';
import ScanFridgeModal from './components/ScanFridgeModal';
import ScanReceiptModal from './components/ScanReceiptModal';
import UpgradeModal from './components/UpgradeModal';
import VoiceCommandsGuide from './components/VoiceCommandsGuide';
import CookingModePage from './components/CookingModePage';
import { FridgeMode } from './components/FridgeMode';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import DailyTip from './components/DailyTip';
import { ErrorBoundary } from './components/ErrorBoundary';

const App: React.FC = () => {
    const { 
        isAppReady, 
        currentPage, 
        currentUser, 
        selectedRecipe, 
        handleNavigate,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isShoppingListOpen,
        setIsShoppingListOpen,
        isScanModalOpen,
        setIsScanModalOpen,
        isReceiptModalOpen,
        setIsReceiptModalOpen,
        isUpgradeModalOpen,
        setIsUpgradeModalOpen,
        isVoiceGuideOpen,
        setIsVoiceGuideOpen,
        isFridgeMode,
        recipes,
        isLoading,
        error
    } = useAppContext();

    if (!isAppReady) {
        return (
            <div className="fixed inset-0 bg-[#F5F1E9] flex flex-col items-center justify-center z-[200]">
                <div className="scale-150 mb-8"><Loader /></div>
                <p className="font-black uppercase tracking-[0.3em] text-[#3F6112] animate-pulse">Warming up the kitchen...</p>
                <div className="mt-4 flex gap-2">
                    <span className="w-2 h-2 bg-green-200 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                    <span className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                </div>
            </div>
        );
    }

    if (isFridgeMode) {
        return <FridgeMode />;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'profile':
                return <ProfilePage key={`profile-${currentUser}`} />;
            case 'mealPlanner':
                return <MealPlannerPage key={`planner-${currentUser}`} />;
            case 'recipeDetail':
                return selectedRecipe ? <RecipeDetailPage recipe={selectedRecipe} onGoBack={() => handleNavigate('home')} /> : <Dashboard key={`dash-fallback-${currentUser}`} />;
            case 'cookingMode':
                return selectedRecipe ? <CookingModePage recipe={selectedRecipe} onExit={() => handleNavigate('recipeDetail')} /> : <Dashboard key={`dash-fallback-cook-${currentUser}`} />;
            case 'home':
            default:
                if (currentUser) {
                    // Show RecipeDisplay if actively generating or results exist
                    const hasActiveRecipeState = recipes !== null || isLoading || error !== null;
                    return hasActiveRecipeState ? <RecipeDisplay key="results" /> : <Dashboard key={`dashboard-${currentUser}`} />;
                }
                return (recipes !== null || isLoading || error !== null) ? <RecipeDisplay key="results-guest" /> : <LandingPage key="landing-guest" />;
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F1E9] text-[#333333] font-sans selection:bg-[#588517] selection:text-white">
            <Header />
            <DailyTip />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
                {/* Hero only for guests on the true landing state */}
                {currentPage === 'home' && !currentUser && !recipes && !isLoading && !error && <HeroSection />}
                
                {/* Ingredient Input is the core tool available on home */}
                {currentPage === 'home' && (
                    <section id="ingredient-input-section" className="mb-16">
                        <IngredientInput />
                    </section>
                )}

                <ErrorBoundary>
                    {renderPage()}
                </ErrorBoundary>
            </main>
            <Footer />

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            <ShoppingListModal isOpen={isShoppingListOpen} onClose={() => setIsShoppingListOpen(false)} />
            <ScanFridgeModal isOpen={isScanModalOpen} onClose={() => setIsScanModalOpen(false)} />
            <ScanReceiptModal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} />
            <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
            <VoiceCommandsGuide isOpen={isVoiceGuideOpen} onClose={() => setIsVoiceGuideOpen(false)} />
            <LanguageSwitcher />
        </div>
    );
};

export default App;