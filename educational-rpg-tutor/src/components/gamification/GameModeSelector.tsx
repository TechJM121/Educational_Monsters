import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameModeService } from '../../services/gameModeService';
import type { GameMode } from '../../types/gameMode';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationContext';

interface GameModeSelectorProps {
  onGameModeSelect: (gameMode: GameMode) => void;
  className?: string;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  onGameModeSelect,
  className = ''
}) => {
  const [gameModes, setGameModes] = useState<GameMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'daily' | 'weekly' | 'special_event'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    loadGameModes();
  }, [user]);

  const loadGameModes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const modes = await gameModeService.getAvailableGameModes(user.id);
      setGameModes(modes);
    } catch (error) {
      console.error('Error loading game modes:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load game modes'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredGameModes = gameModes.filter(mode => {
    if (selectedCategory !== 'all' && mode.category !== selectedCategory) {
      return false;
    }
    if (selectedDifficulty !== 'all' && mode.difficulty !== selectedDifficulty) {
      return false;
    }
    return true;
  });

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'text-green-400',
      2: 'text-blue-400',
      3: 'text-yellow-400',
      4: 'text-orange-400',
      5: 'text-red-400'
    };
    return colors[difficulty as keyof typeof colors] || 'text-gray-400';
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Medium',
      4: 'Hard',
      5: 'Expert'
    };
    return labels[difficulty as keyof typeof labels] || 'Unknown';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      daily: '📅',
      weekly: '🗓️',
      special_event: '🎉',
      permanent: '♾️'
    };
    return icons[category as keyof typeof icons] || '🎮';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      competitive: '⚔️',
      cooperative: '🤝',
      solo_challenge: '🎯',
      timed: '⏱️',
      survival: '🛡️'
    };
    return icons[type as keyof typeof icons] || '🎮';
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Choose Your Challenge</h2>
        <p className="text-gray-300">Test your knowledge in exciting game modes!</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-300">Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="special_event">Special Events</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-300">Difficulty:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as any)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value={1}>Beginner</option>
            <option value={2}>Easy</option>
            <option value={3}>Medium</option>
            <option value={4}>Hard</option>
            <option value={5}>Expert</option>
          </select>
        </div>
      </div>

      {/* Game Mode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredGameModes.map((gameMode) => (
            <motion.div
              key={gameMode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 cursor-pointer group"
              onClick={() => onGameModeSelect(gameMode)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{gameMode.icon}</span>
                  <div>
                    <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                      {gameMode.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>{getCategoryIcon(gameMode.category)}</span>
                      <span className="capitalize">{gameMode.category.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getDifficultyColor(gameMode.difficulty)}`}>
                    {getDifficultyLabel(gameMode.difficulty)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {gameMode.duration}min
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {gameMode.description}
              </p>

              {/* Game Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Type:</span>
                  <div className="flex items-center space-x-1">
                    <span>{getTypeIcon(gameMode.type)}</span>
                    <span className="text-white capitalize">{gameMode.type.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Players:</span>
                  <span className="text-white">
                    {gameMode.maxParticipants === 1 ? 'Solo' : `Up to ${gameMode.maxParticipants}`}
                  </span>
                </div>
                {gameMode.minLevel > 1 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Min Level:</span>
                    <span className="text-white">{gameMode.minLevel}</span>
                  </div>
                )}
              </div>

              {/* Rewards Preview */}
              <div className="border-t border-gray-700 pt-3">
                <div className="text-xs text-gray-400 mb-1">Rewards:</div>
                <div className="flex flex-wrap gap-1">
                  {gameMode.rewards.slice(0, 3).map((reward, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-900/30 text-blue-300"
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
                  {gameMode.rewards.length > 3 && (
                    <span className="text-xs text-gray-400">+{gameMode.rewards.length - 3} more</span>
                  )}
                </div>
              </div>

              {/* Special Event Timer */}
              {gameMode.category === 'special_event' && gameMode.endTime && (
                <div className="mt-3 p-2 bg-purple-900/30 rounded-lg border border-purple-700">
                  <div className="text-xs text-purple-300 font-medium">
                    🎉 Special Event
                  </div>
                  <div className="text-xs text-purple-200">
                    Ends: {gameMode.endTime.toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Play Button */}
              <motion.div
                className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg py-2 text-center text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Now
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredGameModes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎮</div>
          <h3 className="text-xl font-bold text-white mb-2">No Game Modes Available</h3>
          <p className="text-gray-400">
            {selectedCategory !== 'all' || selectedDifficulty !== 'all'
              ? 'Try adjusting your filters to see more options.'
              : 'Level up your character to unlock more challenging game modes!'}
          </p>
        </div>
      )}
    </div>
  );
};