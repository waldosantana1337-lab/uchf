
import React from 'react';

const steps = [
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>,
    title: "Add Ingredients",
    description: "Type in what you have in your fridge or pantry.",
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.502L16.5 21.75l-.398-1.248a3.375 3.375 0 00-2.456-2.456L12.75 18l1.248-.398a3.375 3.375 0 002.456-2.456L16.5 14.25l.398 1.248a3.375 3.375 0 002.456 2.456L20.25 18l-1.248.398a3.375 3.375 0 00-2.456 2.456z" /></svg>,
    title: "Get Recipes",
    description: "Instantly generate personalized recipes.",
  },
  {
    icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
    title: "Start Cooking",
    description: "Follow the steps, cook, and enjoy your meal!",
  }
];

export const Welcome: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-5 sm:p-12 rounded-2xl md:rounded-3xl shadow-xl border border-gray-100">
      <div className="text-left sm:text-center">
        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-[#588517] mb-1 md:mb-2">From Fridge to Feast.</p>
        <h2 className="text-lg sm:text-3xl font-bold text-[#333333] mb-1.5 md:mb-2">How YouChef Works</h2>
        <p className="text-xs sm:text-base text-[#333333] max-w-2xl sm:mx-auto text-balance">
          Creating delicious meals from what you have is just a few steps&nbsp;away.
        </p>
      </div>

      <div className="mt-8 md:mt-12">
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            <div className="w-full max-w-2xl border-t-2 border-dashed border-gray-300 hidden md:block"></div>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-6 md:gap-y-12">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center animate-fade-in-up gap-4 md:gap-0" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="flex items-center justify-center w-8 h-8 md:w-12 md:h-12 bg-[#588517] text-white font-bold text-xs md:text-xl rounded-full border-2 md:border-4 border-gray-50 z-10 shrink-0">
                  {index + 1}
                </div>
                <div className="flex flex-col md:items-center">
                  <div className="md:mt-6 text-[#588517] hidden md:block">
                    {step.icon}
                  </div>
                  <h3 className="md:mt-4 text-sm md:text-lg font-semibold text-[#333333]">{step.title}</h3>
                  <p className="mt-0.5 md:mt-1 text-xs md:text-sm text-gray-500 md:text-[#333333] max-w-xs">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
