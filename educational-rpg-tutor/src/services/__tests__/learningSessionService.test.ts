import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { learningSessionService, LearningSessionService } from '../learningSessionService';
import { questionService } from '../questionService';
import { supabase } from '../supabaseClient';

// Mock dependencies
vi.mock('../questionService');
vi.mock('../supabaseClient');

const mockQuestionService = vi.mocked(questionService);
const mockSupabase = vi.mocked(supabase);

describe('LearningSessionService', () => {
  let service: LearningSessionService;
  const mockUserId = 'user-123';
  const mockSubjectId = 'subject-456';

  beforeEach(() => {
    service = new LearningSessionService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createSession', () => {
    it('should create a new learning session with default config', async () => {
      // Mock user data
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { age: 10 }
            })
          })
        })
      } as any);

      // Mock questions
      const mockQuestions = [
        {
          id: 'q1',
          subject_id: mockSubjectId,
          question_text: 'What is 2+2?',
          answer_options: ['3', '4', '5', '6'],
          correct_answer: '4',
          difficulty_level: 1,
          xp_reward: 10,
          age_range: '7-10',
          created_at: new Date()
        }
      ];

      mockQuestionService.getAdaptiveQuestions.mockResolvedValue(mockQuestions);

      const session = await service.createSession(mockUserId, mockSubjectId);

      expect(session).toBeDefined();
      expect(session.userId).toBe(mockUserId);
      expect(session.subjectId).toBe(mockSubjectId);
      expect(session.questions).toEqual(mockQuestions);
      expect(session.currentQuestionIndex).toBe(0);
      expect(session.isComplete).toBe(false);
      expect(session.config.questionsPerSession).toBe(10);
      expect(session.config.adaptiveDifficulty).toBe(true);
    });

    it('should throw error when no questions available', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { age: 10 }
            })
          })
        })
      } as any);

      mockQuestionService.getAdaptiveQuestions.mockResolvedValue([]);

      await expect(service.createSession(mockUserId, mockSubjectId))
        .rejects.toThrow('No questions available for the selected criteria');
    });

    it('should create session with custom config', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { age: 10 }
            })
          })
        })
      } as any);

      const mockQuestions = [
        {
          id: 'q1',
          subject_id: mockSubjectId,
          question_text: 'Test question',
          answer_options: ['A', 'B', 'C', 'D'],
          correct_answer: 'A',
          difficulty_level: 2,
          xp_reward: 20,
          age_range: '7-10',
          created_at: new Date()
        }
      ];

      mockQuestionService.getAdaptiveQuestions.mockResolvedValue(mockQuestions);

      const customConfig = {
        questionsPerSession: 5,
        adaptiveDifficulty: false,
        enableHints: true
      };

      const session = await service.createSession(mockUserId, mockSubjectId, undefined, customConfig);

      expect(session.config.questionsPerSession).toBe(5);
      expect(session.config.adaptiveDifficulty).toBe(false);
      expect(session.config.enableHints).toBe(true);
    });
  });

  describe('submitAnswer', () => {
    let sessionId: string;

    beforeEach(async () => {
      // Setup session
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { age: 10 }
            })
          })
        })
      } as any);

      const mockQuestions = [
        {
          id: 'q1',
          subject_id: mockSubjectId,
          question_text: 'What is 2+2?',
          answer_options: ['3', '4', '5', '6'],
          correct_answer: '4',
          difficulty_level: 1,
          xp_reward: 10,
          age_range: '7-10',
          created_at: new Date()
        }
      ];

      mockQuestionService.getAdaptiveQuestions.mockResolvedValue(mockQuestions);
      const session = await service.createSession(mockUserId, mockSubjectId);
      sessionId = session.id;
    });

    it('should submit correct answer and update session state', async () => {
      const mockResponse = {
        id: 'response-1',
        question_id: 'q1',
        user_id: mockUserId,
        selected_answer: '4',
        is_correct: true,
        xp_earned: 10,
        response_time_seconds: 5,
        created_at: new Date()
      };

      mockQuestionService.submitQuestionResponse.mockResolvedValue(mockResponse);

      const result = await service.submitAnswer(sessionId, '4', 5);

      expect(result.response).toEqual(mockResponse);
      expect(result.session.responses).toHaveLength(1);
      expect(result.session.analytics.correctAnswers).toBe(1);
      expect(result.session.analytics.totalXPEarned).toBe(10);
      expect(result.session.adaptiveDifficulty.consecutiveCorrect).toBe(1);
      expect(result.session.adaptiveDifficulty.consecutiveIncorrect).toBe(0);
    });

    it('should submit incorrect answer and update session state', async () => {
      const mockResponse = {
        id: 'response-1',
        question_id: 'q1',
        user_id: mockUserId,
        selected_answer: '3',
        is_correct: false,
        xp_earned: 0,
        response_time_seconds: 8,
        created_at: new Date()
      };

      mockQuestionService.submitQuestionResponse.mockResolvedValue(mockResponse);

      const result = await service.submitAnswer(sessionId, '3', 8);

      expect(result.response).toEqual(mockResponse);
      expect(result.session.responses).toHaveLength(1);
      expect(result.session.analytics.correctAnswers).toBe(0);
      expect(result.session.analytics.totalXPEarned).toBe(0);
      expect(result.session.adaptiveDifficulty.consecutiveCorrect).toBe(0);
      expect(result.session.adaptiveDifficulty.consecutiveIncorrect).toBe(1);
    });

    it('should throw error for invalid session', async () => {
      await expect(service.submitAnswer('invalid-session', '4', 5))
        .rejects.toThrow('Session not found');
    });
  });

  describe('nextQuestion', () => {
    let sessionId: string;

    beforeEach(async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { age: 10 }
            })
          })
        })
      } as any);

      const mockQuestions = [
        {
          id: 'q1',
          subject_id: mockSubjectId,
          question_text: 'Question 1',
          answer_options: ['A', 'B', 'C', 'D'],
          correct_answer: 'A',
          difficulty_level: 1,
          xp_reward: 10,
          age_range: '7-10',
          created_at: new Date()
        },
        {
          id: 'q2',
          subject_id: mockSubjectId,
          question_text: 'Question 2',
          answer_options: ['A', 'B', 'C', 'D'],
          correct_answer: 'B',
          difficulty_level: 2,
          xp_reward: 20,
          age_range: '7-10',
          created_at: new Date()
        }
      ];

      mockQuestionService.getAdaptiveQuestions.mockResolvedValue(mockQuestions);
      const session = await service.createSession(mockUserId, mockSubjectId);
      sessionId = session.id;
    });

    it('should move to next question', () => {
      const updatedSession = service.nextQuestion(sessionId);

      expect(updatedSession.currentQuestionIndex).toBe(1);
      expect(updatedSession.isComplete).toBe(false);
    });

    it('should complete session when no more questions', () => {
      // Move to last question
      service.nextQuestion(sessionId);
      
      // Move past last question
      const updatedSession = service.nextQuestion(sessionId);

      expect(updatedSession.isComplete).toBe(true);
      expect(updatedSession.endTime).toBeDefined();
    });
  });

  describe('getProgress', () => {
    let sessionId: string;

    beforeEach(async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { age: 10 }
            })
          })
        })
      } as any);

      const mockQuestions = Array.from({ length: 5 }, (_, i) => ({
        id: `q${i + 1}`,
        subject_id: mockSubjectId,
        question_text: `Question ${i + 1}`,
        answer_options: ['A', 'B', 'C', 'D'],
        correct_answer: 'A',
        difficulty_level: 1,
        xp_reward: 10,
        age_range: '7-10',
        created_at: new Date()
      }));

      mockQuestionService.getAdaptiveQuestions.mockResolvedValue(mockQuestions);
      const session = await service.createSession(mockUserId, mockSubjectId);
      sessionId = session.id;
    });

    it('should return correct progress information', () => {
      const progress = service.getProgress(sessionId);

      expect(progress).toEqual({
        current: 1,
        total: 5,
        percentage: 20,
        correctAnswers: 0,
        totalXPEarned: 0,
        accuracy: 0,
        averageResponseTime: 0
      });
    });

    it('should return null for invalid session', () => {
      const progress = service.getProgress('invalid-session');
      expect(progress).toBeNull();
    });
  });

  describe('adaptive difficulty', () => {
    let sessionId: string;

    beforeEach(async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { age: 10 }
            })
          })
        })
      } as any);

      const mockQuestions = Array.from({ length: 10 }, (_, i) => ({
        id: `q${i + 1}`,
        subject_id: mockSubjectId,
        question_text: `Question ${i + 1}`,
        answer_options: ['A', 'B', 'C', 'D'],
        correct_answer: 'A',
        difficulty_level: 2,
        xp_reward: 20,
        age_range: '7-10',
        created_at: new Date()
      }));

      mockQuestionService.getAdaptiveQuestions.mockResolvedValue(mockQuestions);
      const session = await service.createSession(mockUserId, mockSubjectId);
      sessionId = session.id;
    });

    it('should increase difficulty after consecutive correct answers', async () => {
      const mockResponse = {
        id: 'response-1',
        question_id: 'q1',
        user_id: mockUserId,
        selected_answer: 'A',
        is_correct: true,
        xp_earned: 20,
        response_time_seconds: 5,
        created_at: new Date()
      };

      mockQuestionService.submitQuestionResponse.mockResolvedValue(mockResponse);

      // Submit 3 consecutive correct answers
      for (let i = 0; i < 3; i++) {
        await service.submitAnswer(sessionId, 'A', 5);
      }

      const session = service.getSession(sessionId);
      expect(session?.adaptiveDifficulty.currentDifficulty).toBe(3);
    });

    it('should decrease difficulty after consecutive incorrect answers', async () => {
      const mockResponse = {
        id: 'response-1',
        question_id: 'q1',
        user_id: mockUserId,
        selected_answer: 'B',
        is_correct: false,
        xp_earned: 0,
        response_time_seconds: 10,
        created_at: new Date()
      };

      mockQuestionService.submitQuestionResponse.mockResolvedValue(mockResponse);

      // Submit 3 consecutive incorrect answers
      for (let i = 0; i < 3; i++) {
        await service.submitAnswer(sessionId, 'B', 10);
      }

      const session = service.getSession(sessionId);
      expect(session?.adaptiveDifficulty.currentDifficulty).toBe(1);
    });
  });

  describe('completion bonuses', () => {
    it('should calculate completion bonus based on performance', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { age: 10 }
            })
          })
        }),
        insert: vi.fn().mockResolvedValue({ data: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null })
        })
      } as any);

      mockSupabase.rpc = vi.fn().mockResolvedValue({ data: null });

      const mockQuestions = [
        {
          id: 'q1',
          subject_id: mockSubjectId,
          question_text: 'Question 1',
          answer_options: ['A', 'B', 'C', 'D'],
          correct_answer: 'A',
          difficulty_level: 1,
          xp_reward: 10,
          age_range: '7-10',
          created_at: new Date()
        }
      ];

      mockQuestionService.getAdaptiveQuestions.mockResolvedValue(mockQuestions);
      const session = await service.createSession(mockUserId, mockSubjectId);

      // Set up high performance analytics
      session.analytics.accuracy = 95;
      session.analytics.averageResponseTime = 4;
      session.analytics.totalXPEarned = 50; // Base XP from questions

      // Mock character data for bonus awarding
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'char-1', total_xp: 100 }
            })
          })
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null })
        }),
        insert: vi.fn().mockResolvedValue({ data: null })
      } as any);

      const analytics = await service.completeSession(session.id);

      // Base XP (50) + High accuracy (50) + fast response (30) + completion (25) = 155 total
      expect(analytics.totalXPEarned).toBeGreaterThan(100);
    });
  });

  describe('session cleanup', () => {
    it('should clean up expired sessions', async () => {
      // Create a session and manually set old start time
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { age: 10 }
            })
          })
        })
      } as any);

      const mockQuestions = [
        {
          id: 'q1',
          subject_id: mockSubjectId,
          question_text: 'Question 1',
          answer_options: ['A', 'B', 'C', 'D'],
          correct_answer: 'A',
          difficulty_level: 1,
          xp_reward: 10,
          age_range: '7-10',
          created_at: new Date()
        }
      ];

      mockQuestionService.getAdaptiveQuestions.mockResolvedValue(mockQuestions);
      const session = await service.createSession(mockUserId, mockSubjectId);

      // Manually set old start time (3 hours ago)
      session.startTime = new Date(Date.now() - 3 * 60 * 60 * 1000);

      expect(service.getSession(session.id)).toBeDefined();

      service.cleanupExpiredSessions();

      expect(service.getSession(session.id)).toBeNull();
    });
  });
});