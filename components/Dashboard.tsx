import React from 'react';
import type { UserProfile, Recipe } from '../types';
import { Onboarding } from './Onboarding';
import { useAppContext } from '../contexts/AppContext';
import { Loader } from './Loader';

interface DashboardProps {}

const differenceInDays = (date1: Date, date2: Date) => {
    const diffTime = date1.getTime() - date2.getTime();
    if (isNaN(diffTime)) return Infinity;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const ImpactStat: React.FC<{ value: string | number; label: string; icon: React.ReactNode; isUrgent?: boolean }> = ({ value, label, icon, isUrgent }) => (
    <div className={`flex flex-col items-center text-center p-6 rounded-[2.5rem] transition-all duration-500 border ${isUrgent ? 'bg-orange-50 border-orange-200' : 'bg-white/50 backdrop-blur-md border-white hover:bg-white hover:shadow-2xl hover:-translate-y-1 shadow-sm'}`}>
        <div className={`flex items-center justify-center h-14 w-14 rounded-[1.5rem] mb-4 shadow-sm ${isUrgent ? 'bg-orange-100 text-[#C2410C]' : 'bg-green-50 text-[#2D450D]'}`}>
            {icon}
        </div>
        <p className={`text-3xl font-black tracking-tighter ${isUrgent ? 'text-[#C2410C]' : 'text-[#2D450D]'}`}>{value}</p>
        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-gray-400 leading-tight">{label}</p>
    </div>
);

const Dashboard: React.FC<DashboardProps> = () => {
    const { 
        userProfile, 
        handleNavigate, 
        handleViewRecipe, 
        handleCookWithIngredients, 
        handleDismissOnboarding,
        userImpactStats 
    } = useAppContext();

    // Critical guard: If profile is missing (split second transition), render a beautiful loader
    if (!userProfile) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center bg-white/40 backdrop-blur-xl border border-white/60 rounded-[3rem]">
                <div className="scale-125 mb-4"><Loader /></div>
                <p className="font-black uppercase tracking-[0.2em] text-[#3F6112] text-xs">Loading kitchen profile...</p>
            </div>
        );
    }

    const today = new Date();
    const month = today.toLocaleString('en-US', { month: 'long' });
    const todayString = today.toISOString().split('T')[0];
    const todaysMeal = userProfile.mealPlan?.[todayString]?.[0];

    const expiringItems = (userProfile.pantry || [])
        .filter(item => item.inStock && item.expiresOn)
        .map(item => ({
            ...item,
            daysLeft: differenceInDays(new Date(item.expiresOn as string), today),
        }))
        .filter(item => item.daysLeft >= 0 && item.daysLeft <= 2)
        .sort((a, b) => a.daysLeft - b.daysLeft);
        
    const streak = userProfile.cookingStreak || 0;
    const cookedCount = (userProfile.cookedHistory || []).length;

    return (
        <div className="animate-fade-in space-y-12 max-w-4xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/30 backdrop-blur-md p-6 sm:p-8 rounded-2xl md:rounded-3xl border border-white/50">
                <div className="text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tighter leading-none">Culinary Pulse</h2>
                    <p className="text-gray-500 font-medium mt-2 text-sm">Welcome back, Chef {userProfile.displayName || userProfile.username}.</p>
                </div>
                <div className="flex items-center gap-3 px-5 py-2.5 bg-white/80 rounded-2xl shadow-sm border border-white">
                    <span className="text-xl">🗓️</span>
                    <div className="text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Season</p>
                        <p className="text-xs font-bold text-[#1A1A1A]">{month} Peaks</p>
                    </div>
                </div>
            </header>

            {!userProfile.onboardingCompleted && (
                <Onboarding userProfile={userProfile} onDismiss={handleDismissOnboarding} />
            )}

            <section>
                <div className="flex items-center justify-between mb-6 px-4">
                    <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">Kitchen Impact Stats</h2>
                    <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md">Live Updates</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <ImpactStat 
                        value={streak}
                        label="Day Streak"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 18.657A8.25 8.25 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7.014A8.25 8.25 0 0117.657 18.657z" /></svg>}
                    />
                    <ImpactStat 
                        value={`${userImpactStats?.foodSaved || 0}kg`}
                        label="Carbon Offset"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                    />
                    <ImpactStat 
                        value={`$${userImpactStats?.moneySaved || 0}`}
                        label="Savings Log"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <ImpactStat 
                        value={cookedCount}
                        label="Cooked Rank"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-4.312 2.733-4.312 2.733S5.1 3.75 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>}
                    />
                </div>
            </section>

            <section>
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em] mb-6 px-4">The Next Step</h2>
                {expiringItems.length > 0 ? (
                    <div className="bg-gradient-to-br from-[#C2410C] to-[#7C2D12] p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl shadow-2xl text-white flex flex-col md:flex-row justify-between items-center gap-6 group transition-all duration-700 hover:shadow-orange-900/40">
                        <div className="text-center md:text-left relative">
                            <div className="absolute -left-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                            <span className="inline-block px-3 py-1 bg-white text-[#C2410C] text-[9px] font-black uppercase tracking-[0.2em] rounded-full mb-4">Rescue Alert</span>
                            <h3 className="text-2xl md:text-3xl font-black tracking-tighter leading-none mb-2 italic-display">Save the {expiringItems[0].name}</h3>
                            <p className="text-orange-100 font-medium text-sm max-w-md">Critical window: Expires {expiringItems[0].daysLeft === 0 ? 'today' : `in ${expiringItems[0].daysLeft} days`}. Let's transform it.</p>
                        </div>
                        <button
                            onClick={() => handleCookWithIngredients(expiringItems.map(i => i.name))}
                            className="btn-active-scale px-8 py-4 bg-white text-[#1A1A1A] font-bold text-base rounded-xl shadow-xl hover:bg-orange-50 transition-all flex items-center gap-3"
                        >
                            <span>Cook Now</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth={3} strokeLinecap="round" /></svg>
                        </button>
                    </div>
                ) : todaysMeal ? (
                    <div className="bg-white p-6 sm:p-8 rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-8 group hover:shadow-2xl transition-all duration-700">
                        <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden shadow-2xl flex-shrink-0 relative">
                            <img src={todaysMeal.imageUrl} alt={todaysMeal.recipeName} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"/>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <div className="flex-grow text-center md:text-left">
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full inline-block mb-3">Meal Plan Priority</span>
                            <h3 className="text-2xl md:text-3xl font-black text-[#1A1A1A] tracking-tighter italic-display leading-none mb-3">{todaysMeal.recipeName}</h3>
                            <p className="text-gray-500 mt-2 text-sm line-clamp-2 font-medium max-w-lg">{todaysMeal.description}</p>
                            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3">
                                <button
                                    onClick={() => handleViewRecipe(todaysMeal)}
                                    className="btn-active-scale px-6 py-3 bg-[#1A1A1A] text-white font-bold text-sm rounded-xl hover:bg-green-600 transition-all shadow-xl"
                                >
                                    Launch Mentor Mode
                                </button>
                                <button
                                    onClick={() => handleNavigate('mealPlanner')}
                                    className="btn-active-scale px-5 py-3 bg-gray-50 text-gray-400 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                                >
                                    Reschedule
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/40 backdrop-blur-xl border-4 border-dashed border-white/60 p-10 md:p-14 rounded-2xl md:rounded-3xl text-center group hover:border-green-200 transition-all">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                             <svg className="w-8 h-8 text-gray-200 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </div>
                        <p className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tighter italic-display">Your stove is quiet today.</p>
                        <p className="text-gray-400 mt-2 text-sm font-medium">Add ingredients to ignite your kitchen brain.</p>
                        <button
                            onClick={() => document.getElementById('ingredient-input-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="btn-active-scale mt-6 px-8 py-4 bg-white border-2 border-green-100 text-[#2D450D] font-black text-sm rounded-xl hover:bg-green-50 transition-all shadow-lg"
                        >
                            Open Ingredient Scanner
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;