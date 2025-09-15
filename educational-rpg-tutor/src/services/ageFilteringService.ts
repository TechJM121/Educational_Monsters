import { supabase } from './supabaseClient';
import type { Question } from '../types/question';

export interface AgeFilterCriteria {
  minAge: number;
  maxAge: number;
  difficultyRange: [number, number];
  contentComplexity: 'simple' | 'moderate' | 'complex';
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced';
}

export interface FilteredContent {
  questions: Question[];
  totalFiltered: number;
  filterCriteria: AgeFilterCriteria;
  recommendations: string[];
}

export class AgeFilteringService {
  /**
   * Get age-appropriate content for a specific user
   */
  async getAgeAppropriateContent(
    userId: string,
    subjectId?: string,
    limit: number = 20
  ): Promise<FilteredContent> {
    // Get user's age
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('age')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error(`Failed to fetch user data: ${userError?.message}`);
    }

    const age = user.age;
    const ageRange = this.getAgeRange(age);
    const filterCriteria = this.getFilterCriteriaForAge(age);

    // Get questions filtered by age range and difficulty
    let query = supabase
      .from('questions')
      .select(`
        *,
        subjects (
          name,
          primary_stat,
          secondary_stat
        )
      `)
      .eq('age_range', ageRange)
      .gte('difficulty_level', filterCriteria.difficultyRange[0])
      .lte('difficulty_level', filterCriteria.difficultyRange[1]);

    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }

    const { data: allQuestions, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    // Apply additional content filtering
    const filteredQuestions = (allQuestions || [])
      .map(this.mapDatabaseQuestionToQuestion)
      .filter(question => this.isContentAppropriate(question, filterCriteria))
      .slice(0, limit);

    const recommendations = this.generateRecommendations(age, filteredQuestions.length, limit);

    return {
      questions: filteredQuestions,
      totalFiltered: allQuestions?.length || 0,
      filterCriteria,
      recommendations
    };
  }

  /**
   * Get age range string for a specific age
   */
  private getAgeRange(age: number): string {
    if (age <= 6) return '3-6';
    if (age <= 10) return '7-10';
    if (age <= 14) return '11-14';
    return '15-18';
  }

  /**
   * Get filter criteria based on age
   */
  private getFilterCriteriaForAge(age: number): AgeFilterCriteria {
    if (age <= 6) {
      return {
        minAge: 3,
        maxAge: 6,
        difficultyRange: [1, 2],
        contentComplexity: 'simple',
        vocabularyLevel: 'basic'
      };
    } else if (age <= 10) {
      return {
        minAge: 7,
        maxAge: 10,
        difficultyRange: [2, 3],
        contentComplexity: 'moderate',
        vocabularyLevel: 'intermediate'
      };
    } else if (age <= 14) {
      return {
        minAge: 11,
        maxAge: 14,
        difficultyRange: [3, 4],
        contentComplexity: 'moderate',
        vocabularyLevel: 'intermediate'
      };
    } else {
      return {
        minAge: 15,
        maxAge: 18,
        difficultyRange: [4, 5],
        contentComplexity: 'complex',
        vocabularyLevel: 'advanced'
      };
    }
  }

  /**
   * Check if content is appropriate for the given criteria
   */
  private isContentAppropriate(question: Question, criteria: AgeFilterCriteria): boolean {
    // Check vocabulary complexity
    if (!this.isVocabularyAppropriate(question.questionText, criteria.vocabularyLevel)) {
      return false;
    }

    // Check content complexity
    if (!this.isContentComplexityAppropriate(question, criteria.contentComplexity)) {
      return false;
    }

    // Check for age-inappropriate topics
    if (!this.isTopicAgeAppropriate(question.questionText, criteria.minAge, criteria.maxAge)) {
      return false;
    }

    return true;
  }

  /**
   * Check if vocabulary is appropriate for the age group
   */
  private isVocabularyAppropriate(text: string, level: 'basic' | 'intermediate' | 'advanced'): boolean {
    const words = text.toLowerCase().split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    // Complex words that might be inappropriate for younger ages
    const complexWords = [
      'sophisticated', 'comprehensive', 'fundamental', 'significant', 'demonstrate',
      'analyze', 'synthesize', 'evaluate', 'hypothesis', 'theoretical'
    ];

    const complexWordCount = words.filter(word => complexWords.includes(word)).length;
    const complexWordRatio = complexWordCount / words.length;

    switch (level) {
      case 'basic':
        return avgWordLength <= 5 && complexWordRatio <= 0.05;
      case 'intermediate':
        return avgWordLength <= 7 && complexWordRatio <= 0.15;
      case 'advanced':
        return true; // No restrictions for advanced level
      default:
        return true;
    }
  }

  /**
   * Check if content complexity is appropriate
   */
  private isContentComplexityAppropriate(
    question: Question,
    complexity: 'simple' | 'moderate' | 'complex'
  ): boolean {
    const questionLength = question.questionText.length;
    const answerCount = question.answerOptions.length;
    const avgAnswerLength = question.answerOptions.reduce((sum, answer) => sum + answer.length, 0) / answerCount;

    switch (complexity) {
      case 'simple':
        return questionLength <= 150 && answerCount <= 4 && avgAnswerLength <= 20;
      case 'moderate':
        return questionLength <= 300 && answerCount <= 5 && avgAnswerLength <= 40;
      case 'complex':
        return true; // No restrictions for complex content
      default:
        return true;
    }
  }

  /**
   * Check if topic is age-appropriate
   */
  private isTopicAgeAppropriate(text: string, minAge: number, maxAge: number): boolean {
    const lowerText = text.toLowerCase();

    // Topics inappropriate for young children (3-6)
    if (maxAge <= 6) {
      const inappropriateTopics = [
        'death', 'violence', 'war', 'disease', 'injury', 'scary', 'frightening',
        'complex mathematics', 'advanced science', 'politics', 'economics'
      ];
      
      for (const topic of inappropriateTopics) {
        if (lowerText.includes(topic)) {
          return false;
        }
      }
    }

    // Topics that might be too advanced for elementary (7-10)
    if (maxAge <= 10) {
      const advancedTopics = [
        'calculus', 'trigonometry', 'advanced chemistry', 'quantum physics',
        'complex political systems', 'advanced economics', 'philosophy'
      ];
      
      for (const topic of advancedTopics) {
        if (lowerText.includes(topic)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Generate recommendations based on filtering results
   */
  private generateRecommendations(age: number, foundCount: number, requestedCount: number): string[] {
    const recommendations: string[] = [];

    if (foundCount < requestedCount) {
      recommendations.push(`Only ${foundCount} age-appropriate questions found out of ${requestedCount} requested`);
      
      if (age <= 6) {
        recommendations.push('Consider adding more simple questions with basic vocabulary for young learners');
      } else if (age <= 10) {
        recommendations.push('More elementary-level content needed for this age group');
      } else if (age <= 14) {
        recommendations.push('Additional middle school appropriate content would be beneficial');
      } else {
        recommendations.push('More advanced high school level content could be added');
      }
    }

    if (foundCount === 0) {
      recommendations.push('No age-appropriate content found. Consider reviewing content difficulty levels');
    }

    return recommendations;
  }

  /**
   * Get content statistics for age groups
   */
  async getContentStatsByAge(): Promise<Record<string, { total: number; byDifficulty: Record<number, number> }>> {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('age_range, difficulty_level');

    if (error) {
      throw new Error(`Failed to fetch content stats: ${error.message}`);
    }

    const stats: Record<string, { total: number; byDifficulty: Record<number, number> }> = {};

    for (const question of questions || []) {
      const ageRange = question.age_range;
      const difficulty = question.difficulty_level;

      if (!stats[ageRange]) {
        stats[ageRange] = { total: 0, byDifficulty: {} };
      }

      stats[ageRange].total++;
      stats[ageRange].byDifficulty[difficulty] = (stats[ageRange].byDifficulty[difficulty] || 0) + 1;
    }

    return stats;
  }

  /**
   * Validate content against age filtering rules
   */
  async validateContentForAge(
    questionText: string,
    answerOptions: string[],
    targetAge: number
  ): Promise<{ isValid: boolean; issues: string[]; suggestions: string[] }> {
    const issues: string[] = [];
    const suggestions: string[] = [];
    const criteria = this.getFilterCriteriaForAge(targetAge);

    // Check vocabulary
    if (!this.isVocabularyAppropriate(questionText, criteria.vocabularyLevel)) {
      issues.push('Vocabulary may be too complex for target age group');
      suggestions.push('Consider using simpler words and shorter sentences');
    }

    // Check content complexity
    const mockQuestion: Question = {
      id: 'temp',
      subjectId: 'temp',
      questionText,
      answerOptions,
      correctAnswer: answerOptions[0],
      difficultyLevel: 1,
      xpReward: 10,
      ageRange: this.getAgeRange(targetAge),
      createdAt: new Date()
    };

    if (!this.isContentComplexityAppropriate(mockQuestion, criteria.contentComplexity)) {
      issues.push('Content complexity may be inappropriate for target age group');
      suggestions.push('Consider shortening the question or reducing the number of answer options');
    }

    // Check topic appropriateness
    if (!this.isTopicAgeAppropriate(questionText, criteria.minAge, criteria.maxAge)) {
      issues.push('Topic may not be age-appropriate');
      suggestions.push('Review content for age-appropriate themes and concepts');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }

  /**
   * Map database question to Question type
   */
  private mapDatabaseQuestionToQuestion(dbQuestion: any): Question {
    return {
      id: dbQuestion.id,
      subjectId: dbQuestion.subject_id,
      questionText: dbQuestion.question_text,
      answerOptions: dbQuestion.answer_options,
      correctAnswer: dbQuestion.correct_answer,
      difficultyLevel: dbQuestion.difficulty_level,
      xpReward: dbQuestion.xp_reward,
      ageRange: dbQuestion.age_range,
      createdAt: new Date(dbQuestion.created_at)
    };
  }
}

export const ageFilteringService = new AgeFilteringService();