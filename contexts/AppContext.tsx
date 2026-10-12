import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  UserProfile, 
  AllUsersData, 
  Recipe, 
  Preferences, 
  Language, 
  PantryItem, 
  ShoppingListItem, 
  MealPlan, 
  Leftover, 
  LeftoverIdea, 
  ChefPersonality,
  Notification,
  CookedHistoryItem
} from '../types';
import { getUserData, saveUserData as apiSaveUserData } from '../services/youChefApi';
import { generateRecipeText, generateLeftoverIdeas, generateRecipeImage } from '../services/geminiService';
import { t } from '../utils/translations';
import { generateConsolidatedShoppingList } from '../services/mealPlanService';
import { useToast } from './ToastContext';
import { trackEvent } from '../services/analyticsService';
import { PRE_BUILT_RECIPES } from '../data/preBuiltRecipes';

interface AppContextType {
  isAppReady: boolean;
  ingredients: string[];
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  isLoading: boolean;
  preferences: Preferences;
  handlePreferenceChange: (field: keyof Preferences, value: any) => void;
  handleGenerate: (specificIngredients?: string[]) => Promise<void>;
  onScanClick: () => void;
  handleStartOver: () => void;
  userProfile: UserProfile | null;
  includePantry: boolean;
  setIncludePantry: React.Dispatch<React.SetStateAction<boolean>>;
  translate: (key: any) => string;
  language: Language;
  setLanguage: (l: Language) => void;
  currentUser: string | null;
  allUsers: AllUsersData;
  currentProfileUsername: string | null;
  handleNavigate: (page: string, username?: string) => void;
  currentPage: string;
  handleViewRecipe: (recipe: Recipe) => void;
  selectedRecipe: Recipe | null;
  handleAddToPlan: (recipe: Recipe) => void;
  handleUpdatePantry: (newPantry: PantryItem[]) => void;
  handleUpdateIntegrations: (integrations: any) => void;
  onOpenVoiceGuide: () => void;
  handleAddFriend: (friendUsername: string) => void;
  handleUploadCreation: (creation: any) => void;
  handleUpdateProfile: (updates: any) => void;
  handleUpdatePreferences: (prefs: Preferences) => void;
  handleUpdateChefPersonality: (chef: ChefPersonality) => void;
  handleLikeCreation: (ownerUsername: string, creationIndex: number) => void;
  handleAddComment: (ownerUsername: string, creationIndex: number, comment: string) => void;
  onLoginRequest: () => void;
  handleLogin: (u: string) => void;
  handleLogout: () => void;
  onReadNotifications: () => void;
  onShoppingListClick: () => void;
  isSaving: boolean;
  handleUpdateMealPlan: (plan: MealPlan) => void;
  handleGenerateShoppingList: () => void;
  onUpgradeRequest: () => void;
  handleUpdateShoppingList: (list: ShoppingListItem[]) => void;
  handleMoveItemsToPantry: () => void;
  handleSelectInspirationRecipe: (key: string) => void;
  handleCookWithIngredients: (ingredients: string[]) => void;
  handleDismissOnboarding: () => void;
  userImpactStats: { foodSaved: number; moneySaved: number };
  handleUpdateLeftovers: (leftovers: Leftover[]) => void;
  leftoverIdeas: LeftoverIdea[] | null;
  isGeneratingIdeas: boolean;
  ideasError: string | null;
  handleGenerateLeftoverIdeas: () => Promise<void>;
  handleClearLeftoverIdeas: () => void;
  setIsFridgeMode: (val: boolean) => void;
  isFridgeMode: boolean;
  recipes: Recipe[] | null;
  error: string | null;
  recipeRatings: Record<string, { total: number; count: number }>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (val: boolean) => void;
  isShoppingListOpen: boolean;
  setIsShoppingListOpen: (val: boolean) => void;
  isScanModalOpen: boolean;
  setIsScanModalOpen: (val: boolean) => void;
  isReceiptModalOpen: boolean;
  setIsReceiptModalOpen: (val: boolean) => void;
  isUpgradeModalOpen: boolean;
  setIsUpgradeModalOpen: (val: boolean) => void;
  isVoiceGuideOpen: boolean;
  setIsVoiceGuideOpen: (val: boolean) => void;
  handleMarkAsCooked: (recipe: Recipe, cookedDate: string, notes: string, rating: number, photoUrl?: string) => void;
  handleIngredientsScanned: (scanned: { name: string, quantity: string }[]) => void;
  handleToggleSave: (recipe: Recipe) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const DEFAULT_PREFERENCES: Preferences = {
    isGlutenFree: false,
    isVegan: false,
    isVegetarian: false,
    isKeto: false,
    isDairyFree: false,
    cuisine: '',
    servings: 2,
    maxTime: 45,
    skillLevel: 'beginner',
    allergies: '',
    equipment: ['stove', 'oven']
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { showToast } = useToast();
    const [isAppReady, setIsAppReady] = useState(false);
    const [allUsers, setAllUsers] = useState<AllUsersData>({});
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState('home');
    const [currentProfileUsername, setCurrentProfileUsername] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [recipes, setRecipes] = useState<Recipe[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [language, setLanguage] = useState<Language>('en');
    const [includePantry, setIncludePantry] = useState(true);
    const [isFridgeMode, setIsFridgeMode] = useState(false);

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [isVoiceGuideOpen, setIsVoiceGuideOpen] = useState(false);

    const [leftoverIdeas, setLeftoverIdeas] = useState<LeftoverIdea[] | null>(null);
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    const [ideasError, setIdeasError] = useState<string | null>(null);

    const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

    useEffect(() => {
        const hydrate = async () => {
            try {
                // Check for referral code in URL
                const params = new URLSearchParams(window.location.search);
                const ref = params.get('ref');
                if (ref) {
                    sessionStorage.setItem('youchef_referrer', ref);
                    console.log("[GROWTH] Captured referrer:", ref);
                }

                const { allUsers: loadedUsers, currentUser: loadedUser } = await getUserData();
                setAllUsers(loadedUsers || {});
                if (loadedUser && loadedUsers?.[loadedUser]) {
                    setCurrentUser(loadedUser);
                    setPreferences({ ...DEFAULT_PREFERENCES, ...(loadedUsers[loadedUser].preferences || {}) });
                }
            } catch (e) {
                console.error("Hydration failed", e);
            } finally {
                setIsAppReady(true);
            }
        };
        hydrate();
    }, []);

    const userProfile: UserProfile | null = useMemo(() => {
        if (!currentUser) return null;
        return (allUsers as any)[currentUser] || null;
    }, [currentUser, allUsers]);

    const recipeRatings = useMemo(() => {
        const ratings: Record<string, { total: number; count: number }> = {};
        Object.values(allUsers as Record<string, UserProfile>).forEach((user: UserProfile) => {
            (user.cookedHistory || []).forEach((h: CookedHistoryItem) => {
                if (h.rating) {
                    if (!ratings[h.recipeName]) ratings[h.recipeName] = { total: 0, count: 0 };
                    ratings[h.recipeName].total += h.rating;
                    ratings[h.recipeName].count += 1;
                }
            });
        });
        return ratings;
    }, [allUsers]);

    const userImpactStats = useMemo(() => {
        const cookedCount = userProfile?.cookedHistory?.length || 0;
        return {
            foodSaved: parseFloat((cookedCount * 0.45).toFixed(1)),
            moneySaved: cookedCount * 12
        };
    }, [userProfile]);

    const saveChanges = useCallback(async (updatedUsers: AllUsersData, activeUser: string | null) => {
        setIsSaving(true);
        try {
            await apiSaveUserData(updatedUsers, activeUser);
        } finally {
            setIsSaving(false);
        }
    }, []);

    const translate = useCallback((key: any) => t(key, language), [language]);

    const handleLogin = (u: string) => {
        const lower = u.trim().toLowerCase();
        let updatedUsers = { ...allUsers };
        
        const isNewUser = !updatedUsers[lower];
        
        if (isNewUser) {
            updatedUsers[lower] = {
                username: lower,
                displayName: lower.charAt(0).toUpperCase() + lower.slice(1),
                bio: 'Passionate home cook.',
                profilePictureUrl: `https://api.multiavatar.com/${lower}.svg`,
                savedRecipes: [],
                creations: [],
                friends: [],
                preferences: { ...preferences },
                activity: [],
                notifications: [],
                cookedHistory: [],
                pantry: [],
                leftovers: [],
                shoppingList: [],
                mealPlan: {},
                isPremium: false,
                selectedChef: 'zephyr',
                xp: 0,
                level: 1
            };
            
            // Handle referral payout
            const referrer = sessionStorage.getItem('youchef_referrer');
            if (referrer && updatedUsers[referrer] && referrer !== lower) {
                updatedUsers[referrer].xp += 250;
                updatedUsers[referrer].notifications.unshift({
                    id: Date.now().toString(),
                    title: 'New Chef Joined!',
                    message: `Chef ${updatedUsers[lower].displayName} joined using your link. You earned 250 XP!`,
                    timestamp: new Date().toISOString(),
                    read: false,
                    type: 'ACHIEVEMENT'
                });
                sessionStorage.removeItem('youchef_referrer');
                console.log("[GROWTH] Payout successful to:", referrer);
            }
        }
        
        // Reset transient session state on login to ensure clear transition
        setRecipes(null);
        setError(null);
        setIsLoading(false);
        setSelectedRecipe(null);
        
        // Set user state
        setAllUsers(updatedUsers);
        setCurrentUser(lower);
        setPreferences({ ...DEFAULT_PREFERENCES, ...(updatedUsers[lower].preferences || {}) });
        setIsAuthModalOpen(false);
        setCurrentPage('home');
        saveChanges(updatedUsers, lower);
        showToast(`Welcome, Chef ${updatedUsers[lower].displayName}!`, 'success');
        
        // Ensure seamless top-of-page view
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setRecipes(null);
        setError(null);
        setSelectedRecipe(null);
        setCurrentPage('home');
        saveChanges(allUsers, null);
        showToast("Logged out successfully.", 'info');
        
        // Ensure seamless top-of-page view
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNavigate = (page: string, username?: string) => {
        setCurrentPage(page as any);
        if (username) setCurrentProfileUsername(username);
        else setCurrentProfileUsername(null);
        window.scrollTo(0, 0);
    };

    const handlePreferenceChange = (field: keyof Preferences, value: any) => {
        const newPrefs = { ...preferences, [field]: value };
        setPreferences(newPrefs);
        if (currentUser) {
            const updatedUsers = {
                ...allUsers,
                [currentUser]: { ...allUsers[currentUser], preferences: newPrefs }
            };
            setAllUsers(updatedUsers);
            saveChanges(updatedUsers, currentUser);
        }
    };

    const handleGenerate = async (specificIngredients?: string[]) => {
        const targetIngredients = specificIngredients || ingredients;
        if (targetIngredients.length === 0) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const chef = userProfile?.selectedChef || 'zephyr';
            const finalIngredients = includePantry && userProfile 
                ? [...targetIngredients, ...((userProfile.pantry || []).filter(p => p.inStock).map(p => p.name))]
                : targetIngredients;

            const results = await generateRecipeText(finalIngredients, preferences, chef, language);
            setRecipes(results);
            setIsLoading(false);
            trackEvent('MEAL_PLAN_GENERATED', { count: results.length });

            // Background image generation - staggered to avoid rate limits
            results.forEach(async (recipe, index) => {
                try {
                    // Stagger the requests slightly (400ms * index) to be faster while respecting rate limits
                    await new Promise(resolve => setTimeout(resolve, index * 400));
                    
                    const imageUrl = await generateRecipeImage(recipe);
                    setRecipes(prev => {
                        if (!prev) return prev;
                        const next = [...prev];
                        const targetIndex = next.findIndex(r => r.recipeName === recipe.recipeName);
                        if (targetIndex !== -1) {
                            next[targetIndex] = { ...next[targetIndex], imageUrl };
                        }
                        return next;
                    });
                } catch (e) {
                    console.error("Background image generation failed for", recipe.recipeName, e);
                }
            });
        } catch (e: any) {
            setError(e.message || "Culinary intuition blocked. Try again.");
            setIsLoading(false);
        }
    };

    const handleStartOver = () => {
        setIngredients([]);
        setRecipes(null);
        setError(null);
    };

    const onScanClick = () => setIsScanModalOpen(true);
    const onShoppingListClick = () => setIsShoppingListOpen(true);
    const onUpgradeRequest = () => setIsUpgradeModalOpen(true);
    const onOpenVoiceGuide = () => setIsVoiceGuideOpen(true);
    const onLoginRequest = () => setIsAuthModalOpen(true);

    const handleViewRecipe = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        handleNavigate('recipeDetail');
    };

    const handleAddToPlan = (recipe: Recipe) => {
        if (!currentUser) {
            onLoginRequest();
            return;
        }
        handleNavigate('mealPlanner');
    };

    const handleUpdatePantry = (newPantry: PantryItem[]) => {
        if (!currentUser) return;
        const updatedUsers = {
            ...allUsers,
            [currentUser]: { ...allUsers[currentUser], pantry: newPantry }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
    };

    const handleUpdateMealPlan = (plan: MealPlan) => {
        if (!currentUser) return;
        const updatedUsers = {
            ...allUsers,
            [currentUser]: { ...allUsers[currentUser], mealPlan: plan }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
    };

    const handleUpdateShoppingList = (list: ShoppingListItem[]) => {
        if (!currentUser) return;
        const updatedUsers = {
            ...allUsers,
            [currentUser]: { ...allUsers[currentUser], shoppingList: list }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
    };

    const handleGenerateShoppingList = () => {
        if (!userProfile || !currentUser) return;
        const newList = generateConsolidatedShoppingList(userProfile.mealPlan, userProfile.pantry);
        const currentList = userProfile.shoppingList || [];
        handleUpdateShoppingList([...currentList, ...newList]);
        showToast("Shopping list updated from your meal plan!", 'success');
        setIsShoppingListOpen(true);
    };

    const handleMoveItemsToPantry = () => {
        if (!userProfile || !currentUser) return;
        const shoppingList = userProfile.shoppingList || [];
        const pantry = userProfile.pantry || [];
        const checkedItems = shoppingList.filter(i => i.isChecked);
        const newPantry = [...pantry];
        checkedItems.forEach(item => {
            const existing = newPantry.find(p => p.name.toLowerCase() === item.name.toLowerCase());
            if (existing) existing.inStock = true;
            else newPantry.push({ name: item.name, inStock: true });
        });
        const remainingShopping = shoppingList.filter(i => !i.isChecked);
        const updatedUsers = {
            ...allUsers,
            [currentUser]: { 
                ...allUsers[currentUser], 
                pantry: newPantry, 
                shoppingList: remainingShopping 
            }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
        showToast(`Moved ${checkedItems.length} items to pantry.`, 'success');
    };

    const handleMarkAsCooked = (recipe: Recipe, cookedDate: string, notes: string, rating: number, photoUrl?: string) => {
        if (!currentUser) return;
        const historyItem = { recipeName: recipe.recipeName, cookedDate, notes, rating, photoUrl };
        const updatedHistory = [historyItem, ...(allUsers[currentUser].cookedHistory || [])];
        
        let xp = allUsers[currentUser].xp;
        let level = allUsers[currentUser].level;
        xp += 150;
        
        // If they uploaded a photo, add it to creations too
        let updatedCreations = [...(allUsers[currentUser].creations || [])];
        if (photoUrl) {
            updatedCreations = [{
                recipeName: recipe.recipeName,
                recipeImageUrl: recipe.imageUrl,
                userImageUrl: photoUrl,
                notes: notes || `Cooked ${recipe.recipeName}!`,
                likes: [],
                comments: [],
                timestamp: new Date().toISOString()
            }, ...updatedCreations];
            xp += 100; // Extra XP for sharing a photo
        }

        if (xp >= level * 500) {
            level += 1;
            showToast(`LEVEL UP! You are now a Level ${level} Chef!`, 'success');
        }

        const updatedUsers = {
            ...allUsers,
            [currentUser]: { 
                ...allUsers[currentUser], 
                cookedHistory: updatedHistory,
                creations: updatedCreations,
                xp,
                level
            }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
        trackEvent('RECIPE_COOKED', { name: recipe.recipeName, hasPhoto: !!photoUrl });
        showToast(`Logged ${recipe.recipeName}! ${photoUrl ? '+250 XP' : '+150 XP'}`, 'success');
    };

    const handleAddFriend = (friend: string) => {
        if (!currentUser) return;
        const friends = [...(allUsers[currentUser].friends || [])];
        if (!friends.includes(friend)) {
            friends.push(friend);
            const updatedUsers = {
                ...allUsers,
                [currentUser]: { ...allUsers[currentUser], friends }
            };
            setAllUsers(updatedUsers);
            saveChanges(updatedUsers, currentUser);
            showToast(`Added @${friend} to your circle!`, 'success');
        }
    };

    const handleUploadCreation = (creation: any) => {
        if (!currentUser) return;
        const creations = [{ ...creation, likes: [], comments: [], timestamp: new Date().toISOString() }, ...(allUsers[currentUser].creations || [])];
        const updatedUsers = {
            ...allUsers,
            [currentUser]: { ...allUsers[currentUser], creations }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
        showToast("Creation uploaded! Chef's critique incoming...", 'success');
    };

    const handleUpdateProfile = (updates: any) => {
        if (!currentUser) return;
        const updatedUsers = {
            ...allUsers,
            [currentUser]: { ...allUsers[currentUser], ...updates }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
    };

    const handleUpdatePreferences = (prefs: Preferences) => {
        if (!currentUser) return;
        const updatedUsers = {
            ...allUsers,
            [currentUser]: { ...allUsers[currentUser], preferences: prefs }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
    };

    const handleUpdateChefPersonality = (chef: ChefPersonality) => {
        if (!currentUser) return;
        const updatedUsers = {
            ...allUsers,
            [currentUser]: { ...allUsers[currentUser], selectedChef: chef }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
        showToast(`Chef ${chef.charAt(0).toUpperCase() + chef.slice(1)} is ready.`, 'info');
    };

    const handleLikeCreation = (owner: string, index: number) => {
        if (!currentUser) return;
        const updatedUsers = { ...allUsers };
        const creation = updatedUsers[owner].creations[index];
        if (!creation.likes) creation.likes = [];
        if (creation.likes.includes(currentUser)) {
            creation.likes = creation.likes.filter(l => l !== currentUser);
        } else {
            creation.likes.push(currentUser);
        }
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
    };

    const handleAddComment = (owner: string, index: number, text: string) => {
        if (!currentUser || !userProfile) return;
        const updatedUsers = { ...allUsers };
        const creation = updatedUsers[owner].creations[index];
        creation.comments.push({
            username: currentUser,
            profilePictureUrl: userProfile.profilePictureUrl,
            comment: text,
            timestamp: new Date().toISOString()
        });
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
    };

    const handleUpdateLeftovers = (leftovers: Leftover[]) => {
        if (!currentUser) return;
        const updatedUsers = {
            ...allUsers,
            [currentUser]: { ...allUsers[currentUser], leftovers }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
    };

    const handleGenerateLeftoverIdeas = async () => {
        if (!userProfile) return;
        setIsGeneratingIdeas(true);
        setIdeasError(null);
        try {
            const ideas = await generateLeftoverIdeas(userProfile.leftovers, language);
            setLeftoverIdeas(ideas);
        } catch (e: any) {
            setIdeasError("Ideas engine stalled. Try again.");
        } finally {
            setIsGeneratingIdeas(false);
        }
    };

    const handleClearLeftoverIdeas = () => setLeftoverIdeas(null);

    const onReadNotifications = () => {
        if (!currentUser) return;
        const notifications = (allUsers[currentUser].notifications || []).map(n => ({ ...n, read: true }));
        const updatedUsers = {
            ...allUsers,
            [currentUser]: { ...allUsers[currentUser], notifications }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
    };

    const handleIngredientsScanned = (scanned: { name: string, quantity: string }[]) => {
        const names = scanned.map(s => s.name.toLowerCase());
        setIngredients(prev => Array.from(new Set([...prev, ...names])));
        setIsScanModalOpen(false);
        showToast(`Identified ${scanned.length} items from scan!`, 'success');
    };

    const handleSelectInspirationRecipe = (key: string) => {
        const recipe = PRE_BUILT_RECIPES[key];
        if (recipe) {
            setSelectedRecipe(recipe);
            handleNavigate('recipeDetail');
        }
    };

    const handleCookWithIngredients = (ings: string[]) => {
        setIngredients(ings);
        handleGenerate(ings);
        handleNavigate('home');
        document.getElementById('ingredient-input-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleDismissOnboarding = () => {
        if (!currentUser) return;
        handleUpdateProfile({ onboardingCompleted: true });
    };

    const handleUpdateIntegrations = (integrations: any) => {
        if (!currentUser) return;
        const updatedUsers = {
            ...allUsers,
            [currentUser]: { 
                ...allUsers[currentUser], 
                integrations: { ...(allUsers[currentUser].integrations || {}), ...integrations } 
            }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
    };

    const handleToggleSave = (recipe: Recipe) => {
        if (!currentUser || !allUsers[currentUser]) return;
        
        const savedRecipes = allUsers[currentUser].savedRecipes || [];
        const isSaved = savedRecipes.some(r => r.recipeName === recipe.recipeName);
        let updatedSaved;
        
        if (isSaved) {
            updatedSaved = savedRecipes.filter(r => r.recipeName !== recipe.recipeName);
            showToast(`Removed ${recipe.recipeName} from your saved recipes.`, 'info');
        } else {
            updatedSaved = [recipe, ...savedRecipes];
            showToast(`Saved ${recipe.recipeName} to your recipes!`, 'success');
        }

        const updatedUsers = {
            ...allUsers,
            [currentUser]: { ...allUsers[currentUser], savedRecipes: updatedSaved }
        };
        setAllUsers(updatedUsers);
        saveChanges(updatedUsers, currentUser);
    };

    return (
        <AppContext.Provider value={{
            isAppReady, ingredients, setIngredients, isLoading, preferences, handlePreferenceChange,
            handleGenerate, onScanClick, handleStartOver, userProfile, includePantry, setIncludePantry,
            translate, language, setLanguage, currentUser, allUsers, currentProfileUsername,
            handleNavigate, currentPage, handleViewRecipe, selectedRecipe, handleAddToPlan,
            handleUpdatePantry, handleUpdateIntegrations, onOpenVoiceGuide, handleAddFriend,
            handleUploadCreation, handleUpdateProfile, handleUpdatePreferences, handleUpdateChefPersonality,
            handleLikeCreation, handleAddComment, onLoginRequest, handleLogin, handleLogout,
            onReadNotifications, onShoppingListClick, isSaving, handleUpdateMealPlan,
            handleGenerateShoppingList, onUpgradeRequest, handleUpdateShoppingList, handleMoveItemsToPantry,
            handleSelectInspirationRecipe, handleCookWithIngredients, handleDismissOnboarding,
            userImpactStats, handleUpdateLeftovers, leftoverIdeas, isGeneratingIdeas, ideasError,
            handleGenerateLeftoverIdeas, handleClearLeftoverIdeas, setIsFridgeMode, isFridgeMode,
            recipes, error, recipeRatings, isAuthModalOpen, setIsAuthModalOpen, isShoppingListOpen,
            setIsShoppingListOpen, isScanModalOpen, setIsScanModalOpen, isUpgradeModalOpen,
            setIsUpgradeModalOpen, isVoiceGuideOpen, setIsVoiceGuideOpen, handleMarkAsCooked,
            handleIngredientsScanned, handleToggleSave, isReceiptModalOpen, setIsReceiptModalOpen
        }}>
            {children}
        </AppContext.Provider>
    );
};