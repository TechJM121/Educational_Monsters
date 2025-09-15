import React from 'react';
import { motion } from 'framer-motion';
import type { Quest } from '../../types/quest';

interface QuestCardProps {
  quest: Quest;
  onStartQuest?: (questId: string) => void;
  onCompleteQuest?: (questId: string) => void;
  className?: string;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onStartQuest,
  onCompleteQuest,
  className = ''
}) => {
  const isCompleted = quest.objectives.every(obj => obj.completed);
  const totalProgress = quest.objectives.reduce((sum, obj) => sum + obj.currentValue, 0);
  const totalTarget = quest.objectives.reduce((sum, obj) => sum + obj.targetValue, 0);
  const progressPercentage = totalTarget > 0 ? Math.round((totalProgress / totalTarget) * 100) : 0;

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'text-green-600 bg-green-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 4: return 'text-orange-600 bg-orange-100';
      case 5: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return 'Easy';
      case 2: return 'Normal';
      case 3: return 'Hard';
      case 4: return 'Expert';
      case 5: return 'Master';
      default: return 'Unknown';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning': return '📚';
      case 'social': return '👥';
      case 'achievement': return '🏆';
      default: return '⭐';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'daily' ? 'bg-blue-500' : 'bg-purple-500';
  };

  const handleAction = () => {
    if (isCompleted && onCompleteQuest) {
      onCompleteQuest(quest.id);
    } else if (onStartQuest) {
      onStartQuest(quest.id);
    }
  };

  return (
    <motion.div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getCategoryIcon(quest.category)}</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {quest.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(quest.type)} text-white`}>
                {quest.type}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quest.difficulty)}`}>
                {getDifficultyText(quest.difficulty)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            ~{quest.estimatedTimeMinutes} min
          </div>
          {isCompleted && (
            <div className="text-green-600 font-medium text-sm mt-1">
              ✓ Complete
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
        {quest.description}
      </p>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Progress</span>
          <span>{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
          <motion.div
            className={`h-2 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </div>

        {/* Objectives */}
        <div className="space-y-2">
          {quest.objectives.map((objective, index) => (
            <div
              key={objective.id}
              className={`flex items-center justify-between text-sm p-2 rounded-lg ${
                objective.completed 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  objective.completed ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  {objective.completed ? '✓' : index + 1}
                </div>
                <span>{objective.description}</span>
              </div>
              <span className="font-medium">
                {objective.currentValue}/{objective.targetValue}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rewards:
        </div>
        <div className="flex flex-wrap gap-2">
          {quest.rewards.map((reward, index) => (
            <div
              key={index}
              className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded-full text-xs"
            >
              <span>
                {reward.type === 'xp' && '⚡'}
                {reward.type === 'item' && '🎁'}
                {reward.type === 'stat_points' && '💪'}
                {reward.type === 'achievement' && '🏆'}
              </span>
              <span>
                {reward.value} {reward.type.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        onClick={handleAction}
        className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
          isCompleted
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={!onStartQuest && !onCompleteQuest}
      >
        {isCompleted ? 'Claim Rewards' : 'Start Quest'}
      </motion.button>

      {/* Expiry Warning */}
      {new Date(quest.expiresAt).getTime() - Date.now() < 24 * 60 * 60 * 1000 && (
        <div className="mt-3 text-center text-xs text-orange-600 dark:text-orange-400">
          ⏰ Expires in {Math.ceil((new Date(quest.expiresAt).getTime() - Date.now()) / (60 * 60 * 1000))} hours
        </div>
      )}
    </motion.div>
  );
};