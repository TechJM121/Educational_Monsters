import { useState, useEffect, useCallback } from 'react';
import { learningSessionService, type LearningSession } from '../services/learningSessionService';
import type { 
  Question, 
  QuestionResponse, 
  Subject, 
  LearningSessionConfig,
  SessionAnalytics 
} from '../types/question';

interface UseLearningSessionProps {
  userId: string;
  subjectId?: string;
  worldId?: string;
  config?: Partial<LearningSessionConfig>;
}

interface LearningSessionState {
  session: LearningSession | null;
  currentQuestion: Question | null;
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
  finalAnalytics: SessionAnalytics | null;
}

export const useLearningSession = ({
  userId,
  subjectId,
  worldId,
  config = {}
}: UseLearningSessionProps) => {
  const [state, setState] = useState<LearningSessionState>({
    session: null,
    currentQuestion: null,
    isLoading: false,
    error: null,
    isComplete: false,
    finalAnalytics: null
  });

  /**
   * Start a new learning session
   */
  const startSession = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const session = await learningSessionService.createSession(
        userId,
        subjectId,
        worldId,
        config
      );

      const currentQuestion = learningSessionService.getCurrentQuestion(session.id);

      setState(prev => ({
        ...prev,
        session,
        currentQuestion,
        isLoading: false,
        isComplete: false,
        finalAnalytics: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to start session',
        isLoading: false
      }));
    }
  }, [userId, subjectId, worldId, config]);

  /**
   * Submit an answer for the current question
   */
  const submitAnswer = useCallback(async (
    selectedAnswer: string,
    responseTime: number
  ): Promise<{
    response: QuestionResponse;
    levelUp?: boolean;
    achievements?: string[];
  } | null> => {
    if (!state.session) {
      throw new Error('No active session');
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await learningSessionService.submitAnswer(
        state.session.id,
        selectedAnswer,
        responseTime
      );

      setState(prev => ({
        ...prev,
        session: result.session,
        isLoading: false
      }));

      return {
        response: result.response,
        levelUp: result.levelUp,
        achievements: result.achievements
      };
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to submit answer',
        isLoading: false
      }));
      return null;
    }
  }, [state.session]);

  /**
   * Move to the next question
   */
  const nextQuestion = useCallback(() => {
    if (!state.session) {
      throw new Error('No active session');
    }

    const updatedSession = learningSessionService.nextQuestion(state.session.id);
    const currentQuestion = learningSessionService.getCurrentQuestion(state.session.id);

    setState(prev => ({
      ...prev,
      session: updatedSession,
      currentQuestion,
      isComplete: updatedSession.isComplete
    }));
  }, [state.session]);

  /**
   * Complete the session and get final results
   */
  const completeSession = useCallback(async (): Promise<SessionAnalytics | null> => {
    if (!state.session) {
      throw new Error('No active session');
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const analytics = await learningSessionService.completeSession(state.session.id);

      setState(prev => ({
        ...prev,
        isComplete: true,
        finalAnalytics: analytics,
        isLoading: false
      }));

      return analytics;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to complete session',
        isLoading: false
      }));
      return null;
    }
  }, [state.session]);

  /**
   * Get current session progress
   */
  const getProgress = useCallback(() => {
    if (!state.session) {
      return null;
    }

    return learningSessionService.getProgress(state.session.id);
  }, [state.session]);

  /**
   * Restart the session
   */
  const restartSession = useCallback(() => {
    setState({
      session: null,
      currentQuestion: null,
      isLoading: false,
      error: null,
      isComplete: false,
      finalAnalytics: null
    });
    startSession();
  }, [startSession]);

  /**
   * Get available subjects
   */
  const getSubjects = useCallback(async (): Promise<Subject[]> => {
    try {
      return await learningSessionService.getSubjects();
    } catch (error) {
      console.error('Failed to load subjects:', error);
      return [];
    }
  }, []);

  // Auto-start session when dependencies change
  useEffect(() => {
    if (userId && !state.session && !state.isLoading) {
      startSession();
    }
  }, [userId, startSession, state.session, state.isLoading]);

  // Cleanup expired sessions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      learningSessionService.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    // State
    session: state.session,
    currentQuestion: state.currentQuestion,
    isLoading: state.isLoading,
    error: state.error,
    isComplete: state.isComplete,
    finalAnalytics: state.finalAnalytics,

    // Actions
    startSession,
    submitAnswer,
    nextQuestion,
    completeSession,
    restartSession,
    getSubjects,

    // Computed values
    progress: getProgress(),
    
    // Session stats (current)
    currentStats: state.session ? {
      totalQuestions: state.session.analytics?.totalQuestions || 0,
      correctAnswers: state.session.analytics?.correctAnswers || 0,
      totalXPEarned: state.session.analytics?.totalXPEarned || 0,
      accuracy: state.session.analytics?.accuracy || 0,
      averageResponseTime: state.session.analytics?.averageResponseTime || 0,
      currentDifficulty: state.session.adaptiveDifficulty?.currentDifficulty || 1
    } : null
  };
};