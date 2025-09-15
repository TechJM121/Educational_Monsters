import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Supabase
vi.mock('../supabaseClient', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
    send: vi.fn().mockResolvedValue(undefined)
  };

  return {
    supabase: {
      channel: vi.fn().mockReturnValue(mockChannel),
      removeChannel: vi.fn(),
      realtime: {
        connection: {
          readyState: WebSocket.OPEN
        }
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null
              })
            })
          })
        })
      })
    }
  };
});

import { realtimeService, RealtimeService } from '../realtimeService';

describe('RealtimeService', () => {
  let service: RealtimeService;
  let mockSupabase: any;
  let mockChannel: any;

  beforeEach(async () => {
    const { supabase } = await import('../supabaseClient');
    mockSupabase = supabase;
    mockChannel = mockSupabase.channel();
    service = new RealtimeService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    service.unsubscribeAll();
  });

  describe('subscribeToCharacterUpdates', () => {
    it('should create a subscription for character updates', () => {
      const userId = 'test-user-id';
      const onUpdate = vi.fn();

      const subscription = service.subscribeToCharacterUpdates(userId, onUpdate);

      expect(mockSupabase.channel).toHaveBeenCalledWith(`character-updates-${userId}`);
      expect(mockChannel.on).toHaveBeenCalledTimes(2); // For characters and character_stats tables
      expect(mockChannel.subscribe).toHaveBeenCalled();
      expect(subscription).toHaveProperty('channel');
      expect(subscription).toHaveProperty('unsubscribe');
    });

    it('should call onUpdate when character data changes', () => {
      const userId = 'test-user-id';
      const onUpdate = vi.fn();
      
      service.subscribeToCharacterUpdates(userId, onUpdate);

      // Simulate a character update
      const mockPayload = {
        new: {
          id: 'char-id',
          user_id: userId,
          level: 5,
          total_xp: 1000,
          current_xp: 200,
          updated_at: '2023-01-01T00:00:00Z'
        }
      };

      // Get the callback that was registered
      const characterUpdateCallback = mockChannel.on.mock.calls[0][2];
      characterUpdateCallback(mockPayload);

      expect(onUpdate).toHaveBeenCalledWith({
        characterId: 'char-id',
        userId: userId,
        level: 5,
        totalXP: 1000,
        currentXP: 200,
        updatedAt: '2023-01-01T00:00:00Z'
      });
    });

    it('should handle stat updates', () => {
      const userId = 'test-user-id';
      const onUpdate = vi.fn();
      
      service.subscribeToCharacterUpdates(userId, onUpdate);

      // Simulate a stats update
      const mockPayload = {
        new: {
          character_id: 'char-id',
          intelligence: 15,
          vitality: 12,
          wisdom: 10,
          charisma: 8,
          dexterity: 14,
          creativity: 11,
          available_points: 3,
          updated_at: '2023-01-01T00:00:00Z'
        }
      };

      // Get the stats update callback
      const statsUpdateCallback = mockChannel.on.mock.calls[1][2];
      statsUpdateCallback(mockPayload);

      expect(onUpdate).toHaveBeenCalledWith({
        characterId: 'char-id',
        userId: userId,
        stats: {
          intelligence: 15,
          vitality: 12,
          wisdom: 10,
          charisma: 8,
          dexterity: 14,
          creativity: 11,
          availablePoints: 3
        },
        updatedAt: '2023-01-01T00:00:00Z'
      });
    });
  });

  describe('subscribeToLeaderboardUpdates', () => {
    it('should create a subscription for leaderboard updates', () => {
      const classroomId = 'test-classroom';
      const onUpdate = vi.fn();

      const subscription = service.subscribeToLeaderboardUpdates(classroomId, onUpdate);

      expect(mockSupabase.channel).toHaveBeenCalledWith(`leaderboard-${classroomId}`);
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'character_xp_logs'
        },
        expect.any(Function)
      );
      expect(subscription).toHaveProperty('unsubscribe');
    });
  });

  describe('subscribeToQuestProgress', () => {
    it('should create a subscription for quest progress updates', () => {
      const userId = 'test-user-id';
      const onUpdate = vi.fn();

      const subscription = service.subscribeToQuestProgress(userId, onUpdate);

      expect(mockSupabase.channel).toHaveBeenCalledWith(`quest-progress-${userId}`);
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_quests',
          filter: `user_id=eq.${userId}`
        },
        expect.any(Function)
      );
      expect(subscription).toHaveProperty('unsubscribe');
    });

    it('should call onUpdate when quest progress changes', () => {
      const userId = 'test-user-id';
      const onUpdate = vi.fn();
      
      service.subscribeToQuestProgress(userId, onUpdate);

      const mockPayload = {
        new: {
          quest_id: 'quest-1',
          user_id: userId,
          progress: [{ currentValue: 5, targetValue: 10 }],
          completed: false,
          completed_at: null
        }
      };

      const callback = mockChannel.on.mock.calls[0][2];
      callback(mockPayload);

      expect(onUpdate).toHaveBeenCalledWith({
        questId: 'quest-1',
        userId: userId,
        progress: [{ currentValue: 5, targetValue: 10 }],
        completed: false,
        completedAt: null
      });
    });
  });

  describe('subscribeToNotifications', () => {
    it('should create a subscription for notifications', () => {
      const userId = 'test-user-id';
      const onNotification = vi.fn();

      const subscription = service.subscribeToNotifications(userId, onNotification);

      expect(mockSupabase.channel).toHaveBeenCalledWith(`notifications-${userId}`);
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_activities',
          filter: `user_id=eq.${userId}`
        },
        expect.any(Function)
      );
      expect(subscription).toHaveProperty('unsubscribe');
    });

    it('should call onNotification with formatted notification', () => {
      const userId = 'test-user-id';
      const onNotification = vi.fn();
      
      service.subscribeToNotifications(userId, onNotification);

      const mockPayload = {
        new: {
          id: 'activity-1',
          user_id: userId,
          activity_type: 'achievement',
          description: 'You earned a new achievement!',
          related_item_id: 'achievement-1',
          created_at: '2023-01-01T00:00:00Z'
        }
      };

      const callback = mockChannel.on.mock.calls[0][2];
      callback(mockPayload);

      expect(onNotification).toHaveBeenCalledWith({
        id: 'activity-1',
        userId: userId,
        type: 'achievement',
        title: '🏆 Achievement Unlocked!',
        message: 'You earned a new achievement!',
        data: { itemId: 'achievement-1' },
        createdAt: '2023-01-01T00:00:00Z'
      });
    });
  });

  describe('broadcastEvent', () => {
    it('should broadcast an event to a channel', async () => {
      const channelName = 'test-channel';
      const eventType = 'test-event';
      const payload = { data: 'test' };

      await service.broadcastEvent(channelName, eventType, payload);

      expect(mockSupabase.channel).toHaveBeenCalledWith(channelName);
      expect(mockChannel.send).toHaveBeenCalledWith({
        type: 'broadcast',
        event: eventType,
        payload
      });
    });
  });

  describe('getConnectionStatus', () => {
    it('should return OPEN when connection is open', () => {
      mockSupabase.realtime.connection.readyState = WebSocket.OPEN;
      expect(service.getConnectionStatus()).toBe('OPEN');
    });

    it('should return CLOSED when connection is not open', () => {
      mockSupabase.realtime.connection.readyState = WebSocket.CLOSED;
      expect(service.getConnectionStatus()).toBe('CLOSED');
    });
  });

  describe('unsubscribe and unsubscribeAll', () => {
    it('should unsubscribe from a specific channel', () => {
      const userId = 'test-user-id';
      const onUpdate = vi.fn();
      
      service.subscribeToCharacterUpdates(userId, onUpdate);
      const channelName = `character-updates-${userId}`;
      
      service.unsubscribe(channelName);
      
      expect(mockSupabase.removeChannel).toHaveBeenCalledWith(mockChannel);
    });

    it('should unsubscribe from all channels', () => {
      const userId = 'test-user-id';
      const onUpdate = vi.fn();
      
      service.subscribeToCharacterUpdates(userId, onUpdate);
      service.subscribeToQuestProgress(userId, onUpdate);
      
      service.unsubscribeAll();
      
      expect(mockSupabase.removeChannel).toHaveBeenCalledTimes(2);
    });
  });
});