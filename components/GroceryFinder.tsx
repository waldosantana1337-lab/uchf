import React, { useState } from 'react';
import { generateGrocerySuggestions } from '../services/geminiService';
import type { GroceryStoreSuggestion } from '../types';
import { Loader } from './Loader';

interface GroceryFinderProps {
  ingredients: string[];
}

const DeliveryServiceButton: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-white text-[#152238] font-semibold text-sm rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-400 transition duration-200 shadow-sm"
    >
        {children}
    </a>
);


const StoreSuggestionCard: React.FC<{ suggestion: GroceryStoreSuggestion; location: string }> = ({ suggestion, location }) => {
    const instacartUrl = `https://www.instacart.com/store?utm_source=affiliate&utm_medium=partner&utm_campaign=youchef&affiliate_id=YOUCHEF`;
    
    // Create a more precise DoorDash URL if lat/long is available
    const getDoorDashUrl = () => {
        const latLongRegex = /^-?([1-8]?[0-9]|[1-9]0)\.{1}\d{1,6},-?([1-8]?[0-9]|[1-9]0)\.{1}\d{1,6}$/;
        if (location.includes(',') && latLongRegex.test(location.replace(/\s/g, ''))) {
            const [lat, lng] = location.split(',');
            return `https://www.doordash.com/home/?lat=${lat.trim()}&lng=${lng.trim()}&utm_campaign=youchef`;
        }
        return `https://www.doordash.com/home/?address=${encodeURIComponent(location)}&utm_campaign=youchef`;
    };

    const doordashUrl = getDoorDashUrl();
    
    return (
        <div className="bg-orange-50/50 p-4 rounded-lg border border-orange-200 animate-fade-in">
            <h4 className="font-bold text-[#152238]">{suggestion.storeName}</h4>
            <p className="text-xs font-semibold text-orange-700 bg-orange-100 inline-block px-2 py-0.5 rounded-full my-1">{suggestion.storeType}</p>
            <p className="text-sm text-[#152238] mt-1">{suggestion.reasoning}</p>
            <div className="flex items-center mt-3 text-sm text-[#152238]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span>{suggestion.address}</span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-orange-200">
                <h5 className="text-sm font-semibold text-[#152238] mb-2 text-center">Order from Delivery Service</h5>
                <div className="flex flex-col sm:flex-row gap-2">
                    <DeliveryServiceButton href={instacartUrl}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Instacart
                    </DeliveryServiceButton>
                    <DeliveryServiceButton href={doordashUrl}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                           <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1z" />
                           <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h2a1 1 0 001-1V7a1 1 0 00-1-1h-2" />
                        </svg>
                        DoorDash
                    </DeliveryServiceButton>
                </div>
                 <p className="text-xs text-gray-400 italic text-center mt-3">YouChef may earn a commission from these links.</p>
            </div>
        </div>
    );
};


export const GroceryFinder: React.FC<GroceryFinderProps> = ({ ingredients }) => {
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<GroceryStoreSuggestion[] | null>(null);
  const [sources, setSources] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findStores = async (loc: string) => {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    setSources(null);
    try {
      const results = await generateGrocerySuggestions(ingredients, loc);
      if (results.suggestions.length === 0) {
          setError("No stores found nearby.");
      } else {
          setSuggestions(results.suggestions);
          setSources(results.sources);
      }
    } catch (err) {
      setError("Sorry, we couldn't find any stores right now. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindStores = () => {
    if (!location.trim()) {
      setError("Please enter your address or zip code.");
      return;
    }
    findStores(location);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setLocation('Finding your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const latLong = `${latitude}, ${longitude}`;
        setLocation(latLong);
        findStores(latLong);
      },
      () => {
        setError("Unable to retrieve your location. Please grant permission or enter it manually.");
        setLocation('');
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
      <h4 className="font-semibold text-[#152238] mb-3">Find Ingredients Nearby</h4>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter address or use current location"
              className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-400 focus:border-orange-400 disabled:bg-gray-100"
              disabled={isLoading}
            />
            <button 
                onClick={handleUseLocation}
                disabled={isLoading}
                title="Use Current Location"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-orange-600 disabled:text-gray-300 rounded-full hover:bg-gray-100"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            </button>
        </div>
        <button
          onClick={handleFindStores}
          disabled={isLoading || !location.trim()}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 transition duration-200 disabled:bg-orange-300 disabled:cursor-not-allowed"
        >
          {isLoading && location ? <Loader /> : 'Find Stores'}
        </button>
      </div>
      
      {error && (
         <p className="text-red-600 text-sm mt-3">{error}</p>
      )}

      {suggestions && (
        <div className="mt-4">
          <div className="space-y-3">
             <p className="text-xs text-gray-500 italic text-center">Disclaimer: Store suggestions are grounded by Google Search. Please verify details.</p>
            {suggestions.map((s, i) => <StoreSuggestionCard key={i} suggestion={s} location={location} />)}
          </div>
          
          {sources && sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                  <h5 className="text-xs font-semibold text-gray-500 mb-2 text-center">Information Sources</h5>
                  <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
                      {sources.map((source, index) => source.web && (
                          <li key={index}>
                              <a 
                                  href={source.web.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                  title={source.web.title}
                              >
                                  {source.web.title || new URL(source.web.uri).hostname}
                              </a>
                          </li>
                      ))}
                  </ul>
              </div>
          )}
        </div>
      )}
    </div>
  );
};