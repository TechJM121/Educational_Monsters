import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { contentRecommendationService } from '../contentRecommendationService';
import { supabase } from '../supabaseClient';

// Mock dependencies
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          gte: vi.fn()
        }))
      }))
    }))
  }
}));

vi.mock('../adaptiveLearningService', () => ({
  adaptiveLearningService: {
    getLearningProfile: vi.fn(),
    getLearningAnalytics: vi.fn()
  }
}));

vi.mock('../ageFilteringService', () => ({
  ageFilteringService: {
    getAgeAppropriateContent: vi.fn()
  }
}));

vi.mock('../difficultyScalingService', () => ({
  difficultyScalingService: {
    getAdaptiveQuestions: vi.fn()
  }
}));

describe('ContentRecommendationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getContentRecommendations', () => {
    it('should provide comprehensive content recommendations', async () => {
      const context = {
        userId: 'user-123',
        currentSubject: 'math-001',
        sessionGoals: ['Practice basic arithmetic'],
        timeAvailable: 20,
        avoidRecentQuestions: true
      };

      // Mock learning profile
      const { adaptiveLearningService } = await import('../adaptiveLearningService');
      (adaptiveLearningService.getLearningProfile as Mock).mockResolvedValue({
        userId: 'user-123',
        preferredLearningStyle: 'visual',
        strengths: ['science-001'],
        weaknesses: ['math-001'],
        averageSessionLength: 15,
        optimalDifficultyCurve: 0.1,
        motivationFactors: ['achievements']
      });

      // Mock learning analytics
      (adaptiveLearningService.getLearningAnalytics as Mock).mockResolvedValue({
        userId: 'user-123',
        conceptMasteries: [
          {
            conceptId: 'math-001',
            conceptName: 'Mathematics',
            subjectId: 'math-001',
            masteryLevel: 0.4,
            needsReview: false
          }
        ],
        knowledgeGaps: ['Low mastery in Mathematics'],
        streakDays: 5
      });

      // Mock user age
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { age: 10 }, error: null })
          })
        })
      });

      // Mock subjects
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({
          data: [
            { id: 'math-001', name: 'Mathematics' },
            { id: 'science-001', name: 'Science' }
          ],
          error: null
        })
      });

      // Mock recent questions
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      });

      // Mock age-appropriate content
      const { ageFilteringService } = await import('../ageFilteringService');
      (ageFilteringService.getAgeAppropriateContent as Mock).mockResolvedValue({
        questions: [
          {
            id: 'q1',
            subjectId: 'math-001',
            questionText: 'What is 3 + 4?',
            answerOptions: ['5', '6', '7', '8'],
            correctAnswer: '7',
            difficultyLevel: 2,
            xpReward: 15,
            ageRange: '7-10',
            createdAt: new Date()
          }
        ]
      });

      // Mock adaptive questions
      const { difficultyScalingService } = await import('../difficultyScalingService');
      (difficultyScalingService.getAdaptiveQuestions as Mock).mockResolvedValue([
        {
          id: 'q2',
          subject_id: 'math-001',
          question_text: 'What is 5 + 2?',
          answer_options: ['6', '7', '8', '9'],
          correct_answer: '7',
          difficulty_level: 2,
          xp_reward: 15,
          age_range: '7-10',
          created_at: '2024-01-01T00:00:00Z'
        }
      ]);

      const result = await contentRecommendationService.getContentRecommendations(context);

      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.topics.length).toBeGreaterThan(0);
      expect(result.reasoning).toContain('Recommendations based on');
      expect(result.metadata.totalQuestions).toBeGreaterThan(0);
      expect(result.metadata.averageDifficulty).toBeGreaterThan(0);
      expect(result.metadata.estimatedCompletionTime).toBeGreaterThan(0);
    });

    it('should handle users with no learning history', async () => {
      const context = {
        userId: 'new-user',
        sessionGoals: ['Start learning'],
        timeAvailable: 15,
        avoidRecentQuestions: false
      };

      // Mock new user profile
      const { adaptiveLearningService } = await import('../adaptiveLearningService');
      (adaptiveLearningService.getLearningProfile as Mock).mockResolvedValue({
        userId: 'new-user',
        preferredLearningStyle: 'mixed',
        strengths: [],
        weaknesses: [],
        averageSessionLength: 15,
        optimalDifficultyCurve: 0.1,
        motivationFactors: ['achievements']
      });

      (adaptiveLearningService.getLearningAnalytics as Mock).mockResolvedValue({
        userId: 'new-user',
        conceptMasteries: [],
        knowledgeGaps: [],
        streakDays: 0
      });

      // Mock user age
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { age: 8 }, error: null })
          })
        })
      });

      // Mock subjects
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({
          data: [{ id: 'math-001', name: 'Mathematics' }],
          error: null
        })
      });

      // Mock no recent questions
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      });

      // Mock age-appropriate content
      const { ageFilteringService } = await import('../ageFilteringService');
      (ageFilteringService.getAgeAppropriateContent as Mock).mockResolvedValue({
        questions: [
          {
            id: 'q1',
            subjectId: 'math-001',
            questionText: 'Count the apples: 🍎🍎🍎',
            answerOptions: ['1', '2', '3', '4'],
            correctAnswer: '3',
            difficultyLevel: 1,
            xpReward: 10,
            ageRange: '7-10',
            createdAt: new Date()
          }
        ]
      });

      const { difficultyScalingService } = await import('../difficultyScalingService');
      (difficultyScalingService.getAdaptiveQuestions as Mock).mockResolvedValue([]);

      const result = await contentRecommendationService.getContentRecommendations(context);

      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.topics.length).toBeGreaterThan(0);
      expect(result.reasoning).toContain('New topic - good for exploration');
    });
  });

  describe('getStudyPlan', () => {
    it('should generate a comprehensive study plan', async () => {
      // Mock learning analytics
      const { adaptiveLearningService } = await import('../adaptiveLearningService');
      (adaptiveLearningService.getLearningAnalytics as Mock).mockResolvedValue({
        userId: 'user-123',
        conceptMasteries: [
          {
            conceptId: 'math-001',
            conceptName: 'Mathematics',
            subjectId: 'math-001',
            masteryLevel: 0.6,
            needsReview: false
          }
        ],
        knowledgeGaps: ['Practice more advanced problems'],
        streakDays: 3
      });

      (adaptiveLearningService.getLearningProfile as Mock).mockResolvedValue({
        userId: 'user-123',
        preferredLearningStyle: 'visual',
        strengths: [],
        weaknesses: ['math-001'],
        averageSessionLength: 20,
        optimalDifficultyCurve: 0.1,
        motivationFactors: ['achievements']
      });

      // Mock user age
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { age: 12 }, error: null })
          })
        })
      });

      // Mock subjects for each day
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ id: 'math-001', name: 'Mathematics' }],
          error: null
        })
      });

      // Mock recent questions (empty for simplicity)
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      });

      // Mock content services
      const { ageFilteringService } = await import('../ageFilteringService');
      (ageFilteringService.getAgeAppropriateContent as Mock).mockResolvedValue({
        questions: [
          {
            id: 'q1',
            subjectId: 'math-001',
            questionText: 'Sample question',
            answerOptions: ['A', 'B', 'C'],
            correctAnswer: 'B',
            difficultyLevel: 2,
            xpReward: 15,
            ageRange: '11-14',
            createdAt: new Date()
          }
        ]
      });

      const { difficultyScalingService } = await import('../difficultyScalingService');
      (difficultyScalingService.getAdaptiveQuestions as Mock).mockResolvedValue([]);

      const result = await contentRecommendationService.getStudyPlan('user-123', 5, 20);

      expect(result.dailyPlans).toHaveLength(5);
      expect(result.dailyPlans[0].day).toBe(1);
      expect(result.dailyPlans[0].estimatedTime).toBe(20);
      expect(result.dailyPlans[0].topics.length).toBeGreaterThan(0);
      expect(result.dailyPlans[0].goals.length).toBeGreaterThan(0);
      
      expect(result.overallGoals.length).toBeGreaterThan(0);
      expect(result.progressMilestones.length).toBeGreaterThan(0);
      expect(result.progressMilestones[0]).toContain('Complete 50 questions over 5 days'); // 10 questions per day * 5 days
    });

    it('should adapt study plan for shorter sessions', async () => {
      const { adaptiveLearningService } = await import('../adaptiveLearningService');
      (adaptiveLearningService.getLearningAnalytics as Mock).mockResolvedValue({
        userId: 'user-123',
        conceptMasteries: [],
        knowledgeGaps: [],
        streakDays: 0
      });

      (adaptiveLearningService.getLearningProfile as Mock).mockResolvedValue({
        userId: 'user-123',
        preferredLearningStyle: 'mixed',
        strengths: [],
        weaknesses: [],
        averageSessionLength: 10,
        optimalDifficultyCurve: 0.05,
        motivationFactors: ['progress_bars']
      });

      // Mock minimal setup for short sessions
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { age: 6 }, error: null })
          })
        })
      });

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [{ id: 'math-001', name: 'Basic Math' }],
          error: null
        })
      });

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      });

      const { ageFilteringService } = await import('../ageFilteringService');
      (ageFilteringService.getAgeAppropriateContent as Mock).mockResolvedValue({
        questions: [
          {
            id: 'q1',
            subjectId: 'math-001',
            questionText: 'Simple question',
            answerOptions: ['A', 'B'],
            correctAnswer: 'A',
            difficultyLevel: 1,
            xpReward: 5,
            ageRange: '3-6',
            createdAt: new Date()
          }
        ]
      });

      const { difficultyScalingService } = await import('../difficultyScalingService');
      (difficultyScalingService.getAdaptiveQuestions as Mock).mockResolvedValue([]);

      const result = await contentRecommendationService.getStudyPlan('user-123', 3, 10);

      expect(result.dailyPlans).toHaveLength(3);
      expect(result.dailyPlans[0].estimatedTime).toBe(10);
      expect(result.dailyPlans[0].goals[0]).toContain('Complete 5 questions'); // 10 minutes / 2 minutes per question
    });
  });

  describe('topic recommendations', () => {
    it('should prioritize weak areas', async () => {
      const context = {
        userId: 'user-123',
        sessionGoals: ['Improve weak subjects'],
        timeAvailable: 30,
        avoidRecentQuestions: true
      };

      const { adaptiveLearningService } = await import('../adaptiveLearningService');
      (adaptiveLearningService.getLearningProfile as Mock).mockResolvedValue({
        userId: 'user-123',
        preferredLearningStyle: 'visual',
        strengths: ['science-001'],
        weaknesses: ['math-001'], // Math is a weakness
        averageSessionLength: 20,
        optimalDifficultyCurve: 0.1,
        motivationFactors: ['achievements']
      });

      (adaptiveLearningService.getLearningAnalytics as Mock).mockResolvedValue({
        userId: 'user-123',
        conceptMasteries: [
          {
            conceptId: 'math-001',
            conceptName: 'Mathematics',
            subjectId: 'math-001',
            masteryLevel: 0.3, // Low mastery
            needsReview: false
          },
          {
            conceptId: 'science-001',
            conceptName: 'Science',
            subjectId: 'science-001',
            masteryLevel: 0.8, // High mastery
            needsReview: false
          }
        ],
        knowledgeGaps: ['Low mastery in Mathematics'],
        streakDays: 2
      });

      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { age: 10 }, error: null })
          })
        })
      });

      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({
          data: [
            { id: 'math-001', name: 'Mathematics' },
            { id: 'science-001', name: 'Science' }
          ],
          error: null
        })
      });

      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      });

      const { ageFilteringService } = await import('../ageFilteringService');
      (ageFilteringService.getAgeAppropriateContent as Mock).mockResolvedValue({
        questions: [
          {
            id: 'q1',
            subjectId: 'math-001',
            questionText: 'Math question',
            answerOptions: ['A', 'B', 'C'],
            correctAnswer: 'B',
            difficultyLevel: 2,
            xpReward: 15,
            ageRange: '7-10',
            createdAt: new Date()
          }
        ]
      });

      const { difficultyScalingService } = await import('../difficultyScalingService');
      (difficultyScalingService.getAdaptiveQuestions as Mock).mockResolvedValue([]);

      const result = await contentRecommendationService.getContentRecommendations(context);

      // Math should be prioritized due to low mastery and being a weakness
      const mathTopic = result.topics.find(t => t.topicName === 'Mathematics');
      const scienceTopic = result.topics.find(t => t.topicName === 'Science');
      
      expect(mathTopic).toBeDefined();
      expect(mathTopic!.priority).toBeGreaterThan(scienceTopic?.priority || 0);
      expect(mathTopic!.reasoning).toContain('Low mastery');
    });
  });

  describe('content filtering and deduplication', () => {
    it('should avoid recently answered questions', async () => {
      const context = {
        userId: 'user-123',
        sessionGoals: ['Practice'],
        timeAvailable: 20,
        avoidRecentQuestions: true
      };

      // Mock recent questions
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { age: 10 }, error: null })
          })
        })
      });

      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockResolvedValue({
          data: [{ id: 'math-001', name: 'Mathematics' }],
          error: null
        })
      });

      // Mock recent questions - should be filtered out
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ 
              data: [{ question_id: 'q1' }], // q1 was recently answered
              error: null 
            })
          })
        })
      });

      const { adaptiveLearningService } = await import('../adaptiveLearningService');
      (adaptiveLearningService.getLearningProfile as Mock).mockResolvedValue({
        userId: 'user-123',
        preferredLearningStyle: 'mixed',
        strengths: [],
        weaknesses: [],
        averageSessionLength: 15,
        optimalDifficultyCurve: 0.1,
        motivationFactors: ['achievements']
      });

      (adaptiveLearningService.getLearningAnalytics as Mock).mockResolvedValue({
        userId: 'user-123',
        conceptMasteries: [],
        knowledgeGaps: [],
        streakDays: 0
      });

      const { ageFilteringService } = await import('../ageFilteringService');
      (ageFilteringService.getAgeAppropriateContent as Mock).mockResolvedValue({
        questions: [
          {
            id: 'q1', // This should be filtered out
            subjectId: 'math-001',
            questionText: 'Recent question',
            answerOptions: ['A', 'B'],
            correctAnswer: 'A',
            difficultyLevel: 1,
            xpReward: 10,
            ageRange: '7-10',
            createdAt: new Date()
          },
          {
            id: 'q2', // This should be included
            subjectId: 'math-001',
            questionText: 'New question',
            answerOptions: ['A', 'B'],
            correctAnswer: 'B',
            difficultyLevel: 1,
            xpReward: 10,
            ageRange: '7-10',
            createdAt: new Date()
          }
        ]
      });

      const { difficultyScalingService } = await import('../difficultyScalingService');
      (difficultyScalingService.getAdaptiveQuestions as Mock).mockResolvedValue([]);

      const result = await contentRecommendationService.getContentRecommendations(context);

      // Should not include the recently answered question q1
      expect(result.questions.find(q => q.id === 'q1')).toBeUndefined();
      expect(result.questions.find(q => q.id === 'q2')).toBeDefined();
    });
  });
});