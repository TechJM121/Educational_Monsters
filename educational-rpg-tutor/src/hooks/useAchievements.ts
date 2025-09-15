import { useState, useEffect, useCallback } from 'react';
import { AchievementService } from '../services/achievementService';
import type { Achievement, UserAchievement, CollectibleItem, UserInventory } from '../types/achievement';

interface UseAchievementsReturn {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  inventory: Array<{ item: CollectibleItem; inventory: UserInventory }>;
  loading: boolean;
  error: string | null;
  checkAchievements: () => Promise<Achievement[]>;
  awardRandomItem: () => Promise<CollectibleItem | null>;
  refreshData: () => Promise<void>;
  getAchievementProgress: (achievementId: string) => number;
}

export function useAchievements(userId: string | null): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [inventory, setInventory] = useState<Array<{ item: CollectibleItem; inventory: UserInventory }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [allAchievements, userAchievementData, inventoryData] = await Promise.all([
        AchievementService.getAllAchievements(),
        AchievementService.getUserAchievements(userId),
        AchievementService.getUserInventory(userId)
      ]);

      setAchievements(allAchievements);
      setUserAchievements(userAchievementData);
      setInventory(inventoryData);
    } catch (err) {
      console.error('Error loading achievement data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load achievement data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const checkAchievements = useCallback(async (): Promise<Achievement[]> => {
    if (!userId) return [];

    try {
      const newAchievements = await AchievementService.checkAndAwardAchievements(userId);
      
      if (newAchievements.length > 0) {
        // Refresh user achievements to include newly awarded ones
        const updatedUserAchievements = await AchievementService.getUserAchievements(userId);
        setUserAchievements(updatedUserAchievements);
      }

      return newAchievements;
    } catch (err) {
      console.error('Error checking achievements:', err);
      return [];
    }
  }, [userId]);

  const awardRandomItem = useCallback(async (): Promise<CollectibleItem | null> => {
    if (!userId) return null;

    try {
      const newItem = await AchievementService.awardRandomItem(userId);
      
      if (newItem) {
        // Refresh inventory to include new item
        const updatedInventory = await AchievementService.getUserInventory(userId);
        setInventory(updatedInventory);
      }

      return newItem;
    } catch (err) {
      console.error('Error awarding random item:', err);
      return null;
    }
  }, [userId]);

  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const getAchievementProgress = useCallback((achievementId: string): number => {
    if (!userId) return 0;

    const achievement = achievements.find(a => a.id === achievementId);
    const userAchievement = userAchievements.find(ua => ua.achievementId === achievementId);

    // If already unlocked, return 100%
    if (userAchievement) return 100;

    if (!achievement) return 0;

    // Calculate progress based on achievement criteria
    // This is a simplified version - in a real app you'd want more sophisticated tracking
    const criteria = achievement.unlockCriteria as any;
    
    // For now, return 0 for locked achievements
    // In a full implementation, you'd track partial progress
    return 0;
  }, [achievements, userAchievements, userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    achievements,
    userAchievements,
    inventory,
    loading,
    error,
    checkAchievements,
    awardRandomItem,
    refreshData,
    getAchievementProgress
  };
}