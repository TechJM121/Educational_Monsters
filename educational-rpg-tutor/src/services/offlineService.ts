import { supabase } from './supabaseClient';
import type { Character } from '../types/character';
import type { UserQuest } from '../types/quest';

export interface OfflineAction {
  id: string;
  type: 'character_update' | 'xp_award' | 'quest_progress' | 'stat_allocation';
  payload: any;
  timestamp: number;
  userId: string;
  retryCount: number;
}

export interface CachedData {
  character?: Character;
  quests?: UserQuest[];
  lastSync: number;
  pendingActions: OfflineAction[];
}

export class OfflineService {
  private readonly STORAGE_KEY = 'educational-rpg-offline-data';
  private readonly MAX_RETRY_COUNT = 3;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private syncInterval?: NodeJS.Timeout;
  private isOnline = navigator.onLine;

  constructor() {
    this.setupOnlineStatusListeners();
    this.startSyncInterval();
  }

  /**
   * Setup online/offline event listeners
   */
  private setupOnlineStatusListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Start periodic sync interval
   */
  private startSyncInterval(): void {
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncPendingActions();
      }
    }, this.SYNC_INTERVAL);
  }

  /**
   * Stop sync interval
   */
  stopSyncInterval(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = undefined;
    }
  }

  /**
   * Get cached data from localStorage
   */
  private getCachedData(userId: string): CachedData {
    try {
      const data = localStorage.getItem(`${this.STORAGE_KEY}-${userId}`);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          character: parsed.character,
          quests: parsed.quests || [],
          lastSync: parsed.lastSync || 0,
          pendingActions: parsed.pendingActions || []
        };
      }
    } catch (error) {
      console.error('Error reading cached data:', error);
    }

    return {
      lastSync: 0,
      pendingActions: []
    };
  }

  /**
   * Save data to localStorage
   */
  private setCachedData(userId: string, data: CachedData): void {
    try {
      localStorage.setItem(`${this.STORAGE_KEY}-${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  }

  /**
   * Cache character data locally
   */
  cacheCharacter(userId: string, character: Character): void {
    const cachedData = this.getCachedData(userId);
    cachedData.character = character;
    cachedData.lastSync = Date.now();
    this.setCachedData(userId, cachedData);
  }

  /**
   * Get cached character data
   */
  getCachedCharacter(userId: string): Character | null {
    const cachedData = this.getCachedData(userId);
    return cachedData.character || null;
  }

  /**
   * Cache quest data locally
   */
  cacheQuests(userId: string, quests: UserQuest[]): void {
    const cachedData = this.getCachedData(userId);
    cachedData.quests = quests;
    cachedData.lastSync = Date.now();
    this.setCachedData(userId, cachedData);
  }

  /**
   * Get cached quest data
   */
  getCachedQuests(userId: string): UserQuest[] {
    const cachedData = this.getCachedData(userId);
    return cachedData.quests || [];
  }

  /**
   * Add an offline action to the queue
   */
  queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): void {
    const cachedData = this.getCachedData(action.userId);
    
    const offlineAction: OfflineAction = {
      ...action,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    cachedData.pendingActions.push(offlineAction);
    this.setCachedData(action.userId, cachedData);

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingActions();
    }
  }

  /**
   * Sync pending actions with the server
   */
  async syncPendingActions(): Promise<void> {
    if (!this.isOnline) return;

    // Get all users with pending actions
    const userIds = this.getAllUsersWithPendingActions();

    for (const userId of userIds) {
      await this.syncUserActions(userId);
    }
  }

  /**
   * Sync actions for a specific user
   */
  private async syncUserActions(userId: string): Promise<void> {
    const cachedData = this.getCachedData(userId);
    const pendingActions = [...cachedData.pendingActions];

    for (const action of pendingActions) {
      try {
        const success = await this.executeAction(action);
        
        if (success) {
          // Remove successful action from queue
          cachedData.pendingActions = cachedData.pendingActions.filter(a => a.id !== action.id);
        } else {
          // Increment retry count
          const actionIndex = cachedData.pendingActions.findIndex(a => a.id === action.id);
          if (actionIndex !== -1) {
            cachedData.pendingActions[actionIndex].retryCount++;
            
            // Remove action if max retries exceeded
            if (cachedData.pendingActions[actionIndex].retryCount >= this.MAX_RETRY_COUNT) {
              console.error('Max retries exceeded for action:', action);
              cachedData.pendingActions.splice(actionIndex, 1);
            }
          }
        }
      } catch (error) {
        console.error('Error executing action:', action, error);
        
        // Increment retry count on error
        const actionIndex = cachedData.pendingActions.findIndex(a => a.id === action.id);
        if (actionIndex !== -1) {
          cachedData.pendingActions[actionIndex].retryCount++;
          
          if (cachedData.pendingActions[actionIndex].retryCount >= this.MAX_RETRY_COUNT) {
            cachedData.pendingActions.splice(actionIndex, 1);
          }
        }
      }
    }

    this.setCachedData(userId, cachedData);
  }

  /**
   * Execute a specific offline action
   */
  private async executeAction(action: OfflineAction): Promise<boolean> {
    try {
      switch (action.type) {
        case 'character_update':
          return await this.syncCharacterUpdate(action);
        case 'xp_award':
          return await this.syncXPAward(action);
        case 'quest_progress':
          return await this.syncQuestProgress(action);
        case 'stat_allocation':
          return await this.syncStatAllocation(action);
        default:
          console.warn('Unknown action type:', action.type);
          return false;
      }
    } catch (error) {
      console.error('Error executing action:', error);
      return false;
    }
  }

  /**
   * Sync character update
   */
  private async syncCharacterUpdate(action: OfflineAction): Promise<boolean> {
    const { characterId, updates } = action.payload;
    
    const { error } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', characterId);

    return !error;
  }

  /**
   * Sync XP award
   */
  private async syncXPAward(action: OfflineAction): Promise<boolean> {
    const { characterId, xpAmount, source } = action.payload;
    
    // This would use your existing XP award logic
    const { error } = await supabase
      .from('character_xp_logs')
      .insert({
        character_id: characterId,
        user_id: action.userId,
        xp_gained: xpAmount,
        source: source
      });

    return !error;
  }

  /**
   * Sync quest progress
   */
  private async syncQuestProgress(action: OfflineAction): Promise<boolean> {
    const { questId, progress, completed } = action.payload;
    
    const { error } = await supabase
      .from('user_quests')
      .update({
        progress: progress,
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null
      })
      .eq('user_id', action.userId)
      .eq('quest_id', questId);

    return !error;
  }

  /**
   * Sync stat allocation
   */
  private async syncStatAllocation(action: OfflineAction): Promise<boolean> {
    const { characterId, statAllocations } = action.payload;
    
    const { data, error } = await supabase.rpc('allocate_stat_points', {
      character_uuid: characterId,
      intelligence_points: statAllocations.intelligence || 0,
      vitality_points: statAllocations.vitality || 0,
      wisdom_points: statAllocations.wisdom || 0,
      charisma_points: statAllocations.charisma || 0,
      dexterity_points: statAllocations.dexterity || 0,
      creativity_points: statAllocations.creativity || 0
    });

    return !error && data;
  }

  /**
   * Get all user IDs with pending actions
   */
  private getAllUsersWithPendingActions(): string[] {
    const userIds: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_KEY)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.pendingActions && data.pendingActions.length > 0) {
            const userId = key.replace(`${this.STORAGE_KEY}-`, '');
            userIds.push(userId);
          }
        } catch (error) {
          console.error('Error parsing cached data for key:', key, error);
        }
      }
    }
    
    return userIds;
  }

  /**
   * Handle conflict resolution for concurrent updates
   */
  async resolveConflict(
    localData: any, 
    serverData: any, 
    conflictType: 'character' | 'quest'
  ): Promise<any> {
    switch (conflictType) {
      case 'character':
        return this.resolveCharacterConflict(localData, serverData);
      case 'quest':
        return this.resolveQuestConflict(localData, serverData);
      default:
        // Default to server data for unknown conflicts
        return serverData;
    }
  }

  /**
   * Resolve character data conflicts
   */
  private resolveCharacterConflict(localCharacter: Character, serverCharacter: Character): Character {
    // Use server data for most fields, but preserve local XP if higher
    // This handles cases where XP was earned offline
    const resolvedCharacter = { ...serverCharacter };
    
    if (localCharacter.totalXP > serverCharacter.totalXP) {
      resolvedCharacter.totalXP = localCharacter.totalXP;
      resolvedCharacter.currentXP = localCharacter.currentXP;
      resolvedCharacter.level = localCharacter.level;
    }

    // Preserve local stat allocations if they're higher
    Object.keys(localCharacter.stats).forEach(stat => {
      if (stat !== 'availablePoints') {
        const localValue = (localCharacter.stats as any)[stat];
        const serverValue = (serverCharacter.stats as any)[stat];
        if (localValue > serverValue) {
          (resolvedCharacter.stats as any)[stat] = localValue;
        }
      }
    });

    return resolvedCharacter;
  }

  /**
   * Resolve quest progress conflicts
   */
  private resolveQuestConflict(localQuest: UserQuest, serverQuest: UserQuest): UserQuest {
    // Use the quest with more progress
    const localProgress = localQuest.progress.reduce((sum, obj) => sum + obj.currentValue, 0);
    const serverProgress = serverQuest.progress.reduce((sum, obj) => sum + obj.currentValue, 0);
    
    return localProgress >= serverProgress ? localQuest : serverQuest;
  }

  /**
   * Check if the app is currently online
   */
  isAppOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Get the number of pending actions for a user
   */
  getPendingActionCount(userId: string): number {
    const cachedData = this.getCachedData(userId);
    return cachedData.pendingActions.length;
  }

  /**
   * Clear all cached data for a user
   */
  clearUserCache(userId: string): void {
    localStorage.removeItem(`${this.STORAGE_KEY}-${userId}`);
  }

  /**
   * Clear all cached data
   */
  clearAllCache(): void {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.STORAGE_KEY)) {
        localStorage.removeItem(key);
      }
    }
  }
}

export const offlineService = new OfflineService();