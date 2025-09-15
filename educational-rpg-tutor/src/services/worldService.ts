import { supabase } from './supabaseClient';
import type { 
  LearningWorld, 
  WorldProgress
} from '../types/world';
import { LEARNING_WORLDS } from '../types/world';
import type { Character } from '../types/character';
import type { UserProgress } from '../types';

export class WorldService {
  /**
   * Get all available learning worlds for a user
   */
  async getUserWorlds(userId: string): Promise<LearningWorld[]> {
    try {
      // Get user's character and progress
      const [character, userProgress] = await Promise.all([
        this.getUserCharacter(userId),
        this.getUserProgress(userId)
      ]);

      if (!character) {
        throw new Error('Character not found');
      }

      // Get world progress data
      const { data: worldProgressData, error: progressError } = await supabase
        .from('world_progress')
        .select('*')
        .eq('user_id', userId);

      if (progressError) {
        console.error('Error fetching world progress:', progressError);
      }

      const worldProgressMap = new Map(
        (worldProgressData || []).map(wp => [wp.world_id, wp])
      );

      // Build learning worlds with unlock status
      const worlds: LearningWorld[] = [];
      
      for (const [worldId, worldConfig] of Object.entries(LEARNING_WORLDS)) {
        const subjectProgress = userProgress.find(up => 
          up.subject_name.toLowerCase().replace(/\s+/g, '-') === worldConfig.subjectId
        );

        const isUnlocked = this.checkWorldUnlocked(
          worldConfig.unlockRequirements,
          character,
          subjectProgress
        );

        const worldProgress = worldProgressMap.get(worldId);
        const completionPercentage = this.calculateCompletionPercentage(worldProgress);

        // Get available quests for this world
        const availableQuests = await this.getWorldQuests(worldId, userId);

        worlds.push({
          id: worldId,
          ...worldConfig,
          isUnlocked,
          completionPercentage,
          availableQuests: availableQuests.map(q => q.id)
        });
      }

      return worlds.sort((a, b) => {
        // Sort by unlock status first, then by required level
        if (a.isUnlocked !== b.isUnlocked) {
          return a.isUnlocked ? -1 : 1;
        }
        return a.unlockRequirements.minimumLevel - b.unlockRequirements.minimumLevel;
      });

    } catch (error) {
      console.error('Error getting user worlds:', error);
      throw error;
    }
  }

  /**
   * Unlock a world for a user
   */
  async unlockWorld(userId: string, worldId: string): Promise<boolean> {
    try {
      const worlds = await this.getUserWorlds(userId);
      const world = worlds.find(w => w.id === worldId);

      if (!world) {
        throw new Error('World not found');
      }

      if (world.isUnlocked) {
        return true; // Already unlocked
      }

      // Check if requirements are met
      const character = await this.getUserCharacter(userId);
      const userProgress = await this.getUserProgress(userId);
      const subjectProgress = userProgress.find(up => 
        up.subject_name.toLowerCase().replace(/\s+/g, '-') === world.subjectId
      );

      if (!this.checkWorldUnlocked(world.unlockRequirements, character, subjectProgress)) {
        return false; // Requirements not met
      }

      // Create world progress record
      const { error } = await supabase
        .from('world_progress')
        .insert({
          world_id: worldId,
          user_id: userId,
          unlocked_at: new Date().toISOString(),
          quests_completed: 0,
          total_quests: 0,
          time_spent: 0,
          last_visited: new Date().toISOString()
        });

      if (error) {
        console.error('Error unlocking world:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error unlocking world:', error);
      return false;
    }
  }

  /**
   * Update world progress when user visits or completes activities
   */
  async updateWorldProgress(
    userId: string, 
    worldId: string, 
    updates: Partial<Pick<WorldProgress, 'timeSpent' | 'questsCompleted' | 'favoriteRating'>>
  ): Promise<void> {
    try {
      const updateData: any = {
        last_visited: new Date().toISOString()
      };

      if (updates.timeSpent !== undefined) {
        updateData.time_spent = updates.timeSpent;
      }
      if (updates.questsCompleted !== undefined) {
        updateData.quests_completed = updates.questsCompleted;
      }
      if (updates.favoriteRating !== undefined) {
        updateData.favorite_rating = updates.favoriteRating;
      }

      const { error } = await supabase
        .from('world_progress')
        .upsert({
          world_id: worldId,
          user_id: userId,
          ...updateData
        });

      if (error) {
        console.error('Error updating world progress:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating world progress:', error);
      throw error;
    }
  }

  /**
   * Get world-specific quests
   */
  async getWorldQuests(worldId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_quests')
        .select(`
          *,
          quest:quests(*)
        `)
        .eq('user_id', userId)
        .eq('quest.world_id', worldId)
        .eq('completed', false);

      if (error) {
        console.error('Error fetching world quests:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching world quests:', error);
      return [];
    }
  }

  /**
   * Get recommended next world for user
   */
  async getRecommendedWorld(userId: string): Promise<string | null> {
    try {
      const worlds = await this.getUserWorlds(userId);
      const unlockedWorlds = worlds.filter(w => w.isUnlocked);
      const lockedWorlds = worlds.filter(w => !w.isUnlocked);

      // If user has unlocked worlds with low completion, recommend those first
      const incompleteWorlds = unlockedWorlds.filter(w => w.completionPercentage < 80);
      if (incompleteWorlds.length > 0) {
        return incompleteWorlds[0].id;
      }

      // Otherwise, recommend the next world they can unlock
      if (lockedWorlds.length > 0) {
        return lockedWorlds[0].id;
      }

      // If all worlds are unlocked and mostly complete, recommend the least complete one
      if (unlockedWorlds.length > 0) {
        const leastComplete = unlockedWorlds.reduce((min, world) => 
          world.completionPercentage < min.completionPercentage ? world : min
        );
        return leastComplete.id;
      }

      return null;
    } catch (error) {
      console.error('Error getting recommended world:', error);
      return null;
    }
  }

  /**
   * Private helper methods
   */
  private async getUserCharacter(userId: string): Promise<Character | null> {
    const { data, error } = await supabase
      .from('characters')
      .select(`
        *,
        character_stats(*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching character:', error);
      return null;
    }

    return data;
  }

  private async getUserProgress(userId: string): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        subject:subjects(name)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user progress:', error);
      return [];
    }

    return data?.map(up => ({
      ...up,
      subject_name: up.subject.name
    })) || [];
  }

  private checkWorldUnlocked(
    requirements: any,
    character: Character | null,
    subjectProgress: any
  ): boolean {
    if (!character) return false;

    // Check minimum level
    if (character.level < requirements.minimumLevel) {
      return false;
    }

    // Check required subject XP
    if (requirements.requiredSubjectXP > 0) {
      const subjectXP = subjectProgress?.total_xp_earned || 0;
      if (subjectXP < requirements.requiredSubjectXP) {
        return false;
      }
    }

    // TODO: Check prerequisite worlds and achievements when implemented

    return true;
  }

  private calculateCompletionPercentage(worldProgress: any): number {
    if (!worldProgress || worldProgress.total_quests === 0) {
      return 0;
    }

    return Math.round((worldProgress.quests_completed / worldProgress.total_quests) * 100);
  }
}

export const worldService = new WorldService();