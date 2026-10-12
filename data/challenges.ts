import type { Challenge } from '../types';

export const CHALLENGES: Challenge[] = [
    {
        id: 'challenge-1',
        title: '5-Ingredient Dinners',
        description: 'This week, create delicious meals using only 5 main ingredients. Show off your creativity!',
        theme: '5-Ingredient Dinners',
        isActive: true,
    },
    {
        id: 'challenge-2',
        title: 'No-Waste Weekend',
        description: 'Use up your expiring pantry items to create amazing weekend meals. Let nothing go to waste!',
        theme: 'No-Waste Weekend',
        isActive: false,
    },
     {
        id: 'challenge-3',
        title: 'Global Gourmet',
        description: 'Explore a new cuisine! Cook a dish from a country you\'ve never tried before.',
        theme: 'Global Gourmet',
        isActive: false,
    },
];
