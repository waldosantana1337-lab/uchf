import React from 'react';
import { Modal } from './common/Modal';
import { useToast } from '../contexts/ToastContext';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start space-x-3">
        <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <p className="text-[#333333]">{children}</p>
    </li>
);

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const { showToast } = useToast();
    
    const handleUpgrade = () => {
        showToast("Thank you for your interest! Full payment integration is coming soon.", 'success');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            titleId="upgrade-modal-title"
            className="max-w-md"
        >
            <div className="p-8 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <span className="text-2xl">✨</span>
                </div>
                <h2 id="upgrade-modal-title" className="mt-4 text-2xl font-bold text-[#333333]">Upgrade to YouChef Pro</h2>
                <p className="mt-2 text-[#333333] text-balance">Unlock the full power of your smart kitchen assistant to save more time, money, and reduce food waste.</p>
                
                <ul className="mt-6 text-left space-y-3">
                    <ProFeature>Unlimited smart-generated weekly meal plans.</ProFeature>
                    <ProFeature>Advanced nutritional analysis for every recipe.</ProFeature>
                    <ProFeature>Smart grocery list syncing with local stores.</ProFeature>
                    <ProFeature>Personalized suggestions based on your cooking history.</ProFeature>
                </ul>

                <button 
                    onClick={handleUpgrade}
                    className="w-full mt-8 px-8 py-3 bg-[#588517] text-white font-bold text-lg rounded-full shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-105"
                >
                    Upgrade Now for $10/mo
                </button>
            </div>
        </Modal>
    );
};

export default UpgradeModal;