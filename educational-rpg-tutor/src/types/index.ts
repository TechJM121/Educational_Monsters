export * from './character';
export * from './question';
export * from './achievement';
export * from './quest';
export * from './social';
export * from './parent';
export * from './auth';
export * from './world';

// Real-time and offline types
export interface RealtimeSubscription {
  channel: any;
  unsubscribe: () => void;
}

export interface OfflineAction {
  id: string;
  type: 'character_update' | 'xp_award' | 'quest_progress' | 'stat_allocation';
  payload: any;
  timestamp: number;
  userId: string;
  retryCount: number;
}

export interface NotificationPayload {
  id: string;
  userId: string;
  type: 'achievement' | 'level_up' | 'friend_request' | 'trade_request' | 'challenge_invite';
  title: string;
  message: string;
  data?: any;
  createdAt: string;
}