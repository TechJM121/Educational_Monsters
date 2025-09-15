// Tests for useSocialFeatures hook

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSocialFeatures } from '../useSocialFeatures';
import { socialService } from '../../services/socialService';
import { FriendProfile, LeaderboardEntry, LearningChallenge } from '../../types/social';

// Mock the social service
vi.mock('../../services/socialService', () => ({
  socialService: {
    getFriends: vi.fn(),
    sendFriendRequest: vi.fn(),
    acceptFriendRequest: vi.fn(),
    getWeeklyLeaderboard: vi.fn(),
    getActiveChallenges: vi.fn(),
    joinChallenge: vi.fn(),
    createTradeRequest: vi.fn(),
    acceptTradeRequest: vi.fn(),
    getSocialActivities: vi.fn(),
    getParentalControls: vi.fn(),
    updateParentalControls: vi.fn()
  }
}));

describe('useSocialFeatures', () => {
  const mockFriends: FriendProfile[] = [
    {
      id: 'friend-1',
      name: 'Friend One',
      level: 10,
      totalXP: 2000,
      avatarConfig: {},
      specialization: 'scholar',
      isOnline: true,
      lastActive: new Date()
    }
  ];

  const mockLeaderboard: LeaderboardEntry[] = [
    {
      userId: 'user-1',
      characterName: 'Hero1',
      level: 15,
      weeklyXP: 1200,
      totalXP: 5000,
      avatarConfig: {},
      specialization: 'scholar',
      rank: 1
    }
  ];

  const mockChallenges: LearningChallenge[] = [
    {
      id: 'challenge-1',
      title: 'Math Challenge',
      description: 'Solve math problems',
      subjectId: 'math',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // Tomorrow
      currentParticipants: 5,
      xpReward: 100,
      status: 'active',
      createdBy: 'teacher-1'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    (socialService.getFriends as any).mockResolvedValue(mockFriends);
    (socialService.getWeeklyLeaderboard as any).mockResolvedValue(mockLeaderboard);
    (socialService.getActiveChallenges as any).mockResolvedValue(mockChallenges);
    (socialService.getSocialActivities as any).mockResolvedValue([]);
    (socialService.getParentalControls as any).mockResolvedValue(null);
  });

  it('initializes with loading states', () => {
    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    expect(result.current.loadingFriends).toBe(true);
    expect(result.current.loadingLeaderboard).toBe(true);
    expect(result.current.loadingChallenges).toBe(true);
    expect(result.current.friends).toEqual([]);
    expect(result.current.leaderboard).toEqual([]);
    expect(result.current.challenges).toEqual([]);
  });

  it('loads all social data on mount', async () => {
    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingFriends).toBe(false);
      expect(result.current.loadingLeaderboard).toBe(false);
      expect(result.current.loadingChallenges).toBe(false);
    });

    expect(result.current.friends).toEqual(mockFriends);
    expect(result.current.leaderboard).toEqual(mockLeaderboard);
    expect(result.current.challenges).toEqual(mockChallenges);

    expect(socialService.getFriends).toHaveBeenCalledWith('user-1');
    expect(socialService.getWeeklyLeaderboard).toHaveBeenCalledWith(undefined);
    expect(socialService.getActiveChallenges).toHaveBeenCalled();
  });

  it('loads data with classroom filter', async () => {
    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1', classroomId: 'classroom-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingLeaderboard).toBe(false);
    });

    expect(socialService.getWeeklyLeaderboard).toHaveBeenCalledWith('classroom-1');
  });

  it('handles friend request sending', async () => {
    (socialService.sendFriendRequest as any).mockResolvedValue({});

    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingFriends).toBe(false);
    });

    await act(async () => {
      await result.current.sendFriendRequest('user-2');
    });

    expect(socialService.sendFriendRequest).toHaveBeenCalledWith('user-1', 'user-2');
    expect(result.current.error).toBeNull();
  });

  it('handles friend request acceptance', async () => {
    (socialService.acceptFriendRequest as any).mockResolvedValue({});

    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingFriends).toBe(false);
    });

    await act(async () => {
      await result.current.acceptFriendRequest('friendship-1');
    });

    expect(socialService.acceptFriendRequest).toHaveBeenCalledWith('friendship-1');
    expect(socialService.getFriends).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  it('handles challenge joining', async () => {
    (socialService.joinChallenge as any).mockResolvedValue({});

    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingChallenges).toBe(false);
    });

    await act(async () => {
      await result.current.joinChallenge('challenge-1');
    });

    expect(socialService.joinChallenge).toHaveBeenCalledWith('challenge-1', 'user-1');
    expect(socialService.getActiveChallenges).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  it('handles leaderboard refresh', async () => {
    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingLeaderboard).toBe(false);
    });

    await act(async () => {
      await result.current.refreshLeaderboard();
    });

    expect(socialService.getWeeklyLeaderboard).toHaveBeenCalledTimes(2); // Initial load + refresh
  });

  it('handles trade request creation', async () => {
    (socialService.createTradeRequest as any).mockResolvedValue({});

    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingTrades).toBe(false);
    });

    const fromItems = [{ id: 'item-1', name: 'Sword' }];
    const toItems = [{ id: 'item-2', name: 'Shield' }];

    await act(async () => {
      await result.current.createTradeRequest('user-2', fromItems, toItems);
    });

    expect(socialService.createTradeRequest).toHaveBeenCalledWith(
      'user-1', 
      'user-2', 
      fromItems, 
      toItems
    );
  });

  it('handles parental controls updates', async () => {
    const mockControls = {
      id: 'controls-1',
      userId: 'user-1',
      parentId: 'parent-1',
      allowFriendRequests: false,
      allowTrading: true,
      allowChallenges: true,
      allowLeaderboards: true,
      restrictedUsers: [],
      approvalRequired: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    (socialService.updateParentalControls as any).mockResolvedValue(mockControls);

    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingControls).toBe(false);
    });

    await act(async () => {
      await result.current.updateParentalControls({ allowFriendRequests: false });
    });

    expect(socialService.updateParentalControls).toHaveBeenCalledWith({ 
      allowFriendRequests: false 
    });
    expect(result.current.parentalControls).toEqual(mockControls);
  });

  it('handles errors gracefully', async () => {
    const errorMessage = 'Network error';
    (socialService.getFriends as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingFriends).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.friends).toEqual([]);
  });

  it('clears errors when clearError is called', async () => {
    const errorMessage = 'Network error';
    (socialService.getFriends as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('handles activity marking as read', async () => {
    const mockActivities = [
      {
        id: 'activity-1',
        userId: 'user-1',
        activityType: 'friend_request' as const,
        description: 'New friend request',
        createdAt: new Date(),
        isRead: false
      }
    ];

    (socialService.getSocialActivities as any).mockResolvedValue(mockActivities);

    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingActivities).toBe(false);
    });

    expect(result.current.activities[0].isRead).toBe(false);

    await act(async () => {
      await result.current.markActivityAsRead('activity-1');
    });

    expect(result.current.activities[0].isRead).toBe(true);
  });

  it('refreshes all data when refreshAll is called', async () => {
    const { result } = renderHook(() => 
      useSocialFeatures({ userId: 'user-1' })
    );

    await waitFor(() => {
      expect(result.current.loadingFriends).toBe(false);
    });

    // Clear call counts from initial load
    vi.clearAllMocks();

    await act(async () => {
      await result.current.refreshAll();
    });

    expect(socialService.getFriends).toHaveBeenCalledTimes(1);
    expect(socialService.getWeeklyLeaderboard).toHaveBeenCalledTimes(1);
    expect(socialService.getActiveChallenges).toHaveBeenCalledTimes(1);
    expect(socialService.getSocialActivities).toHaveBeenCalledTimes(1);
    expect(socialService.getParentalControls).toHaveBeenCalledTimes(1);
  });

  it('does not load data if userId is not provided', () => {
    const { result } = renderHook(() => 
      useSocialFeatures({ userId: '' })
    );

    expect(socialService.getFriends).not.toHaveBeenCalled();
    expect(socialService.getWeeklyLeaderboard).not.toHaveBeenCalled();
    expect(socialService.getActiveChallenges).not.toHaveBeenCalled();
  });

  it('reloads data when userId changes', async () => {
    const { result, rerender } = renderHook(
      ({ userId }) => useSocialFeatures({ userId }),
      { initialProps: { userId: 'user-1' } }
    );

    await waitFor(() => {
      expect(result.current.loadingFriends).toBe(false);
    });

    expect(socialService.getFriends).toHaveBeenCalledWith('user-1');

    // Change userId
    rerender({ userId: 'user-2' });

    await waitFor(() => {
      expect(socialService.getFriends).toHaveBeenCalledWith('user-2');
    });
  });
});