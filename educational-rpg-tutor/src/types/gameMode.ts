export interface GameMode {
  id: string;
  name: string;
  description: string;
  type: 'competitive' | 'cooperative' | 'solo_challenge' | 'timed' | 'survival';
  category: 'daily' | 'weekly' | 'special_event' | 'permanent';
  difficulty: 1 | 2 | 3 | 4 | 5;
  duration: number; // in minutes
  maxParticipants: number;
  minLevel: number;
  worldId?: string; // Optional world restriction
  subjectId?: string; // Optional subject restriction
  rewards: GameModeReward[];
  rules: GameModeRule[];
  isActive: boolean;
  startTime?: Date;
  endTime?: Date;
  icon: string;
  bannerImage: string;
}

export interface GameModeReward {
  position: 'winner' | 'top_3' | 'top_10' | 'participant';
  type: 'xp' | 'item' | 'badge' | 'title' | 'stat_points' | 'world_unlock';
  value: number;
  itemId?: string;
  badgeId?: string;
  titleId?: string;
  worldId?: string;
  bonusMultiplier?: number;
}

export interface GameModeRule {
  id: string;
  description: string;
  type: 'scoring' | 'time_limit' | 'lives' | 'special_condition';
  value?: number;
  condition?: string;
}

export interface GameSession {
  id: string;
  gameModeId: string;
  hostUserId?: string; // For multiplayer games
  participants: GameParticipant[];
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  startedAt?: Date;
  completedAt?: Date;
  currentRound: number;
  totalRounds: number;
  settings: GameSessionSettings;
  leaderboard: GameLeaderboardEntry[];
}

export interface GameParticipant {
  userId: string;
  username: string;
  characterName: string;
  level: number;
  joinedAt: Date;
  isReady: boolean;
  currentScore: number;
  position: number;
  status: 'active' | 'eliminated' | 'disconnected';
  powerUpsUsed: string[];
}

export interface GameSessionSettings {
  questionCount: number;
  timePerQuestion: number;
  allowPowerUps: boolean;
  difficultyScaling: boolean;
  subjectMix: string[]; // Subject IDs to include
  customRules?: Record<string, any>;
}

export interface GameLeaderboardEntry {
  userId: string;
  username: string;
  characterName: string;
  score: number;
  accuracy: number;
  timeBonus: number;
  streakBonus: number;
  powerUpBonus: number;
  finalPosition: number;
  rewardsEarned: GameModeReward[];
}

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  type: 'time_freeze' | 'double_points' | 'hint' | 'shield' | 'steal_points' | 'extra_life';
  duration?: number; // in seconds
  cooldown: number; // in seconds
  cost: number; // in coins or special currency
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  effect: PowerUpEffect;
}

export interface PowerUpEffect {
  type: 'immediate' | 'duration' | 'next_question' | 'passive';
  value: number;
  target: 'self' | 'opponent' | 'all_opponents';
  condition?: string;
}

// Predefined game modes
export const GAME_MODES: Record<string, Omit<GameMode, 'id' | 'isActive'>> = {
  'lightning-round': {
    name: 'Lightning Round',
    description: 'Answer as many questions as possible in 60 seconds! Speed and accuracy both matter.',
    type: 'timed',
    category: 'daily',
    difficulty: 2,
    duration: 1,
    maxParticipants: 1,
    minLevel: 1,
    rewards: [
      { position: 'winner', type: 'xp', value: 100 },
      { position: 'participant', type: 'xp', value: 25 }
    ],
    rules: [
      { id: 'time-limit', description: 'Answer questions within 60 seconds', type: 'time_limit', value: 60 },
      { id: 'scoring', description: 'Correct answers: +10 points, Wrong answers: -2 points', type: 'scoring' },
      { id: 'speed-bonus', description: 'Faster answers earn bonus points', type: 'special_condition' }
    ],
    icon: '⚡',
    bannerImage: '/game-modes/lightning-round-banner.jpg'
  },
  'math-duel': {
    name: 'Math Duel',
    description: 'Face off against another student in a head-to-head mathematical battle!',
    type: 'competitive',
    category: 'daily',
    difficulty: 3,
    duration: 10,
    maxParticipants: 2,
    minLevel: 3,
    subjectId: 'mathematics',
    worldId: 'numerical-kingdom',
    rewards: [
      { position: 'winner', type: 'xp', value: 150, bonusMultiplier: 1.5 },
      { position: 'participant', type: 'xp', value: 50 },
      { position: 'winner', type: 'item', value: 1, itemId: 'duel-champion-badge' }
    ],
    rules: [
      { id: 'rounds', description: 'Best of 10 questions wins', type: 'special_condition', value: 10 },
      { id: 'time-per-question', description: '30 seconds per question', type: 'time_limit', value: 30 },
      { id: 'power-ups', description: 'Power-ups allowed', type: 'special_condition' }
    ],
    icon: '⚔️',
    bannerImage: '/game-modes/math-duel-banner.jpg'
  },
  'knowledge-gauntlet': {
    name: 'Knowledge Gauntlet',
    description: 'Survive waves of increasingly difficult questions across all subjects!',
    type: 'survival',
    category: 'weekly',
    difficulty: 4,
    duration: 20,
    maxParticipants: 1,
    minLevel: 5,
    rewards: [
      { position: 'winner', type: 'xp', value: 300 },
      { position: 'winner', type: 'stat_points', value: 5 },
      { position: 'winner', type: 'badge', value: 1, badgeId: 'gauntlet-survivor' },
      { position: 'participant', type: 'xp', value: 100 }
    ],
    rules: [
      { id: 'lives', description: 'Start with 3 lives, lose one for each wrong answer', type: 'lives', value: 3 },
      { id: 'difficulty-scaling', description: 'Questions get harder every 5 correct answers', type: 'special_condition' },
      { id: 'subject-rotation', description: 'Subjects rotate every wave', type: 'special_condition' }
    ],
    icon: '🛡️',
    bannerImage: '/game-modes/knowledge-gauntlet-banner.jpg'
  },
  'team-quest': {
    name: 'Team Quest',
    description: 'Work together with 3 other students to solve complex multi-step problems!',
    type: 'cooperative',
    category: 'weekly',
    difficulty: 3,
    duration: 25,
    maxParticipants: 4,
    minLevel: 4,
    rewards: [
      { position: 'winner', type: 'xp', value: 200 },
      { position: 'winner', type: 'item', value: 1, itemId: 'team-player-medal' },
      { position: 'participant', type: 'xp', value: 75 }
    ],
    rules: [
      { id: 'collaboration', description: 'Team members can help each other', type: 'special_condition' },
      { id: 'shared-lives', description: 'Team shares 5 lives total', type: 'lives', value: 5 },
      { id: 'complex-problems', description: 'Multi-step problems requiring different expertise', type: 'special_condition' }
    ],
    icon: '🤝',
    bannerImage: '/game-modes/team-quest-banner.jpg'
  },
  'speed-demon': {
    name: 'Speed Demon',
    description: 'Race against time and other players to answer questions the fastest!',
    type: 'competitive',
    category: 'daily',
    difficulty: 2,
    duration: 5,
    maxParticipants: 8,
    minLevel: 2,
    rewards: [
      { position: 'winner', type: 'xp', value: 120 },
      { position: 'top_3', type: 'xp', value: 80 },
      { position: 'participant', type: 'xp', value: 30 },
      { position: 'winner', type: 'title', value: 1, titleId: 'speed-demon' }
    ],
    rules: [
      { id: 'first-correct', description: 'First correct answer wins the round', type: 'scoring' },
      { id: 'elimination', description: 'Slowest player eliminated each round', type: 'special_condition' },
      { id: 'power-ups-disabled', description: 'No power-ups allowed', type: 'special_condition' }
    ],
    icon: '🏃‍♂️',
    bannerImage: '/game-modes/speed-demon-banner.jpg'
  },
  'world-championship': {
    name: 'World Championship',
    description: 'Compete in the ultimate tournament across all learning worlds!',
    type: 'competitive',
    category: 'special_event',
    difficulty: 5,
    duration: 45,
    maxParticipants: 16,
    minLevel: 10,
    rewards: [
      { position: 'winner', type: 'xp', value: 500 },
      { position: 'winner', type: 'stat_points', value: 10 },
      { position: 'winner', type: 'badge', value: 1, badgeId: 'world-champion' },
      { position: 'winner', type: 'title', value: 1, titleId: 'grand-champion' },
      { position: 'top_3', type: 'xp', value: 300 },
      { position: 'top_3', type: 'stat_points', value: 5 },
      { position: 'top_10', type: 'xp', value: 150 },
      { position: 'participant', type: 'xp', value: 100 }
    ],
    rules: [
      { id: 'tournament-bracket', description: 'Single elimination tournament format', type: 'special_condition' },
      { id: 'all-subjects', description: 'Questions from all unlocked worlds', type: 'special_condition' },
      { id: 'power-ups-allowed', description: 'All power-ups available', type: 'special_condition' },
      { id: 'adaptive-difficulty', description: 'Difficulty adapts to player level', type: 'special_condition' }
    ],
    icon: '👑',
    bannerImage: '/game-modes/world-championship-banner.jpg'
  },
  'mystery-box': {
    name: 'Mystery Box Challenge',
    description: 'Open mystery boxes by answering questions correctly. What treasures await?',
    type: 'solo_challenge',
    category: 'daily',
    difficulty: 2,
    duration: 15,
    maxParticipants: 1,
    minLevel: 1,
    rewards: [
      { position: 'winner', type: 'item', value: 3, itemId: 'mystery-box' },
      { position: 'participant', type: 'xp', value: 50 }
    ],
    rules: [
      { id: 'mystery-rewards', description: 'Each correct answer opens a mystery box', type: 'special_condition' },
      { id: 'streak-bonus', description: 'Consecutive correct answers unlock better boxes', type: 'special_condition' },
      { id: 'no-penalties', description: 'Wrong answers don\'t end the game', type: 'special_condition' }
    ],
    icon: '📦',
    bannerImage: '/game-modes/mystery-box-banner.jpg'
  },
  'boss-battle': {
    name: 'Boss Battle',
    description: 'Team up to defeat powerful knowledge bosses from each learning world!',
    type: 'cooperative',
    category: 'weekly',
    difficulty: 4,
    duration: 30,
    maxParticipants: 6,
    minLevel: 7,
    rewards: [
      { position: 'winner', type: 'xp', value: 250 },
      { position: 'winner', type: 'item', value: 1, itemId: 'boss-slayer-weapon' },
      { position: 'winner', type: 'badge', value: 1, badgeId: 'boss-slayer' },
      { position: 'participant', type: 'xp', value: 100 }
    ],
    rules: [
      { id: 'boss-health', description: 'Boss has health that decreases with correct answers', type: 'special_condition' },
      { id: 'boss-attacks', description: 'Wrong answers trigger boss attacks', type: 'special_condition' },
      { id: 'team-coordination', description: 'Different roles: Tank, Healer, DPS', type: 'special_condition' },
      { id: 'special-abilities', description: 'Each role has unique abilities', type: 'special_condition' }
    ],
    icon: '🐉',
    bannerImage: '/game-modes/boss-battle-banner.jpg'
  }
};

// Power-ups available in competitive game modes
export const POWER_UPS: Record<string, PowerUp> = {
  'time-freeze': {
    id: 'time-freeze',
    name: 'Time Freeze',
    description: 'Freeze the timer for 10 seconds to think carefully',
    type: 'time_freeze',
    duration: 10,
    cooldown: 60,
    cost: 50,
    rarity: 'common',
    icon: '❄️',
    effect: {
      type: 'duration',
      value: 10,
      target: 'self'
    }
  },
  'double-points': {
    id: 'double-points',
    name: 'Double Points',
    description: 'Next correct answer is worth double points',
    type: 'double_points',
    cooldown: 45,
    cost: 75,
    rarity: 'rare',
    icon: '✨',
    effect: {
      type: 'next_question',
      value: 2,
      target: 'self'
    }
  },
  'hint': {
    id: 'hint',
    name: 'Hint',
    description: 'Get a helpful hint for the current question',
    type: 'hint',
    cooldown: 30,
    cost: 25,
    rarity: 'common',
    icon: '💡',
    effect: {
      type: 'immediate',
      value: 1,
      target: 'self'
    }
  },
  'shield': {
    id: 'shield',
    name: 'Shield',
    description: 'Protect yourself from the next wrong answer penalty',
    type: 'shield',
    cooldown: 90,
    cost: 100,
    rarity: 'epic',
    icon: '🛡️',
    effect: {
      type: 'passive',
      value: 1,
      target: 'self'
    }
  },
  'steal-points': {
    id: 'steal-points',
    name: 'Point Steal',
    description: 'Steal 20% of points from the leading opponent',
    type: 'steal_points',
    cooldown: 120,
    cost: 150,
    rarity: 'legendary',
    icon: '🏴‍☠️',
    effect: {
      type: 'immediate',
      value: 0.2,
      target: 'opponent'
    }
  },
  'extra-life': {
    id: 'extra-life',
    name: 'Extra Life',
    description: 'Gain an additional life in survival modes',
    type: 'extra_life',
    cooldown: 180,
    cost: 200,
    rarity: 'legendary',
    icon: '❤️',
    effect: {
      type: 'immediate',
      value: 1,
      target: 'self'
    }
  }
};

// Special event game modes that rotate monthly
export const SPECIAL_EVENT_MODES: Record<string, Omit<GameMode, 'id' | 'isActive'>> = {
  'halloween-horror': {
    name: 'Halloween Horror Quiz',
    description: 'Spooky questions in a haunted learning environment!',
    type: 'solo_challenge',
    category: 'special_event',
    difficulty: 3,
    duration: 20,
    maxParticipants: 1,
    minLevel: 3,
    rewards: [
      { position: 'winner', type: 'item', value: 1, itemId: 'halloween-costume' },
      { position: 'winner', type: 'badge', value: 1, badgeId: 'ghost-buster' },
      { position: 'participant', type: 'xp', value: 100 }
    ],
    rules: [
      { id: 'spooky-theme', description: 'All questions have Halloween themes', type: 'special_condition' },
      { id: 'jump-scares', description: 'Wrong answers trigger spooky effects', type: 'special_condition' },
      { id: 'candy-rewards', description: 'Correct answers earn virtual candy', type: 'special_condition' }
    ],
    icon: '🎃',
    bannerImage: '/game-modes/halloween-horror-banner.jpg'
  },
  'winter-wonderland': {
    name: 'Winter Wonderland Challenge',
    description: 'Build snowmen by answering winter-themed questions!',
    type: 'cooperative',
    category: 'special_event',
    difficulty: 2,
    duration: 25,
    maxParticipants: 4,
    minLevel: 2,
    rewards: [
      { position: 'winner', type: 'item', value: 1, itemId: 'winter-hat' },
      { position: 'winner', type: 'badge', value: 1, badgeId: 'snowman-builder' },
      { position: 'participant', type: 'xp', value: 75 }
    ],
    rules: [
      { id: 'winter-theme', description: 'Questions themed around winter and holidays', type: 'special_condition' },
      { id: 'snowman-building', description: 'Team builds a snowman together', type: 'special_condition' },
      { id: 'warm-up-bonus', description: 'Consecutive correct answers add decorations', type: 'special_condition' }
    ],
    icon: '⛄',
    bannerImage: '/game-modes/winter-wonderland-banner.jpg'
  },
  'spring-science-fair': {
    name: 'Spring Science Fair',
    description: 'Present your scientific knowledge in a virtual science fair!',
    type: 'competitive',
    category: 'special_event',
    difficulty: 4,
    duration: 35,
    maxParticipants: 12,
    minLevel: 6,
    subjectId: 'science',
    worldId: 'laboratory-realm',
    rewards: [
      { position: 'winner', type: 'badge', value: 1, badgeId: 'science-fair-champion' },
      { position: 'winner', type: 'item', value: 1, itemId: 'golden-microscope' },
      { position: 'top_3', type: 'item', value: 1, itemId: 'science-fair-ribbon' },
      { position: 'participant', type: 'xp', value: 125 }
    ],
    rules: [
      { id: 'science-focus', description: 'All questions are science-related', type: 'special_condition' },
      { id: 'experiment-simulation', description: 'Some questions involve virtual experiments', type: 'special_condition' },
      { id: 'peer-judging', description: 'Players can vote on creative answers', type: 'special_condition' }
    ],
    icon: '🔬',
    bannerImage: '/game-modes/spring-science-fair-banner.jpg'
  }
};