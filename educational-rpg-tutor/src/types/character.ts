export interface Character {
  id: string;
  userId: string;
  name: string;
  level: number;
  totalXP: number;
  currentXP: number;
  avatarConfig: AvatarConfig;
  stats: CharacterStats;
  specialization?: Specialization;
  equippedItems: EquippedItem[];
  isGuestCharacter?: boolean;
  guestSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterStats {
  intelligence: number;
  vitality: number;
  wisdom: number;
  charisma: number;
  dexterity: number;
  creativity: number;
  availablePoints: number;
}

export interface AvatarConfig {
  hairStyle: string;
  hairColor: string;
  skinTone: string;
  eyeColor: string;
  outfit: string;
  accessories: string[];
}

export interface EquippedItem {
  id: string;
  itemId: string;
  slot: 'head' | 'body' | 'weapon' | 'accessory';
  equippedAt: Date;
}

export type Specialization = 'scholar' | 'explorer' | 'guardian' | 'artist' | 'diplomat' | 'inventor';