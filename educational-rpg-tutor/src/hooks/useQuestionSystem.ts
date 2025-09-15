import { useState, useEffect, useCallback } from 'react';
import { questionService } from '../services/questionService';
import type { Question, QuestionResponse } from '../types/question';

interface UseQuestionSystemProps {
  userId: string;
  ageRange: string;
  subjectId?: string;
  questionsPerSession?: number;
}

interface QuestionSystemState {
  questions: Question[];
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  responses: QuestionResponse[];
  isLoading: boolean;
  error: string | null;
  sessionComplete: boolean;
  sessionStats: {
    totalQuestions: number;
    correctAnswers: number;
    totalXPEarned: number;
    averageResponseTime: number;
    accuracy: number;
  };
}

export const useQuestionSystem = ({
  userId,
  ageRange,
  subjectId,
  questionsPerSession = 10
}: UseQuestionSystemProps) => {
  const [state, setState] = useState<QuestionSystemState>({
    questions: [],
    currentQuestionIndex: 0,
    currentQuestion: null,
    responses: [],
    isLoading: false,
    error: null,
    sessionComplete: false,
    sessionStats: {
      totalQuestions: 0,
      correctAnswers: 0,
      totalXPEarned: 0,
      averageResponseTime: 0,
      accuracy: 0
    }
  });

  /**
   * Load questions for the session
   */
  const loadQuestions = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const questions = await questionService.getAdaptiveQuestions(
        userId,
        ageRange,
        subjectId,
        questionsPerSession
      );

      if (questions.length === 0) {
        throw new Error('No questions available for the selected criteria');
      }

      setState(prev => ({
        ...prev,
        questions,
        currentQuestion: questions[0],
        currentQuestionIndex: 0,
        responses: [],
        sessionComplete: false,
        isLoading: false,
        sessionStats: {
          totalQuestions: 0,
          correctAnswers: 0,
          totalXPEarned: 0,
          averageResponseTime: 0,
          accuracy: 0
        }
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load questions',
        isLoading: false
      }));
    }
  }, [userId, ageRange, subjectId, questionsPerSession]);

  /**
   * Submit an answer for the current question
   */
  const submitAnswer = useCallback(async (
    selectedAnswer: string,
    responseTime: number
  ): Promise<QuestionResponse> => {
    if (!state.currentQuestion) {
      throw new Error('No current question available');
    }

    try {
      const response = await questionService.submitQuestionResponse(
        userId,
        state.currentQuestion.id,
        selectedAnswer,
        responseTime
      );

      setState(prev => ({
        ...prev,
        responses: [...prev.responses, response]
      }));

      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to submit answer'
      );
    }
  }, [userId, state.currentQuestion]);

  /**
   * Move to the next question
   */
  const nextQuestion = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentQuestionIndex + 1;
      
      if (nextIndex >= prev.questions.length) {
        // Session complete - calculate final stats
        const totalQuestions = prev.responses.length;
        const correctAnswers = prev.responses.filter(r => r.is_correct).length;
        const totalXPEarned = prev.responses.reduce((sum, r) => sum + r.xp_earned, 0);
        const totalResponseTime = prev.responses.reduce((sum, r) => sum + (r.response_time_seconds || 0), 0);
        const averageResponseTime = totalResponseTime / totalQuestions;
        const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

        return {
          ...prev,
          sessionComplete: true,
          currentQuestion: null,
          sessionStats: {
            totalQuestions,
            correctAnswers,
            totalXPEarned,
            averageResponseTime,
            accuracy
          }
        };
      }

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        currentQuestion: prev.questions[nextIndex]
      };
    });
  }, []);

  /**
   * Restart the session with new questions
   */
  const restartSession = useCallback(() => {
    loadQuestions();
  }, [loadQuestions]);

  /**
   * Get progress information
   */
  const getProgress = useCallback(() => {
    return {
      current: state.currentQuestionIndex + 1,
      total: state.questions.length,
      percentage: state.questions.length > 0 
        ? ((state.currentQuestionIndex + 1) / state.questions.length) * 100 
        : 0
    };
  }, [state.currentQuestionIndex, state.questions.length]);

  /**
   * Get current session statistics
   */
  const getCurrentStats = useCallback(() => {
    const totalQuestions = state.responses.length;
    const correctAnswers = state.responses.filter(r => r.is_correct).length;
    const totalXPEarned = state.responses.reduce((sum, r) => sum + r.xp_earned, 0);
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    return {
      totalQuestions,
      correctAnswers,
      totalXPEarned,
      accuracy
    };
  }, [state.responses]);

  // Load questions on mount or when dependencies change
  useEffect(() => {
    if (userId && ageRange) {
      loadQuestions();
    }
  }, [loadQuestions, userId, ageRange]);

  return {
    // State
    questions: state.questions,
    currentQuestion: state.currentQuestion,
    currentQuestionIndex: state.currentQuestionIndex,
    responses: state.responses,
    isLoading: state.isLoading,
    error: state.error,
    sessionComplete: state.sessionComplete,
    sessionStats: state.sessionStats,

    // Actions
    submitAnswer,
    nextQuestion,
    restartSession,
    loadQuestions,

    // Computed values
    progress: getProgress(),
    currentStats: getCurrentStats()
  };
};