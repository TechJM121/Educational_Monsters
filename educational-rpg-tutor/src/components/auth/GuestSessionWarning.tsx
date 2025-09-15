// Warning component for guest sessions nearing expiry

import React, { useState } from 'react';
import { useGuestAuth } from '../../hooks/useGuestAuth';

interface GuestSessionWarningProps {
  onConvertAccount?: () => void;
  className?: string;
}

export function GuestSessionWarning({ 
  onConvertAccount, 
  className = '' 
}: GuestSessionWarningProps) {
  const { 
    guestUser, 
    isSessionNearExpiry, 
    isGuestSession,
    clearSession 
  } = useGuestAuth();
  
  const [dismissed, setDismissed] = useState(false);

  if (!isGuestSession || !guestUser || !isSessionNearExpiry || dismissed) {
    return null;
  }

  const timeUntilExpiry = new Date(guestUser.expiresAt).getTime() - Date.now();
  const hoursLeft = Math.ceil(timeUntilExpiry / (1000 * 60 * 60));

  return (
    <div className={`
      guest-session-warning
      bg-gradient-to-r from-amber-50 to-orange-50 
      border-l-4 border-amber-400 
      p-4 mb-4 rounded-r-lg shadow-sm
      ${className}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            Your guest session expires soon!
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            You have approximately {hoursLeft} hour{hoursLeft !== 1 ? 's' : ''} left. 
            Create an account to save your progress permanently.
          </p>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onConvertAccount}
              className="
                bg-amber-600 hover:bg-amber-700 
                text-white text-sm font-medium 
                px-3 py-1.5 rounded-md
                transition-colors duration-200
              "
            >
              Create Account
            </button>
            
            <button
              onClick={() => setDismissed(true)}
              className="
                bg-transparent hover:bg-amber-100 
                text-amber-800 text-sm font-medium 
                px-3 py-1.5 rounded-md border border-amber-300
                transition-colors duration-200
              "
            >
              Dismiss
            </button>
          </div>
        </div>
        
        <div className="flex-shrink-0 ml-4">
          <button
            onClick={() => setDismissed(true)}
            className="
              text-amber-400 hover:text-amber-600 
              transition-colors duration-200
            "
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}