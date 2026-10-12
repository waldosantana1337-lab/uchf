// services/youChefApi.ts
// This service will handle all communication with the future YouChef backend API.
// It replaces the direct localStorage access in `storageService.ts`.

import type { AllUsersData, UserProfile } from '../types';

// In a real application, this would be your API's base URL.
const API_BASE_URL = '/api';

// --- Mock Data Store for Demonstration ---
// This mock simulates a backend database and will be removed when a real backend is built.
let MOCK_DB: { allUsers: AllUsersData, currentUser: string | null } = {
    allUsers: {},
    currentUser: null
};

/**
 * Simulates fetching the entire user data state from the backend.
 * In a real scenario, you'd fetch only the current user's data after they log in.
 */
export const getUserData = async (): Promise<{ allUsers: AllUsersData, currentUser: string | null }> => {
    console.log("API: Fetching user data...");
    // Simulating a network request
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // On first load, try to hydrate from localStorage once, then rely on memory.
    if (!MOCK_DB.allUsers || Object.keys(MOCK_DB.allUsers).length === 0) {
        const storedData = localStorage.getItem('youchef-user-data-cache');
        if (storedData) {
            try {
                const parsed = JSON.parse(storedData);
                if (parsed) MOCK_DB = parsed;
                if (!MOCK_DB.allUsers) MOCK_DB.allUsers = {};
            } catch (e) {
                console.error("Failed to parse cached user data", e);
                MOCK_DB = { allUsers: {}, currentUser: null };
            }
        }
    }
    
    return Promise.resolve(JSON.parse(JSON.stringify(MOCK_DB || { allUsers: {}, currentUser: null }))); // Return a deep copy
};

/**
 * Simulates saving the entire user data state to the backend.
 * In a real scenario, updates would be more granular (e.g., PUT /api/user/pantry).
 */
export const saveUserData = async (users: AllUsersData, user: string | null): Promise<void> => {
    console.log("API: Saving user data...");
    // Simulating a network request
    await new Promise(resolve => setTimeout(resolve, 200));
    
    MOCK_DB = { allUsers: users || {}, currentUser: user };
    
    // For persistence in this demo, we'll still cache it to localStorage.
    localStorage.setItem('youchef-user-data-cache', JSON.stringify(MOCK_DB));
    
    return Promise.resolve();
};


/**
 * Simulates updating a user's integration settings.
 */
export const updateIntegrations = async (username: string, integrations: UserProfile['integrations']): Promise<UserProfile> => {
    console.log(`API: Updating integrations for ${username}`, integrations);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network
    
    const user = MOCK_DB.allUsers ? MOCK_DB.allUsers[username] : null;
    if (user) {
        const existingIntegrations = user.integrations || {};
        user.integrations = { ...existingIntegrations, ...integrations };
        MOCK_DB.allUsers[username] = user;
        
        // Persist the change to our mock cache
        localStorage.setItem('youchef-user-data-cache', JSON.stringify(MOCK_DB));
        
        return Promise.resolve(JSON.parse(JSON.stringify(user)));
    }
    
    return Promise.reject(new Error("User not found"));
};