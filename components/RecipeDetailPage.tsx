
import React, { useState, useEffect } from 'react';
import type { Recipe, PairingSuggestion, SmartTip } from '../types';
import { generatePairings, generateSmartTips, getChefSecret } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import MarkAsCookedModal from './MarkAsCookedModal';
import { useAppContext } from '../contexts/AppContext';
import { trackEvent } from '../services/analyticsService';
import { Loader } from './Loader';

const ChefSecretSection: React.FC<{ 
    recipeName: string; 
    ingredients: string[]; 
    personality: string; 
    language: any 
}> = ({ recipeName, ingredients, personality, language }) => {
    const [secret, setSecret] = useState<{ technique: string; enhancement: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSecret = async () => {
            try {
                const res = await getChefSecret(recipeName, ingredients, personality as any, language);
                setSecret(res);
            } finally {
                setLoading(false);
            }
        };
        fetchSecret();
    }, [recipeName]);

    if (loading) return (
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-pulse flex flex-col items-center">
            <Loader />
            <p className="mt-2 text-[10px] font-black uppercase text-gray-400">Loading Chef's Secret...</p>
        </div>
    );

    if (!secret) return null;

    return (
        <div className="p-6 sm:p-8 bg-[#1A1A1A] text-white rounded-2xl md:rounded-3xl shadow-2xl relative overflow-hidden group border border-white/10">
            <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            </div>
            <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-green-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full mb-4">Mastery Insight</span>
                <h3 className="text-xl md:text-2xl font-black mb-3 tracking-tighter italic-display text-green-400">The Secret: {secret.technique}</h3>
                <p className="text-base text-gray-300 font-medium leading-relaxed max-w-2xl">{secret.enhancement}</p>
            </div>
        </div>
    );
};

const NutritionTable: React.FC<{ nutrition: Recipe['nutrition'] }> = ({ nutrition }) => {
    const stats = [
        { label: 'Calories', value: nutrition?.calories?.replace(/[a-zA-Z]/g, '') || '0', icon: '🔥' },
        { label: 'Protein', value: nutrition?.protein || '0g', icon: '🥩' },
        { label: 'Carbs', value: nutrition?.carbs || '0g', icon: '🥖' },
        { label: 'Fat', value: nutrition?.fat || '0g', icon: '🥑' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {stats.map((s) => (
                <div key={s.label} className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white/30 shadow-sm transition-all hover:border-green-100 hover:shadow-xl">
                    <span className="text-xl block mb-1">{s.icon}</span>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{s.label}</p>
                    <p className="text-xl font-black text-[#1A1A1A]">{s.value}</p>
                </div>
            ))}
        </div>
    );
};

const RecipeDetailPage: React.FC<{ 
    recipe: Recipe; 
    onGoBack: () => void;
}> = ({ recipe, onGoBack }) => {
    const { handleMarkAsCooked, translate, language, userProfile } = useAppContext();
    const [smartTips, setSmartTips] = useState<SmartTip[]>([]);
    const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
    const [isCookedModalOpen, setIsCookedModalOpen] = useState(false);
    const [pairings, setPairings] = useState<PairingSuggestion | null>(null);
    const [initialPhotoUrl, setInitialPhotoUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (recipe) {
            trackEvent('RECIPE_VIEWED', { recipeName: recipe.recipeName, cuisine: recipe.cuisine });
        }
        const fetchMetadata = async () => {
            try {
                const [tips, pResults] = await Promise.all([
                    generateSmartTips(recipe.instructions || [], language),
                    generatePairings(recipe.recipeName, recipe.ingredients || [], language)
                ]);
                setSmartTips(tips || []);
                setPairings(pResults);
            } catch (e) { console.error("[SRE] fetch failed", e); }
        };
        fetchMetadata();
    }, [recipe.recipeName, language]);

    if (!recipe) return <div className="text-center py-24 font-black text-gray-300">Recipe Load Error</div>;

    return (
        <div className="animate-fade-in pb-24 max-w-4xl mx-auto px-4">
            <button onClick={onGoBack} className="btn-active-scale mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1A1A1A] transition-all bg-white/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                {translate('backToRecipes')}
            </button>

            <article className="bg-white/40 backdrop-blur-xl rounded-2xl md:rounded-[2rem] shadow-2xl overflow-hidden border border-white/50">
                <div className="relative h-[40vh] md:h-[45vh] group">
                    <img 
                        src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop"} 
                        alt={recipe.recipeName} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="inline-block px-3 py-1 bg-green-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl">Chef Authenticated</span>
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-white/30">{recipe.prepTime}</span>
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest rounded-full border border-white/30 capitalize">{recipe.difficulty}</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight max-w-4xl italic-display">{recipe.recipeName}</h1>
                    </div>
                </div>
                
                <div className="p-6 md:p-12 space-y-12">
                    <section className="animate-slide-up-subtle">
                        <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6">The Nutritional Canvas</h2>
                        <NutritionTable nutrition={recipe.nutrition} />
                    </section>

                    <ChefSecretSection 
                        recipeName={recipe.recipeName} 
                        ingredients={recipe.ingredients} 
                        personality={userProfile?.selectedChef || 'zephyr'} 
                        language={language} 
                    />

                    <div className="flex flex-col lg:flex-row gap-12 md:gap-16">
                        <aside className="lg:w-1/3">
                            <div className="sticky top-24 space-y-12">
                                <div>
                                    <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tighter mb-6 border-b-4 border-green-500/20 pb-2 inline-block">{translate('ingredients')}</h2>
                                    <ul className="space-y-4">
                                        {recipe.ingredients.map((ing, i) => (
                                            <li key={i} className="flex items-start gap-3 group cursor-pointer" onClick={() => setCheckedIngredients(prev => { const s = new Set(prev); if (s.has(ing)) s.delete(ing); else s.add(ing); return s; })}>
                                                <div className={`mt-0.5 h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${checkedIngredients.has(ing) ? 'bg-green-500 border-green-500 shadow-lg shadow-green-200' : 'border-gray-200 group-hover:border-green-300'}`}>
                                                    {checkedIngredients.has(ing) && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7"/></svg>}
                                                </div>
                                                <span className={`text-base font-bold leading-tight transition-all ${checkedIngredients.has(ing) ? 'line-through text-gray-300 scale-95 opacity-50' : 'text-[#1A1A1A]'}`}>{ing}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-5 bg-green-50/50 rounded-2xl border border-green-100 flex flex-col items-center text-center">
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-green-700 mb-1">Show off your skills</p>
                                    <p className="text-xs font-medium text-green-800 mb-3 px-2 text-balance">Snap a photo of your dish and earn +100 bonus XP!</p>
                                    <label className="btn-active-scale cursor-pointer px-4 py-2.5 bg-white text-green-700 font-black text-[9px] uppercase tracking-widest rounded-lg border border-green-200 shadow-sm hover:bg-green-100 transition-all">
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        const result = reader.result as string;
                                                        // Pre-populate photo and open modal
                                                        setInitialPhotoUrl(result);
                                                        setIsCookedModalOpen(true);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                        Upload & Log
                                    </label>
                                </div>
                                
                                {pairings && (
                                    <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100 space-y-4 shadow-inner">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#7C2D12]">Curated Accompaniment</h3>
                                        <div>
                                            <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Sommelier Suggestion</p>
                                            <p className="text-lg font-black text-[#7C2D12] tracking-tighter">{pairings.wine.name}</p>
                                            <p className="text-xs text-orange-700/70 mt-1.5 italic">"{pairings.wine.reason}"</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>

                        <main className="lg:w-2/3 space-y-12">
                            <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tighter border-b-4 border-green-500/20 pb-2 inline-block">{translate('instructions')}</h2>
                            <ol className="space-y-8">
                                {(recipe.instructions || []).map((step, i) => (
                                    <li key={i} className="flex gap-4 group">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 text-[#1A1A1A] flex items-center justify-center font-black text-sm shadow-sm group-hover:bg-[#1A1A1A] group-hover:text-white group-hover:-translate-y-0.5 transition-all duration-500">
                                            {i + 1}
                                        </div>
                                        <div className="text-base md:text-lg text-[#1A1A1A] leading-relaxed font-medium pt-1 text-balance group-hover:translate-x-1.5 transition-transform duration-500">
                                            {step}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                            
                            <div className="pt-12 border-t border-gray-100 flex justify-center">
                                <button onClick={() => setIsCookedModalOpen(true)} className="btn-active-scale px-8 py-4 bg-[#1A1A1A] text-white font-bold text-lg rounded-xl shadow-2xl hover:bg-green-600 transition-all duration-500 hover:shadow-green-500/30">
                                    {translate('iCookedThis')}!
                                </button>
                            </div>
                        </main>
                    </div>
                </div>
            </article>
            <MarkAsCookedModal 
                isOpen={isCookedModalOpen} 
                recipeName={recipe.recipeName} 
                onClose={() => {
                    setIsCookedModalOpen(false);
                    setInitialPhotoUrl(undefined);
                }} 
                onSave={(cd, n, r, p) => {
                    handleMarkAsCooked(recipe, cd, n, r, p);
                }}
                initialPhotoUrl={initialPhotoUrl}
            />
        </div>
    );
};
export default RecipeDetailPage;
