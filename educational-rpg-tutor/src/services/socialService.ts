// Social features service for Educational RPG Tutor

import { supabase } from './supabaseClient';
import {
  Friend,
  FriendProfile,
  LeaderboardEntry,
  LearningChallenge,
  ChallengeParticipant,
  TradeRequest,
  TradeItem,
  SocialActivity,
  ClassroomGroup,
  ParentalControl
} from '../types/social';

export class SocialService {
  // Friend System
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<Friend> {
    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${fromUserId},friend_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_id.eq.${fromUserId})`)
      .single();

    if (existing) {
      throw new Error('Friendship already exists or request pending');
    }

    const { data, error } = await supabase
      .from('friends')
      .insert({
        user_id: fromUserId,
        friend_id: toUserId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Create activity notification
    await this.createSocialActivity(toUserId, 'friend_request', 'You have a new friend request', fromUserId);

    return this.mapFriend(data);
  }

  async acceptFriendRequest(friendshipId: string): Promise<Friend> {
    const { data, error } = await supabase
      .from('friends')
      .update({ 
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', friendshipId)
      .select()
      .single();

    if (error) throw error;

    return this.mapFriend(data);
  }

  async getFriends(userId: string): Promise<FriendProfile[]> {
    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        friend_user:users!friends_friend_id_fkey(id, name),
        friend_character:characters!friends_friend_id_fkey(name, level, total_xp, avatar_config, specialization),
        user_user:users!friends_user_id_fkey(id, name),
        user_character:characters!friends_user_id_fkey(name, level, total_xp, avatar_config, specialization)
      `)
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (error) throw error;

    return data.map(friendship => {
      const isFriendUser = friendship.friend_id !== userId;
      const friendData = isFriendUser ? friendship.friend_user : friendship.user_user;
      const characterData = isFriendUser ? friendship.friend_character : friendship.user_character;

      return {
        id: friendData.id,
        name: friendData.name,
        level: characterData.level,
        totalXP: characterData.total_xp,
        avatarConfig: characterData.avatar_config,
        specialization: characterData.specialization,
        isOnline: false, // TODO: Implement real-time presence
        lastActive: new Date() // TODO: Track last activity
      };
    });
  }

  // Leaderboard System
  async getWeeklyLeaderboard(classroomId?: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    let query = supabase
      .from('character_xp_logs')
      .select(`
        user_id,
        characters(name, level, total_xp, avatar_config, specialization),
        users(name)
      `)
      .gte('created_at', oneWeekAgo.toISOString());

    if (classroomId) {
      // Filter by classroom members
      const { data: classroom } = await supabase
        .from('classroom_groups')
        .select('students')
        .eq('id', classroomId)
        .single();

      if (classroom?.students) {
        query = query.in('user_id', classroom.students);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    // Aggregate weekly XP by user
    const userXPMap = new Map<string, { weeklyXP: number; character: any; user: any }>();
    
    data.forEach(log => {
      const existing = userXPMap.get(log.user_id);
      if (existing) {
        existing.weeklyXP += log.xp_gained || 0;
      } else {
        userXPMap.set(log.user_id, {
          weeklyXP: log.xp_gained || 0,
          character: log.characters,
          user: log.users
        });
      }
    });

    // Convert to leaderboard entries and sort
    const entries: LeaderboardEntry[] = Array.from(userXPMap.entries()).map(([userId, data]) => ({
      userId,
      characterName: data.character.name,
      level: data.character.level,
      weeklyXP: data.weeklyXP,
      totalXP: data.character.total_xp,
      avatarConfig: data.character.avatar_config,
      specialization: data.character.specialization,
      rank: 0 // Will be set after sorting
    }));

    entries.sort((a, b) => b.weeklyXP - a.weeklyXP);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries.slice(0, limit);
  }

  // Learning Challenge System
  async createLearningChallenge(challenge: Omit<LearningChallenge, 'id' | 'currentParticipants'>): Promise<LearningChallenge> {
    const { data, error } = await supabase
      .from('learning_challenges')
      .insert({
        title: challenge.title,
        description: challenge.description,
        subject_id: challenge.subjectId,
        start_date: challenge.startDate.toISOString(),
        end_date: challenge.endDate.toISOString(),
        max_participants: challenge.maxParticipants,
        xp_reward: challenge.xpReward,
        status: challenge.status,
        created_by: challenge.createdBy,
        requirements: challenge.requirements
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapLearningChallenge(data);
  }

  async getActiveChallenges(): Promise<LearningChallenge[]> {
    const { data, error } = await supabase
      .from('learning_challenges')
      .select(`
        *,
        challenge_participants(count)
      `)
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString());

    if (error) throw error;

    return data.map(this.mapLearningChallenge);
  }

  async joinChallenge(challengeId: string, userId: string): Promise<ChallengeParticipant> {
    const { data, error } = await supabase
      .from('challenge_participants')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        score: 0
      })
      .select(`
        *,
        characters(name)
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      challengeId: data.challenge_id,
      userId: data.user_id,
      characterName: data.characters.name,
      score: data.score,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      rank: data.rank
    };
  }

  // Trading System
  async createTradeRequest(
    fromUserId: string,
    toUserId: string,
    fromItems: TradeItem[],
    toItems: TradeItem[]
  ): Promise<TradeRequest> {
    // Check if users are friends
    const { data: friendship } = await supabase
      .from('friends')
      .select('*')
      .or(`and(user_id.eq.${fromUserId},friend_id.eq.${toUserId}),and(user_id.eq.${toUserId},friend_id.eq.${fromUserId})`)
      .eq('status', 'accepted')
      .single();

    if (!friendship) {
      throw new Error('Can only trade with friends');
    }

    // Check parental controls
    const parentalApprovalRequired = await this.requiresParentalApproval(fromUserId) || 
                                   await this.requiresParentalApproval(toUserId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days to respond

    const { data, error } = await supabase
      .from('trade_requests')
      .insert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        from_items: fromItems,
        to_items: toItems,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
        parental_approval_required: parentalApprovalRequired
      })
      .select()
      .single();

    if (error) throw error;

    // Create activity notification
    await this.createSocialActivity(toUserId, 'trade_request', 'You have a new trade request', fromUserId);

    return this.mapTradeRequest(data);
  }

  async acceptTradeRequest(tradeId: string): Promise<TradeRequest> {
    const { data: trade, error: fetchError } = await supabase
      .from('trade_requests')
      .select('*')
      .eq('id', tradeId)
      .single();

    if (fetchError) throw fetchError;

    if (trade.parental_approval_required && !trade.parental_approval_given) {
      throw new Error('Parental approval required before completing trade');
    }

    // Execute the trade (transfer items between inventories)
    const { error: tradeError } = await supabase.rpc('execute_trade', {
      trade_request_id: tradeId
    });

    if (tradeError) throw tradeError;

    const { data, error } = await supabase
      .from('trade_requests')
      .update({ status: 'completed' })
      .eq('id', tradeId)
      .select()
      .single();

    if (error) throw error;

    return this.mapTradeRequest(data);
  }

  // Social Activities and Notifications
  async createSocialActivity(
    userId: string,
    activityType: SocialActivity['activityType'],
    description: string,
    relatedUserId?: string,
    relatedItemId?: string
  ): Promise<SocialActivity> {
    const { data, error } = await supabase
      .from('social_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        description,
        related_user_id: relatedUserId,
        related_item_id: relatedItemId,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapSocialActivity(data);
  }

  async getSocialActivities(userId: string, limit: number = 20): Promise<SocialActivity[]> {
    const { data, error } = await supabase
      .from('social_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map(this.mapSocialActivity);
  }

  // Parental Controls
  async getParentalControls(userId: string): Promise<ParentalControl | null> {
    const { data, error } = await supabase
      .from('parental_controls')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"

    return data ? this.mapParentalControl(data) : null;
  }

  async updateParentalControls(controls: Partial<ParentalControl>): Promise<ParentalControl> {
    const { data, error } = await supabase
      .from('parental_controls')
      .upsert({
        user_id: controls.userId,
        parent_id: controls.parentId,
        allow_friend_requests: controls.allowFriendRequests,
        allow_trading: controls.allowTrading,
        allow_challenges: controls.allowChallenges,
        allow_leaderboards: controls.allowLeaderboards,
        restricted_users: controls.restrictedUsers,
        approval_required: controls.approvalRequired
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapParentalControl(data);
  }

  // Helper methods
  private async requiresParentalApproval(userId: string): Promise<boolean> {
    const controls = await this.getParentalControls(userId);
    return controls?.approvalRequired || false;
  }

  private mapFriend(data: any): Friend {
    return {
      id: data.id,
      userId: data.user_id,
      friendId: data.friend_id,
      status: data.status,
      createdAt: new Date(data.created_at),
      acceptedAt: data.accepted_at ? new Date(data.accepted_at) : undefined
    };
  }

  private mapLearningChallenge(data: any): LearningChallenge {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      subjectId: data.subject_id,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      maxParticipants: data.max_participants,
      currentParticipants: data.challenge_participants?.[0]?.count || 0,
      xpReward: data.xp_reward,
      status: data.status,
      createdBy: data.created_by,
      requirements: data.requirements
    };
  }

  private mapTradeRequest(data: any): TradeRequest {
    return {
      id: data.id,
      fromUserId: data.from_user_id,
      toUserId: data.to_user_id,
      fromItems: data.from_items,
      toItems: data.to_items,
      status: data.status,
      createdAt: new Date(data.created_at),
      expiresAt: new Date(data.expires_at),
      parentalApprovalRequired: data.parental_approval_required,
      parentalApprovalGiven: data.parental_approval_given
    };
  }

  private mapSocialActivity(data: any): SocialActivity {
    return {
      id: data.id,
      userId: data.user_id,
      activityType: data.activity_type,
      description: data.description,
      relatedUserId: data.related_user_id,
      relatedItemId: data.related_item_id,
      createdAt: new Date(data.created_at),
      isRead: data.is_read
    };
  }

  private mapParentalControl(data: any): ParentalControl {
    return {
      id: data.id,
      userId: data.user_id,
      parentId: data.parent_id,
      allowFriendRequests: data.allow_friend_requests,
      allowTrading: data.allow_trading,
      allowChallenges: data.allow_challenges,
      allowLeaderboards: data.allow_leaderboards,
      restrictedUsers: data.restricted_users || [],
      approvalRequired: data.approval_required,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}

export const socialService = new SocialService();