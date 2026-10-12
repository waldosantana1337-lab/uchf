import React from 'react';
import type { UserProfile } from '../types';
import { useToast } from '../contexts/ToastContext';

interface IntegrationsManagerProps {
    userProfile: UserProfile;
    onUpdateIntegrations: (integrations: UserProfile['integrations']) => void;
    onOpenVoiceGuide: () => void;
}

const IntegrationCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    isConnected: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
    onViewCommands?: () => void;
}> = ({ title, description, icon, isConnected, onConnect, onDisconnect, onViewCommands }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            {icon}
        </div>
        <div className="flex-grow text-center sm:text-left">
            <h3 className="text-xl font-bold text-[#152238]">{title}</h3>
            <p className="text-[#152238] mt-1">{description}</p>
            {isConnected && onViewCommands && (
                <button onClick={onViewCommands} className="text-sm font-semibold text-orange-600 hover:underline mt-2">
                    View Voice Commands
                </button>
            )}
        </div>
        <div className="flex-shrink-0">
            {isConnected ? (
                <button onClick={onDisconnect} className="px-5 py-2 bg-red-100 text-red-700 font-semibold rounded-full hover:bg-red-200">
                    Disconnect
                </button>
            ) : (
                <button onClick={onConnect} className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600">
                    Connect
                </button>
            )}
        </div>
    </div>
);

export const IntegrationsManager: React.FC<IntegrationsManagerProps> = ({ userProfile, onUpdateIntegrations, onOpenVoiceGuide }) => {
    const { showToast } = useToast();
    const integrations = userProfile.integrations || {};

    const handleConnect = (service: 'alexa' | 'samsung') => {
        // Simulate OAuth flow
        showToast(`Connecting to ${service === 'alexa' ? 'Amazon Alexa' : 'Samsung'}...`, 'info');
        setTimeout(() => {
            if (service === 'alexa') {
                onUpdateIntegrations({ alexaLinked: true });
            } else {
                onUpdateIntegrations({ samsungLinked: true });
            }
            showToast(`Successfully connected to ${service === 'alexa' ? 'Amazon Alexa' : 'Samsung'}!`, 'success');
        }, 1500);
    };

    const handleDisconnect = (service: 'alexa' | 'samsung') => {
        if (service === 'alexa') {
            onUpdateIntegrations({ alexaLinked: false });
        } else {
            onUpdateIntegrations({ samsungLinked: false });
        }
        showToast(`Disconnected from ${service === 'alexa' ? 'Amazon Alexa' : 'Samsung'}.`, 'info');
    };

    return (
        <div className="space-y-6">
            <IntegrationCard
                title="Amazon Alexa"
                description="Manage your pantry and get recipe ideas using just your voice."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 10.5c-1.63 0-3.04.78-3.92 2.25.21-.09.43-.16.66-.22.58-.16 1.2-.23 1.83-.23.63 0 1.25.07 1.83.23.23.06.45.13.66.22C15.04 11.28 13.63 10.5 12 10.5z"/></svg>}
                isConnected={!!integrations.alexaLinked}
                onConnect={() => handleConnect('alexa')}
                onDisconnect={() => handleDisconnect('alexa')}
                onViewCommands={onOpenVoiceGuide}
            />
            <IntegrationCard
                title="Samsung Family Hub"
                description="View your meal plan and pantry directly on your smart fridge screen."
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 2c.83 0 1.5.67 1.5 1.5S12.83 7 12 7s-1.5-.67-1.5-1.5S11.17 4 12 4zm0 16c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/><path d="M12 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>}
                isConnected={!!integrations.samsungLinked}
                onConnect={() => handleConnect('samsung')}
                onDisconnect={() => handleDisconnect('samsung')}
            />
        </div>
    );
};
