// Banner component showing guest account limitations

import React, { useState } from 'react';
import { useGuestAuth } from '../../hooks/useGuestAuth';

interface GuestLimitationsBannerProps {
  onUpgradeClick?: () => void;
  className?: string;
}

export function GuestLimitationsBanner({ 
  onUpgradeClick, 
  className = '' 
}: GuestLimitationsBannerProps) {
  const { isGuestSession, guestLimitations } = useGuestAuth();
  const [dismissed, setDismissed] = useState(false);

  if (!isGuestSession || dismissed) {
    return null;
  }

  return (
    <div className={`
      guest-limitations-banner
      bg-gradient-to-r from-blue-50 to-indigo-50 
      border border-blue-200 rounded-lg p-4 mb-4
      ${className}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 mb-1">
              You're playing as a guest
            </h3>
            <p className="text-sm text-blue-700 mb-2">
              Some features are limited in guest mode to keep everyone safe:
            </p>
            
            <ul className="text-xs text-blue-600 space-y-1 mb-3">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                Can't add friends or send messages
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                Can't trade items with other players
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                Can't join learning challenges
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                Can view leaderboards (read-only)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                Full access to learning content
              </li>
            </ul>
            
            <button
              onClick={onUpgradeClick}
              className="
                inline-flex items-center gap-1 
                text-xs font-medium text-blue-700 
                hover:text-blue-800 transition-colors
                underline hover:no-underline
              "
            >
              Create account to unlock all features
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setDismissed(true)}
          className="
            flex-shrink-0 text-blue-400 hover:text-blue-600 
            transition-colors duration-200 ml-2
          "
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}