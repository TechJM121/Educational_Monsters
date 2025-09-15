// Guest login button component for trying the platform without registration

import React from 'react';
import { useGuestAuth } from '../../hooks/useGuestAuth';

interface GuestLoginButtonProps {
  onGuestSessionCreated?: () => void;
  className?: string;
  disabled?: boolean;
}

export function GuestLoginButton({ 
  onGuestSessionCreated, 
  className = '',
  disabled = false 
}: GuestLoginButtonProps) {
  const { createGuestSession, loading, error } = useGuestAuth();

  const handleGuestLogin = async () => {
    try {
      await createGuestSession();
      onGuestSessionCreated?.();
    } catch (err) {
      console.error('Failed to create guest session:', err);
    }
  };

  return (
    <div className="guest-login-container">
      <button
        onClick={handleGuestLogin}
        disabled={disabled || loading}
        className={`
          guest-login-btn
          bg-gradient-to-r from-purple-500 to-indigo-600 
          hover:from-purple-600 hover:to-indigo-700
          text-white font-semibold py-3 px-6 rounded-lg
          transition-all duration-200 transform hover:scale-105
          disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          flex items-center justify-center gap-2
          ${className}
        `}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            Creating Adventure...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Try as Guest
          </>
        )}
      </button>
      
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">
          {error}
        </p>
      )}
      
      <p className="text-gray-600 text-xs mt-2 text-center max-w-sm">
        Start your learning adventure immediately! No email required. 
        Your progress will be saved for 24 hours.
      </p>
    </div>
  );
}