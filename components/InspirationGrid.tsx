import React, { useMemo } from 'react';
import { PRE_BUILT_RECIPES } from '../data/preBuiltRecipes';
import { getOptimizedUnsplashUrl, getUnsplashSrcSet } from '../utils/imageUtils';

interface InspirationGridProps {
  onSelectInspirationRecipe: (key: string) => void;
}

// Simple shuffle function to randomize the inspiration grid on each load
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

export const InspirationGrid: React.FC<InspirationGridProps> = ({ onSelectInspirationRecipe }) => {
  const inspirations = useMemo(() => {
    const allInspirations = Object.entries(PRE_BUILT_RECIPES).map(([key, recipe]) => ({
      key,
      title: recipe.recipeName,
      subtitle: recipe.description.split('.')[0], // Use first sentence as subtitle
      imageUrl: recipe.imageUrl || '',
      width: 800,
      height: 600,
    }));
    return shuffleArray(allInspirations).slice(0, 4);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelectInspirationRecipe(key);
    }
  };

  return (
    <div className="mt-10 md:mt-12">
      <div className="text-left md:text-center mb-6 md:mb-8 animate-fade-in-up" style={{ animationDelay: '800ms' }}>
        <h2 className="text-2xl md:text-3xl font-bold text-[#152238]">Tonight's Inspiration</h2>
        <p className="text-xs md:text-base text-gray-500 md:text-[#152238] text-balance">Not sure where to start? Try one of these&nbsp;ideas.</p>
        <p className="text-[10px] md:text-xs italic text-gray-400 md:text-[#152238] mt-1">Note: You may need to purchase ingredients you don't already have.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {inspirations.map((item, index) => (
          <div
            key={item.key}
            role="button"
            tabIndex={0}
            onClick={() => onSelectInspirationRecipe(item.key)}
            onKeyDown={(e) => handleKeyDown(e, item.key)}
            className="relative h-56 md:h-64 rounded-xl overflow-hidden group focus:outline-none focus:ring-4 focus:ring-[#588517] focus:ring-offset-2 animate-fade-in-up bg-gray-100 cursor-pointer"
            style={{ animationDelay: `${900 + index * 150}ms` }}
            aria-label={`View inspiration: ${item.title}`}
          >
            <img
              src={getOptimizedUnsplashUrl(item.imageUrl, 800)}
              srcSet={getUnsplashSrcSet(item.imageUrl)}
              sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 22vw"
              alt={`Inspiration for ${item.title}`}
              width={item.width}
              height={item.height}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                // A generic, appealing fallback image of food.
                e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800";
                e.currentTarget.onerror = null; 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 md:p-5 text-white text-left">
              <h3 className="text-base md:text-lg font-bold">{item.title}</h3>
              <p className="text-[10px] md:text-xs opacity-90 leading-tight">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};