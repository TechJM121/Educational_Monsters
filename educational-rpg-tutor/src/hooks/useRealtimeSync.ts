import { useState, useEffect, useCallback } from 'react';
import { useRealtime } from './useRealtime';
import { useOfflineSupport } from './useOfflineSupport';
import type { Character } from '../types/character';
import type { UserQuest } from '../types/quest';
import type { LeaderboardEntry, SocialActivity } from '../types/social';
import type { NotificationPayload } from '../services/realtimeService';

interface UseRealtimeSyncOptions {
  userId: string;
  classroomId?: string;
  friendIds?: string[];
  enabled?: boolean;
}

interface UseRealtimeSyncReturn {
  // Connection status
  isOnline: boolean;
  isConnected: boolean;
  pendingActionCount: number;
  syncInProgress: boolean;
  
  // Notifications
  notifications: NotificationPayload[];
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Character sync
  syncCharacter: (character: Character) => void;
  onCharacterUpdate: (callback: (character: Partial<Character>) => void) => void;
  
  // Quest sync
  syncQuests: (quests: UserQuest[]) => void;
  onQuestUpdate: (callback: (questUpdate: any) => void) => void;
  
  // Leaderboard
  onLeaderboardUpdate: (callback: (leaderboard: LeaderboardEntry[]) => void) => void;
  
  // Social features
  onFriendActivity: (callback: (activity: SocialActivity) => void) => void;
  
  // Offline actions
  queueOfflineAction: (action: {
    type: 'character_update' | 'xp_award' | 'quest_progress' | 'stat_allocation';
    payload: any;
  }) => void;
  
  // Manual sync
  syncNow: () => Promise<void>;
  
  // Cache management
  getCachedData: () => {
    character: Character | null;
    quests: UserQuest[];
  };
  clearCache: () => void;
}

export function useRealtimeSync({
  userId,
  classroomId,
  friendIds = [],
  enabled = true
}: UseRealtimeSyncOptions): UseRealtimeSyncReturn {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [characterUpdateCallback, setCharacterUpdateCallback] = useState<((character: Partial<Character>) => void) | null>(null);
  const [questUpdateCallback, setQuestUpdateCallback] = useState<((questUpdate: any) => void) | null>(null);
  const [leaderboardUpdateCallback, setLeaderboardUpdateCallback] = useState<((leaderboard: LeaderboardEntry[]) => void) | null>(null);
  const [friendActivityCallback, setFriendActivityCallback] = useState<((activity: SocialActivity) => void) | null>(null);

  // Offline support
  const {
    isOnline,
    pendingActionCount,
    syncInProgress,
    getCachedCharacter,
    getCachedQuests,
    cacheCharacter,
    cacheQuests,
    queueOfflineAction,
    syncPendingActions,
    clearCache
  } = useOfflineSupport({ userId, enabled });

  // Real-time subscriptions
  const { isConnected, broadcastEvent } = useRealtime(
    {
      userId,
      classroomId,
      friendIds,
      enabled: enabled && isOnline
    },
    {
      onCharacterUpdate: (payload) => {
        if (characterUpdateCallback) {
          characterUpdateCallback({
            level: payload.level,
            totalXP: payload.totalXP,
            currentXP: payload.currentXP,
            stats: payload.stats
          });
        }
      },
      
      onLeaderboardUpdate: (payload) => {
        if (leaderboardUpdateCallback) {
          leaderboardUpdateCallback(payload);
        }
      },
      
      onQuestProgress: (payload) => {
        if (questUpdateCallback) {
          questUpdateCallback(payload);
        }
      },
      
      onNotification: (payload) => {
        setNotifications(prev => [payload, ...prev].slice(0, 10)); // Keep last 10 notifications
      },
      
      onFriendActivity: (payload) => {
        if (friendActivityCallback) {
          friendActivityCallback(payload);
        }
      },
      
      onConnectionChange: (status) => {
        console.log('Connection status changed:', status);
      }
    }
  );

  // Sync character data
  const syncCharacter = useCallback((character: Character) => {
    if (!enabled) return;
    
    // Cache locally
    cacheCharacter(character);
    
    // If offline, queue for later sync
    if (!isOnline) {
      queueOfflineAction({
        type: 'character_update',
        payload: {
          characterId: character.id,
          updates: {
            level: character.level,
            total_xp: character.totalXP,
            current_xp: character.currentXP,
            updated_at: new Date().toISOString()
          }
        }
      });
    }
  }, [enabled, isOnline, cacheCharacter, queueOfflineAction]);

  // Sync quest data
  const syncQuests = useCallback((quests: UserQuest[]) => {
    if (!enabled) return;
    
    // Cache locally
    cacheQuests(quests);
    
    // If offline, queue updates for later sync
    if (!isOnline) {
      quests.forEach(quest => {
        queueOfflineAction({
          type: 'quest_progress',
          payload: {
            questId: quest.questId,
            progress: quest.progress,
            completed: quest.completed
          }
        });
      });
    }
  }, [enabled, isOnline, cacheQuests, queueOfflineAction]);

  // Notification management
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Callback setters
  const onCharacterUpdate = useCallback((callback: (character: Partial<Character>) => void) => {
    setCharacterUpdateCallback(() => callback);
  }, []);

  const onQuestUpdate = useCallback((callback: (questUpdate: any) => void) => {
    setQuestUpdateCallback(() => callback);
  }, []);

  const onLeaderboardUpdate = useCallback((callback: (leaderboard: LeaderboardEntry[]) => void) => {
    setLeaderboardUpdateCallback(() => callback);
  }, []);

  const onFriendActivity = useCallback((callback: (activity: SocialActivity) => void) => {
    setFriendActivityCallback(() => callback);
  }, []);

  // Manual sync
  const syncNow = useCallback(async () => {
    if (!enabled || !isOnline) return;
    await syncPendingActions();
  }, [enabled, isOnline, syncPendingActions]);

  // Get cached data
  const getCachedData = useCallback(() => {
    return {
      character: getCachedCharacter(),
      quests: getCachedQuests()
    };
  }, [getCachedCharacter, getCachedQuests]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingActionCount > 0) {
      syncNow();
    }
  }, [isOnline, pendingActionCount, syncNow]);

  // Broadcast user activity when online
  const broadcastUserActivity = useCallback(async (activityType: string, data: any) => {
    if (!enabled || !isOnline || !isConnected) return;
    
    try {
      await broadcastEvent(`user-activity-${userId}`, activityType, {
        userId,
        timestamp: Date.now(),
        ...data
      });
    } catch (error) {
      console.error('Error broadcasting user activity:', error);
    }
  }, [enabled, isOnline, isConnected, broadcastEvent, userId]);

  // Enhanced queue function that also broadcasts when online
  const enhancedQueueOfflineAction = useCallback((action: {
    type: 'character_update' | 'xp_award' | 'quest_progress' | 'stat_allocation';
    payload: any;
  }) => {
    queueOfflineAction(action);
    
    // Broadcast activity if online
    if (isOnline && isConnected) {
      broadcastUserActivity(action.type, action.payload);
    }
  }, [queueOfflineAction, isOnline, isConnected, broadcastUserActivity]);

  return {
    // Connection status
    isOnline,
    isConnected,
    pendingActionCount,
    syncInProgress,
    
    // Notifications
    notifications,
    dismissNotification,
    clearAllNotifications,
    
    // Character sync
    syncCharacter,
    onCharacterUpdate,
    
    // Quest sync
    syncQuests,
    onQuestUpdate,
    
    // Leaderboard
    onLeaderboardUpdate,
    
    // Social features
    onFriendActivity,
    
    // Offline actions
    queueOfflineAction: enhancedQueueOfflineAction,
    
    // Manual sync
    syncNow,
    
    // Cache management
    getCachedData,
    clearCache
  };
}