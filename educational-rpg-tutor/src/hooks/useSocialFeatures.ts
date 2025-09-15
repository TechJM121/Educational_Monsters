// Hook for managing social features and interactions

import { useState, useEffect, useCallback } from 'react';
import {
  FriendProfile,
  LeaderboardEntry,
  LearningChallenge,
  TradeRequest,
  SocialActivity,
  ParentalControl
} from '../types/social';
import { socialService } from '../services/socialService';

interface UseSocialFeaturesProps {
  userId: string;
  classroomId?: string;
}

interface UseSocialFeaturesReturn {
  // Friends
  friends: FriendProfile[];
  loadingFriends: boolean;
  sendFriendRequest: (targetUserId: string) => Promise<void>;
  acceptFriendRequest: (friendshipId: string) => Promise<void>;
  
  // Leaderboard
  leaderboard: LeaderboardEntry[];
  loadingLeaderboard: boolean;
  refreshLeaderboard: () => Promise<void>;
  
  // Challenges
  challenges: LearningChallenge[];
  loadingChallenges: boolean;
  joinChallenge: (challengeId: string) => Promise<void>;
  
  // Trading
  tradeRequests: TradeRequest[];
  loadingTrades: boolean;
  createTradeRequest: (
    toUserId: string,
    fromItems: any[],
    toItems: any[]
  ) => Promise<void>;
  acceptTradeRequest: (tradeId: string) => Promise<void>;
  
  // Social Activities
  activities: SocialActivity[];
  loadingActivities: boolean;
  markActivityAsRead: (activityId: string) => Promise<void>;
  
  // Parental Controls
  parentalControls: ParentalControl | null;
  loadingControls: boolean;
  updateParentalControls: (controls: Partial<ParentalControl>) => Promise<void>;
  
  // General
  error: string | null;
  clearError: () => void;
  refreshAll: () => Promise<void>;
}

export const useSocialFeatures = ({
  userId,
  classroomId
}: UseSocialFeaturesProps): UseSocialFeaturesReturn => {
  // State
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [challenges, setChallenges] = useState<LearningChallenge[]>([]);
  const [tradeRequests, setTradeRequests] = useState<TradeRequest[]>([]);
  const [activities, setActivities] = useState<SocialActivity[]>([]);
  const [parentalControls, setParentalControls] = useState<ParentalControl | null>(null);
  
  // Loading states
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [loadingChallenges, setLoadingChallenges] = useState(false);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingControls, setLoadingControls] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Friends functions
  const loadFriends = useCallback(async () => {
    try {
      setLoadingFriends(true);
      setError(null);
      const data = await socialService.getFriends(userId);
      setFriends(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setLoadingFriends(false);
    }
  }, [userId]);

  const sendFriendRequest = useCallback(async (targetUserId: string) => {
    try {
      setError(null);
      await socialService.sendFriendRequest(userId, targetUserId);
      // Optionally refresh friends list or show success message
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send friend request');
      throw err;
    }
  }, [userId]);

  const acceptFriendRequest = useCallback(async (friendshipId: string) => {
    try {
      setError(null);
      await socialService.acceptFriendRequest(friendshipId);
      await loadFriends(); // Refresh friends list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept friend request');
      throw err;
    }
  }, [loadFriends]);

  // Leaderboard functions
  const loadLeaderboard = useCallback(async () => {
    try {
      setLoadingLeaderboard(true);
      setError(null);
      const data = await socialService.getWeeklyLeaderboard(classroomId);
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [classroomId]);

  const refreshLeaderboard = useCallback(async () => {
    await loadLeaderboard();
  }, [loadLeaderboard]);

  // Challenges functions
  const loadChallenges = useCallback(async () => {
    try {
      setLoadingChallenges(true);
      setError(null);
      const data = await socialService.getActiveChallenges();
      setChallenges(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoadingChallenges(false);
    }
  }, []);

  const joinChallenge = useCallback(async (challengeId: string) => {
    try {
      setError(null);
      await socialService.joinChallenge(challengeId, userId);
      await loadChallenges(); // Refresh challenges to update participant count
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join challenge');
      throw err;
    }
  }, [userId, loadChallenges]);

  // Trading functions
  const loadTradeRequests = useCallback(async () => {
    try {
      setLoadingTrades(true);
      setError(null);
      // TODO: Implement getTradeRequests in socialService
      // const data = await socialService.getTradeRequests(userId);
      // setTradeRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trade requests');
    } finally {
      setLoadingTrades(false);
    }
  }, [userId]);

  const createTradeRequest = useCallback(async (
    toUserId: string,
    fromItems: any[],
    toItems: any[]
  ) => {
    try {
      setError(null);
      await socialService.createTradeRequest(userId, toUserId, fromItems, toItems);
      await loadTradeRequests(); // Refresh trade requests
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create trade request');
      throw err;
    }
  }, [userId, loadTradeRequests]);

  const acceptTradeRequest = useCallback(async (tradeId: string) => {
    try {
      setError(null);
      await socialService.acceptTradeRequest(tradeId);
      await loadTradeRequests(); // Refresh trade requests
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept trade request');
      throw err;
    }
  }, [loadTradeRequests]);

  // Social activities functions
  const loadActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);
      setError(null);
      const data = await socialService.getSocialActivities(userId);
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoadingActivities(false);
    }
  }, [userId]);

  const markActivityAsRead = useCallback(async (activityId: string) => {
    try {
      setError(null);
      // TODO: Implement markActivityAsRead in socialService
      // await socialService.markActivityAsRead(activityId);
      
      // Update local state
      setActivities(prev => 
        prev.map(activity => 
          activity.id === activityId 
            ? { ...activity, isRead: true }
            : activity
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark activity as read');
      throw err;
    }
  }, []);

  // Parental controls functions
  const loadParentalControls = useCallback(async () => {
    try {
      setLoadingControls(true);
      setError(null);
      const data = await socialService.getParentalControls(userId);
      setParentalControls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parental controls');
    } finally {
      setLoadingControls(false);
    }
  }, [userId]);

  const updateParentalControls = useCallback(async (controls: Partial<ParentalControl>) => {
    try {
      setError(null);
      const updatedControls = await socialService.updateParentalControls(controls);
      setParentalControls(updatedControls);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update parental controls');
      throw err;
    }
  }, []);

  // General functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadFriends(),
      loadLeaderboard(),
      loadChallenges(),
      loadTradeRequests(),
      loadActivities(),
      loadParentalControls()
    ]);
  }, [
    loadFriends,
    loadLeaderboard,
    loadChallenges,
    loadTradeRequests,
    loadActivities,
    loadParentalControls
  ]);

  // Initial load
  useEffect(() => {
    if (userId) {
      refreshAll();
    }
  }, [userId, refreshAll]);

  return {
    // Friends
    friends,
    loadingFriends,
    sendFriendRequest,
    acceptFriendRequest,
    
    // Leaderboard
    leaderboard,
    loadingLeaderboard,
    refreshLeaderboard,
    
    // Challenges
    challenges,
    loadingChallenges,
    joinChallenge,
    
    // Trading
    tradeRequests,
    loadingTrades,
    createTradeRequest,
    acceptTradeRequest,
    
    // Social Activities
    activities,
    loadingActivities,
    markActivityAsRead,
    
    // Parental Controls
    parentalControls,
    loadingControls,
    updateParentalControls,
    
    // General
    error,
    clearError,
    refreshAll
  };
};