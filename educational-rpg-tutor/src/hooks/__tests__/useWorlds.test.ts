import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWorlds } from '../useWorlds';
import { worldService } from '../../services/worldService';

// Mock the world service
vi.mock('../../services/worldService', () => ({
  worldService: {
    getUserWorlds: vi.fn(),
    unlockWorld: vi.fn(),
    updateWorldProgress: vi.fn(),
    getRecommendedWorld: vi.fn()
  }
}));

describe('useWorlds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state when no userId provided', () => {
    const { result } = renderHook(() => useWorlds(null));

    expect(result.current.worlds).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load worlds on mount', async () => {
    const userId = 'test-user-id';
    const mockWorlds = [
      {
        id: 'numerical-kingdom',
        name: 'Numerical Kingdom',
        description: 'A world of mathematics',
        subjectId: 'mathematics',
        subjectName: 'Mathematics',
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          backgroundImage: '/bg.jpg',
          iconUrl: '/icon.svg',
          visualEffects: []
        },
        unlockRequirements: {
          minimumLevel: 1,
          requiredSubjectXP: 0
        },
        isUnlocked: true,
        completionPercentage: 30,
        availableQuests: ['quest-1', 'quest-2'],
        characterInteractions: []
      }
    ];

    vi.mocked(worldService.getUserWorlds).mockResolvedValue(mockWorlds);

    const { result } = renderHook(() => useWorlds(userId));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.worlds).toEqual(mockWorlds);
    expect(result.current.error).toBeNull();
    expect(worldService.getUserWorlds).toHaveBeenCalledWith(userId);
  });

  it('should handle loading errors', async () => {
    const userId = 'test-user-id';
    const errorMessage = 'Failed to load worlds';

    vi.mocked(worldService.getUserWorlds).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useWorlds(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.worlds).toEqual([]);
  });

  it('should unlock world successfully', async () => {
    const userId = 'test-user-id';
    const worldId = 'laboratory-realm';
    const mockWorlds = [
      {
        id: worldId,
        name: 'Laboratory Realm',
        isUnlocked: false,
        unlockRequirements: { minimumLevel: 3, requiredSubjectXP: 100 }
      }
    ];
    const mockUnlockedWorlds = [
      {
        ...mockWorlds[0],
        isUnlocked: true
      }
    ];

    vi.mocked(worldService.getUserWorlds)
      .mockResolvedValueOnce(mockWorlds)
      .mockResolvedValueOnce(mockUnlockedWorlds);
    vi.mocked(worldService.unlockWorld).mockResolvedValue(true);

    const { result } = renderHook(() => useWorlds(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.worlds[0].isUnlocked).toBe(false);

    await act(async () => {
      const success = await result.current.unlockWorld(worldId);
      expect(success).toBe(true);
    });

    expect(worldService.unlockWorld).toHaveBeenCalledWith(userId, worldId);
    expect(result.current.worlds[0].isUnlocked).toBe(true);
  });

  it('should handle unlock failure', async () => {
    const userId = 'test-user-id';
    const worldId = 'laboratory-realm';
    const mockWorlds = [
      {
        id: worldId,
        name: 'Laboratory Realm',
        isUnlocked: false,
        unlockRequirements: { minimumLevel: 3, requiredSubjectXP: 100 }
      }
    ];

    vi.mocked(worldService.getUserWorlds).mockResolvedValue(mockWorlds);
    vi.mocked(worldService.unlockWorld).mockResolvedValue(false);

    const { result } = renderHook(() => useWorlds(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const success = await result.current.unlockWorld(worldId);
      expect(success).toBe(false);
    });

    expect(worldService.unlockWorld).toHaveBeenCalledWith(userId, worldId);
    expect(result.current.worlds[0].isUnlocked).toBe(false);
  });

  it('should update world progress', async () => {
    const userId = 'test-user-id';
    const worldId = 'numerical-kingdom';
    const mockWorlds = [
      {
        id: worldId,
        name: 'Numerical Kingdom',
        isUnlocked: true,
        completionPercentage: 30,
        availableQuests: ['quest-1', 'quest-2', 'quest-3', 'quest-4', 'quest-5']
      }
    ];

    vi.mocked(worldService.getUserWorlds).mockResolvedValue(mockWorlds);
    vi.mocked(worldService.updateWorldProgress).mockResolvedValue();

    const { result } = renderHook(() => useWorlds(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updates = {
      timeSpent: 45,
      questsCompleted: 3,
      favoriteRating: 5
    };

    await act(async () => {
      await result.current.updateWorldProgress(worldId, updates);
    });

    expect(worldService.updateWorldProgress).toHaveBeenCalledWith(userId, worldId, updates);
    
    // Check that completion percentage was updated locally
    const updatedWorld = result.current.worlds.find(w => w.id === worldId);
    expect(updatedWorld?.completionPercentage).toBe(60); // 3/5 * 100
  });

  it('should handle world progress update errors', async () => {
    const userId = 'test-user-id';
    const worldId = 'numerical-kingdom';
    const errorMessage = 'Failed to update progress';
    const mockWorlds = [
      {
        id: worldId,
        name: 'Numerical Kingdom',
        isUnlocked: true,
        completionPercentage: 30,
        availableQuests: []
      }
    ];

    vi.mocked(worldService.getUserWorlds).mockResolvedValue(mockWorlds);
    vi.mocked(worldService.updateWorldProgress).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useWorlds(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateWorldProgress(worldId, { timeSpent: 30 });
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should get recommended world', async () => {
    const userId = 'test-user-id';
    const recommendedWorldId = 'laboratory-realm';
    const mockWorlds = [
      {
        id: 'numerical-kingdom',
        name: 'Numerical Kingdom',
        isUnlocked: true,
        completionPercentage: 80
      },
      {
        id: recommendedWorldId,
        name: 'Laboratory Realm',
        isUnlocked: true,
        completionPercentage: 20
      }
    ];

    vi.mocked(worldService.getUserWorlds).mockResolvedValue(mockWorlds);
    vi.mocked(worldService.getRecommendedWorld).mockResolvedValue(recommendedWorldId);

    const { result } = renderHook(() => useWorlds(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const recommended = await result.current.getRecommendedWorld();
      expect(recommended).toBe(recommendedWorldId);
    });

    expect(worldService.getRecommendedWorld).toHaveBeenCalledWith(userId);
  });

  it('should refresh worlds manually', async () => {
    const userId = 'test-user-id';
    const initialWorlds = [
      {
        id: 'numerical-kingdom',
        name: 'Numerical Kingdom',
        isUnlocked: true,
        completionPercentage: 30
      }
    ];
    const updatedWorlds = [
      {
        id: 'numerical-kingdom',
        name: 'Numerical Kingdom',
        isUnlocked: true,
        completionPercentage: 50
      }
    ];

    vi.mocked(worldService.getUserWorlds)
      .mockResolvedValueOnce(initialWorlds)
      .mockResolvedValueOnce(updatedWorlds);

    const { result } = renderHook(() => useWorlds(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.worlds[0].completionPercentage).toBe(30);

    await act(async () => {
      await result.current.refreshWorlds();
    });

    expect(result.current.worlds[0].completionPercentage).toBe(50);
    expect(worldService.getUserWorlds).toHaveBeenCalledTimes(2);
  });

  it('should handle null userId gracefully', async () => {
    const { result } = renderHook(() => useWorlds(null));

    expect(result.current.worlds).toEqual([]);
    expect(result.current.loading).toBe(false);

    await act(async () => {
      const success = await result.current.unlockWorld('some-world');
      expect(success).toBe(false);
    });

    await act(async () => {
      await result.current.updateWorldProgress('some-world', { timeSpent: 30 });
    });

    await act(async () => {
      const recommended = await result.current.getRecommendedWorld();
      expect(recommended).toBeNull();
    });

    expect(worldService.getUserWorlds).not.toHaveBeenCalled();
    expect(worldService.unlockWorld).not.toHaveBeenCalled();
    expect(worldService.updateWorldProgress).not.toHaveBeenCalled();
    expect(worldService.getRecommendedWorld).not.toHaveBeenCalled();
  });

  it('should refresh worlds when userId changes', async () => {
    const userId1 = 'user-1';
    const userId2 = 'user-2';
    const worlds1 = [{ id: 'world-1', name: 'World 1', isUnlocked: true }];
    const worlds2 = [{ id: 'world-2', name: 'World 2', isUnlocked: false }];

    vi.mocked(worldService.getUserWorlds)
      .mockResolvedValueOnce(worlds1)
      .mockResolvedValueOnce(worlds2);

    const { result, rerender } = renderHook(
      ({ userId }) => useWorlds(userId),
      { initialProps: { userId: userId1 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.worlds).toEqual(worlds1);

    rerender({ userId: userId2 });

    await waitFor(() => {
      expect(result.current.worlds).toEqual(worlds2);
    });

    expect(worldService.getUserWorlds).toHaveBeenCalledWith(userId1);
    expect(worldService.getUserWorlds).toHaveBeenCalledWith(userId2);
  });
});