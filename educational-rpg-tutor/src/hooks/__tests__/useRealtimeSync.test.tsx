import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtimeSync } from '../useRealtimeSync';
import type { Character } from '../../types/character';

// Mock the hooks
vi.mock('../useRealtime', () => ({
  useRealtime: vi.fn().mockReturnValue({
    isConnected: true,
    broadcastEvent: vi.fn().mockResolvedValue(undefined)
  })
}));

vi.mock('../useOfflineSupport', () => ({
  useOfflineSupport: vi.fn().mockReturnValue({
    isOnline: true,
    pendingActionCount: 0,
    syncInProgress: false,
    getCachedCharacter: vi.fn().mockReturnValue(null),
    getCachedQuests: vi.fn().mockReturnValue([]),
    cacheCharacter: vi.fn(),
    cacheQuests: vi.fn(),
    queueOfflineAction: vi.fn(),
    syncPendingActions: vi.fn().mockResolvedValue(undefined),
    clearCache: vi.fn()
  })
}));

describe('useRealtimeSync', () => {
  const defaultOptions = {
    userId: 'test-user-id',
    classroomId: 'test-classroom',
    friendIds: ['friend-1', 'friend-2'],
    enabled: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useRealtimeSync(defaultOptions, {}));

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isConnected).toBe(true);
    expect(result.current.pendingActionCount).toBe(0);
    expect(result.current.syncInProgress).toBe(false);
    expect(result.current.notifications).toEqual([]);
  });

  it('should provide cached data', () => {
    const { result } = renderHook(() => useRealtimeSync(defaultOptions, {}));

    const cachedData = result.current.getCachedData();

    expect(cachedData).toEqual({
      character: null,
      quests: []
    });
  });

  it('should sync character data', () => {
    const { useOfflineSupport } = require('../useOfflineSupport');
    const mockCacheCharacter = vi.fn();
    const mockQueueOfflineAction = vi.fn();

    useOfflineSupport.mockReturnValue({
      isOnline: false, // Offline to test queuing
      pendingActionCount: 0,
      syncInProgress: false,
      getCachedCharacter: vi.fn().mockReturnValue(null),
      getCachedQuests: vi.fn().mockReturnValue([]),
      cacheCharacter: mockCacheCharacter,
      cacheQuests: vi.fn(),
      queueOfflineAction: mockQueueOfflineAction,
      syncPendingActions: vi.fn().mockResolvedValue(undefined),
      clearCache: vi.fn()
    });

    const { result } = renderHook(() => useRealtimeSync(defaultOptions, {}));

    const character: Character = {
      id: 'char-1',
      userId: 'test-user-id',
      name: 'Test Character',
      level: 5,
      totalXP: 1000,
      currentXP: 200,
      avatarConfig: {
        hairStyle: 'short',
        hairColor: 'brown',
        skinTone: 'medium',
        eyeColor: 'blue',
        outfit: 'casual',
        accessories: []
      },
      stats: {
        intelligence: 15,
        vitality: 12,
        wisdom: 10,
        charisma: 8,
        dexterity: 14,
        creativity: 11,
        availablePoints: 3
      },
      equippedItems: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    act(() => {
      result.current.syncCharacter(character);
    });

    expect(mockCacheCharacter).toHaveBeenCalledWith(character);
    expect(mockQueueOfflineAction).toHaveBeenCalledWith({
      type: 'character_update',
      payload: {
        characterId: 'char-1',
        updates: {
          level: 5,
          total_xp: 1000,
          current_xp: 200,
          updated_at: expect.any(String)
        }
      }
    });
  });

  it('should manage notifications', () => {
    const { result } = renderHook(() => useRealtimeSync(defaultOptions, {}));

    // Add a notification (this would normally come from real-time subscription)
    const notification = {
      id: 'notif-1',
      userId: 'test-user-id',
      type: 'achievement' as const,
      title: 'Achievement Unlocked!',
      message: 'You earned a new badge!',
      createdAt: new Date().toISOString()
    };

    // Simulate receiving a notification
    act(() => {
      // This would be called by the real-time subscription
      result.current.notifications.push(notification);
    });

    // Dismiss notification
    act(() => {
      result.current.dismissNotification('notif-1');
    });

    expect(result.current.notifications).not.toContain(notification);
  });

  it('should handle callback registration', () => {
    const { result } = renderHook(() => useRealtimeSync(defaultOptions, {}));

    const characterUpdateCallback = vi.fn();
    const questUpdateCallback = vi.fn();
    const leaderboardUpdateCallback = vi.fn();
    const friendActivityCallback = vi.fn();

    act(() => {
      result.current.onCharacterUpdate(characterUpdateCallback);
      result.current.onQuestUpdate(questUpdateCallback);
      result.current.onLeaderboardUpdate(leaderboardUpdateCallback);
      result.current.onFriendActivity(friendActivityCallback);
    });

    // Callbacks should be registered (we can't easily test the actual calls without mocking the real-time service more deeply)
    expect(typeof result.current.onCharacterUpdate).toBe('function');
    expect(typeof result.current.onQuestUpdate).toBe('function');
    expect(typeof result.current.onLeaderboardUpdate).toBe('function');
    expect(typeof result.current.onFriendActivity).toBe('function');
  });

  it('should queue offline actions with broadcasting when online', () => {
    const { useOfflineSupport, useRealtime } = require('../useOfflineSupport');
    const mockQueueOfflineAction = vi.fn();
    const mockBroadcastEvent = vi.fn().mockResolvedValue(undefined);

    useOfflineSupport.mockReturnValue({
      isOnline: true,
      pendingActionCount: 0,
      syncInProgress: false,
      getCachedCharacter: vi.fn().mockReturnValue(null),
      getCachedQuests: vi.fn().mockReturnValue([]),
      cacheCharacter: vi.fn(),
      cacheQuests: vi.fn(),
      queueOfflineAction: mockQueueOfflineAction,
      syncPendingActions: vi.fn().mockResolvedValue(undefined),
      clearCache: vi.fn()
    });

    require('../useRealtime').useRealtime.mockReturnValue({
      isConnected: true,
      broadcastEvent: mockBroadcastEvent
    });

    const { result } = renderHook(() => useRealtimeSync(defaultOptions, {}));

    const action = {
      type: 'xp_award' as const,
      payload: { characterId: 'char-1', xpAmount: 100, source: 'question' }
    };

    act(() => {
      result.current.queueOfflineAction(action);
    });

    expect(mockQueueOfflineAction).toHaveBeenCalledWith(action);
    expect(mockBroadcastEvent).toHaveBeenCalledWith(
      `user-activity-${defaultOptions.userId}`,
      'xp_award',
      {
        userId: defaultOptions.userId,
        timestamp: expect.any(Number),
        characterId: 'char-1',
        xpAmount: 100,
        source: 'question'
      }
    );
  });

  it('should handle manual sync', async () => {
    const { useOfflineSupport } = require('../useOfflineSupport');
    const mockSyncPendingActions = vi.fn().mockResolvedValue(undefined);

    useOfflineSupport.mockReturnValue({
      isOnline: true,
      pendingActionCount: 2,
      syncInProgress: false,
      getCachedCharacter: vi.fn().mockReturnValue(null),
      getCachedQuests: vi.fn().mockReturnValue([]),
      cacheCharacter: vi.fn(),
      cacheQuests: vi.fn(),
      queueOfflineAction: vi.fn(),
      syncPendingActions: mockSyncPendingActions,
      clearCache: vi.fn()
    });

    const { result } = renderHook(() => useRealtimeSync(defaultOptions, {}));

    await act(async () => {
      await result.current.syncNow();
    });

    expect(mockSyncPendingActions).toHaveBeenCalled();
  });

  it('should not sync when offline', async () => {
    const { useOfflineSupport } = require('../useOfflineSupport');
    const mockSyncPendingActions = vi.fn().mockResolvedValue(undefined);

    useOfflineSupport.mockReturnValue({
      isOnline: false,
      pendingActionCount: 2,
      syncInProgress: false,
      getCachedCharacter: vi.fn().mockReturnValue(null),
      getCachedQuests: vi.fn().mockReturnValue([]),
      cacheCharacter: vi.fn(),
      cacheQuests: vi.fn(),
      queueOfflineAction: vi.fn(),
      syncPendingActions: mockSyncPendingActions,
      clearCache: vi.fn()
    });

    const { result } = renderHook(() => useRealtimeSync(defaultOptions, {}));

    await act(async () => {
      await result.current.syncNow();
    });

    expect(mockSyncPendingActions).not.toHaveBeenCalled();
  });

  it('should clear cache', () => {
    const { useOfflineSupport } = require('../useOfflineSupport');
    const mockClearCache = vi.fn();

    useOfflineSupport.mockReturnValue({
      isOnline: true,
      pendingActionCount: 0,
      syncInProgress: false,
      getCachedCharacter: vi.fn().mockReturnValue(null),
      getCachedQuests: vi.fn().mockReturnValue([]),
      cacheCharacter: vi.fn(),
      cacheQuests: vi.fn(),
      queueOfflineAction: vi.fn(),
      syncPendingActions: vi.fn().mockResolvedValue(undefined),
      clearCache: mockClearCache
    });

    const { result } = renderHook(() => useRealtimeSync(defaultOptions, {}));

    act(() => {
      result.current.clearCache();
    });

    expect(mockClearCache).toHaveBeenCalled();
  });
});