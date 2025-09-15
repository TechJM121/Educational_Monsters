import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAchievements } from '../useAchievements';
import { AchievementService } from '../../services/achievementService';

// Mock AchievementService
vi.mock('../../services/achievementService', () => ({
  AchievementService: {
    getAllAchievements: vi.fn(),
    getUserAchievements: vi.fn(),
    getUserInventory: vi.fn(),
    checkAndAwardAchievements: vi.fn(),
    awardRandomItem: vi.fn()
  }
}));

const mockAchievements = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first lesson',
    badgeIcon: 'first-steps-badge',
    unlockCriteria: { type: 'lessons_completed', count: 1 },
    rarityLevel: 1,
    category: 'learning' as const,
    createdAt: new Date('2024-01-01')
  }
];

const mockUserAchievements = [
  {
    id: '1',
    userId: 'user-1',
    achievementId: '1',
    unlockedAt: new Date('2024-01-01')
  }
];

const mockInventory = [
  {
    item: {
      id: '1',
      name: 'Health Potion',
      description: 'Restores health',
      icon: 'potion.png',
      rarity: 'common' as const,
      category: 'potion' as const,
      tradeable: true
    },
    inventory: {
      id: '1',
      userId: 'user-1',
      itemId: '1',
      quantity: 2,
      acquiredAt: new Date('2024-01-01')
    }
  }
];

describe('useAchievements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    vi.mocked(AchievementService.getAllAchievements).mockResolvedValue(mockAchievements);
    vi.mocked(AchievementService.getUserAchievements).mockResolvedValue(mockUserAchievements);
    vi.mocked(AchievementService.getUserInventory).mockResolvedValue(mockInventory);
    vi.mocked(AchievementService.checkAndAwardAchievements).mockResolvedValue([]);
    vi.mocked(AchievementService.awardRandomItem).mockResolvedValue(null);
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAchievements('user-1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.achievements).toEqual([]);
    expect(result.current.userAchievements).toEqual([]);
    expect(result.current.inventory).toEqual([]);
    expect(result.current.error).toBe(null);
  });

  it('should load data successfully', async () => {
    const { result } = renderHook(() => useAchievements('user-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.achievements).toEqual(mockAchievements);
    expect(result.current.userAchievements).toEqual(mockUserAchievements);
    expect(result.current.inventory).toEqual(mockInventory);
    expect(result.current.error).toBe(null);
  });

  it('should handle loading errors', async () => {
    const errorMessage = 'Failed to load data';
    vi.mocked(AchievementService.getAllAchievements).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAchievements('user-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should not load data when userId is null', async () => {
    const { result } = renderHook(() => useAchievements(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(AchievementService.getAllAchievements).not.toHaveBeenCalled();
    expect(AchievementService.getUserAchievements).not.toHaveBeenCalled();
    expect(AchievementService.getUserInventory).not.toHaveBeenCalled();
  });

  it('should check achievements and update state', async () => {
    const newAchievement = {
      id: '2',
      name: 'Math Wizard',
      description: 'Answer 50 math questions correctly',
      badgeIcon: 'math-wizard-badge',
      unlockCriteria: { type: 'subject_correct_answers', subject: 'Mathematics', count: 50 },
      rarityLevel: 2,
      category: 'learning' as const,
      createdAt: new Date('2024-01-02')
    };

    vi.mocked(AchievementService.checkAndAwardAchievements).mockResolvedValue([newAchievement]);
    vi.mocked(AchievementService.getUserAchievements).mockResolvedValue([
      ...mockUserAchievements,
      {
        id: '2',
        userId: 'user-1',
        achievementId: '2',
        unlockedAt: new Date('2024-01-02')
      }
    ]);

    const { result } = renderHook(() => useAchievements('user-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let newAchievements: any[] = [];
    await act(async () => {
      newAchievements = await result.current.checkAchievements();
    });

    expect(newAchievements).toEqual([newAchievement]);
    expect(result.current.userAchievements).toHaveLength(2);
  });

  it('should award random item and update inventory', async () => {
    const newItem = {
      id: '2',
      name: 'Magic Scroll',
      description: 'A scroll of ancient magic',
      icon: 'scroll.png',
      rarity: 'rare' as const,
      category: 'artifact' as const,
      tradeable: true
    };

    vi.mocked(AchievementService.awardRandomItem).mockResolvedValue(newItem);
    vi.mocked(AchievementService.getUserInventory).mockResolvedValue([
      ...mockInventory,
      {
        item: newItem,
        inventory: {
          id: '2',
          userId: 'user-1',
          itemId: '2',
          quantity: 1,
          acquiredAt: new Date('2024-01-02')
        }
      }
    ]);

    const { result } = renderHook(() => useAchievements('user-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let awardedItem: any = null;
    await act(async () => {
      awardedItem = await result.current.awardRandomItem();
    });

    expect(awardedItem).toEqual(newItem);
    expect(result.current.inventory).toHaveLength(2);
  });

  it('should calculate achievement progress correctly', async () => {
    const { result } = renderHook(() => useAchievements('user-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Test unlocked achievement (should return 100%)
    const unlockedProgress = result.current.getAchievementProgress('1');
    expect(unlockedProgress).toBe(100);

    // Test non-existent achievement (should return 0%)
    const nonExistentProgress = result.current.getAchievementProgress('non-existent');
    expect(nonExistentProgress).toBe(0);
  });

  it('should refresh data correctly', async () => {
    const { result } = renderHook(() => useAchievements('user-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the mocks to verify refresh calls
    vi.clearAllMocks();
    vi.mocked(AchievementService.getAllAchievements).mockResolvedValue(mockAchievements);
    vi.mocked(AchievementService.getUserAchievements).mockResolvedValue(mockUserAchievements);
    vi.mocked(AchievementService.getUserInventory).mockResolvedValue(mockInventory);

    await act(async () => {
      await result.current.refreshData();
    });

    expect(AchievementService.getAllAchievements).toHaveBeenCalledTimes(1);
    expect(AchievementService.getUserAchievements).toHaveBeenCalledWith('user-1');
    expect(AchievementService.getUserInventory).toHaveBeenCalledWith('user-1');
  });

  it('should handle errors in checkAchievements gracefully', async () => {
    vi.mocked(AchievementService.checkAndAwardAchievements).mockRejectedValue(new Error('Check failed'));

    const { result } = renderHook(() => useAchievements('user-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let newAchievements: any[] = [];
    await act(async () => {
      newAchievements = await result.current.checkAchievements();
    });

    expect(newAchievements).toEqual([]);
  });

  it('should handle errors in awardRandomItem gracefully', async () => {
    vi.mocked(AchievementService.awardRandomItem).mockRejectedValue(new Error('Award failed'));

    const { result } = renderHook(() => useAchievements('user-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let awardedItem: any = null;
    await act(async () => {
      awardedItem = await result.current.awardRandomItem();
    });

    expect(awardedItem).toBe(null);
  });
});