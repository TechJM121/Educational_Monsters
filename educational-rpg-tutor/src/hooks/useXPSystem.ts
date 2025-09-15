import { useMemo } from 'react';
import { progressionService, type XPRewardCalculation } from '../services/progressionService';
import type { CharacterStats } from '../types/character';

interface UseXPSystemReturn {
  calculateXPForLevel: (level: number) => number;
  calculateLevelFromXP: (totalXP: number) => number;
  calculateCurrentXP: (totalXP: number, level: number) => number;
  calculateXPForNextLevel: (level: number) => number;
  calculateXPReward: (
    baseDifficulty: number,
    accuracy: number,
    timeBonus: number,
    relevantStats: { primary: number; secondary?: number }
  ) => XPRewardCalculation;
  getProgressToNextLevel: (currentXP: number, level: number) => {
    current: number;
    required: number;
    percentage: number;
  };
  getSpecializationBonuses: (specialization: string) => Partial<CharacterStats>;
  calculateEffectiveStats: (baseStats: CharacterStats, specialization?: string) => CharacterStats;
}

export function useXPSystem(): UseXPSystemReturn {
  const xpSystem = useMemo(() => ({
    calculateXPForLevel: (level: number) => progressionService.calculateXPForLevel(level),
    
    calculateLevelFromXP: (totalXP: number) => progressionService.calculateLevelFromXP(totalXP),
    
    calculateCurrentXP: (totalXP: number, level: number) => 
      progressionService.calculateCurrentXP(totalXP, level),
    
    calculateXPForNextLevel: (level: number) => progressionService.calculateXPForNextLevel(level),
    
    calculateXPReward: (
      baseDifficulty: number,
      accuracy: number,
      timeBonus: number,
      relevantStats: { primary: number; secondary?: number }
    ) => progressionService.calculateXPReward(baseDifficulty, accuracy, timeBonus, relevantStats),
    
    getProgressToNextLevel: (currentXP: number, level: number) => {
      const required = progressionService.calculateXPForNextLevel(level);
      const percentage = Math.min((currentXP / required) * 100, 100);
      
      return {
        current: currentXP,
        required,
        percentage
      };
    },
    
    getSpecializationBonuses: (specialization: string) => 
      progressionService.getSpecializationBonuses(specialization),
    
    calculateEffectiveStats: (baseStats: CharacterStats, specialization?: string) =>
      progressionService.calculateEffectiveStats(baseStats, specialization)
  }), []);

  return xpSystem;
}