import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { UserProfile, AllUsersData, Recipe, UserCreation, Preferences, PantryItem, Comment, ChefPersonality } from '../types';
import { useToast } from '../contexts/ToastContext';
import { IntegrationsManager } from './IntegrationsManager';
import { PreferencesForm } from './PreferencesForm';
import EditProfileModal from './EditProfileModal';
import { calculateAchievements } from '../services/achievementsService';
import { BadgesDisplay } from './Badges';
import { CHALLENGES } from '../data/challenges';
import { useAppContext } from '../contexts/AppContext';
import { LeftoversManager } from './LeftoversManager';
import { trackEvent } from '../services/analyticsService';

const ReferralProgram: React.FC<{ username: string }> = ({ username }) => {
    const { showToast } = useToast();
    const referralLink = `${window.location.origin}/join?ref=${username}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink);
        showToast("Referral link copied! Share with friends to unlock Pro.", "success");
        trackEvent('REFERRAL_LINK_COPIED');
    };

    return (
        <div className="bg-gradient-to-br from-[#1A1A1A] to-[#333333] p-10 rounded-[3rem] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
            <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-green-400 mb-4 block">Viral Loop</span>
                <h3 className="text-3xl font-black mb-4 tracking-tighter">Grow the Kitchen</h3>
                <p className="text-gray-400 font-medium mb-8 max-w-md">Invite 3 friends to YouChef. Once they log their first meal, you unlock lifetime <span className="text-white font-bold">Pro Features</span>.</p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center bg-white/5 p-2 rounded-[2rem] border border-white/10">
                    <code className="flex-grow px-4 text-xs font-mono text-green-400 truncate opacity-60">{referralLink}</code>
                    <button onClick={handleCopy} className="btn-active-scale w-full sm:w-auto px-8 py-4 bg-green-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-green-400 transition-all">
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    );
};

const PantryManager: React.FC<{
    pantry: PantryItem[];
    onUpdate: (newPantry: PantryItem[]) => void;
}> = ({ pantry, onUpdate }) => {
    const { setIsReceiptModalOpen } = useAppContext();
    const [newItem, setNewItem] = useState('');
    const [expiresOn, setExpiresOn] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: 'name' | 'expiresOn' | 'inStock'; direction: 'asc' | 'desc' }>({ key: 'expiresOn', direction: 'asc' });
    const { showToast } = useToast();

    const handleAddItem = () => {
        if (newItem.trim() && !pantry.some(p => p.name.toLowerCase() === newItem.trim().toLowerCase())) {
            const updatedPantry = [...pantry, { name: newItem.trim(), inStock: true, expiresOn: expiresOn || undefined }];
            onUpdate(updatedPantry);
            trackEvent('INGREDIENT_ADDED', { name: newItem.trim(), source: 'pantry_manager' });
            setNewItem('');
            setExpiresOn('');
        }
    };
    
    const handleRemoveItem = (itemName: string) => {
        onUpdate(pantry.filter(p => p.name !== itemName));
    };

    const handleToggleStock = (itemName: string) => {
        onUpdate(pantry.map(p => p.name === itemName ? { ...p, inStock: !p.inStock } : p));
    };
    
    const handleBarcodeScan = () => {
        showToast("Barcode scanning is coming soon!", 'info');
    };

    const getExpirationInfo = (expiresOn?: string): { daysLeft: number; label: string; colorClass: string } => {
        if (!expiresOn) return { daysLeft: Infinity, label: 'N/A', colorClass: 'text-gray-400' };
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiryDate = new Date(expiresOn);
        expiryDate.setHours(0,0,0,0);
        
        const diffTime = expiryDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const dateLabel = new Date(expiryDate.getTime() + expiryDate.getTimezoneOffset() * 60000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        if (daysLeft < 0) return { daysLeft, label: `Expired`, colorClass: 'text-red-600 font-bold' };
        if (daysLeft === 0) return { daysLeft, label: `Today`, colorClass: 'text-red-600 font-bold' };
        if (daysLeft <= 3) return { daysLeft, label: `${dateLabel} (in ${daysLeft}d)`, colorClass: 'text-red-600' };
        if (daysLeft <= 7) return { daysLeft, label: `${dateLabel} (in ${daysLeft}d)`, colorClass: 'text-yellow-600' };
        return { daysLeft, label: dateLabel, colorClass: 'text-gray-500' };
    };

    const sortedPantry = useMemo(() => {
        const sortableItems = [...pantry];
        sortableItems.sort((a, b) => {
            let aValue: string | number, bValue: string | number;

            if (sortConfig.key === 'expiresOn') {
                aValue = getExpirationInfo(a.expiresOn).daysLeft;
                bValue = getExpirationInfo(b.expiresOn).daysLeft;
            } else if (sortConfig.key === 'inStock') {
                aValue = a.inStock ? 0 : 1; // In stock first
                bValue = b.inStock ? 0 : 1;
            } else { // 'name'
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [pantry, sortConfig]);

    const requestSort = (key: 'name' | 'expiresOn' | 'inStock') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    const SortableHeader: React.FC<{ sortKey: typeof sortConfig.key, children: React.ReactNode }> = ({ sortKey, children }) => {
        const isSorted = sortConfig.key === sortKey;
        return (
            <th className="p-3 text-left text-xs font-bold text-[#333333] uppercase tracking-wider">
                <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1 group">
                    {children}
                    <span className={`transition-opacity ${isSorted ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}>
                        {isSorted && sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                </button>
            </th>
        );
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border">
            <h3 className="text-xl font-bold mb-4 text-[#333333]">My Pantry</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                    type="text"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    placeholder="e.g., olive oil, flour, salt"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md"
                />
                 <input
                    type="date"
                    value={expiresOn}
                    onChange={e => setExpiresOn(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-500"
                    title="Optional: Expiration Date"
                />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <button onClick={handleAddItem} className="w-full sm:flex-1 px-4 py-2 bg-[#588517] text-white font-semibold rounded-md hover:bg-opacity-90">Add Item</button>
                <button onClick={() => setIsReceiptModalOpen(true)} className="w-full sm:flex-1 px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Scan Receipt
                </button>
                <button onClick={handleBarcodeScan} className="w-full sm:flex-1 px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 3a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1h-1a1 1 0 01-1-1V7zm5 0a1 1 0 011-1h1a1 1 0 011 1v8a1 1 0 01-1 1h-1a1 1 0 01-1-1V7z" clipRule="evenodd" /></svg>
                    Scan Barcode
                </button>
            </div>
            
            <div className="overflow-x-auto">
                {pantry.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <SortableHeader sortKey="name">Item</SortableHeader>
                                <SortableHeader sortKey="expiresOn">Expires</SortableHeader>
                                <SortableHeader sortKey="inStock">Status</SortableHeader>
                                <th className="p-3 text-left text-xs font-bold text-[#333333] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedPantry.map(item => {
                                const expInfo = getExpirationInfo(item.expiresOn);
                                return (
                                <tr key={item.name} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 capitalize font-medium text-[#333333]">{item.name}</td>
                                    <td className={`p-3 text-sm font-semibold ${expInfo.colorClass}`}>{expInfo.label}</td>
                                    <td className="p-3">
                                        <label htmlFor={`stock-${item.name}`} className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" id={`stock-${item.name}`} className="sr-only peer" checked={item.inStock} onChange={() => handleToggleStock(item.name)} />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-900 sr-only">{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                                        </label>
                                    </td>
                                    <td className="p-3">
                                        <button onClick={() => handleRemoveItem(item.name)} className="text-gray-400 hover:text-red-600 p-1" aria-label={`Remove ${item.name}`}>
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </td>
                                </tr>
                                )
                            })}
                        </tbody>
                    </table>
                ) : <p className="text-center text-[#333333] py-10">Your pantry is empty. Add some staple ingredients!</p>}
            </div>
        </div>
    );
};

const CHEF_DETAILS: Record<ChefPersonality, { name: string; description: string; icon: string }> = {
    zephyr: { name: 'Zephyr', description: 'Encouraging & creative', icon: '🍃' },
    pierre: { name: 'Pierre', description: 'Witty & sophisticated', icon: '🍷' },
    sarge: { name: 'Sarge', description: 'Efficient & no-nonsense', icon: '🎖️' },
    nonna: { name: 'Nonna', description: 'Warm & nurturing', icon: '🍝' },
};

const ChefSelector: React.FC<{
    currentChef: ChefPersonality;
    onSelect: (chef: ChefPersonality) => void;
}> = ({ currentChef, onSelect }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(CHEF_DETAILS) as ChefPersonality[]).map((id) => {
                const details = CHEF_DETAILS[id];
                return (
                    <button
                        key={id}
                        onClick={() => onSelect(id)}
                        className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${currentChef === id ? 'bg-green-100 border-green-400 shadow-inner' : 'bg-gray-50 border-gray-200 hover:border-green-300'}`}
                    >
                        <span className="text-4xl">{details.icon}</span>
                        <span className="block mt-2 font-bold text-[#333333]">{details.name}</span>
                        <p className="text-xs text-[#333333] mt-1">{details.description}</p>
                    </button>
                );
            })}
        </div>
    );
};


const ProfilePage: React.FC = () => {
    const {
        allUsers,
        currentProfileUsername,
        currentUser: loggedInUsername,
        handleNavigate,
        handleViewRecipe,
        handleAddToPlan,
        handleUpdatePantry,
        handleUpdateIntegrations,
        onOpenVoiceGuide,
        handleAddFriend,
        handleUploadCreation,
        handleUpdateProfile,
        handleUpdatePreferences,
        handleUpdateChefPersonality,
        handleLikeCreation,
        handleAddComment
    } = useAppContext();

    const activeUsername = currentProfileUsername || loggedInUsername;
    const profile = activeUsername ? allUsers[activeUsername] : null;
    const isCurrentUser = activeUsername === loggedInUsername;

    const [activeTab, setActiveTab] = useState<'recipes' | 'pantry' | 'leftovers' | 'creations' | 'friends' | 'settings' | 'integrations' | 'challenges' | 'growth'>('recipes');
    const creationUploadRef = useRef<HTMLInputElement>(null);
    const [recipeToUploadFor, setRecipeToUploadFor] = useState<Recipe | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (isCurrentUser) {
            trackEvent('CHEF_CHANGED', { username: loggedInUsername });
        }
    }, [isCurrentUser, loggedInUsername]);

    const earnedBadges = useMemo(() => profile ? calculateAchievements(profile) : [], [profile]);

    const handleUploadClick = (recipe: Recipe) => {
        setRecipeToUploadFor(recipe);
        creationUploadRef.current?.click();
    };

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0] && recipeToUploadFor) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const userImageUrl = loadEvent.target?.result as string;
                if (userImageUrl) {
                    handleUploadCreation({
                        recipeName: recipeToUploadFor.recipeName,
                        recipeImageUrl: recipeToUploadFor.imageUrl,
                        userImageUrl: userImageUrl,
                        notes: `My delicious version of ${recipeToUploadFor.recipeName}!`
                    });
                    setRecipeToUploadFor(null);
                    setActiveTab('creations');
                }
            };
            reader.readAsDataURL(file);
        }
        event.target.value = '';
    };
    
    const handlePreferenceChange = (field: keyof Preferences, value: string | number | boolean) => {
        if (!profile) return;
        const newPrefs = { ...profile.preferences, [field]: value };
        handleUpdatePreferences(newPrefs);
    };

    if (!loggedInUsername && !currentProfileUsername) {
        return (
            <div className="max-w-xl mx-auto py-24 text-center">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border">
                    <h2 className="text-2xl font-black text-[#1A1A1A] mb-4">Chef Session Required</h2>
                    <p className="text-gray-500 mb-8">Please log in to view and manage your culinary profile.</p>
                    <button onClick={() => handleNavigate('home')} className="px-8 py-3 bg-[#588517] text-white font-bold rounded-full hover:bg-opacity-90 transition-all">Back to Home</button>
                </div>
            </div>
        );
    }

    if (activeUsername && !profile) {
        return (
            <div className="max-w-xl mx-auto py-24 text-center">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border">
                    <h2 className="text-2xl font-black text-[#1A1A1A] mb-4">Profile Not Found</h2>
                    <p className="text-gray-500 mb-8">We couldn't find a chef with the username "@{activeUsername}".</p>
                    <button onClick={() => handleNavigate('home')} className="px-8 py-3 bg-[#588517] text-white font-bold rounded-full hover:bg-opacity-90 transition-all">Back to Home</button>
                </div>
            </div>
        );
    }

    if (!profile) return <div className="text-center py-20 text-gray-500">Profile Loading...</div>;

    const TabButton: React.FC<{ tabId: typeof activeTab, children: React.ReactNode }> = ({ tabId, children }) => (
        <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeTab === tabId ? 'bg-[#588517] text-white' : 'text-[#333333] hover:bg-green-100'}`}>{children}</button>
    );

    const CreationCard: React.FC<{ creation: UserCreation, owner: UserProfile, index: number }> = ({ creation, owner, index }) => {
        const [commentText, setCommentText] = useState('');
        const likes = creation.likes || [];
        const comments = creation.comments || [];
        const hasLiked = loggedInUsername && likes.includes(loggedInUsername);

        const handleCommentSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if(commentText.trim()){
                handleAddComment(owner.username, index, commentText.trim());
                setCommentText('');
            }
        };

        return (
            <div className="bg-white rounded-lg shadow border overflow-hidden">
                <img src={creation.userImageUrl} alt={`User creation for ${creation.recipeName}`} className="w-full h-64 object-cover" />
                <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-lg text-[#333333]">{creation.recipeName}</p>
                        {creation.aiScore !== undefined && (
                            <div className="bg-green-500 text-white px-2 py-1 rounded-lg font-black text-xs">
                                {creation.aiScore}/100
                            </div>
                        )}
                    </div>
                    {creation.notes && <p className="text-sm text-[#333333] mb-3 italic">"{creation.notes}"</p>}
                    {creation.aiCritique && (
                        <div className="mb-4 p-3 bg-gray-50 border-l-4 border-green-500 rounded-r-lg">
                            <p className="text-[10px] font-black uppercase text-green-700 tracking-widest mb-1">Chef's Critique</p>
                            <p className="text-xs text-[#333333] leading-relaxed italic">"{creation.aiCritique}"</p>
                        </div>
                    )}
                    <div className="flex items-center space-x-4 mb-4">
                        <button onClick={() => loggedInUsername && handleLikeCreation(owner.username, index)} className={`flex items-center space-x-1 text-sm ${hasLiked ? 'text-red-500 font-bold' : 'text-[#333333]'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                            <span>{likes.length}</span>
                        </button>
                        <span className="flex items-center space-x-1 text-sm text-[#333333]">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" /></svg>
                             <span>{comments.length}</span>
                        </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-4 border-t pt-3">
                        {comments.map((c, i) => (
                            <div key={i} className="flex items-start space-x-2 text-xs">
                                <img src={c.profilePictureUrl} alt={c.username} className="w-6 h-6 rounded-full flex-shrink-0" />
                                <div className="bg-gray-50 p-2 rounded-xl">
                                    <strong className="font-semibold">{c.username}</strong>
                                    <p className="mt-0.5">{c.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    {loggedInUsername && (
                        <form onSubmit={handleCommentSubmit} className="flex space-x-2">
                            <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Say something nice..." className="w-full text-xs px-3 py-2 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-green-500 outline-none" />
                            <button type="submit" className="px-3 py-2 bg-green-500 text-white text-xs font-bold rounded-full hover:bg-green-600 transition-all">Send</button>
                        </form>
                    )}
                </div>
            </div>
        );
    };

    const xpToNext = (profile.level * 500) - (profile.xp % 500);
    const progressPercent = ((profile.xp % 500) / 500) * 100;

    return (
        <div className="max-w-5xl mx-auto animate-fade-in-up">
            <header className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col md:flex-row items-center gap-10 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none rotate-12">
                     <span className="text-9xl font-black whitespace-nowrap uppercase">Mastery</span>
                </div>
                
                <div className="relative">
                    <img src={profile.profilePictureUrl} alt={profile.displayName} className="w-32 h-32 rounded-[2rem] object-cover ring-8 ring-green-50 shadow-2xl" />
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white font-black text-xl border-4 border-white shadow-lg">
                        {profile.level}
                    </div>
                </div>

                <div className="flex-grow text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-end gap-3 mb-2">
                        <h2 className="text-4xl font-black text-[#1A1A1A] tracking-tighter">{profile.displayName}</h2>
                        <span className="text-gray-400 font-bold text-sm mb-1">@{profile.username}</span>
                    </div>
                    <p className="text-gray-500 font-medium max-w-lg text-balance mb-6">{profile.bio}</p>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span>Culinary XP: {profile.xp}</span>
                            <span>Next Level: {xpToNext} XP</span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50 shadow-inner">
                            <div className="h-full bg-green-500 transition-all duration-1000 ease-out shadow-[0_0_10px_#10b981]" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <BadgesDisplay badgeIds={earnedBadges} />
                    </div>
                </div>

                {isCurrentUser ? (
                    <button onClick={() => setIsEditModalOpen(true)} className="px-6 py-3 bg-gray-50 text-[#1A1A1A] font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 self-start transition-all border border-gray-100 shadow-sm">
                        Edit Profile
                    </button>
                ) : loggedInUsername && (
                    <button onClick={() => handleAddFriend(profile.username)} disabled={(allUsers[loggedInUsername]?.friends || []).includes(profile.username)} className="btn-active-scale px-8 py-4 bg-[#2D450D] text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:opacity-90 disabled:bg-green-100 disabled:text-green-800 disabled:cursor-not-allowed self-start">
                        {(allUsers[loggedInUsername]?.friends || []).includes(profile.username) ? 'FRIENDS' : 'ADD CHEF'}
                    </button>
                )}
            </header>

            <div className="bg-white p-2 rounded-[2.5rem] shadow-md border border-gray-100 flex flex-wrap justify-center gap-1 mb-8">
                <TabButton tabId="recipes">Saved Recipes</TabButton>
                {isCurrentUser && <TabButton tabId="pantry">Pantry</TabButton>}
                {isCurrentUser && <TabButton tabId="leftovers">Leftovers</TabButton>}
                <TabButton tabId="creations">Creations</TabButton>
                <TabButton tabId="friends">Kitchen Circle</TabButton>
                <TabButton tabId="challenges">Challenges</TabButton>
                {isCurrentUser && <TabButton tabId="growth">Referrals</TabButton>}
                {isCurrentUser && <TabButton tabId="integrations">Sync</TabButton>}
                {isCurrentUser && <TabButton tabId="settings">Chef Persona</TabButton>}
            </div>

            <div>
                {activeTab === 'recipes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {(profile.savedRecipes || []).length > 0 ? (profile.savedRecipes || []).map(r => {
                            const cookedEntries = (profile.cookedHistory || [])
                                .filter(h => h.recipeName === r.recipeName)
                                .sort((a, b) => new Date(b.cookedDate).getTime() - new Date(a.cookedDate).getTime());
                            const lastCooked = cookedEntries[0];

                            return (
                                <div key={r.recipeName} className="bg-white rounded-[2.5rem] shadow-lg border border-gray-50 flex flex-col transition-all hover:shadow-2xl group overflow-hidden">
                                    <button onClick={() => handleViewRecipe(r)} className="block w-full text-left flex-grow">
                                        <div className="overflow-hidden h-48">
                                            <img src={r.imageUrl} alt={r.recipeName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        </div>
                                        <div className="p-8">
                                            <h4 className="font-black text-xl text-[#1A1A1A] tracking-tight group-hover:text-green-700 transition-colors">{r.recipeName}</h4>
                                            <p className="text-sm text-gray-500 font-medium line-clamp-2 mt-2">{r.description}</p>
                                            {lastCooked && (
                                                <div className="mt-4 flex items-center gap-3">
                                                    <div className="px-3 py-1 bg-green-50 rounded-full inline-block">
                                                        <p className="text-[10px] font-black uppercase text-green-700">
                                                        Logged: {new Date(lastCooked.cookedDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {lastCooked.photoUrl && (
                                                        <img src={lastCooked.photoUrl} alt="Cooked" className="w-8 h-8 rounded-lg object-cover ring-2 ring-white shadow-sm" />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                    <div className="px-8 pb-8">
                                        {isCurrentUser && (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAddToPlan(r)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-gray-50 text-gray-400 rounded-xl hover:bg-green-50 hover:text-green-700 transition-all border border-gray-100">
                                                    Plan
                                                </button>
                                                <button onClick={() => handleUploadClick(r)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-[#1A1A1A] text-white rounded-xl hover:opacity-90 transition-all shadow-lg">
                                                    Upload
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        }) : <p className="col-span-full text-center py-20 text-gray-300 font-black uppercase tracking-[0.3em]">No saved recipes yet.</p>}
                    </div>
                )}
                 {activeTab === 'pantry' && isCurrentUser && (
                    <PantryManager pantry={profile.pantry || []} onUpdate={handleUpdatePantry} />
                )}
                 {activeTab === 'leftovers' && isCurrentUser && (
                    <LeftoversManager />
                )}
                 {activeTab === 'creations' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {(profile.creations || []).length > 0 ? (profile.creations || []).map((c, i) => (
                           <CreationCard key={i} creation={c} owner={profile} index={i} />
                        )) : <p className="col-span-full text-center py-20 text-gray-300 font-black uppercase tracking-[0.3em]">No creations uploaded yet.</p>}
                    </div>
                )}
                {activeTab === 'friends' && (
                     <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
                        <h3 className="text-xl font-black text-[#1A1A1A] mb-8 uppercase tracking-widest">Kitchen Circle ({(profile.friends || []).length})</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(profile.friends || []).map(f => {
                                const friendProfile = allUsers[f];
                                if (!friendProfile) return null;
                                return (
                                    <button key={f} onClick={() => handleNavigate('profile', f)} className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] hover:bg-white hover:shadow-xl transition-all group">
                                        <img src={friendProfile.profilePictureUrl} alt={f} className="w-16 h-16 rounded-2xl object-cover bg-white shadow-sm transition-transform group-hover:scale-105" />
                                        <div className="text-left">
                                            <span className="block font-black text-[#1A1A1A] tracking-tighter">{friendProfile.displayName}</span>
                                            <span className="text-[10px] font-black uppercase text-gray-400">Level {friendProfile.level} Chef</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
                {activeTab === 'challenges' && (
                     <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
                        <h3 className="text-xl font-black text-[#1A1A1A] mb-8 uppercase tracking-widest">Global Challenges</h3>
                        <div className="space-y-6">
                            {CHALLENGES.map(challenge => (
                                <div key={challenge.id} className={`p-8 rounded-[2rem] border-2 flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${challenge.isActive ? 'border-green-500 bg-green-50 shadow-green-900/5 shadow-xl' : 'border-gray-100 bg-gray-50'}`}>
                                    <div className="text-center md:text-left">
                                        <h4 className="font-black text-2xl text-[#1A1A1A] tracking-tighter">{challenge.title}</h4>
                                        <p className="text-sm text-gray-500 font-medium mt-1">{challenge.description}</p>
                                    </div>
                                    {challenge.isActive ? (
                                        <button className="btn-active-scale px-10 py-4 bg-green-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg hover:opacity-90">
                                            Accept Mission
                                        </button>
                                    ) : (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Closed</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {activeTab === 'growth' && isCurrentUser && (
                    <ReferralProgram username={profile.username} />
                )}
                 {activeTab === 'integrations' && isCurrentUser && (
                    <IntegrationsManager
                        userProfile={profile}
                        onUpdateIntegrations={handleUpdateIntegrations}
                        onOpenVoiceGuide={onOpenVoiceGuide}
                    />
                )}
                 {activeTab === 'settings' && isCurrentUser && (
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 space-y-12">
                        <div>
                            <h3 className="text-2xl font-black text-[#1A1A1A] mb-4 tracking-tighter">Your Digital Sous Chef</h3>
                            <p className="text-gray-500 font-medium mb-8">Personalize your kitchen assistant's personality and voice.</p>
                            <ChefSelector currentChef={profile.selectedChef || 'zephyr'} onSelect={handleUpdateChefPersonality} />
                        </div>
                        <div className="pt-12 border-t border-gray-50">
                            <h3 className="text-2xl font-black text-[#1A1A1A] mb-4 tracking-tighter">Kitchen Profile Defaults</h3>
                            <PreferencesForm preferences={profile.preferences} onPreferenceChange={handlePreferenceChange} />
                        </div>
                    </div>
                )}
            </div>
            <input type="file" ref={creationUploadRef} onChange={handleFileSelected} accept="image/*" className="hidden" aria-hidden="true" />
            {isCurrentUser && (
                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    userProfile={profile}
                    onSave={handleUpdateProfile}
                />
            )}
        </div>
    );
};

export default ProfilePage;