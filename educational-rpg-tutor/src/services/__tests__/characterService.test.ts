import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CharacterService } from '../characterService';
import type { AvatarConfig } from '../../types/character';

// Mock Supabase client
vi.mock('../supabaseClient', () => {
  const mockSupabase = {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      }))
    })),
    rpc: vi.fn()
  };
  
  return {
    supabase: mockSupabase
  };
});

import { supabase } from '../supabaseClient';

describe('CharacterService', () => {
  let characterService: CharacterService;
  const mockUserId = 'user-123';
  const mockCharacterId = 'char-456';
  
  const mockAvatarConfig: AvatarConfig = {
    hairStyle: 'short',
    hairColor: 'brown',
    skinTone: 'medium',
    eyeColor: 'blue',
    outfit: 'casual',
    accessories: ['glasses']
  };

  beforeEach(() => {
    characterService = new CharacterService();
    vi.clearAllMocks();
  });

  describe('createCharacter', () => {
    it('should create a character with default stats', async () => {
      const mockCharacterData = {
        id: mockCharacterId,
        user_id: mockUserId,
        name: 'Test Hero',
        avatar_config: mockAvatarConfig,
        level: 1,
        total_xp: 0,
        current_xp: 0,
        specialization: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const mockStatsData = {
        id: 'stats-123',
        character_id: mockCharacterId,
        intelligence: 10,
        vitality: 10,
        wisdom: 10,
        charisma: 10,
        dexterity: 10,
        creativity: 10,
        available_points: 0
      };

      // Mock character creation
      (supabase.from as any).mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockCharacterData, error: null })
          }))
        }))
      });

      // Mock stats creation
      (supabase.from as any).mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockStatsData, error: null })
          }))
        }))
      });

      const result = await characterService.createCharacter(mockUserId, 'Test Hero', mockAvatarConfig);

      expect(result).toEqual({
        id: mockCharacterId,
        userId: mockUserId,
        name: 'Test Hero',
        level: 1,
        totalXP: 0,
        currentXP: 0,
        avatarConfig: mockAvatarConfig,
        stats: {
          intelligence: 10,
          vitality: 10,
          wisdom: 10,
          charisma: 10,
          dexterity: 10,
          creativity: 10,
          availablePoints: 0
        },
        specialization: null,
        equippedItems: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      });
    });

    it('should handle character creation errors', async () => {
      (supabase.from as any).mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
          }))
        }))
      });

      await expect(
        characterService.createCharacter(mockUserId, 'Test Hero', mockAvatarConfig)
      ).rejects.toThrow('Failed to create character');
    });
  });

  describe('getCharacterByUserId', () => {
    it('should retrieve character with stats', async () => {
      const mockCharacterWithStats = {
        id: mockCharacterId,
        user_id: mockUserId,
        name: 'Test Hero',
        avatar_config: mockAvatarConfig,
        level: 5,
        total_xp: 500,
        current_xp: 50,
        specialization: 'scholar',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        character_stats: [{
          intelligence: 15,
          vitality: 12,
          wisdom: 13,
          charisma: 10,
          dexterity: 10,
          creativity: 10,
          available_points: 3
        }]
      };

      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockCharacterWithStats, error: null })
          }))
        }))
      });

      const result = await characterService.getCharacterByUserId(mockUserId);

      expect(result).toEqual({
        id: mockCharacterId,
        userId: mockUserId,
        name: 'Test Hero',
        level: 5,
        totalXP: 500,
        currentXP: 50,
        avatarConfig: mockAvatarConfig,
        stats: {
          intelligence: 15,
          vitality: 12,
          wisdom: 13,
          charisma: 10,
          dexterity: 10,
          creativity: 10,
          availablePoints: 3
        },
        specialization: 'scholar',
        equippedItems: [],
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      });
    });

    it('should return null when character not found', async () => {
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ 
              data: null, 
              error: { code: 'PGRST116' } // No rows returned
            })
          }))
        }))
      });

      const result = await characterService.getCharacterByUserId(mockUserId);
      expect(result).toBeNull();
    });
  });

  describe('updateAvatarConfig', () => {
    it('should update avatar configuration', async () => {
      const newAvatarConfig: AvatarConfig = {
        ...mockAvatarConfig,
        hairColor: 'blonde'
      };

      (supabase.from as any).mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null })
        }))
      });

      await expect(
        characterService.updateAvatarConfig(mockCharacterId, newAvatarConfig)
      ).resolves.not.toThrow();
    });

    it('should handle update errors', async () => {
      (supabase.from as any).mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: new Error('Update failed') })
        }))
      });

      await expect(
        characterService.updateAvatarConfig(mockCharacterId, mockAvatarConfig)
      ).rejects.toThrow('Failed to update avatar configuration');
    });
  });

  describe('updateSpecialization', () => {
    it('should update character specialization', async () => {
      (supabase.from as any).mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null })
        }))
      });

      await expect(
        characterService.updateSpecialization(mockCharacterId, 'scholar')
      ).resolves.not.toThrow();
    });
  });

  describe('allocateStatPoints', () => {
    it('should allocate stat points using Supabase function', async () => {
      (supabase.rpc as any).mockResolvedValue({ data: true, error: null });

      const statAllocations = {
        intelligence: 2,
        vitality: 1
      };

      const result = await characterService.allocateStatPoints(mockCharacterId, statAllocations);

      expect(result).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith('allocate_stat_points', {
        character_uuid: mockCharacterId,
        intelligence_points: 2,
        vitality_points: 1,
        wisdom_points: 0,
        charisma_points: 0,
        dexterity_points: 0,
        creativity_points: 0
      });
    });

    it('should handle stat allocation errors', async () => {
      (supabase.rpc as any).mockResolvedValue({ data: null, error: new Error('RPC failed') });

      await expect(
        characterService.allocateStatPoints(mockCharacterId, { intelligence: 1 })
      ).rejects.toThrow('Failed to allocate stat points');
    });
  });
});