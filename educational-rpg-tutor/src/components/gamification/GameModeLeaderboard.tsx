import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameModeService } from '../../services/gameModeService';
import type { GameLeaderboardEntry, GameMode } from '../../types/gameMode';
import { useAuth } from '../../hooks/useAuth';

interface GameModeLeaderboardProps {
  gameMode: GameMode;
  className?: string;
}

export const GameModeLeaderboard: React.FC<GameModeLeaderboardProps> = ({
  gameMode,
  className = ''
}) => {
  const [leaderboard, setLeaderboard] = useState<GameLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all_time'>('weekly');
  const { user } = useAuth();

  useEffect(() => {
    loadLeaderboard();
  }, [gameMode.id, timeframe]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await gameModeService.getGameModeLeaderboard(gameMode.id, timeframe);
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${position}`;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-300';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-gray-400';
    }
  };

  const formatScore = (score: number) => {
    return score.toLocaleString();
  };

  const formatAccuracy = (accuracy: number) => {
    return `${Math.round(accuracy)}%`;
  };

  const isCurrentUser = (entry: GameLeaderboardEntry) => {
    return user && entry.userId === user.id;
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <span className="text-2xl">{gameMode.icon}</span>
          <h3 className="text-2xl font-bold text-white">{gameMode.name}</h3>
        </div>
        <p className="text-gray-400">Leaderboard</p>
      </div>

      {/* Timeframe Selector */}
      <div className="flex justify-center">
        <div className="bg-gray-800 rounded-lg p-1 flex space-x-1">
          {(['daily', 'weekly', 'all_time'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                timeframe === period
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {period === 'all_time' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        {leaderboard.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {/* Header */}
            <div className="px-6 py-4 bg-gray-800/50">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-400">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-center">Accuracy</div>
                <div className="col-span-3 text-center">Bonuses</div>
              </div>
            </div>

            {/* Entries */}
            <AnimatePresence>
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`px-6 py-4 hover:bg-gray-700/30 transition-colors ${
                    isCurrentUser(entry) ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Rank */}
                    <div className="col-span-1">
                      <div className={`text-lg font-bold ${getPositionColor(entry.finalPosition)}`}>
                        {getPositionIcon(entry.finalPosition)}
                      </div>
                    </div>

                    {/* Player Info */}
                    <div className="col-span-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {entry.characterName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-medium ${isCurrentUser(entry) ? 'text-blue-400' : 'text-white'}`}>
                            {entry.characterName}
                            {isCurrentUser(entry) && (
                              <span className="ml-2 text-xs bg-blue-600 text-blue-100 px-2 py-1 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">@{entry.username}</div>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="col-span-2 text-center">
                      <div className="text-lg font-bold text-white">{formatScore(entry.score)}</div>
                      <div className="text-xs text-gray-400">points</div>
                    </div>

                    {/* Accuracy */}
                    <div className="col-span-2 text-center">
                      <div className="text-lg font-bold text-green-400">{formatAccuracy(entry.accuracy)}</div>
                      <div className="text-xs text-gray-400">accuracy</div>
                    </div>

                    {/* Bonuses */}
                    <div className="col-span-3">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {entry.timeBonus > 0 && (
                          <div className="flex items-center space-x-1 bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full text-xs">
                            <span>⚡</span>
                            <span>+{Math.round(entry.timeBonus)}</span>
                          </div>
                        )}
                        {entry.streakBonus > 0 && (
                          <div className="flex items-center space-x-1 bg-orange-900/30 text-orange-300 px-2 py-1 rounded-full text-xs">
                            <span>🔥</span>
                            <span>+{Math.round(entry.streakBonus)}</span>
                          </div>
                        )}
                        {entry.powerUpBonus > 0 && (
                          <div className="flex items-center space-x-1 bg-purple-900/30 text-purple-300 px-2 py-1 rounded-full text-xs">
                            <span>✨</span>
                            <span>+{Math.round(entry.powerUpBonus)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rewards (for top positions) */}
                  {entry.finalPosition <= 3 && entry.rewardsEarned.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">Rewards:</span>
                        <div className="flex flex-wrap gap-1">
                          {entry.rewardsEarned.map((reward, rewardIndex) => (
                            <span
                              key={rewardIndex}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-900/30 text-yellow-300"
                            >
                              {reward.type === 'xp' && '✨'}
                              {reward.type === 'item' && '🎁'}
                              {reward.type === 'badge' && '🏆'}
                              {reward.type === 'stat_points' && '💪'}
                              <span className="ml-1">
                                {reward.value} {reward.type.replace('_', ' ')}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h4 className="text-xl font-bold text-white mb-2">No Records Yet</h4>
            <p className="text-gray-400">
              Be the first to complete this game mode and claim the top spot!
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border border-yellow-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🥇</div>
            <div className="text-lg font-bold text-yellow-400">
              {leaderboard[0]?.characterName || 'No Champion'}
            </div>
            <div className="text-sm text-gray-400">Current Champion</div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-lg font-bold text-blue-400">
              {Math.round(leaderboard.reduce((sum, entry) => sum + entry.accuracy, 0) / leaderboard.length) || 0}%
            </div>
            <div className="text-sm text-gray-400">Average Accuracy</div>
          </div>

          <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/30 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🎮</div>
            <div className="text-lg font-bold text-green-400">
              {leaderboard.length}
            </div>
            <div className="text-sm text-gray-400">Total Players</div>
          </div>
        </div>
      )}
    </div>
  );
};