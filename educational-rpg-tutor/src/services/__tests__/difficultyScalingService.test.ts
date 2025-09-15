import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DifficultyScalingService } from '../difficultyScalingService';
import { supabase } from '../supabaseClient';

// Mock Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn()
            })),
            lte: vi.fn(() => ({
              limit: vi.fn(),
              eq: vi.fn(() => ({
                limit: vi.fn()
              }))
            }))
          })),
          single: vi.fn(),
          limit: vi.fn()
        }))
      }))
    }))
  }
}));

describe('DifficultyScalingService', () => {
  let service: DifficultyScalingService;

  beforeEach(() => {
    service = new DifficultyScalingService();
    vi.clearAllMocks();
  });

  describe('getAgeBaseline', () => {
    it('should return correct baseline for different age groups', () => {
      const servicePrivate = service as any;
      
      expect(servicePrivate.getAgeBaseline(4)).toBe(1); // Ages 3-6
      expect(servicePrivate.getAgeBaseline(8)).toBe(2); // Ages 7-10
      expect(servicePrivate.getAgeBaseline(12)).toBe(3); // Ages 11-14
      expect(servicePrivate.getAgeBaseline(16)).toBe(4); // Ages 15-18
      expect(servicePrivate.getAgeBaseline(20)).toBe(3); // Default
    });
  });

  describe('getExpectedResponseTime', () => {
    it('should return appropriate response times for different ages', () => {
      const servicePrivate = service as any;
      
      expect(servicePrivate.getExpectedResponseTime(5)).toBe(45); // Young children
      expect(servicePrivate.getExpectedResponseTime(9)).toBe(30); // Elementary
      expect(servicePrivate.getExpectedResponseTime(13)).toBe(20); // Middle school
      expect(servicePrivate.getExpectedResponseTime(17)).toBe(15); // High school
    });
  });

  describe('computeDifficultyRecommendation', () => {
    it('should increase difficulty for high accuracy', () => {
      const servicePrivate = service as any;
      const performance = {
        accuracy: 0.9,
        averageResponseTime: 15,
        recentStreak: 3,
        totalQuestionsAnswered: 20,
        subjectMastery: 0.7
      };

      const recommendation = servicePrivate.computeDifficultyRecommendation(
        performance,
        2, // age baseline
        10 // age
      );

      expect(recommendation.targetDifficulty).toBeGreaterThan(2);
      expect(recommendation.adjustmentFactor).toBeGreaterThan(0);
      expect(recommendation.reasoning).toContain('High accuracy');
    });

    it('should decrease difficulty for low accuracy', () => {
      const servicePrivate = service as any;
      const performance = {
        accuracy: 0.4,
        averageResponseTime: 45,
        recentStreak: 0,
        totalQuestionsAnswered: 15,
        subjectMastery: 0.2
      };

      const recommendation = servicePrivate.computeDifficultyRecommendation(
        performance,
        3, // age baseline
        12 // age
      );

      expect(recommendation.targetDifficulty).toBeLessThan(3);
      expect(recommendation.adjustmentFactor).toBeLessThan(0);
      expect(recommendation.reasoning).toContain('Low accuracy');
    });

    it('should apply speed bonuses for fast responses', () => {
      const servicePrivate = service as any;
      const performance = {
        accuracy: 0.75,
        averageResponseTime: 10, // Fast for age 12 (expected 20)
        recentStreak: 2,
        totalQuestionsAnswered: 10,
        subjectMastery: 0.5
      };

      const recommendation = servicePrivate.computeDifficultyRecommendation(
        performance,
        3,
        12
      );

      expect(recommendation.reasoning).toContain('Fast responses');
      expect(recommendation.adjustmentFactor).toBeGreaterThan(0);
    });

    it('should apply streak bonuses', () => {
      const servicePrivate = service as any;
      const performance = {
        accuracy: 0.7,
        averageResponseTime: 20,
        recentStreak: 12, // Long streak
        totalQuestionsAnswered: 25,
        subjectMastery: 0.6
      };

      const recommendation = servicePrivate.computeDifficultyRecommendation(
        performance,
        2,
        10
      );

      expect(recommendation.reasoning).toContain('Long streak');
      expect(recommendation.adjustmentFactor).toBeGreaterThan(0);
    });

    it('should apply mastery bonuses', () => {
      const servicePrivate = service as any;
      const performance = {
        accuracy: 0.75,
        averageResponseTime: 25,
        recentStreak: 3,
        totalQuestionsAnswered: 30,
        subjectMastery: 0.85 // High mastery
      };

      const recommendation = servicePrivate.computeDifficultyRecommendation(
        performance,
        2,
        10
      );

      expect(recommendation.reasoning).toContain('High mastery');
      expect(recommendation.adjustmentFactor).toBeGreaterThan(0);
    });

    it('should clamp difficulty to valid range (1-5)', () => {
      const servicePrivate = service as any;
      
      // Test upper bound
      const highPerformance = {
        accuracy: 0.95,
        averageResponseTime: 5,
        recentStreak: 20,
        totalQuestionsAnswered: 50,
        subjectMastery: 0.9
      };

      const highRec = servicePrivate.computeDifficultyRecommendation(
        highPerformance,
        4, // Already high baseline
        16
      );

      expect(highRec.targetDifficulty).toBeLessThanOrEqual(5);

      // Test lower bound
      const lowPerformance = {
        accuracy: 0.2,
        averageResponseTime: 60,
        recentStreak: 0,
        totalQuestionsAnswered: 10,
        subjectMastery: 0.1
      };

      const lowRec = servicePrivate.computeDifficultyRecommendation(
        lowPerformance,
        1, // Already low baseline
        6
      );

      expect(lowRec.targetDifficulty).toBeGreaterThanOrEqual(1);
    });

    it('should have low confidence for insufficient data', () => {
      const servicePrivate = service as any;
      const performance = {
        accuracy: 0.8,
        averageResponseTime: 20,
        recentStreak: 2,
        totalQuestionsAnswered: 2, // Very few questions
        subjectMastery: 0.5
      };

      const recommendation = servicePrivate.computeDifficultyRecommendation(
        performance,
        2,
        10
      );

      expect(recommendation.confidenceLevel).toBeLessThanOrEqual(0.5);
      expect(recommendation.reasoning).toContain('Insufficient data');
    });

    it('should increase confidence with more data', () => {
      const servicePrivate = service as any;
      const performance = {
        accuracy: 0.8,
        averageResponseTime: 20,
        recentStreak: 5,
        totalQuestionsAnswered: 40, // Lots of questions
        subjectMastery: 0.7
      };

      const recommendation = servicePrivate.computeDifficultyRecommendation(
        performance,
        2,
        10
      );

      expect(recommendation.confidenceLevel).toBeGreaterThan(0.7);
    });
  });

  describe('calculateTargetDifficulty', () => {
    it('should handle users with no response history', async () => {
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({ data: null, error: null })
              }))
            }))
          }))
        }))
      }));

      (supabase.from as any).mockImplementation(mockFrom);

      const recommendation = await service.calculateTargetDifficulty(
        'user1',
        'subject1',
        10
      );

      expect(recommendation.targetDifficulty).toBe(2); // Age baseline for 10-year-old
      expect(recommendation.confidenceLevel).toBe(0.5);
    });

    it('should process response history correctly', async () => {
      const mockResponses = [
        { is_correct: true, response_time_seconds: 15, questions: { difficulty_level: 2 } },
        { is_correct: true, response_time_seconds: 12, questions: { difficulty_level: 2 } },
        { is_correct: false, response_time_seconds: 25, questions: { difficulty_level: 3 } },
        { is_correct: true, response_time_seconds: 18, questions: { difficulty_level: 2 } }
      ];

      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({ data: mockResponses, error: null })
              }))
            }))
          }))
        }))
      }));

      (supabase.from as any).mockImplementation(mockFrom);

      const recommendation = await service.calculateTargetDifficulty(
        'user1',
        'subject1',
        10
      );

      expect(recommendation.targetDifficulty).toBeGreaterThan(2); // Should increase due to good performance
      expect(recommendation.confidenceLevel).toBeGreaterThan(0.5);
    });
  });

  describe('getDifficultyDistribution', () => {
    it('should calculate distribution correctly', async () => {
      const mockResponses = [
        { is_correct: true, questions: { difficulty_level: 1 } },
        { is_correct: false, questions: { difficulty_level: 1 } },
        { is_correct: true, questions: { difficulty_level: 2 } },
        { is_correct: true, questions: { difficulty_level: 2 } },
        { is_correct: true, questions: { difficulty_level: 3 } }
      ];

      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn().mockResolvedValue({ data: mockResponses, error: null })
          }))
        }))
      }));

      (supabase.from as any).mockImplementation(mockFrom);

      const distribution = await service.getDifficultyDistribution(
        'user1',
        'subject1',
        30
      );

      expect(distribution).toBeDefined();
      expect(distribution![1].total).toBe(2);
      expect(distribution![1].correct).toBe(1);
      expect(distribution![2].total).toBe(2);
      expect(distribution![2].correct).toBe(2);
      expect(distribution![3].total).toBe(1);
      expect(distribution![3].correct).toBe(1);
    });

    it('should return null on database error', async () => {
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            gte: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } })
          }))
        }))
      }));

      (supabase.from as any).mockImplementation(mockFrom);

      const distribution = await service.getDifficultyDistribution(
        'user1',
        'subject1'
      );

      expect(distribution).toBeNull();
    });
  });
});