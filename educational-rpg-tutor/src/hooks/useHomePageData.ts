import { useState, useEffect } from 'react';
import type { Achievement, UserAchievement, CollectibleItem, UserInventory } from '../types/achievement';
import type { Quest, UserQuest, LearningStreak } from '../types/quest';

interface UseHomePageDataReturn {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  quests: Array<{ quest: Quest; userQuest: UserQuest }>;
  inventory: Array<{ item: CollectibleItem; inventory: UserInventory }>;
  learningStreak: LearningStreak | null;
  loading: boolean;
  error: string | null;
}

// Mock data for development and testing
const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first lesson',
    badgeIcon: '🎯',
    unlockCriteria: 'complete_lesson_1',
    rarityLevel: 1,
    category: 'learning_milestone',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Math Wizard',
    description: 'Solve 50 math problems correctly',
    badgeIcon: '🧙‍♂️',
    unlockCriteria: 'math_problems_50',
    rarityLevel: 3,
    category: 'learning_milestone',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    name: 'Streak Master',
    description: 'Maintain a 7-day learning streak',
    badgeIcon: '🔥',
    unlockCriteria: 'streak_7_days',
    rarityLevel: 2,
    category: 'streak',
    createdAt: new Date('2024-01-01'),
  },
];

const mockUserAchievements: UserAchievement[] = [
  {
    id: '1',
    userId: 'user1',
    achievementId: '1',
    unlockedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    userId: 'user1',
    achievementId: '3',
    unlockedAt: new Date('2024-01-20'),
  },
];

const mockCollectibleItems: CollectibleItem[] = [
  {
    id: '1',
    name: 'Ancient Scroll',
    description: 'A mysterious scroll containing mathematical wisdom',
    icon: '📜',
    rarity: 'rare',
    category: 'spell_book',
    tradeable: true,
  },
  {
    id: '2',
    name: 'Health Potion',
    description: 'Restores energy for longer study sessions',
    icon: '🧪',
    rarity: 'common',
    category: 'potion',
    tradeable: false,
  },
  {
    id: '3',
    name: 'Crystal of Knowledge',
    description: 'A legendary artifact that boosts all learning',
    icon: '💎',
    rarity: 'legendary',
    category: 'artifact',
    tradeable: false,
  },
];

const mockUserInventory: UserInventory[] = [
  {
    id: '1',
    userId: 'user1',
    itemId: '1',
    quantity: 2,
    acquiredAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    userId: 'user1',
    itemId: '2',
    quantity: 5,
    acquiredAt: new Date('2024-01-16'),
  },
  {
    id: '3',
    userId: 'user1',
    itemId: '3',
    quantity: 1,
    acquiredAt: new Date('2024-01-20'),
  },
];

const mockQuests: Quest[] = [
  {
    id: '1',
    title: 'Daily Math Challenge',
    description: 'Complete 5 math problems to sharpen your skills',
    type: 'daily',
    category: 'learning',
    objectives: [
      {
        id: '1',
        description: 'Solve 5 math problems',
        targetValue: 5,
        currentValue: 3,
        completed: false,
      },
    ],
    rewards: [
      { type: 'xp', value: 50 },
      { type: 'item', value: 1, itemId: '2' },
    ],
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Science Explorer',
    description: 'Discover the wonders of the natural world',
    type: 'weekly',
    category: 'learning',
    objectives: [
      {
        id: '2',
        description: 'Complete 3 science lessons',
        targetValue: 3,
        currentValue: 1,
        completed: false,
      },
      {
        id: '3',
        description: 'Answer 20 science questions correctly',
        targetValue: 20,
        currentValue: 12,
        completed: false,
      },
    ],
    rewards: [
      { type: 'xp', value: 200 },
      { type: 'stat_points', value: 2 },
    ],
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    createdAt: new Date(),
  },
];

const mockUserQuests: UserQuest[] = [
  {
    id: '1',
    userId: 'user1',
    questId: '1',
    progress: [
      {
        id: '1',
        description: 'Solve 5 math problems',
        targetValue: 5,
        currentValue: 3,
        completed: false,
      },
    ],
    completed: false,
    startedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    questId: '2',
    progress: [
      {
        id: '2',
        description: 'Complete 3 science lessons',
        targetValue: 3,
        currentValue: 1,
        completed: false,
      },
      {
        id: '3',
        description: 'Answer 20 science questions correctly',
        targetValue: 20,
        currentValue: 12,
        completed: false,
      },
    ],
    completed: false,
    startedAt: new Date(),
  },
];

const mockLearningStreak: LearningStreak = {
  id: '1',
  userId: 'user1',
  currentStreak: 5,
  longestStreak: 12,
  lastActivityDate: new Date(),
  streakRewards: [
    {
      streakLength: 7,
      rewardType: 'xp',
      rewardValue: 100,
      claimed: false,
    },
    {
      streakLength: 14,
      rewardType: 'item',
      rewardValue: 1,
      claimed: false,
    },
    {
      streakLength: 30,
      rewardType: 'badge',
      rewardValue: 1,
      claimed: false,
    },
  ],
};

export function useHomePageData(userId: string | null): UseHomePageDataReturn {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [userId]);

  // In a real implementation, this would fetch data from Supabase
  const achievements = mockAchievements;
  const userAchievements = mockUserAchievements;
  
  const quests = mockQuests.map(quest => {
    const userQuest = mockUserQuests.find(uq => uq.questId === quest.id);
    return userQuest ? { quest, userQuest } : null;
  }).filter(Boolean) as Array<{ quest: Quest; userQuest: UserQuest }>;

  const inventory = mockCollectibleItems.map(item => {
    const userInventoryItem = mockUserInventory.find(ui => ui.itemId === item.id);
    return userInventoryItem ? { item, inventory: userInventoryItem } : null;
  }).filter(Boolean) as Array<{ item: CollectibleItem; inventory: UserInventory }>;

  const learningStreak = mockLearningStreak;

  return {
    achievements,
    userAchievements,
    quests,
    inventory,
    learningStreak,
    loading,
    error,
  };
}