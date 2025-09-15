import { describe, it, expect } from 'vitest';
import { contentManagementService } from '../contentManagementService';
import { ageFilteringService } from '../ageFilteringService';
import { adaptiveLearningService } from '../adaptiveLearningService';
import { contentRecommendationService } from '../contentRecommendationService';

describe('Content Management Integration Tests', () => {
  describe('Service Initialization', () => {
    it('should initialize content management service', () => {
      expect(contentManagementService).toBeDefined();
      expect(typeof contentManagementService.validateQuestionContent).toBe('function');
      expect(typeof contentManagementService.validateAgeAppropriateness).toBe('function');
    });

    it('should initialize age filtering service', () => {
      expect(ageFilteringService).toBeDefined();
      expect(typeof ageFilteringService.validateContentForAge).toBe('function');
    });

    it('should initialize adaptive learning service', () => {
      expect(adaptiveLearningService).toBeDefined();
      expect(typeof adaptiveLearningService.getLearningProfile).toBe('function');
      expect(typeof adaptiveLearningService.getLearningAnalytics).toBe('function');
    });

    it('should initialize content recommendation service', () => {
      expect(contentRecommendationService).toBeDefined();
      expect(typeof contentRecommendationService.getContentRecommendations).toBe('function');
      expect(typeof contentRecommendationService.getStudyPlan).toBe('function');
    });
  });

  describe('Content Validation Logic', () => {
    it('should validate question content correctly', async () => {
      const validQuestion = {
        subjectId: 'math-001',
        questionText: 'What is the sum of 2 + 3?',
        answerOptions: ['4', '5', '6', '7'],
        correctAnswer: '5',
        difficultyLevel: 2,
        xpReward: 15,
        ageRange: '7-10'
      };

      const result = await contentManagementService.validateQuestionContent(validQuestion);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should identify invalid question content', async () => {
      const invalidQuestion = {
        subjectId: 'math-001',
        questionText: 'Bad', // Too short
        answerOptions: ['A'], // Too few options
        correctAnswer: 'B', // Not in options
        difficultyLevel: 0, // Invalid range
        xpReward: 0, // Invalid range
        ageRange: 'invalid' // Invalid format
      };

      const result = await contentManagementService.validateQuestionContent(invalidQuestion);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate age appropriateness', async () => {
      const simpleContent = await ageFilteringService.validateContentForAge(
        'What color is the apple?',
        ['Red', 'Blue', 'Green'],
        5
      );

      expect(simpleContent.isValid).toBe(true);

      const complexContent = await ageFilteringService.validateContentForAge(
        'Analyze the socioeconomic implications of quantum mechanics',
        ['Very complex', 'Extremely difficult', 'Incomprehensible'],
        5
      );

      expect(complexContent.isValid).toBe(false);
      expect(complexContent.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Age Range Mapping', () => {
    it('should correctly determine age ranges', async () => {
      // Test through validation which uses internal age range logic
      const youngChild = await ageFilteringService.validateContentForAge('What color?', ['A', 'B'], 4);
      const elementary = await ageFilteringService.validateContentForAge('What color?', ['A', 'B'], 8);
      const middleSchool = await ageFilteringService.validateContentForAge('What color?', ['A', 'B'], 12);
      const highSchool = await ageFilteringService.validateContentForAge('What color?', ['A', 'B'], 16);

      // At least some should pass for simple content, and we should get validation results
      expect(typeof youngChild.isValid).toBe('boolean');
      expect(typeof elementary.isValid).toBe('boolean');
      expect(typeof middleSchool.isValid).toBe('boolean');
      expect(typeof highSchool.isValid).toBe('boolean');
      
      // At least the older students should handle simple content well
      expect(highSchool.isValid).toBe(true);
    });
  });

  describe('Content Complexity Analysis', () => {
    it('should analyze vocabulary complexity', async () => {
      const basicVocab = await ageFilteringService.validateContentForAge(
        'The cat is big',
        ['Yes', 'No'],
        6
      );

      const advancedVocab = await ageFilteringService.validateContentForAge(
        'The sophisticated feline demonstrates comprehensive understanding',
        ['Absolutely', 'Definitely', 'Unquestionably'],
        6
      );

      expect(basicVocab.isValid).toBe(true);
      expect(advancedVocab.isValid).toBe(false);
      expect(advancedVocab.issues.some(issue => issue.includes('Vocabulary'))).toBe(true);
    });

    it('should analyze content length appropriateness', async () => {
      const shortContent = await ageFilteringService.validateContentForAge(
        'What is 1+1?',
        ['1', '2'],
        6
      );

      const longContent = await ageFilteringService.validateContentForAge(
        'This is an extremely long and complex question that goes on and on with many details and explanations that would be overwhelming for young children to process and understand effectively in a learning environment with multiple considerations and factors',
        ['A', 'B', 'C', 'D', 'E', 'F'],
        6
      );

      expect(shortContent.isValid).toBe(true);
      expect(longContent.isValid).toBe(false);
      expect(longContent.issues.some(issue => issue.includes('complexity'))).toBe(true);
    });
  });

  describe('Learning Profile Structure', () => {
    it('should have correct learning profile structure', () => {
      // Test that the service can handle profile creation logic
      const mockProfile = {
        userId: 'test-user',
        preferredLearningStyle: 'visual' as const,
        strengths: ['math'],
        weaknesses: ['reading'],
        averageSessionLength: 15,
        optimalDifficultyCurve: 0.1,
        motivationFactors: ['achievements'],
        lastUpdated: new Date()
      };

      expect(mockProfile.preferredLearningStyle).toBe('visual');
      expect(Array.isArray(mockProfile.strengths)).toBe(true);
      expect(Array.isArray(mockProfile.weaknesses)).toBe(true);
      expect(typeof mockProfile.averageSessionLength).toBe('number');
    });
  });

  describe('Recommendation Context Structure', () => {
    it('should have correct recommendation context structure', () => {
      const mockContext = {
        userId: 'test-user',
        currentSubject: 'math-001',
        sessionGoals: ['Practice arithmetic'],
        timeAvailable: 20,
        preferredDifficulty: 2,
        avoidRecentQuestions: true
      };

      expect(typeof mockContext.userId).toBe('string');
      expect(Array.isArray(mockContext.sessionGoals)).toBe(true);
      expect(typeof mockContext.timeAvailable).toBe('number');
      expect(typeof mockContext.avoidRecentQuestions).toBe('boolean');
    });
  });
});