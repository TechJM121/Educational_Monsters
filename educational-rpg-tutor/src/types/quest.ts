export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  category: 'learning' | 'social' | 'achievement';
  worldId?: string; // Associated learning world
  subjectId?: string; // Associated subject
  objectives: QuestObjective[];
  rewards: QuestReward[];
  expiresAt: Date;
  createdAt: Date;
  difficulty: number; // 1-5 scale
  estimatedTimeMinutes: number;
}

export interface QuestObjective {
  id: string;
  description: string;
  type: 'answer_questions' | 'earn_xp' | 'complete_lessons' | 'maintain_streak' | 'achieve_accuracy';
  targetValue: number;
  currentValue: number;
  completed: boolean;
  subjectFilter?: string; // Optional subject restriction
}

export interface QuestReward {
  type: 'xp' | 'item' | 'stat_points' | 'world_unlock' | 'achievement';
  value: number;
  itemId?: string;
  worldId?: string;
  achievementId?: string;
  bonusMultiplier?: number; // For streak bonuses
}

export interface UserQuest {
  id: string;
  userId: string;
  questId: string;
  progress: QuestObjective[];
  completed: boolean;
  completedAt?: Date;
  startedAt: Date;
}

export interface LearningStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakRewards: StreakReward[];
}

export interface StreakReward {
  streakLength: number;
  rewardType: 'xp' | 'item' | 'badge';
  rewardValue: number;
  claimed: boolean;
}

// Quest templates for different worlds and subjects
export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  category: 'learning' | 'social' | 'achievement';
  worldId?: string;
  subjectId?: string;
  difficulty: number;
  estimatedTimeMinutes: number;
  objectives: Omit<QuestObjective, 'id' | 'currentValue' | 'completed'>[];
  rewards: QuestReward[];
  prerequisites?: {
    minimumLevel?: number;
    requiredSubjectXP?: number;
    completedQuests?: string[];
  };
}

// Predefined quest templates for each world
export const DAILY_QUEST_TEMPLATES: Record<string, QuestTemplate[]> = {
  'numerical-kingdom': [
    {
      id: 'math-mastery-basic',
      title: 'Numbers Dance',
      description: 'Solve mathematical problems to unlock the secrets of the Numerical Kingdom.',
      type: 'daily',
      category: 'learning',
      worldId: 'numerical-kingdom',
      subjectId: 'mathematics',
      difficulty: 1,
      estimatedTimeMinutes: 15,
      objectives: [
        {
          description: 'Answer 5 math questions correctly',
          type: 'answer_questions',
          targetValue: 5,
          subjectFilter: 'mathematics'
        }
      ],
      rewards: [
        { type: 'xp', value: 50 },
        { type: 'stat_points', value: 1 }
      ]
    },
    {
      id: 'calculation-champion',
      title: 'Calculation Champion',
      description: 'Demonstrate your mathematical prowess with perfect accuracy.',
      type: 'daily',
      category: 'learning',
      worldId: 'numerical-kingdom',
      subjectId: 'mathematics',
      difficulty: 3,
      estimatedTimeMinutes: 20,
      objectives: [
        {
          description: 'Achieve 90% accuracy on 10 math questions',
          type: 'achieve_accuracy',
          targetValue: 90,
          subjectFilter: 'mathematics'
        }
      ],
      rewards: [
        { type: 'xp', value: 100 },
        { type: 'item', value: 1, itemId: 'golden-calculator' }
      ]
    }
  ],
  'laboratory-realm': [
    {
      id: 'experiment-explorer',
      title: 'Laboratory Explorer',
      description: 'Conduct scientific experiments and discover the wonders of nature.',
      type: 'daily',
      category: 'learning',
      worldId: 'laboratory-realm',
      subjectId: 'science',
      difficulty: 2,
      estimatedTimeMinutes: 18,
      objectives: [
        {
          description: 'Complete 3 science experiments',
          type: 'complete_lessons',
          targetValue: 3,
          subjectFilter: 'science'
        }
      ],
      rewards: [
        { type: 'xp', value: 75 },
        { type: 'item', value: 1, itemId: 'lab-goggles' }
      ]
    },
    {
      id: 'hypothesis-hero',
      title: 'Hypothesis Hero',
      description: 'Form and test hypotheses like a true scientist.',
      type: 'daily',
      category: 'learning',
      worldId: 'laboratory-realm',
      subjectId: 'science',
      difficulty: 3,
      estimatedTimeMinutes: 25,
      objectives: [
        {
          description: 'Answer 8 science questions correctly',
          type: 'answer_questions',
          targetValue: 8,
          subjectFilter: 'science'
        },
        {
          description: 'Earn 100 XP from science activities',
          type: 'earn_xp',
          targetValue: 100,
          subjectFilter: 'science'
        }
      ],
      rewards: [
        { type: 'xp', value: 120 },
        { type: 'stat_points', value: 2 }
      ]
    }
  ],
  'chronicle-citadel': [
    {
      id: 'time-traveler',
      title: 'Time Traveler\'s Quest',
      description: 'Journey through history and learn about ancient civilizations.',
      type: 'daily',
      category: 'learning',
      worldId: 'chronicle-citadel',
      subjectId: 'history',
      difficulty: 2,
      estimatedTimeMinutes: 20,
      objectives: [
        {
          description: 'Study 2 historical periods',
          type: 'complete_lessons',
          targetValue: 2,
          subjectFilter: 'history'
        }
      ],
      rewards: [
        { type: 'xp', value: 80 },
        { type: 'item', value: 1, itemId: 'ancient-scroll' }
      ]
    }
  ],
  'wordsmith-workshop': [
    {
      id: 'word-weaver',
      title: 'Word Weaver',
      description: 'Craft beautiful sentences and explore the power of language.',
      type: 'daily',
      category: 'learning',
      worldId: 'wordsmith-workshop',
      subjectId: 'language-arts',
      difficulty: 2,
      estimatedTimeMinutes: 15,
      objectives: [
        {
          description: 'Complete 4 language arts exercises',
          type: 'answer_questions',
          targetValue: 4,
          subjectFilter: 'language-arts'
        }
      ],
      rewards: [
        { type: 'xp', value: 60 },
        { type: 'item', value: 1, itemId: 'enchanted-quill' }
      ]
    }
  ],
  'artisan-atelier': [
    {
      id: 'creative-spirit',
      title: 'Creative Spirit',
      description: 'Express your creativity through various art forms and techniques.',
      type: 'daily',
      category: 'learning',
      worldId: 'artisan-atelier',
      subjectId: 'art',
      difficulty: 1,
      estimatedTimeMinutes: 20,
      objectives: [
        {
          description: 'Complete 3 art projects',
          type: 'complete_lessons',
          targetValue: 3,
          subjectFilter: 'art'
        }
      ],
      rewards: [
        { type: 'xp', value: 70 },
        { type: 'item', value: 1, itemId: 'artists-palette' }
      ]
    }
  ],
  'vitality-valley': [
    {
      id: 'nature-observer',
      title: 'Nature Observer',
      description: 'Study living organisms and understand the web of life.',
      type: 'daily',
      category: 'learning',
      worldId: 'vitality-valley',
      subjectId: 'biology',
      difficulty: 2,
      estimatedTimeMinutes: 22,
      objectives: [
        {
          description: 'Answer 6 biology questions correctly',
          type: 'answer_questions',
          targetValue: 6,
          subjectFilter: 'biology'
        }
      ],
      rewards: [
        { type: 'xp', value: 85 },
        { type: 'item', value: 1, itemId: 'nature-journal' }
      ]
    }
  ]
};

export const WEEKLY_QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'multi-world-explorer',
    title: 'Multi-World Explorer',
    description: 'Visit and complete quests in at least 3 different learning worlds.',
    type: 'weekly',
    category: 'achievement',
    difficulty: 4,
    estimatedTimeMinutes: 120,
    objectives: [
      {
        description: 'Complete daily quests in 3 different worlds',
        type: 'complete_lessons',
        targetValue: 3
      }
    ],
    rewards: [
      { type: 'xp', value: 300 },
      { type: 'stat_points', value: 5 },
      { type: 'item', value: 1, itemId: 'world-explorer-badge' }
    ],
    prerequisites: {
      minimumLevel: 5
    }
  },
  {
    id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Demonstrate mastery across multiple subjects with consistent performance.',
    type: 'weekly',
    category: 'learning',
    difficulty: 5,
    estimatedTimeMinutes: 180,
    objectives: [
      {
        description: 'Answer 50 questions correctly across all subjects',
        type: 'answer_questions',
        targetValue: 50
      },
      {
        description: 'Maintain a 7-day learning streak',
        type: 'maintain_streak',
        targetValue: 7
      }
    ],
    rewards: [
      { type: 'xp', value: 500 },
      { type: 'stat_points', value: 8 },
      { type: 'achievement', value: 1, achievementId: 'knowledge-master' }
    ],
    prerequisites: {
      minimumLevel: 10
    }
  },
  {
    id: 'subject-specialist',
    title: 'Subject Specialist',
    description: 'Focus deeply on one subject and become a true expert.',
    type: 'weekly',
    category: 'learning',
    difficulty: 3,
    estimatedTimeMinutes: 90,
    objectives: [
      {
        description: 'Earn 500 XP in a single subject',
        type: 'earn_xp',
        targetValue: 500
      },
      {
        description: 'Achieve 95% accuracy in that subject',
        type: 'achieve_accuracy',
        targetValue: 95
      }
    ],
    rewards: [
      { type: 'xp', value: 250 },
      { type: 'stat_points', value: 4 },
      { type: 'item', value: 1, itemId: 'specialist-crown' }
    ]
  }
];