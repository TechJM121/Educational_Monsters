export interface LearningWorld {
  id: string;
  name: string;
  description: string;
  subjectId: string;
  subjectName: string;
  theme: WorldTheme;
  unlockRequirements: WorldUnlockRequirements;
  isUnlocked: boolean;
  completionPercentage: number;
  availableQuests: string[]; // Quest IDs
  backgroundMusic?: string;
  characterInteractions: WorldCharacter[];
}

export interface WorldTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundImage: string;
  iconUrl: string;
  ambientSounds?: string[];
  visualEffects: VisualEffect[];
}

export interface VisualEffect {
  type: 'particles' | 'animation' | 'lighting';
  config: Record<string, any>;
}

export interface WorldUnlockRequirements {
  minimumLevel: number;
  requiredSubjectXP: number;
  prerequisiteWorlds?: string[];
  requiredAchievements?: string[];
}

export interface WorldCharacter {
  id: string;
  name: string;
  role: 'guide' | 'merchant' | 'questgiver' | 'companion';
  avatarUrl: string;
  dialogues: WorldDialogue[];
  questsOffered?: string[];
}

export interface WorldDialogue {
  id: string;
  trigger: 'enter' | 'quest_complete' | 'level_up' | 'interaction';
  text: string;
  responses?: DialogueResponse[];
}

export interface DialogueResponse {
  text: string;
  action?: 'start_quest' | 'open_shop' | 'give_hint' | 'close';
  questId?: string;
}

export interface WorldProgress {
  worldId: string;
  userId: string;
  unlockedAt: Date;
  questsCompleted: number;
  totalQuests: number;
  timeSpent: number; // in minutes
  lastVisited: Date;
  favoriteRating?: number; // 1-5 stars
}

// Predefined world configurations
export const LEARNING_WORLDS: Record<string, Omit<LearningWorld, 'id' | 'isUnlocked' | 'completionPercentage' | 'availableQuests'>> = {
  'numerical-kingdom': {
    name: 'Numerical Kingdom',
    description: 'A mystical realm where numbers hold magical power and mathematical equations unlock ancient secrets.',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    theme: {
      primaryColor: '#3B82F6', // Blue
      secondaryColor: '#1E40AF',
      backgroundImage: '/worlds/numerical-kingdom-bg.jpg',
      iconUrl: '/worlds/numerical-kingdom-icon.svg',
      ambientSounds: ['/audio/magical-chimes.mp3', '/audio/crystal-resonance.mp3'],
      visualEffects: [
        {
          type: 'particles',
          config: {
            type: 'floating-numbers',
            density: 20,
            color: '#60A5FA',
            animation: 'gentle-float'
          }
        },
        {
          type: 'lighting',
          config: {
            type: 'magical-glow',
            intensity: 0.7,
            color: '#3B82F6'
          }
        }
      ]
    },
    unlockRequirements: {
      minimumLevel: 1,
      requiredSubjectXP: 0
    },
    backgroundMusic: '/audio/numerical-kingdom-theme.mp3',
    characterInteractions: [
      {
        id: 'archimedes-guide',
        name: 'Archimedes the Wise',
        role: 'guide',
        avatarUrl: '/characters/archimedes.png',
        dialogues: [
          {
            id: 'welcome',
            trigger: 'enter',
            text: 'Welcome to the Numerical Kingdom, young mathematician! Here, numbers dance with magic and equations unlock the secrets of the universe.',
            responses: [
              {
                text: 'Tell me about this place',
                action: 'give_hint'
              },
              {
                text: 'I\'m ready for a challenge!',
                action: 'start_quest',
                questId: 'daily-math-quest'
              }
            ]
          }
        ]
      }
    ]
  },
  'laboratory-realm': {
    name: 'Laboratory Realm',
    description: 'A high-tech scientific laboratory where experiments come to life and discoveries await around every corner.',
    subjectId: 'science',
    subjectName: 'Science',
    theme: {
      primaryColor: '#06B6D4', // Cyan
      secondaryColor: '#0891B2',
      backgroundImage: '/worlds/laboratory-realm-bg.jpg',
      iconUrl: '/worlds/laboratory-realm-icon.svg',
      ambientSounds: ['/audio/lab-equipment.mp3', '/audio/bubbling-beakers.mp3'],
      visualEffects: [
        {
          type: 'particles',
          config: {
            type: 'floating-molecules',
            density: 15,
            color: '#22D3EE',
            animation: 'orbital-motion'
          }
        },
        {
          type: 'animation',
          config: {
            type: 'equipment-glow',
            elements: ['.lab-equipment'],
            duration: 3000
          }
        }
      ]
    },
    unlockRequirements: {
      minimumLevel: 3,
      requiredSubjectXP: 100
    },
    backgroundMusic: '/audio/laboratory-realm-theme.mp3',
    characterInteractions: [
      {
        id: 'dr-nova',
        name: 'Dr. Nova',
        role: 'guide',
        avatarUrl: '/characters/dr-nova.png',
        dialogues: [
          {
            id: 'welcome',
            trigger: 'enter',
            text: 'Greetings, aspiring scientist! In my laboratory, we explore the wonders of the natural world through experimentation and discovery.',
            responses: [
              {
                text: 'What experiments can I do?',
                action: 'start_quest',
                questId: 'daily-science-quest'
              },
              {
                text: 'Show me the lab equipment',
                action: 'give_hint'
              }
            ]
          }
        ]
      }
    ]
  },
  'chronicle-citadel': {
    name: 'Chronicle Citadel',
    description: 'An ancient fortress filled with historical artifacts and stories from civilizations across time.',
    subjectId: 'history',
    subjectName: 'History',
    theme: {
      primaryColor: '#F59E0B', // Amber
      secondaryColor: '#D97706',
      backgroundImage: '/worlds/chronicle-citadel-bg.jpg',
      iconUrl: '/worlds/chronicle-citadel-icon.svg',
      ambientSounds: ['/audio/ancient-winds.mp3', '/audio/parchment-rustle.mp3'],
      visualEffects: [
        {
          type: 'particles',
          config: {
            type: 'floating-scrolls',
            density: 10,
            color: '#FCD34D',
            animation: 'gentle-drift'
          }
        },
        {
          type: 'lighting',
          config: {
            type: 'torch-flicker',
            intensity: 0.8,
            color: '#F59E0B'
          }
        }
      ]
    },
    unlockRequirements: {
      minimumLevel: 5,
      requiredSubjectXP: 200
    },
    backgroundMusic: '/audio/chronicle-citadel-theme.mp3',
    characterInteractions: [
      {
        id: 'historian-sage',
        name: 'Sage Chronos',
        role: 'guide',
        avatarUrl: '/characters/sage-chronos.png',
        dialogues: [
          {
            id: 'welcome',
            trigger: 'enter',
            text: 'Welcome to the Chronicle Citadel, keeper of memories! Here, the past comes alive and history\'s greatest lessons await your discovery.',
            responses: [
              {
                text: 'Tell me about ancient civilizations',
                action: 'start_quest',
                questId: 'daily-history-quest'
              },
              {
                text: 'Show me historical artifacts',
                action: 'give_hint'
              }
            ]
          }
        ]
      }
    ]
  },
  'wordsmith-workshop': {
    name: 'Wordsmith Workshop',
    description: 'A creative studio where words come to life, stories unfold, and the power of language shapes reality.',
    subjectId: 'language-arts',
    subjectName: 'Language Arts',
    theme: {
      primaryColor: '#8B5CF6', // Purple
      secondaryColor: '#7C3AED',
      backgroundImage: '/worlds/wordsmith-workshop-bg.jpg',
      iconUrl: '/worlds/wordsmith-workshop-icon.svg',
      ambientSounds: ['/audio/quill-writing.mp3', '/audio/page-turning.mp3'],
      visualEffects: [
        {
          type: 'particles',
          config: {
            type: 'floating-letters',
            density: 25,
            color: '#A78BFA',
            animation: 'spiral-dance'
          }
        },
        {
          type: 'animation',
          config: {
            type: 'text-shimmer',
            elements: ['.story-text'],
            duration: 2000
          }
        }
      ]
    },
    unlockRequirements: {
      minimumLevel: 2,
      requiredSubjectXP: 50
    },
    backgroundMusic: '/audio/wordsmith-workshop-theme.mp3',
    characterInteractions: [
      {
        id: 'wordsmith-master',
        name: 'Master Lexicon',
        role: 'guide',
        avatarUrl: '/characters/master-lexicon.png',
        dialogues: [
          {
            id: 'welcome',
            trigger: 'enter',
            text: 'Ah, a fellow lover of words! In this workshop, we craft stories, explore language, and discover the magic hidden within every sentence.',
            responses: [
              {
                text: 'I want to write a story',
                action: 'start_quest',
                questId: 'daily-writing-quest'
              },
              {
                text: 'Teach me about grammar',
                action: 'give_hint'
              }
            ]
          }
        ]
      }
    ]
  },
  'artisan-atelier': {
    name: 'Artisan Atelier',
    description: 'A vibrant creative space where imagination takes form through colors, shapes, and artistic expression.',
    subjectId: 'art',
    subjectName: 'Art',
    theme: {
      primaryColor: '#EC4899', // Pink
      secondaryColor: '#DB2777',
      backgroundImage: '/worlds/artisan-atelier-bg.jpg',
      iconUrl: '/worlds/artisan-atelier-icon.svg',
      ambientSounds: ['/audio/brush-strokes.mp3', '/audio/creative-ambience.mp3'],
      visualEffects: [
        {
          type: 'particles',
          config: {
            type: 'paint-splashes',
            density: 20,
            color: '#F472B6',
            animation: 'creative-burst'
          }
        },
        {
          type: 'animation',
          config: {
            type: 'color-shift',
            elements: ['.art-canvas'],
            duration: 4000
          }
        }
      ]
    },
    unlockRequirements: {
      minimumLevel: 2,
      requiredSubjectXP: 50
    },
    backgroundMusic: '/audio/artisan-atelier-theme.mp3',
    characterInteractions: [
      {
        id: 'artist-muse',
        name: 'Muse Palette',
        role: 'guide',
        avatarUrl: '/characters/muse-palette.png',
        dialogues: [
          {
            id: 'welcome',
            trigger: 'enter',
            text: 'Welcome to my atelier, creative soul! Here, we explore the boundless world of art and let our imagination paint the impossible.',
            responses: [
              {
                text: 'I want to create art',
                action: 'start_quest',
                questId: 'daily-art-quest'
              },
              {
                text: 'Show me different art styles',
                action: 'give_hint'
              }
            ]
          }
        ]
      }
    ]
  },
  'vitality-valley': {
    name: 'Vitality Valley',
    description: 'A lush natural environment where life sciences flourish and the mysteries of biology unfold.',
    subjectId: 'biology',
    subjectName: 'Biology',
    theme: {
      primaryColor: '#10B981', // Green
      secondaryColor: '#059669',
      backgroundImage: '/worlds/vitality-valley-bg.jpg',
      iconUrl: '/worlds/vitality-valley-icon.svg',
      ambientSounds: ['/audio/nature-sounds.mp3', '/audio/flowing-water.mp3'],
      visualEffects: [
        {
          type: 'particles',
          config: {
            type: 'floating-leaves',
            density: 15,
            color: '#34D399',
            animation: 'natural-sway'
          }
        },
        {
          type: 'animation',
          config: {
            type: 'growth-animation',
            elements: ['.plant-life'],
            duration: 5000
          }
        }
      ]
    },
    unlockRequirements: {
      minimumLevel: 4,
      requiredSubjectXP: 150
    },
    backgroundMusic: '/audio/vitality-valley-theme.mp3',
    characterInteractions: [
      {
        id: 'nature-guardian',
        name: 'Guardian Flora',
        role: 'guide',
        avatarUrl: '/characters/guardian-flora.png',
        dialogues: [
          {
            id: 'welcome',
            trigger: 'enter',
            text: 'Welcome to Vitality Valley, young naturalist! Here, we study the incredible diversity of life and learn how all living things are connected.',
            responses: [
              {
                text: 'Teach me about ecosystems',
                action: 'start_quest',
                questId: 'daily-biology-quest'
              },
              {
                text: 'Show me the local wildlife',
                action: 'give_hint'
              }
            ]
          }
        ]
      }
    ]
  }
};