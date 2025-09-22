import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameModeService } from '../../services/gameModeService';
import type { GameMode, GameSession, GameParticipant, GameSessionSettings } from '../../types/gameMode';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationContext';

interface GameLobbyProps {
  gameMode: GameMode;
  onGameStart: (sessionId: string) => void;
  onBack: () => void;
  className?: string;
}

export const GameLobby: React.FC<GameLobbyProps> = ({
  gameMode,
  onGameStart,
  onBack,
  className = ''
}) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [settings, setSettings] = useState<Partial<GameSessionSettings>>({});
  const [showSettings, setShowSettings] = useState(false);
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    createOrJoinSession();
  }, [gameMode, user]);

  const createOrJoinSession = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // For solo games, create immediately
      if (gameMode.maxParticipants === 1) {
        const sessionId = await gameModeService.createGameSession(user.id, gameMode.id, settings);
        const sessionData = await gameModeService.getGameSession(sessionId);
        if (sessionData) {
          setSession(sessionData);
          setIsHost(true);
          // Auto-start solo games
          setTimeout(() => startGame(), 1000);
        }
      } else {
        // For multiplayer, create a new session
        const sessionId = await gameModeService.createGameSession(user.id, gameMode.id, settings);
        const sessionData = await gameModeService.getGameSession(sessionId);
        if (sessionData) {
          setSession(sessionData);
          setIsHost(sessionData.hostUserId === user.id);
        }
      }
    } catch (error) {
      console.error('Error creating/joining session:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create game session'
      });
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    if (!session || !user || !isHost) return;

    try {
      setLoading(true);
      const success = await gameModeService.startGameSession(session.id, user.id);
      if (success) {
        onGameStart(session.id);
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to start game'
        });
      }
    } catch (error) {
      console.error('Error starting game:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to start game'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (newSettings: Partial<GameSessionSettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const getPlayerStatusIcon = (participant: GameParticipant) => {
    if (participant.status === 'active') {
      return participant.isReady ? '✅' : '⏳';
    }
    return '❌';
  };

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  if (loading && !session) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Setting up your game...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-6xl mb-4">❌</div>
        <h3 className="text-xl font-bold text-white mb-2">Failed to Create Game</h3>
        <p className="text-gray-400 mb-4">Something went wrong while setting up your game.</p>
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Back</span>
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{gameMode.name}</h2>
          <p className="text-gray-400">Game Lobby</p>
        </div>
        <div className="w-16"></div> {/* Spacer for centering */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Mode Details */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <div className="flex items-start space-x-4 mb-4">
              <div className="text-4xl">{gameMode.icon}</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{gameMode.name}</h3>
                <p className="text-gray-300 mb-3">{gameMode.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Difficulty:</span>
                    <div className="text-white">{getDifficultyStars(gameMode.difficulty)}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Duration:</span>
                    <div className="text-white">{gameMode.duration} minutes</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <div className="text-white capitalize">{gameMode.type.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Players:</span>
                    <div className="text-white">
                      {gameMode.maxParticipants === 1 ? 'Solo' : `Up to ${gameMode.maxParticipants}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="border-t border-gray-700 pt-4">
              <h4 className="font-semibold text-white mb-2">Game Rules:</h4>
              <ul className="space-y-1 text-sm text-gray-300">
                {gameMode.rules.map((rule, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{rule.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rewards */}
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h4 className="font-semibold text-white mb-2">Rewards:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {gameMode.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <span className="text-yellow-400">
                      {reward.position === 'winner' && '🥇'}
                      {reward.position === 'top_3' && '🥉'}
                      {reward.position === 'top_10' && '🏅'}
                      {reward.position === 'participant' && '🎁'}
                    </span>
                    <span className="text-gray-300 capitalize">
                      {reward.position.replace('_', ' ')}:
                    </span>
                    <span className="text-white">
                      {reward.value} {reward.type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settings (Host Only) */}
          {isHost && gameMode.maxParticipants > 1 && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-white">Game Settings</h4>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showSettings ? 'Hide' : 'Show'} Settings
                </button>
              </div>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Questions per Game
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="50"
                          value={settings.questionCount || 10}
                          onChange={(e) => updateSettings({ questionCount: parseInt(e.target.value) })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Time per Question (seconds)
                        </label>
                        <input
                          type="number"
                          min="10"
                          max="120"
                          value={settings.timePerQuestion || 30}
                          onChange={(e) => updateSettings({ timePerQuestion: parseInt(e.target.value) })}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.allowPowerUps !== false}
                          onChange={(e) => updateSettings({ allowPowerUps: e.target.checked })}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Allow Power-ups</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings.difficultyScaling !== false}
                          onChange={(e) => updateSettings({ difficultyScaling: e.target.checked })}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-300">Difficulty Scaling</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Players Panel */}
        <div className="space-y-6">
          {/* Current Players */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
            <h4 className="font-semibold text-white mb-4">
              Players ({session.participants.length}/{gameMode.maxParticipants})
            </h4>
            <div className="space-y-3">
              {session.participants.map((participant) => (
                <div
                  key={participant.userId}
                  className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg"
                >
                  <div className="text-lg">{getPlayerStatusIcon(participant)}</div>
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {participant.characterName}
                      {participant.userId === session.hostUserId && (
                        <span className="ml-2 text-xs bg-yellow-600 text-yellow-100 px-2 py-1 rounded-full">
                          Host
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      Level {participant.level} • {participant.username}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {participant.isReady ? 'Ready' : 'Not Ready'}
                  </div>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: gameMode.maxParticipants - session.participants.length }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="flex items-center space-x-3 p-3 bg-gray-700/20 rounded-lg border-2 border-dashed border-gray-600"
                >
                  <div className="text-lg text-gray-500">👤</div>
                  <div className="flex-1 text-gray-500">
                    Waiting for player...
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {isHost && gameMode.maxParticipants > 1 && (
              <motion.button
                onClick={startGame}
                disabled={loading || session.participants.length < 1}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Starting...</span>
                  </div>
                ) : (
                  'Start Game'
                )}
              </motion.button>
            )}

            <motion.button
              onClick={onBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Leave Lobby
            </motion.button>
          </div>

          {/* Game Status */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-400">ℹ️</span>
              <span className="font-medium text-blue-300">Game Status</span>
            </div>
            <p className="text-sm text-blue-200">
              {session.status === 'waiting' && 'Waiting for players to join...'}
              {session.status === 'active' && 'Game is currently active!'}
              {session.status === 'completed' && 'Game has ended.'}
            </p>
            {gameMode.maxParticipants === 1 && (
              <p className="text-sm text-blue-200 mt-1">
                Solo game will start automatically.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};