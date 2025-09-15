import { useState, useEffect, useCallback } from 'react';
import { questService } from '../services/questService';
import type { Quest, LearningStreak } from '../types/quest';

export interface UseQuestsReturn {
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  learningStreak: LearningStreak | null;
  loading: boolean;
  error: string | null;
  refreshQuests: () => Promise<void>;
  generateDailyQuests: () => Promise<void>;
  generateWeeklyQuests: () => Promise<void>;
  updateQuestProgress: (
    activityType: 'answer_question' | 'complete_lesson' | 'earn_xp',
    data: {
      subjectId?: string;
      xpEarned?: number;
      accuracy?: number;
      questionsAnswered?: number;
      correctAnswers?: number;
    }
  ) => Promise<void>;
  completeQuest: (questId: string) => Promise<void>;
}

export const useQuests = (userId: string | null): UseQuestsReturn => {
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [weeklyQuests, setWeeklyQuests] = useState<Quest[]>([]);
  const [learningStreak, setLearningStreak] = useState<LearningStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshQuests = useCallback(async () => {
    if (!userId) {
      setDailyQuests([]);
      setWeeklyQuests([]);
      setLearningStreak(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const [daily, weekly, streak] = await Promise.all([
        questService.getActiveQuests(userId, 'daily'),
        questService.getActiveQuests(userId, 'weekly'),
        questService.getLearningStreak(userId)
      ]);

      setDailyQuests(daily);
      setWeeklyQuests(weekly);
      setLearningStreak(streak);
    } catch (err) {
      console.error('Error fetching quests:', err);
      setError(err instanceof Error ? err.message : 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const generateDailyQuests = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const newQuests = await questService.generateDailyQuests(userId);
      setDailyQuests(newQuests);
    } catch (err) {
      console.error('Error generating daily quests:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate daily quests');
    }
  }, [userId]);

  const generateWeeklyQuests = useCallback(async () => {
    if (!userId) return;

    try {
      setError(null);
      const newQuests = await questService.generateWeeklyQuests(userId);
      setWeeklyQuests(newQuests);
    } catch (err) {
      console.error('Error generating weekly quests:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate weekly quests');
    }
  }, [userId]);

  const updateQuestProgress = useCallback(async (
    activityType: 'answer_question' | 'complete_lesson' | 'earn_xp',
    data: {
      subjectId?: string;
      xpEarned?: number;
      accuracy?: number;
      questionsAnswered?: number;
      correctAnswers?: number;
    }
  ) => {
    if (!userId) return;

    try {
      await questService.updateQuestProgress(userId, activityType, data);
      
      // Refresh quests to get updated progress
      await refreshQuests();
    } catch (err) {
      console.error('Error updating quest progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to update quest progress');
    }
  }, [userId, refreshQuests]);

  const completeQuest = useCallback(async (questId: string) => {
    if (!userId) return;

    try {
      await questService.completeQuest(userId, questId);
      
      // Remove completed quest from local state
      setDailyQuests(prev => prev.filter(q => q.id !== questId));
      setWeeklyQuests(prev => prev.filter(q => q.id !== questId));
      
      // Refresh to get updated streak and any new quests
      await refreshQuests();
    } catch (err) {
      console.error('Error completing quest:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete quest');
    }
  }, [userId, refreshQuests]);

  // Load quests on mount and when userId changes
  useEffect(() => {
    refreshQuests();
  }, [refreshQuests]);

  // Auto-generate quests if none exist
  useEffect(() => {
    if (!loading && userId && dailyQuests && dailyQuests.length === 0) {
      generateDailyQuests();
    }
  }, [loading, userId, dailyQuests?.length, generateDailyQuests]);

  useEffect(() => {
    if (!loading && userId && weeklyQuests && weeklyQuests.length === 0) {
      generateWeeklyQuests();
    }
  }, [loading, userId, weeklyQuests?.length, generateWeeklyQuests]);

  return {
    dailyQuests,
    weeklyQuests,
    learningStreak,
    loading,
    error,
    refreshQuests,
    generateDailyQuests,
    generateWeeklyQuests,
    updateQuestProgress,
    completeQuest
  };
};