import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useQuests } from '../useQuests';
import { questService } from '../../services/questService';

// Mock the quest service
vi.mock('../../services/questService', () => ({
  questService: {
    getActiveQuests: vi.fn(),
    getLearningStreak: vi.fn(),
    generateDailyQuests: vi.fn(),
    generateWeeklyQuests: vi.fn(),
    updateQuestProgress: vi.fn(),
    completeQuest: vi.fn()
  }
}));

describe('useQuests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state when no userId provided', () => {
    const { result } = renderHook(() => useQuests(null));

    expect(result.current.dailyQuests).toEqual([]);
    expect(result.current.weeklyQuests).toEqual([]);
    expect(result.current.learningStreak).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load quests and streak data on mount', async () => {
    const userId = 'test-user-id';
    const mockDailyQuests = [
      {
        id: 'daily-1',
        title: 'Math Quest',
        type: 'daily',
        objectives: []
      }
    ];
    const mockWeeklyQuests = [
      {
        id: 'weekly-1',
        title: 'Weekly Challenge',
        type: 'weekly',
        objectives: []
      }
    ];
    const mockStreak = {
      id: 'streak-1',
      userId,
      currentStreak: 5,
      longestStreak: 10,
      lastActivityDate: new Date(),
      streakRewards: []
    };

    vi.mocked(questService.getActiveQuests)
      .mockResolvedValueOnce(mockDailyQuests)
      .mockResolvedValueOnce(mockWeeklyQuests);
    vi.mocked(questService.getLearningStreak).mockResolvedValue(mockStreak);

    const { result } = renderHook(() => useQuests(userId));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dailyQuests).toEqual(mockDailyQuests);
    expect(result.current.weeklyQuests).toEqual(mockWeeklyQuests);
    expect(result.current.learningStreak).toEqual(mockStreak);
    expect(result.current.error).toBeNull();

    expect(questService.getActiveQuests).toHaveBeenCalledWith(userId, 'daily');
    expect(questService.getActiveQuests).toHaveBeenCalledWith(userId, 'weekly');
    expect(questService.getLearningStreak).toHaveBeenCalledWith(userId);
  });

  it('should handle loading errors', async () => {
    const userId = 'test-user-id';
    const errorMessage = 'Failed to load quests';

    vi.mocked(questService.getActiveQuests).mockRejectedValue(new Error(errorMessage));
    vi.mocked(questService.getLearningStreak).mockResolvedValue(null);

    const { result } = renderHook(() => useQuests(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.dailyQuests).toEqual([]);
    expect(result.current.weeklyQuests).toEqual([]);
  });

  it('should generate daily quests', async () => {
    const userId = 'test-user-id';
    const mockGeneratedQuests = [
      {
        id: 'generated-daily-1',
        title: 'Generated Quest',
        type: 'daily',
        objectives: []
      }
    ];

    vi.mocked(questService.getActiveQuests).mockResolvedValue([]);
    vi.mocked(questService.getLearningStreak).mockResolvedValue(null);
    vi.mocked(questService.generateDailyQuests).mockResolvedValue(mockGeneratedQuests);

    const { result } = renderHook(() => useQuests(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.generateDailyQuests();
    });

    expect(result.current.dailyQuests).toEqual(mockGeneratedQuests);
    expect(questService.generateDailyQuests).toHaveBeenCalledWith(userId);
  });

  it('should generate weekly quests', async () => {
    const userId = 'test-user-id';
    const mockGeneratedQuests = [
      {
        id: 'generated-weekly-1',
        title: 'Generated Weekly Quest',
        type: 'weekly',
        objectives: []
      }
    ];

    vi.mocked(questService.getActiveQuests).mockResolvedValue([]);
    vi.mocked(questService.getLearningStreak).mockResolvedValue(null);
    vi.mocked(questService.generateWeeklyQuests).mockResolvedValue(mockGeneratedQuests);

    const { result } = renderHook(() => useQuests(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.generateWeeklyQuests();
    });

    expect(result.current.weeklyQuests).toEqual(mockGeneratedQuests);
    expect(questService.generateWeeklyQuests).toHaveBeenCalledWith(userId);
  });

  it('should update quest progress', async () => {
    const userId = 'test-user-id';
    const mockQuests = [
      {
        id: 'quest-1',
        title: 'Test Quest',
        type: 'daily',
        objectives: [
          {
            id: 'obj-1',
            type: 'answer_questions',
            currentValue: 2,
            targetValue: 5,
            completed: false
          }
        ]
      }
    ];

    vi.mocked(questService.getActiveQuests)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockQuests)
      .mockResolvedValueOnce([]);
    vi.mocked(questService.getLearningStreak).mockResolvedValue(null);
    vi.mocked(questService.updateQuestProgress).mockResolvedValue();

    const { result } = renderHook(() => useQuests(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.updateQuestProgress('answer_question', {
        subjectId: 'mathematics',
        correctAnswers: 2
      });
    });

    expect(questService.updateQuestProgress).toHaveBeenCalledWith(
      userId,
      'answer_question',
      {
        subjectId: 'mathematics',
        correctAnswers: 2
      }
    );
  });

  it('should complete quest and remove from local state', async () => {
    const userId = 'test-user-id';
    const questToComplete = {
      id: 'quest-to-complete',
      title: 'Completable Quest',
      type: 'daily',
      objectives: []
    };
    const remainingQuest = {
      id: 'remaining-quest',
      title: 'Remaining Quest',
      type: 'daily',
      objectives: []
    };

    vi.mocked(questService.getActiveQuests)
      .mockResolvedValueOnce([questToComplete, remainingQuest])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([remainingQuest])
      .mockResolvedValueOnce([]);
    vi.mocked(questService.getLearningStreak).mockResolvedValue(null);
    vi.mocked(questService.completeQuest).mockResolvedValue();

    const { result } = renderHook(() => useQuests(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dailyQuests).toHaveLength(2);

    await act(async () => {
      await result.current.completeQuest('quest-to-complete');
    });

    expect(questService.completeQuest).toHaveBeenCalledWith(userId, 'quest-to-complete');
    expect(result.current.dailyQuests).toHaveLength(1);
    expect(result.current.dailyQuests[0].id).toBe('remaining-quest');
  });

  it('should handle quest generation errors', async () => {
    const userId = 'test-user-id';
    const errorMessage = 'Failed to generate quests';

    vi.mocked(questService.getActiveQuests).mockResolvedValue([]);
    vi.mocked(questService.getLearningStreak).mockResolvedValue(null);
    vi.mocked(questService.generateDailyQuests).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useQuests(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.generateDailyQuests();
    });

    expect(result.current.error).toBe(errorMessage);
  });

  it('should auto-generate quests when none exist', async () => {
    const userId = 'test-user-id';
    const mockGeneratedQuests = [
      {
        id: 'auto-generated-1',
        title: 'Auto Generated Quest',
        type: 'daily',
        objectives: []
      }
    ];

    vi.mocked(questService.getActiveQuests).mockResolvedValue([]);
    vi.mocked(questService.getLearningStreak).mockResolvedValue(null);
    vi.mocked(questService.generateDailyQuests).mockResolvedValue(mockGeneratedQuests);
    vi.mocked(questService.generateWeeklyQuests).mockResolvedValue([]);

    const { result } = renderHook(() => useQuests(userId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Wait for auto-generation to trigger
    await waitFor(() => {
      expect(questService.generateDailyQuests).toHaveBeenCalledWith(userId);
    });

    expect(result.current.dailyQuests).toEqual(mockGeneratedQuests);
  });

  it('should refresh quests when userId changes', async () => {
    const userId1 = 'user-1';
    const userId2 = 'user-2';
    const mockQuests1 = [{ id: 'quest-1', title: 'User 1 Quest', type: 'daily', objectives: [] }];
    const mockQuests2 = [{ id: 'quest-2', title: 'User 2 Quest', type: 'daily', objectives: [] }];

    vi.mocked(questService.getActiveQuests)
      .mockResolvedValueOnce(mockQuests1)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(mockQuests2)
      .mockResolvedValueOnce([]);
    vi.mocked(questService.getLearningStreak).mockResolvedValue(null);

    const { result, rerender } = renderHook(
      ({ userId }) => useQuests(userId),
      { initialProps: { userId: userId1 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.dailyQuests).toEqual(mockQuests1);

    rerender({ userId: userId2 });

    await waitFor(() => {
      expect(result.current.dailyQuests).toEqual(mockQuests2);
    });

    expect(questService.getActiveQuests).toHaveBeenCalledWith(userId1, 'daily');
    expect(questService.getActiveQuests).toHaveBeenCalledWith(userId2, 'daily');
  });
});