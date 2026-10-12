import React from 'react';
import type { Recipe } from '../types';

interface SavedRecipesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedRecipes: Recipe[];
  onUnsave: (recipe: Recipe) => void;
}

const SavedRecipeItem: React.FC<{ recipe: Recipe; onUnsave: (recipe: Recipe) => void }> = ({ recipe, onUnsave }) => (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
        <img src={recipe.imageUrl} alt={recipe.recipeName} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
        <div className="flex-grow">
            <h4 className="font-bold text-[#152238]">{recipe.recipeName}</h4>
            <p className="text-sm text-[#152238] mt-1 line-clamp-2">{recipe.description}</p>
        </div>
        <button 
            onClick={() => onUnsave(recipe)} 
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            aria-label={`Unsave ${recipe.recipeName}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
        </button>
    </div>
);

export const SavedRecipesModal: React.FC<SavedRecipesModalProps> = ({ isOpen, onClose, savedRecipes, onUnsave }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="saved-recipes-title"
    >
        <div 
            className="relative w-full max-w-2xl max-h-[90vh] bg-gray-50 rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
                <h2 id="saved-recipes-title" className="text-xl font-bold text-[#152238]">My Saved Recipes</h2>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            
            <div className="overflow-y-auto p-5">
                {savedRecipes.length > 0 ? (
                    <div className="space-y-4">
                        {savedRecipes.map(recipe => (
                            <SavedRecipeItem key={recipe.recipeName} recipe={recipe} onUnsave={onUnsave} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                         <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-[#152238]">No saved recipes yet</h3>
                        <p className="mt-1 text-sm text-[#152238]">Find a recipe you like and click the heart to save it here!</p>
                    </div>
                )}
            </div>
            
            <div className="p-4 bg-gray-100 border-t border-gray-200 rounded-b-2xl text-right">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-[#152238] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
  );
};