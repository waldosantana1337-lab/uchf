
import React from 'react';
import { useAppContext } from '../contexts/AppContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, translate } = useAppContext();

  return (
    <div className="fixed bottom-4 left-4 z-40 print-hidden flex items-center bg-white/80 backdrop-blur-md border border-gray-200 rounded-full shadow-lg p-1">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
          language === 'en' ? 'bg-[#588517] text-white' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('es')}
        className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
          language === 'es' ? 'bg-[#588517] text-white' : 'text-gray-400 hover:text-gray-600'
        }`}
      >
        ES
      </button>
    </div>
  );
};
