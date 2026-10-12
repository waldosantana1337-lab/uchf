
import React, { useState } from 'react';
import { TestReport } from './TestReport';

export const Footer: React.FC = React.memo(() => {
  const [isTestOpen, setIsTestOpen] = useState(false);

  return (
    <footer className="bg-white/50 border-t border-gray-200 mt-12 py-10">
      <div className="max-w-4xl mx-auto px-4 text-center text-[#333333] w-full">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-[#333333]">YouChef</h3>
          <p className="text-sm font-medium text-balance max-w-2xl mx-auto opacity-80 mt-2">
            Curated for you, made by you, Chef. Fighting food waste, one meal at a time.
          </p>
        </div>
        
        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 text-xs font-bold uppercase tracking-widest text-gray-500">
          <button className="hover:text-[#588517] transition-colors">Privacy Policy</button>
          <button className="hover:text-[#588517] transition-colors">Terms of Service</button>
          <button className="hover:text-[#588517] transition-colors">Support</button>
          <button className="hover:text-[#588517] transition-colors">Safety Guide</button>
          <button onClick={() => setIsTestOpen(true)} className="text-[#C2410C]/40 hover:text-[#C2410C] transition-colors">System Test</button>
        </nav>

        <div className="flex justify-center gap-4 mb-6">
           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center opacity-50">
             <span className="sr-only">Social</span>
           </div>
           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center opacity-50">
             <span className="sr-only">Social</span>
           </div>
        </div>

        <p className="text-[10px] uppercase tracking-tighter opacity-60">
          &copy; {new Date().getFullYear()} YouChef Technologies Inc. App Store & Play Store Release Candidate v1.0.0
        </p>
      </div>

      <TestReport isOpen={isTestOpen} onClose={() => setIsTestOpen(false)} />
    </footer>
  );
});
