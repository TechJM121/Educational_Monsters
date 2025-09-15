import { useState, useEffect, useCallback } from 'react';
import { offlineService } from '../services/offlineService';
import type { Character } from '../types/character';
import type { UserQuest } from '../types/quest';

interface UseOfflineSupportOptions {
  userId: string;
  enabled?: boolean;
}

interface UseOfflineSupportReturn {
  isOnline: boolean;
  pendingActionCount: number;
  syncInProgress: boolean;
  getCachedCharacter: () => Character | null;
  getCachedQuests: () => UserQuest[];
  cacheCharacter: (character: Character) => void;
  cacheQuests: (quests: UserQuest[]) => void;
  queueOfflineAction: (action: {
    type: 'character_update' | 'xp_award' | 'quest_progress' | 'stat_allocation';
    payload: any;
  }) => void;
  syncPendingActions: () => Promise<void>;
  clearCache: () => void;
}

export function useOfflineSupport({
  userId,
  enabled = true
}: UseOfflineSupportOptions): UseOfflineSupportReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActionCount, setPendingActionCount] = useState(0);
  const [syncInProgress, setSyncInProgress] = useState(false);

  // Update online status
  useEffect(() => {
    if (!enabled) return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled]);

  // Update pending action count
  useEffect(() => {
    if (!enabled || !userId) return;

    const updatePendingCount = () => {
      const count = offlineService.getPendingActionCount(userId);
      setPendingActionCount(count);
    };

    updatePendingCount();

    // Update count periodically
    const interval = setInterval(updatePendingCount, 5000);

    return () => clearInterval(interval);
  }, [enabled, userId]);

  const getCachedCharacter = useCallback(() => {
    if (!enabled || !userId) return null;
    return offlineService.getCachedCharacter(userId);
  }, [enabled, userId]);

  const getCachedQuests = useCallback(() => {
    if (!enabled || !userId) return [];
    return offlineService.getCachedQuests(userId);
  }, [enabled, userId]);

  const cacheCharacter = useCallback((character: Character) => {
    if (!enabled || !userId) return;
    offlineService.cacheCharacter(userId, character);
  }, [enabled, userId]);

  const cacheQuests = useCallback((quests: UserQuest[]) => {
    if (!enabled || !userId) return;
    offlineService.cacheQuests(userId, quests);
  }, [enabled, userId]);

  const queueOfflineAction = useCallback((action: {
    type: 'character_update' | 'xp_award' | 'quest_progress' | 'stat_allocation';
    payload: any;
  }) => {
    if (!enabled || !userId) return;
    
    offlineService.queueOfflineAction({
      ...action,
      userId
    });

    // Update pending count immediately
    setPendingActionCount(prev => prev + 1);
  }, [enabled, userId]);

  const syncPendingActions = useCallback(async () => {
    if (!enabled || !isOnline || syncInProgress) return;

    setSyncInProgress(true);
    try {
      await offlineService.syncPendingActions();
      // Update pending count after sync
      const count = offlineService.getPendingActionCount(userId);
      setPendingActionCount(count);
    } catch (error) {
      console.error('Error syncing pending actions:', error);
    } finally {
      setSyncInProgress(false);
    }
  }, [enabled, isOnline, syncInProgress, userId]);

  const clearCache = useCallback(() => {
    if (!enabled || !userId) return;
    offlineService.clearUserCache(userId);
    setPendingActionCount(0);
  }, [enabled, userId]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingActionCount > 0 && !syncInProgress) {
      syncPendingActions();
    }
  }, [isOnline, pendingActionCount, syncInProgress, syncPendingActions]);

  return {
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
  };
}