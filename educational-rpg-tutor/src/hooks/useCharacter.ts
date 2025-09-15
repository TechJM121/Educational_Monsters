import { useState, useEffect, useCallback } from 'react';
import { characterService } from '../services/characterService';
import { progressionService, type LevelUpResult } from '../services/progressionService';
import type { Character, AvatarConfig, Specialization, CharacterStats } from '../types/character';

interface UseCharacterReturn {
  character: Character | null;
  loading: boolean;
  error: string | null;
  createCharacter: (name: string, avatarConfig: AvatarConfig) => Promise<void>;
  updateAvatarConfig: (avatarConfig: AvatarConfig) => Promise<void>;
  updateSpecialization: (specialization: Specialization) => Promise<void>;
  allocateStatPoints: (statAllocations: Partial<Omit<CharacterStats, 'availablePoints'>>) => Promise<void>;
  awardXP: (xpAmount: number) => Promise<LevelUpResult>;
  refreshCharacter: () => Promise<void>;
}

export function useCharacter(userId: string | null): UseCharacterReturn {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCharacter = useCallback(async () => {
    if (!userId) {
      setCharacter(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const characterData = await characterService.getCharacterByUserId(userId);
      setCharacter(characterData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load character');
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  const createCharacter = useCallback(async (name: string, avatarConfig: AvatarConfig) => {
    if (!userId) throw new Error('User ID is required to create character');

    try {
      setLoading(true);
      setError(null);
      const newCharacter = await characterService.createCharacter(userId, name, avatarConfig);
      setCharacter(newCharacter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateAvatarConfig = useCallback(async (avatarConfig: AvatarConfig) => {
    if (!character) throw new Error('No character loaded');

    try {
      setError(null);
      await characterService.updateAvatarConfig(character.id, avatarConfig);
      setCharacter(prev => prev ? { ...prev, avatarConfig } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update avatar');
      throw err;
    }
  }, [character]);

  const updateSpecialization = useCallback(async (specialization: Specialization) => {
    if (!character) throw new Error('No character loaded');

    try {
      setError(null);
      await characterService.updateSpecialization(character.id, specialization);
      setCharacter(prev => prev ? { ...prev, specialization } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update specialization');
      throw err;
    }
  }, [character]);

  const allocateStatPoints = useCallback(async (
    statAllocations: Partial<Omit<CharacterStats, 'availablePoints'>>
  ) => {
    if (!character) throw new Error('No character loaded');

    try {
      setError(null);
      const success = await characterService.allocateStatPoints(character.id, statAllocations);
      
      if (success) {
        // Refresh character data to get updated stats
        await loadCharacter();
      } else {
        throw new Error('Failed to allocate stat points');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to allocate stat points');
      throw err;
    }
  }, [character, loadCharacter]);

  const awardXP = useCallback(async (xpAmount: number): Promise<LevelUpResult> => {
    if (!character) throw new Error('No character loaded');

    try {
      setError(null);
      const result = await progressionService.awardXP(character.id, xpAmount);
      
      // Update local character state with new values
      setCharacter(prev => prev ? {
        ...prev,
        level: result.newLevel,
        totalXP: prev.totalXP + xpAmount,
        currentXP: result.newCurrentXP,
        stats: {
          ...prev.stats,
          availablePoints: prev.stats.availablePoints + result.statPointsAwarded
        }
      } : null);

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to award XP');
      throw err;
    }
  }, [character]);

  const refreshCharacter = useCallback(async () => {
    await loadCharacter();
  }, [loadCharacter]);

  return {
    character,
    loading,
    error,
    createCharacter,
    updateAvatarConfig,
    updateSpecialization,
    allocateStatPoints,
    awardXP,
    refreshCharacter
  };
}