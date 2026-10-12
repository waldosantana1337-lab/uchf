import React, { useState, useEffect } from 'react';
import { Modal } from './common/Modal';

export const MarkAsCookedModal: React.FC<{
    isOpen: boolean;
    recipeName: string;
    onClose: () => void;
    onSave: (cookedDate: string, notes: string, rating: number, photoUrl?: string) => void;
    initialPhotoUrl?: string;
}> = ({ isOpen, recipeName, onClose, onSave, initialPhotoUrl }) => {
    const [cookedDate, setCookedDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialPhotoUrl);
    const [isUploading, setIsUploading] = useState(false);

    // Reset state when modal opens for a new recipe
    useEffect(() => {
        if(isOpen) {
            setCookedDate(new Date().toISOString().split('T')[0]);
            setNotes('');
            setRating(0);
            setHoverRating(0);
            setPhotoUrl(initialPhotoUrl);
        }
    }, [isOpen, initialPhotoUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoUrl(reader.result as string);
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSave(new Date(cookedDate).toISOString(), notes, rating, photoUrl);
        onClose();
    };
    
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            titleId="mark-as-cooked-title"
            className="max-w-md"
        >
            <div className="p-6">
                <h3 id="mark-as-cooked-title" className="text-xl font-bold text-green-800 mb-2">You cooked "{recipeName}"!</h3>
                <p className="text-green-800 mb-4">Record when you cooked it and add any notes for next time.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-green-800 mb-2">Upload Photo of Your Masterpiece</label>
                        <div className="flex flex-col items-center">
                            {photoUrl ? (
                                <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 group">
                                    <img src={photoUrl} alt="Your dish" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => setPhotoUrl(undefined)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Remove photo"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <label className="w-full h-32 border-2 border-dashed border-green-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-green-50 transition-colors mb-3">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                    />
                                    <svg className={`w-8 h-8 text-green-300 mb-2 ${isUploading ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest">{isUploading ? 'Processing...' : 'Upload Dish Photo'}</span>
                                </label>
                            )}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="cookedDate" className="block text-sm font-medium text-green-800">Cooked On</label>
                        <input
                            type="date"
                            id="cookedDate"
                            value={cookedDate}
                            onChange={e => setCookedDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#588517] focus:border-[#588517] sm:text-sm"
                        />
                    </div>
                        <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-green-800">Private Notes</label>
                        <textarea
                            id="notes"
                            rows={2}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="e.g., 'Used less salt,' 'Great with a side of salad.'"
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#588517] focus:border-[#588517] sm:text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-green-800">Your Rating</label>
                        <div className="flex items-center mt-1" onMouseLeave={() => setHoverRating(0)}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoverRating(star)}
                                    onClick={() => setRating(star)}
                                    className="text-3xl focus:outline-none"
                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                    <span className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-green-800 font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-[#588517] text-white font-semibold rounded-lg hover:bg-opacity-90">Save</button>
                </div>
            </div>
        </Modal>
    );
};

export default MarkAsCookedModal;