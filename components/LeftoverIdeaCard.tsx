import React from 'react';
import type { LeftoverIdea } from '../types';

interface LeftoverIdeaCardProps {
    idea: LeftoverIdea;
}

const categoryStyles = {
    'New Dish': {
        icon: '🍳',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
    },
    'Enhancement': {
        icon: '✨',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
    },
    'Quick Snack': {
        icon: '🥪',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
    }
};

export const LeftoverIdeaCard: React.FC<LeftoverIdeaCardProps> = ({ idea }) => {
    const styles = categoryStyles[idea.category] || categoryStyles['New Dish'];

    return (
        <div className="p-4 bg-gray-50 border-l-4 border-orange-400 rounded-r-lg">
            <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-[#333333] pr-2">{idea.ideaName}</h4>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${styles.bgColor} ${styles.textColor}`}>
                    <span>{styles.icon}</span>
                    <span>{idea.category}</span>
                </div>
            </div>
            <p className="mt-2 text-sm text-gray-700">{idea.description}</p>
            
            {idea.extraIngredients && idea.extraIngredients.length > 0 && (
                <div className="mt-3 pt-3 border-t border-orange-200">
                    <h5 className="text-xs font-bold text-gray-600">You might need:</h5>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {idea.extraIngredients.map((ing, i) => (
                            <span key={i} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{ing}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};