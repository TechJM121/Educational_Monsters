import React, { useState, useCallback, useEffect } from 'react';
import { useAchievements } from '../../hooks/useAchievements';
import { AchievementCelebration } from './AchievementCelebration';
import { ItemDropNotification } from './ItemDropNotification';
import { GamificationContext, type GamificationContextType } from '../../contexts/GamificationContext';
import type { Achievement, CollectibleItem } from '../../types/achievement';

interface GamificationManagerProps {
  userId: string | null;
  children: React.ReactNode;
}

export function GamificationManager({ userId, children }: GamificationManagerProps) {
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);
  const [droppedItem, setDroppedItem] = useState<CollectibleItem | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  const {
    checkAchievements,
    awardRandomItem,
    refreshData
  } = useAchievements(userId);

  // Handle achievement celebration queue
  useEffect(() => {
    if (achievementQueue.length > 0 && !celebratingAchievement) {
      const nextAchievement = achievementQueue[0];
      setCelebratingAchievement(nextAchievement);
      setAchievementQueue(prev => prev.slice(1));
    }
  }, [achievementQueue, celebratingAchievement]);

  const handleAchievementCheck = useCallback(async () => {
    if (!userId) return [];

    try {
      const newAchievements = await checkAchievements();
      
      if (newAchievements.length > 0) {
        // Add new achievements to celebration queue
        setAchievementQueue(prev => [...prev, ...newAchievements]);
        
        // Refresh data to update UI
        await refreshData();
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }, [userId, checkAchievements, refreshData]);

  const handleItemDrop = useCallback(async () => {
    if (!userId) return null;

    try {
      const newItem = await awardRandomItem();
      
      if (newItem) {
        setDroppedItem(newItem);
        
        // Refresh data to update inventory
        await refreshData();
      }

      return newItem;
    } catch (error) {
      console.error('Error awarding item:', error);
      return null;
    }
  }, [userId, awardRandomItem, refreshData]);

  const triggerAchievementCheck = useCallback(() => {
    handleAchievementCheck();
  }, [handleAchievementCheck]);

  const triggerItemDrop = useCallback(() => {
    // Random chance for item drop (20% chance)
    if (Math.random() < 0.2) {
      handleItemDrop();
    }
  }, [handleItemDrop]);

  const contextValue: GamificationContextType = {
    checkAchievements: handleAchievementCheck,
    awardRandomItem: handleItemDrop,
    triggerAchievementCheck,
    triggerItemDrop
  };

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
      
      {/* Achievement Celebration Modal */}
      <AchievementCelebration
        achievement={celebratingAchievement}
        onClose={() => setCelebratingAchievement(null)}
      />

      {/* Item Drop Notification */}
      <ItemDropNotification
        item={droppedItem}
        onClose={() => setDroppedItem(null)}
      />
    </GamificationContext.Provider>
  );
}

