import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AchievementService } from '../achievementService';
import { supabase } from '../supabaseClient';

// Mock Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        })),
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          })),
          single: vi.fn(() => ({
            data: null,
            error: null
          }))
        })),
        single: vi.fn(() => ({
          data: null,
          error: null
        }))
      })),
      insert: vi.fn(() => ({
        error: null
      })),
      upsert: vi.fn(() => ({
        error: null
      }))
    })),
    rpc: vi.fn(() => ({
      error: null
    }))
  }
}));

describe('AchievementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllAchievements', () => {
    it('should fetch all achievements successfully', async () => {
      const mockAchievements = [
        {
          id: '1',
          name: 'First Steps',
          description: 'Complete your first lesson',
          badge_icon: 'first-steps-badge',
          unlock_criteria: { type: 'lessons_completed', count: 1 },
          rarity_level: 1,
          category: 'learning',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      const mockSupabaseResponse = {
        data: mockAchievements,
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => mockSupabaseResponse)
        }))
      } as any);

      const result = await AchievementService.getAllAchievements();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        name: 'First Steps',
        description: 'Complete your first lesson',
        badgeIcon: 'first-steps-badge',
        unlockCriteria: { type: 'lessons_completed', count: 1 },
        rarityLevel: 1,
        category: 'learning',
        createdAt: new Date('2024-01-01T00:00:00Z')
      });
    });

    it('should handle errors when fetching achievements', async () => {
      const mockSupabaseResponse = {
        data: null,
        error: { message: 'Database error' }
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => mockSupabaseResponse)
        }))
      } as any);

      await expect(AchievementService.getAllAchievements()).rejects.toThrow('Failed to fetch achievements');
    });
  });

  describe('getUserAchievements', () => {
    it('should fetch user achievements successfully', async () => {
      const mockUserAchievements = [
        {
          id: '1',
          user_id: 'user-1',
          achievement_id: 'achievement-1',
          unlocked_at: '2024-01-01T00:00:00Z',
          achievements: {
            name: 'First Steps',
            description: 'Complete your first lesson',
            badge_icon: 'first-steps-badge',
            rarity_level: 1,
            category: 'learning'
          }
        }
      ];

      const mockSupabaseResponse = {
        data: mockUserAchievements,
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => mockSupabaseResponse)
          }))
        }))
      } as any);

      const result = await AchievementService.getUserAchievements('user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        userId: 'user-1',
        achievementId: 'achievement-1',
        unlockedAt: new Date('2024-01-01T00:00:00Z')
      });
    });
  });

  describe('awardAchievement', () => {
    it('should award achievement successfully', async () => {
      const mockSupabaseResponse = {
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn(() => mockSupabaseResponse)
      } as any);

      await expect(AchievementService.awardAchievement('user-1', 'achievement-1')).resolves.not.toThrow();
    });

    it('should handle duplicate key errors gracefully', async () => {
      const mockSupabaseResponse = {
        error: { code: '23505', message: 'Duplicate key' }
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn(() => mockSupabaseResponse)
      } as any);

      await expect(AchievementService.awardAchievement('user-1', 'achievement-1')).resolves.not.toThrow();
    });

    it('should throw error for other database errors', async () => {
      const mockSupabaseResponse = {
        error: { code: '42000', message: 'Other error' }
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn(() => mockSupabaseResponse)
      } as any);

      await expect(AchievementService.awardAchievement('user-1', 'achievement-1')).rejects.toThrow('Failed to award achievement');
    });
  });

  describe('getAllCollectibleItems', () => {
    it('should fetch all collectible items successfully', async () => {
      const mockItems = [
        {
          id: '1',
          name: 'Wooden Wand',
          description: 'A simple wand for beginning wizards',
          icon_url: 'wooden-wand.png',
          rarity_level: 1,
          item_type: 'equipment'
        }
      ];

      const mockSupabaseResponse = {
        data: mockItems,
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => mockSupabaseResponse)
        }))
      } as any);

      const result = await AchievementService.getAllCollectibleItems();

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: '1',
        name: 'Wooden Wand',
        description: 'A simple wand for beginning wizards',
        icon: 'wooden-wand.png',
        rarity: 'common',
        category: 'equipment',
        tradeable: false
      });
    });
  });

  describe('awardRandomItem', () => {
    it('should award random item successfully', async () => {
      // Mock getAllCollectibleItems
      const mockItems = [
        {
          id: '1',
          name: 'Health Potion',
          description: 'Restores health',
          icon: 'potion.png',
          rarity: 'common' as const,
          category: 'potion' as const,
          tradeable: true
        }
      ];

      // Mock the service method
      vi.spyOn(AchievementService, 'getAllCollectibleItems').mockResolvedValue(mockItems);

      const mockSupabaseResponse = {
        error: null
      };

      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn(() => mockSupabaseResponse)
      } as any);

      const result = await AchievementService.awardRandomItem('user-1');

      expect(result).toEqual(mockItems[0]);
    });

    it('should handle item quantity increment', async () => {
      const mockItems = [
        {
          id: '1',
          name: 'Health Potion',
          description: 'Restores health',
          icon: 'potion.png',
          rarity: 'common' as const,
          category: 'potion' as const,
          tradeable: true
        }
      ];

      vi.spyOn(AchievementService, 'getAllCollectibleItems').mockResolvedValue(mockItems);

      // Mock upsert to fail (item exists)
      vi.mocked(supabase.from).mockReturnValue({
        upsert: vi.fn(() => ({ error: { message: 'Conflict' } }))
      } as any);

      // Mock rpc to succeed
      vi.mocked(supabase.rpc).mockResolvedValue({ error: null });

      const result = await AchievementService.awardRandomItem('user-1');

      expect(result).toEqual(mockItems[0]);
      expect(supabase.rpc).toHaveBeenCalledWith('increment_item_quantity', {
        p_user_id: 'user-1',
        p_item_id: '1'
      });
    });
  });

  describe('rarity and type mapping', () => {
    it('should map rarity levels correctly', () => {
      const testCases = [
        { level: 1, expected: 'common' },
        { level: 2, expected: 'uncommon' },
        { level: 3, expected: 'rare' },
        { level: 4, expected: 'epic' },
        { level: 5, expected: 'legendary' },
        { level: 99, expected: 'common' } // fallback
      ];

      testCases.forEach(({ level, expected }) => {
        // Access private method through any cast for testing
        const result = (AchievementService as any).mapRarityLevel(level);
        expect(result).toBe(expected);
      });
    });

    it('should map item types correctly', () => {
      const testCases = [
        { type: 'equipment', expected: 'equipment' },
        { type: 'consumable', expected: 'potion' },
        { type: 'collectible', expected: 'artifact' },
        { type: 'unknown', expected: 'artifact' } // fallback
      ];

      testCases.forEach(({ type, expected }) => {
        // Access private method through any cast for testing
        const result = (AchievementService as any).mapItemType(type);
        expect(result).toBe(expected);
      });
    });
  });
});