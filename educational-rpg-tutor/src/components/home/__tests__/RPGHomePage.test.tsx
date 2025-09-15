import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RPGHomePage } from '../RPGHomePage';
import type { Character } from '../../../types/character';
import type { Achievement, UserAchievement, CollectibleItem, UserInventory } from '../../../types/achievement';
import type { Quest, UserQuest, LearningStreak } from '../../../types/quest';

// Mock character data
const mockCharacter: Character = {
  id: '1',
  userId: 'user1',
  name: 'TestHero',
  level: 5,
  totalXP: 1250,
  currentXP: 250,
  avatarConfig: {
    hairStyle: 'short',
    hairColor: 'brown',
    skinTone: 'medium',
    eyeColor: 'blue',
    outfit: 'casual',
    accessories: [],
  },
  stats: {
    intelligence: 15,
    vitality: 12,
    wisdom: 10,
    charisma: 8,
    dexterity: 14,
    creativity: 11,
    availablePoints: 3,
  },
  specialization: 'scholar',
  equippedItems: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

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
];

const mockUserAchievements: UserAchievement[] = [
  {
    id: '1',
    userId: 'user1',
    achievementId: '1',
    unlockedAt: new Date('2024-01-15'),
  },
];

const mockQuests: Array<{ quest: Quest; userQuest: UserQuest }> = [
  {
    quest: {
      id: '1',
      title: 'Daily Math Challenge',
      description: 'Complete 5 math problems',
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
      rewards: [{ type: 'xp', value: 50 }],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    },
    userQuest: {
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
  },
];

const mockInventory: Array<{ item: CollectibleItem; inventory: UserInventory }> = [
  {
    item: {
      id: '1',
      name: 'Ancient Scroll',
      description: 'A mysterious scroll',
      icon: '📜',
      rarity: 'rare',
      category: 'spell_book',
      tradeable: true,
    },
    inventory: {
      id: '1',
      userId: 'user1',
      itemId: '1',
      quantity: 2,
      acquiredAt: new Date('2024-01-15'),
    },
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
  ],
};

describe('RPGHomePage', () => {
  const defaultProps = {
    character: mockCharacter,
    achievements: mockAchievements,
    userAchievements: mockUserAchievements,
    quests: mockQuests,
    inventory: mockInventory,
    learningStreak: mockLearningStreak,
    onStartLearning: vi.fn(),
    onViewInventory: vi.fn(),
    onViewAchievements: vi.fn(),
    onCustomizeCharacter: vi.fn(),
    onViewLeaderboard: vi.fn(),
  };

  it('renders character name and greeting', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    expect(screen.getByText(/TestHero/)).toBeInTheDocument();
    expect(screen.getByText(/Good/)).toBeInTheDocument(); // Good morning/afternoon/evening
  });

  it('displays character level and XP information', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    expect(screen.getAllByText(/Level 5/)).toHaveLength(2); // Should appear in multiple places
    expect(screen.getByText(/1,250 Total XP/)).toBeInTheDocument();
  });

  it('shows learning streak information', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    expect(screen.getByText('5 Day Streak')).toBeInTheDocument();
    // Check for current streak in the dashboard stats section
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
    expect(screen.getByText('Best Streak')).toBeInTheDocument();
  });

  it('displays character stats with available points', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    expect(screen.getByText('3 stat points available to allocate!')).toBeInTheDocument();
    expect(screen.getByText('Intelligence')).toBeInTheDocument();
    expect(screen.getByText('Vitality')).toBeInTheDocument();
  });

  it('shows active quests', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    expect(screen.getByText('Daily Math Challenge')).toBeInTheDocument();
    expect(screen.getByText('Complete 5 math problems')).toBeInTheDocument();
  });

  it('displays featured inventory items', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    expect(screen.getByText('Featured Items')).toBeInTheDocument();
    // The inventory grid should be present - check that we have inventory items
    const inventoryItems = screen.getAllByText('📜');
    expect(inventoryItems.length).toBeGreaterThan(0);
  });

  it('shows recent achievements', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    expect(screen.getByText('Recent Achievements')).toBeInTheDocument();
    expect(screen.getByText('First Steps')).toBeInTheDocument();
  });

  it('calls callback functions when buttons are clicked', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    // Test learning world buttons
    const mathButton = screen.getByText('Numerical Kingdom');
    fireEvent.click(mathButton);
    expect(defaultProps.onStartLearning).toHaveBeenCalled();

    // Test quick action buttons
    const inventoryButton = screen.getByText('Inventory');
    fireEvent.click(inventoryButton);
    expect(defaultProps.onViewInventory).toHaveBeenCalled();

    const achievementsButton = screen.getByRole('button', { name: /achievements/i });
    fireEvent.click(achievementsButton);
    expect(defaultProps.onViewAchievements).toHaveBeenCalled();
  });

  it('displays specialization information', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    expect(screen.getByText('scholar')).toBeInTheDocument();
    expect(screen.getByText('Bonus Intelligence and Wisdom growth')).toBeInTheDocument();
  });

  it('shows learning worlds with correct subjects', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    expect(screen.getByText('Numerical Kingdom')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Laboratory Realm')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyProps = {
      ...defaultProps,
      achievements: [],
      userAchievements: [],
      quests: [],
      inventory: [],
      learningStreak: null,
    };

    render(<RPGHomePage {...emptyProps} />);
    
    expect(screen.getByText('No active quests')).toBeInTheDocument();
    expect(screen.getByText('No items collected yet')).toBeInTheDocument();
    expect(screen.getByText('No achievements yet')).toBeInTheDocument();
  });

  it('displays character avatar with correct props', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    // The character avatar should display the first letter of the name
    expect(screen.getByText('T')).toBeInTheDocument(); // First letter of TestHero
  });

  it('shows XP progress bar', () => {
    render(<RPGHomePage {...defaultProps} />);
    
    expect(screen.getByText('Experience & Level')).toBeInTheDocument();
    // Should show current XP and progress - check for the XP text pattern
    expect(screen.getByText(/250.*100.*XP/)).toBeInTheDocument(); // Current XP
  });
});