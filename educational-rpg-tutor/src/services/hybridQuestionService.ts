// Hybrid Question Service - Uses Supabase when available, falls back to local questions
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { questionService } from './questionService';
import { enhancedQuestionService } from './enhancedQuestionService';
import { getLocalQuestions, getLocalSubjects, localQuestions } from '../data/localQuestions';
import type { Question, Subject, QuestionResponse } from '../types/question';

export interface QuestionFilters {
  ageRange?: string;
  subjectId?: string;
  difficultyLevel?: number;
  limit?: number;
  userId?: string;
}

export class HybridQuestionService {
  private supabaseAvailable: boolean | null = null;
  private lastConnectivityCheck = 0;
  private readonly CONNECTIVITY_CHECK_INTERVAL = 30000; // 30 seconds

  /**
   * Check if Supabase is available and configured
   */
  private async checkSupabaseAvailability(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (this.supabaseAvailable !== null && 
        (now - this.lastConnectivityCheck) < this.CONNECTIVITY_CHECK_INTERVAL) {
      return this.supabaseAvailable;
    }

    // If not configured, don't bother checking
    if (!isSupabaseConfigured) {
      this.supabaseAvailable = false;
      this.lastConnectivityCheck = now;
      return false;
    }

    try {
      // Try a simple query to test connectivity
      const { data, error } = await supabase
        .from('subjects')
        .select('id')
        .limit(1);

      this.supabaseAvailable = !error && data !== null;
      this.lastConnectivityCheck = now;
      
      if (error) {
        console.warn('Supabase connectivity check failed:', error.message);
      }
      
      return this.supabaseAvailable;
    } catch (error) {
      console.warn('Supabase connectivity error:', error);
      this.supabaseAvailable = false;
      this.lastConnectivityCheck = now;
      return false;
    }
  }

  /**
   * Get questions with automatic fallback to local data
   */
  async getQuestions(filters: QuestionFilters): Promise<Question[]> {
    const isSupabaseAvailable = await this.checkSupabaseAvailability();

    if (isSupabaseAvailable) {
      try {
        console.log('Using Supabase for questions');
        
        if (filters.userId) {
          // Use adaptive questions if user ID is provided
          return await enhancedQuestionService.getAdaptiveQuestions(
            filters.userId,
            filters.ageRange || '3-6',
            filters.subjectId,
            filters.limit || 10
          );
        } else {
          // Use basic question loading
          const result = await enhancedQuestionService.loadQuestions(filters);
          return result.questions;
        }
      } catch (error) {
        console.error('Supabase query failed, falling back to local questions:', error);
        // Mark as unavailable and fall through to local questions
        this.supabaseAvailable = false;
      }
    }

    console.log('Using local questions');
    return getLocalQuestions({
      ageRange: filters.ageRange,
      subjectId: filters.subjectId,
      difficultyLevel: filters.difficultyLevel,
      limit: filters.limit
    });
  }

  /**
   * Get subjects with automatic fallback
   */
  async getSubjects(): Promise<Subject[]> {
    const isSupabaseAvailable = await this.checkSupabaseAvailability();

    if (isSupabaseAvailable) {
      try {
        console.log('Using Supabase for subjects');
        return await enhancedQuestionService.getSubjectsWithCounts();
      } catch (error) {
        console.error('Supabase subjects query failed, falling back to local subjects:', error);
        this.supabaseAvailable = false;
      }
    }

    console.log('Using local subjects');
    return getLocalSubjects();
  }

  /**
   * Submit question response (only works with Supabase)
   */
  async submitQuestionResponse(
    userId: string,
    questionId: string,
    selectedAnswer: string,
    responseTimeSeconds?: number
  ): Promise<QuestionResponse | null> {
    const isSupabaseAvailable = await this.checkSupabaseAvailability();

    if (!isSupabaseAvailable) {
      console.warn('Cannot submit question response - Supabase not available');
      
      // For local questions, we can simulate a response for UI purposes
      const question = localQuestions.find(q => q.id === questionId);
      if (question) {
        const isCorrect = selectedAnswer === question.correct_answer;
        return {
          id: `local-${Date.now()}`,
          user_id: userId,
          question_id: questionId,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          xp_earned: isCorrect ? question.xp_reward : 0,
          response_time_seconds: responseTimeSeconds,
          created_at: new Date().toISOString()
        };
      }
      
      return null;
    }

    try {
      return await questionService.submitQuestionResponse(
        userId,
        questionId,
        selectedAnswer,
        responseTimeSeconds
      );
    } catch (error) {
      console.error('Failed to submit question response:', error);
      return null;
    }
  }

  /**
   * Get user progress (only works with Supabase)
   */
  async getUserProgress(userId: string, subjectId?: string) {
    const isSupabaseAvailable = await this.checkSupabaseAvailability();

    if (!isSupabaseAvailable) {
      console.warn('Cannot get user progress - Supabase not available');
      return null;
    }

    try {
      if (subjectId) {
        return await questionService.getUserProgress(userId, subjectId);
      } else {
        return await enhancedQuestionService.getUserProgressBySubject(userId);
      }
    } catch (error) {
      console.error('Failed to get user progress:', error);
      return null;
    }
  }

  /**
   * Search questions (with fallback to local filtering)
   */
  async searchQuestions(
    searchTerm: string,
    filters: Omit<QuestionFilters, 'limit'> = {},
    limit: number = 20
  ): Promise<Question[]> {
    const isSupabaseAvailable = await this.checkSupabaseAvailability();

    if (isSupabaseAvailable) {
      try {
        return await enhancedQuestionService.searchQuestions(searchTerm, filters, limit);
      } catch (error) {
        console.error('Supabase search failed, falling back to local search:', error);
        this.supabaseAvailable = false;
      }
    }

    // Local search implementation
    const localResults = localQuestions.filter(question => {
      const matchesSearch = question.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           question.explanation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           question.hint?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject = !filters.subjectId || question.subject_id === filters.subjectId;
      const matchesAge = !filters.ageRange || question.age_range === filters.ageRange;
      const matchesDifficulty = !filters.difficultyLevel || question.difficulty_level === filters.difficultyLevel;

      return matchesSearch && matchesSubject && matchesAge && matchesDifficulty;
    });

    return localResults.slice(0, limit);
  }

  /**
   * Get connectivity status
   */
  async getConnectivityStatus(): Promise<{
    isSupabaseConfigured: boolean;
    isSupabaseAvailable: boolean;
    usingLocalFallback: boolean;
  }> {
    const isAvailable = await this.checkSupabaseAvailability();
    
    return {
      isSupabaseConfigured,
      isSupabaseAvailable: isAvailable,
      usingLocalFallback: !isAvailable
    };
  }

  /**
   * Force refresh connectivity check
   */
  async refreshConnectivity(): Promise<boolean> {
    this.supabaseAvailable = null;
    this.lastConnectivityCheck = 0;
    return await this.checkSupabaseAvailability();
  }

  /**
   * Get question by ID (with fallback)
   */
  async getQuestionById(questionId: string): Promise<Question | null> {
    const isSupabaseAvailable = await this.checkSupabaseAvailability();

    if (isSupabaseAvailable) {
      try {
        const { data, error } = await supabase
          .from('questions')
          .select(`
            *,
            subjects (
              id,
              name,
              description,
              primary_stat,
              secondary_stat
            )
          `)
          .eq('id', questionId)
          .single();

        if (!error && data) {
          return data;
        }
      } catch (error) {
        console.error('Failed to get question from Supabase:', error);
      }
    }

    // Fallback to local questions
    return localQuestions.find(q => q.id === questionId) || null;
  }

  /**
   * Bulk load questions for offline use
   */
  async bulkLoadQuestions(ageRange: string, subjectIds?: string[]): Promise<Question[]> {
    const isSupabaseAvailable = await this.checkSupabaseAvailability();

    if (isSupabaseAvailable) {
      try {
        return await enhancedQuestionService.bulkLoadQuestions(ageRange, subjectIds);
      } catch (error) {
        console.error('Bulk load from Supabase failed:', error);
      }
    }

    // Return filtered local questions
    return getLocalQuestions({
      ageRange,
      subjectId: subjectIds?.[0] // For simplicity, just use first subject if multiple provided
    });
  }
}

// Export singleton instance
export const hybridQuestionService = new HybridQuestionService();