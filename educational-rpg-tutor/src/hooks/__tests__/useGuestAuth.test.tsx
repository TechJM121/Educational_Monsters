// Tests for useGuestAuth hook

import { renderHook, act } from '@testing-library/react';
import { useGuestAuth } from '../useGuestAuth';
import { GuestAuthService } from '../../services/guestAuthService';
import type { GuestUser, GuestConversionData } from '../../types/auth';

// Mock the GuestAuthService
vi.mock('../../services/guestAuthService');

const mockGuestAuthService = GuestAuthService as any;

describe('useGuestAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null values', () => {
    mockGuestAuthService.loadGuestSession.mockResolvedValue(null);
    mockGuestAuthService.getGuestCharacter.mockReturnValue(null);

    const { result } = renderHook(() => useGuestAuth());

    expect(result.current.guestUser).toBeNull();
    expect(result.current.guestCharacter).toBeNull();
    expect(result.current.isGuestSession).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load existing guest session on mount', async () => {
    const mockGuestUser: GuestUser = {
      id: 'guest_123',
      name: 'TestUser',
      sessionToken: 'token123',
      isGuest: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };

    const mockCharacter = {
      id: 'char_123',
      userId: 'guest_123',
      name: 'TestCharacter',
      level: 1,
      totalXP: 0,
      currentXP: 0,
      isGuestCharacter: true,
    };

    mockGuestAuthService.loadGuestSession.mockResolvedValue(mockGuestUser);
    mockGuestAuthService.getGuestCharacter.mockReturnValue(mockCharacter as any);

    const { result } = renderHook(() => useGuestAuth());

    // Wait for the effect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.guestUser).toEqual(mockGuestUser);
    expect(result.current.guestCharacter).toEqual(mockCharacter);
  });

  it('should create new guest session', async () => {
    const mockGuestUser: GuestUser = {
      id: 'guest_456',
      name: 'NewUser',
      sessionToken: 'token456',
      isGuest: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };

    const mockCharacter = {
      id: 'char_456',
      userId: 'guest_456',
      name: 'NewCharacter',
      level: 1,
      totalXP: 0,
      currentXP: 0,
      isGuestCharacter: true,
    };

    mockGuestAuthService.createGuestSession.mockResolvedValue(mockGuestUser);
    mockGuestAuthService.getGuestCharacter.mockReturnValue(mockCharacter as any);

    const { result } = renderHook(() => useGuestAuth());

    await act(async () => {
      await result.current.createGuestSession();
    });

    expect(result.current.guestUser).toEqual(mockGuestUser);
    expect(result.current.guestCharacter).toEqual(mockCharacter);
    expect(mockGuestAuthService.createGuestSession).toHaveBeenCalled();
  });

  it('should handle errors during session creation', async () => {
    const errorMessage = 'Failed to create session';
    mockGuestAuthService.createGuestSession.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useGuestAuth());

    await act(async () => {
      try {
        await result.current.createGuestSession();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });

  it('should convert guest to user', async () => {
    const mockGuestUser: GuestUser = {
      id: 'guest_123',
      name: 'TestUser',
      sessionToken: 'token123',
      isGuest: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };

    const mockNewUser = {
      id: 'user_123',
      email: 'test@example.com',
      name: 'TestUser',
      age: 15,
      parentalConsentGiven: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const conversionData: GuestConversionData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'TestUser',
      age: 15,
    };

    // Mock initial guest session load
    mockGuestAuthService.loadGuestSession.mockResolvedValue(mockGuestUser);
    mockGuestAuthService.getGuestCharacter.mockReturnValue(null);
    mockGuestAuthService.convertGuestToUser.mockResolvedValue(mockNewUser as any);

    const { result } = renderHook(() => useGuestAuth());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await act(async () => {
      const newUser = await result.current.convertToUser(conversionData);
      expect(newUser).toEqual(mockNewUser);
    });

    expect(result.current.guestUser).toBeNull();
    expect(result.current.guestCharacter).toBeNull();
    expect(mockGuestAuthService.convertGuestToUser).toHaveBeenCalledWith(
      'token123',
      conversionData
    );
  });

  it('should update guest character', async () => {
    const mockGuestUser: GuestUser = {
      id: 'guest_123',
      name: 'TestUser',
      sessionToken: 'token123',
      isGuest: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };

    const updatedCharacter = {
      id: 'char_123',
      userId: 'guest_123',
      name: 'UpdatedCharacter',
      level: 2,
      totalXP: 100,
      currentXP: 50,
      isGuestCharacter: true,
    };

    // Mock initial guest session load
    mockGuestAuthService.loadGuestSession.mockResolvedValue(mockGuestUser);
    mockGuestAuthService.getGuestCharacter.mockReturnValue(updatedCharacter as any);

    const { result } = renderHook(() => useGuestAuth());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.updateGuestCharacter(updatedCharacter as any);
    });

    expect(mockGuestAuthService.updateGuestCharacter).toHaveBeenCalledWith(updatedCharacter);
    expect(result.current.guestCharacter).toEqual(updatedCharacter);
  });

  it('should update guest progress', async () => {
    const mockGuestUser: GuestUser = {
      id: 'guest_123',
      name: 'TestUser',
      sessionToken: 'token123',
      isGuest: true,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60000).toISOString(),
    };

    const progressData = {
      questsCompleted: ['quest1', 'quest2'],
      achievementsUnlocked: ['achievement1'],
      totalQuestionsAnswered: 50,
      totalCorrectAnswers: 45,
    };

    // Mock initial guest session load
    mockGuestAuthService.loadGuestSession.mockResolvedValue(mockGuestUser);
    mockGuestAuthService.getGuestCharacter.mockReturnValue(null);

    const { result } = renderHook(() => useGuestAuth());

    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    act(() => {
      result.current.updateGuestProgress(progressData);
    });

    expect(mockGuestAuthService.updateGuestProgress).toHaveBeenCalledWith(progressData);
  });

  it('should clear session', () => {
    const { result } = renderHook(() => useGuestAuth());

    act(() => {
      result.current.clearSession();
    });

    expect(mockGuestAuthService.clearGuestSession).toHaveBeenCalled();
    expect(result.current.guestUser).toBeNull();
    expect(result.current.guestCharacter).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should clear error', async () => {
    // Mock a failed session creation to set an error
    mockGuestAuthService.createGuestSession.mockRejectedValue(new Error('Test error'));
    
    const { result } = renderHook(() => useGuestAuth());

    // Trigger an error
    await act(async () => {
      try {
        await result.current.createGuestSession();
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Test error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should check session expiry', () => {
    mockGuestAuthService.isGuestSession.mockReturnValue(true);
    mockGuestAuthService.isSessionNearExpiry.mockReturnValue(true);
    mockGuestAuthService.getGuestLimitations.mockReturnValue({
      canAddFriends: false,
      canTrade: false,
      canJoinChallenges: false,
      canViewLeaderboards: true,
      canSendMessages: false,
      maxSessionDuration: 7 * 24 * 60 * 60 * 1000,
      warningThreshold: 2 * 60 * 60 * 1000,
    });

    const { result } = renderHook(() => useGuestAuth());

    expect(result.current.isSessionNearExpiry).toBe(true);
    expect(result.current.guestLimitations.canAddFriends).toBe(false);
    expect(result.current.guestLimitations.canViewLeaderboards).toBe(true);
  });
});