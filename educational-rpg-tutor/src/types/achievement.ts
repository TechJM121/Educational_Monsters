export interface Achievement {
  id: string;
  name: string;
  description: string;
  badgeIcon: string;
  unlockCriteria: string;
  rarityLevel: number;
  category: AchievementCategory;
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress?: number;
}

export type AchievementCategory = 
  | 'learning_milestone'
  | 'accuracy'
  | 'streak'
  | 'social'
  | 'collection'
  | 'stat'
  | 'special';

export interface CollectibleItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: 'spell_book' | 'potion' | 'artifact' | 'equipment';
  tradeable: boolean;
}

export interface UserInventory {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  acquiredAt: Date;
}