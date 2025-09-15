import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useCharacterCustomization } from '../useCharacterCustomization';
import { characterService } from '../../services/characterService';
import type { Character } from '../../types/character';

// Mock the character service
vi.mock('../../services/characterService', () => ({
  characterService: {
    updateAvatarConfig: vi.fn(),
    allocateStatPoints: vi.fn(),
    updateSpecialization: vi.fn(),
    respecCharacter: vi.fn()
  }
}));

const mockCharacter: Character = {
  id: '1',
  userId: 'user1',
  name: 'Test Hero',
  level: 10,
  totalXP: 2000,
  currentXP: 500,
  avatarConfig: {
    hairStyle: 'short',
    hairColor: 'brown',
    skinTone: 'medium',
    eyeColor: 'brown',
    outfit: 'casual',
    accessories: []
  },
  stats: {
    intelligence: 20,
    vitality: 15,
    wisdom: 12,
    charisma: 18,
    dexterity: 16,
    creativity: 14,
    availablePoints: 3
  },
  specialization: undefined,
  equippedItems: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

describe('useCharacterCustomization', () => {
  const mockOnCharacterUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateAvatar', () => {
    it('successfully updates avatar configuration', async () => {
      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: mockCharacter,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      const newAvatarConfig = {
        ...mockCharacter.avatarConfig,
        hairColor: 'blonde'
      };

      (characterService.updateAvatarConfig as any).mockResolvedValue(undefined);

      await act(async () => {
        await result.current.updateAvatar(newAvatarConfig);
      });

      expect(characterService.updateAvatarConfig).toHaveBeenCalledWith(
        mockCharacter.id,
        newAvatarConfig
      );
      expect(mockOnCharacterUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          avatarConfig: newAvatarConfig
        })
      );
      expect(result.current.error).toBeNull();
    });

    it('handles avatar update errors', async () => {
      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: mockCharacter,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      const error = new Error('Update failed');
      (characterService.updateAvatarConfig as any).mockRejectedValue(error);

      await act(async () => {
        try {
          await result.current.updateAvatar(mockCharacter.avatarConfig);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Update failed');
    });
  });

  describe('allocateStats', () => {
    it('successfully allocates stat points', async () => {
      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: mockCharacter,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      const allocations = { intelligence: 2, vitality: 1 };
      (characterService.allocateStatPoints as any).mockResolvedValue(true);

      await act(async () => {
        await result.current.allocateStats(allocations);
      });

      expect(characterService.allocateStatPoints).toHaveBeenCalledWith(
        mockCharacter.id,
        allocations
      );
      expect(mockOnCharacterUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          stats: expect.objectContaining({
            intelligence: 22,
            vitality: 16,
            availablePoints: 0
          })
        })
      );
    });

    it('handles stat allocation failure', async () => {
      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: mockCharacter,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      (characterService.allocateStatPoints as any).mockResolvedValue(false);

      await act(async () => {
        try {
          await result.current.allocateStats({ intelligence: 1 });
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Failed to allocate stat points');
    });
  });

  describe('selectSpecialization', () => {
    it('successfully updates specialization', async () => {
      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: mockCharacter,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      (characterService.updateSpecialization as any).mockResolvedValue(undefined);

      await act(async () => {
        await result.current.selectSpecialization('scholar');
      });

      expect(characterService.updateSpecialization).toHaveBeenCalledWith(
        mockCharacter.id,
        'scholar'
      );
      expect(mockOnCharacterUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          specialization: 'scholar'
        })
      );
    });

    it('handles specialization update errors', async () => {
      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: mockCharacter,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      const error = new Error('Specialization update failed');
      (characterService.updateSpecialization as any).mockRejectedValue(error);

      await act(async () => {
        try {
          await result.current.selectSpecialization('scholar');
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Specialization update failed');
    });
  });

  describe('equipItem', () => {
    it('successfully equips an item', async () => {
      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: mockCharacter,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      await act(async () => {
        await result.current.equipItem('sword-1', 'weapon');
      });

      expect(mockOnCharacterUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          equippedItems: expect.arrayContaining([
            expect.objectContaining({
              itemId: 'sword-1',
              slot: 'weapon'
            })
          ])
        })
      );
    });

    it('replaces existing item in same slot', async () => {
      const characterWithEquipment = {
        ...mockCharacter,
        equippedItems: [
          {
            id: 'equipped-1',
            itemId: 'old-sword',
            slot: 'weapon' as const,
            equippedAt: new Date()
          }
        ]
      };

      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: characterWithEquipment,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      await act(async () => {
        await result.current.equipItem('new-sword', 'weapon');
      });

      expect(mockOnCharacterUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          equippedItems: expect.arrayContaining([
            expect.objectContaining({
              itemId: 'new-sword',
              slot: 'weapon'
            })
          ])
        })
      );

      // Should not contain the old sword
      const updatedCharacter = mockOnCharacterUpdate.mock.calls[0][0];
      expect(updatedCharacter.equippedItems).not.toContainEqual(
        expect.objectContaining({ itemId: 'old-sword' })
      );
    });
  });

  describe('unequipItem', () => {
    it('successfully unequips an item', async () => {
      const characterWithEquipment = {
        ...mockCharacter,
        equippedItems: [
          {
            id: 'equipped-1',
            itemId: 'sword-1',
            slot: 'weapon' as const,
            equippedAt: new Date()
          }
        ]
      };

      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: characterWithEquipment,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      await act(async () => {
        await result.current.unequipItem('weapon');
      });

      expect(mockOnCharacterUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          equippedItems: []
        })
      );
    });
  });

  describe('calculateEffectiveStats', () => {
    it('applies specialization bonuses correctly', () => {
      const scholarCharacter = {
        ...mockCharacter,
        specialization: 'scholar' as const
      };

      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: scholarCharacter,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      const effectiveStats = result.current.calculateEffectiveStats(mockCharacter.stats);

      // Scholar should get 15% bonus to Intelligence and Wisdom
      const expectedIntBonus = Math.floor(mockCharacter.stats.intelligence * 0.15);
      expect(effectiveStats.intelligence).toBe(mockCharacter.stats.intelligence + expectedIntBonus);
      expect(effectiveStats.wisdom).toBe(mockCharacter.stats.wisdom + expectedIntBonus);
    });

    it('returns base stats when no specialization', () => {
      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: mockCharacter,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      const effectiveStats = result.current.calculateEffectiveStats(mockCharacter.stats);

      expect(effectiveStats).toEqual(mockCharacter.stats);
    });
  });

  describe('loading states', () => {
    it('sets loading state during operations', async () => {
      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: mockCharacter,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      (characterService.updateAvatarConfig as any).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      act(() => {
        result.current.updateAvatar(mockCharacter.avatarConfig);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('error handling', () => {
    it('clears error when clearError is called', async () => {
      const { result } = renderHook(() =>
        useCharacterCustomization({
          character: mockCharacter,
          onCharacterUpdate: mockOnCharacterUpdate
        })
      );

      const error = new Error('Test error');
      (characterService.updateAvatarConfig as any).mockRejectedValue(error);

      await act(async () => {
        try {
          await result.current.updateAvatar(mockCharacter.avatarConfig);
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});