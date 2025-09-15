import { supabase } from './supabaseClient';

export interface PerformanceMetrics {
  accuracy: number;
  averageResponseTime: number;
  recentStreak: number;
  totalQuestionsAnswered: number;
  subjectMastery: number;
}

export interface DifficultyRecommendation {
  targetDifficulty: number;
  confidenceLevel: number;
  reasoning: string;
  adjustmentFactor: number;
}

export class DifficultyScalingService {
  /**
   * Calculate target difficulty based on student performance and age
   */
  async calculateTargetDifficulty(
    userId: string,
    subjectId: string,
    age: number,
    lookbackDays: number = 7
  ): Promise<DifficultyRecommendation> {
    const performance = await this.getPerformanceMetrics(userId, subjectId, lookbackDays);
    const ageBaseline = this.getAgeBaseline(age);
    
    return this.computeDifficultyRecommendation(performance, ageBaseline, age);
  }

  /**
   * Get comprehensive performance metrics for a user in a subject
   */
  private async getPerformanceMetrics(
    userId: string,
    subjectId: string,
    lookbackDays: number
  ): Promise<PerformanceMetrics> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

    // Get recent question responses
    const { data: responses, error } = await supabase
      .from('question_responses')
      .select(`
        is_correct,
        response_time_seconds,
        created_at,
        questions (
          difficulty_level,
          subject_id
        )
      `)
      .eq('user_id', userId)
      .eq('questions.subject_id', subjectId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !responses) {
      // Return default metrics for new users
      return {
        accuracy: 0.5,
        averageResponseTime: 30,
        recentStreak: 0,
        totalQuestionsAnswered: 0,
        subjectMastery: 0
      };
    }

    // Calculate accuracy
    const correctAnswers = responses.filter(r => r.is_correct).length;
    const accuracy = responses.length > 0 ? correctAnswers / responses.length : 0.5;

    // Calculate average response time
    const responseTimes = responses
      .filter(r => r.response_time_seconds && r.response_time_seconds > 0)
      .map(r => r.response_time_seconds!);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 30;

    // Calculate recent streak
    let recentStreak = 0;
    for (const response of responses) {
      if (response.is_correct) {
        recentStreak++;
      } else {
        break;
      }
    }

    // Calculate subject mastery based on difficulty progression
    const difficultyLevels = responses
      .filter(r => r.questions?.difficulty_level)
      .map(r => r.questions!.difficulty_level);
    
    const maxDifficultyAttempted = Math.max(...difficultyLevels, 1);
    const averageDifficultyMastered = difficultyLevels.length > 0
      ? difficultyLevels.reduce((sum, diff) => sum + diff, 0) / difficultyLevels.length
      : 1;
    
    const subjectMastery = Math.min(
      (averageDifficultyMastered / 5) * accuracy,
      1.0
    );

    return {
      accuracy,
      averageResponseTime,
      recentStreak,
      totalQuestionsAnswered: responses.length,
      subjectMastery
    };
  }

  /**
   * Get age-appropriate baseline difficulty
   */
  private getAgeBaseline(age: number): number {
    if (age <= 6) return 1; // Very easy for young children
    if (age <= 10) return 2; // Easy to medium for elementary
    if (age <= 14) return 3; // Medium for middle school
    if (age <= 18) return 4; // Medium-hard for high school
    return 3; // Default medium
  }

  /**
   * Compute difficulty recommendation based on performance and age
   */
  private computeDifficultyRecommendation(
    performance: PerformanceMetrics,
    ageBaseline: number,
    age: number
  ): DifficultyRecommendation {
    let targetDifficulty = ageBaseline;
    let adjustmentFactor = 0;
    let reasoning = `Starting with age-appropriate baseline (${ageBaseline})`;
    let confidenceLevel = 0.5;

    // Adjust based on accuracy
    if (performance.totalQuestionsAnswered >= 5) {
      confidenceLevel = Math.min(0.9, 0.3 + (performance.totalQuestionsAnswered / 50));
      
      if (performance.accuracy >= 0.85) {
        adjustmentFactor += 1;
        reasoning += '. High accuracy (+1)';
      } else if (performance.accuracy >= 0.7) {
        adjustmentFactor += 0.5;
        reasoning += '. Good accuracy (+0.5)';
      } else if (performance.accuracy <= 0.5) {
        adjustmentFactor -= 1;
        reasoning += '. Low accuracy (-1)';
      } else if (performance.accuracy <= 0.6) {
        adjustmentFactor -= 0.5;
        reasoning += '. Below average accuracy (-0.5)';
      }

      // Adjust based on response time (relative to age expectations)
      const expectedResponseTime = this.getExpectedResponseTime(age);
      const timeRatio = performance.averageResponseTime / expectedResponseTime;
      
      if (timeRatio <= 0.7) {
        adjustmentFactor += 0.5;
        reasoning += '. Fast responses (+0.5)';
      } else if (timeRatio >= 1.5) {
        adjustmentFactor -= 0.5;
        reasoning += '. Slow responses (-0.5)';
      }

      // Adjust based on streak
      if (performance.recentStreak >= 10) {
        adjustmentFactor += 0.5;
        reasoning += '. Long streak (+0.5)';
      } else if (performance.recentStreak >= 5) {
        adjustmentFactor += 0.25;
        reasoning += '. Good streak (+0.25)';
      }

      // Adjust based on subject mastery
      if (performance.subjectMastery >= 0.8) {
        adjustmentFactor += 1;
        reasoning += '. High mastery (+1)';
      } else if (performance.subjectMastery >= 0.6) {
        adjustmentFactor += 0.5;
        reasoning += '. Good mastery (+0.5)';
      } else if (performance.subjectMastery <= 0.3) {
        adjustmentFactor -= 0.5;
        reasoning += '. Low mastery (-0.5)';
      }
    } else {
      reasoning += '. Insufficient data for performance adjustment';
    }

    // Apply adjustment and clamp to valid range
    targetDifficulty = Math.max(1, Math.min(5, ageBaseline + adjustmentFactor));
    
    // Round to nearest 0.5 for more granular difficulty
    targetDifficulty = Math.round(targetDifficulty * 2) / 2;

    return {
      targetDifficulty,
      confidenceLevel,
      reasoning,
      adjustmentFactor
    };
  }

  /**
   * Get expected response time based on age
   */
  private getExpectedResponseTime(age: number): number {
    if (age <= 6) return 45; // 45 seconds for young children
    if (age <= 10) return 30; // 30 seconds for elementary
    if (age <= 14) return 20; // 20 seconds for middle school
    return 15; // 15 seconds for high school
  }

  /**
   * Get questions with adaptive difficulty
   */
  async getAdaptiveQuestions(
    userId: string,
    subjectId: string,
    age: number,
    ageRange: string,
    limit: number = 10
  ) {
    const difficultyRec = await this.calculateTargetDifficulty(userId, subjectId, age);
    
    // Get questions around the target difficulty
    const minDifficulty = Math.max(1, Math.floor(difficultyRec.targetDifficulty - 0.5));
    const maxDifficulty = Math.min(5, Math.ceil(difficultyRec.targetDifficulty + 0.5));

    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        *,
        subjects (
          name,
          primary_stat,
          secondary_stat
        )
      `)
      .eq('subject_id', subjectId)
      .eq('age_range', ageRange)
      .gte('difficulty_level', minDifficulty)
      .lte('difficulty_level', maxDifficulty)
      .limit(limit * 2); // Get more questions to allow for filtering

    if (error) {
      throw new Error(`Failed to fetch adaptive questions: ${error.message}`);
    }

    if (!questions || questions.length === 0) {
      // Fallback to any questions in the age range
      const { data: fallbackQuestions, error: fallbackError } = await supabase
        .from('questions')
        .select(`
          *,
          subjects (
            name,
            primary_stat,
            secondary_stat
          )
        `)
        .eq('subject_id', subjectId)
        .eq('age_range', ageRange)
        .limit(limit);

      if (fallbackError) {
        throw new Error(`Failed to fetch fallback questions: ${fallbackError.message}`);
      }

      return fallbackQuestions || [];
    }

    // Prioritize questions closer to target difficulty
    const sortedQuestions = questions.sort((a, b) => {
      const aDiff = Math.abs(a.difficulty_level - difficultyRec.targetDifficulty);
      const bDiff = Math.abs(b.difficulty_level - difficultyRec.targetDifficulty);
      return aDiff - bDiff;
    });

    return sortedQuestions.slice(0, limit);
  }

  /**
   * Update difficulty based on recent performance
   */
  async updateDifficultyAfterResponse(
    userId: string,
    questionId: string,
    isCorrect: boolean,
    responseTime: number
  ): Promise<void> {
    // This could be used to implement real-time difficulty adjustment
    // For now, we rely on the batch calculation in getAdaptiveQuestions
    
    // Future enhancement: Store difficulty adjustment events
    // for more granular tracking and machine learning improvements
  }

  /**
   * Get difficulty distribution for analytics
   */
  async getDifficultyDistribution(
    userId: string,
    subjectId: string,
    days: number = 30
  ) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const { data: responses, error } = await supabase
      .from('question_responses')
      .select(`
        is_correct,
        questions (
          difficulty_level
        )
      `)
      .eq('user_id', userId)
      .eq('questions.subject_id', subjectId)
      .gte('created_at', cutoffDate.toISOString());

    if (error || !responses) {
      return null;
    }

    const distribution = {
      1: { total: 0, correct: 0 },
      2: { total: 0, correct: 0 },
      3: { total: 0, correct: 0 },
      4: { total: 0, correct: 0 },
      5: { total: 0, correct: 0 }
    };

    responses.forEach(response => {
      const difficulty = response.questions?.difficulty_level;
      if (difficulty && difficulty >= 1 && difficulty <= 5) {
        distribution[difficulty as keyof typeof distribution].total++;
        if (response.is_correct) {
          distribution[difficulty as keyof typeof distribution].correct++;
        }
      }
    });

    return distribution;
  }
}

export const difficultyScalingService = new DifficultyScalingService();