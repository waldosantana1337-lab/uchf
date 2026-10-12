import React, { useState, useEffect, useRef } from 'react';
import type { Preferences, ChefSuggestion } from '../types';
import { Loader } from './Loader';
import { generateChefSuggestion } from '../services/geminiService';
import { PreferencesForm } from './PreferencesForm';
import { useAppContext } from '../contexts/AppContext';

const moodBasedPresets = [
    { id: 'cozy', label: 'Cozy Comfort', icon: '🛋️', prefs: { creativeTwist: 'simple comforting home meal' } },
    { id: 'energizing', label: 'Healthy/Light', icon: '⚡️', prefs: { creativeTwist: 'healthy and refreshing' } },
    { id: 'adventurous', label: 'Bold Flavors', icon: '🗺️', prefs: { creativeTwist: 'flavorful and unique' } },
    { id: 'quick', label: 'Super Fast', icon: '⏱️', prefs: { maxTime: 20, creativeTwist: 'super quick and easy' } }
];

export const IngredientInput: React.FC = () => {
    const {
        ingredients,
        setIngredients,
        isLoading,
        preferences,
        handlePreferenceChange,
        handleGenerate,
        onScanClick,
        handleStartOver,
        userProfile,
        includePantry,
        setIncludePantry,
        translate,
        language,
        setIsReceiptModalOpen,
    } = useAppContext();

    const [newIngredient, setNewIngredient] = useState('');
    const [isPrefsOpen, setIsPrefsOpen] = useState(false);
    const [chefSuggestion, setChefSuggestion] = useState<ChefSuggestion | null>(null);
    const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
    const [activeMood, setActiveMood] = useState<string | null>(null);
    const suggestionTimeoutRef = useRef<number | null>(null);
    
    const onAddIngredient = (ingredient: string) => {
        const cleaned = ingredient.trim().toLowerCase();
        if (cleaned && !ingredients.includes(cleaned)) {
            setIngredients(prev => [...prev, cleaned]);
        }
    };
    const onRemoveIngredient = (ingredient: string) => setIngredients(prev => prev.filter(i => i !== ingredient));

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newIngredient.trim()) {
            onAddIngredient(newIngredient);
            setNewIngredient('');
        }
    };
    
    const handleMoodClick = (preset: typeof moodBasedPresets[0]) => {
        if (activeMood === preset.id) {
            setActiveMood(null);
            handlePreferenceChange('creativeTwist', '');
        } else {
            setActiveMood(preset.id);
            Object.entries(preset.prefs).forEach(([key, value]) => {
                handlePreferenceChange(key as keyof Preferences, value);
            });
        }
    };

    useEffect(() => {
        if (suggestionTimeoutRef.current) window.clearTimeout(suggestionTimeoutRef.current);
        if (ingredients.length >= 3 && userProfile) {
            setIsSuggestionLoading(true);
            suggestionTimeoutRef.current = window.setTimeout(async () => {
                try {
                    const suggestion = await generateChefSuggestion(ingredients, userProfile.selectedChef, language);
                    setChefSuggestion(suggestion);
                } finally { setIsSuggestionLoading(false); }
            }, 2000);
        } else {
            setChefSuggestion(null);
        }
    }, [ingredients, userProfile, language]);

    const hasIngredients = ingredients.length > 0;

    return (
        <div className="bg-white p-6 sm:p-10 md:p-12 rounded-2xl md:rounded-[2.5rem] shadow-2xl border border-gray-50 max-w-4xl mx-auto relative z-10 transition-all hover:shadow-green-900/5">
            <div className="mb-8 text-center">
                <p className="text-[#3F6112] font-black text-xs uppercase tracking-[0.3em] mb-2 animate-slide-up-subtle">From Fridge to Feast.</p>
                <h2 className="text-3xl md:text-4xl font-black text-[#1A1A1A] tracking-tighter mb-3 leading-none">What's in your kitchen?</h2>
                <p className="text-gray-500 font-medium text-base max-w-xl mx-auto mb-6 leading-relaxed">List your ingredients and we'll handle the rest based on your available equipment.</p>
                <div className="flex flex-wrap justify-center gap-3">
                    {moodBasedPresets.map(preset => (
                        <button 
                            key={preset.id}
                            onClick={() => handleMoodClick(preset)}
                            className={`btn-active-scale px-6 py-2.5 rounded-2xl border-2 font-black transition-all flex items-center gap-2 text-xs tracking-tight ${activeMood === preset.id ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:border-[#3F6112] hover:text-[#3F6112]'}`}
                        >
                            <span className="text-lg">{preset.icon}</span>
                            <span>{preset.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6 max-w-4xl mx-auto items-stretch">
                <form onSubmit={handleAdd} className="relative flex-1 group">
                    <input
                        type="text"
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        placeholder={language === 'es' ? "Ingresa artículos (ej. Huevos, Pasta...)" : "Add items... (Chicken, Spinach, Eggs)"}
                        className="w-full pl-6 pr-24 sm:pr-28 py-5 bg-gray-50 border-2 border-transparent rounded-2xl text-lg font-bold focus:bg-white focus:ring-4 focus:ring-[#3F6112]/5 focus:border-[#3F6112] outline-none transition-all placeholder:text-gray-300 shadow-inner"
                    />
                    <div className="absolute right-2 top-2 bottom-2 flex">
                        <button type="submit" className="btn-active-scale px-5 sm:px-6 bg-[#1A1A1A] text-white font-bold text-sm sm:text-base rounded-xl hover:opacity-90 transition-all shadow-xl">
                            {translate('add')}
                        </button>
                    </div>
                </form>

                {/* AI Vision Scanner Actions right next to the ingredient input */}
                <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => setIsReceiptModalOpen(true)}
                        className="btn-active-scale flex-1 sm:flex-initial px-4 sm:px-5 py-3 sm:py-0 bg-amber-50/90 hover:bg-amber-100 border-2 border-amber-200 text-amber-900 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-md group"
                        title="Scan Grocery Receipt"
                        aria-label="Scan Grocery Receipt"
                    >
                        <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">🧾</span>
                        <div className="text-left">
                            <span className="block leading-none font-black text-xs sm:text-sm">Scan Receipt</span>
                            <span className="text-[10px] text-amber-700/80 font-bold hidden sm:block mt-0.5">Auto-Import</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={onScanClick}
                        className="btn-active-scale flex-1 sm:flex-initial px-4 sm:px-5 py-3 sm:py-0 bg-green-50/90 hover:bg-green-100 border-2 border-green-200 text-[#2D450D] rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-md group"
                        title="Scan Fridge or Pantry Photo"
                        aria-label="Scan Fridge or Pantry"
                    >
                        <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">📷</span>
                        <div className="text-left">
                            <span className="block leading-none font-black text-xs sm:text-sm">Scan Fridge</span>
                            <span className="text-[10px] text-green-700/80 font-bold hidden sm:block mt-0.5">Photo Scan</span>
                        </div>
                    </button>
                </div>
            </div>

            {hasIngredients && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-8 animate-fade-in max-w-4xl mx-auto">
                    {ingredients.map((ing, i) => (
                        <div key={i} className="flex items-center gap-2 px-4 py-2 bg-green-50/50 border border-green-100 rounded-xl text-sm font-bold text-[#2D450D] shadow-sm group">
                            <span className="capitalize">{ing}</span>
                            <button onClick={() => onRemoveIngredient(ing)} className="opacity-40 group-hover:opacity-100 hover:text-red-600 transition-all text-xl" aria-label={`Remove ${ing}`}>&times;</button>
                        </div>
                    ))}
                    <button onClick={handleStartOver} className="btn-active-scale px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-red-500 transition-colors">{translate('clearAll')}</button>
                </div>
            )}
            
            <div className="pt-8 border-t border-gray-50 flex flex-col gap-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <button 
                        onClick={() => setIsPrefsOpen(!isPrefsOpen)} 
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${isPrefsOpen ? 'bg-[#1A1A1A] text-white' : 'bg-gray-50 text-gray-400 hover:text-[#1A1A1A] hover:bg-white border border-transparent hover:border-gray-100'}`}
                    >
                        {isPrefsOpen ? "Close Kitchen Profile" : "Edit Kitchen Profile (Filters)"}
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-500 ${isPrefsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {userProfile && (
                        <label className="flex items-center gap-4 cursor-pointer group bg-white p-3 rounded-2xl border border-gray-100 hover:border-green-100 transition-all">
                            <input type="checkbox" checked={includePantry} onChange={() => setIncludePantry(!includePantry)} className="h-6 w-6 rounded-lg border-gray-200 text-[#3F6112] focus:ring-[#3F6112] transition-all" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#3F6112]">{translate('includePantry')}</span>
                        </label>
                    )}
                </div>

                {isPrefsOpen && (
                    <div className="animate-slide-up-subtle overflow-hidden">
                        <PreferencesForm preferences={preferences} onPreferenceChange={handlePreferenceChange} />
                    </div>
                )}
                
                <button
                    onClick={() => handleGenerate()}
                    disabled={isLoading || !hasIngredients}
                    className="btn-active-scale w-full py-5 bg-[#3F6112] text-white font-black text-xl sm:text-2xl rounded-2xl shadow-2xl shadow-green-900/20 hover:scale-[1.01] hover:shadow-green-900/30 transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {isLoading ? (
                        <div className="flex items-center justify-center gap-6">
                            <div className="scale-150"><Loader /></div>
                            <span className="animate-pulse">{translate('generatingMeals')}</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-3">
                            <span>Get Recipes</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                    )}
                </button>
                {!hasIngredients && !isLoading && (
                    <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 animate-pulse">Add ingredients to begin magic</p>
                )}
            </div>
        </div>
    );
};