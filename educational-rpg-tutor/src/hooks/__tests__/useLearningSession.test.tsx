import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useLearningSession } from '../useLearningSession';
import { learningSessionService } from '../../services/learningSessionService';

// Mock the learning session service
vi.mock('../../services/learningSessionService');

const mockLearningSessionService = vi.mocked(learningSessionService);

describe('useLearningSession', () => {
  const mockUserId = 'user-123';
  const mockSubjectId = 'subject-456';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => 
      useLearningSession({ userId: mockUserId })
    );

    expect(result.current.session).toBeNull();
    expect(result.current.currentQuestion).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isComplete).toBe(false);
    expect(result.current.finalAnalytics).toBeNull();
  });

  it('should start session automatically when userId is provided', async () => {
    const mockSession = {
      id: 'session-1',
      userId: mockUserId,
      subjectId: mockSubjectId,
      questions: [],
      currentQuestionIndex: 0,
      responses: [],
      analytics: {
        sessionId: 'session-1',
        userId: mockUserId,
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
        currentDifficulty: 2,
        consecutiveCorrect: 0,
        consecutiveIncorrect: 0,
        performanceHistory: [],
        adjustmentThreshold: 3
      },
      startTime: new Date(),
      isComplete: false,
      config: {
        questionsPerSession: 10,
        adaptiveDifficulty: true,
        showProgress: true,
        enableHints: false
      }
    };

    const mockQuestion = {
      id: 'q1',
      subject_id: mockSubjectId,
      question_text: 'What is 2+2?',
      answer_options: ['3', '4', '5', '6'],
      correct_answer: '4',
      difficulty_level: 1,
      xp_reward: 10,
      age_range: '7-10',
      created_at: new Date()
    };

    mockLearningSessionService.createSession.mockResolvedValue(mockSession);
    mockLearningSessionService.getCurrentQuestion.mockReturnValue(mockQuestion);

    const { result } = renderHook(() => 
      useLearningSession({ userId: mockUserId, subjectId: mockSubjectId })
    );

    await waitFor(() => {
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.currentQuestion).toEqual(mockQuestion);
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockLearningSessionService.createSession).toHaveBeenCalledWith(
      mockUserId,
      mockSubjectId,
      undefined,
      {}
    );
  });

  it('should handle session creation error', async () => {
    const errorMessage = 'Failed to create session';
    mockLearningSessionService.createSession.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => 
      useLearningSession({ userId: mockUserId })
    );

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('should submit answer and update session state', async () => {
    const mockSession = {
      id: 'session-1',
      userId: mockUserId,
      analytics: {
        sessionId: 'session-1',
        userId: mockUserId,
        startTime: new Date(),
        totalQuestions: 1,
        correctAnswers: 1,
        totalXPEarned: 10,
        averageResponseTime: 5,
        accuracy: 100,
        difficultyProgression: [1],
        timeSpentPerQuestion: [5],
        streakBonuses: 0
      },
      responses: [],
      isComplete: false
    };

    const mockResponse = {
      id: 'response-1',
      question_id: 'q1',
      user_id: mockUserId,
      selected_answer: '4',
      is_correct: true,
      xp_earned: 10,
      response_time_seconds: 5,
      created_at: new Date()
    };

    const mockResult = {
      response: mockResponse,
      session: mockSession,
      levelUp: false,
      achievements: []
    };

    mockLearningSessionService.createSession.mockResolvedValue(mockSession as any);
    mockLearningSessionService.getCurrentQuestion.mockReturnValue(null);
    mockLearningSessionService.submitAnswer.mockResolvedValue(mockResult);

    const { result } = renderHook(() => 
      useLearningSession({ userId: mockUserId })
    );

    await waitFor(() => {
      expect(result.current.session).toBeDefined();
    });

    let submitResult: any;
    await act(async () => {
      submitResult = await result.current.submitAnswer('4', 5);
    });

    expect(submitResult).toEqual({
      response: mockResponse,
      levelUp: false,
      achievements: []
    });

    expect(mockLearningSessionService.submitAnswer).toHaveBeenCalledWith(
      'session-1',
      '4',
      5
    );
  });

  it('should handle answer submission error', async () => {
    const mockSession = {
      id: 'session-1',
      userId: mockUserId,
      analytics: { totalQuestions: 0, correctAnswers: 0, totalXPEarned: 0, accuracy: 0 }
    };

    const errorMessage = 'Failed to submit answer';
    mockLearningSessionService.createSession.mockResolvedValue(mockSession as any);
    mockLearningSessionService.getCurrentQuestion.mockReturnValue(null);
    mockLearningSessionService.submitAnswer.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => 
      useLearningSession({ userId: mockUserId })
    );

    await waitFor(() => {
      expect(result.current.session).toBeDefined();
    });

    let submitResult: any;
    await act(async () => {
      submitResult = await result.current.submitAnswer('4', 5);
    });

    expect(submitResult).toBeNull();
    expect(result.current.error).toBe(errorMessage);
  });

  it('should move to next question', async () => {
    const mockSession = {
      id: 'session-1',
      userId: mockUserId,
      currentQuestionIndex: 1,
      isComplete: false
    };

    const mockNextQuestion = {
      id: 'q2',
      subject_id: mockSubjectId,
      question_text: 'What is 3+3?',
      answer_options: ['5', '6', '7', '8'],
      correct_answer: '6',
      difficulty_level: 1,
      xp_reward: 10,
      age_range: '7-10',
      created_at: new Date()
    };

    mockLearningSessionService.createSession.mockResolvedValue(mockSession as any);
    mockLearningSessionService.getCurrentQuestion.mockReturnValue(null);
    mockLearningSessionService.nextQuestion.mockReturnValue(mockSession as any);
    mockLearningSessionService.getCurrentQuestion.mockReturnValue(mockNextQuestion);

    const { result } = renderHook(() => 
      useLearningSession({ userId: mockUserId })
    );

    await waitFor(() => {
      expect(result.current.session).toBeDefined();
    });

    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.session?.currentQuestionIndex).toBe(1);
    expect(result.current.currentQuestion).toEqual(mockNextQuestion);
    expect(mockLearningSessionService.nextQuestion).toHaveBeenCalledWith('session-1');
  });

  it('should complete session and return analytics', async () => {
    const mockSession = {
      id: 'session-1',
      userId: mockUserId,
      isComplete: false
    };

    const mockAnalytics = {
      sessionId: 'session-1',
      userId: mockUserId,
      startTime: new Date(),
      endTime: new Date(),
      totalQuestions: 10,
      correctAnswers: 8,
      totalXPEarned: 120,
      averageResponseTime: 7.5,
      accuracy: 80,
      difficultyProgression: [1, 2, 2, 3, 2, 2, 3, 3, 2, 2],
      timeSpentPerQuestion: [8, 7, 6, 9, 7, 8, 6, 7, 8, 9],
      streakBonuses: 20
    };

    mockLearningSessionService.createSession.mockResolvedValue(mockSession as any);
    mockLearningSessionService.getCurrentQuestion.mockReturnValue(null);
    mockLearningSessionService.completeSession.mockResolvedValue(mockAnalytics);

    const { result } = renderHook(() => 
      useLearningSession({ userId: mockUserId })
    );

    await waitFor(() => {
      expect(result.current.session).toBeDefined();
    });

    let analytics: any;
    await act(async () => {
      analytics = await result.current.completeSession();
    });

    expect(analytics).toEqual(mockAnalytics);
    expect(result.current.isComplete).toBe(true);
    expect(result.current.finalAnalytics).toEqual(mockAnalytics);
    expect(mockLearningSessionService.completeSession).toHaveBeenCalledWith('session-1');
  });

  it('should restart session', async () => {
    const mockSession = {
      id: 'session-1',
      userId: mockUserId,
      isComplete: true
    };

    const mockNewSession = {
      id: 'session-2',
      userId: mockUserId,
      isComplete: false
    };

    mockLearningSessionService.createSession
      .mockResolvedValueOnce(mockSession as any)
      .mockResolvedValueOnce(mockNewSession as any);
    mockLearningSessionService.getCurrentQuestion.mockReturnValue(null);

    const { result } = renderHook(() => 
      useLearningSession({ userId: mockUserId })
    );

    await waitFor(() => {
      expect(result.current.session?.id).toBe('session-1');
    });

    await act(async () => {
      result.current.restartSession();
    });

    await waitFor(() => {
      expect(result.current.session?.id).toBe('session-2');
      expect(result.current.isComplete).toBe(false);
      expect(result.current.finalAnalytics).toBeNull();
    });
  });

  it('should get progress information', async () => {
    const mockSession = {
      id: 'session-1',
      userId: mockUserId
    };

    const mockProgress = {
      current: 3,
      total: 10,
      percentage: 30,
      correctAnswers: 2,
      totalXPEarned: 25,
      accuracy: 66.7,
      averageResponseTime: 8.5
    };

    mockLearningSessionService.createSession.mockResolvedValue(mockSession as any);
    mockLearningSessionService.getCurrentQuestion.mockReturnValue(null);
    mockLearningSessionService.getProgress.mockReturnValue(mockProgress);

    const { result } = renderHook(() => 
      useLearningSession({ userId: mockUserId })
    );

    await waitFor(() => {
      expect(result.current.session).toBeDefined();
    });

    expect(result.current.progress).toEqual(mockProgress);
  });

  it('should get subjects', async () => {
    const mockSubjects = [
      {
        id: 'subject-1',
        name: 'Mathematics',
        description: 'Math problems',
        icon: '🔢',
        color: 'blue',
        statMapping: { primary: 'intelligence', secondary: 'wisdom' }
      }
    ];

    mockLearningSessionService.getSubjects.mockResolvedValue(mockSubjects);

    const { result } = renderHook(() => 
      useLearningSession({ userId: mockUserId })
    );

    let subjects: any;
    await act(async () => {
      subjects = await result.current.getSubjects();
    });

    expect(subjects).toEqual(mockSubjects);
  });

  it('should provide current stats', async () => {
    const mockSession = {
      id: 'session-1',
      userId: mockUserId,
      analytics: {
        totalQuestions: 5,
        correctAnswers: 4,
        totalXPEarned: 50,
        accuracy: 80,
        averageResponseTime: 6.2
      },
      adaptiveDifficulty: {
        currentDifficulty: 3
      }
    };

    mockLearningSessionService.createSession.mockResolvedValue(mockSession as any);
    mockLearningSessionService.getCurrentQuestion.mockReturnValue(null);

    const { result } = renderHook(() => 
      useLearningSession({ userId: mockUserId })
    );

    await waitFor(() => {
      expect(result.current.session).toBeDefined();
    });

    expect(result.current.currentStats).toEqual({
      totalQuestions: 5,
      correctAnswers: 4,
      totalXPEarned: 50,
      accuracy: 80,
      averageResponseTime: 6.2,
      currentDifficulty: 3
    });
  });

  it('should handle session cleanup', () => {
    vi.useFakeTimers();

    renderHook(() => useLearningSession({ userId: mockUserId }));

    // Fast-forward 5 minutes
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(mockLearningSessionService.cleanupExpiredSessions).toHaveBeenCalled();

    vi.useRealTimers();
  });
});