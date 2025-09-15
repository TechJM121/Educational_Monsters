// Component for gating features based on guest status

import React from 'react';
import { useGuestAuth } from '../../hooks/useGuestAuth';

interface GuestFeatureGateProps {
  children: React.ReactNode;
  feature: 'friends' | 'trading' | 'challenges' | 'messaging' | 'leaderboards';
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  onUpgradeClick?: () => void;
}

export function GuestFeatureGate({ 
  children, 
  feature, 
  fallback,
  showUpgradePrompt = true,
  onUpgradeClick 
}: GuestFeatureGateProps) {
  const { isGuestSession, guestLimitations } = useGuestAuth();

  // If not a guest session, show the feature
  if (!isGuestSession) {
    return <>{children}</>;
  }

  // Check if the feature is allowed for guests
  const isFeatureAllowed = getFeaturePermission(feature, guestLimitations);
  
  if (isFeatureAllowed) {
    return <>{children}</>;
  }

  // Feature is not allowed for guests
  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <div className="guest-feature-gate bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="max-w-sm mx-auto">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {getFeatureTitle(feature)} Locked
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            {getFeatureDescription(feature)}
          </p>
          
          <button
            onClick={onUpgradeClick}
            className="
              inline-flex items-center gap-2 
              bg-gradient-to-r from-purple-500 to-indigo-600 
              hover:from-purple-600 hover:to-indigo-700
              text-white font-medium px-4 py-2 rounded-lg
              transition-all duration-200 transform hover:scale-105
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Create Account to Unlock
          </button>
          
          <p className="text-xs text-gray-500 mt-2">
            Keep all your progress and unlock social features!
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function getFeaturePermission(
  feature: GuestFeatureGateProps['feature'], 
  limitations: ReturnType<typeof useGuestAuth>['guestLimitations']
): boolean {
  switch (feature) {
    case 'friends':
      return limitations.canAddFriends;
    case 'trading':
      return limitations.canTrade;
    case 'challenges':
      return limitations.canJoinChallenges;
    case 'messaging':
      return limitations.canSendMessages;
    case 'leaderboards':
      return limitations.canViewLeaderboards;
    default:
      return false;
  }
}

function getFeatureTitle(feature: GuestFeatureGateProps['feature']): string {
  switch (feature) {
    case 'friends':
      return 'Friends';
    case 'trading':
      return 'Item Trading';
    case 'challenges':
      return 'Learning Challenges';
    case 'messaging':
      return 'Messaging';
    case 'leaderboards':
      return 'Leaderboards';
    default:
      return 'Feature';
  }
}

function getFeatureDescription(feature: GuestFeatureGateProps['feature']): string {
  switch (feature) {
    case 'friends':
      return 'Add friends and see their progress! Create an account to connect with other learners safely.';
    case 'trading':
      return 'Trade items with friends! Create an account to unlock the trading system and collect rare items.';
    case 'challenges':
      return 'Join learning challenges and compete with others! Create an account to participate in group activities.';
    case 'messaging':
      return 'Send messages to friends! Create an account to unlock safe communication features.';
    case 'leaderboards':
      return 'View leaderboards and rankings! Create an account to see where you stand among other learners.';
    default:
      return 'This feature requires a full account for safety and security.';
  }
}