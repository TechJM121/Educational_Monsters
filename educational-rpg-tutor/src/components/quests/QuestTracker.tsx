import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestCard } from './QuestCard';
import type { Quest, LearningStreak } from '../../types/quest';

interface QuestTrackerProps {
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  learningStreak: LearningStreak | null;
  loading: boolean;
  error: string | null;
  onStartQuest: (questId: string) => void;
  onCompleteQuest: (questId: string) => void;
  onGenerateQuests: () => void;
}

export const QuestTracker: React.FC<QuestTrackerProps> = ({
  dailyQuests,
  weeklyQuests,
  learningStreak,
  loading,
  error,
  onStartQuest,
  onCompleteQuest,
  onGenerateQuests
}) => {
  const getStreakRewardProgress = () => {
    if (!learningStreak) return null;
    
    const milestones = [3, 7, 14, 30, 60, 100];
    const currentStreak = learningStreak.currentStreak;
    const nextMilestone = milestones.find(m => m > currentStreak) || milestones[milestones.length - 1];
    
    return {
      current: currentStreak,
      next: nextMilestone,
      progress: (currentStreak / nextMilestone) * 100
    };
  };

  const streakProgress = getStreakRewardProgress();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg font-medium mb-2">
          Failed to load quests
        </div>
        <div className="text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </div>
        <button
          onClick={onGenerateQuests}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Learning Streak */}
      {learningStreak && (
        <motion.div
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">🔥 Learning Streak</h3>
              <p className="text-orange-100">
                Keep learning daily to maintain your streak!
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                {learningStreak.currentStreak}
              </div>
              <div className="text-sm text-orange-200">
                days
              </div>
            </div>
          </div>
          
          {streakProgress && (
            <div>
              <div className="flex justify-between text-sm text-orange-200 mb-2">
                <span>Next reward at {streakProgress.next} days</span>
                <span>{streakProgress.current}/{streakProgress.next}</span>
              </div>
              <div className="w-full bg-orange-400 bg-opacity-30 rounded-full h-2">
                <motion.div
                  className="h-2 bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(streakProgress.progress, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
            </div>
          )}
          
          <div className="mt-4 text-sm text-orange-200">
            <span className="font-medium">Best streak:</span> {learningStreak.longestStreak} days
          </div>
        </motion.div>
      )}

      {/* Daily Quests */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Daily Quests
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Resets daily at midnight
          </div>
        </div>
        
        {dailyQuests.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-4xl mb-2">📅</div>
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Daily Quests Available
            </div>
            <div className="text-gray-600 dark:text-gray-400 mb-4">
              New quests will be generated automatically.
            </div>
            <button
              onClick={onGenerateQuests}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Generate Quests
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {dailyQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <QuestCard
                    quest={quest}
                    onStartQuest={onStartQuest}
                    onCompleteQuest={onCompleteQuest}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Weekly Quests */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Weekly Challenges
          </h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Resets every Monday
          </div>
        </div>
        
        {weeklyQuests.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Weekly Challenges Available
            </div>
            <div className="text-gray-600 dark:text-gray-400">
              Complete daily quests to unlock weekly challenges.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {weeklyQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <QuestCard
                    quest={quest}
                    onStartQuest={onStartQuest}
                    onCompleteQuest={onCompleteQuest}
                    className="border-2 border-purple-200 dark:border-purple-700"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Quest Statistics */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Quest Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {dailyQuests.filter(q => q.objectives.every(obj => obj.completed)).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Daily Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {weeklyQuests.filter(q => q.objectives.every(obj => obj.completed)).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Weekly Completed
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {learningStreak?.currentStreak || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current Streak
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {learningStreak?.longestStreak || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Best Streak
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};