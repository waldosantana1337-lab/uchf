
import React from 'react';
import type { Preferences } from '../types';

const PreferenceToggle: React.FC<{ label: string; isChecked: boolean; onChange: () => void }> = ({ label, isChecked, onChange }) => (
    <label className="flex items-center space-x-3 cursor-pointer group">
        <input
            type="checkbox"
            checked={isChecked}
            onChange={onChange}
            className="h-5 w-5 rounded border-gray-300 text-[#588517] focus:ring-[#588517] cursor-pointer transition-all"
        />
        <span className="text-[#1A1A1A] select-none group-hover:text-[#588517] transition-colors font-bold text-sm uppercase tracking-wide">{label}</span>
    </label>
);

const SkillLevelSelector: React.FC<{ value: string; onChange: (value: 'beginner' | 'intermediate' | 'expert') => void }> = ({ value, onChange }) => {
    const levels = ['beginner', 'intermediate', 'expert'];
    return (
        <div className="flex bg-gray-50 rounded-2xl p-1.5 w-full border border-gray-100">
            {levels.map(level => (
                <button
                    key={level}
                    type="button"
                    onClick={() => onChange(level as 'beginner' | 'intermediate' | 'expert')}
                    className={`flex-1 text-center capitalize px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${value === level ? 'bg-[#1A1A1A] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {level}
                </button>
            ))}
        </div>
    );
};

interface PreferencesFormProps {
    preferences: Preferences;
    onPreferenceChange: (field: keyof Preferences, value: string | number | boolean | string[]) => void;
}

const EQUIPMENT_OPTIONS = [
    { id: 'stove', label: 'Stove Top', icon: '♨️' },
    { id: 'oven', label: 'Oven', icon: '🔥' },
    { id: 'air_fryer', label: 'Air Fryer', icon: '💨' },
    { id: 'slow_cooker', label: 'Slow Cooker', icon: '🍲' },
    { id: 'instant_pot', label: 'Instant Pot', icon: '⚡' },
    { id: 'blender', label: 'Blender', icon: '🌪️' },
    { id: 'grill', label: 'Grill', icon: '🥩' },
    { id: 'microwave', label: 'Microwave', icon: '📻' },
];

export const PreferencesForm: React.FC<PreferencesFormProps> = ({ preferences, onPreferenceChange }) => {
    const toggleEquipment = (id: string) => {
        const current = preferences.equipment || [];
        const next = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
        onPreferenceChange('equipment', next);
    };

    return (
        <div className="space-y-12 py-8 px-2">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-700 font-black text-xs italic">1</span>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1A1A1A]">Dietary Restrictions</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <PreferenceToggle label="Gluten-Free" isChecked={preferences.isGlutenFree} onChange={() => onPreferenceChange('isGlutenFree', !preferences.isGlutenFree)} />
                    <PreferenceToggle label="Vegan" isChecked={preferences.isVegan} onChange={() => onPreferenceChange('isVegan', !preferences.isVegan)} />
                    <PreferenceToggle label="Vegetarian" isChecked={preferences.isVegetarian} onChange={() => onPreferenceChange('isVegetarian', !preferences.isVegetarian)} />
                    <PreferenceToggle label="Keto" isChecked={preferences.isKeto} onChange={() => onPreferenceChange('isKeto', !preferences.isKeto)} />
                    <PreferenceToggle label="Dairy-Free" isChecked={preferences.isDairyFree} onChange={() => onPreferenceChange('isDairyFree', !preferences.isDairyFree)} />
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-700 font-black text-xs italic">2</span>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1A1A1A]">Your Kitchen Profile</h4>
                </div>
                <p className="text-xs text-gray-400 font-bold px-2 uppercase tracking-widest">Select only what you have available right now:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                    {EQUIPMENT_OPTIONS.map(eq => (
                        <button
                            key={eq.id}
                            type="button"
                            onClick={() => toggleEquipment(eq.id)}
                            className={`p-5 rounded-[2rem] border-2 flex flex-col items-center gap-3 transition-all active:scale-90 shadow-sm ${preferences.equipment?.includes(eq.id) ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white' : 'bg-white border-gray-100 text-gray-300 hover:border-gray-200 hover:text-gray-600'}`}
                        >
                            <span className="text-3xl">{eq.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-none">{eq.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-black text-xs italic">3</span>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1A1A1A]">Skill & Style</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start p-8 bg-white border border-gray-100 rounded-[3rem]">
                    <div className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-1">Global Cuisine</label>
                            <input 
                                type="text" 
                                placeholder="e.g., Italian, Thai, Mediterranean..." 
                                value={preferences.cuisine} 
                                onChange={e => onPreferenceChange('cuisine', e.target.value)} 
                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-green-500/10 outline-none font-bold placeholder:text-gray-300" 
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-1">Comfort Level</label>
                            <SkillLevelSelector value={preferences.skillLevel} onChange={val => onPreferenceChange('skillLevel', val)} />
                        </div>
                    </div>
                    
                    <div className="space-y-8">
                        <div>
                            <label htmlFor="servings-slider" className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-1">
                                <span>Batch Size</span>
                                <span className="text-[#1A1A1A] bg-gray-50 px-3 py-1 rounded-full font-black text-xs">{preferences.servings} people</span>
                            </label>
                            <input
                                id="servings-slider"
                                type="range"
                                min="1"
                                max="8"
                                step="1"
                                value={preferences.servings}
                                onChange={e => onPreferenceChange('servings', parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
                            />
                        </div>
                        <div>
                            <label htmlFor="time-slider" className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 px-1">
                                <span>Max Effort Time</span>
                                <span className="text-[#1A1A1A] bg-gray-50 px-3 py-1 rounded-full font-black text-xs">{preferences.maxTime} mins</span>
                            </label>
                            <input
                                id="time-slider"
                                type="range"
                                min="15"
                                max="120"
                                step="15"
                                value={preferences.maxTime}
                                onChange={e => onPreferenceChange('maxTime', parseInt(e.target.value, 10))}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
