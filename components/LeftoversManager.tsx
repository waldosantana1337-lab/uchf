import React, { useState } from 'react';
import type { Leftover, LeftoverIdea } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { Loader } from './Loader';
import { LeftoverIdeaCard } from './LeftoverIdeaCard';

export const LeftoversManager: React.FC = () => {
    const {
        userProfile,
        handleUpdateLeftovers,
        leftoverIdeas,
        isGeneratingIdeas,
        ideasError,
        handleGenerateLeftoverIdeas,
        handleClearLeftoverIdeas,
    } = useAppContext();
    const { showToast } = useToast();

    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [category, setCategory] = useState<Leftover['category']>('Other');
    const [notes, setNotes] = useState('');
    
    const leftovers = userProfile?.leftovers || [];

    const handleAddLeftover = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !quantity.trim()) {
            showToast('Please provide a name and quantity for your leftover.', 'error');
            return;
        }

        const newLeftover: Leftover = {
            id: Date.now().toString(),
            name: name.trim(),
            quantity: quantity.trim(),
            category,
            notes: notes.trim() || undefined,
            addedDate: new Date().toISOString(),
        };

        handleUpdateLeftovers([...leftovers, newLeftover]);

        // Reset form
        setName('');
        setQuantity('');
        setCategory('Other');
        setNotes('');
    };

    const handleRemoveLeftover = (id: string) => {
        const updatedLeftovers = leftovers.filter(l => l.id !== id);
        handleUpdateLeftovers(updatedLeftovers);
        // If removing the last leftover clears the ideas
        if (updatedLeftovers.length === 0) {
            handleClearLeftoverIdeas();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Add and View Leftovers */}
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h3 className="text-xl font-bold mb-4 text-[#333333]">My Leftovers</h3>
                
                {/* Add Leftover Form */}
                <form onSubmit={handleAddLeftover} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold text-center">Add a Leftover</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="leftover-name" className="block text-sm font-medium text-[#333333]">Name</label>
                            <input id="leftover-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Roasted Chicken" className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md" required />
                        </div>
                         <div>
                            <label htmlFor="leftover-quantity" className="block text-sm font-medium text-[#333333]">Quantity</label>
                            <input id="leftover-quantity" type="text" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g., 2 pieces, 1 cup" className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="leftover-category" className="block text-sm font-medium text-[#333333]">Category</label>
                        <select id="leftover-category" value={category} onChange={e => setCategory(e.target.value as Leftover['category'])} className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md">
                            <option>Cooked Meat</option>
                            <option>Grains</option>
                            <option>Vegetables</option>
                            <option>Takeout</option>
                            <option>Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="leftover-notes" className="block text-sm font-medium text-[#333333]">Notes (Optional)</label>
                        <input id="leftover-notes" type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g., A bit spicy" className="mt-1 w-full px-3 py-2 bg-white border border-gray-300 rounded-md" />
                    </div>
                    <button type="submit" className="w-full px-4 py-2 bg-[#588517] text-white font-semibold rounded-md hover:bg-opacity-90">Add to List</button>
                </form>

                {/* List of Leftovers */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {leftovers.length > 0 ? (
                        leftovers.map(item => (
                            <div key={item.id} className="p-3 bg-white rounded-lg border flex justify-between items-start">
                                <div>
                                    <p className="font-semibold capitalize">{item.name}</p>
                                    <p className="text-sm text-gray-500">{item.quantity} - <span className="italic">{item.category}</span></p>
                                     {item.notes && <p className="text-xs text-gray-400 mt-1">Note: {item.notes}</p>}
                                </div>
                                <button onClick={() => handleRemoveLeftover(item.id)} className="text-gray-400 hover:text-red-600 p-1" aria-label={`Remove ${item.name}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-10">No leftovers logged. Add one above!</p>
                    )}
                </div>
            </div>

            {/* Right Column: Culinary Transformation Ideas */}
            <div className="bg-white p-6 rounded-xl shadow-md border flex flex-col">
                <h3 className="text-xl font-bold text-center mb-4 text-[#333333]">Culinary Transformations</h3>
                <button
                    onClick={handleGenerateLeftoverIdeas}
                    disabled={isGeneratingIdeas || leftovers.length === 0}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold text-base rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105 duration-200 disabled:bg-orange-300 disabled:cursor-not-allowed"
                >
                    {isGeneratingIdeas ? <><Loader /> Curating Ideas...</> : '✨ Get Creative Ideas'}
                </button>

                <div className="mt-6 flex-grow">
                    {isGeneratingIdeas && (
                        <div className="text-center py-10 animate-pulse">
                            <p className="font-semibold text-[#333333]">Designing Your Rescue Menu...</p>
                        </div>
                    )}
                    {ideasError && <p className="text-center text-red-500">{ideasError}</p>}
                    {leftoverIdeas && (
                        <div className="space-y-4 animate-fade-in">
                            {leftoverIdeas.map((idea, index) => (
                                <LeftoverIdeaCard key={index} idea={idea} />
                            ))}
                        </div>
                    )}
                     {!isGeneratingIdeas && !ideasError && !leftoverIdeas && (
                         <div className="text-center text-gray-500 pt-10">
                            <p>Request professional techniques to transform your existing dishes.</p>
                        </div>
                     )}
                </div>
                 {leftoverIdeas && (
                    <button onClick={handleClearLeftoverIdeas} className="text-sm font-semibold text-gray-500 hover:underline mt-4 self-center">
                        Clear Ideas
                    </button>
                )}
            </div>
        </div>
    );
};
