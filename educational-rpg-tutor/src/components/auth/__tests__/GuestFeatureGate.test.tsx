// Tests for GuestFeatureGate component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuestFeatureGate } from '../GuestFeatureGate';
import { useGuestAuth } from '../../../hooks/useGuestAuth';

// Mock the useGuestAuth hook
vi.mock('../../../hooks/useGuestAuth');

const mockUseGuestAuth = useGuestAuth as any;

describe('GuestFeatureGate', () => {
  const mockOnUpgradeClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when not a guest session', () => {
    mockUseGuestAuth.mockReturnValue({
      guestUser: null,
      guestCharacter: null,
      isGuestSession: false,
      isSessionNearExpiry: false,
      guestLimitations: {
        canAddFriends: false,
        canTrade: false,
        canJoinChallenges: false,
        canViewLeaderboards: true,
        canSendMessages: false,
        maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
        warningThreshold: 2 * 60 * 60 * 1000,
      },
      loading: false,
      error: null,
      createGuestSession: vi.fn(),
      loadGuestSession: vi.fn(),
      convertToUser: vi.fn(),
      updateGuestCharacter: vi.fn(),
      updateGuestProgress: vi.fn(),
      clearSession: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <GuestFeatureGate feature="friends">
        <div>Friends Feature</div>
      </GuestFeatureGate>
    );

    expect(screen.getByText('Friends Feature')).toBeInTheDocument();
  });

  it('should render children when guest session allows the feature', () => {
    mockUseGuestAuth.mockReturnValue({
      guestUser: {} as any,
      guestCharacter: null,
      isGuestSession: true,
      isSessionNearExpiry: false,
      guestLimitations: {
        canAddFriends: false,
        canTrade: false,
        canJoinChallenges: false,
        canViewLeaderboards: true, // This feature is allowed
        canSendMessages: false,
        maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
        warningThreshold: 2 * 60 * 60 * 1000,
      },
      loading: false,
      error: null,
      createGuestSession: vi.fn(),
      loadGuestSession: vi.fn(),
      convertToUser: vi.fn(),
      updateGuestCharacter: vi.fn(),
      updateGuestProgress: vi.fn(),
      clearSession: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <GuestFeatureGate feature="leaderboards">
        <div>Leaderboards Feature</div>
      </GuestFeatureGate>
    );

    expect(screen.getByText('Leaderboards Feature')).toBeInTheDocument();
  });

  it('should render fallback when feature is not allowed and fallback is provided', () => {
    mockUseGuestAuth.mockReturnValue({
      guestUser: {} as any,
      guestCharacter: null,
      isGuestSession: true,
      isSessionNearExpiry: false,
      guestLimitations: {
        canAddFriends: false, // This feature is not allowed
        canTrade: false,
        canJoinChallenges: false,
        canViewLeaderboards: true,
        canSendMessages: false,
        maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
        warningThreshold: 2 * 60 * 60 * 1000,
      },
      loading: false,
      error: null,
      createGuestSession: vi.fn(),
      loadGuestSession: vi.fn(),
      convertToUser: vi.fn(),
      updateGuestCharacter: vi.fn(),
      updateGuestProgress: vi.fn(),
      clearSession: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <GuestFeatureGate 
        feature="friends" 
        fallback={<div>Friends not available for guests</div>}
      >
        <div>Friends Feature</div>
      </GuestFeatureGate>
    );

    expect(screen.getByText('Friends not available for guests')).toBeInTheDocument();
    expect(screen.queryByText('Friends Feature')).not.toBeInTheDocument();
  });

  it('should render upgrade prompt when feature is not allowed and no fallback', () => {
    mockUseGuestAuth.mockReturnValue({
      guestUser: {} as any,
      guestCharacter: null,
      isGuestSession: true,
      isSessionNearExpiry: false,
      guestLimitations: {
        canAddFriends: false,
        canTrade: false, // This feature is not allowed
        canJoinChallenges: false,
        canViewLeaderboards: true,
        canSendMessages: false,
        maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
        warningThreshold: 2 * 60 * 60 * 1000,
      },
      loading: false,
      error: null,
      createGuestSession: vi.fn(),
      loadGuestSession: vi.fn(),
      convertToUser: vi.fn(),
      updateGuestCharacter: vi.fn(),
      updateGuestProgress: vi.fn(),
      clearSession: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <GuestFeatureGate 
        feature="trading" 
        onUpgradeClick={mockOnUpgradeClick}
      >
        <div>Trading Feature</div>
      </GuestFeatureGate>
    );

    expect(screen.getByText('Item Trading Locked')).toBeInTheDocument();
    expect(screen.getByText('Create Account to Unlock')).toBeInTheDocument();
    expect(screen.queryByText('Trading Feature')).not.toBeInTheDocument();
  });

  it('should call onUpgradeClick when upgrade button is clicked', () => {
    mockUseGuestAuth.mockReturnValue({
      guestUser: {} as any,
      guestCharacter: null,
      isGuestSession: true,
      isSessionNearExpiry: false,
      guestLimitations: {
        canAddFriends: false,
        canTrade: false,
        canJoinChallenges: false,
        canViewLeaderboards: true,
        canSendMessages: false,
        maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
        warningThreshold: 2 * 60 * 60 * 1000,
      },
      loading: false,
      error: null,
      createGuestSession: vi.fn(),
      loadGuestSession: vi.fn(),
      convertToUser: vi.fn(),
      updateGuestCharacter: vi.fn(),
      updateGuestProgress: vi.fn(),
      clearSession: vi.fn(),
      clearError: vi.fn(),
    });

    render(
      <GuestFeatureGate 
        feature="friends" 
        onUpgradeClick={mockOnUpgradeClick}
      >
        <div>Friends Feature</div>
      </GuestFeatureGate>
    );

    const upgradeButton = screen.getByText('Create Account to Unlock');
    fireEvent.click(upgradeButton);

    expect(mockOnUpgradeClick).toHaveBeenCalled();
  });

  it('should not render upgrade prompt when showUpgradePrompt is false', () => {
    mockUseGuestAuth.mockReturnValue({
      guestUser: {} as any,
      guestCharacter: null,
      isGuestSession: true,
      isSessionNearExpiry: false,
      guestLimitations: {
        canAddFriends: false,
        canTrade: false,
        canJoinChallenges: false,
        canViewLeaderboards: true,
        canSendMessages: false,
        maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
        warningThreshold: 2 * 60 * 60 * 1000,
      },
      loading: false,
      error: null,
      createGuestSession: vi.fn(),
      loadGuestSession: vi.fn(),
      convertToUser: vi.fn(),
      updateGuestCharacter: vi.fn(),
      updateGuestProgress: vi.fn(),
      clearSession: vi.fn(),
      clearError: vi.fn(),
    });

    const { container } = render(
      <GuestFeatureGate 
        feature="friends" 
        showUpgradePrompt={false}
      >
        <div>Friends Feature</div>
      </GuestFeatureGate>
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render correct feature titles and descriptions', () => {
    mockUseGuestAuth.mockReturnValue({
      guestUser: {} as any,
      guestCharacter: null,
      isGuestSession: true,
      isSessionNearExpiry: false,
      guestLimitations: {
        canAddFriends: false,
        canTrade: false,
        canJoinChallenges: false,
        canViewLeaderboards: true,
        canSendMessages: false,
        maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
        warningThreshold: 2 * 60 * 60 * 1000,
      },
      loading: false,
      error: null,
      createGuestSession: vi.fn(),
      loadGuestSession: vi.fn(),
      convertToUser: vi.fn(),
      updateGuestCharacter: vi.fn(),
      updateGuestProgress: vi.fn(),
      clearSession: vi.fn(),
      clearError: vi.fn(),
    });

    const features = [
      { feature: 'friends' as const, title: 'Friends Locked' },
      { feature: 'trading' as const, title: 'Item Trading Locked' },
      { feature: 'challenges' as const, title: 'Learning Challenges Locked' },
      { feature: 'messaging' as const, title: 'Messaging Locked' },
    ];

    features.forEach(({ feature, title }) => {
      const { unmount } = render(
        <GuestFeatureGate feature={feature}>
          <div>Feature Content</div>
        </GuestFeatureGate>
      );

      expect(screen.getByText(title)).toBeInTheDocument();
      unmount();
    });
  });
});