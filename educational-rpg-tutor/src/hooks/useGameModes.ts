import { useState, useEffect, useCallback } from 'react';
import { gameModeService } from '../services/gameModeService';
import type { GameMode, GameSession, GameLeaderboardEntry } from '../types/gameMode';
import { useAuth } from './useAuth';
import { useNotification } from '../contexts/NotificationContext';

export const useGameModes = () => {
  const [gameModes, setGameModes] = useState<GameMode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  const loadGameModes = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const modes = await gameModeService.getAvailableGameModes(user.id);
      setGameModes(modes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load game modes';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showNotification]);

  useEffect(() => {
    loadGameModes();
  }, [loadGameModes]);

  const createGameSession = useCallback(async (gameModeId: string, settings?: any) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const sessionId = await gameModeService.createGameSession(user.id, gameModeId, settings);
      showNotification('Game session created successfully!', 'success');
      return sessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create game session';
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [user, showNotification]);

  const joinGameSession = useCallback(async (sessionId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const success = await gameModeService.joinGameSession(sessionId, user.id);
      if (success) {
        showNotification('Joined game session!', 'success');
      } else {
        throw new Error('Failed to join game session');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game session';
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [user, showNotification]);

  const startGameSession = useCallback(async (sessionId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const success = await gameModeService.startGameSession(sessionId, user.id);
      if (success) {
        showNotification('Game started!', 'success');
      } else {
        throw new Error('Failed to start game session');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start game session';
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [user, showNotification]);

  const submitAnswer = useCallback(async (
    sessionId: string,
    questionId: string,
    answer: string,
    timeSpent: number
  ) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const result = await gameModeService.submitAnswer(sessionId, user.id, questionId, answer, timeSpent);
      
      if (result.correct) {
        showNotification(`Correct! +${result.points} points`, 'success');
      } else {
        showNotification('Incorrect answer', 'error');
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit answer';
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [user, showNotification]);

  const usePowerUp = useCallback(async (sessionId: string, powerUpId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const success = await gameModeService.usePowerUp(sessionId, user.id, powerUpId);
      if (success) {
        showNotification('Power-up activated!', 'success');
      } else {
        throw new Error('Failed to use power-up');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to use power-up';
      showNotification(errorMessage, 'error');
      throw err;
    }
  }, [user, showNotification]);

  return {
    gameModes,
    loading,
    error,
    loadGameModes,
    createGameSession,
    joinGameSession,
    startGameSession,
    submitAnswer,
    usePowerUp
  };
};

export const useGameSession = (sessionId: string | null) => {
  const [session, setSession] = useState<(GameSession & { gameMode: GameMode }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      const sessionData = await gameModeService.getGameSession(sessionId);
      setSession(sessionData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load game session';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Poll for session updates when active
  useEffect(() => {
    if (!sessionId || !session || session.status !== 'active') return;

    const interval = setInterval(loadSession, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [sessionId, session?.status, loadSession]);

  return {
    session,
    loading,
    error,
    refreshSession: loadSession
  };
};

export const useGameModeLeaderboard = (gameModeId: string | null) => {
  const [leaderboard, setLeaderboard] = useState<GameLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all_time'>('weekly');

  const loadLeaderboard = useCallback(async () => {
    if (!gameModeId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await gameModeService.getGameModeLeaderboard(gameModeId, timeframe);
      setLeaderboard(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leaderboard';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameModeId, timeframe]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    timeframe,
    setTimeframe,
    refreshLeaderboard: loadLeaderboard
  };
};