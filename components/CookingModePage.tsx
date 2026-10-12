import React, { useState, useEffect, useRef } from 'react';
import type { Recipe } from '../types';
import { useSousChef } from '../hooks/useSousChef';
import { useAppContext } from '../contexts/AppContext';

interface CookingModePageProps {
    recipe: Recipe;
    onExit: () => void;
}

const CookingModePage: React.FC<CookingModePageProps> = ({
    recipe,
    onExit,
}) => {
    const { userProfile } = useAppContext();
    const {
        isListening,
        toggleListening,
        transcript,
        isAudioPlaying,
        modelResponse
    } = useSousChef({
        recipe,
        personality: userProfile?.selectedChef || 'zephyr',
        onExit
    });

    const [currentStep, setCurrentStep] = useState(0);
    const steps = recipe.instructions || [];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#F5F1E9] z-50 flex flex-col overflow-hidden animate-fade-in">
            {/* Immersive Header */}
            <header className="p-6 bg-white shadow-md flex justify-between items-center z-10">
                <button onClick={onExit} className="px-6 py-2 bg-gray-100 text-gray-800 font-black text-sm uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all">
                    Exit Mentor Mode
                </button>
                <div className="text-center">
                    <h2 className="text-xl font-black text-[#1A1A1A] tracking-tight truncate max-w-[200px] sm:max-w-md">{recipe.recipeName}</h2>
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Step {currentStep + 1} of {steps.length}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 hidden sm:block">
                        {isListening ? 'Listening' : 'Voice Standby'}
                    </span>
                </div>
            </header>

            {/* Main Mentor Interface */}
            <main className="flex-grow flex flex-col items-center justify-center p-8 relative">
                <div className="w-full max-w-4xl space-y-12 text-center">
                    <div className="space-y-4 animate-slide-up-subtle">
                        <span className="text-sm font-black text-[#588517] uppercase tracking-[0.3em]">Current Instruction</span>
                        <h3 className="text-3xl md:text-5xl font-black text-[#1A1A1A] leading-tight text-balance italic-display">
                            {steps[currentStep]}
                        </h3>
                    </div>

                    {/* Model Dialogue Visualization */}
                    <div className="min-h-[100px] flex flex-col items-center justify-center">
                        {modelResponse && (
                            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-green-100 max-w-2xl animate-fade-in">
                                <p className="text-lg font-medium text-[#2D450D] italic">"{modelResponse}"</p>
                            </div>
                        )}
                        {transcript && (
                             <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                                You: {transcript}
                             </p>
                        )}
                    </div>
                </div>

                {/* Voice Interaction Layer */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6">
                    <button
                        onClick={toggleListening}
                        className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl relative group ${isListening ? 'bg-red-500 scale-110 shadow-red-500/40' : 'bg-[#1A1A1A] hover:bg-[#588517] shadow-black/20'}`}
                    >
                        {isListening && (
                             <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-20"></div>
                        )}
                        <svg className={`w-12 h-12 text-white transition-transform ${isListening ? 'scale-125' : 'group-hover:scale-110'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-20a3 3 0 00-3 3v8a3 3 0 006 0V5a3 3 0 00-3-3z" />
                        </svg>
                    </button>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">
                        {isListening ? 'Tap to Pause Mentor' : 'Tap to Ask Chef'}
                    </p>
                </div>
            </main>

            {/* Manual Navigation Backup */}
            <nav className="p-10 bg-white/50 backdrop-blur-md border-t border-gray-100 flex justify-between items-center px-12 sm:px-32">
                <button 
                    onClick={handlePrev} 
                    disabled={currentStep === 0}
                    className="btn-active-scale p-6 bg-white rounded-2xl shadow-sm border border-gray-100 disabled:opacity-20 disabled:grayscale transition-all"
                >
                    <svg className="w-8 h-8 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <div className="flex gap-2">
                    {steps.map((_, i) => (
                        <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-500 ${i === currentStep ? 'bg-[#588517] w-12' : 'bg-gray-200'}`}></div>
                    ))}
                </div>
                <button 
                    onClick={handleNext} 
                    disabled={currentStep === steps.length - 1}
                    className="btn-active-scale p-6 bg-[#1A1A1A] text-white rounded-2xl shadow-xl disabled:opacity-20 transition-all"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
            </nav>
        </div>
    );
};

export default CookingModePage;