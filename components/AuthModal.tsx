import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './common/Modal';
import { useAppContext } from '../contexts/AppContext';

const AuthModal: React.FC<{ isOpen: boolean, onClose: () => void; }> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleLogin } = useAppContext();

  useEffect(() => {
    if (isOpen) {
        // Set initial focus when modal opens
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: Normalize username to lowercase to prevent duplicate accounts.
    if (username.trim()) { handleLogin(username.trim().toLowerCase()); }
  };

  const SocialButton: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <button type="button" disabled className="w-full flex items-center justify-center py-2.5 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-500 bg-gray-50 opacity-70 cursor-not-allowed" title="Coming Soon!">
          {children}
      </button>
  );

  return (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        titleId="auth-modal-title"
        className="max-w-sm"
    >
        <div className="p-8">
          <h2 id="auth-modal-title" className="text-2xl font-bold text-center text-[#333333] mb-2">Welcome Back!</h2>
          <p className="text-center text-[#333333] mb-6">Login or create an account to join the&nbsp;community.</p>
          <div className="space-y-3 mb-4">
              <SocialButton>
                  <svg viewBox="0 0 48 48" className="w-5 h-5 mr-3" role="img" aria-label="Google logo">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                  Continue with Google
              </SocialButton>
              <SocialButton><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 16 16" role="img" aria-label="Apple logo"><path d="M8.082 2.015a.952.952 0 01.836-.002l.023.013.024.013.012.007a.956.956 0 01.428.212c.225.176.33.43.33.722 0 .265-.095.535-.29.776-.196.242-.48.434-.816.554a.95.95 0 01-1.012-.224c-.02-.023-.128-.15-.33-.374-.203-.225-.375-.495-.375-.79V5.08c0-.36.196-.68.517-.923a.95.95 0 01.643-.242zm2.96 5.625a1.43 1.43 0 01-1.218-2.264.953.953 0 01.99-.258c.28.08.522.25.684.482a.95.95 0 01-.219 1.226c-.34.305-.72.482-1.12.593a.954.954 0 01-.117.02zM12.02 9.27a.95.95 0 01-.375.065c-.492 0-.934-.242-1.258-.69a1.43 1.43 0 01-.066-1.927.95.95 0 011.248-.363c.482.166.827.525.962.998.135.473.019.982-.31 1.325z"/><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm2.25 10.363c.24.42.433.84.57 1.25a.95.95 0 01-.735 1.26c-.49.125-.97.05-1.42-.22-.45-.27-.83-.69-1.14-1.15-.31-.46-.54-1.02-.63-1.63-.1-1.1.42-2.2 1.25-2.75.83-.55 1.9-.55 2.75 0a.953.953 0 01-1.03 1.625c-.29-.176-.64-.176-.93 0-.29.175-.434.465-.434.79 0 .325.145.615.434.79.29.175.64.175.93 0a.953.953 0 01.32-.05z"/></svg> Continue with Apple</SocialButton>
          </div>
          <div className="relative my-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-[#333333]">Or with a username</span></div></div>
          <form onSubmit={handleSubmit}>
            <input ref={inputRef} type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter a username" className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#588517] transition" />
            <button type="submit" disabled={!username.trim()} className="w-full mt-4 px-8 py-3 bg-[#588517] text-white font-bold text-lg rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#588517] transition-transform transform hover:scale-105 duration-200 disabled:bg-green-300">Continue</button>
          </form>
        </div>
    </Modal>
  );
};

export default AuthModal;