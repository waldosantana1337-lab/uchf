import React, { useState, useEffect } from 'react';
import { Modal } from './common/Modal';
import type { UserProfile } from '../types';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    onSave: (updates: Partial<Pick<UserProfile, 'displayName' | 'bio'>>) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, userProfile, onSave }) => {
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        if (isOpen) {
            setDisplayName(userProfile.displayName);
            setBio(userProfile.bio);
        }
    }, [isOpen, userProfile]);

    const handleSave = () => {
        onSave({ displayName, bio });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} titleId="edit-profile-title" className="max-w-md">
            <div className="p-6">
                <h3 id="edit-profile-title" className="text-xl font-bold text-[#152238] mb-4">Edit Profile</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-[#152238]">Display Name</label>
                        <input
                            type="text"
                            id="displayName"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#588517] focus:border-[#588517]"
                        />
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-[#152238]">Bio</label>
                        <textarea
                            id="bio"
                            rows={3}
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#588517] focus:border-[#588517]"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-[#152238] font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
                    <button type="button" onClick={handleSave} className="px-4 py-2 bg-[#588517] text-white font-semibold rounded-lg hover:bg-opacity-90">Save Changes</button>
                </div>
            </div>
        </Modal>
    );
};

export default EditProfileModal;