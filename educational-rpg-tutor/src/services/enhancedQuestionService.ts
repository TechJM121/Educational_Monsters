import { supabase } from './supabaseClient';
import type { Question, QuestionResponse, Subject } from '../types/question';

export interface QuestionFilters {
  subjectId?: string;
  ageRange?: string;
  difficultyLevel?: number;
  limit?: number;
  excludeAnswered?: boolean;
  userId?: string;
}

export interface QuestionBatch {
  questions: Question[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface SubjectProgress {
  subjectId: string;
  subjectName: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  accuracy: number;
  averageDifficulty: number;
  lastActivity: Date | null;
}

export class EnhancedQuestionService {
  private questionCache = new Map<string, Question[]>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Load questions with advanced filtering and caching
   */
  async loadQuestions(filters: QuestionFilters): Promise<QuestionBatch> {
    const cacheKey = this.generateCacheKey(filters);
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      const cachedQuestions = this.questionCache.get(cacheKey) || [];
      return {
        questions: cachedQuestions,
        totalCount: cachedQuestions.length,
        hasMore: false
      };
    }

    try {
      let query = supabase
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
        `);

      // Apply filters
      if (filters.subjectId) {
        query = query.eq('subject_id', filters.subjectId);
      }

      if (filters.ageRange) {
        query = query.eq('age_range', filters.ageRange);
      }

      if (filters.difficultyLevel) {
        query = query.eq('difficulty_level', filters.difficultyLevel);
      }

      // Exclude already answered questions if requested
      if (filters.excludeAnswered && filters.userId) {
        const { data: answeredQuestions } = await supabase
          .from('question_responses')
          .select('question_id')
          .eq('user_id', filters.userId);

        if (answeredQuestions && answeredQuestions.length > 0) {
          const answeredIds = answeredQuestions.map(q => q.question_id);
          query = query.not('id', 'in', `(${answeredIds.join(',')})`);
        }
      }

      // Apply limit and ordering
      const limit = filters.limit || 50;
      query = query
        .order('difficulty_level', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(limit);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to load questions: ${error.message}`);
      }

      const questions = data || [];
      
      // Cache the results
      this.questionCache.set(cacheKey, questions);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return {
        questions,
        totalCount: count || questions.length,
        hasMore: questions.length === limit
      };
    } catch (error) {
      console.error('Error loading questions:', error);
      throw error;
    }
  }

  /**
   * Get adaptive questions based on user performance
   */
  async getAdaptiveQuestions(
    userId: string,
    ageRange: string,
    subjectId?: string,
    limit: number = 10
  ): Promise<Question[]> {
    try {
      // Get user's recent performance
      const performance = await this.getUserPerformance(userId, subjectId);
      
      // Determine optimal difficulty based on performance
      const targetDifficulty = this.calculateTargetDifficulty(performance);
      
      // Get questions around the target difficulty
      const difficultyRange = [
        Math.max(1, targetDifficulty - 1),
        Math.min(5, targetDifficulty + 1)
      ];

      let query = supabase
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
        .eq('age_range', ageRange)
        .gte('difficulty_level', difficultyRange[0])
        .lte('difficulty_level', difficultyRange[1]);

      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      // Exclude recently answered questions
      const { data: recentAnswers } = await supabase
        .from('question_responses')
        .select('question_id')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (recentAnswers && recentAnswers.length > 0) {
        const recentIds = recentAnswers.map(q => q.question_id);
        query = query.not('id', 'in', `(${recentIds.join(',')})`);
      }

      const { data, error } = await query
        .order('difficulty_level')
        .limit(limit * 2); // Get more to allow for shuffling

      if (error) {
        throw new Error(`Failed to get adaptive questions: ${error.message}`);
      }

      // Shuffle and return the requested number
      const shuffled = this.shuffleArray(data || []);
      return shuffled.slice(0, limit);
    } catch (error) {
      console.error('Error getting adaptive questions:', error);
      // Fallback to basic question loading
      const fallback = await this.loadQuestions({ ageRange, subjectId, limit });
      return fallback.questions;
    }
  }

  /**
   * Get user's performance metrics
   */
  private async getUserPerformance(userId: string, subjectId?: string) {
    let query = supabase
      .from('question_responses')
      .select(`
        is_correct,
        xp_earned,
        response_time_seconds,
        questions (difficulty_level)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20); // Last 20 responses

    if (subjectId) {
      query = query.eq('questions.subject_id', subjectId);
    }

    const { data } = await query;
    
    if (!data || data.length === 0) {
      return {
        accuracy: 0.5,
        averageDifficulty: 1,
        recentTrend: 'stable'
      };
    }

    const accuracy = data.filter(r => r.is_correct).length / data.length;
    const averageDifficulty = data.reduce((sum, r) => sum + (r.questions?.difficulty_level || 1), 0) / data.length;
    
    // Calculate recent trend (last 5 vs previous 5)
    const recent = data.slice(0, 5);
    const previous = data.slice(5, 10);
    
    const recentAccuracy = recent.length > 0 ? recent.filter(r => r.is_correct).length / recent.length : 0;
    const previousAccuracy = previous.length > 0 ? previous.filter(r => r.is_correct).length / previous.length : 0;
    
    let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAccuracy > previousAccuracy + 0.1) recentTrend = 'improving';
    else if (recentAccuracy < previousAccuracy - 0.1) recentTrend = 'declining';

    return {
      accuracy,
      averageDifficulty,
      recentTrend
    };
  }

  /**
   * Calculate target difficulty based on performance
   */
  private calculateTargetDifficulty(performance: any): number {
    let targetDifficulty = Math.round(performance.averageDifficulty);

    // Adjust based on accuracy
    if (performance.accuracy > 0.8) {
      targetDifficulty = Math.min(5, targetDifficulty + 1);
    } else if (performance.accuracy < 0.6) {
      targetDifficulty = Math.max(1, targetDifficulty - 1);
    }

    // Adjust based on recent trend
    if (performance.recentTrend === 'improving') {
      targetDifficulty = Math.min(5, targetDifficulty + 1);
    } else if (performance.recentTrend === 'declining') {
      targetDifficulty = Math.max(1, targetDifficulty - 1);
    }

    return targetDifficulty;
  }

  /**
   * Get all subjects with question counts
   */
  async getSubjectsWithCounts(ageRange?: string): Promise<Subject[]> {
    let query = supabase
      .from('subjects')
      .select(`
        *,
        questions (count)
      `);

    if (ageRange) {
      query = query.eq('questions.age_range', ageRange);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw new Error(`Failed to fetch subjects: ${error.message}`);
    }

    return data?.map(subject => ({
      id: subject.id,
      name: subject.name,
      description: subject.description || '',
      icon: this.getSubjectIcon(subject.name),
      color: this.getSubjectColor(subject.name),
      statMapping: {
        primary: subject.primary_stat,
        secondary: subject.secondary_stat
      },
      questionCount: subject.questions?.[0]?.count || 0
    })) || [];
  }

  /**
   * Get user progress across all subjects
   */
  async getUserProgressBySubject(userId: string, ageRange?: string): Promise<SubjectProgress[]> {
    const subjects = await this.getSubjectsWithCounts(ageRange);
    const progressData: SubjectProgress[] = [];

    for (const subject of subjects) {
      // Get total questions for this subject and age range
      let totalQuery = supabase
        .from('questions')
        .select('id', { count: 'exact' })
        .eq('subject_id', subject.id);

      if (ageRange) {
        totalQuery = totalQuery.eq('age_range', ageRange);
      }

      const { count: totalQuestions } = await totalQuery;

      // Get user's responses for this subject
      let responseQuery = supabase
        .from('question_responses')
        .select(`
          is_correct,
          created_at,
          questions!inner (
            subject_id,
            difficulty_level
          )
        `)
        .eq('user_id', userId)
        .eq('questions.subject_id', subject.id);

      if (ageRange) {
        responseQuery = responseQuery.eq('questions.age_range', ageRange);
      }

      const { data: responses } = await responseQuery;

      const answeredQuestions = responses?.length || 0;
      const correctAnswers = responses?.filter(r => r.is_correct).length || 0;
      const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
      const averageDifficulty = responses && responses.length > 0
        ? responses.reduce((sum, r) => sum + r.questions.difficulty_level, 0) / responses.length
        : 0;
      const lastActivity = responses && responses.length > 0
        ? new Date(Math.max(...responses.map(r => new Date(r.created_at).getTime())))
        : null;

      progressData.push({
        subjectId: subject.id,
        subjectName: subject.name,
        totalQuestions: totalQuestions || 0,
        answeredQuestions,
        correctAnswers,
        accuracy,
        averageDifficulty,
        lastActivity
      });
    }

    return progressData.sort((a, b) => b.accuracy - a.accuracy);
  }

  /**
   * Bulk load questions for offline use
   */
  async bulkLoadQuestions(ageRange: string, subjectIds?: string[]): Promise<Question[]> {
    let query = supabase
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
      .eq('age_range', ageRange);

    if (subjectIds && subjectIds.length > 0) {
      query = query.in('subject_id', subjectIds);
    }

    const { data, error } = await query
      .order('subject_id')
      .order('difficulty_level');

    if (error) {
      throw new Error(`Failed to bulk load questions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Search questions by text content
   */
  async searchQuestions(
    searchTerm: string,
    filters: Omit<QuestionFilters, 'limit'> = {},
    limit: number = 20
  ): Promise<Question[]> {
    let query = supabase
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
      .textSearch('question_text', searchTerm);

    // Apply other filters
    if (filters.subjectId) {
      query = query.eq('subject_id', filters.subjectId);
    }

    if (filters.ageRange) {
      query = query.eq('age_range', filters.ageRange);
    }

    if (filters.difficultyLevel) {
      query = query.eq('difficulty_level', filters.difficultyLevel);
    }

    const { data, error } = await query
      .order('difficulty_level')
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search questions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Utility methods
   */
  private generateCacheKey(filters: QuestionFilters): string {
    return JSON.stringify(filters);
  }

  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getSubjectIcon(subjectName: string): string {
    const icons: Record<string, string> = {
      'Mathematics': '🔢',
      'Science': '🔬',
      'Biology': '🧬',
      'History': '📚',
      'Language Arts': '📝',
      'Art': '🎨'
    };
    return icons[subjectName] || '📖';
  }

  private getSubjectColor(subjectName: string): string {
    const colors: Record<string, string> = {
      'Mathematics': '#3B82F6',
      'Science': '#10B981',
      'Biology': '#059669',
      'History': '#F59E0B',
      'Language Arts': '#8B5CF6',
      'Art': '#EF4444'
    };
    return colors[subjectName] || '#6B7280';
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.questionCache.clear();
    this.cacheExpiry.clear();
  }
}

export const enhancedQuestionService = new EnhancedQuestionService();