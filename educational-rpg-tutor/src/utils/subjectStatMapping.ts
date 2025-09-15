import type { CharacterStats } from '../types/character';

export type StatType = keyof Omit<CharacterStats, 'availablePoints'>;

export interface SubjectStatMapping {
  primary: StatType;
  secondary: StatType;
  description: string;
  color: string;
  icon: string;
}

/**
 * Comprehensive mapping of subjects to character stats
 * Based on requirements 15.1-15.6 and 16.1-16.6
 */
export const SUBJECT_STAT_MAPPINGS: Record<string, SubjectStatMapping> = {
  'Mathematics': {
    primary: 'intelligence',
    secondary: 'wisdom',
    description: 'Enhances problem-solving abilities and logical thinking',
    color: 'blue',
    icon: '🧮'
  },
  'Biology': {
    primary: 'vitality',
    secondary: 'intelligence',
    description: 'Improves understanding of life and health systems',
    color: 'green',
    icon: '🧬'
  },
  'History': {
    primary: 'wisdom',
    secondary: 'charisma',
    description: 'Develops understanding of past events and human nature',
    color: 'amber',
    icon: '📜'
  },
  'Language Arts': {
    primary: 'charisma',
    secondary: 'creativity',
    description: 'Enhances communication and expression skills',
    color: 'purple',
    icon: '📚'
  },
  'Science': {
    primary: 'dexterity',
    secondary: 'intelligence',
    description: 'Improves experimental skills and scientific reasoning',
    color: 'cyan',
    icon: '🔬'
  },
  'Art': {
    primary: 'creativity',
    secondary: 'charisma',
    description: 'Develops artistic expression and aesthetic appreciation',
    color: 'pink',
    icon: '🎨'
  },
  'Physical Education': {
    primary: 'vitality',
    secondary: 'dexterity',
    description: 'Builds physical strength and coordination',
    color: 'red',
    icon: '⚽'
  },
  'Music': {
    primary: 'creativity',
    secondary: 'dexterity',
    description: 'Enhances artistic expression and fine motor skills',
    color: 'indigo',
    icon: '🎵'
  },
  'Geography': {
    primary: 'wisdom',
    secondary: 'intelligence',
    description: 'Develops spatial understanding and world knowledge',
    color: 'emerald',
    icon: '🌍'
  },
  'Computer Science': {
    primary: 'intelligence',
    secondary: 'dexterity',
    description: 'Builds logical thinking and technical precision',
    color: 'slate',
    icon: '💻'
  }
};

/**
 * Get stat bonuses based on subject performance
 */
export const calculateStatBonuses = (
  subjectName: string,
  xpEarned: number,
  performanceMultiplier: number = 1.0
): Partial<CharacterStats> => {
  const mapping = SUBJECT_STAT_MAPPINGS[subjectName];
  if (!mapping) return {};

  // Base stat increase calculation
  const baseIncrease = Math.max(1, Math.floor(xpEarned / 50));
  const primaryIncrease = Math.floor(baseIncrease * performanceMultiplier);
  const secondaryIncrease = Math.floor((baseIncrease * performanceMultiplier) / 2);

  const bonuses: Partial<CharacterStats> = {};
  
  if (primaryIncrease > 0) {
    bonuses[mapping.primary] = primaryIncrease;
  }
  
  if (secondaryIncrease > 0) {
    bonuses[mapping.secondary] = secondaryIncrease;
  }

  return bonuses;
};

/**
 * Get stat effects and bonuses for gameplay
 */
export const getStatEffects = (stats: CharacterStats) => {
  return {
    intelligence: {
      xpMultiplier: 1 + (stats.intelligence - 10) * 0.02, // 2% per point above 10
      hintAvailability: stats.intelligence >= 20,
      problemSolvingBonus: Math.floor(stats.intelligence / 10),
      description: 'Increases XP from logic puzzles and provides problem-solving hints'
    },
    vitality: {
      sessionLength: 1 + (stats.vitality - 10) * 0.05, // 5% longer sessions per point
      fatigueResistance: stats.vitality >= 25,
      healthRegeneration: Math.floor(stats.vitality / 15),
      description: 'Allows longer study sessions and faster recovery between activities'
    },
    wisdom: {
      contextualHints: stats.wisdom >= 15,
      advancedContentAccess: stats.wisdom >= 30,
      learningInsights: Math.floor(stats.wisdom / 12),
      description: 'Unlocks historical context and provides deeper learning insights'
    },
    charisma: {
      socialBonuses: 1 + (stats.charisma - 10) * 0.03, // 3% social bonus per point
      tradingSuccess: stats.charisma >= 20,
      groupChallengeBonus: Math.floor(stats.charisma / 8),
      description: 'Improves social interactions and group challenge performance'
    },
    dexterity: {
      speedBonus: 1 + (stats.dexterity - 10) * 0.04, // 4% speed bonus per point
      accuracyBonus: stats.dexterity >= 18,
      timePenaltyReduction: Math.floor(stats.dexterity / 10),
      description: 'Reduces time penalties and increases accuracy in timed activities'
    },
    creativity: {
      customizationOptions: Math.floor(stats.creativity / 5),
      alternativeSolutions: stats.creativity >= 25,
      artisticUnlocks: stats.creativity >= 35,
      description: 'Unlocks unique customizations and alternative solution paths'
    }
  };
};

/**
 * Calculate performance multiplier based on recent accuracy
 */
export const calculatePerformanceMultiplier = (
  recentAccuracy: number,
  streakCount: number = 0
): number => {
  let multiplier = 1.0;

  // Accuracy bonus
  if (recentAccuracy >= 0.9) {
    multiplier += 0.3; // 30% bonus for 90%+ accuracy
  } else if (recentAccuracy >= 0.8) {
    multiplier += 0.2; // 20% bonus for 80%+ accuracy
  } else if (recentAccuracy >= 0.7) {
    multiplier += 0.1; // 10% bonus for 70%+ accuracy
  }

  // Streak bonus
  if (streakCount >= 10) {
    multiplier += 0.2; // 20% bonus for 10+ streak
  } else if (streakCount >= 5) {
    multiplier += 0.1; // 10% bonus for 5+ streak
  }

  return Math.min(multiplier, 2.0); // Cap at 2x multiplier
};

/**
 * Get age-appropriate subjects for a given age range
 */
export const getAgeAppropriateSubjects = (age: number): string[] => {
  const allSubjects = Object.keys(SUBJECT_STAT_MAPPINGS);
  
  if (age <= 6) {
    return ['Mathematics', 'Language Arts', 'Art', 'Music'];
  } else if (age <= 10) {
    return ['Mathematics', 'Language Arts', 'Science', 'Art', 'Music', 'Physical Education'];
  } else if (age <= 14) {
    return ['Mathematics', 'Language Arts', 'Science', 'History', 'Art', 'Music', 'Physical Education', 'Geography'];
  } else {
    return allSubjects; // All subjects for high school age
  }
};

/**
 * Get recommended next subject based on current stats
 */
export const getRecommendedSubject = (
  stats: CharacterStats,
  availableSubjects: string[]
): string | null => {
  if (availableSubjects.length === 0) return null;

  // Find the stat with the lowest value (excluding availablePoints)
  const statValues = {
    intelligence: stats.intelligence,
    vitality: stats.vitality,
    wisdom: stats.wisdom,
    charisma: stats.charisma,
    dexterity: stats.dexterity,
    creativity: stats.creativity
  };

  const lowestStat = Object.entries(statValues).reduce((min, [stat, value]) => 
    value < min.value ? { stat: stat as StatType, value } : min,
    { stat: 'intelligence' as StatType, value: statValues.intelligence }
  );

  // Find subjects that boost the lowest stat
  const recommendedSubjects = availableSubjects.filter(subject => {
    const mapping = SUBJECT_STAT_MAPPINGS[subject];
    return mapping && (mapping.primary === lowestStat.stat || mapping.secondary === lowestStat.stat);
  });

  return recommendedSubjects.length > 0 ? recommendedSubjects[0] : availableSubjects[0];
};