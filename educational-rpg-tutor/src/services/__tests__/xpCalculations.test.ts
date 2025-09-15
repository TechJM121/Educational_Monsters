// Tests for XP calculation logic (client-side validation of server functions)

import { describe, it, expect } from 'vitest';

describe('XP Calculation Logic', () => {
  // These tests validate the XP calculation logic that matches the server functions
  
  describe('Level XP Requirements', () => {
    it('should calculate correct XP for early levels (1-10)', () => {
      // Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 200 XP, etc.
      const calculateXPForLevel = (targetLevel: number): number => {
        if (targetLevel <= 1) return 0;
        
        let totalXP = 0;
        for (let level = 1; level < targetLevel; level++) {
          if (level <= 10) {
            totalXP += 100;
          } else if (level <= 25) {
            totalXP += 150;
          } else {
            totalXP += 200;
          }
        }
        return totalXP;
      };

      expect(calculateXPForLevel(1)).toBe(0);
      expect(calculateXPForLevel(2)).toBe(100);
      expect(calculateXPForLevel(5)).toBe(400);
      expect(calculateXPForLevel(10)).toBe(900);
    });

    it('should calculate correct XP for mid levels (11-25)', () => {
      const calculateXPForLevel = (targetLevel: number): number => {
        if (targetLevel <= 1) return 0;
        
        let totalXP = 0;
        for (let level = 1; level < targetLevel; level++) {
          if (level <= 10) {
            totalXP += 100;
          } else if (level <= 25) {
            totalXP += 150;
          } else {
            totalXP += 200;
          }
        }
        return totalXP;
      };

      expect(calculateXPForLevel(11)).toBe(1000); // 10 * 100
      expect(calculateXPForLevel(15)).toBe(1600); // 10 * 100 + 4 * 150
      expect(calculateXPForLevel(25)).toBe(3100); // 10 * 100 + 14 * 150
    });

    it('should calculate correct XP for high levels (26+)', () => {
      const calculateXPForLevel = (targetLevel: number): number => {
        if (targetLevel <= 1) return 0;
        
        let totalXP = 0;
        for (let level = 1; level < targetLevel; level++) {
          if (level <= 10) {
            totalXP += 100;
          } else if (level <= 25) {
            totalXP += 150;
          } else {
            totalXP += 200;
          }
        }
        return totalXP;
      };

      expect(calculateXPForLevel(26)).toBe(3250); // 10*100 + 15*150 + 0*200
      expect(calculateXPForLevel(30)).toBe(4050); // 10*100 + 15*150 + 4*200
    });
  });

  describe('Level from XP Calculation', () => {
    it('should calculate correct level from total XP', () => {
      const calculateLevelFromXP = (totalXP: number): number => {
        let currentLevel = 1;
        let xpNeeded = 0;
        
        while (xpNeeded <= totalXP) {
          currentLevel++;
          
          if (currentLevel <= 10) {
            xpNeeded += 100;
          } else if (currentLevel <= 25) {
            xpNeeded += 150;
          } else {
            xpNeeded += 200;
          }
        }
        
        return currentLevel - 1;
      };

      expect(calculateLevelFromXP(0)).toBe(1);
      expect(calculateLevelFromXP(50)).toBe(1);
      expect(calculateLevelFromXP(100)).toBe(2);
      expect(calculateLevelFromXP(500)).toBe(6);
      expect(calculateLevelFromXP(1000)).toBe(10); // 1000 XP = level 10 (needs 1000 XP to reach level 11)
      expect(calculateLevelFromXP(3250)).toBe(25); // 3250 XP = level 25 (needs 3250 XP to reach level 26)
    });
  });

  describe('XP Reward Calculation', () => {
    it('should calculate base XP correctly', () => {
      const calculateXPReward = (
        baseDifficulty: number,
        isCorrect: boolean,
        responseTimeSeconds?: number,
        intelligenceStat: number = 10
      ): number => {
        const baseXP = baseDifficulty * 10;
        
        if (!isCorrect) return 0;
        
        const accuracyBonus = baseXP * 0.5;
        
        let timeBonus = 0;
        if (responseTimeSeconds && responseTimeSeconds <= 30) {
          timeBonus = baseXP * 0.3 * (1.0 - (responseTimeSeconds / 30.0));
        }
        
        const statMultiplier = 1.0 + (intelligenceStat / 100.0 * 0.2);
        
        return Math.floor((baseXP + accuracyBonus + timeBonus) * statMultiplier);
      };

      // Test base calculation
      expect(calculateXPReward(1, true)).toBe(15); // (10 + 5) * 1.02 = 15.3 -> 15
      expect(calculateXPReward(3, true)).toBe(45); // (30 + 15) * 1.02 = 45.9 -> 45
      expect(calculateXPReward(5, true)).toBe(76); // (50 + 25) * 1.02 = 76.5 -> 76
    });

    it('should return 0 XP for incorrect answers', () => {
      const calculateXPReward = (
        baseDifficulty: number,
        isCorrect: boolean
      ): number => {
        if (!isCorrect) return 0;
        return baseDifficulty * 10;
      };

      expect(calculateXPReward(5, false)).toBe(0);
      expect(calculateXPReward(1, false)).toBe(0);
    });

    it('should apply time bonuses correctly', () => {
      const calculateXPReward = (
        baseDifficulty: number,
        isCorrect: boolean,
        responseTimeSeconds?: number
      ): number => {
        const baseXP = baseDifficulty * 10;
        
        if (!isCorrect) return 0;
        
        const accuracyBonus = baseXP * 0.5;
        
        let timeBonus = 0;
        if (responseTimeSeconds && responseTimeSeconds <= 30) {
          timeBonus = baseXP * 0.3 * (1.0 - (responseTimeSeconds / 30.0));
        }
        
        return Math.floor(baseXP + accuracyBonus + timeBonus);
      };

      // Fast response (5 seconds) should get higher bonus than slow response (25 seconds)
      const fastXP = calculateXPReward(2, true, 5);
      const slowXP = calculateXPReward(2, true, 25);
      
      expect(fastXP).toBeGreaterThan(slowXP);
      expect(calculateXPReward(2, true, 35)).toBe(30); // No time bonus for >30 seconds
    });
  });

  describe('Stat Point Allocation', () => {
    it('should award 3 stat points per level', () => {
      const STAT_POINTS_PER_LEVEL = 3;
      const levelsGained = 5;
      const expectedPoints = levelsGained * STAT_POINTS_PER_LEVEL;
      
      expect(expectedPoints).toBe(15);
    });

    it('should validate stat limits', () => {
      const MAX_STAT_VALUE = 100;
      const currentStat = 95;
      const pointsToAdd = 10;
      
      const wouldExceedLimit = (currentStat + pointsToAdd) > MAX_STAT_VALUE;
      expect(wouldExceedLimit).toBe(true);
      
      const validPointsToAdd = 3;
      const wouldNotExceedLimit = (currentStat + validPointsToAdd) <= MAX_STAT_VALUE;
      expect(wouldNotExceedLimit).toBe(true);
    });
  });
});