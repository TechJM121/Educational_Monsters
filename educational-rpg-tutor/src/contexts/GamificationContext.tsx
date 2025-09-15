import React from 'react';
import type { Achievement, CollectibleItem } from '../types/achievement';

export interface GamificationContextType {
  checkAchievements: () => Promise<Achievement[]>;
  awardRandomItem: () => Promise<CollectibleItem | null>;
  triggerAchievementCheck: () => void;
  triggerItemDrop: () => void;
}

export const GamificationContext = React.createContext<GamificationContextType | null>(null);

export function useGamification() {
  const context = React.useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationManager');
  }
  return context;
}