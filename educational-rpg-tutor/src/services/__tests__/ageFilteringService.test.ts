import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ageFilteringService } from '../ageFilteringService';
import { supabase } from '../supabaseClient';

// Mock Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          gte: vi.fn(() => ({
            lte: vi.fn()
          }))
        })),
        gte: vi.fn(() => ({
          lte: vi.fn()
        }))
      }))
    }))
  }
}));

describe('AgeFilteringService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAgeAppropriateContent', () => {
    it('should return age-appropriate content for young children', async () => {
      const mockUser = { age: 5 };
      const mockQuestions = [
        {
          id: 'q1',
          subject_id: 'math-001',
          question_text: 'What color is the apple?',
          answer_options: ['Red', 'Blue', 'Green'],
          correct_answer: 'Red',
          difficulty_level: 1,
          xp_reward: 5,
          age_range: '3-6',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      // Mock user fetch
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
          })
        })
      });

      // Mock questions fetch
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({ data: mockQuestions, error: null })
            })
          })
        })
      });

      const result = await ageFilteringService.getAgeAppropriateContent('user-123');

      expect(result.questions).toHaveLength(1);
      expect(result.filterCriteria.minAge).toBe(3);
      expect(result.filterCriteria.maxAge).toBe(6);
      expect(result.filterCriteria.contentComplexity).toBe('simple');
      expect(result.filterCriteria.vocabularyLevel).toBe('basic');
    });

    it('should return appropriate content for teenagers', async () => {
      const mockUser = { age: 16 };
      const mockQuestions = [
        {
          id: 'q1',
          subject_id: 'math-001',
          question_text: 'Solve for x: 2x + 5 = 15',
          answer_options: ['3', '5', '7', '10'],
          correct_answer: '5',
          difficulty_level: 4,
          xp_reward: 25,
          age_range: '15-18',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      // Mock user fetch
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
          })
        })
      });

      // Mock questions fetch
      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({ data: mockQuestions, error: null })
            })
          })
        })
      });

      const result = await ageFilteringService.getAgeAppropriateContent('user-123');

      expect(result.questions).toHaveLength(1);
      expect(result.filterCriteria.minAge).toBe(15);
      expect(result.filterCriteria.maxAge).toBe(18);
      expect(result.filterCriteria.contentComplexity).toBe('complex');
      expect(result.filterCriteria.vocabularyLevel).toBe('advanced');
    });

    it('should handle user not found error', async () => {
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'User not found' } })
          })
        })
      });

      await expect(
        ageFilteringService.getAgeAppropriateContent('invalid-user')
      ).rejects.toThrow('Failed to fetch user data: User not found');
    });
  });

  describe('validateContentForAge', () => {
    it('should validate simple content for young children', async () => {
      const result = await ageFilteringService.validateContentForAge(
        'What color is the ball?',
        ['Red', 'Blue', 'Green'],
        5
      );

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should identify complex vocabulary for young children', async () => {
      const result = await ageFilteringService.validateContentForAge(
        'What is the sophisticated methodology for analyzing comprehensive data?',
        ['Statistical analysis', 'Qualitative research', 'Quantitative methods'],
        6
      );

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues).toContain('Vocabulary may be too complex for target age group');
      expect(result.suggestions).toContain('Consider using simpler words and shorter sentences');
    });

    it('should identify inappropriate content complexity', async () => {
      const longQuestion = 'This is a very long and complex question that goes on and on with many details and explanations that would be overwhelming for young children to process and understand effectively in a learning environment';
      
      const result = await ageFilteringService.validateContentForAge(
        longQuestion,
        ['A', 'B', 'C', 'D', 'E', 'F'],
        7
      );

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Content complexity may be inappropriate for target age group');
      expect(result.suggestions).toContain('Consider shortening the question or reducing the number of answer options');
    });

    it('should allow complex content for older students', async () => {
      const result = await ageFilteringService.validateContentForAge(
        'Analyze the socioeconomic factors that contributed to the Industrial Revolution and evaluate their long-term impact on modern society.',
        ['Economic transformation', 'Social stratification', 'Technological advancement', 'Cultural evolution'],
        17
      );

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('getContentStatsByAge', () => {
    it('should return content statistics by age group', async () => {
      const mockQuestions = [
        { age_range: '3-6', difficulty_level: 1 },
        { age_range: '3-6', difficulty_level: 1 },
        { age_range: '3-6', difficulty_level: 2 },
        { age_range: '7-10', difficulty_level: 2 },
        { age_range: '7-10', difficulty_level: 3 },
        { age_range: '11-14', difficulty_level: 3 },
        { age_range: '11-14', difficulty_level: 4 },
        { age_range: '15-18', difficulty_level: 4 },
        { age_range: '15-18', difficulty_level: 5 }
      ];

      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockQuestions, error: null })
      });

      const result = await ageFilteringService.getContentStatsByAge();

      expect(result['3-6'].total).toBe(3);
      expect(result['3-6'].byDifficulty[1]).toBe(2);
      expect(result['3-6'].byDifficulty[2]).toBe(1);
      
      expect(result['7-10'].total).toBe(2);
      expect(result['7-10'].byDifficulty[2]).toBe(1);
      expect(result['7-10'].byDifficulty[3]).toBe(1);
      
      expect(result['11-14'].total).toBe(2);
      expect(result['15-18'].total).toBe(2);
    });

    it('should handle database errors gracefully', async () => {
      (supabase.from as Mock).mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
      });

      await expect(
        ageFilteringService.getContentStatsByAge()
      ).rejects.toThrow('Failed to fetch content stats: Database error');
    });
  });

  describe('age range mapping', () => {
    it('should correctly map ages to ranges', async () => {
      // Test through the public validateContentForAge method which uses private getAgeRange
      const youngChild = await ageFilteringService.validateContentForAge('Test', ['A', 'B'], 4);
      const elementary = await ageFilteringService.validateContentForAge('Test', ['A', 'B'], 8);
      const middleSchool = await ageFilteringService.validateContentForAge('Test', ['A', 'B'], 12);
      const highSchool = await ageFilteringService.validateContentForAge('Test', ['A', 'B'], 16);

      // All should be valid for simple content, but we can infer age ranges from the validation logic
      expect(youngChild.isValid).toBe(true);
      expect(elementary.isValid).toBe(true);
      expect(middleSchool.isValid).toBe(true);
      expect(highSchool.isValid).toBe(true);
    });
  });

  describe('content filtering edge cases', () => {
    it('should handle empty question lists', async () => {
      const mockUser = { age: 10 };

      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
          })
        })
      });

      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          })
        })
      });

      const result = await ageFilteringService.getAgeAppropriateContent('user-123');

      expect(result.questions).toHaveLength(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations).toContain('No age-appropriate content found. Consider reviewing content difficulty levels');
    });

    it('should provide recommendations when content is limited', async () => {
      const mockUser = { age: 8 };
      const limitedQuestions = [
        {
          id: 'q1',
          subject_id: 'math-001',
          question_text: 'Simple question',
          answer_options: ['A', 'B'],
          correct_answer: 'A',
          difficulty_level: 2,
          xp_reward: 10,
          age_range: '7-10',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];

      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockUser, error: null })
          })
        })
      });

      (supabase.from as Mock).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({ data: limitedQuestions, error: null })
            })
          })
        })
      });

      const result = await ageFilteringService.getAgeAppropriateContent('user-123', undefined, 10);

      expect(result.questions).toHaveLength(1);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toContain('Only 1 age-appropriate questions found out of 10 requested');
    });
  });
});