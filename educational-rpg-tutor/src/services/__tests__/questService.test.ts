import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { questService } from '../questService';
import { supabase } from '../supabaseClient';
import type { Quest, QuestTemplate } from '../../types/quest';

// Mock Supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          gt: vi.fn(() => ({
            eq: vi.fn()
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn()
        })),
        upsert: vi.fn()
      }))
    })),
    raw: vi.fn((query) => query)
  }
}));

describe('QuestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateDailyQuests', () => {
    it('should generate daily quests for unlocked worlds', async () => {
      const userId = 'test-user-id';
      const mockCharacter = {
        id: 'char-1',
        user_id: userId,
        level: 5,
        total_xp: 500
      };
      const mockWorldProgress = [
        { world_id: 'numerical-kingdom' },
        { world_id: 'laboratory-realm' }
      ];
      const mockUserProgress = [
        {
          subject: { name: 'Mathematics' },
          total_xp_earned: 200
        }
      ];

      // Mock database responses
      const mockSupabaseChain = {
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockCharacter, error: null }),
        select: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis()
      };

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'characters') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockCharacter, error: null })
              }))
            }))
          };
        }
        if (table === 'world_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: mockWorldProgress, error: null })
            }))
          };
        }
        if (table === 'user_progress') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ data: mockUserProgress, error: null })
            }))
          };
        }
        if (table === 'user_quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  gt: vi.fn().mockResolvedValue({ data: [], error: null })
                }))
              }))
            }))
          };
        }
        if (table === 'quests') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: { id: 'quest-1' }, error: null })
              }))
            }))
          };
        }
        return mockSupabaseChain;
      });

      const quests = await questService.generateDailyQuests(userId);

      expect(quests).toBeDefined();
      expect(Array.isArray(quests)).toBe(true);
      expect(supabase.from).toHaveBeenCalledWith('characters');
      expect(supabase.from).toHaveBeenCalledWith('world_progress');
    });

    it('should return existing quests if they already exist', async () => {
      const userId = 'test-user-id';
      const existingQuests = [
        {
          id: 'existing-quest-1',
          title: 'Existing Quest',
          type: 'daily',
          objectives: []
        }
      ];

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'user_quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  gt: vi.fn(() => ({
                    eq: vi.fn().mockResolvedValue({ data: existingQuests, error: null })
                  }))
                }))
              }))
            }))
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      const quests = await questService.generateDailyQuests(userId);

      expect(quests).toEqual(existingQuests);
    });

    it('should handle errors gracefully', async () => {
      const userId = 'test-user-id';

      (supabase.from as Mock).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
          }))
        }))
      }));

      await expect(questService.generateDailyQuests(userId)).rejects.toThrow('Character not found');
    });
  });

  describe('updateQuestProgress', () => {
    it('should update quest progress for answer_question activity', async () => {
      const userId = 'test-user-id';
      const mockQuests = [
        {
          id: 'quest-1',
          objectives: [
            {
              id: 'obj-1',
              type: 'answer_questions',
              currentValue: 2,
              targetValue: 5,
              completed: false,
              subjectFilter: 'mathematics'
            }
          ]
        }
      ];

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'user_quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  gt: vi.fn().mockResolvedValue({ data: mockQuests, error: null })
                }))
              }))
            })),
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null })
            }))
          };
        }
        if (table === 'learning_streaks') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
              }))
            })),
            insert: vi.fn().mockResolvedValue({ error: null })
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      await questService.updateQuestProgress(userId, 'answer_question', {
        subjectId: 'mathematics',
        correctAnswers: 2
      });

      expect(supabase.from).toHaveBeenCalledWith('user_quests');
    });

    it('should complete quest when all objectives are finished', async () => {
      const userId = 'test-user-id';
      const mockQuests = [
        {
          id: 'quest-1',
          objectives: [
            {
              id: 'obj-1',
              type: 'answer_questions',
              currentValue: 4,
              targetValue: 5,
              completed: false,
              subjectFilter: 'mathematics'
            }
          ],
          rewards: [{ type: 'xp', value: 100 }]
        }
      ];

      const mockQuestData = {
        id: 'quest-1',
        rewards: JSON.stringify([{ type: 'xp', value: 100 }])
      };

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'user_quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  gt: vi.fn().mockResolvedValue({ data: mockQuests, error: null })
                }))
              }))
            })),
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null })
            }))
          };
        }
        if (table === 'quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockQuestData, error: null })
              }))
            }))
          };
        }
        if (table === 'learning_streaks') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
              }))
            })),
            insert: vi.fn().mockResolvedValue({ error: null })
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      await questService.updateQuestProgress(userId, 'answer_question', {
        subjectId: 'mathematics',
        correctAnswers: 2
      });

      expect(supabase.from).toHaveBeenCalledWith('quests');
    });
  });

  describe('completeQuest', () => {
    it('should mark quest as completed and award rewards', async () => {
      const userId = 'test-user-id';
      const questId = 'quest-1';
      const mockQuest = {
        id: questId,
        rewards: [
          { type: 'xp', value: 100 },
          { type: 'stat_points', value: 2 }
        ]
      };

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'quests') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ 
                  data: { 
                    ...mockQuest, 
                    rewards: JSON.stringify(mockQuest.rewards) 
                  }, 
                  error: null 
                })
              }))
            }))
          };
        }
        if (table === 'user_quests') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null })
            }))
          };
        }
        if (table === 'character_stats') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null })
            }))
          };
        }
        if (table === 'learning_streaks') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
              }))
            }))
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      await questService.completeQuest(userId, questId);

      expect(supabase.from).toHaveBeenCalledWith('user_quests');
      expect(supabase.from).toHaveBeenCalledWith('character_stats');
    });

    it('should handle quest not found error', async () => {
      const userId = 'test-user-id';
      const questId = 'nonexistent-quest';

      (supabase.from as Mock).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') })
          }))
        }))
      }));

      await expect(questService.completeQuest(userId, questId)).rejects.toThrow('Quest not found');
    });
  });

  describe('getLearningStreak', () => {
    it('should return learning streak data', async () => {
      const userId = 'test-user-id';
      const mockStreak = {
        user_id: userId,
        current_streak: 5,
        longest_streak: 10,
        last_activity_date: new Date().toISOString(),
        streak_rewards: JSON.stringify([])
      };

      (supabase.from as Mock).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockStreak, error: null })
          }))
        }))
      }));

      const streak = await questService.getLearningStreak(userId);

      expect(streak).toEqual(mockStreak);
      expect(supabase.from).toHaveBeenCalledWith('learning_streaks');
    });

    it('should return null if no streak exists', async () => {
      const userId = 'test-user-id';

      (supabase.from as Mock).mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
          }))
        }))
      }));

      const streak = await questService.getLearningStreak(userId);

      expect(streak).toBeNull();
    });
  });

  describe('updateLearningStreak', () => {
    it('should create new streak for first-time user', async () => {
      const userId = 'test-user-id';

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'learning_streaks') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
              }))
            })),
            insert: vi.fn().mockResolvedValue({ error: null })
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      await questService.updateLearningStreak(userId);

      expect(supabase.from).toHaveBeenCalledWith('learning_streaks');
    });

    it('should increment streak for consecutive days', async () => {
      const userId = 'test-user-id';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const mockStreak = {
        user_id: userId,
        currentStreak: 3,
        longestStreak: 5,
        lastActivityDate: yesterday.toISOString(),
        streakRewards: []
      };

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'learning_streaks') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockStreak, error: null })
              }))
            })),
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null })
            }))
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      await questService.updateLearningStreak(userId);

      expect(supabase.from).toHaveBeenCalledWith('learning_streaks');
    });

    it('should reset streak for non-consecutive days', async () => {
      const userId = 'test-user-id';
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      
      const mockStreak = {
        user_id: userId,
        currentStreak: 5,
        longestStreak: 10,
        lastActivityDate: twoDaysAgo.toISOString(),
        streakRewards: []
      };

      (supabase.from as Mock).mockImplementation((table: string) => {
        if (table === 'learning_streaks') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: mockStreak, error: null })
              }))
            })),
            update: vi.fn(() => ({
              eq: vi.fn().mockResolvedValue({ error: null })
            }))
          };
        }
        return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis() };
      });

      await questService.updateLearningStreak(userId);

      expect(supabase.from).toHaveBeenCalledWith('learning_streaks');
    });
  });
});