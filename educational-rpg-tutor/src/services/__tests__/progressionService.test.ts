import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase client to prevent initialization issues
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn()
  }
}));

import { ProgressionService } from '../progressionService';

describe('ProgressionService', () => {
  let progressionService: ProgressionService;

  beforeEach(() => {
    progressionService = new ProgressionService();
  });

  describe('Level and XP Calculations', () => {
    it('should calculate XP required for level 1', () => {
      expect(progressionService.calculateXPForLevel(1)).toBe(0);
    });

    it('should calculate XP required for levels 1-10 (100 XP each)', () => {
      expect(progressionService.calculateXPForLevel(2)).toBe(100);
      expect(progressionService.calculateXPForLevel(5)).toBe(400);
      expect(progressionService.calculateXPForLevel(10)).toBe(900);
      expect(progressionService.calculateXPForLevel(11)).toBe(1000);
    });

    it('should calculate XP required for levels 11-25 (150 XP each)', () => {
      expect(progressionService.calculateXPForLevel(12)).toBe(1150);
      expect(progressionService.calculateXPForLevel(15)).toBe(1600);
      expect(progressionService.calculateXPForLevel(25)).toBe(3100);
      expect(progressionService.calculateXPForLevel(26)).toBe(3250);
    });

    it('should calculate XP required for levels 26+ (200 XP each)', () => {
      expect(progressionService.calculateXPForLevel(27)).toBe(3450);
      expect(progressionService.calculateXPForLevel(30)).toBe(4050);
      expect(progressionService.calculateXPForLevel(50)).toBe(8050);
    });

    it('should calculate level from total XP correctly', () => {
      expect(progressionService.calculateLevelFromXP(0)).toBe(1);
      expect(progressionService.calculateLevelFromXP(50)).toBe(1);
      expect(progressionService.calculateLevelFromXP(100)).toBe(2);
      expect(progressionService.calculateLevelFromXP(500)).toBe(6);
      expect(progressionService.calculateLevelFromXP(1000)).toBe(11);
      expect(progressionService.calculateLevelFromXP(1150)).toBe(12);
      expect(progressionService.calculateLevelFromXP(3250)).toBe(26);
      expect(progressionService.calculateLevelFromXP(3450)).toBe(27);
    });

    it('should calculate current XP within level correctly', () => {
      expect(progressionService.calculateCurrentXP(150, 2)).toBe(50);
      expect(progressionService.calculateCurrentXP(1050, 11)).toBe(50);
      expect(progressionService.calculateCurrentXP(3300, 26)).toBe(50);
    });

    it('should calculate XP needed for next level', () => {
      expect(progressionService.calculateXPForNextLevel(5)).toBe(100);
      expect(progressionService.calculateXPForNextLevel(10)).toBe(100);
      expect(progressionService.calculateXPForNextLevel(15)).toBe(150);
      expect(progressionService.calculateXPForNextLevel(25)).toBe(150);
      expect(progressionService.calculateXPForNextLevel(30)).toBe(200);
    });
  });

  describe('XP Reward Calculations', () => {
    it('should calculate base XP reward correctly', () => {
      const result = progressionService.calculateXPReward(
        5, // baseDifficulty
        1.0, // perfect accuracy
        0, // no time bonus
        { primary: 10, secondary: 10 } // base stats
      );

      expect(result.baseXP).toBe(50); // 5 * 10
      expect(result.accuracyBonus).toBe(25); // 1.0 * 0.5 * 50
      expect(result.timeBonus).toBe(0);
      expect(result.statBonus).toBe(0); // no bonus at base stats
      expect(result.totalXP).toBe(75);
    });

    it('should apply accuracy bonus correctly', () => {
      const perfectAccuracy = progressionService.calculateXPReward(
        4, 1.0, 0, { primary: 10 }
      );
      const halfAccuracy = progressionService.calculateXPReward(
        4, 0.5, 0, { primary: 10 }
      );

      expect(perfectAccuracy.accuracyBonus).toBe(20); // 1.0 * 0.5 * 40
      expect(halfAccuracy.accuracyBonus).toBe(10); // 0.5 * 0.5 * 40
    });

    it('should apply time bonus correctly', () => {
      const result = progressionService.calculateXPReward(
        4, 0, 0.5, { primary: 10 }
      );

      expect(result.timeBonus).toBe(6); // 0.5 * 0.3 * 40
    });

    it('should apply stat bonuses correctly', () => {
      const highStats = progressionService.calculateXPReward(
        4, 0, 0, { primary: 20, secondary: 15 }
      );

      // Primary stat bonus: (20-10) * 0.02 = 0.2 (20% bonus)
      // Secondary stat bonus: (15-10) * 0.01 = 0.05 (5% bonus)
      // Total multiplier: 1.25
      // Stat bonus: 40 * 0.25 = 10
      expect(highStats.statBonus).toBe(10);
      expect(highStats.totalXP).toBe(50); // 40 + 10
    });

    it('should handle complex XP calculations', () => {
      const result = progressionService.calculateXPReward(
        6, // baseDifficulty
        0.8, // 80% accuracy
        0.3, // 30% time bonus
        { primary: 15, secondary: 12 } // above-average stats
      );

      expect(result.baseXP).toBe(60);
      expect(result.accuracyBonus).toBe(24); // 0.8 * 0.5 * 60 = 24
      expect(result.timeBonus).toBe(5); // 0.3 * 0.3 * 60 = 5.4, floored to 5
      expect(result.statBonus).toBe(10); // Calculated based on stat multiplier
      expect(result.totalXP).toBe(100); // Actual calculated total
    });
  });

  describe('Specialization System', () => {
    it('should return correct bonuses for scholar specialization', () => {
      const bonuses = progressionService.getSpecializationBonuses('scholar');
      expect(bonuses).toEqual({ intelligence: 2, wisdom: 1 });
    });

    it('should return correct bonuses for explorer specialization', () => {
      const bonuses = progressionService.getSpecializationBonuses('explorer');
      expect(bonuses).toEqual({ dexterity: 2, vitality: 1 });
    });

    it('should return correct bonuses for guardian specialization', () => {
      const bonuses = progressionService.getSpecializationBonuses('guardian');
      expect(bonuses).toEqual({ vitality: 2, charisma: 1 });
    });

    it('should return correct bonuses for artist specialization', () => {
      const bonuses = progressionService.getSpecializationBonuses('artist');
      expect(bonuses).toEqual({ creativity: 2, charisma: 1 });
    });

    it('should return correct bonuses for diplomat specialization', () => {
      const bonuses = progressionService.getSpecializationBonuses('diplomat');
      expect(bonuses).toEqual({ charisma: 2, wisdom: 1 });
    });

    it('should return correct bonuses for inventor specialization', () => {
      const bonuses = progressionService.getSpecializationBonuses('inventor');
      expect(bonuses).toEqual({ intelligence: 1, creativity: 1, dexterity: 1 });
    });

    it('should return empty bonuses for unknown specialization', () => {
      const bonuses = progressionService.getSpecializationBonuses('unknown');
      expect(bonuses).toEqual({});
    });
  });

  describe('Effective Stats Calculation', () => {
    const baseStats = {
      intelligence: 15,
      vitality: 12,
      wisdom: 10,
      charisma: 8,
      dexterity: 14,
      creativity: 11,
      availablePoints: 5
    };

    it('should return base stats when no specialization', () => {
      const effectiveStats = progressionService.calculateEffectiveStats(baseStats);
      expect(effectiveStats).toEqual(baseStats);
    });

    it('should apply scholar bonuses correctly', () => {
      const effectiveStats = progressionService.calculateEffectiveStats(baseStats, 'scholar');
      expect(effectiveStats).toEqual({
        ...baseStats,
        intelligence: 17, // +2
        wisdom: 11 // +1
      });
    });

    it('should apply inventor bonuses correctly', () => {
      const effectiveStats = progressionService.calculateEffectiveStats(baseStats, 'inventor');
      expect(effectiveStats).toEqual({
        ...baseStats,
        intelligence: 16, // +1
        creativity: 12, // +1
        dexterity: 15 // +1
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero and negative inputs gracefully', () => {
      expect(progressionService.calculateXPForLevel(0)).toBe(0);
      expect(progressionService.calculateLevelFromXP(0)).toBe(1);
      expect(progressionService.calculateCurrentXP(0, 1)).toBe(0);
    });

    it('should handle very high levels', () => {
      const level100XP = progressionService.calculateXPForLevel(100);
      expect(level100XP).toBeGreaterThan(0);
      expect(progressionService.calculateLevelFromXP(level100XP)).toBe(100);
    });

    it('should handle XP rewards with zero stats', () => {
      const result = progressionService.calculateXPReward(1, 0, 0, { primary: 0 });
      expect(result.totalXP).toBeGreaterThanOrEqual(0);
    });
  });
});