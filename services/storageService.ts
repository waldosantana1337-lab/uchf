// services/storageService.ts
import type { AllUsersData } from '../types';

const KEYS = {
    USER_DATA: 'youchef-user-data',
    USER_DATA_CACHE: 'youchef-user-data-cache',
    DAILY_TIP: 'youchef-daily-tip-',
    ONBOARDING_DISMISSED: 'youchef-onboarding-dismissed'
};

export const loadUserData = (): { allUsers: AllUsersData; currentUser: string | null } => {
    try {
        const storedData = localStorage.getItem(KEYS.USER_DATA_CACHE) || localStorage.getItem(KEYS.USER_DATA);
        if (storedData) {
            const data = JSON.parse(storedData);
            return {
                allUsers: data.allUsers || {},
                currentUser: data.currentUser || null,
            };
        }
    } catch (e) {
        console.error("Failed to load user data", e);
    }
    return { allUsers: {}, currentUser: null };
};

export const saveUserData = (users: AllUsersData, user: string | null): void => {
    try {
        const dataToStore = { allUsers: users, currentUser: user };
        const json = JSON.stringify(dataToStore);
        localStorage.setItem(KEYS.USER_DATA, json);
        localStorage.setItem(KEYS.USER_DATA_CACHE, json);
    } catch (e) {
        console.error("Failed to save user data", e);
    }
};

export const loadDailyTip = (): string | null => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `${KEYS.DAILY_TIP}${today}`;
    try {
        return localStorage.getItem(storageKey);
    } catch (e) {
        return null;
    }
};

export const saveDailyTip = (tip: string): void => {
    const today = new Date().toISOString().split('T')[0];
    const storageKey = `${KEYS.DAILY_TIP}${today}`;
    try {
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(KEYS.DAILY_TIP) && key !== storageKey) {
                localStorage.removeItem(key);
            }
        });
        localStorage.setItem(storageKey, tip);
    } catch (e) {}
};

export const clearAllData = () => {
    localStorage.clear();
    window.location.reload();
};