import React, { useState, useMemo, useEffect } from 'react';
import type { UserProfile, ShoppingListItem } from '../types';
import { useToast } from '../contexts/ToastContext';
import { Modal } from './common/Modal';
import { categorizeShoppingList } from '../services/geminiService';
import { useAppContext } from '../contexts/AppContext';
import { GroceryFinder } from './GroceryFinder';

interface ShoppingListModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CategorizedList {
    category: string;
    items: ShoppingListItem[];
}


export const ShoppingListModal: React.FC<ShoppingListModalProps> = ({ isOpen, onClose }) => {
    const { userProfile, handleUpdateShoppingList, handleMoveItemsToPantry } = useAppContext();
    const [newItemName, setNewItemName] = useState('');
    const { showToast } = useToast();
    
    if (!userProfile) return null;
    
    const shoppingList = userProfile.shoppingList || [];
    
    const [categorizedList, setCategorizedList] = useState<CategorizedList[] | null>(null);
    const [isCategorizing, setIsCategorizing] = useState(false);
    const [categorizationError, setCategorizationError] = useState<string | null>(null);
    const [showStoreFinder, setShowStoreFinder] = useState(false);

    const itemNamesKey = useMemo(() => {
        return shoppingList.map(i => i.name).sort().join(',');
    }, [shoppingList]);

    const ingredientsToBuy = useMemo(() => {
        return shoppingList.filter(item => !item.isChecked).map(item => item.name);
    }, [shoppingList]);
    
    const groupListByRecipe = (list: ShoppingListItem[]): CategorizedList[] => {
        const grouped = list.reduce((acc, item) => {
            const groupName = item.forRecipe || 'General';
            if (!acc[groupName]) {
                acc[groupName] = [];
            }
            acc[groupName].push(item);
            return acc;
        }, {} as Record<string, ShoppingListItem[]>);
        return Object.entries(grouped).map(([category, items]) => ({ category, items }));
    };

    useEffect(() => {
        if (!isOpen) {
            setShowStoreFinder(false);
            return;
        }

        if (shoppingList.length === 0) {
            setCategorizedList(null);
            setIsCategorizing(false);
            setCategorizationError(null);
            return;
        }

        const getCategories = async () => {
            setIsCategorizing(true);
            setCategorizationError(null);
            try {
                const itemNames = shoppingList.map(item => item.name);
                const categories = await categorizeShoppingList(itemNames);
                
                const listWithFullItems = categories.map(cat => ({
                    category: cat.category,
                    items: cat.items.map(itemName => 
                        shoppingList.find(shoppingItem => shoppingItem.name === itemName)!
                    ).filter(Boolean)
                }));

                setCategorizedList(listWithFullItems);

            } catch (error: any) {
                console.error("Failed to categorize shopping list:", error);
                setCategorizationError("Couldn't categorize list. Showing default view.");
                setCategorizedList(groupListByRecipe(shoppingList));
            } finally {
                setIsCategorizing(false);
            }
        };

        getCategories();
    }, [isOpen, itemNamesKey, shoppingList]);
    
    const handleToggleItem = (itemName: string) => {
        const updatedList = shoppingList.map(item =>
            item.name.toLowerCase() === itemName.toLowerCase()
                ? { ...item, isChecked: !item.isChecked }
                : item
        );
        handleUpdateShoppingList(updatedList);
    };

    const handleRemoveItem = (itemName: string) => {
        handleUpdateShoppingList(shoppingList.filter(item => item.name.toLowerCase() !== itemName.toLowerCase()));
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (newItemName.trim() && !shoppingList.some(item => item.name.toLowerCase() === newItemName.trim().toLowerCase())) {
            const newItem: ShoppingListItem = { name: newItemName.trim(), forRecipe: 'Manual Add', isChecked: false };
            handleUpdateShoppingList([...shoppingList, newItem]);
            setNewItemName('');
        } else if (newItemName.trim()) {
            showToast("Item is already on the list.", 'info');
        }
    };
    
    const handleClearChecked = () => {
        if(confirm("Are you sure you want to remove all checked items from your list?")) {
            handleUpdateShoppingList(shoppingList.filter(item => !item.isChecked));
        }
    };
    
    const checkedCount = shoppingList.filter(i => i.isChecked).length;
    
    const renderListContent = () => {
        if (isCategorizing) {
            return (
                <div className="text-center py-12 animate-pulse">
                    <p className="font-semibold text-[#333333]">✨ Categorizing your list...</p>
                </div>
            );
        }

        const listToRender = categorizedList;
        
        if (!listToRender || shoppingList.length === 0) {
            return (
                <div className="text-center py-12">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    <h3 className="mt-2 text-lg font-medium text-[#333333]">Your shopping list is empty</h3>
                    <p className="mt-1 text-sm text-[#333333]">Generate a list from your meal plan or add items below.</p>
                </div>
            );
        }
        
        return listToRender.map(({ category, items }) => (
            <details key={category} className="group" open>
                 <summary className="flex justify-between items-center cursor-pointer list-none font-semibold text-green-700 mb-2 py-1">
                    <span>{category} ({items.length})</span>
                    <span className="text-green-600 transition-transform duration-300 transform group-open:rotate-180">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                    </span>
                </summary>
                <ul className="space-y-2 pl-2 border-l-2 border-green-100">
                    {items.map((item, index) => (
                        <li key={`${item.name}-${index}`} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={!!item.isChecked}
                                    onChange={() => handleToggleItem(item.name)}
                                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                />
                                <div>
                                    <span className={`capitalize ${item.isChecked ? 'line-through text-gray-400' : 'text-[#333333]'}`}>{item.name}</span>
                                    {item.forRecipe !== 'Manual Add' && <p className="text-xs text-gray-400">For: {item.forRecipe}</p>}
                                </div>
                            </label>
                            <button onClick={() => handleRemoveItem(item.name)} className="text-red-400 hover:text-red-600 text-xl" aria-label={`Remove ${item.name}`}>&times;</button>
                        </li>
                    ))}
                </ul>
            </details>
        ));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            titleId="shopping-list-title"
            className="max-w-lg"
            dialogClassName="flex flex-col max-h-[90vh]"
        >
            <header className="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10">
                <h2 id="shopping-list-title" className="text-xl font-bold text-[#333333]">Shopping List</h2>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full" aria-label="Close modal">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>
            
            <div className="overflow-y-auto p-5 space-y-4">
                {categorizationError && (
                    <p className="text-center text-sm text-yellow-700 bg-yellow-50 p-2 rounded-md">{categorizationError}</p>
                )}
                {renderListContent()}
                {showStoreFinder && (
                    <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                        <GroceryFinder ingredients={ingredientsToBuy} />
                    </div>
                )}
            </div>
            
            <footer className="p-4 bg-gray-100 border-t border-gray-200 mt-auto">
                <form onSubmit={handleAddItem} className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="Add another item..."
                        className="flex-grow w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-[#588517]"
                    />
                    <button type="submit" className="px-5 py-2 bg-[#588517] text-white font-semibold rounded-full hover:bg-opacity-90">Add</button>
                </form>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button onClick={handleMoveItemsToPantry} disabled={checkedCount === 0} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-300">
                        Add Purchased to Pantry ({checkedCount})
                    </button>
                     <button
                        onClick={() => setShowStoreFinder(prev => !prev)}
                        disabled={ingredientsToBuy.length === 0}
                        className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 disabled:bg-gray-300 flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                        {showStoreFinder ? 'Hide Store Finder' : 'Find Stores Nearby'}
                    </button>
                </div>
                <div className="mt-2">
                    <button onClick={handleClearChecked} disabled={checkedCount === 0} className="w-full px-4 py-2 bg-white border border-gray-300 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:bg-gray-100">
                        Clear Checked Items
                    </button>
                </div>
            </footer>
        </Modal>
    );
};