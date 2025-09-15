// Integration tests for complete guest account flow

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GuestAuthService } from '../services/guestAuthService';
import { AuthService } from '../services/authService';
import { characterService } from '../services/characterService';
import { useGuestAuth } from '../hooks/useGuestAuth';
import { GuestLoginButton } from '../components/auth/GuestLoginButton';
import { GuestConversionModal } from '../components/auth/GuestConversionModal';
import { GuestFeatureGate } from '../components/auth/GuestFeatureGate';

// Mock services
vi.mock('../services/guestAuthService');
vi.mock('../services/authService');
vi.mock('../services/characterService');

const mockGuestAuthService = GuestAuthService as any;
const mockAuthService = AuthService as any;
const mockCharacterService = characterService as any;

// Test component that uses guest auth
function TestGuestFlow() {
  const {
    guestUser,
    guestCharacter,
    isGuestSession,
    createGuestSession,
    convertToUser,
    loading,
    error
  } = useGuestAuth();

  const [showConversion, setShowConversion] = React.useState(false);

  return (
    <div>
      <div data-testid="guest-status">
        {isGuestSession ? 'Guest Session Active' : 'No Guest Session'}
      </div>
      
      {guestUser && (
        <div data-testid="guest-info">
          <div>Guest Name: {guestUser.name}</div>
          <div>Session Token: {guestUser.sessionToken}</div>
        </div>
      )}
      
      {guestCharacter && (
        <div data-testid="character-info">
          <div>Character Name: {guestCharacter.name}</div>
          <div>Character Level: {guestCharacter.level}</div>
          <div>Character XP: {guestCharacter.totalXP}</div>
        </div>
      )}

      <GuestLoginButton 
        onGuestSessionCreated={() => console.log('Guest session created')}
      />

      <button onClick={() => setShowConversion(true)}>
        Convert Account
      </button>

      <GuestFeatureGate feature="friends">
        <div data-testid="friends-feature">Friends Feature Available</div>
      </GuestFeatureGate>

      <GuestConversionModal
        isOpen={showConversion}
        onClose={() => setShowConversion(false)}
        onSuccess={() => setShowConversion(false)}
      />

      {loading && <div data-testid="loading">Loading...</div>}
      {error && <div data-testid="error">{error}</div>}
    </div>
  );
}

describe('Guest Account Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('should complete full guest account creation flow', async () => {
    const mockGuestUser = {
      id: 'guest_123',
      name: 'BraveExplorer42',
      sessionToken: 'token123',
      isGuest: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const mockGuestCharacter = {
      id: 'char_123',
      userId: 'guest_123',
      name: 'BraveExplorer42',
      level: 1,
      totalXP: 0,
      currentXP: 0,
      avatarConfig: {
        hairStyle: 'short',
        hairColor: 'brown',
        skinTone: 'medium',
        eyeColor: 'blue',
        outfit: 'casual',
        accessories: ['hat']
      },
      stats: {
        intelligence: 10,
        vitality: 10,
        wisdom: 10,
        charisma: 10,
        dexterity: 10,
        creativity: 10,
        availablePoints: 0
      },
      equippedItems: [],
      isGuestCharacter: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Mock service responses
    mockGuestAuthService.createGuestSession.mockResolvedValue(mockGuestUser);
    mockGuestAuthService.getGuestCharacter.mockReturnValue(mockGuestCharacter as any);
    mockGuestAuthService.isGuestSession.mockReturnValue(true);
    mockGuestAuthService.getGuestLimitations.mockReturnValue({
      canAddFriends: false,
      canTrade: false,
      canJoinChallenges: false,
      canViewLeaderboards: true,
      canSendMessages: false,
      maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
      warningThreshold: 2 * 60 * 60 * 1000,
    });

    render(<TestGuestFlow />);

    // Initially no guest session
    expect(screen.getByTestId('guest-status')).toHaveTextContent('No Guest Session');

    // Click guest login button
    const guestLoginButton = screen.getByText('Try as Guest');
    fireEvent.click(guestLoginButton);

    // Wait for guest session to be created
    await waitFor(() => {
      expect(screen.getByTestId('guest-status')).toHaveTextContent('Guest Session Active');
    });

    // Verify guest info is displayed
    expect(screen.getByTestId('guest-info')).toHaveTextContent('Guest Name: BraveExplorer42');
    expect(screen.getByTestId('guest-info')).toHaveTextContent('Session Token: token123');

    // Verify character info is displayed
    expect(screen.getByTestId('character-info')).toHaveTextContent('Character Name: BraveExplorer42');
    expect(screen.getByTestId('character-info')).toHaveTextContent('Character Level: 1');
    expect(screen.getByTestId('character-info')).toHaveTextContent('Character XP: 0');

    // Verify feature gate blocks friends feature
    expect(screen.queryByTestId('friends-feature')).not.toBeInTheDocument();
  });

  it('should complete guest to user conversion flow', async () => {
    const mockGuestUser = {
      id: 'guest_123',
      name: 'BraveExplorer42',
      sessionToken: 'token123',
      isGuest: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const mockNewUser = {
      id: 'user_456',
      email: 'test@example.com',
      name: 'Test User',
      age: 15,
      parentalConsentGiven: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockNewCharacter = {
      id: 'char_456',
      userId: 'user_456',
      name: 'BraveExplorer42',
      level: 1,
      totalXP: 0,
      currentXP: 0,
      avatarConfig: {
        hairStyle: 'short',
        hairColor: 'brown',
        skinTone: 'medium',
        eyeColor: 'blue',
        outfit: 'casual',
        accessories: ['hat']
      },
      stats: {
        intelligence: 10,
        vitality: 10,
        wisdom: 10,
        charisma: 10,
        dexterity: 10,
        creativity: 10,
        availablePoints: 0
      },
      equippedItems: [],
      isGuestCharacter: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Mock initial guest session
    mockGuestAuthService.loadGuestSession.mockResolvedValue(mockGuestUser);
    mockGuestAuthService.getGuestCharacter.mockReturnValue({
      ...mockNewCharacter,
      isGuestCharacter: true
    } as any);
    mockGuestAuthService.isGuestSession.mockReturnValue(true);

    // Mock conversion process
    mockGuestAuthService.convertGuestToUser.mockResolvedValue(mockNewUser as any);
    mockAuthService.signUp.mockResolvedValue({ user: { id: 'user_456' }, needsParentalConsent: false });
    mockAuthService.getCurrentUserProfile.mockResolvedValue(mockNewUser as any);
    mockCharacterService.createCharacter.mockResolvedValue(mockNewCharacter as any);

    render(<TestGuestFlow />);

    // Wait for initial guest session to load
    await waitFor(() => {
      expect(screen.getByTestId('guest-status')).toHaveTextContent('Guest Session Active');
    });

    // Open conversion modal
    const convertButton = screen.getByText('Convert Account');
    fireEvent.click(convertButton);

    // Fill out conversion form
    await waitFor(() => {
      expect(screen.getByText('Save Your Adventure!')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email Address');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const nameInput = screen.getByLabelText('Your Name');
    const ageInput = screen.getByLabelText('Age');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(ageInput, { target: { value: '15' } });

    // Submit conversion form
    const createAccountButton = screen.getByText('Create Account');
    fireEvent.click(createAccountButton);

    // Wait for conversion to complete
    await waitFor(() => {
      expect(mockGuestAuthService.convertGuestToUser).toHaveBeenCalledWith(
        'token123',
        {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          age: 15,
          parentEmail: ''
        }
      );
    });
  });

  it('should handle guest session expiry', async () => {
    const expiredGuestUser = {
      id: 'guest_123',
      name: 'BraveExplorer42',
      sessionToken: 'token123',
      isGuest: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() - 1000).toISOString(), // Expired
    };

    // Mock expired session
    mockGuestAuthService.loadGuestSession.mockResolvedValue(null); // Returns null for expired
    mockGuestAuthService.isGuestSession.mockReturnValue(false);

    render(<TestGuestFlow />);

    await waitFor(() => {
      expect(screen.getByTestId('guest-status')).toHaveTextContent('No Guest Session');
    });

    // Verify no guest info is displayed
    expect(screen.queryByTestId('guest-info')).not.toBeInTheDocument();
    expect(screen.queryByTestId('character-info')).not.toBeInTheDocument();
  });

  it('should handle service errors gracefully', async () => {
    mockGuestAuthService.createGuestSession.mockRejectedValue(new Error('Network error'));

    render(<TestGuestFlow />);

    const guestLoginButton = screen.getByText('Try as Guest');
    fireEvent.click(guestLoginButton);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });
  });

  it('should enforce guest limitations correctly', async () => {
    const mockGuestUser = {
      id: 'guest_123',
      name: 'BraveExplorer42',
      sessionToken: 'token123',
      isGuest: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    mockGuestAuthService.loadGuestSession.mockResolvedValue(mockGuestUser);
    mockGuestAuthService.isGuestSession.mockReturnValue(true);
    mockGuestAuthService.getGuestLimitations.mockReturnValue({
      canAddFriends: false,
      canTrade: false,
      canJoinChallenges: false,
      canViewLeaderboards: true,
      canSendMessages: false,
      maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
      warningThreshold: 2 * 60 * 60 * 1000,
    });

    render(<TestGuestFlow />);

    await waitFor(() => {
      expect(screen.getByTestId('guest-status')).toHaveTextContent('Guest Session Active');
    });

    // Friends feature should be blocked
    expect(screen.queryByTestId('friends-feature')).not.toBeInTheDocument();
    expect(screen.getByText('Friends Locked')).toBeInTheDocument();
  });
});