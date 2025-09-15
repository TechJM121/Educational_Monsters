import { supabase } from './supabaseClient';
import { questionService } from './questionService';
import type { 
  Question, 
  QuestionResponse, 
  Subject, 
  LearningSessionConfig,
  SessionAnalytics,
  AdaptiveDifficultyState
} from '../types/question';

export interface LearningSession {
  id: string;
  userId: string;
  subjectId?: string;
  worldId?: string;
  config: LearningSessionConfig;
  questions: Question[];
  currentQuestionIndex: number;
  responses: QuestionResponse[];
  analytics: SessionAnalytics;
  adaptiveDifficulty: AdaptiveDifficultyState;
  startTime: Date;
  endTime?: Date;
  isComplete: boolean;
}

export class LearningSessionService {
  private activeSessions = new Map<string, LearningSession>();

  /**
   * Create a new learning session
   */
  async createSession(
    userId: string,
    subjectId?: string,
    worldId?: string,
    config: Partial<LearningSessionConfig> = {}
  ): Promise<LearningSession> {
    const sessionId = `session_${userId}_${Date.now()}`;
    
    const defaultConfig: LearningSessionConfig = {
      questionsPerSession: 10,
      adaptiveDifficulty: true,
      showProgress: true,
      enableHints: false,
      ...config
    };

    // Get user's age for appropriate questions
    const { data: user } = await supabase
      .from('users')
      .select('age')
      .eq('id', userId)
      .single();

    const ageRange = this.getAgeRange(user?.age || 10);

    // Load questions for the session
    const questions = await questionService.getAdaptiveQuestions(
      userId,
      ageRange,
      subjectId,
      defaultConfig.questionsPerSession
    );

    if (questions.length === 0) {
      throw new Error('No questions available for the selected criteria');
    }

    const session: LearningSession = {
      id: sessionId,
      userId,
      subjectId,
      worldId,
      config: defaultConfig,
      questions,
      currentQuestionIndex: 0,
      responses: [],
      analytics: {
        sessionId,
        userId,
        subjectId,
        startTime: new Date(),
        totalQuestions: 0,
        correctAnswers: 0,
        totalXPEarned: 0,
        averageResponseTime: 0,
        accuracy: 0,
        difficultyProgression: [],
        timeSpentPerQuestion: [],
        streakBonuses: 0
      },
      adaptiveDifficulty: {
        currentDifficulty: 2, // Start at medium difficulty
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        performanceHistory: [],
        adjustmentThreshold: 3
      },
      startTime: new Date(),
      isComplete: false
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Get current session state
   */
  getSession(sessionId: string): LearningSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Submit an answer for the current question
   */
  async submitAnswer(
    sessionId: string,
    selectedAnswer: string,
    responseTime: number
  ): Promise<{
    response: QuestionResponse;
    session: LearningSession;
    levelUp?: boolean;
    achievements?: string[];
  }> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];
    if (!currentQuestion) {
      throw new Error('No current question available');
    }

    // Submit the response through question service
    const response = await questionService.submitQuestionResponse(
      session.userId,
      currentQuestion.id,
      selectedAnswer,
      responseTime
    );

    // Update session state
    session.responses.push(response);
    session.analytics.totalQuestions++;
    session.analytics.timeSpentPerQuestion.push(responseTime);

    if (response.is_correct) {
      session.analytics.correctAnswers++;
      session.analytics.totalXPEarned += response.xp_earned;
      session.adaptiveDifficulty.consecutiveCorrect++;
      session.adaptiveDifficulty.consecutiveIncorrect = 0;
    } else {
      session.adaptiveDifficulty.consecutiveCorrect = 0;
      session.adaptiveDifficulty.consecutiveIncorrect++;
    }

    // Update performance history
    session.adaptiveDifficulty.performanceHistory.push(response.is_correct);
    if (session.adaptiveDifficulty.performanceHistory.length > 10) {
      session.adaptiveDifficulty.performanceHistory.shift();
    }

    // Update analytics
    session.analytics.accuracy = (session.analytics.correctAnswers / session.analytics.totalQuestions) * 100;
    session.analytics.averageResponseTime = 
      session.analytics.timeSpentPerQuestion.reduce((a, b) => a + b, 0) / session.analytics.timeSpentPerQuestion.length;

    // Apply adaptive difficulty if enabled
    if (session.config.adaptiveDifficulty) {
      this.adjustDifficulty(session);
    }

    // Check for achievements and level ups
    const achievements = await this.checkAchievements(session);
    const levelUp = await this.checkLevelUp(session);

    this.activeSessions.set(sessionId, session);

    return {
      response,
      session,
      levelUp,
      achievements
    };
  }

  /**
   * Move to the next question
   */
  nextQuestion(sessionId: string): LearningSession {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.currentQuestionIndex++;

    // Check if session is complete
    if (session.currentQuestionIndex >= session.questions.length) {
      session.isComplete = true;
      session.endTime = new Date();
      session.analytics.endTime = new Date();
      
      // Save session analytics
      this.saveSessionAnalytics(session);
    }

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Get current question
   */
  getCurrentQuestion(sessionId: string): Question | null {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.isComplete) {
      return null;
    }

    return session.questions[session.currentQuestionIndex] || null;
  }

  /**
   * Get session progress
   */
  getProgress(sessionId: string) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      current: session.currentQuestionIndex + 1,
      total: session.questions.length,
      percentage: ((session.currentQuestionIndex + 1) / session.questions.length) * 100,
      correctAnswers: session.analytics.correctAnswers,
      totalXPEarned: session.analytics.totalXPEarned,
      accuracy: session.analytics.accuracy,
      averageResponseTime: session.analytics.averageResponseTime
    };
  }

  /**
   * Complete session and get final results
   */
  async completeSession(sessionId: string): Promise<SessionAnalytics> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.isComplete = true;
    session.endTime = new Date();
    session.analytics.endTime = new Date();

    // Calculate final analytics
    const totalTime = session.endTime.getTime() - session.startTime.getTime();
    session.analytics.averageResponseTime = totalTime / session.analytics.totalQuestions / 1000;

    // Apply completion bonuses
    const completionBonus = this.calculateCompletionBonus(session);
    session.analytics.totalXPEarned += completionBonus;

    // Update character with completion bonus
    if (completionBonus > 0) {
      await this.awardCompletionBonus(session.userId, completionBonus);
    }

    // Save final analytics
    await this.saveSessionAnalytics(session);

    // Update quest progress
    await this.updateQuestProgress(session);

    // Clean up session
    this.activeSessions.delete(sessionId);

    return session.analytics;
  }

  /**
   * Adjust difficulty based on performance
   */
  private adjustDifficulty(session: LearningSession): void {
    const { adaptiveDifficulty } = session;
    const { adjustmentThreshold } = adaptiveDifficulty;

    // Increase difficulty if performing well
    if (adaptiveDifficulty.consecutiveCorrect >= adjustmentThreshold) {
      adaptiveDifficulty.currentDifficulty = Math.min(5, adaptiveDifficulty.currentDifficulty + 1);
      adaptiveDifficulty.consecutiveCorrect = 0;
    }

    // Decrease difficulty if struggling
    if (adaptiveDifficulty.consecutiveIncorrect >= adjustmentThreshold) {
      adaptiveDifficulty.currentDifficulty = Math.max(1, adaptiveDifficulty.currentDifficulty - 1);
      adaptiveDifficulty.consecutiveIncorrect = 0;
    }

    // Track difficulty progression
    session.analytics.difficultyProgression.push(adaptiveDifficulty.currentDifficulty);
  }

  /**
   * Calculate completion bonus based on performance
   */
  private calculateCompletionBonus(session: LearningSession): number {
    const { analytics } = session;
    let bonus = 0;

    // Accuracy bonus
    if (analytics.accuracy >= 90) bonus += 50;
    else if (analytics.accuracy >= 80) bonus += 30;
    else if (analytics.accuracy >= 70) bonus += 20;

    // Speed bonus
    if (analytics.averageResponseTime <= 5) bonus += 30;
    else if (analytics.averageResponseTime <= 10) bonus += 20;
    else if (analytics.averageResponseTime <= 15) bonus += 10;

    // Completion bonus
    bonus += 25;

    return bonus;
  }

  /**
   * Award completion bonus to character
   */
  private async awardCompletionBonus(userId: string, bonus: number): Promise<void> {
    const { data: character } = await supabase
      .from('characters')
      .select('id, total_xp')
      .eq('user_id', userId)
      .single();

    if (character) {
      await supabase
        .from('characters')
        .update({
          total_xp: character.total_xp + bonus
        })
        .eq('id', character.id);
    }
  }

  /**
   * Save session analytics to database
   */
  private async saveSessionAnalytics(session: LearningSession): Promise<void> {
    try {
      await supabase
        .from('learning_sessions')
        .insert({
          id: session.id,
          user_id: session.userId,
          subject_id: session.subjectId,
          world_id: session.worldId,
          questions_answered: session.analytics.totalQuestions,
          correct_answers: session.analytics.correctAnswers,
          total_xp_earned: session.analytics.totalXPEarned,
          accuracy: session.analytics.accuracy,
          average_response_time: session.analytics.averageResponseTime,
          difficulty_progression: session.analytics.difficultyProgression,
          started_at: session.startTime,
          completed_at: session.endTime
        });
    } catch (error) {
      console.error('Failed to save session analytics:', error);
    }
  }

  /**
   * Update quest progress based on session completion
   */
  private async updateQuestProgress(session: LearningSession): Promise<void> {
    try {
      // Call the database function to update quest progress
      await supabase.rpc('update_quest_progress', {
        p_user_id: session.userId,
        p_activity_type: 'complete_lesson',
        p_subject_id: session.subjectId,
        p_xp_earned: session.analytics.totalXPEarned,
        p_accuracy: session.analytics.accuracy / 100,
        p_questions_answered: session.analytics.totalQuestions,
        p_correct_answers: session.analytics.correctAnswers
      });
    } catch (error) {
      console.error('Failed to update quest progress:', error);
    }
  }

  /**
   * Check for achievements earned during session
   */
  private async checkAchievements(session: LearningSession): Promise<string[]> {
    // This would integrate with the achievement service
    // For now, return empty array
    return [];
  }

  /**
   * Check if character leveled up
   */
  private async checkLevelUp(session: LearningSession): Promise<boolean> {
    // This would check if the character's XP crossed a level threshold
    // For now, return false
    return false;
  }

  /**
   * Get age range from age
   */
  private getAgeRange(age: number): string {
    if (age <= 6) return '3-6';
    if (age <= 10) return '7-10';
    if (age <= 14) return '11-14';
    return '15-18';
  }

  /**
   * Get all available subjects
   */
  async getSubjects(): Promise<Subject[]> {
    return questionService.getSubjects();
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): void {
    const now = Date.now();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now - session.startTime.getTime() > maxAge) {
        this.activeSessions.delete(sessionId);
      }
    }
  }
}

export const learningSessionService = new LearningSessionService();