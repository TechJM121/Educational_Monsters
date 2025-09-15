import { useEffect, useRef, useCallback } from 'react';
import { realtimeService, type RealtimeSubscription } from '../services/realtimeService';
import type { 
  CharacterUpdatePayload, 
  LeaderboardUpdatePayload, 
  QuestProgressPayload, 
  NotificationPayload 
} from '../services/realtimeService';
import type { SocialActivity } from '../types/social';

interface UseRealtimeOptions {
  userId?: string;
  classroomId?: string;
  friendIds?: string[];
  enabled?: boolean;
}

interface UseRealtimeCallbacks {
  onCharacterUpdate?: (payload: CharacterUpdatePayload) => void;
  onLeaderboardUpdate?: (payload: LeaderboardUpdatePayload[]) => void;
  onQuestProgress?: (payload: QuestProgressPayload) => void;
  onNotification?: (payload: NotificationPayload) => void;
  onFriendActivity?: (payload: SocialActivity) => void;
  onConnectionChange?: (status: 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED') => void;
}

export function useRealtime(
  options: UseRealtimeOptions,
  callbacks: UseRealtimeCallbacks
) {
  const subscriptionsRef = useRef<RealtimeSubscription[]>([]);
  const connectionStatusRef = useRef<'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'>('CLOSED');

  const { 
    userId, 
    classroomId, 
    friendIds = [], 
    enabled = true 
  } = options;

  const {
    onCharacterUpdate,
    onLeaderboardUpdate,
    onQuestProgress,
    onNotification,
    onFriendActivity,
    onConnectionChange
  } = callbacks;

  // Monitor connection status
  useEffect(() => {
    if (!enabled) return;

    const checkConnection = () => {
      const newStatus = realtimeService.getConnectionStatus();
      if (newStatus !== connectionStatusRef.current) {
        connectionStatusRef.current = newStatus;
        onConnectionChange?.(newStatus);
      }
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection(); // Initial check

    return () => clearInterval(interval);
  }, [enabled, onConnectionChange]);

  // Subscribe to character updates
  useEffect(() => {
    if (!enabled || !userId || !onCharacterUpdate) return;

    const subscription = realtimeService.subscribeToCharacterUpdates(
      userId,
      onCharacterUpdate
    );

    subscriptionsRef.current.push(subscription);

    return () => {
      subscription.unsubscribe();
      subscriptionsRef.current = subscriptionsRef.current.filter(s => s !== subscription);
    };
  }, [enabled, userId, onCharacterUpdate]);

  // Subscribe to leaderboard updates
  useEffect(() => {
    if (!enabled || !classroomId || !onLeaderboardUpdate) return;

    const subscription = realtimeService.subscribeToLeaderboardUpdates(
      classroomId,
      onLeaderboardUpdate
    );

    subscriptionsRef.current.push(subscription);

    return () => {
      subscription.unsubscribe();
      subscriptionsRef.current = subscriptionsRef.current.filter(s => s !== subscription);
    };
  }, [enabled, classroomId, onLeaderboardUpdate]);

  // Subscribe to quest progress
  useEffect(() => {
    if (!enabled || !userId || !onQuestProgress) return;

    const subscription = realtimeService.subscribeToQuestProgress(
      userId,
      onQuestProgress
    );

    subscriptionsRef.current.push(subscription);

    return () => {
      subscription.unsubscribe();
      subscriptionsRef.current = subscriptionsRef.current.filter(s => s !== subscription);
    };
  }, [enabled, userId, onQuestProgress]);

  // Subscribe to notifications
  useEffect(() => {
    if (!enabled || !userId || !onNotification) return;

    const subscription = realtimeService.subscribeToNotifications(
      userId,
      onNotification
    );

    subscriptionsRef.current.push(subscription);

    return () => {
      subscription.unsubscribe();
      subscriptionsRef.current = subscriptionsRef.current.filter(s => s !== subscription);
    };
  }, [enabled, userId, onNotification]);

  // Subscribe to friend activity
  useEffect(() => {
    if (!enabled || !userId || !onFriendActivity || friendIds.length === 0) return;

    const subscription = realtimeService.subscribeToFriendActivity(
      userId,
      friendIds,
      onFriendActivity
    );

    subscriptionsRef.current.push(subscription);

    return () => {
      subscription.unsubscribe();
      subscriptionsRef.current = subscriptionsRef.current.filter(s => s !== subscription);
    };
  }, [enabled, userId, friendIds, onFriendActivity]);

  // Cleanup all subscriptions on unmount
  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach(subscription => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current = [];
    };
  }, []);

  const broadcastEvent = useCallback(
    async (channelName: string, eventType: string, payload: any) => {
      if (!enabled) return;
      await realtimeService.broadcastEvent(channelName, eventType, payload);
    },
    [enabled]
  );

  const getConnectionStatus = useCallback(() => {
    return connectionStatusRef.current;
  }, []);

  return {
    broadcastEvent,
    getConnectionStatus,
    isConnected: connectionStatusRef.current === 'OPEN'
  };
}