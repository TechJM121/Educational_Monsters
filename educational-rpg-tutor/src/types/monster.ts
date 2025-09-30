export interface Monster {
  id: string;
  userId: string;
  name: string;
  species: MonsterSpecies;
  level: number;
  totalXP: number;
  currentXP: number;
  customization: MonsterCustomization;
  stats: MonsterStats;
  abilities: MonsterAbility[];
  personality: MonsterPersonality;
  bond: number; // 0-100, affects monster's effectiveness
  isActive: boolean; // Currently selected companion
  unlockedFeatures: UnlockedFeature[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MonsterCustomization {
  // Base appearance
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  pattern: MonsterPattern;
  size: MonsterSize;
  
  // Body parts
  eyes: MonsterEyes;
  horns?: MonsterHorns;
  wings?: MonsterWings;
  tail?: MonsterTail;
  markings?: MonsterMarkings[];
  
  // Accessories (unlockable)
  hat?: string;
  collar?: string;
  jewelry?: string[];
  armor?: MonsterArmor;
  
  // Special effects (unlockable)
  aura?: MonsterAura;
  particles?: MonsterParticles;
  glow?: MonsterGlow;
}

export interface MonsterStats {
  strength: number;
  intelligence: number;
  agility: number;
  magic: number;
  loyalty: number;
  curiosity: number;
  availablePoints: number;
}

export interface MonsterAbility {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  cooldown: number;
  manaCost: number;
  level: number;
  isUnlocked: boolean;
  icon: string;
}

export interface MonsterPersonality {
  traits: PersonalityTrait[];
  mood: MonsterMood;
  preferences: MonsterPreferences;
}

export interface UnlockedFeature {
  id: string;
  type: UnlockableType;
  category: string;
  itemId: string;
  unlockedAt: Date;
  unlockCondition: UnlockCondition;
}

export interface UnlockCondition {
  type: 'level' | 'xp' | 'achievement' | 'quest' | 'bond' | 'time' | 'special';
  requirement: number | string;
  description: string;
}

// Enums and Types
export type MonsterSpecies = 
  | 'dragon' 
  | 'phoenix' 
  | 'unicorn' 
  | 'griffin' 
  | 'fox' 
  | 'wolf' 
  | 'cat' 
  | 'owl' 
  | 'turtle' 
  | 'rabbit'
  | 'bear'
  | 'deer';

export type MonsterPattern = 
  | 'solid' 
  | 'stripes' 
  | 'spots' 
  | 'gradient' 
  | 'marble' 
  | 'galaxy' 
  | 'flame' 
  | 'frost' 
  | 'lightning' 
  | 'nature';

export type MonsterSize = 'tiny' | 'small' | 'medium' | 'large' | 'giant';

export interface MonsterEyes {
  shape: 'round' | 'almond' | 'star' | 'diamond' | 'heart' | 'crescent';
  color: string;
  effect?: 'sparkle' | 'glow' | 'rainbow' | 'fire' | 'ice' | 'lightning';
}

export interface MonsterHorns {
  type: 'small' | 'curved' | 'spiral' | 'branched' | 'crystal' | 'flame';
  color: string;
  material?: 'bone' | 'crystal' | 'metal' | 'wood' | 'energy';
}

export interface MonsterWings {
  type: 'feathered' | 'bat' | 'butterfly' | 'dragonfly' | 'crystal' | 'energy';
  size: 'small' | 'medium' | 'large' | 'massive';
  color: string;
  pattern?: string;
}

export interface MonsterTail {
  type: 'fluffy' | 'scaled' | 'feathered' | 'spiky' | 'crystal' | 'flame';
  length: 'short' | 'medium' | 'long' | 'extra-long';
  color: string;
}

export interface MonsterMarkings {
  type: 'tribal' | 'geometric' | 'floral' | 'celestial' | 'runic' | 'abstract';
  color: string;
  position: 'face' | 'body' | 'legs' | 'wings' | 'tail';
  opacity: number;
}

export interface MonsterArmor {
  type: 'light' | 'medium' | 'heavy' | 'magical' | 'crystal' | 'nature';
  material: string;
  color: string;
  enchantment?: string;
}

export interface MonsterAura {
  type: 'calm' | 'energetic' | 'mysterious' | 'powerful' | 'gentle' | 'fierce';
  color: string;
  intensity: number;
  particles?: boolean;
}

export interface MonsterParticles {
  type: 'sparkles' | 'flames' | 'snowflakes' | 'leaves' | 'stars' | 'bubbles';
  color: string;
  density: number;
  speed: number;
}

export interface MonsterGlow {
  color: string;
  intensity: number;
  pulsing: boolean;
  parts: ('eyes' | 'markings' | 'horns' | 'wings' | 'tail' | 'full')[];
}

export type AbilityType = 
  | 'offensive' 
  | 'defensive' 
  | 'support' 
  | 'utility' 
  | 'passive' 
  | 'ultimate';

export type PersonalityTrait = 
  | 'playful' 
  | 'serious' 
  | 'curious' 
  | 'protective' 
  | 'mischievous' 
  | 'gentle' 
  | 'brave' 
  | 'shy' 
  | 'energetic' 
  | 'calm';

export type MonsterMood = 
  | 'happy' 
  | 'excited' 
  | 'content' 
  | 'sleepy' 
  | 'playful' 
  | 'focused' 
  | 'protective' 
  | 'curious';

export interface MonsterPreferences {
  favoriteActivity: string;
  favoriteFood: string;
  favoriteLocation: string;
  dislikedActivity?: string;
}

export type UnlockableType = 
  | 'color' 
  | 'pattern' 
  | 'accessory' 
  | 'ability' 
  | 'effect' 
  | 'species' 
  | 'size' 
  | 'bodyPart';

// Unlockable Items Database
export interface UnlockableItem {
  id: string;
  name: string;
  description: string;
  type: UnlockableType;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  icon: string;
  preview?: string;
  unlockCondition: UnlockCondition;
  cost?: number; // Optional currency cost
  isHidden?: boolean; // Hidden until unlocked
}

// Monster Collection
export interface MonsterCollection {
  userId: string;
  monsters: Monster[];
  activeMonster?: string; // ID of currently active monster
  unlockedItems: UnlockedFeature[];
  totalBondPoints: number;
  collectionLevel: number;
  achievements: string[];
}