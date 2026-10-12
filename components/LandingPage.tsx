import React from 'react';
import { Welcome } from './Welcome';
import { InspirationGrid } from './InspirationGrid';
import { IntegrationsShowcase } from './IntegrationsShowcase';
import { useToast } from '../contexts/ToastContext';
import { useAppContext } from '../contexts/AppContext';



const MeetTheChefs: React.FC = () => {
    const chefs = [
        { id: 'zephyr', name: 'Zephyr', role: 'Efficiency Expert', desc: 'Minimal waste, maximum flavor. Precision-focused.', color: 'bg-green-500' },
        { id: 'atlas', name: 'Atlas', role: 'Master Chef', desc: 'Complex techniques made accessible for home cooks.', color: 'bg-blue-500' },
        { id: 'luna', name: 'Luna', role: 'Wellness Guide', desc: 'Nutrient-dense, soul-healing meals for longevity.', color: 'bg-purple-500' }
    ];

    return (
        <section className="container mx-auto px-4 max-w-4xl py-10 md:py-16 scroll-mt-24">
            <div className="text-left md:text-center mb-8 md:mb-10">
                <h2 className="text-2xl sm:text-3xl md:text-3xl font-black text-[#1A1A1A] tracking-tighter mb-2">Meet Your Personal AI Souls.</h2>
                <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium max-w-2xl md:mx-auto">Switch between distinct personalities tailored to your goals. Each chef brings a unique perspective to your ingredients.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {chefs.map(c => (
                    <div key={c.id} className="p-5 md:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
                        <div className={`h-1 w-10 ${c.color} rounded-full mb-4`}></div>
                        <h3 className="text-xl md:text-xl font-black italic mb-1 md:mb-1.5 tracking-tighter">{c.name}</h3>
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">{c.role}</p>
                        <p className="text-gray-600 text-xs md:text-xs leading-relaxed">{c.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

const LevelUpPreview: React.FC = () => {
    return (
        <section className="container mx-auto px-4 max-w-4xl py-10 md:py-16 scroll-mt-24">
            <div className="relative bg-[#1A1A1A] rounded-2xl md:rounded-[2.5rem] p-6 sm:p-8 md:p-12 overflow-hidden text-white flex flex-col md:flex-row items-center gap-6 md:gap-12 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_50%_50%,_#4d7c0f,_transparent)] pointer-events-none"></div>
                <div className="md:w-1/2 relative z-10 shrink-0 w-full">
                    <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-green-500 rounded-full flex items-center justify-center font-black text-sm md:text-xl text-black shadow-[0_0_30px_rgba(34,197,94,0.5)] animate-pulse">Lv 12</div>
                        <div>
                            <p className="text-[9px] md:text-xs font-black uppercase tracking-widest text-green-500">Waste Warrior II</p>
                            <h3 className="text-xl md:text-2xl font-black tracking-tighter">Gamified Growth.</h3>
                        </div>
                    </div>
                    <p className="text-sm md:text-base opacity-60 leading-relaxed italic pr-0 md:pr-4">Every gram of food saved earns you XP. Unlock exclusive recipes, unique badges, and AI tiers as you master your kitchen.</p>
                </div>
                <div className="md:w-1/2 w-full grid grid-cols-3 gap-2 md:gap-4 opacity-20 md:opacity-30">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-square bg-white/5 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center">
                            <div className="w-3 h-0.5 md:w-4 md:h-1 bg-white/20 rounded-full"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FaqSection: React.FC = () => {
    const faqs = [
        { q: "Is my data stored locally?", a: "By default, inventory data stays on your device using Secure Storage. Cloud sync is optional and encrypted." },
        { q: "Which AI model powers YouChef?", a: "We leverage Gemini 3.1 Pro for high-reasoning recipe logic and 2.5 Flash for rapid image generation." },
        { q: "Can I use it offline?", a: "Your pantry logs and saved recipes are accessible offline. AI-driven recipe generation requires an internet connection." }
    ];

    return (
        <section className="container mx-auto px-4 max-w-3xl py-10 md:py-24 scroll-mt-24 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tighter mb-6 md:mb-12 text-center uppercase italic">Technical Nuances</h2>
            <div className="space-y-6 md:space-y-10">
                {faqs.map(faq => (
                    <div key={faq.q}>
                        <h4 className="text-sm md:text-lg font-bold text-[#1A1A1A] mb-2 flex items-center gap-2 md:gap-3">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                            {faq.q}
                        </h4>
                        <p className="text-gray-500 text-xs md:text-sm leading-relaxed pl-4 md:pl-5 border-l-2 border-gray-100">{faq.a}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export const HeroSection: React.FC = () => {
    const { translate } = useAppContext();
    return (
        <div className="relative text-left md:text-center py-10 sm:py-12 md:py-16 px-4 sm:px-8 md:px-12 animate-fade-in rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] bg-white overflow-hidden shadow-2xl shadow-green-900/5 border border-green-50 mb-6 md:mb-10 mx-auto max-w-4xl">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-green-100 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-orange-50 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10">
                <div className="flex flex-col items-start md:items-center gap-3 mb-6 md:mb-8">
                    <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-[9px] md:text-[11px] font-black uppercase tracking-[0.25em] md:tracking-[0.3em] text-[#2D450D] bg-green-50 rounded-full border border-green-100/50 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                        {translate('heroTitle')}
                    </div>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-[#1A1A1A] tracking-tighter leading-[1.05] mb-3 md:mb-4 text-balance">
                    Stop Guessing.<br />
                    <span className="text-[#3F6112]">Start Cooking.</span>
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-3xl font-black text-[#1A1A1A] tracking-tighter mb-4 md:mb-6 leading-[1.1] text-balance">
                    {translate('heroSubtitle')}
                </p>
                <p className="max-w-xl md:mx-auto text-sm sm:text-base md:text-base lg:text-lg text-gray-600 font-medium leading-relaxed text-balance mb-5 md:mb-6">
                    The smart platform that transforms your specific fridge inventory and kitchen equipment into professional-grade home meals.
                </p>
                <div className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest flex flex-wrap items-center md:justify-center gap-3 md:gap-4">
                    <span>No Waste</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                    <span>No Stress</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                    <span>Just Food</span>
                </div>
            </div>
        </div>
    );
};

export const LandingPage: React.FC = () => {
    const { handleSelectInspirationRecipe, translate } = useAppContext();
    const { showToast } = useToast();
  
    const onNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        showToast("Welcome to the YouChef community!", 'success');
    };

    return (
        <div className="space-y-0 pb-10 md:pb-20">
            <div className="animate-slide-up pb-6 md:pb-12"><Welcome /></div>
            

            <section className="container mx-auto px-4 max-w-4xl text-left md:text-center py-10 md:py-16 scroll-mt-24">
                <h2 className="text-2xl sm:text-3xl md:text-3xl font-black text-[#1A1A1A] mb-2 tracking-tight">Your Kitchen, Your Rules.</h2>
                <p className="text-sm md:text-base text-gray-600 font-medium mb-6 md:mb-10">Whether you only have an Air Fryer or a fully stocked Master Chef suite, YouChef adapts to you.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="p-5 md:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-lg">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 rounded-xl md:rounded-2xl flex items-center justify-center text-green-700 mb-4 md:mx-auto">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <h3 className="text-base md:text-lg font-bold mb-2">Inventory First</h3>
                        <p className="text-gray-600 text-xs md:text-xs leading-relaxed">We prioritize ingredients already in your kitchen to fight food waste and save you money.</p>
                    </div>
                    <div className="p-5 md:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-lg">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 rounded-xl md:rounded-2xl flex items-center justify-center text-orange-700 mb-4 md:mx-auto">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <h3 className="text-base md:text-lg font-bold mb-2">Equipment Logic</h3>
                        <p className="text-gray-600 text-xs md:text-xs leading-relaxed">Filter by what you actually have. We won't suggest baking if you don't have an oven.</p>
                    </div>
                    <div className="p-5 md:p-6 bg-white rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-lg">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-700 mb-4 md:mx-auto">
                            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <h3 className="text-base md:text-lg font-bold mb-2">Dietary Safety</h3>
                        <p className="text-gray-600 text-xs md:text-xs leading-relaxed">Precision filtering for Keto, Vegan, Dairy-Free, and Gluten-Free lifestyles. Built-in ingredient swaps.</p>
                    </div>
                </div>
            </section>

            <MeetTheChefs />
            
            <LevelUpPreview />

            <IntegrationsShowcase />
            <div className="scroll-mt-24 pb-12 md:pb-16"><InspirationGrid onSelectInspirationRecipe={handleSelectInspirationRecipe} /></div>
            
            <FaqSection />

            <section className="bg-[#1A1A1A] p-6 sm:p-10 md:p-12 rounded-2xl md:rounded-[2.5rem] shadow-2xl text-left md:text-center text-white relative overflow-hidden max-w-4xl mx-auto scroll-mt-24 mb-12 md:mb-16">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full -mr-48 -mt-48 blur-[100px]"></div>
                 <div className="relative z-10">
                    <h2 className="text-2xl sm:text-4xl md:text-4xl font-black mb-4 tracking-tighter">Ready to Cook?</h2>
                    <p className="text-sm sm:text-base md:text-lg opacity-60 mb-6 max-w-2xl md:mx-auto font-medium leading-relaxed">
                        Join 50,000+ chefs making the most of their kitchen every single day.
                    </p>
                    <form onSubmit={onNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl md:mx-auto">
                        <input 
                            type="email" 
                            placeholder="chef@example.com" 
                            required 
                            className="flex-grow px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:ring-4 focus:ring-green-500/50 outline-none text-base font-semibold" 
                        />
                        <button type="submit" className="px-6 py-3 bg-green-500 text-black font-black text-sm rounded-xl hover:bg-green-400 transition-all active:scale-95 shadow-xl">
                            Join Free
                        </button>
                    </form>
                    <p className="mt-4 text-[9px] md:text-xs font-bold uppercase tracking-widest opacity-30">Weekly zero-waste recipes delivered to your inbox.</p>
                 </div>
            </section>
        </div>
    );
};
