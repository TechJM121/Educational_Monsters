import { supabase } from './supabaseClient';
import type { 
  Character, 
  CharacterStats, 
  AvatarConfig, 
  Specialization 
} from '../types/character';

export class CharacterService {
  /**
   * Creates a new character for a user with default stats and avatar
   */
  async createCharacter(
    userId: string, 
    name: string, 
    avatarConfig: AvatarConfig,
    isGuestCharacter: boolean = false
  ): Promise<Character> {
    try {
      // Create character record
      const { data: characterData, error: characterError } = await supabase
        .from('characters')
        .insert({
          user_id: userId,
          name,
          avatar_config: avatarConfig,
          level: 1,
          total_xp: 0,
          current_xp: 0,
          specialization: null
        })
        .select()
        .single();

      if (characterError) throw characterError;

      // Create initial character stats
      const initialStats: Omit<CharacterStats, 'availablePoints'> = {
        intelligence: 10,
        vitality: 10,
        wisdom: 10,
        charisma: 10,
        dexterity: 10,
        creativity: 10
      };

      const { data: statsData, error: statsError } = await supabase
        .from('character_stats')
        .insert({
          character_id: characterData.id,
          ...initialStats,
          available_points: 0
        })
        .select()
        .single();

      if (statsError) throw statsError;

      return {
        id: characterData.id,
        userId: characterData.user_id,
        name: characterData.name,
        level: characterData.level,
        totalXP: characterData.total_xp,
        currentXP: characterData.current_xp,
        avatarConfig: characterData.avatar_config,
        stats: {
          intelligence: statsData.intelligence,
          vitality: statsData.vitality,
          wisdom: statsData.wisdom,
          charisma: statsData.charisma,
          dexterity: statsData.dexterity,
          creativity: statsData.creativity,
          availablePoints: statsData.available_points
        },
        specialization: characterData.specialization as Specialization,
        equippedItems: [],
        isGuestCharacter,
        createdAt: new Date(characterData.created_at),
        updatedAt: new Date(characterData.updated_at)
      };
    } catch (error) {
      console.error('Error creating character:', error);
      throw new Error('Failed to create character');
    }
  }

  /**
   * Retrieves a character by user ID
   */
  async getCharacterByUserId(userId: string): Promise<Character | null> {
    try {
      const { data: characterData, error: characterError } = await supabase
        .from('characters')
        .select(`
          *,
          character_stats (*)
        `)
        .eq('user_id', userId)
        .single();

      if (characterError) {
        if (characterError.code === 'PGRST116') return null; // No character found
        throw characterError;
      }

      const stats = characterData.character_stats[0];

      return {
        id: characterData.id,
        userId: characterData.user_id,
        name: characterData.name,
        level: characterData.level,
        totalXP: characterData.total_xp,
        currentXP: characterData.current_xp,
        avatarConfig: characterData.avatar_config,
        stats: {
          intelligence: stats.intelligence,
          vitality: stats.vitality,
          wisdom: stats.wisdom,
          charisma: stats.charisma,
          dexterity: stats.dexterity,
          creativity: stats.creativity,
          availablePoints: stats.available_points
        },
        specialization: characterData.specialization as Specialization,
        equippedItems: [], // TODO: Implement equipped items in future task
        isGuestCharacter: false, // Database characters are not guest characters
        createdAt: new Date(characterData.created_at),
        updatedAt: new Date(characterData.updated_at)
      };
    } catch (error) {
      console.error('Error fetching character:', error);
      throw new Error('Failed to fetch character');
    }
  }

  /**
   * Updates character avatar configuration
   */
  async updateAvatarConfig(characterId: string, avatarConfig: AvatarConfig): Promise<void> {
    try {
      const { error } = await supabase
        .from('characters')
        .update({ 
          avatar_config: avatarConfig,
          updated_at: new Date().toISOString()
        })
        .eq('id', characterId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating avatar config:', error);
      throw new Error('Failed to update avatar configuration');
    }
  }

  /**
   * Updates character specialization
   */
  async updateSpecialization(characterId: string, specialization: Specialization): Promise<void> {
    try {
      const { error } = await supabase
        .from('characters')
        .update({ 
          specialization,
          updated_at: new Date().toISOString()
        })
        .eq('id', characterId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating specialization:', error);
      throw new Error('Failed to update character specialization');
    }
  }

  /**
   * Allocates stat points using Supabase function
   */
  async allocateStatPoints(
    characterId: string, 
    statAllocations: Partial<Omit<CharacterStats, 'availablePoints'>>
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('allocate_stat_points', {
        character_uuid: characterId,
        intelligence_points: statAllocations.intelligence || 0,
        vitality_points: statAllocations.vitality || 0,
        wisdom_points: statAllocations.wisdom || 0,
        charisma_points: statAllocations.charisma || 0,
        dexterity_points: statAllocations.dexterity || 0,
        creativity_points: statAllocations.creativity || 0
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error allocating stat points:', error);
      throw new Error('Failed to allocate stat points');
    }
  }

  /**
   * Updates character equipped items
   */
  async updateEquippedItems(characterId: string, equippedItems: any[]): Promise<void> {
    try {
      // TODO: Implement when equipment tables are created
      // For now, this is a placeholder
      console.log('Equipment update not yet implemented in database');
    } catch (error) {
      console.error('Error updating equipped items:', error);
      throw new Error('Failed to update equipped items');
    }
  }

  /**
   * Resets character stats and allows redistribution
   */
  async respecCharacter(
    characterId: string, 
    newStats: Partial<Omit<CharacterStats, 'availablePoints'>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('character_stats')
        .update({
          intelligence: newStats.intelligence || 10,
          vitality: newStats.vitality || 10,
          wisdom: newStats.wisdom || 10,
          charisma: newStats.charisma || 10,
          dexterity: newStats.dexterity || 10,
          creativity: newStats.creativity || 10,
          available_points: 0
        })
        .eq('character_id', characterId);

      if (error) throw error;
    } catch (error) {
      console.error('Error respeccing character:', error);
      throw new Error('Failed to respec character');
    }
  }
}

export const characterService = new CharacterService();