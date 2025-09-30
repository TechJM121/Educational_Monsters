import type { UnlockableItem } from '../types/monster';

export const MONSTER_UNLOCKABLES: UnlockableItem[] = [
  // Basic Colors (Common)
  {
    id: 'color_crimson',
    name: 'Crimson Red',
    description: 'A deep, passionate red color',
    type: 'color',
    category: 'basic_colors',
    rarity: 'common',
    icon: '🔴',
    unlockCondition: {
      type: 'level',
      requirement: 1,
      description: 'Available from the start'
    }
  },
  {
    id: 'color_sapphire',
    name: 'Sapphire Blue',
    description: 'A brilliant blue like precious gems',
    type: 'color',
    category: 'basic_colors',
    rarity: 'common',
    icon: '🔵',
    unlockCondition: {
      type: 'level',
      requirement: 3,
      description: 'Reach level 3'
    }
  },
  {
    id: 'color_emerald',
    name: 'Emerald Green',
    description: 'A vibrant green of nature',
    type: 'color',
    category: 'basic_colors',
    rarity: 'common',
    icon: '🟢',
    unlockCondition: {
      type: 'level',
      requirement: 5,
      description: 'Reach level 5'
    }
  },

  // Premium Colors (Uncommon)
  {
    id: 'color_sunset',
    name: 'Sunset Orange',
    description: 'Warm orange like a beautiful sunset',
    type: 'color',
    category: 'premium_colors',
    rarity: 'uncommon',
    icon: '🟠',
    unlockCondition: {
      type: 'xp',
      requirement: 1000,
      description: 'Earn 1,000 XP'
    }
  },
  {
    id: 'color_amethyst',
    name: 'Amethyst Purple',
    description: 'Royal purple with mystical properties',
    type: 'color',
    category: 'premium_colors',
    rarity: 'uncommon',
    icon: '🟣',
    unlockCondition: {
      type: 'achievement',
      requirement: 'first_perfect_score',
      description: 'Get your first perfect score'
    }
  },

  // Magical Colors (Rare)
  {
    id: 'color_rainbow',
    name: 'Rainbow Shimmer',
    description: 'A magical color that shifts through the rainbow',
    type: 'color',
    category: 'magical_colors',
    rarity: 'rare',
    icon: '🌈',
    unlockCondition: {
      type: 'achievement',
      requirement: 'learning_streak_7',
      description: 'Maintain a 7-day learning streak'
    }
  },
  {
    id: 'color_galaxy',
    name: 'Galaxy Nebula',
    description: 'Deep space colors with twinkling stars',
    type: 'color',
    category: 'magical_colors',
    rarity: 'rare',
    icon: '🌌',
    unlockCondition: {
      type: 'level',
      requirement: 15,
      description: 'Reach level 15'
    }
  },

  // Patterns (Various Rarities)
  {
    id: 'pattern_stripes',
    name: 'Tiger Stripes',
    description: 'Bold stripes like a fierce tiger',
    type: 'pattern',
    category: 'animal_patterns',
    rarity: 'common',
    icon: '🐅',
    unlockCondition: {
      type: 'level',
      requirement: 2,
      description: 'Reach level 2'
    }
  },
  {
    id: 'pattern_spots',
    name: 'Leopard Spots',
    description: 'Elegant spots of a graceful leopard',
    type: 'pattern',
    category: 'animal_patterns',
    rarity: 'common',
    icon: '🐆',
    unlockCondition: {
      type: 'level',
      requirement: 4,
      description: 'Reach level 4'
    }
  },
  {
    id: 'pattern_galaxy',
    name: 'Cosmic Swirls',
    description: 'Swirling patterns like distant galaxies',
    type: 'pattern',
    category: 'cosmic_patterns',
    rarity: 'epic',
    icon: '🌌',
    unlockCondition: {
      type: 'achievement',
      requirement: 'master_mathematician',
      description: 'Master 10 math topics'
    }
  },

  // Accessories (Uncommon to Legendary)
  {
    id: 'accessory_crown',
    name: 'Royal Crown',
    description: 'A majestic crown fit for monster royalty',
    type: 'accessory',
    category: 'headwear',
    rarity: 'rare',
    icon: '👑',
    unlockCondition: {
      type: 'achievement',
      requirement: 'quiz_champion',
      description: 'Win 10 quiz battles'
    }
  },
  {
    id: 'accessory_wizard_hat',
    name: 'Wizard Hat',
    description: 'A mystical hat that enhances magical abilities',
    type: 'accessory',
    category: 'headwear',
    rarity: 'uncommon',
    icon: '🧙‍♂️',
    unlockCondition: {
      type: 'level',
      requirement: 8,
      description: 'Reach level 8'
    }
  },
  {
    id: 'accessory_crystal_collar',
    name: 'Crystal Collar',
    description: 'A collar embedded with magical crystals',
    type: 'accessory',
    category: 'neckwear',
    rarity: 'epic',
    icon: '💎',
    unlockCondition: {
      type: 'bond',
      requirement: 75,
      description: 'Reach 75% bond with any monster'
    }
  },

  // Special Effects (Epic to Mythic)
  {
    id: 'effect_sparkles',
    name: 'Fairy Sparkles',
    description: 'Magical sparkles that follow your monster',
    type: 'effect',
    category: 'particle_effects',
    rarity: 'rare',
    icon: '✨',
    unlockCondition: {
      type: 'achievement',
      requirement: 'perfect_week',
      description: 'Complete all daily challenges for a week'
    }
  },
  {
    id: 'effect_flame_aura',
    name: 'Flame Aura',
    description: 'A powerful aura of dancing flames',
    type: 'effect',
    category: 'auras',
    rarity: 'epic',
    icon: '🔥',
    unlockCondition: {
      type: 'level',
      requirement: 20,
      description: 'Reach level 20'
    }
  },
  {
    id: 'effect_rainbow_trail',
    name: 'Rainbow Trail',
    description: 'Leaves a beautiful rainbow trail when moving',
    type: 'effect',
    category: 'trails',
    rarity: 'legendary',
    icon: '🌈',
    unlockCondition: {
      type: 'achievement',
      requirement: 'learning_master',
      description: 'Master 5 different subjects'
    }
  },

  // Body Parts (Rare to Mythic)
  {
    id: 'wings_butterfly',
    name: 'Butterfly Wings',
    description: 'Delicate, colorful butterfly wings',
    type: 'bodyPart',
    category: 'wings',
    rarity: 'uncommon',
    icon: '🦋',
    unlockCondition: {
      type: 'level',
      requirement: 6,
      description: 'Reach level 6'
    }
  },
  {
    id: 'wings_dragon',
    name: 'Dragon Wings',
    description: 'Powerful wings of an ancient dragon',
    type: 'bodyPart',
    category: 'wings',
    rarity: 'epic',
    icon: '🐉',
    unlockCondition: {
      type: 'achievement',
      requirement: 'dragon_slayer',
      description: 'Complete the Dragon\'s Challenge quest'
    }
  },
  {
    id: 'horns_crystal',
    name: 'Crystal Horns',
    description: 'Horns made of pure magical crystal',
    type: 'bodyPart',
    category: 'horns',
    rarity: 'rare',
    icon: '💎',
    unlockCondition: {
      type: 'achievement',
      requirement: 'crystal_collector',
      description: 'Collect 50 knowledge crystals'
    }
  },

  // Species Unlocks (Epic to Mythic)
  {
    id: 'species_phoenix',
    name: 'Phoenix',
    description: 'A legendary bird that rises from ashes',
    type: 'species',
    category: 'legendary_creatures',
    rarity: 'legendary',
    icon: '🔥🦅',
    unlockCondition: {
      type: 'achievement',
      requirement: 'phoenix_rising',
      description: 'Overcome 10 failed attempts and succeed'
    }
  },
  {
    id: 'species_unicorn',
    name: 'Unicorn',
    description: 'A pure and magical horned creature',
    type: 'species',
    category: 'legendary_creatures',
    rarity: 'legendary',
    icon: '🦄',
    unlockCondition: {
      type: 'achievement',
      requirement: 'pure_heart',
      description: 'Help 20 other students with their learning'
    }
  },
  {
    id: 'species_cosmic_dragon',
    name: 'Cosmic Dragon',
    description: 'A dragon born from the stars themselves',
    type: 'species',
    category: 'mythic_creatures',
    rarity: 'mythic',
    icon: '🌌🐲',
    unlockCondition: {
      type: 'special',
      requirement: 'cosmic_alignment',
      description: 'Available only during special cosmic events'
    },
    isHidden: true
  },

  // Size Modifications
  {
    id: 'size_giant',
    name: 'Giant Size',
    description: 'Make your monster impressively large',
    type: 'size',
    category: 'size_modifications',
    rarity: 'rare',
    icon: '📏',
    unlockCondition: {
      type: 'level',
      requirement: 12,
      description: 'Reach level 12'
    }
  },
  {
    id: 'size_tiny',
    name: 'Tiny Size',
    description: 'Adorably small and cute',
    type: 'size',
    category: 'size_modifications',
    rarity: 'uncommon',
    icon: '🔍',
    unlockCondition: {
      type: 'achievement',
      requirement: 'attention_to_detail',
      description: 'Find 25 hidden details in lessons'
    }
  },

  // Special Seasonal/Event Items
  {
    id: 'accessory_santa_hat',
    name: 'Santa Hat',
    description: 'Festive holiday headwear',
    type: 'accessory',
    category: 'seasonal',
    rarity: 'rare',
    icon: '🎅',
    unlockCondition: {
      type: 'special',
      requirement: 'winter_event',
      description: 'Available during winter holidays'
    }
  },
  {
    id: 'effect_snow_trail',
    name: 'Snow Trail',
    description: 'Leaves a trail of magical snowflakes',
    type: 'effect',
    category: 'seasonal_effects',
    rarity: 'epic',
    icon: '❄️',
    unlockCondition: {
      type: 'special',
      requirement: 'winter_master',
      description: 'Complete all winter event challenges'
    }
  }
];

// Helper functions for unlockables
export const getUnlockablesByCategory = (category: string): UnlockableItem[] => {
  return MONSTER_UNLOCKABLES.filter(item => item.category === category);
};

export const getUnlockablesByType = (type: string): UnlockableItem[] => {
  return MONSTER_UNLOCKABLES.filter(item => item.type === type);
};

export const getUnlockablesByRarity = (rarity: string): UnlockableItem[] => {
  return MONSTER_UNLOCKABLES.filter(item => item.rarity === rarity);
};

export const getUnlockedItems = (unlockedFeatures: string[]): UnlockableItem[] => {
  return MONSTER_UNLOCKABLES.filter(item => unlockedFeatures.includes(item.id));
};

export const getAvailableUnlocks = (
  level: number, 
  xp: number, 
  achievements: string[], 
  bond: number
): UnlockableItem[] => {
  return MONSTER_UNLOCKABLES.filter(item => {
    const condition = item.unlockCondition;
    
    switch (condition.type) {
      case 'level':
        return level >= (condition.requirement as number);
      case 'xp':
        return xp >= (condition.requirement as number);
      case 'achievement':
        return achievements.includes(condition.requirement as string);
      case 'bond':
        return bond >= (condition.requirement as number);
      case 'time':
      case 'special':
        // These would need special handling based on current events/time
        return false;
      default:
        return false;
    }
  });
};