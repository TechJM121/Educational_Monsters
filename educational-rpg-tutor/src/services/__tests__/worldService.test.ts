import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { worldService } from '../worldService';
import { supabase } from '../supabaseClient';
import { LEARNING_WORLDS } from '../../types/world';

// Mock Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          upsert: vi.fn()
        })),
        insert: vi.fn(),
        upsert: vi.fn()
      }))
    }))
  }
}));

describe('WorldService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserWorlds', () => {
    it('should return user worlds with unlock status', async () => {
      const userId = 'test-user-id';
      const mockCharacter = {
        id: 'char-1',
        user_id: userId,
        level: 5,
        total_xp: 500,
        character_stats: [{
          intelligence: 15,
          vitality: 12,
          wisdom: 10,
          charisma: 8,
          dexterity: 11,
          creativity: 9
        }]
      };
      const mockUserProgress = [
        {
          subject_name: 'Mathematics',
          total_xp_earned: 200
        },
        {
          subject_name: 'Science',
          total_xp_earned: 150
        }
      ];
      const mockWorldProgress = [
        {
          world_id: 'numerical-kingdom',
          quests_completed: 3,
          total_quests: 10
        }
      ];

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'characters') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockCharacter, error: null })
              }))
            }))
          };
        }
        if (table === 'user_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ 
                data: mockUserProgress.map(up => ({
                  ...up,
                  subject: { name: up.subject_name }
                })), 
                error: null 
              })
            }))
          };
        }
        if (table === 'world_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: mockWorldProgress, error: null })
            }))
          };
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn().mockResolvedValue({ data: [], error: null })
                }))
              }))
            }))
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      const worlds = await worldService.getUserWorlds(userId);

      expect(worlds).toBeDefined();
      expect(Array.isArray(worlds)).toBe(true);
      expect(worlds.length).toBeGreaterThan(0);
      
      // Check that numerical kingdom is unlocked (level 1 requirement)
      const numericalKingdom = worlds.find(w => w.id === 'numerical-kingdom');
      expect(numericalKingdom?.isUnlocked).toBe(true);
      
      // Check that higher level worlds might be locked
      const laboratoryRealm = worlds.find(w => w.id === 'laboratory-realm');
      expect(laboratoryRealm?.isUnlocked).toBe(true); // Level 3 requirement, character is level 5
    });

    it('should handle missing character gracefully', async () => {
      const userId = 'test-user-id';

      (supabase.from as Mock).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') })
          }))
        }))
      }));

      await expect(worldService.getUserWorlds(userId)).rejects.toThrow('Character not found');
    });

    it('should sort worlds by unlock status and level requirements', async () => {
      const userId = 'test-user-id';
      const mockCharacter = {
        id: 'char-1',
        user_id: userId,
        level: 2,
        total_xp: 100,
        character_stats: [{ intelligence: 10, vitality: 10, wisdom: 10, charisma: 10, dexterity: 10, creativity: 10 }]
      };

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'characters') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockCharacter, error: null })
              }))
            }))
          };
        }
        if (table === 'user_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            }))
          };
        }
        if (table === 'world_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            }))
          };
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn().mockResolvedValue({ data: [], error: null })
                }))
              }))
            }))
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      const worlds = await worldService.getUserWorlds(userId);

      // Unlocked worlds should come first
      const unlockedWorlds = worlds.filter(w => w.isUnlocked);
      const lockedWorlds = worlds.filter(w => !w.isUnlocked);
      
      expect(unlockedWorlds.length).toBeGreaterThan(0);
      expect(lockedWorlds.length).toBeGreaterThan(0);
      
      // First world should be unlocked
      expect(worlds[0].isUnlocked).toBe(true);
    });
  });

  describe('unlockWorld', () => {
    it('should unlock world when requirements are met', async () => {
      const userId = 'test-user-id';
      const worldId = 'laboratory-realm';
      const mockCharacter = {
        id: 'char-1',
        user_id: userId,
        level: 5,
        total_xp: 500,
        character_stats: [{ intelligence: 15, vitality: 12, wisdom: 10, charisma: 8, dexterity: 11, creativity: 9 }]
      };
      const mockUserProgress = [
        {
          subject_name: 'Science',
          total_xp_earned: 150
        }
      ];

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'characters') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockCharacter, error: null })
              }))
            }))
          };
        }
        if (table === 'user_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ 
                data: mockUserProgress.map(up => ({
                  ...up,
                  subject: { name: up.subject_name }
                })), 
                error: null 
              })
            }))
          };
        }
        if (table === 'world_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            })),
            insert: vi.fn().mockResolvedValue({ error: null })
          };
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn().mockResolvedValue({ data: [], error: null })
                }))
              }))
            }))
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      const success = await worldService.unlockWorld(userId, worldId);

      expect(success).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('world_progress');
    });

    it('should not unlock world when requirements are not met', async () => {
      const userId = 'test-user-id';
      const worldId = 'laboratory-realm';
      const mockCharacter = {
        id: 'char-1',
        user_id: userId,
        level: 1, // Too low level
        total_xp: 50,
        character_stats: [{ intelligence: 10, vitality: 10, wisdom: 10, charisma: 10, dexterity: 10, creativity: 10 }]
      };

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'characters') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockCharacter, error: null })
              }))
            }))
          };
        }
        if (table === 'user_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            }))
          };
        }
        if (table === 'world_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            }))
          };
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn().mockResolvedValue({ data: [], error: null })
                }))
              }))
            }))
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      const success = await worldService.unlockWorld(userId, worldId);

      expect(success).toBe(false);
    });

    it('should return true if world is already unlocked', async () => {
      const userId = 'test-user-id';
      const worldId = 'numerical-kingdom';
      const mockCharacter = {
        id: 'char-1',
        user_id: userId,
        level: 5,
        total_xp: 500,
        character_stats: [{ intelligence: 15, vitality: 12, wisdom: 10, charisma: 8, dexterity: 11, creativity: 9 }]
      };
      const mockWorldProgress = [
        { world_id: worldId, quests_completed: 2, total_quests: 10 }
      ];

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'characters') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockCharacter, error: null })
              }))
            }))
          };
        }
        if (table === 'user_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            }))
          };
        }
        if (table === 'world_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: mockWorldProgress, error: null })
            }))
          };
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn().mockResolvedValue({ data: [], error: null })
                }))
              }))
            }))
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      const success = await worldService.unlockWorld(userId, worldId);

      expect(success).toBe(true);
    });
  });

  describe('updateWorldProgress', () => {
    it('should update world progress data', async () => {
      const userId = 'test-user-id';
      const worldId = 'numerical-kingdom';
      const updates = {
        timeSpent: 30,
        questsCompleted: 5,
        favoriteRating: 4
      };

      (supabase.from as Mock).mockImplementation(() => ({
        upsert: vi.fn().mockResolvedValue({ error: null })
      }));

      await worldService.updateWorldProgress(userId, worldId, updates);

      expect(supabase.from).toHaveBeenCalledWith('world_progress');
    });

    it('should handle database errors', async () => {
      const userId = 'test-user-id';
      const worldId = 'numerical-kingdom';
      const updates = { timeSpent: 30 };

      (supabase.from as Mock).mockImplementation(() => ({
        upsert: vi.fn().mockResolvedValue({ error: new Error('Database error') })
      }));

      await expect(worldService.updateWorldProgress(userId, worldId, updates))
        .rejects.toThrow('Database error');
    });
  });

  describe('getRecommendedWorld', () => {
    it('should recommend incomplete unlocked world', async () => {
      const userId = 'test-user-id';
      const mockCharacter = {
        id: 'char-1',
        user_id: userId,
        level: 5,
        total_xp: 500,
        character_stats: [{ intelligence: 15, vitality: 12, wisdom: 10, charisma: 8, dexterity: 11, creativity: 9 }]
      };
      const mockWorldProgress = [
        { world_id: 'numerical-kingdom', quests_completed: 3, total_quests: 10 },
        { world_id: 'laboratory-realm', quests_completed: 8, total_quests: 10 }
      ];

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'characters') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockCharacter, error: null })
              }))
            }))
          };
        }
        if (table === 'user_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            }))
          };
        }
        if (table === 'world_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: mockWorldProgress, error: null })
            }))
          };
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn().mockResolvedValue({ data: [], error: null })
                }))
              }))
            }))
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      const recommendedWorldId = await worldService.getRecommendedWorld(userId);

      expect(recommendedWorldId).toBe('numerical-kingdom'); // Less complete world
    });

    it('should recommend next unlockable world if all are complete', async () => {
      const userId = 'test-user-id';
      const mockCharacter = {
        id: 'char-1',
        user_id: userId,
        level: 2,
        total_xp: 200,
        character_stats: [{ intelligence: 12, vitality: 11, wisdom: 10, charisma: 8, dexterity: 9, creativity: 10 }]
      };
      const mockWorldProgress = [
        { world_id: 'numerical-kingdom', quests_completed: 10, total_quests: 10 }
      ];

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'characters') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockCharacter, error: null })
              }))
            }))
          };
        }
        if (table === 'user_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            }))
          };
        }
        if (table === 'world_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: mockWorldProgress, error: null })
            }))
          };
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  eq: vi.fn().mockResolvedValue({ data: [], error: null })
                }))
              }))
            }))
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      const recommendedWorldId = await worldService.getRecommendedWorld(userId);

      expect(recommendedWorldId).toBeTruthy();
      expect(recommendedWorldId).not.toBe('numerical-kingdom');
    });

    it('should return null if no recommendations available', async () => {
      const userId = 'test-user-id';

      (supabase.from as Mock).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') })
          }))
        }))
      }));

      const recommendedWorldId = await worldService.getRecommendedWorld(userId);

      expect(recommendedWorldId).toBeNull();
    });
  });
});