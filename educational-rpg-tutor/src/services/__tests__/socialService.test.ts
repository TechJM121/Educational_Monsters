// Tests for social service

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { socialService, SocialService } from '../socialService';
import { supabase } from '../supabaseClient';

// Mock Supabase
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        })),
        or: vi.fn(() => ({
          single: vi.fn(),
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn()
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        gte: vi.fn(() => ({
          in: vi.fn()
        })),
        in: vi.fn(),
        lte: vi.fn(() => ({
          gte: vi.fn()
        })),
        order: vi.fn(() => ({
          limit: vi.fn()
        })),
        limit: vi.fn()
      }))
    })),
    rpc: vi.fn()
  }
}));

describe('SocialService', () => {
  let service: SocialService;

  beforeEach(() => {
    service = new SocialService();
    vi.clearAllMocks();
  });

  describe('Friend System', () => {
    it('should send friend request successfully', async () => {
      const mockFriendship = {
        id: 'friendship-1',
        user_id: 'user-1',
        friend_id: 'user-2',
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z'
      };

      // Mock existing friendship check (should return null)
      const mockSelect = vi.fn(() => ({
        or: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        }))
      }));

      // Mock insert
      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockFriendship, error: null })
        }))
      }));

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'friends') {
          return {
            select: mockSelect,
            insert: mockInsert
          };
        }
        if (table === 'social_activities') {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({ data: {}, error: null })
              }))
            }))
          };
        }
      });

      const result = await service.sendFriendRequest('user-1', 'user-2');

      expect(result).toEqual({
        id: 'friendship-1',
        userId: 'user-1',
        friendId: 'user-2',
        status: 'pending',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        acceptedAt: undefined
      });
    });

    it('should throw error if friendship already exists', async () => {
      const mockExistingFriendship = {
        id: 'existing-friendship',
        user_id: 'user-1',
        friend_id: 'user-2',
        status: 'accepted'
      };

      const mockSelect = vi.fn(() => ({
        or: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockExistingFriendship, error: null })
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      await expect(service.sendFriendRequest('user-1', 'user-2'))
        .rejects.toThrow('Friendship already exists or request pending');
    });

    it('should accept friend request successfully', async () => {
      const mockUpdatedFriendship = {
        id: 'friendship-1',
        user_id: 'user-1',
        friend_id: 'user-2',
        status: 'accepted',
        created_at: '2024-01-01T00:00:00Z',
        accepted_at: '2024-01-02T00:00:00Z'
      };

      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockUpdatedFriendship, error: null })
          }))
        }))
      }));

      (supabase.from as any).mockReturnValue({
        update: mockUpdate
      });

      const result = await service.acceptFriendRequest('friendship-1');

      expect(result).toEqual({
        id: 'friendship-1',
        userId: 'user-1',
        friendId: 'user-2',
        status: 'accepted',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        acceptedAt: new Date('2024-01-02T00:00:00Z')
      });
    });
  });

  describe('Leaderboard System', () => {
    it('should get weekly leaderboard successfully', async () => {
      const mockLeaderboardData = [
        {
          user_id: 'user-1',
          xp_gained: 500,
          characters: {
            name: 'Hero1',
            level: 10,
            total_xp: 2000,
            avatar_config: {},
            specialization: 'scholar'
          },
          users: { name: 'Player1' }
        },
        {
          user_id: 'user-2',
          xp_gained: 300,
          characters: {
            name: 'Hero2',
            level: 8,
            total_xp: 1500,
            avatar_config: {},
            specialization: 'explorer'
          },
          users: { name: 'Player2' }
        }
      ];

      const mockSelect = vi.fn(() => ({
        gte: vi.fn().mockResolvedValue({ data: mockLeaderboardData, error: null })
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      const result = await service.getWeeklyLeaderboard();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        userId: 'user-1',
        characterName: 'Hero1',
        level: 10,
        weeklyXP: 500,
        totalXP: 2000,
        avatarConfig: {},
        specialization: 'scholar',
        rank: 1
      });
      expect(result[1]).toEqual({
        userId: 'user-2',
        characterName: 'Hero2',
        level: 8,
        weeklyXP: 300,
        totalXP: 1500,
        avatarConfig: {},
        specialization: 'explorer',
        rank: 2
      });
    });

    it('should filter leaderboard by classroom', async () => {
      const mockClassroom = {
        students: ['user-1', 'user-2', 'user-3']
      };

      const mockClassroomSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockClassroom, error: null })
        }))
      }));

      const mockLeaderboardSelect = vi.fn(() => ({
        gte: vi.fn(() => ({
          in: vi.fn().mockResolvedValue({ data: [], error: null })
        }))
      }));

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'classroom_groups') {
          return { select: mockClassroomSelect };
        }
        if (table === 'character_xp_logs') {
          return { select: mockLeaderboardSelect };
        }
      });

      await service.getWeeklyLeaderboard('classroom-1');

      expect(mockClassroomSelect).toHaveBeenCalled();
    });
  });

  describe('Learning Challenge System', () => {
    it('should create learning challenge successfully', async () => {
      const challengeData = {
        title: 'Math Challenge',
        description: 'Solve 10 math problems',
        subjectId: 'math',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-07'),
        xpReward: 100,
        status: 'active' as const,
        createdBy: 'teacher-1'
      };

      const mockChallengeResponse = {
        id: 'challenge-1',
        title: 'Math Challenge',
        description: 'Solve 10 math problems',
        subject_id: 'math',
        start_date: '2024-01-01T00:00:00Z',
        end_date: '2024-01-07T00:00:00Z',
        xp_reward: 100,
        status: 'active',
        created_by: 'teacher-1'
      };

      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockChallengeResponse, error: null })
        }))
      }));

      (supabase.from as any).mockReturnValue({
        insert: mockInsert
      });

      const result = await service.createLearningChallenge(challengeData);

      expect(result).toEqual({
        id: 'challenge-1',
        title: 'Math Challenge',
        description: 'Solve 10 math problems',
        subjectId: 'math',
        startDate: new Date('2024-01-01T00:00:00Z'),
        endDate: new Date('2024-01-07T00:00:00Z'),
        currentParticipants: 0,
        xpReward: 100,
        status: 'active',
        createdBy: 'teacher-1',
        requirements: undefined,
        maxParticipants: undefined
      });
    });

    it('should join challenge successfully', async () => {
      const mockParticipant = {
        id: 'participant-1',
        challenge_id: 'challenge-1',
        user_id: 'user-1',
        score: 0,
        characters: { name: 'Hero1' }
      };

      const mockInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockParticipant, error: null })
        }))
      }));

      (supabase.from as any).mockReturnValue({
        insert: mockInsert
      });

      const result = await service.joinChallenge('challenge-1', 'user-1');

      expect(result).toEqual({
        id: 'participant-1',
        challengeId: 'challenge-1',
        userId: 'user-1',
        characterName: 'Hero1',
        score: 0,
        completedAt: undefined,
        rank: undefined
      });
    });
  });

  describe('Trading System', () => {
    it('should create trade request successfully', async () => {
      const mockFriendship = {
        id: 'friendship-1',
        status: 'accepted'
      };

      const mockTradeRequest = {
        id: 'trade-1',
        from_user_id: 'user-1',
        to_user_id: 'user-2',
        from_items: [],
        to_items: [],
        status: 'pending',
        created_at: '2024-01-01T00:00:00Z',
        expires_at: '2024-01-08T00:00:00Z',
        parental_approval_required: false
      };

      // Mock friendship check
      const mockFriendshipSelect = vi.fn(() => ({
        or: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: mockFriendship, error: null })
          }))
        }))
      }));

      // Mock trade request creation
      const mockTradeInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockTradeRequest, error: null })
        }))
      }));

      // Mock social activity creation
      const mockActivityInsert = vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: {}, error: null })
        }))
      }));

      (supabase.from as any).mockImplementation((table: string) => {
        if (table === 'friends') {
          return { select: mockFriendshipSelect };
        }
        if (table === 'trade_requests') {
          return { insert: mockTradeInsert };
        }
        if (table === 'social_activities') {
          return { insert: mockActivityInsert };
        }
      });

      const result = await service.createTradeRequest('user-1', 'user-2', [], []);

      expect(result).toEqual({
        id: 'trade-1',
        fromUserId: 'user-1',
        toUserId: 'user-2',
        fromItems: [],
        toItems: [],
        status: 'pending',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        expiresAt: new Date('2024-01-08T00:00:00Z'),
        parentalApprovalRequired: false,
        parentalApprovalGiven: undefined
      });
    });

    it('should throw error if users are not friends', async () => {
      const mockFriendshipSelect = vi.fn(() => ({
        or: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: null })
          }))
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockFriendshipSelect
      });

      await expect(service.createTradeRequest('user-1', 'user-2', [], []))
        .rejects.toThrow('Can only trade with friends');
    });
  });

  describe('Parental Controls', () => {
    it('should get parental controls successfully', async () => {
      const mockControls = {
        id: 'controls-1',
        user_id: 'user-1',
        parent_id: 'parent-1',
        allow_friend_requests: true,
        allow_trading: false,
        allow_challenges: true,
        allow_leaderboards: true,
        restricted_users: ['user-3'],
        approval_required: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      };

      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: mockControls, error: null })
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      const result = await service.getParentalControls('user-1');

      expect(result).toEqual({
        id: 'controls-1',
        userId: 'user-1',
        parentId: 'parent-1',
        allowFriendRequests: true,
        allowTrading: false,
        allowChallenges: true,
        allowLeaderboards: true,
        restrictedUsers: ['user-3'],
        approvalRequired: true,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-01T00:00:00Z')
      });
    });

    it('should return null if no parental controls found', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { code: 'PGRST116' } // Not found error
          })
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      const result = await service.getParentalControls('user-1');

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const mockSelect = vi.fn(() => ({
        or: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ 
            data: null, 
            error: { message: 'Database connection failed' }
          })
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      await expect(service.sendFriendRequest('user-1', 'user-2'))
        .rejects.toThrow('Database connection failed');
    });

    it('should handle network errors', async () => {
      const mockSelect = vi.fn(() => ({
        or: vi.fn(() => ({
          single: vi.fn().mockRejectedValue(new Error('Network error'))
        }))
      }));

      (supabase.from as any).mockReturnValue({
        select: mockSelect
      });

      await expect(service.sendFriendRequest('user-1', 'user-2'))
        .rejects.toThrow('Network error');
    });
  });
});