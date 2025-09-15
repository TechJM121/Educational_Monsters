import { supabase } from './supabaseClient';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Character } from '../types/character';
import type { LeaderboardEntry, SocialActivity } from '../types/social';
import type { UserQuest } from '../types/quest';

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export interface CharacterUpdatePayload {
  characterId: string;
  userId: string;
  level?: number;
  totalXP?: number;
  currentXP?: number;
  stats?: any;
  updatedAt: string;
}

export interface LeaderboardUpdatePayload {
  userId: string;
  characterName: string;
  weeklyXP: number;
  totalXP: number;
  level: number;
  rank: number;
}

export interface QuestProgressPayload {
  questId: string;
  userId: string;
  progress: any;
  completed: boolean;
  completedAt?: string;
}

export interface NotificationPayload {
  id: string;
  userId: string;
  type: 'achievement' | 'level_up' | 'friend_request' | 'trade_request' | 'challenge_invite';
  title: string;
  message: string;
  data?: any;
  createdAt: string;
}

export class RealtimeService {
  private subscriptions: Map<string, RealtimeSubscription> = new Map();

  /**
   * Subscribe to character progression updates for a specific user
   */
  subscribeToCharacterUpdates(
    userId: string,
    onUpdate: (payload: CharacterUpdatePayload) => void
  ): RealtimeSubscription {
    const channelName = `character-updates-${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'characters',
          filter: `user_id=eq.${userId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const character = payload.new;
          onUpdate({
            characterId: character.id,
            userId: character.user_id,
            level: character.level,
            totalXP: character.total_xp,
            currentXP: character.current_xp,
            updatedAt: character.updated_at
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'character_stats',
          filter: `character_id=eq.${userId}` // This will need to be adjusted based on character ID
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const stats = payload.new;
          onUpdate({
            characterId: stats.character_id,
            userId: userId,
            stats: {
              intelligence: stats.intelligence,
              vitality: stats.vitality,
              wisdom: stats.wisdom,
              charisma: stats.charisma,
              dexterity: stats.dexterity,
              creativity: stats.creativity,
              availablePoints: stats.available_points
            },
            updatedAt: stats.updated_at
          });
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  /**
   * Subscribe to leaderboard updates for a classroom or group
   */
  subscribeToLeaderboardUpdates(
    classroomId: string,
    onUpdate: (payload: LeaderboardUpdatePayload[]) => void
  ): RealtimeSubscription {
    const channelName = `leaderboard-${classroomId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'character_xp_logs'
        },
        async () => {
          // When XP changes, recalculate leaderboard
          await this.fetchAndBroadcastLeaderboard(classroomId, onUpdate);
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  /**
   * Subscribe to quest progress updates for a user
   */
  subscribeToQuestProgress(
    userId: string,
    onUpdate: (payload: QuestProgressPayload) => void
  ): RealtimeSubscription {
    const channelName = `quest-progress-${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_quests',
          filter: `user_id=eq.${userId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const quest = payload.new || payload.old;
          onUpdate({
            questId: quest.quest_id,
            userId: quest.user_id,
            progress: quest.progress,
            completed: quest.completed,
            completedAt: quest.completed_at
          });
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  /**
   * Subscribe to social activity notifications
   */
  subscribeToNotifications(
    userId: string,
    onNotification: (payload: NotificationPayload) => void
  ): RealtimeSubscription {
    const channelName = `notifications-${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_activities',
          filter: `user_id=eq.${userId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const activity = payload.new;
          onNotification({
            id: activity.id,
            userId: activity.user_id,
            type: activity.activity_type,
            title: this.getNotificationTitle(activity.activity_type),
            message: activity.description,
            data: activity.related_item_id ? { itemId: activity.related_item_id } : undefined,
            createdAt: activity.created_at
          });
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  /**
   * Subscribe to friend activity updates
   */
  subscribeToFriendActivity(
    userId: string,
    friendIds: string[],
    onActivity: (payload: SocialActivity) => void
  ): RealtimeSubscription {
    const channelName = `friend-activity-${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_activities'
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          const activity = payload.new;
          // Only notify if activity is from a friend
          if (friendIds.includes(activity.user_id)) {
            onActivity({
              id: activity.id,
              userId: activity.user_id,
              activityType: activity.activity_type,
              description: activity.description,
              relatedUserId: activity.related_user_id,
              relatedItemId: activity.related_item_id,
              createdAt: new Date(activity.created_at),
              isRead: activity.is_read
            });
          }
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  /**
   * Broadcast a custom event to a specific channel
   */
  async broadcastEvent(channelName: string, eventType: string, payload: any): Promise<void> {
    const channel = supabase.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event: eventType,
      payload
    });
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: string): void {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED' {
    return supabase.realtime.connection?.readyState === WebSocket.OPEN ? 'OPEN' : 'CLOSED';
  }

  /**
   * Private helper to fetch and broadcast leaderboard updates
   */
  private async fetchAndBroadcastLeaderboard(
    classroomId: string,
    onUpdate: (payload: LeaderboardUpdatePayload[]) => void
  ): Promise<void> {
    try {
      // This would need to be implemented based on your classroom/group structure
      // For now, we'll fetch top users by weekly XP
      const { data, error } = await supabase
        .from('character_xp_logs')
        .select(`
          user_id,
          xp_gained,
          characters!inner(name, level, total_xp, user_id)
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('xp_gained', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Process and aggregate the data
      const leaderboardData: LeaderboardUpdatePayload[] = [];
      // Implementation would depend on your specific data structure
      
      onUpdate(leaderboardData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }

  /**
   * Private helper to get notification titles
   */
  private getNotificationTitle(activityType: string): string {
    const titles: Record<string, string> = {
      'achievement': '🏆 Achievement Unlocked!',
      'level_up': '⬆️ Level Up!',
      'friend_request': '👋 Friend Request',
      'trade_request': '🔄 Trade Request',
      'challenge_invite': '⚔️ Challenge Invitation'
    };
    return titles[activityType] || '📢 Notification';
  }
}

export const realtimeService = new RealtimeService();