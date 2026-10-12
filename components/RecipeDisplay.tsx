import React, { useState } from 'react';
import type { Recipe, CookedHistoryItem } from '../types';
import { MarkAsCookedModal } from './MarkAsCookedModal';
import { ShareModal } from './ShareModal';
import { useToast } from '../contexts/ToastContext';
import { useAppContext } from '../contexts/AppContext';
import { getOptimizedUnsplashUrl, getUnsplashSrcSet } from '../utils/imageUtils';

interface RecipeDisplayProps {}

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    const starSizeClass = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }[size];

    return (
        <div className="flex items-center">
            {[...Array(fullStars)].map((_, i) => (
                <svg key={`full-${i}`} className={`${starSizeClass} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
            {halfStar && (
                <svg className={`${starSizeClass} text-yellow-400`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <svg key={`empty-${i}`} className={`${starSizeClass} text-gray-300`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
        </div>
    );
};

const ImagePlaceholder: React.FC = () => (
    <div className="w-full h-48 sm:h-56 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] flex items-center justify-center relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="absolute bottom-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Imaging Chef...</span>
    </div>
);

const SimmeringPotLoader: React.FC = () => (
    <div className="flex flex-col items-center justify-center py-10" aria-label="Loading recipes" role="status" aria-live="polite">
        <div className="relative w-24 h-24">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-20 h-16 bg-gray-700 rounded-t-full rounded-b-md"></div>
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-24 h-4 bg-gray-600 rounded-full"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-3 bg-gray-800 rounded-t-md"></div>
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex space-x-1">
                <div className="w-1 h-3 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1 h-4 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                <div className="w-1 h-5 bg-gray-300 rounded-full animate-bounce"></div>
            </div>
        </div>
        <p className="mt-4 text-lg font-semibold text-[#333333] animate-pulse">Consulting the master chefs...</p>
        <p className="text-sm text-[#333333]">Recipe cards will appear in just a moment.</p>
    </div>
);

const RecipeCard: React.FC<{ 
    recipe: Recipe; 
    index: number; 
    isSaved: boolean; 
    averageRating?: number;
    ratingCount?: number;
    cookedHistory: CookedHistoryItem[];
}> = React.memo(({ recipe, index, isSaved, averageRating, ratingCount, cookedHistory }) => {
    const { 
        handleToggleSave, 
        userProfile, 
        onLoginRequest, 
        handleMarkAsCooked, 
        handleViewRecipe, 
        handleAddToPlan,
        ingredients
    } = useAppContext();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isCookedModalOpen, setIsCookedModalOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { showToast } = useToast();
    const animationDelay = { animationDelay: `${index * 150}ms` };

    const handleInteraction = (e: React.MouseEvent | React.KeyboardEvent, action: () => void) => {
        e.stopPropagation(); 
        action();
    };

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleInteraction(e, action);
        }
    };

    const handleSaveClick = (e: React.MouseEvent) => handleInteraction(e, () => {
        if (!userProfile) {
            showToast("Please log in to save recipes!", 'info');
            onLoginRequest();
        } else {
            handleToggleSave(recipe);
        }
    });
    
    const handleShareClick = (e: React.MouseEvent) => handleInteraction(e, () => setIsShareModalOpen(true));
    const handleMarkCookedClick = (e: React.MouseEvent) => handleInteraction(e, () => {
        if (!userProfile) {
            showToast("Please log in to mark recipes as cooked!", 'info');
            onLoginRequest();
        } else {
            setIsCookedModalOpen(true);
        }
    });
    const handleAddToPlanClick = (e: React.MouseEvent) => handleInteraction(e, () => {
        if (!userProfile) {
            showToast("Please log in to use the Meal Planner!", 'info');
            onLoginRequest();
        } else {
            handleAddToPlan(recipe);
        }
    });

    const handleSaveCooked = (cookedDate: string, notes: string, rating: number) => {
        handleMarkAsCooked(recipe, cookedDate, notes, rating);
    };
    
    const onShareWithFriend = (friend: string, recipe: Recipe) => {
        showToast(`Shared ${recipe.recipeName} with ${friend}!`, 'success')
    };
    
    const lastCooked = cookedHistory.find(h => h.recipeName === recipe.recipeName);

    const matchPercentage = recipe.pantryMatchPercentage;
    let matchColor = 'bg-green-100 text-green-800';
    if(matchPercentage !== undefined) {
        if (matchPercentage < 75) matchColor = 'bg-yellow-100 text-yellow-800';
        if (matchPercentage < 50) matchColor = 'bg-red-100 text-red-800';
    }

    const isAutoScaled = ingredients.some(i => /\d/.test(i));

    return (
        <div
            className="w-full text-left bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in-up relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#588517] group flex flex-col"
            style={animationDelay}
        >
             <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
                <button onClick={handleSaveClick} className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors" aria-label={isSaved ? 'Unsave recipe' : 'Save recipe'}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                 </button>
                 <button onClick={handleShareClick} className="p-2 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors" aria-label="Share recipe">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                 </button>
            </div>

            {isAutoScaled && (
                 <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border border-blue-400">
                        Inventory Scaled
                    </span>
                 </div>
            )}
            
            <div 
                role="button"
                tabIndex={0}
                onClick={() => handleViewRecipe(recipe)} 
                onKeyDown={(e) => handleKeyDown(e, () => handleViewRecipe(recipe))}
                className="w-full block overflow-hidden bg-gray-100 min-h-[192px] sm:min-h-[224px] relative cursor-pointer" 
                aria-label={`View details for ${recipe.recipeName}`}
            >
                {recipe.imageUrl ? (
                    <>
                        {!imageLoaded && <ImagePlaceholder />}
                        <img 
                            src={getOptimizedUnsplashUrl(recipe.imageUrl, 800)} 
                            srcSet={getUnsplashSrcSet(recipe.imageUrl)}
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            alt={recipe.recipeName} 
                            loading="lazy"
                            decoding="async"
                            referrerPolicy="no-referrer"
                            onLoad={() => setImageLoaded(true)}
                            className={`w-full h-48 sm:h-56 object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                        />
                    </>
                ) : (
                    <ImagePlaceholder />
                )}
            </div>
            
            <div className="p-6 flex flex-col flex-grow">
                <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => handleViewRecipe(recipe)} 
                    onKeyDown={(e) => handleKeyDown(e, () => handleViewRecipe(recipe))}
                    className="w-full text-left cursor-pointer" 
                    aria-label={`View details for ${recipe.recipeName}`}
                >
                    <h3 className="text-xl font-bold text-[#333333] mb-2 group-hover:text-[#588517] transition-colors text-balance">{recipe.recipeName}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {recipe.cuisine && (
                            <span className="text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-100 inline-block px-2 py-0.5 rounded-full">
                                {recipe.cuisine}
                            </span>
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-100 inline-block px-2 py-0.5 rounded-full">
                            {recipe.prepTime}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-purple-700 bg-purple-100 inline-block px-2 py-0.5 rounded-full capitalize">
                            {recipe.difficulty}
                        </span>
                        {matchPercentage !== undefined && (
                            <span className={`text-xs font-semibold uppercase tracking-wider ${matchColor} inline-block px-2 py-0.5 rounded-full`}>
                                {matchPercentage}% Pantry Match
                            </span>
                        )}
                    </div>
                    {recipe.nutrition && (
                        <div className="flex gap-3 my-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                             <span className="flex items-center gap-1"><span className="text-[#2D450D]">{recipe.nutrition.calories}</span></span>
                             <span className="flex items-center gap-1">PRO: <span className="text-[#2D450D]">{recipe.nutrition.protein}</span></span>
                             <span className="flex items-center gap-1">FAT: <span className="text-[#2D450D]">{recipe.nutrition.fat}</span></span>
                        </div>
                    )}
                    {averageRating && ratingCount ? (
                        <div className="flex items-center space-x-2 mb-2">
                            <StarRating rating={averageRating} size="sm" />
                            <span className="text-xs text-[#333333]">{averageRating.toFixed(1)} ({ratingCount} rating{ratingCount !== 1 && 's'})</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 mb-2">
                            <StarRating rating={0} size="sm" /><span className="text-xs text-gray-400 italic">No ratings yet</span>
                        </div>
                    )}
                    <p className="text-[#333333] text-sm mb-4 flex-grow line-clamp-2">{recipe.description}</p>
                </div>
                
                {lastCooked && (
                    <div className="text-xs font-semibold text-green-700 bg-green-100/80 px-2 py-1 rounded-md self-start">
                        Cooked on {new Date(lastCooked.cookedDate).toLocaleDateString()}
                    </div>
                )}
                
                <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-50">
                     <button onClick={handleAddToPlanClick} className="flex items-center gap-1.5 text-sm font-semibold text-[#588517] hover:text-opacity-80 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Add to Plan</span>
                    </button>
                    <button onClick={handleMarkCookedClick} className="flex items-center gap-1.5 text-sm font-semibold text-[#333333] hover:text-[#588517] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M19.405 4.595a1.5 1.5 0 00-2.12-2.12l-9.332 9.333-3.183-3.182a1.5 1.5 0 00-2.12 2.12l4.242 4.242a1.5 1.5 0 002.12 0l10.393-10.393z" /></svg>
                        <span>I cooked this</span>
                    </button>
                </div>
            </div>

            {userProfile && <ShareModal isOpen={isShareModalOpen} recipe={recipe} friends={userProfile.friends} onClose={() => setIsShareModalOpen(false)} onShareWithFriend={onShareWithFriend} />}
            {userProfile && <MarkAsCookedModal isOpen={isCookedModalOpen} recipeName={recipe.recipeName} onClose={() => setIsCookedModalOpen(false)} onSave={handleSaveCooked} />}
        </div>
    );
});

export const RecipeDisplay: React.FC<RecipeDisplayProps> = () => {
    // SRE FIX: Defensively initialize recipeRatings to an empty object to prevent property access of undefined
    const context = useAppContext();
    const { 
        recipes, 
        isLoading, 
        error, 
        recipeRatings = {}, 
        userProfile, 
        handleStartOver 
    } = context || {};
  
    const isFallback = error === "High traffic: Serving curated ideas";

    if (isLoading) return <SimmeringPotLoader />;

    if (error && !isFallback) {
        return (
            <div className="text-center py-10 px-4 bg-red-50 border-2 border-dashed border-red-200 rounded-lg">
                <p className="text-lg font-semibold text-red-700">Oops! Something went wrong.</p>
                <p className="text-red-600 mt-1">{error}</p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={handleStartOver} 
                        className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
  
    if (!recipes) return null;

    if (recipes.length === 0) {
        return (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm px-8">
                <p className="text-xl font-black text-[#1A1A1A]">No recipes found for your ingredients.</p>
                <p className="text-gray-500 mt-2 mb-8 font-medium">From Fridge to Feast.</p>
                <button 
                    onClick={handleStartOver} 
                    className="inline-flex items-center px-8 py-3 bg-[#1A1A1A] text-white font-black rounded-full hover:opacity-90 transition-all shadow-lg"
                >
                    Try Other Ingredients
                </button>
            </div>
        );
    }

  const isRecipeSaved = (recipeName: string) => (userProfile?.savedRecipes || []).some(r => r.recipeName === recipeName);

  return (
    <div className="space-y-8 animate-fade-in">
        {isFallback && (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex">
                    <div className="flex-shrink-0">
                         <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M8.257 3.099c.636-1.026 2.85-1.026 3.486 0l5.58 8.998c.636 1.026-.474 2.401-1.743 2.401H4.42c-1.27 0-2.38-1.375-1.744-2.401l5.58-8.998zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-4a1 1 0 001 1h.01a1 1 0 001-1V7a1 1 0 00-2 0v2z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-bold text-yellow-800">{error}</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                            <p>Our master chefs are very busy right now. In the meantime, here are some starter ideas based on your ingredients.</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
        <div className="text-center border-b border-gray-200 pb-8">
            <button
                onClick={handleStartOver}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-[#333333] font-bold text-base rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#588517] transition-all transform hover:scale-105 duration-200"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691v-4.992a4.125 4.125 0 018.25 0v4.992" />
                </svg>
                Not quite right? Start Over
            </button>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map((recipe, index) => {
            const ratingInfo = recipeRatings[recipe.recipeName];
            const averageRating = ratingInfo ? ratingInfo.total / ratingInfo.count : undefined;
            const ratingCount = ratingInfo ? ratingInfo.count : undefined;

            return (
            <RecipeCard
                key={`${recipe.recipeName}-${index}`}
                recipe={recipe}
                index={index}
                isSaved={isRecipeSaved(recipe.recipeName)}
                averageRating={averageRating}
                ratingCount={ratingCount}
                cookedHistory={userProfile?.cookedHistory || []}
            />
            );
        })}
      </div>
    </div>
  );
};