// Authentication wrapper component that handles both regular and guest authentication

import React, { useState } from 'react';
import { useGuestAuth } from '../../hooks/useGuestAuth';
import { GuestLoginButton } from './GuestLoginButton';
import { GuestSessionWarning } from './GuestSessionWarning';
import { GuestConversionModal } from './GuestConversionModal';
import { GuestLimitationsBanner } from './GuestLimitationsBanner';

interface AuthWrapperProps {
  children: React.ReactNode;
  showGuestOptions?: boolean;
  showLimitationsBanner?: boolean;
}

export function AuthWrapper({ 
  children, 
  showGuestOptions = true,
  showLimitationsBanner = true 
}: AuthWrapperProps) {
  const { 
    guestUser, 
    isGuestSession, 
    isSessionNearExpiry 
  } = useGuestAuth();
  
  const [showConversionModal, setShowConversionModal] = useState(false);

  const handleConversionSuccess = (user: any) => {
    console.log('Guest account converted successfully:', user);
    setShowConversionModal(false);
    // Here you would typically redirect to the main app or refresh the auth state
  };

  return (
    <div className="auth-wrapper">
      {/* Guest session warning for expiring sessions */}
      {isGuestSession && isSessionNearExpiry && (
        <GuestSessionWarning 
          onConvertAccount={() => setShowConversionModal(true)}
        />
      )}

      {/* Guest limitations banner */}
      {isGuestSession && showLimitationsBanner && (
        <GuestLimitationsBanner 
          onUpgradeClick={() => setShowConversionModal(true)}
        />
      )}

      {/* Main content */}
      {children}

      {/* Guest login option for non-authenticated users */}
      {!isGuestSession && !guestUser && showGuestOptions && (
        <div className="guest-login-section mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Want to try before you sign up?
            </h3>
            <GuestLoginButton 
              onGuestSessionCreated={() => {
                // Handle successful guest session creation
                console.log('Guest session created successfully');
              }}
            />
          </div>
        </div>
      )}

      {/* Guest conversion modal */}
      <GuestConversionModal
        isOpen={showConversionModal}
        onClose={() => setShowConversionModal(false)}
        onSuccess={handleConversionSuccess}
      />
    </div>
  );
}