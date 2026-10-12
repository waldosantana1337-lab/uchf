
import React, { useState, useRef, useEffect } from 'react';
import type { Notification } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface HeaderProps {}

const NotificationsDropdown: React.FC<{ notifications: Notification[], onNavigate: (page: 'home' | 'profile' | 'mealPlanner', username?: string) => void }> = ({ notifications, onNavigate }) => {
    const getNotificationMessage = (n: Notification) => {
        switch (n.type) {
            case 'NEW_FRIEND':
                return <><b>{n.fromUsername}</b> added you as a friend.</>;
            case 'SHARED_RECIPE':
                return <><b>{n.fromUsername}</b> shared the recipe for <b>{n.payload.recipeName}</b> with you.</>;
            case 'NEW_CREATION':
                return <><b>{n.fromUsername}</b> uploaded a new creation for <b>{n.payload.recipeName}</b>.</>;
            case 'NEW_LIKE':
                return <><b>{n.fromUsername}</b> liked your creation of <b>{n.payload.recipeName}</b>.</>;
            case 'NEW_COMMENT':
                 return <><b>{n.fromUsername}</b> commented on your creation of <b>{n.payload.recipeName}</b>.</>;
            default:
                return "You have a new notification.";
        }
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-screen max-w-xs sm:max-w-sm bg-white rounded-lg shadow-2xl border border-gray-200 z-20 animate-fade-in">
            <div className="p-3 border-b font-semibold text-[#333333]">Notifications</div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(n => (
                        <div key={n.id} className={`p-3 text-sm border-b transition-colors ${!n.read ? 'bg-green-50/50' : 'bg-white'} hover:bg-gray-100`}>
                            {getNotificationMessage(n)}
                            <div className="text-xs text-gray-400 mt-1">{new Date(n.timestamp).toLocaleString()}</div>
                        </div>
                    ))
                ) : (
                    <p className="p-6 text-center text-sm text-gray-500">No notifications yet!</p>
                )}
            </div>
        </div>
    );
};

const ProfileDropdown: React.FC<{
    userProfile: { displayName: string, profilePictureUrl: string };
    shoppingListCount: number;
}> = ({ userProfile, shoppingListCount }) => {
    const { handleLogout, handleNavigate, onShoppingListClick, currentUser, translate } = useAppContext();
    return (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-md shadow-2xl border border-gray-200 z-20 animate-fade-in py-1">
            <button
                onClick={() => handleNavigate('profile', currentUser!)}
                className="w-full text-left px-4 py-2 text-sm text-[#333333] hover:bg-gray-100 flex items-center"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {translate('profile')}
            </button>
            <button
                onClick={() => handleNavigate('mealPlanner')}
                className="w-full text-left px-4 py-2 text-sm text-[#333333] hover:bg-gray-100 flex items-center"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {translate('mealPlanner')}
            </button>
            <button
                onClick={onShoppingListClick}
                className="w-full text-left px-4 py-2 text-sm text-[#333333] hover:bg-gray-100 flex items-center justify-between"
            >
                <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    {translate('shoppingList')}
                </div>
                {shoppingListCount > 0 && (
                    <span className="bg-[#588517] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{shoppingListCount}</span>
                )}
            </button>
            <div className="my-1 border-t border-gray-100"></div>
            <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-[#333333] hover:bg-gray-100 flex items-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                {translate('logout')}
            </button>
        </div>
    );
};


const HeaderComponent: React.FC<HeaderProps> = () => {
  const {
      currentUser,
      userProfile,
      onLoginRequest,
      handleLogout,
      handleNavigate,
      onReadNotifications,
      onShoppingListClick,
      isSaving,
      translate,
  } = useAppContext();
  
  const currentUserProfile = userProfile ? { displayName: userProfile.displayName, profilePictureUrl: userProfile.profilePictureUrl } : null;
  const notifications = userProfile?.notifications || [];
  const shoppingListCount = (userProfile?.shoppingList || []).filter(i => !i.isChecked).length;
    
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationToggle = () => {
    if (!showNotifications && unreadCount > 0) {
        onReadNotifications();
    }
    setShowNotifications(prev => !prev);
    setShowProfileMenu(false);
  };

  const handleProfileToggle = () => {
    setShowProfileMenu(prev => !prev);
    setShowNotifications(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center w-full">
        <div className="flex items-center gap-4">
            <button onClick={() => handleNavigate('home')} className="focus:outline-none focus:ring-2 focus:ring-[#588517] rounded-lg p-1 text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#333333] leading-none">
                    You<span className="text-[#588517]">Chef</span>
                </h1>
                <span className="block text-[8px] font-black uppercase tracking-widest text-gray-400 mt-1 leading-none">From Fridge to Feast.</span>
            </button>
            {currentUser && (
                <div className={`flex items-center gap-1.5 transition-opacity duration-500 ${isSaving ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-orange-500 animate-pulse' : 'bg-green-50'}`}></div>
                    <span className="text-[9px] font-black uppercase tracking-tighter text-gray-400">
                        {isSaving ? 'Syncing...' : 'Synced'}
                    </span>
                </div>
            )}
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {currentUser && currentUserProfile ? (
            <>
              <div className="relative" ref={notificationRef}>
                  <button onClick={handleNotificationToggle} className="relative p-2 text-gray-500 hover:text-[#588517] hover:bg-green-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#588517]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
                          </span>
                      )}
                  </button>
                  {showNotifications && <NotificationsDropdown notifications={notifications} onNavigate={handleNavigate} />}
              </div>

              <div className="relative" ref={profileRef}>
                  <button
                    onClick={handleProfileToggle}
                    className="flex items-center space-x-2 pl-1 pr-2 py-1 border border-transparent rounded-full text-[#333333] hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#588517]"
                    aria-label="Open user menu"
                    aria-haspopup="true"
                    aria-expanded={showProfileMenu}
                  >
                     <img src={currentUserProfile.profilePictureUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover bg-gray-200" />
                     <span className="hidden sm:inline font-semibold text-sm truncate min-w-0">{currentUserProfile.displayName}</span>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 hidden sm:inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showProfileMenu && (
                    <ProfileDropdown 
                        userProfile={currentUserProfile}
                        shoppingListCount={shoppingListCount}
                    />
                  )}
              </div>
            </>
          ) : (
            <button
              onClick={onLoginRequest}
              className="inline-flex items-center px-4 py-2 bg-[#588517] text-white font-bold text-sm rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#588517]"
            >
              {translate('login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
export const Header = React.memo(HeaderComponent);
