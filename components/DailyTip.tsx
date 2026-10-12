import React, { useState, useEffect } from 'react';
import { generateDailyTip } from '../services/geminiService';
import { loadDailyTip, saveDailyTip } from '../services/storageService';

const DailyTip: React.FC = () => {
    const [tip, setTip] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const getTip = async () => {
            setIsLoading(true);
            const storedTip = loadDailyTip();
            if (storedTip) {
                setTip(storedTip);
            } else {
                // generateDailyTip is now resilient and won't throw on API errors.
                // It will return a fallback tip instead.
                const newTipData = await generateDailyTip();
                if (newTipData && newTipData.tip) {
                    setTip(newTipData.tip);
                    saveDailyTip(newTipData.tip);
                }
            }
            setIsLoading(false);
        };

        getTip();
    }, []);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-6 text-center animate-pulse">
                <p className="text-sm text-[#588517]">Loading your daily tip...</p>
            </div>
        );
    }
    
    if (!tip) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-6 text-center animate-fade-in-up">
            <p className="text-[#588517] text-sm italic text-balance">"{tip}"</p>
        </div>
    );
};

export default DailyTip;