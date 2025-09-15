import { supabase } from './supabaseClient';
import type { Question, Subject } from '../types/question';

export interface ContentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ContentMetadata {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  ageRange: string;
  difficultyLevel: number;
  tags: string[];
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
  status: 'draft' | 'review' | 'approved' | 'archived';
}

export interface LessonContent {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  ageRange: string;
  difficultyLevel: number;
  content: {
    introduction: string;
    sections: LessonSection[];
    summary: string;
  };
  questions: Question[];
  metadata: ContentMetadata;
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  interactiveElements?: InteractiveElement[];
}

export interface InteractiveElement {
  type: 'quiz' | 'drag-drop' | 'matching' | 'drawing';
  config: Record<string, any>;
}

export class ContentManagementService {
  /**
   * Create a new question with validation
   */
  async createQuestion(
    questionData: Omit<Question, 'id' | 'createdAt'>,
    createdBy: string
  ): Promise<Question> {
    // Validate the question content
    const validation = await this.validateQuestionContent(questionData);
    if (!validation.isValid) {
      throw new Error(`Question validation failed: ${validation.errors.join(', ')}`);
    }

    // Check age appropriateness
    const ageValidation = await this.validateAgeAppropriateness(
      questionData.questionText,
      questionData.ageRange,
      questionData.difficultyLevel
    );
    if (!ageValidation.isValid) {
      throw new Error(`Age appropriateness check failed: ${ageValidation.errors.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('questions')
      .insert({
        subject_id: questionData.subjectId,
        question_text: questionData.questionText,
        answer_options: questionData.answerOptions,
        correct_answer: questionData.correctAnswer,
        difficulty_level: questionData.difficultyLevel,
        xp_reward: questionData.xpReward,
        age_range: questionData.ageRange
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create question: ${error.message}`);
    }

    return this.mapDatabaseQuestionToQuestion(data);
  }

  /**
   * Update an existing question with validation
   */
  async updateQuestion(
    questionId: string,
    updates: Partial<Omit<Question, 'id' | 'createdAt'>>,
    updatedBy: string
  ): Promise<Question> {
    // Get existing question
    const { data: existing, error: fetchError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (fetchError || !existing) {
      throw new Error(`Question not found: ${questionId}`);
    }

    // Merge updates with existing data
    const updatedQuestion = {
      ...this.mapDatabaseQuestionToQuestion(existing),
      ...updates
    };

    // Validate the updated question
    const validation = await this.validateQuestionContent(updatedQuestion);
    if (!validation.isValid) {
      throw new Error(`Question validation failed: ${validation.errors.join(', ')}`);
    }

    const { data, error } = await supabase
      .from('questions')
      .update({
        subject_id: updates.subjectId || existing.subject_id,
        question_text: updates.questionText || existing.question_text,
        answer_options: updates.answerOptions || existing.answer_options,
        correct_answer: updates.correctAnswer || existing.correct_answer,
        difficulty_level: updates.difficultyLevel || existing.difficulty_level,
        xp_reward: updates.xpReward || existing.xp_reward,
        age_range: updates.ageRange || existing.age_range
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update question: ${error.message}`);
    }

    return this.mapDatabaseQuestionToQuestion(data);
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (error) {
      throw new Error(`Failed to delete question: ${error.message}`);
    }
  }

  /**
   * Validate question content for educational accuracy and appropriateness
   */
  async validateQuestionContent(question: Omit<Question, 'id' | 'createdAt'>): Promise<ContentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!question.questionText || question.questionText.trim().length < 10) {
      errors.push('Question text must be at least 10 characters long');
    }

    if (!question.answerOptions || question.answerOptions.length < 2) {
      errors.push('Question must have at least 2 answer options');
    }

    if (question.answerOptions && question.answerOptions.length > 6) {
      warnings.push('Questions with more than 6 options may be overwhelming for students');
    }

    if (!question.correctAnswer || !question.answerOptions?.includes(question.correctAnswer)) {
      errors.push('Correct answer must be one of the provided options');
    }

    if (question.difficultyLevel < 1 || question.difficultyLevel > 5) {
      errors.push('Difficulty level must be between 1 and 5');
    }

    if (question.xpReward < 1 || question.xpReward > 100) {
      errors.push('XP reward must be between 1 and 100');
    }

    // Age range validation
    const validAgeRanges = ['3-6', '7-10', '11-14', '15-18'];
    if (!validAgeRanges.includes(question.ageRange)) {
      errors.push(`Age range must be one of: ${validAgeRanges.join(', ')}`);
    }

    // Content appropriateness checks
    const inappropriateWords = await this.checkInappropriateContent(question.questionText);
    if (inappropriateWords.length > 0) {
      errors.push(`Question contains inappropriate content: ${inappropriateWords.join(', ')}`);
    }

    // Check answer options for inappropriate content
    for (const option of question.answerOptions || []) {
      const optionInappropriate = await this.checkInappropriateContent(option);
      if (optionInappropriate.length > 0) {
        errors.push(`Answer option contains inappropriate content: ${optionInappropriate.join(', ')}`);
      }
    }

    // Educational accuracy checks (basic)
    if (question.questionText.includes('?') && !question.questionText.endsWith('?')) {
      warnings.push('Question should end with a question mark');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate age appropriateness of content
   */
  async validateAgeAppropriateness(
    content: string,
    ageRange: string,
    difficultyLevel: number
  ): Promise<ContentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Parse age range
    const [minAge, maxAge] = ageRange.split('-').map(Number);
    
    // Difficulty level should match age range
    const expectedDifficulty = this.getExpectedDifficultyForAge(minAge, maxAge);
    if (Math.abs(difficultyLevel - expectedDifficulty) > 1) {
      warnings.push(`Difficulty level ${difficultyLevel} may not be appropriate for age range ${ageRange}. Expected around ${expectedDifficulty}`);
    }

    // Content complexity checks
    const wordCount = content.split(' ').length;
    const avgWordLength = content.split(' ').reduce((sum, word) => sum + word.length, 0) / wordCount;

    if (minAge <= 6) {
      if (wordCount > 15) {
        warnings.push('Question may be too long for young children (3-6 years)');
      }
      if (avgWordLength > 6) {
        warnings.push('Words may be too complex for young children');
      }
    } else if (minAge <= 10) {
      if (wordCount > 25) {
        warnings.push('Question may be too long for elementary age children');
      }
      if (avgWordLength > 8) {
        warnings.push('Words may be too complex for elementary age children');
      }
    }

    // Check for age-inappropriate concepts
    const inappropriateConcepts = this.checkAgeInappropriateConcepts(content, minAge, maxAge);
    if (inappropriateConcepts.length > 0) {
      errors.push(`Content contains concepts inappropriate for age ${ageRange}: ${inappropriateConcepts.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get expected difficulty level for age range
   */
  private getExpectedDifficultyForAge(minAge: number, maxAge: number): number {
    const avgAge = (minAge + maxAge) / 2;
    
    if (avgAge <= 6) return 1;
    if (avgAge <= 10) return 2;
    if (avgAge <= 14) return 3;
    return 4;
  }

  /**
   * Check for inappropriate content (basic implementation)
   */
  private async checkInappropriateContent(text: string): Promise<string[]> {
    const inappropriateWords = [
      // Add inappropriate words list here
      // This is a basic implementation - in production, use a proper content filtering service
    ];

    const foundWords = inappropriateWords.filter(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );

    return foundWords;
  }

  /**
   * Check for age-inappropriate concepts
   */
  private checkAgeInappropriateConcepts(content: string, minAge: number, maxAge: number): string[] {
    const inappropriate: string[] = [];
    const lowerContent = content.toLowerCase();

    // Concepts too advanced for young children (3-6)
    if (minAge <= 6) {
      const advancedConcepts = ['multiplication', 'division', 'fractions', 'algebra', 'geometry'];
      for (const concept of advancedConcepts) {
        if (lowerContent.includes(concept)) {
          inappropriate.push(concept);
        }
      }
    }

    // Concepts too advanced for elementary (7-10)
    if (maxAge <= 10) {
      const highSchoolConcepts = ['calculus', 'trigonometry', 'chemistry', 'physics', 'biology'];
      for (const concept of highSchoolConcepts) {
        if (lowerContent.includes(concept)) {
          inappropriate.push(concept);
        }
      }
    }

    return inappropriate;
  }

  /**
   * Get questions with filtering and pagination
   */
  async getQuestionsWithFilters(filters: {
    subjectId?: string;
    ageRange?: string;
    difficultyLevel?: number;
    searchTerm?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ questions: Question[]; total: number }> {
    let query = supabase
      .from('questions')
      .select(`
        *,
        subjects (
          name,
          primary_stat,
          secondary_stat
        )
      `, { count: 'exact' });

    if (filters.subjectId) {
      query = query.eq('subject_id', filters.subjectId);
    }

    if (filters.ageRange) {
      query = query.eq('age_range', filters.ageRange);
    }

    if (filters.difficultyLevel) {
      query = query.eq('difficulty_level', filters.difficultyLevel);
    }

    if (filters.searchTerm) {
      query = query.ilike('question_text', `%${filters.searchTerm}%`);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`);
    }

    return {
      questions: (data || []).map(this.mapDatabaseQuestionToQuestion),
      total: count || 0
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

  /**
   * Bulk import questions from CSV or JSON
   */
  async bulkImportQuestions(
    questions: Omit<Question, 'id' | 'createdAt'>[],
    createdBy: string
  ): Promise<{ success: Question[]; failed: { question: any; error: string }[] }> {
    const success: Question[] = [];
    const failed: { question: any; error: string }[] = [];

    for (const questionData of questions) {
      try {
        const created = await this.createQuestion(questionData, createdBy);
        success.push(created);
      } catch (error) {
        failed.push({
          question: questionData,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { success, failed };
  }
}

export const contentManagementService = new ContentManagementService();