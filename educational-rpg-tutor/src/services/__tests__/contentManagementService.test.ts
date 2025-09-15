import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { contentManagementService } from '../contentManagementService';
import { supabase } from '../supabaseClient';
import type { Question } from '../../types/question';

// Mock Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn()
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        })),
        ilike: vi.fn(() => ({
          limit: vi.fn(() => ({
            range: vi.fn()
          }))
        }))
      }))
    }))
  }
}));

describe('ContentManagementService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createQuestion', () => {
    it('should create a valid question successfully', async () => {
      const mockQuestion = {
        subjectId: 'math-001',
        questionText: 'What is 2 + 2?',
        answerOptions: ['3', '4', '5', '6'],
        correctAnswer: '4',
        difficultyLevel: 1,
        xpReward: 10,
        ageRange: '7-10'
      };

      const mockDbResponse = {
        id: 'question-123',
        subject_id: 'math-001',
        question_text: 'What is 2 + 2?',
        answer_options: ['3', '4', '5', '6'],
        correct_answer: '4',
        difficulty_level: 1,
        xp_reward: 10,
        age_range: '7-10',
        created_at: '2024-01-01T00:00:00Z'
      };

      (supabase.from as Mock).mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockDbResponse, error: null })
          })
        })
      });

      const result = await contentManagementService.createQuestion(mockQuestion, 'teacher-123');

      expect(result).toEqual({
        id: 'question-123',
        subjectId: 'math-001',
        questionText: 'What is 2 + 2?',
        answerOptions: ['3', '4', '5', '6'],
        correctAnswer: '4',
        difficultyLevel: 1,
        xpReward: 10,
        ageRange: '7-10',
        createdAt: new Date('2024-01-01T00:00:00Z')
      });
    });

    it('should reject question with invalid data', async () => {
      const invalidQuestion = {
        subjectId: 'math-001',
        questionText: 'Short', // Too short
        answerOptions: ['A'], // Too few options
        correctAnswer: 'B', // Not in options
        difficultyLevel: 6, // Invalid range
        xpReward: 150, // Too high
        ageRange: '25-30' // Invalid age range
      };

      await expect(
        contentManagementService.createQuestion(invalidQuestion, 'teacher-123')
      ).rejects.toThrow('Question validation failed');
    });
  });

  describe('validateQuestionContent', () => {
    it('should validate a correct question', async () => {
      const validQuestion = {
        subjectId: 'math-001',
        questionText: 'What is the result of 5 + 3?',
        answerOptions: ['6', '7', '8', '9'],
        correctAnswer: '8',
        difficultyLevel: 2,
        xpReward: 15,
        ageRange: '7-10'
      };

      const result = await contentManagementService.validateQuestionContent(validQuestion);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should identify validation errors', async () => {
      const invalidQuestion = {
        subjectId: 'math-001',
        questionText: 'Short',
        answerOptions: ['A'],
        correctAnswer: 'B',
        difficultyLevel: 0,
        xpReward: 0,
        ageRange: 'invalid'
      };

      const result = await contentManagementService.validateQuestionContent(invalidQuestion);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Question text must be at least 10 characters long');
      expect(result.errors).toContain('Question must have at least 2 answer options');
      expect(result.errors).toContain('Correct answer must be one of the provided options');
    });

    it('should provide warnings for suboptimal questions', async () => {
      const suboptimalQuestion = {
        subjectId: 'math-001',
        questionText: 'What is the result of this complex mathematical operation?',
        answerOptions: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], // Too many options
        correctAnswer: 'A',
        difficultyLevel: 3,
        xpReward: 20,
        ageRange: '7-10'
      };

      const result = await contentManagementService.validateQuestionContent(suboptimalQuestion);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings).toContain('Questions with more than 6 options may be overwhelming for students');
    });
  });

  describe('validateAgeAppropriateness', () => {
    it('should validate age-appropriate content', async () => {
      const result = await contentManagementService.validateAgeAppropriateness(
        'What color is the sun?',
        '3-6',
        1
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should identify age-inappropriate difficulty', async () => {
      const result = await contentManagementService.validateAgeAppropriateness(
        'Solve this calculus problem',
        '3-6',
        5
      );

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Difficulty level 5 may not be appropriate for age range 3-6');
    });

    it('should identify overly complex content for young children', async () => {
      const complexContent = 'This is a very long and complex question with many sophisticated words that young children would find difficult to understand and process effectively';
      
      const result = await contentManagementService.validateAgeAppropriateness(
        complexContent,
        '3-6',
        1
      );

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('too long'))).toBe(true);
    });
  });

  describe('getQuestionsWithFilters', () => {
    it('should fetch questions with filters', async () => {
      const mockQuestions = [
        {
          id: 'q1',
          subject_id: 'math-001',
          question_text: 'What is 1+1?',
          answer_options: ['1', '2', '3'],
          correct_answer: '2',
          difficulty_level: 1,
          xp_reward: 10,
          age_range: '3-6',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({ 
              data: mockQuestions, 
              error: null, 
              count: 1 
            })
          })
        })
      });

      const result = await contentManagementService.getQuestionsWithFilters({
        subjectId: 'math-001',
        limit: 10
      });

      expect(result.questions).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.questions[0].questionText).toBe('What is 1+1?');
    });
  });

  describe('bulkImportQuestions', () => {
    it('should import valid questions and report failures', async () => {
      const questions = [
        {
          subjectId: 'math-001',
          questionText: 'What is 2 + 2?',
          answerOptions: ['3', '4', '5'],
          correctAnswer: '4',
          difficultyLevel: 1,
          xpReward: 10,
          ageRange: '7-10'
        },
        {
          subjectId: 'math-001',
          questionText: 'Bad', // Invalid - too short
          answerOptions: ['A'],
          correctAnswer: 'B',
          difficultyLevel: 1,
          xpReward: 10,
          ageRange: '7-10'
        }
      ];

      // Mock successful creation for first question
      (supabase.from as Mock).mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ 
              data: { 
                id: 'q1', 
                subject_id: 'math-001',
                question_text: 'What is 2 + 2?',
                answer_options: ['3', '4', '5'],
                correct_answer: '4',
                difficulty_level: 1,
                xp_reward: 10,
                age_range: '7-10',
                created_at: '2024-01-01T00:00:00Z'
              }, 
              error: null 
            })
          })
        })
      });

      const result = await contentManagementService.bulkImportQuestions(questions, 'teacher-123');

      expect(result.success).toHaveLength(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].error).toContain('Question validation failed');
    });
  });
});