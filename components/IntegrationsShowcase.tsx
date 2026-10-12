import React from 'react';

const IntegrationCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex-1 bg-white p-5 md:p-6 rounded-xl shadow-lg border border-gray-100 text-left md:text-center hover:shadow-xl transition-shadow duration-300 flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-0">
        <div className="md:mx-auto w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-0 md:mb-3 shrink-0">
            <div className="scale-75 md:scale-90">{icon}</div>
        </div>
        <div className="flex-grow">
            <h3 className="text-base md:text-lg font-bold text-[#152238]">{title}</h3>
            <p className="mt-1 md:mt-2 text-xs text-gray-500 md:text-[#152238] text-balance leading-relaxed">{description}</p>
        </div>
    </div>
);

export const IntegrationsShowcase: React.FC = () => {
    return (
        <div className="py-10 md:py-12 animate-fade-in-up">
            <div className="text-left md:text-center mb-6 md:mb-8">
                <h2 className="text-2xl md:text-3xl font-extrabold text-[#152238] tracking-tight text-balance">
                    YouChef Everywhere You Go
                </h2>
                <p className="mt-2 max-w-2xl md:mx-auto text-xs md:text-base text-gray-500 md:text-[#152238] text-balance">
                    Connect your kitchen and manage your meals seamlessly with our smart integrations.
                </p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 max-w-4xl mx-auto">
                <IntegrationCard
                    title="Amazon Alexa"
                    description="“Alexa, ask YouChef to add milk to my pantry.” Use your voice to manage ingredients and get recipe ideas, hands-free."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 10.5c-1.63 0-3.04.78-3.92 2.25.21-.09.43-.16.66-.22.58-.16 1.2-.23 1.83-.23.63 0 1.25.07 1.83.23.23.06.45.13.66.22C15.04 11.28 13.63 10.5 12 10.5z"/></svg>}
                />
                <IntegrationCard
                    title="Samsung Family Hub"
                    description="Your weekly meal plan and shopping list, displayed beautifully on your smart fridge screen for the whole family to see."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 2c.83 0 1.5.67 1.5 1.5S12.83 7 12 7s-1.5-.67-1.5-1.5S11.17 4 12 4zm0 16c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/><path d="M12 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>}
                />
            </div>
        </div>
    );
};
