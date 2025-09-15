import { useState, useCallback } from 'react';
import { characterService } from '../services/characterService';
import type { Character, AvatarConfig, Specialization, CharacterStats } from '../types/character';

interface StatChange {
  stat: string;
  oldValue: number;
  newValue: number;
  icon: string;
}

interface EquipmentChange {
  type: 'equipped' | 'unequipped';
  itemName: string;
  itemIcon: string;
  slot: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

interface UseCharacterCustomizationOptions {
  character: Character;
  onCharacterUpdate?: (character: Character) => void;
  onStatChange?: (changes: StatChange[]) => void;
  onEquipmentChange?: (change: EquipmentChange) => void;
}

export function useCharacterCustomization({
  character,
  onCharacterUpdate,
  onStatChange,
  onEquipmentChange
}: UseCharacterCustomizationOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvatar = useCallback(async (avatarConfig: AvatarConfig) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await characterService.updateAvatarConfig(character.id, avatarConfig);
      
      const updatedCharacter: Character = {
        ...character,
        avatarConfig,
        updatedAt: new Date()
      };
      
      onCharacterUpdate?.(updatedCharacter);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update avatar';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [character, onCharacterUpdate]);

  const allocateStats = useCallback(async (
    allocations: Partial<Omit<CharacterStats, 'availablePoints'>>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await characterService.allocateStatPoints(character.id, allocations);
      
      if (!success) {
        throw new Error('Failed to allocate stat points');
      }
      
      // Calculate new stats and track changes
      const totalAllocated = Object.values(allocations).reduce((sum, points) => sum + (points || 0), 0);
      const newStats: CharacterStats = {
        intelligence: character.stats.intelligence + (allocations.intelligence || 0),
        vitality: character.stats.vitality + (allocations.vitality || 0),
        wisdom: character.stats.wisdom + (allocations.wisdom || 0),
        charisma: character.stats.charisma + (allocations.charisma || 0),
        dexterity: character.stats.dexterity + (allocations.dexterity || 0),
        creativity: character.stats.creativity + (allocations.creativity || 0),
        availablePoints: character.stats.availablePoints - totalAllocated
      };

      // Create stat change animations
      const statIcons = {
        intelligence: '🧠',
        vitality: '❤️',
        wisdom: '📜',
        charisma: '💬',
        dexterity: '⚡',
        creativity: '🎨'
      };

      const changes: StatChange[] = Object.entries(allocations)
        .filter(([_, points]) => points && points > 0)
        .map(([stat, points]) => ({
          stat,
          oldValue: character.stats[stat as keyof Omit<CharacterStats, 'availablePoints'>] as number,
          newValue: newStats[stat as keyof Omit<CharacterStats, 'availablePoints'>] as number,
          icon: statIcons[stat as keyof typeof statIcons]
        }));

      if (changes.length > 0) {
        onStatChange?.(changes);
      }
      
      const updatedCharacter: Character = {
        ...character,
        stats: newStats,
        updatedAt: new Date()
      };
      
      onCharacterUpdate?.(updatedCharacter);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to allocate stat points';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [character, onCharacterUpdate]);

  const selectSpecialization = useCallback(async (specialization: Specialization) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await characterService.updateSpecialization(character.id, specialization);
      
      const updatedCharacter: Character = {
        ...character,
        specialization,
        updatedAt: new Date()
      };
      
      onCharacterUpdate?.(updatedCharacter);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update specialization';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [character, onCharacterUpdate]);

  const equipItem = useCallback(async (itemId: string, slot: string, itemName?: string, itemIcon?: string, rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Remove any existing item in this slot
      const newEquippedItems = character.equippedItems.filter(item => item.slot !== slot);
      
      // Add the new item
      newEquippedItems.push({
        id: `${character.id}-${itemId}`,
        itemId,
        slot: slot as any,
        equippedAt: new Date()
      });
      
      // Show equipment change animation
      if (itemName && itemIcon) {
        onEquipmentChange?({
          type: 'equipped',
          itemName,
          itemIcon,
          slot,
          rarity
        });
      }
      
      // TODO: Call actual service method when implemented
      // await characterService.updateEquippedItems(character.id, newEquippedItems);
      
      const updatedCharacter: Character = {
        ...character,
        equippedItems: newEquippedItems,
        updatedAt: new Date()
      };
      
      onCharacterUpdate?.(updatedCharacter);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to equip item';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [character, onCharacterUpdate, onEquipmentChange]);

  const unequipItem = useCallback(async (slot: string, itemName?: string, itemIcon?: string, rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newEquippedItems = character.equippedItems.filter(item => item.slot !== slot);
      
      // Show equipment change animation
      if (itemName && itemIcon) {
        onEquipmentChange?({
          type: 'unequipped',
          itemName,
          itemIcon,
          slot,
          rarity
        });
      }
      
      // TODO: Call actual service method when implemented
      // await characterService.updateEquippedItems(character.id, newEquippedItems);
      
      const updatedCharacter: Character = {
        ...character,
        equippedItems: newEquippedItems,
        updatedAt: new Date()
      };
      
      onCharacterUpdate?.(updatedCharacter);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unequip item';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [character, onCharacterUpdate, onEquipmentChange]);

  const respecStats = useCallback(async (
    newStats: Partial<Omit<CharacterStats, 'availablePoints'>>
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement respec service method
      // await characterService.respecCharacter(character.id, newStats);
      
      const updatedStats: CharacterStats = {
        intelligence: newStats.intelligence || 10,
        vitality: newStats.vitality || 10,
        wisdom: newStats.wisdom || 10,
        charisma: newStats.charisma || 10,
        dexterity: newStats.dexterity || 10,
        creativity: newStats.creativity || 10,
        availablePoints: 0
      };
      
      const updatedCharacter: Character = {
        ...character,
        stats: updatedStats,
        updatedAt: new Date()
      };
      
      onCharacterUpdate?.(updatedCharacter);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to respec character';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [character, onCharacterUpdate]);

  const calculateEffectiveStats = useCallback((baseStats: CharacterStats): CharacterStats => {
    let effectiveStats = { ...baseStats };
    
    // Apply specialization bonuses
    if (character.specialization) {
      const bonusAmount = Math.floor(baseStats.intelligence * 0.15); // 15% bonus
      
      switch (character.specialization) {
        case 'scholar':
          effectiveStats.intelligence += bonusAmount;
          effectiveStats.wisdom += bonusAmount;
          break;
        case 'explorer':
          effectiveStats.dexterity += bonusAmount;
          effectiveStats.vitality += bonusAmount;
          break;
        case 'guardian':
          effectiveStats.vitality += bonusAmount;
          effectiveStats.charisma += bonusAmount;
          break;
        case 'artist':
          effectiveStats.creativity += bonusAmount;
          effectiveStats.charisma += bonusAmount;
          break;
        case 'diplomat':
          effectiveStats.charisma += bonusAmount;
          effectiveStats.wisdom += bonusAmount;
          break;
        case 'inventor':
          effectiveStats.intelligence += bonusAmount;
          effectiveStats.dexterity += bonusAmount;
          break;
      }
    }
    
    // TODO: Apply equipment bonuses when equipment system is fully implemented
    
    return effectiveStats;
  }, [character.specialization]);

  return {
    isLoading,
    error,
    updateAvatar,
    allocateStats,
    selectSpecialization,
    equipItem,
    unequipItem,
    respecStats,
    calculateEffectiveStats,
    clearError: () => setError(null)
  };
}