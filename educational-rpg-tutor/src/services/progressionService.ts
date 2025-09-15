import { supabase } from './supabaseClient';
import type { CharacterStats } from '../types/character';

export interface XPRewardCalculation {
  baseXP: number;
  accuracyBonus: number;
  timeBonus: number;
  statBonus: number;
  totalXP: number;
}

export interface LevelUpResult {
  newLevel: number;
  newCurrentXP: number;
  statPointsAwarded: number;
  leveledUp: boolean;
}

export class ProgressionService {
  /**
   * Calculates XP required for a specific level
   * Level 1-10: 100 XP per level (linear)
   * Level 11-25: 150 XP per level 
   * Level 26+: 200 XP per level
   */
  calculateXPForLevel(level: number): number {
    if (level <= 1) return 0;
    
    let totalXP = 0;
    
    // Levels 1-10: 100 XP each
    const level10XP = Math.min(level - 1, 10) * 100;
    totalXP += level10XP;
    
    if (level > 11) {
      // Levels 11-25: 150 XP each
      const level25XP = Math.min(level - 11, 15) * 150;
      totalXP += level25XP;
    }
    
    if (level > 26) {
      // Levels 26+: 200 XP each
      const higherLevelXP = (level - 26) * 200;
      totalXP += higherLevelXP;
    }
    
    return totalXP;
  }

  /**
   * Calculates current level from total XP
   */
  calculateLevelFromXP(totalXP: number): number {
    if (totalXP < 100) return 1;
    
    let level = 1;
    let xpThreshold = 0;
    
    // Check levels 1-10 (100 XP each)
    while (level <= 10 && totalXP >= xpThreshold + 100) {
      xpThreshold += 100;
      level++;
    }
    
    // Check levels 11-25 (150 XP each)
    while (level <= 25 && totalXP >= xpThreshold + 150) {
      xpThreshold += 150;
      level++;
    }
    
    // Check levels 26+ (200 XP each)
    while (totalXP >= xpThreshold + 200) {
      xpThreshold += 200;
      level++;
    }
    
    return level;
  }

  /**
   * Calculates current XP within the current level
   */
  calculateCurrentXP(totalXP: number, level: number): number {
    const xpForCurrentLevel = this.calculateXPForLevel(level);
    return totalXP - xpForCurrentLevel;
  }

  /**
   * Calculates XP needed for next level
   */
  calculateXPForNextLevel(level: number): number {
    if (level <= 10) return 100;
    if (level <= 25) return 150;
    return 200;
  }

  /**
   * Calculates XP reward based on question difficulty, accuracy, time, and character stats
   */
  calculateXPReward(
    baseDifficulty: number,
    accuracy: number,
    timeBonus: number,
    relevantStats: { primary: number; secondary?: number }
  ): XPRewardCalculation {
    const baseXP = baseDifficulty * 10;
    const accuracyBonus = accuracy * 0.5 * baseXP;
    const timeBonusXP = timeBonus * 0.3 * baseXP;
    
    // Stat bonus calculation: higher relevant stats provide XP multiplier
    const primaryStatBonus = (relevantStats.primary - 10) * 0.02; // 2% per point above 10
    const secondaryStatBonus = relevantStats.secondary 
      ? (relevantStats.secondary - 10) * 0.01 // 1% per point above 10
      : 0;
    const statMultiplier = 1 + primaryStatBonus + secondaryStatBonus;
    const statBonus = (baseXP + accuracyBonus + timeBonusXP) * (statMultiplier - 1);
    
    const totalXP = Math.floor(baseXP + accuracyBonus + timeBonusXP + statBonus);
    
    return {
      baseXP: Math.floor(baseXP),
      accuracyBonus: Math.floor(accuracyBonus),
      timeBonus: Math.floor(timeBonusXP),
      statBonus: Math.floor(statBonus),
      totalXP
    };
  }

  /**
   * Awards XP to a character and handles level-up logic
   */
  async awardXP(characterId: string, xpAmount: number): Promise<LevelUpResult> {
    try {
      // Get current character data
      const { data: characterData, error: fetchError } = await supabase
        .from('characters')
        .select('level, total_xp, current_xp')
        .eq('id', characterId)
        .single();

      if (fetchError) throw fetchError;

      const newTotalXP = characterData.total_xp + xpAmount;
      const newLevel = this.calculateLevelFromXP(newTotalXP);
      const newCurrentXP = this.calculateCurrentXP(newTotalXP, newLevel);
      
      const leveledUp = newLevel > characterData.level;
      const levelsGained = newLevel - characterData.level;
      const statPointsAwarded = leveledUp ? levelsGained * 3 : 0; // 3 stat points per level

      // Update character XP and level
      const { error: updateError } = await supabase
        .from('characters')
        .update({
          level: newLevel,
          total_xp: newTotalXP,
          current_xp: newCurrentXP,
          updated_at: new Date().toISOString()
        })
        .eq('id', characterId);

      if (updateError) throw updateError;

      // Award stat points if leveled up
      if (leveledUp && statPointsAwarded > 0) {
        const { error: statsError } = await supabase
          .from('character_stats')
          .update({
            available_points: supabase.raw(`available_points + ${statPointsAwarded}`),
            updated_at: new Date().toISOString()
          })
          .eq('character_id', characterId);

        if (statsError) throw statsError;
      }

      return {
        newLevel,
        newCurrentXP,
        statPointsAwarded,
        leveledUp
      };
    } catch (error) {
      console.error('Error awarding XP:', error);
      throw new Error('Failed to award XP');
    }
  }

  /**
   * Gets stat bonuses based on specialization
   */
  getSpecializationBonuses(specialization: string): Partial<CharacterStats> {
    const bonuses: Record<string, Partial<CharacterStats>> = {
      scholar: { intelligence: 2, wisdom: 1 },
      explorer: { dexterity: 2, vitality: 1 },
      guardian: { vitality: 2, charisma: 1 },
      artist: { creativity: 2, charisma: 1 },
      diplomat: { charisma: 2, wisdom: 1 },
      inventor: { intelligence: 1, creativity: 1, dexterity: 1 }
    };

    return bonuses[specialization] || {};
  }

  /**
   * Calculates effective stats including specialization bonuses
   */
  calculateEffectiveStats(
    baseStats: CharacterStats, 
    specialization?: string
  ): CharacterStats {
    if (!specialization) return baseStats;

    const bonuses = this.getSpecializationBonuses(specialization);
    
    return {
      intelligence: baseStats.intelligence + (bonuses.intelligence || 0),
      vitality: baseStats.vitality + (bonuses.vitality || 0),
      wisdom: baseStats.wisdom + (bonuses.wisdom || 0),
      charisma: baseStats.charisma + (bonuses.charisma || 0),
      dexterity: baseStats.dexterity + (bonuses.dexterity || 0),
      creativity: baseStats.creativity + (bonuses.creativity || 0),
      availablePoints: baseStats.availablePoints
    };
  }
}

export const progressionService = new ProgressionService();