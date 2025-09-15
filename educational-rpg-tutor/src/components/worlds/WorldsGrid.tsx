import React from 'react';
import { motion } from 'framer-motion';
import { WorldCard } from './WorldCard';
import type { LearningWorld } from '../../types/world';

interface WorldsGridProps {
  worlds: LearningWorld[];
  loading: boolean;
  error: string | null;
  onEnterWorld: (worldId: string) => void;
  onUnlockWorld: (worldId: string) => void;
  recommendedWorldId?: string | null;
}

export const WorldsGrid: React.FC<WorldsGridProps> = ({
  worlds,
  loading,
  error,
  onEnterWorld,
  onUnlockWorld,
  recommendedWorldId
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg font-medium mb-2">
          Failed to load learning worlds
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          {error}
        </div>
      </div>
    );
  }

  if (worlds.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🌍</div>
        <div className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          No Learning Worlds Available
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          Complete your character setup to unlock learning worlds.
        </div>
      </div>
    );
  }

  const unlockedWorlds = worlds.filter(w => w.isUnlocked);
  const lockedWorlds = worlds.filter(w => !w.isUnlocked);

  return (
    <div className="space-y-8">
      {/* Recommended World Banner */}
      {recommendedWorldId && (
        <motion.div
          className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">⭐</div>
            <div>
              <h3 className="text-lg font-bold">Recommended for You</h3>
              <p className="text-purple-100">
                Continue your learning journey in{' '}
                {worlds.find(w => w.id === recommendedWorldId)?.name || 'this world'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Unlocked Worlds */}
      {unlockedWorlds.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Your Learning Worlds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unlockedWorlds.map((world, index) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <WorldCard
                  world={world}
                  onEnterWorld={onEnterWorld}
                  className={
                    world.id === recommendedWorldId
                      ? 'ring-2 ring-purple-500 ring-opacity-50'
                      : ''
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Worlds */}
      {lockedWorlds.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Discover New Worlds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lockedWorlds.map((world, index) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (unlockedWorlds.length + index) * 0.1 }}
              >
                <WorldCard
                  world={world}
                  onEnterWorld={onEnterWorld}
                  onUnlockWorld={onUnlockWorld}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* World Stats */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Your Progress
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {unlockedWorlds.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Worlds Unlocked
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(
                unlockedWorlds.reduce((sum, w) => sum + w.completionPercentage, 0) /
                Math.max(unlockedWorlds.length, 1)
              )}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Completion
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {unlockedWorlds.reduce((sum, w) => sum + w.availableQuests.length, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Available Quests
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {worlds.length - unlockedWorlds.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Worlds to Discover
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};