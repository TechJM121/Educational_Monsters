import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OfflineService } from '../offlineService';
import type { Character } from '../../types/character';
import type { UserQuest } from '../../types/quest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
});

// Mock Supabase
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockResolvedValue({ error: null })
    }),
    rpc: vi.fn().mockResolvedValue({ data: true, error: null })
  }
}));

describe('OfflineService', () => {
  let service: OfflineService;
  let mockSupabase: any;
  const userId = 'test-user-id';

  beforeEach(async () => {
    const { supabase } = await import('../supabaseClient');
    mockSupabase = supabase;
    service = new OfflineService();
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    navigator.onLine = true;
  });

  afterEach(() => {
    service.stopSyncInterval();
  });

  describe('cacheCharacter', () => {
    it('should cache character data in localStorage', () => {
      const character: Character = {
        id: 'char-1',
        userId: userId,
        name: 'Test Character',
        level: 5,
        totalXP: 1000,
        currentXP: 200,
        avatarConfig: {
          hairStyle: 'short',
          hairColor: 'brown',
          skinTone: 'medium',
          eyeColor: 'blue',
          outfit: 'casual',
          accessories: []
        },
        stats: {
          intelligence: 15,
          vitality: 12,
          wisdom: 10,
          charisma: 8,
          dexterity: 14,
          creativity: 11,
          availablePoints: 3
        },
        equippedItems: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      service.cacheCharacter(userId, character);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `educational-rpg-offline-data-${userId}`,
        expect.stringContaining('"character"')
      );
    });
  });

  describe('getCachedCharacter', () => {
    it('should return cached character data', () => {
      const cachedData = {
        character: {
          id: 'char-1',
          name: 'Test Character',
          level: 5
        },
        lastSync: Date.now(),
        pendingActions: []
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

      const result = service.getCachedCharacter(userId);

      expect(result).toEqual(cachedData.character);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        `educational-rpg-offline-data-${userId}`
      );
    });

    it('should return null when no cached data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = service.getCachedCharacter(userId);

      expect(result).toBeNull();
    });
  });

  describe('cacheQuests', () => {
    it('should cache quest data in localStorage', () => {
      const quests: UserQuest[] = [
        {
          id: 'user-quest-1',
          userId: userId,
          questId: 'quest-1',
          progress: [
            {
              id: 'obj-1',
              description: 'Answer 5 questions',
              type: 'answer_questions',
              targetValue: 5,
              currentValue: 3,
              completed: false
            }
          ],
          completed: false,
          startedAt: new Date()
        }
      ];

      service.cacheQuests(userId, quests);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `educational-rpg-offline-data-${userId}`,
        expect.stringContaining('"quests"')
      );
    });
  });

  describe('queueOfflineAction', () => {
    it('should add action to pending queue', () => {
      const action = {
        type: 'xp_award' as const,
        payload: { characterId: 'char-1', xpAmount: 100, source: 'question' },
        userId: userId
      };

      service.queueOfflineAction(action);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        `educational-rpg-offline-data-${userId}`,
        expect.stringContaining('"pendingActions"')
      );
    });

    it('should attempt immediate sync when online', async () => {
      navigator.onLine = true;
      const syncSpy = vi.spyOn(service, 'syncPendingActions');

      const action = {
        type: 'xp_award' as const,
        payload: { characterId: 'char-1', xpAmount: 100, source: 'question' },
        userId: userId
      };

      service.queueOfflineAction(action);

      // Wait for async sync call
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(syncSpy).toHaveBeenCalled();
    });
  });

  describe('syncPendingActions', () => {
    it('should not sync when offline', async () => {
      navigator.onLine = false;

      await service.syncPendingActions();

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should sync XP award actions', async () => {
      const cachedData = {
        pendingActions: [
          {
            id: 'action-1',
            type: 'xp_award',
            payload: { characterId: 'char-1', xpAmount: 100, source: 'question' },
            userId: userId,
            timestamp: Date.now(),
            retryCount: 0
          }
        ],
        lastSync: Date.now()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));
      localStorageMock.key.mockReturnValue(`educational-rpg-offline-data-${userId}`);
      localStorageMock.length = 1;

      await service.syncPendingActions();

      expect(mockSupabase.from).toHaveBeenCalledWith('character_xp_logs');
    });

    it('should sync character update actions', async () => {
      const cachedData = {
        pendingActions: [
          {
            id: 'action-1',
            type: 'character_update',
            payload: { 
              characterId: 'char-1', 
              updates: { level: 6, total_xp: 1200 } 
            },
            userId: userId,
            timestamp: Date.now(),
            retryCount: 0
          }
        ],
        lastSync: Date.now()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));
      localStorageMock.key.mockReturnValue(`educational-rpg-offline-data-${userId}`);
      localStorageMock.length = 1;

      await service.syncPendingActions();

      expect(mockSupabase.from).toHaveBeenCalledWith('characters');
    });

    it('should sync stat allocation actions', async () => {
      const cachedData = {
        pendingActions: [
          {
            id: 'action-1',
            type: 'stat_allocation',
            payload: { 
              characterId: 'char-1', 
              statAllocations: { intelligence: 2, vitality: 1 } 
            },
            userId: userId,
            timestamp: Date.now(),
            retryCount: 0
          }
        ],
        lastSync: Date.now()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));
      localStorageMock.key.mockReturnValue(`educational-rpg-offline-data-${userId}`);
      localStorageMock.length = 1;

      await service.syncPendingActions();

      expect(mockSupabase.rpc).toHaveBeenCalledWith('allocate_stat_points', {
        character_uuid: 'char-1',
        intelligence_points: 2,
        vitality_points: 1,
        wisdom_points: 0,
        charisma_points: 0,
        dexterity_points: 0,
        creativity_points: 0
      });
    });

    it('should remove actions after max retries', async () => {
      const cachedData = {
        pendingActions: [
          {
            id: 'action-1',
            type: 'xp_award',
            payload: { characterId: 'char-1', xpAmount: 100, source: 'question' },
            userId: userId,
            timestamp: Date.now(),
            retryCount: 3 // Max retries exceeded
          }
        ],
        lastSync: Date.now()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));
      localStorageMock.key.mockReturnValue(`educational-rpg-offline-data-${userId}`);
      localStorageMock.length = 1;

      // Mock failure
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: new Error('Sync failed') })
      });

      await service.syncPendingActions();

      // Should update localStorage to remove the failed action
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('conflict resolution', () => {
    it('should resolve character conflicts by preserving higher XP', async () => {
      const localCharacter: Character = {
        id: 'char-1',
        userId: userId,
        name: 'Test Character',
        level: 6,
        totalXP: 1200,
        currentXP: 200,
        avatarConfig: {} as any,
        stats: {
          intelligence: 15,
          vitality: 12,
          wisdom: 10,
          charisma: 8,
          dexterity: 14,
          creativity: 11,
          availablePoints: 3
        },
        equippedItems: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const serverCharacter: Character = {
        ...localCharacter,
        level: 5,
        totalXP: 1000,
        currentXP: 100
      };

      const resolved = await service.resolveConflict(localCharacter, serverCharacter, 'character');

      expect(resolved.totalXP).toBe(1200); // Local XP preserved
      expect(resolved.level).toBe(6); // Local level preserved
    });

    it('should resolve quest conflicts by preserving higher progress', async () => {
      const localQuest: UserQuest = {
        id: 'user-quest-1',
        userId: userId,
        questId: 'quest-1',
        progress: [
          {
            id: 'obj-1',
            description: 'Answer questions',
            type: 'answer_questions',
            targetValue: 10,
            currentValue: 8,
            completed: false
          }
        ],
        completed: false,
        startedAt: new Date()
      };

      const serverQuest: UserQuest = {
        ...localQuest,
        progress: [
          {
            ...localQuest.progress[0],
            currentValue: 5
          }
        ]
      };

      const resolved = await service.resolveConflict(localQuest, serverQuest, 'quest');

      expect(resolved.progress[0].currentValue).toBe(8); // Local progress preserved
    });
  });

  describe('utility methods', () => {
    it('should return correct online status', () => {
      navigator.onLine = true;
      expect(service.isAppOnline()).toBe(true);

      navigator.onLine = false;
      expect(service.isAppOnline()).toBe(false);
    });

    it('should return pending action count', () => {
      const cachedData = {
        pendingActions: [
          { id: '1', type: 'xp_award', payload: {}, userId, timestamp: Date.now(), retryCount: 0 },
          { id: '2', type: 'character_update', payload: {}, userId, timestamp: Date.now(), retryCount: 0 }
        ],
        lastSync: Date.now()
      };

      localStorageMock.getItem.mockReturnValue(JSON.stringify(cachedData));

      const count = service.getPendingActionCount(userId);

      expect(count).toBe(2);
    });

    it('should clear user cache', () => {
      service.clearUserCache(userId);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        `educational-rpg-offline-data-${userId}`
      );
    });
  });
});