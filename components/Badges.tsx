import React from 'react';
import { BADGE_DEFINITIONS } from '../services/achievementsService';
import type { BadgeId } from '../types';

interface BadgesDisplayProps {
    badgeIds: BadgeId[];
}

export const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ badgeIds }) => {
    if (badgeIds.length === 0) {
        return <p className="text-sm text-gray-500 italic">No badges earned yet. Start cooking!</p>;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {badgeIds.map(id => {
                const badge = BADGE_DEFINITIONS[id];
                if (!badge) return null;

                return (
                    <div key={id} className="relative group">
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full text-xl cursor-pointer">
                            {badge.icon}
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                            <h4 className="font-bold">{badge.name}</h4>
                            <p className="text-sm">{badge.description}</p>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-800 transform rotate-45 -mb-1.5"></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};