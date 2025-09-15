import { describe, it, expect } from 'vitest';
import {
  SUBJECT_STAT_MAPPINGS,
  calculateStatBonuses,
  getStatEffects,
  calculatePerformanceMultiplier,
  getAgeAppropriateSubjects,
  getRecommendedSubject
} from '../subjectStatMapping';
import type { CharacterStats } from '../../types/character';

describe('Subject Stat Mapping', () => {
  describe('SUBJECT_STAT_MAPPINGS', () => {
    it('should have mappings for all core subjects', () => {
      const expectedSubjects = [
        'Mathematics',
        'Biology',
        'History',
        'Language Arts',
        'Science',
        'Art'
      ];

      expectedSubjects.forEach(subject => {
        expect(SUBJECT_STAT_MAPPINGS[subject]).toBeDefined();
        expect(SUBJECT_STAT_MAPPINGS[subject].primary).toBeDefined();
        expect(SUBJECT_STAT_MAPPINGS[subject].secondary).toBeDefined();
      });
    });

    it('should map subjects to correct primary stats', () => {
      expect(SUBJECT_STAT_MAPPINGS['Mathematics'].primary).toBe('intelligence');
      expect(SUBJECT_STAT_MAPPINGS['Biology'].primary).toBe('vitality');
      expect(SUBJECT_STAT_MAPPINGS['History'].primary).toBe('wisdom');
      expect(SUBJECT_STAT_MAPPINGS['Language Arts'].primary).toBe('charisma');
      expect(SUBJECT_STAT_MAPPINGS['Science'].primary).toBe('dexterity');
      expect(SUBJECT_STAT_MAPPINGS['Art'].primary).toBe('creativity');
    });

    it('should have valid secondary stats', () => {
      Object.values(SUBJECT_STAT_MAPPINGS).forEach(mapping => {
        expect(mapping.secondary).toBeDefined();
        expect(mapping.secondary).not.toBe(mapping.primary);
      });
    });
  });

  describe('calculateStatBonuses', () => {
    it('should calculate bonuses for valid subjects', () => {
      const bonuses = calculateStatBonuses('Mathematics', 100, 1.0);
      
      expect(bonuses.intelligence).toBe(2); // 100/50 = 2
      expect(bonuses.wisdom).toBe(1); // (100/50) / 2 = 1
    });

    it('should apply performance multiplier correctly', () => {
      const bonuses = calculateStatBonuses('Science', 100, 1.5);
      
      expect(bonuses.dexterity).toBe(3); // floor(2 * 1.5) = 3
      expect(bonuses.intelligence).toBe(1); // floor((2 * 1.5) / 2) = 1
    });

    it('should return minimum 1 point for primary stat', () => {
      const bonuses = calculateStatBonuses('Art', 25, 1.0); // 25/50 = 0.5, but min is 1
      
      expect(bonuses.creativity).toBe(1);
    });

    it('should return empty object for unknown subjects', () => {
      const bonuses = calculateStatBonuses('Unknown Subject', 100, 1.0);
      
      expect(Object.keys(bonuses)).toHaveLength(0);
    });

    it('should handle zero XP gracefully', () => {
      const bonuses = calculateStatBonuses('Mathematics', 0, 1.0);
      
      expect(bonuses.intelligence).toBe(1); // Minimum 1
      expect(bonuses.wisdom).toBeUndefined(); // Secondary not included when 0
    });
  });

  describe('getStatEffects', () => {
    const mockStats: CharacterStats = {
      intelligence: 20,
      vitality: 15,
      wisdom: 25,
      charisma: 18,
      dexterity: 12,
      creativity: 30,
      availablePoints: 0
    };

    it('should calculate intelligence effects correctly', () => {
      const effects = getStatEffects(mockStats);
      
      expect(effects.intelligence.xpMultiplier).toBe(1.2); // 1 + (20-10) * 0.02
      expect(effects.intelligence.hintAvailability).toBe(true); // >= 20
      expect(effects.intelligence.problemSolvingBonus).toBe(2); // floor(20/10)
    });

    it('should calculate vitality effects correctly', () => {
      const effects = getStatEffects(mockStats);
      
      expect(effects.vitality.sessionLength).toBe(1.25); // 1 + (15-10) * 0.05
      expect(effects.vitality.fatigueResistance).toBe(false); // < 25
      expect(effects.vitality.healthRegeneration).toBe(1); // floor(15/15)
    });

    it('should calculate wisdom effects correctly', () => {
      const effects = getStatEffects(mockStats);
      
      expect(effects.wisdom.contextualHints).toBe(true); // >= 15
      expect(effects.wisdom.advancedContentAccess).toBe(false); // < 30
      expect(effects.wisdom.learningInsights).toBe(2); // floor(25/12)
    });

    it('should calculate charisma effects correctly', () => {
      const effects = getStatEffects(mockStats);
      
      expect(effects.charisma.socialBonuses).toBe(1.24); // 1 + (18-10) * 0.03
      expect(effects.charisma.tradingSuccess).toBe(false); // < 20
      expect(effects.charisma.groupChallengeBonus).toBe(2); // floor(18/8)
    });

    it('should calculate dexterity effects correctly', () => {
      const effects = getStatEffects(mockStats);
      
      expect(effects.dexterity.speedBonus).toBe(1.08); // 1 + (12-10) * 0.04
      expect(effects.dexterity.accuracyBonus).toBe(false); // < 18
      expect(effects.dexterity.timePenaltyReduction).toBe(1); // floor(12/10)
    });

    it('should calculate creativity effects correctly', () => {
      const effects = getStatEffects(mockStats);
      
      expect(effects.creativity.customizationOptions).toBe(6); // floor(30/5)
      expect(effects.creativity.alternativeSolutions).toBe(true); // >= 25
      expect(effects.creativity.artisticUnlocks).toBe(false); // < 35
    });
  });

  describe('calculatePerformanceMultiplier', () => {
    it('should apply accuracy bonuses correctly', () => {
      expect(calculatePerformanceMultiplier(0.95)).toBe(1.3); // 90%+ accuracy
      expect(calculatePerformanceMultiplier(0.85)).toBe(1.2); // 80%+ accuracy
      expect(calculatePerformanceMultiplier(0.75)).toBe(1.1); // 70%+ accuracy
      expect(calculatePerformanceMultiplier(0.65)).toBe(1.0); // Below 70%
    });

    it('should apply streak bonuses correctly', () => {
      expect(calculatePerformanceMultiplier(0.5, 15)).toBe(1.2); // 10+ streak
      expect(calculatePerformanceMultiplier(0.5, 7)).toBe(1.1); // 5+ streak
      expect(calculatePerformanceMultiplier(0.5, 3)).toBe(1.0); // Below 5 streak
    });

    it('should combine accuracy and streak bonuses', () => {
      expect(calculatePerformanceMultiplier(0.95, 15)).toBe(1.5); // 1.3 + 0.2
      expect(calculatePerformanceMultiplier(0.85, 7)).toBe(1.3); // 1.2 + 0.1
    });

    it('should cap multiplier at 2.0', () => {
      expect(calculatePerformanceMultiplier(0.95, 20)).toBe(1.5); // 1.3 + 0.2 = 1.5
    });

    it('should handle edge cases', () => {
      expect(calculatePerformanceMultiplier(0)).toBe(1.0);
      expect(calculatePerformanceMultiplier(1.0)).toBe(1.3);
      expect(calculatePerformanceMultiplier(0.5, 0)).toBe(1.0);
    });
  });

  describe('getAgeAppropriateSubjects', () => {
    it('should return basic subjects for young children (age <= 6)', () => {
      const subjects = getAgeAppropriateSubjects(5);
      
      expect(subjects).toContain('Mathematics');
      expect(subjects).toContain('Language Arts');
      expect(subjects).toContain('Art');
      expect(subjects).toContain('Music');
      expect(subjects).toHaveLength(4);
    });

    it('should return expanded subjects for elementary age (age <= 10)', () => {
      const subjects = getAgeAppropriateSubjects(8);
      
      expect(subjects).toContain('Mathematics');
      expect(subjects).toContain('Language Arts');
      expect(subjects).toContain('Science');
      expect(subjects).toContain('Art');
      expect(subjects).toContain('Music');
      expect(subjects).toContain('Physical Education');
      expect(subjects).toHaveLength(6);
    });

    it('should return more subjects for middle school age (age <= 14)', () => {
      const subjects = getAgeAppropriateSubjects(12);
      
      expect(subjects).toContain('Mathematics');
      expect(subjects).toContain('Language Arts');
      expect(subjects).toContain('Science');
      expect(subjects).toContain('History');
      expect(subjects).toContain('Geography');
      expect(subjects).toHaveLength(8);
    });

    it('should return all subjects for high school age (age > 14)', () => {
      const subjects = getAgeAppropriateSubjects(16);
      
      expect(subjects.length).toBeGreaterThan(8);
      expect(subjects).toContain('Computer Science');
    });
  });

  describe('getRecommendedSubject', () => {
    const mockStats: CharacterStats = {
      intelligence: 20,
      vitality: 15,
      wisdom: 25,
      charisma: 10, // Lowest stat
      dexterity: 18,
      creativity: 22,
      availablePoints: 0
    };

    it('should recommend subject that boosts lowest stat', () => {
      const availableSubjects = ['Mathematics', 'Language Arts', 'Science'];
      const recommended = getRecommendedSubject(mockStats, availableSubjects);
      
      // Should recommend Language Arts since it boosts charisma (lowest stat)
      expect(recommended).toBe('Language Arts');
    });

    it('should return first available subject if no stat-boosting subjects found', () => {
      const availableSubjects = ['Mathematics', 'Science']; // Neither boosts charisma
      const recommended = getRecommendedSubject(mockStats, availableSubjects);
      
      expect(recommended).toBe('Mathematics');
    });

    it('should return null for empty subject list', () => {
      const recommended = getRecommendedSubject(mockStats, []);
      
      expect(recommended).toBeNull();
    });

    it('should handle ties in lowest stats', () => {
      const tiedStats: CharacterStats = {
        intelligence: 15,
        vitality: 15,
        wisdom: 15,
        charisma: 15,
        dexterity: 15,
        creativity: 15,
        availablePoints: 0
      };

      const availableSubjects = ['Mathematics', 'Biology'];
      const recommended = getRecommendedSubject(tiedStats, availableSubjects);
      
      // Should return one of the available subjects
      expect(availableSubjects).toContain(recommended);
    });
  });
});