import React from 'react';
import type { Recipe } from '../types';
import { useToast } from '../contexts/ToastContext';
import { Modal } from './common/Modal';

interface ShareModalProps {
    isOpen: boolean;
    recipe: Recipe;
    friends: string[];
    onClose: () => void;
    onShareWithFriend: (friendUsername: string, recipe: Recipe) => void;
}

const SocialButton: React.FC<{ onClick: () => void, children: React.ReactNode, bgColor: string }> = ({ onClick, children, bgColor }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-center p-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 ${bgColor}`}>
        {children}
    </button>
);

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, recipe, friends, onClose, onShareWithFriend }) => {
    const { showToast } = useToast();
    
    if (!isOpen) return null;

    const shareText = `Check out this recipe I found on YouChef: ${recipe.recipeName}! Ingredients: ${recipe.ingredients.join(', ')}.`;
    // In a real app, this would be a URL to the recipe page
    const shareUrl = "https://youchef.ai"; 
    
    const handleShare = (friend: string) => {
        onShareWithFriend(friend, recipe);
        onClose();
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(shareText);
        showToast('Recipe details copied to clipboard!', 'success');
    };
    
    const handleDownloadImage = () => {
        if (!recipe.imageUrl) return;
        // This only works for data URLs (AI generated) or same-origin images.
        // For cross-origin URLs (like Unsplash), a server-side proxy would be needed.
        if (!recipe.imageUrl.startsWith('data:') && !recipe.imageUrl.startsWith(window.location.origin)) {
            showToast("Cannot download image from external source directly.", "error");
            return;
        }
        const link = document.createElement('a');
        link.href = recipe.imageUrl;
        link.download = `${recipe.recipeName.replace(/\s+/g, '_').toLowerCase()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            titleId="share-modal-title"
            className="max-w-md"
        >
            <div className="p-6">
                <h3 id="share-modal-title" className="text-xl font-bold text-[#152238] mb-4">Share "{recipe.recipeName}"</h3>
                
                <div className="space-y-3">
                    <SocialButton
                        onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')}
                        bgColor="bg-black"
                    >
                        Share on X
                    </SocialButton>
                        <SocialButton
                        onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank')}
                        bgColor="bg-blue-600"
                    >
                        Share on Facebook
                    </SocialButton>
                        <button
                        onClick={handleCopyToClipboard}
                        className="w-full p-3 rounded-lg font-semibold bg-gray-100 text-[#152238] hover:bg-gray-200"
                        >
                        Copy to Clipboard
                        </button>
                        {recipe.imageUrl && (recipe.imageUrl.startsWith('data:image') || recipe.imageUrl.startsWith('blob:')) && (
                            <button
                            onClick={handleDownloadImage}
                            className="w-full p-3 rounded-lg font-semibold bg-gray-100 text-[#152238] hover:bg-gray-200"
                            >
                            Download Image (for Instagram)
                            </button>
                        )}
                </div>
                
                {friends.length > 0 && (
                    <>
                        <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div><div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">or share with friends</span></div></div>
                        <div className="max-h-40 overflow-y-auto space-y-2">
                            {friends.map(friend => (
                                <button key={friend} onClick={() => handleShare(friend)} className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-100">
                                    <span className="font-semibold">{friend}</span>
                                    <span className="text-sm text-orange-600">Send</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};