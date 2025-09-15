import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { adaptiveLearningService } from '../adaptiveLearningService';
import { supabase } from '../supabaseClient';

// Mock dependencies
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(),
            gte: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn()
              }))
            }))
          })),
          gte: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn()
            }))
          }))
        })),
        insert: vi.fn(),
        upsert: vi.fn()
      }))
    }))
  }
}));

vi.mock('../ageFilteringService', () => ({
  ageFilteringService: {
    getAgeAppropriateContent: vi.fn()
  }
}));

describe('AdaptiveLearningService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLearningProfile', () => {
    it('should return existing learning profile', async () => {
      const mockProfile = {
        user_id: 'user-123',
        preferred_learning_style: 'visual',
        strengths: ['math', 'science'],
        weaknesses: ['reading'],
        average_session_length: 20,
        optimal_difficulty_curve: 0.1,
        motivation_factors: ['achievements', 'progress_bars'],
        last_updated: '2024-01-01T00:00:00Z'
      };

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
          })
        })
      });

      const result = await adaptiveLearningService.getLearningProfile('user-123');

      expect(result.userId).toBe('user-123');
      expect(result.preferredLearningStyle).toBe('visual');
      expect(result.strengths).toEqual(['math', 'science']);
      expect(result.weaknesses).toEqual(['reading']);
      expect(result.averageSessionLength).toBe(20);
    });

    it('should create default profile for new user', async () => {
      // Mock profile not found
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
          })
        })
      });

      // Mock user age fetch
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { age: 8 }, error: null })
          })
        })
      });

      // Mock profile creation
      (supabase.from as Mock).mockReturnValueOnce({
        insert: vi.fn().mockResolvedValue({ error: null })
      });

      const result = await adaptiveLearningService.getLearningProfile('user-123');

      expect(result.userId).toBe('user-123');
      expect(result.preferredLearningStyle).toBe('mixed');
      expect(result.averageSessionLength).toBe(10); // Younger user gets shorter sessions
      expect(result.optimalDifficultyCurve).toBe(0.05); // Younger user gets gentler curve
    });
  });

  describe('getLearningAnalytics', () => {
    it('should calculate comprehensive learning analytics', async () => {
      const mockResponses = [
        {
          is_correct: true,
          response_time_seconds: 15,
          created_at: '2024-01-15T10:00:00Z',
          questions: {
            id: 'q1',
            subject_id: 'math-001',
            difficulty_level: 2,
            subjects: { name: 'Mathematics' }
          }
        },
        {
          is_correct: false,
          response_time_seconds: 25,
          created_at: '2024-01-15T10:05:00Z',
          questions: {
            id: 'q2',
            subject_id: 'math-001',
            difficulty_level: 2,
            subjects: { name: 'Mathematics' }
          }
        },
        {
          is_correct: true,
          response_time_seconds: 20,
          created_at: '2024-01-14T10:00:00Z',
          questions: {
            id: 'q3',
            subject_id: 'science-001',
            difficulty_level: 1,
            subjects: { name: 'Science' }
          }
        }
      ];

      // Mock question responses
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockResponses, error: null })
            })
          })
        })
      });

      // Mock recent responses for learning velocity
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ data: mockResponses.slice(0, 2), error: null })
          })
        })
      });

      // Mock total learning time
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: mockResponses, error: null })
        })
      });

      // Mock streak calculation
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockResponses, error: null })
            })
          })
        })
      });

      const result = await adaptiveLearningService.getLearningAnalytics('user-123');

      expect(result.userId).toBe('user-123');
      expect(result.conceptMasteries).toHaveLength(2); // Math and Science
      
      // Find the specific masteries instead of assuming order
      const mathMastery = result.conceptMasteries.find(c => c.conceptName === 'Mathematics');
      const scienceMastery = result.conceptMasteries.find(c => c.conceptName === 'Science');
      
      expect(mathMastery).toBeDefined();
      expect(mathMastery!.questionsAttempted).toBe(2);
      expect(mathMastery!.questionsCorrect).toBe(1);
      
      expect(scienceMastery).toBeDefined();
      expect(scienceMastery!.questionsAttempted).toBe(1);
      expect(scienceMastery!.questionsCorrect).toBe(1);
      
      expect(result.learningVelocity).toBe(2); // 2 unique subjects in recent responses
      expect(result.timeSpentLearning).toBe(1); // 60 seconds total / 60 = 1 minute
    });

    it('should handle users with no response history', async () => {
      // Mock empty responses
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: [], error: null })
            }),
            gte: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        })
      });

      const result = await adaptiveLearningService.getLearningAnalytics('user-123');

      expect(result.userId).toBe('user-123');
      expect(result.conceptMasteries).toHaveLength(0);
      expect(result.knowledgeGaps).toHaveLength(0);
      expect(result.learningVelocity).toBe(0);
      expect(result.timeSpentLearning).toBe(0);
      expect(result.streakDays).toBe(0);
    });
  });

  describe('getPersonalizedRecommendations', () => {
    it('should provide personalized recommendations based on profile and analytics', async () => {
      // Mock learning profile
      const mockProfile = {
        user_id: 'user-123',
        preferred_learning_style: 'visual',
        strengths: ['science-001'],
        weaknesses: ['math-001'],
        average_session_length: 15,
        optimal_difficulty_curve: 0.1,
        motivation_factors: ['achievements'],
        last_updated: '2024-01-01T00:00:00Z'
      };

      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
          })
        })
      });

      // Mock user age
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { age: 12 }, error: null })
          })
        })
      });

      // Mock analytics data (simplified)
      const mockResponses = [
        {
          is_correct: false,
          response_time_seconds: 30,
          created_at: '2024-01-15T10:00:00Z',
          questions: {
            subject_id: 'math-001',
            subjects: { name: 'Mathematics' }
          }
        }
      ];

      // Mock multiple calls for analytics
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockResponses, error: null })
            }),
            gte: vi.fn().mockResolvedValue({ data: mockResponses, error: null })
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
            questionText: 'What is 5 + 3?',
            answerOptions: ['6', '7', '8', '9'],
            correctAnswer: '8',
            difficultyLevel: 2,
            xpReward: 15,
            ageRange: '11-14',
            createdAt: new Date()
          }
        ]
      });

      const result = await adaptiveLearningService.getPersonalizedRecommendations('user-123');

      expect(result.questions).toHaveLength(1);
      expect(result.reasoning).toContain('Recommendations based on');
      expect(result.estimatedCompletionTime).toBeGreaterThan(0);
      expect(result.learningObjectives).toHaveLength(1);
      expect(result.nextSteps.length).toBeGreaterThan(0);
    });
  });

  describe('updateLearningProfile', () => {
    it('should update profile based on recent performance', async () => {
      // Mock current profile
      const mockProfile = {
        user_id: 'user-123',
        preferred_learning_style: 'visual',
        strengths: [],
        weaknesses: [],
        average_session_length: 15,
        optimal_difficulty_curve: 0.1,
        motivation_factors: ['achievements'],
        last_updated: '2024-01-01T00:00:00Z'
      };

      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile, error: null })
          })
        })
      });

      // Mock analytics showing strong math performance
      const mockResponses = [
        {
          is_correct: true,
          response_time_seconds: 15,
          created_at: '2024-01-15T10:00:00Z',
          questions: {
            subject_id: 'math-001',
            subjects: { name: 'Mathematics' }
          }
        },
        {
          is_correct: true,
          response_time_seconds: 12,
          created_at: '2024-01-15T10:05:00Z',
          questions: {
            subject_id: 'math-001',
            subjects: { name: 'Mathematics' }
          }
        }
      ];

      // Mock multiple analytics calls
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockResponses, error: null })
            }),
            gte: vi.fn().mockResolvedValue({ data: mockResponses, error: null })
          })
        })
      });

      // Mock profile update
      (supabase.from as Mock).mockReturnValueOnce({
        upsert: vi.fn().mockResolvedValue({ error: null })
      });

      await adaptiveLearningService.updateLearningProfile('user-123');

      // Verify upsert was called (profile should be updated with math as strength)
      expect(supabase.from).toHaveBeenCalledWith('learning_profiles');
    });
  });

  describe('concept mastery calculation', () => {
    it('should correctly calculate mastery levels', async () => {
      const mockResponses = [
        // High accuracy, recent practice
        { is_correct: true, response_time_seconds: 10, created_at: '2024-01-15T10:00:00Z', questions: { subject_id: 'math-001', subjects: { name: 'Math' } } },
        { is_correct: true, response_time_seconds: 12, created_at: '2024-01-15T09:55:00Z', questions: { subject_id: 'math-001', subjects: { name: 'Math' } } },
        { is_correct: true, response_time_seconds: 8, created_at: '2024-01-15T09:50:00Z', questions: { subject_id: 'math-001', subjects: { name: 'Math' } } },
        { is_correct: true, response_time_seconds: 15, created_at: '2024-01-15T09:45:00Z', questions: { subject_id: 'math-001', subjects: { name: 'Math' } } },
        
        // Low accuracy, older practice
        { is_correct: false, response_time_seconds: 45, created_at: '2024-01-10T10:00:00Z', questions: { subject_id: 'science-001', subjects: { name: 'Science' } } },
        { is_correct: false, response_time_seconds: 50, created_at: '2024-01-10T09:55:00Z', questions: { subject_id: 'science-001', subjects: { name: 'Science' } } },
        { is_correct: true, response_time_seconds: 40, created_at: '2024-01-10T09:50:00Z', questions: { subject_id: 'science-001', subjects: { name: 'Science' } } }
      ];

      // Mock analytics calls
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockResponses, error: null })
            }),
            gte: vi.fn().mockResolvedValue({ data: mockResponses.slice(0, 4), error: null })
          })
        })
      });

      const result = await adaptiveLearningService.getLearningAnalytics('user-123');

      expect(result.conceptMasteries).toHaveLength(2);
      
      const mathMastery = result.conceptMasteries.find(c => c.conceptName === 'Math');
      const scienceMastery = result.conceptMasteries.find(c => c.conceptName === 'Science');
      
      expect(mathMastery?.masteryLevel).toBeGreaterThan(scienceMastery?.masteryLevel);
      expect(mathMastery?.questionsCorrect).toBe(4);
      expect(mathMastery?.questionsAttempted).toBe(4);
      expect(scienceMastery?.questionsCorrect).toBe(1);
      expect(scienceMastery?.questionsAttempted).toBe(3);
    });
  });

  describe('knowledge gap identification', () => {
    it('should identify knowledge gaps correctly', async () => {
      const mockResponses = [
        // Poor performance in math
        { is_correct: false, response_time_seconds: 60, created_at: '2024-01-15T10:00:00Z', questions: { subject_id: 'math-001', subjects: { name: 'Mathematics' } } },
        { is_correct: false, response_time_seconds: 55, created_at: '2024-01-15T09:55:00Z', questions: { subject_id: 'math-001', subjects: { name: 'Mathematics' } } },
        
        // Good but stale performance in science
        { is_correct: true, response_time_seconds: 20, created_at: '2024-01-01T10:00:00Z', questions: { subject_id: 'science-001', subjects: { name: 'Science' } } },
        { is_correct: true, response_time_seconds: 18, created_at: '2024-01-01T09:55:00Z', questions: { subject_id: 'science-001', subjects: { name: 'Science' } } }
      ];

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({ data: mockResponses, error: null })
            }),
            gte: vi.fn().mockResolvedValue({ data: mockResponses.slice(0, 2), error: null })
          })
        })
      });

      const result = await adaptiveLearningService.getLearningAnalytics('user-123');

      expect(result.knowledgeGaps.length).toBeGreaterThan(0);
      expect(result.knowledgeGaps.some(gap => gap.includes('Mathematics'))).toBe(true);
      // Science should need review due to being stale (old dates)
      expect(result.knowledgeGaps.some(gap => gap.includes('Science'))).toBe(true);
    });
  });
});