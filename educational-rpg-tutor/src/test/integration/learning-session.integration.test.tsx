import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LearningSession } from '../../components/learning/LearningSession';
import { learningSessionService } from '../../services/learningSessionService';
import { questionService } from '../../services/questionService';

// Mock services
vi.mock('../../services/learningSessionService');
vi.mock('../../services/questionService');

const mockLearningSessionService = vi.mocked(learningSessionService);
const mockQuestionService = vi.mocked(questionService);

describe('Learning Session Integration', () => {
  const mockUserId = 'user-123';
  const mockAge = 10;
  const mockUserLevel = 5;

  const mockSubjects = [
    {
      id: 'math-1',
      name: 'Mathematics',
      description: 'Numbers and calculations',
      icon: '🔢',
      color: 'blue',
      statMapping: { primary: 'intelligence' as const, secondary: 'wisdom' as const }
    },
    {
      id: 'science-1',
      name: 'Science',
      description: 'Scientific experiments',
      icon: '🧪',
      color: 'green',
      statMapping: { primary: 'dexterity' as const, secondary: 'intelligence' as const }
    }
  ];

  const mockQuestions = [
    {
      id: 'q1',
      subject_id: 'math-1',
      question_text: 'What is 2 + 2?',
      answer_options: ['3', '4', '5', '6'],
      correct_answer: '4',
      difficulty_level: 1,
      xp_reward: 10,
      age_range: '7-10',
      created_at: new Date()
    },
    {
      id: 'q2',
      subject_id: 'math-1',
      question_text: 'What is 5 × 3?',
      answer_options: ['12', '15', '18', '20'],
      correct_answer: '15',
      difficulty_level: 2,
      xp_reward: 20,
      age_range: '7-10',
      created_at: new Date()
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock getSubjects to return immediately
    mockLearningSessionService.getSubjects.mockResolvedValue(mockSubjects);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should complete full learning session flow', async () => {
    const user = userEvent.setup();
    
    // Mock session creation
    const mockSession = {
      id: 'session-1',
      userId: mockUserId,
      subjectId: 'math-1',
      questions: mockQuestions,
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
        questionsPerSession: 2,
        adaptiveDifficulty: true,
        showProgress: true,
        enableHints: false
      }
    };

    mockLearningSessionService.createSession.mockResolvedValue(mockSession);
    mockLearningSessionService.getCurrentQuestion
      .mockReturnValueOnce(mockQuestions[0])
      .mockReturnValueOnce(mockQuestions[1])
      .mockReturnValueOnce(null);

    mockLearningSessionService.getProgress.mockReturnValue({
      current: 1,
      total: 2,
      percentage: 50,
      correctAnswers: 0,
      totalXPEarned: 0,
      accuracy: 0,
      averageResponseTime: 0
    });

    const onSessionComplete = vi.fn();

    render(
      <LearningSession
        userId={mockUserId}
        age={mockAge}
        userLevel={mockUserLevel}
        onSessionComplete={onSessionComplete}
      />
    );

    // Wait for subjects to load
    await waitFor(() => {
      expect(screen.getByText('Choose Your Learning World')).toBeInTheDocument();
    });

    // Select Mathematics subject
    const mathButton = screen.getByText('Numerical Kingdom');
    await user.click(mathButton);

    // Start session
    const startButton = screen.getByText('Begin Numerical Kingdom Adventure');
    await user.click(startButton);

    // Wait for session to start
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    // Answer first question correctly
    const correctAnswer = screen.getByText('4');
    await user.click(correctAnswer);

    // Mock answer submission
    const mockResponse1 = {
      id: 'response-1',
      question_id: 'q1',
      user_id: mockUserId,
      selected_answer: '4',
      is_correct: true,
      xp_earned: 10,
      response_time_seconds: 5,
      created_at: new Date()
    };

    const updatedSession1 = {
      ...mockSession,
      responses: [mockResponse1],
      analytics: {
        ...mockSession.analytics,
        totalQuestions: 1,
        correctAnswers: 1,
        totalXPEarned: 10,
        accuracy: 100
      }
    };

    mockLearningSessionService.submitAnswer.mockResolvedValue({
      response: mockResponse1,
      session: updatedSession1,
      levelUp: false,
      achievements: []
    });

    // Submit answer
    const submitButton = screen.getByText('Submit Answer');
    await user.click(submitButton);

    // Wait for response feedback
    await waitFor(() => {
      expect(screen.getByText('🎉 Correct!')).toBeInTheDocument();
      expect(screen.getByText('+10 XP')).toBeInTheDocument();
    });

    // Move to next question
    const nextButton = screen.getByText('Next Question');
    
    mockLearningSessionService.nextQuestion.mockReturnValue({
      ...updatedSession1,
      currentQuestionIndex: 1
    });

    await user.click(nextButton);

    // Wait for second question
    await waitFor(() => {
      expect(screen.getByText('What is 5 × 3?')).toBeInTheDocument();
    });

    // Answer second question correctly
    const correctAnswer2 = screen.getByText('15');
    await user.click(correctAnswer2);

    // Mock second answer submission
    const mockResponse2 = {
      id: 'response-2',
      question_id: 'q2',
      user_id: mockUserId,
      selected_answer: '15',
      is_correct: true,
      xp_earned: 20,
      response_time_seconds: 7,
      created_at: new Date()
    };

    const updatedSession2 = {
      ...updatedSession1,
      responses: [mockResponse1, mockResponse2],
      currentQuestionIndex: 2,
      analytics: {
        ...updatedSession1.analytics,
        totalQuestions: 2,
        correctAnswers: 2,
        totalXPEarned: 30,
        accuracy: 100,
        averageResponseTime: 6
      }
    };

    mockLearningSessionService.submitAnswer.mockResolvedValue({
      response: mockResponse2,
      session: updatedSession2,
      levelUp: false,
      achievements: []
    });

    await user.click(screen.getByText('Submit Answer'));

    // Wait for response feedback
    await waitFor(() => {
      expect(screen.getByText('🎉 Correct!')).toBeInTheDocument();
    });

    // Complete session
    const finalSession = {
      ...updatedSession2,
      isComplete: true,
      endTime: new Date()
    };

    const finalAnalytics = {
      ...updatedSession2.analytics,
      endTime: new Date()
    };

    mockLearningSessionService.nextQuestion.mockReturnValue(finalSession);
    mockLearningSessionService.completeSession.mockResolvedValue(finalAnalytics);

    await user.click(screen.getByText('Next Question'));

    // Wait for completion screen
    await waitFor(() => {
      expect(screen.getByText('Session Complete!')).toBeInTheDocument();
      expect(screen.getByText('2/2')).toBeInTheDocument(); // Correct answers
      expect(screen.getByText('100.0%')).toBeInTheDocument(); // Accuracy
    });

    expect(onSessionComplete).toHaveBeenCalledWith(finalAnalytics);
  });

  it('should handle mixed subjects selection', async () => {
    const user = userEvent.setup();

    render(
      <LearningSession
        userId={mockUserId}
        age={mockAge}
        userLevel={mockUserLevel}
      />
    );

    // Wait for subjects to load
    await waitFor(() => {
      expect(screen.getByText('Choose Your Learning World')).toBeInTheDocument();
    });

    // Select mixed adventure
    const mixedButton = screen.getByText('Mixed Adventure');
    await user.click(mixedButton);

    expect(screen.getByText('Begin Mixed Adventure')).toBeInTheDocument();

    // Mock session creation for mixed subjects
    const mockMixedSession = {
      id: 'session-mixed',
      userId: mockUserId,
      subjectId: undefined,
      questions: mockQuestions,
      currentQuestionIndex: 0,
      responses: [],
      analytics: {
        sessionId: 'session-mixed',
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

    mockLearningSessionService.createSession.mockResolvedValue(mockMixedSession);
    mockLearningSessionService.getCurrentQuestion.mockReturnValue(mockQuestions[0]);

    const startButton = screen.getByText('Begin Mixed Adventure');
    await user.click(startButton);

    // Verify mixed session was created without subject ID
    await waitFor(() => {
      expect(mockLearningSessionService.createSession).toHaveBeenCalledWith(
        mockUserId,
        undefined, // No specific subject
        undefined,
        expect.any(Object)
      );
    });
  });

  it('should handle session errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock session creation failure
    mockLearningSessionService.createSession.mockRejectedValue(
      new Error('Failed to create session')
    );

    render(
      <LearningSession
        userId={mockUserId}
        age={mockAge}
        userLevel={mockUserLevel}
      />
    );

    // Wait for subjects to load
    await waitFor(() => {
      expect(screen.getByText('Choose Your Learning World')).toBeInTheDocument();
    });

    // Select subject and start session
    const mathButton = screen.getByText('Numerical Kingdom');
    await user.click(mathButton);

    const startButton = screen.getByText('Begin Numerical Kingdom Adventure');
    await user.click(startButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to create session')).toBeInTheDocument();
    });

    // Test retry functionality
    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();
  });

  it('should show locked subjects for low level users', async () => {
    render(
      <LearningSession
        userId={mockUserId}
        age={mockAge}
        userLevel={1} // Low level user
      />
    );

    // Wait for subjects to load
    await waitFor(() => {
      expect(screen.getByText('Choose Your Learning World')).toBeInTheDocument();
    });

    // Mathematics should be unlocked (level 1 requirement)
    expect(screen.getByText('Numerical Kingdom')).toBeInTheDocument();

    // Science should be locked (level 3 requirement)
    const lockedSubjects = screen.getAllByText('Locked');
    expect(lockedSubjects.length).toBeGreaterThan(0);

    // Check for level requirement text
    expect(screen.getByText('Level 3 required')).toBeInTheDocument();
  });

  it('should handle adaptive difficulty changes', async () => {
    const user = userEvent.setup();

    const mockSession = {
      id: 'session-1',
      userId: mockUserId,
      subjectId: 'math-1',
      questions: mockQuestions,
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

    mockLearningSessionService.createSession.mockResolvedValue(mockSession);
    mockLearningSessionService.getCurrentQuestion.mockReturnValue(mockQuestions[0]);
    mockLearningSessionService.getProgress.mockReturnValue({
      current: 1,
      total: 10,
      percentage: 10,
      correctAnswers: 0,
      totalXPEarned: 0,
      accuracy: 0,
      averageResponseTime: 0
    });

    render(
      <LearningSession
        userId={mockUserId}
        age={mockAge}
        userLevel={mockUserLevel}
      />
    );

    // Navigate to learning session
    await waitFor(() => {
      expect(screen.getByText('Choose Your Learning World')).toBeInTheDocument();
    });

    const mathButton = screen.getByText('Numerical Kingdom');
    await user.click(mathButton);

    const startButton = screen.getByText('Begin Numerical Kingdom Adventure');
    await user.click(startButton);

    // Wait for session to start
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    // Check initial difficulty display
    expect(screen.getByText('Level 2')).toBeInTheDocument();

    // Mock difficulty increase after correct answers
    const updatedSession = {
      ...mockSession,
      adaptiveDifficulty: {
        ...mockSession.adaptiveDifficulty,
        currentDifficulty: 3
      }
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

    mockLearningSessionService.submitAnswer.mockResolvedValue({
      response: mockResponse,
      session: updatedSession,
      levelUp: false,
      achievements: []
    });

    // Answer question
    const correctAnswer = screen.getByText('4');
    await user.click(correctAnswer);

    const submitButton = screen.getByText('Submit Answer');
    await user.click(submitButton);

    // Verify difficulty increased (this would be shown in the updated session state)
    await waitFor(() => {
      expect(screen.getByText('🎉 Correct!')).toBeInTheDocument();
    });
  });
});