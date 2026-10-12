import React from 'react';
import { Modal } from './common/Modal';

interface VoiceCommandsGuideProps {
    isOpen: boolean;
    onClose: () => void;
}

const CommandCategory: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h4 className="text-lg font-semibold text-orange-600 mb-2">{title}</h4>
        <ul className="space-y-2 list-disc list-inside text-[#152238]">
            {children}
        </ul>
    </div>
);

const VoiceCommandsGuide: React.FC<VoiceCommandsGuideProps> = ({ isOpen, onClose }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            titleId="voice-guide-title"
            className="max-w-lg"
        >
            <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-cyan-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 10.5c-1.63 0-3.04.78-3.92 2.25.21-.09.43-.16.66-.22.58-.16 1.2-.23 1.83-.23.63 0 1.25.07 1.83.23.23.06.45.13.66.22C15.04 11.28 13.63 10.5 12 10.5z"/></svg>
                    </div>
                    <div>
                        <h3 id="voice-guide-title" className="text-xl font-bold text-[#152238]">Alexa Voice Commands</h3>
                        <p className="text-sm text-[#152238]">Start your commands with "Alexa, ask YouChef..."</p>
                    </div>
                </div>
                
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    <CommandCategory title="Pantry Management">
                        <li>"to add milk and eggs to my pantry."</li>
                        <li>"what's in my pantry?"</li>
                        <li>"if I have chicken."</li>
                        <li>"to remove tomatoes from my pantry."</li>
                        <li>"what's expiring soon?"</li>
                    </CommandCategory>

                    <CommandCategory title="Recipe Discovery">
                        <li>"for a recipe with chicken and broccoli."</li>
                        <li>"for a quick dinner idea."</li>
                        <li>"for a vegetarian recipe."</li>
                    </CommandCategory>
                    
                     <CommandCategory title="Shopping List">
                        <li>"to add pasta to my shopping list."</li>
                        <li>"what's on my shopping list?"</li>
                    </CommandCategory>

                    <CommandCategory title="Cooking">
                        <li>"to start cooking my lasagna recipe."</li>
                        <li>"for the next step."</li>
                        <li>"to repeat the last step."</li>
                        <li>"to go back to the previous step."</li>
                    </CommandCategory>
                </div>

                 <div className="mt-6 text-right">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default VoiceCommandsGuide;