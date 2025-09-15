import { useState, useEffect, useCallback } from 'react';
import { worldService } from '../services/worldService';
import type { LearningWorld } from '../types/world';

export interface UseWorldsReturn {
  worlds: LearningWorld[];
  loading: boolean;
  error: string | null;
  refreshWorlds: () => Promise<void>;
  unlockWorld: (worldId: string) => Promise<boolean>;
  updateWorldProgress: (worldId: string, updates: {
    timeSpent?: number;
    questsCompleted?: number;
    favoriteRating?: number;
  }) => Promise<void>;
  getRecommendedWorld: () => Promise<string | null>;
}

export const useWorlds = (userId: string | null): UseWorldsReturn => {
  const [worlds, setWorlds] = useState<LearningWorld[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWorlds = useCallback(async () => {
    if (!userId) {
      setWorlds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const userWorlds = await worldService.getUserWorlds(userId);
      setWorlds(userWorlds);
    } catch (err) {
      console.error('Error fetching worlds:', err);
      setError(err instanceof Error ? err.message : 'Failed to load worlds');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const unlockWorld = useCallback(async (worldId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const success = await worldService.unlockWorld(userId, worldId);
      if (success) {
        await refreshWorlds(); // Refresh to show updated unlock status
      }
      return success;
    } catch (err) {
      console.error('Error unlocking world:', err);
      setError(err instanceof Error ? err.message : 'Failed to unlock world');
      return false;
    }
  }, [userId, refreshWorlds]);

  const updateWorldProgress = useCallback(async (
    worldId: string, 
    updates: {
      timeSpent?: number;
      questsCompleted?: number;
      favoriteRating?: number;
    }
  ) => {
    if (!userId) return;

    try {
      await worldService.updateWorldProgress(userId, worldId, updates);
      
      // Update local state
      setWorlds(prevWorlds => 
        prevWorlds.map(world => {
          if (world.id === worldId) {
            const updatedWorld = { ...world };
            if (updates.questsCompleted !== undefined) {
              // Recalculate completion percentage if needed
              const totalQuests = world.availableQuests.length || 1;
              updatedWorld.completionPercentage = Math.round(
                (updates.questsCompleted / totalQuests) * 100
              );
            }
            return updatedWorld;
          }
          return world;
        })
      );
    } catch (err) {
      console.error('Error updating world progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to update progress');
    }
  }, [userId]);

  const getRecommendedWorld = useCallback(async (): Promise<string | null> => {
    if (!userId) return null;

    try {
      return await worldService.getRecommendedWorld(userId);
    } catch (err) {
      console.error('Error getting recommended world:', err);
      return null;
    }
  }, [userId]);

  // Load worlds on mount and when userId changes
  useEffect(() => {
    refreshWorlds();
  }, [refreshWorlds]);

  return {
    worlds,
    loading,
    error,
    refreshWorlds,
    unlockWorld,
    updateWorldProgress,
    getRecommendedWorld
  };
};