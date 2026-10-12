import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Loader } from './Loader';

const FridgeIcon = () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
const AddIcon = () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>;
const ClockIcon = () => <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export const FridgeMode: React.FC = () => {
    const { 
        userProfile, 
        ingredients, 
        setIngredients, 
        handleGenerate, 
        recipes, 
        isLoading, 
        handlePreferenceChange, 
        handleViewRecipe, 
        setIsFridgeMode 
    } = useAppContext();
    
    const [activeTab, setActiveTab] = useState<'recipes' | 'add' | 'quick'>('recipes');
    const [inputVal, setInputVal] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus input when the 'add' tab is active
    useEffect(() => {
        if (activeTab === 'add') {
            // Small timeout to ensure the DOM is ready after tab switch animation/render
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [activeTab]);

    useEffect(() => {
        const pantry = userProfile?.pantry?.filter(p => p.inStock).map(p => p.name) || [];
        if (activeTab === 'recipes' && (!recipes || recipes.length === 0) && !isLoading && pantry.length > 0) {
            setIngredients(pantry);
            handleGenerate(pantry);
        } else if (activeTab === 'quick' && (!recipes || recipes.length === 0) && !isLoading && pantry.length > 0) {
             setIngredients(pantry);
             handlePreferenceChange('maxTime', 30);
             handleGenerate(pantry);
        }
    }, [activeTab, userProfile, recipes, isLoading, handleGenerate, handlePreferenceChange, setIngredients]);

    return (
        <div className="fixed inset-0 bg-[#F5F1E9] z-[100] flex flex-col font-sans select-none overflow-hidden" role="main" aria-label="Smart Fridge Hub">
            {/* Massive Header */}
            <header className="p-10 bg-white shadow-lg flex justify-between items-center z-10">
                <button onClick={() => setIsFridgeMode(false)} className="px-10 py-6 bg-gray-100 text-gray-800 font-black text-2xl rounded-3xl active:scale-95 focus:ring-8 focus:ring-[#588517]/30 transition-all">
                    EXIT HUB
                </button>
                <div className="text-center">
                    <h1 className="text-5xl font-black text-[#333333] tracking-tighter">YOUCHEF <span className="text-[#588517]">HUB</span></h1>
                    <p className="text-xl font-bold text-[#3F6112] uppercase tracking-[0.2em] mt-1">From Fridge to Feast.</p>
                </div>
                <div className="flex items-center gap-4 px-6 py-4 bg-green-50 rounded-2xl">
                     <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                     <span className="text-xl font-black text-green-700 uppercase">Live Kitchen Logic Online</span>
                </div>
            </header>

            {/* Dynamic Content Area */}
            <main className="flex-grow overflow-y-auto p-12 scroll-smooth bg-gradient-to-b from-transparent to-white/50">
                <div className="max-w-[1800px] mx-auto">
                    {activeTab === 'add' && (
                        <div className="max-w-4xl mx-auto mt-20 text-center animate-slide-up">
                            <h2 className="text-6xl font-black text-[#333333] mb-12">Found something?</h2>
                            <form onSubmit={(e) => { e.preventDefault(); if(inputVal.trim()) { setIngredients(p => [...p, inputVal.trim().toLowerCase()]); setInputVal(''); } }} className="space-y-10">
                                <input 
                                    ref={inputRef}
                                    type="text" 
                                    value={inputVal} 
                                    onChange={e => setInputVal(e.target.value)} 
                                    placeholder="Tap to type... (Milk, Salmon, etc.)" 
                                    className="w-full p-16 text-6xl border-[12px] border-gray-100 rounded-[4rem] focus:border-[#588517] outline-none text-center shadow-inner font-black placeholder:text-gray-200"
                                />
                                <div className="grid grid-cols-2 gap-10">
                                    <button type="submit" className="p-12 bg-[#588517] text-white text-5xl font-black rounded-[3rem] shadow-2xl active:scale-95 transition-all">ADD ITEM</button>
                                    <button type="button" onClick={() => setIngredients([])} className="p-12 bg-white border-8 border-gray-100 text-gray-400 text-5xl font-black rounded-[3rem] active:scale-95 transition-all">CLEAR LIST</button>
                                </div>
                            </form>
                            <div className="mt-20 flex flex-wrap justify-center gap-8">
                                {ingredients.map((ing, i) => (
                                    <span key={i} className="px-10 py-5 bg-white border-8 border-green-50 rounded-full text-4xl font-black text-green-800 shadow-sm capitalize animate-fade-in">
                                        {ing}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {(activeTab === 'recipes' || activeTab === 'quick') && (
                        <div className="animate-fade-in">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-[60vh]">
                                    <div className="scale-[3] text-[#588517] mb-20"><Loader /></div>
                                    <p className="text-5xl font-black text-[#333333] animate-pulse uppercase tracking-tighter">Consulting the Master Chefs...</p>
                                </div>
                            ) : recipes ? (
                                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-16">
                                    {recipes.map((r, i) => (
                                        <div key={i} onClick={() => handleViewRecipe(r)} className="bg-white rounded-[4rem] shadow-2xl overflow-hidden active:scale-[0.98] transition-all cursor-pointer border-[10px] border-transparent hover:border-green-300">
                                            <div className="relative h-[500px]">
                                                <img src={r.imageUrl} className="w-full h-full object-cover" alt="" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                <div className="absolute bottom-10 left-10 right-10">
                                                    <h3 className="text-5xl font-black text-white mb-4 leading-tight uppercase">{r.recipeName}</h3>
                                                    <div className="flex gap-4">
                                                        <span className="px-4 py-2 bg-green-500 text-white text-xl font-bold rounded-xl uppercase">{r.cuisine}</span>
                                                        <span className="px-4 py-2 bg-white/20 backdrop-blur-md text-white text-xl font-bold rounded-xl uppercase">{r.pantryMatchPercentage}% MATCH</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-12">
                                                <p className="text-3xl text-gray-500 font-bold line-clamp-3 leading-relaxed">{r.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                 </div>
                            ) : (
                                <div className="text-center mt-40">
                                    <p className="text-6xl text-gray-200 font-black tracking-tighter uppercase mb-12">Kitchen Hub Ready</p>
                                    <p className="text-xl font-bold text-[#3F6112] uppercase tracking-[0.2em] mb-12">From Fridge to Feast.</p>
                                    <button onClick={() => setActiveTab('add')} className="px-24 py-12 bg-[#588517] text-white text-5xl font-black rounded-full shadow-2xl active:scale-95 transition-all">START ADDING</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Massive Tab Bar */}
            <nav className="h-64 bg-white shadow-[0_-20px_60px_rgba(0,0,0,0.08)] flex justify-around items-stretch p-6 border-t-[8px] border-gray-50" role="tablist">
                <button onClick={() => setActiveTab('recipes')} role="tab" aria-selected={activeTab === 'recipes'} className={`flex flex-col items-center justify-center gap-4 rounded-[3rem] w-1/3 transition-all ${activeTab === 'recipes' ? 'text-[#588517] bg-green-50 shadow-inner font-black' : 'text-gray-300 font-bold'}`}>
                    <FridgeIcon />
                    <span className="text-3xl uppercase tracking-tighter">Recipes</span>
                </button>
                <button onClick={() => setActiveTab('add')} role="tab" aria-selected={activeTab === 'add'} className={`flex flex-col items-center justify-center gap-4 rounded-[3rem] w-1/3 transition-all ${activeTab === 'add' ? 'text-[#588517] bg-green-50 shadow-inner font-black' : 'text-gray-300 font-bold'}`}>
                    <AddIcon />
                    <span className="text-3xl uppercase tracking-tighter">Inventory</span>
                </button>
                <button onClick={() => setActiveTab('quick')} role="tab" aria-selected={activeTab === 'quick'} className={`flex flex-col items-center justify-center gap-4 rounded-[3rem] w-1/3 transition-all ${activeTab === 'quick' ? 'text-[#588517] bg-green-50 shadow-inner font-black' : 'text-gray-300 font-bold'}`}>
                    <ClockIcon />
                    <span className="text-3xl uppercase tracking-tighter">Under 30m</span>
                </button>
            </nav>
        </div>
    );
};
