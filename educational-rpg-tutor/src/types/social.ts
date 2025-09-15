// Social features and competition system types

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date;
  acceptedAt?: Date;
}

export interface FriendProfile {
  id: string;
  name: string;
  level: number;
  totalXP: number;
  avatarConfig: any;
  specialization?: string;
  isOnline: boolean;
  lastActive: Date;
}

export interface LeaderboardEntry {
  userId: string;
  characterName: string;
  level: number;
  weeklyXP: number;
  totalXP: number;
  avatarConfig: any;
  specialization?: string;
  rank: number;
}

export interface LearningChallenge {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  startDate: Date;
  endDate: Date;
  maxParticipants?: number;
  currentParticipants: number;
  xpReward: number;
  status: 'upcoming' | 'active' | 'completed';
  createdBy: string;
  requirements?: {
    minLevel?: number;
    maxLevel?: number;
    ageRange?: string;
  };
}

export interface ChallengeParticipant {
  id: string;
  challengeId: string;
  userId: string;
  characterName: string;
  score: number;
  completedAt?: Date;
  rank?: number;
}

export interface TradeRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromItems: TradeItem[];
  toItems: TradeItem[];
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  createdAt: Date;
  expiresAt: Date;
  parentalApprovalRequired: boolean;
  parentalApprovalGiven?: boolean;
}

export interface TradeItem {
  inventoryItemId: string;
  itemId: string;
  itemName: string;
  rarity: string;
  category: string;
  quantity: number;
}

export interface SocialAchievement {
  id: string;
  name: string;
  description: string;
  badgeIcon: string;
  category: 'helping' | 'trading' | 'competition' | 'friendship';
  unlockCriteria: {
    type: 'help_friends' | 'complete_trades' | 'win_challenges' | 'make_friends';
    target: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
  xpReward: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface ParentalControl {
  id: string;
  userId: string;
  parentId: string;
  allowFriendRequests: boolean;
  allowTrading: boolean;
  allowChallenges: boolean;
  allowLeaderboards: boolean;
  restrictedUsers: string[];
  approvalRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialActivity {
  id: string;
  userId: string;
  activityType: 'friend_request' | 'trade_request' | 'challenge_invite' | 'achievement_earned' | 'level_up';
  description: string;
  relatedUserId?: string;
  relatedItemId?: string;
  createdAt: Date;
  isRead: boolean;
}

export interface ClassroomGroup {
  id: string;
  name: string;
  teacherId: string;
  code: string;
  students: string[];
  settings: {
    allowLeaderboards: boolean;
    allowTrading: boolean;
    allowChallenges: boolean;
  };
  createdAt: Date;
}