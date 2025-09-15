import React from 'react';
import { Tooltip } from '../shared/Tooltip';
import type { Achievement, UserAchievement } from '../../types/achievement';

interface AchievementBadgeProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
};

const rarityColors = {
  1: 'border-gray-400 bg-gray-100', // Common
  2: 'border-green-400 bg-green-100', // Uncommon
  3: 'border-blue-400 bg-blue-100', // Rare
  4: 'border-purple-400 bg-purple-100', // Epic
  5: 'border-yellow-400 bg-yellow-100', // Legendary
};

const rarityNames = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Epic',
  5: 'Legendary',
};

export function AchievementBadge({
  achievement,
  userAchievement,
  size = 'md',
  showProgress = false,
  className = ''
}: AchievementBadgeProps) {
  const isUnlocked = !!userAchievement;
  const rarity = achievement.rarityLevel as keyof typeof rarityColors;
  
  const tooltipContent = (
    <div className="max-w-xs">
      <div className="font-semibold text-white">{achievement.name}</div>
      <div className="text-xs text-slate-300 mt-1">{achievement.description}</div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-slate-400">
          {rarityNames[rarity]} Achievement
        </span>
        {isUnlocked && userAchievement && (
          <span className="text-xs text-green-400">
            Unlocked {new Date(userAchievement.unlockedAt).toLocaleDateString()}
          </span>
        )}
      </div>
      {showProgress && userAchievement?.progress !== undefined && (
        <div className="mt-2">
          <div className="text-xs text-slate-400 mb-1">Progress</div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(userAchievement.progress, 100)}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {userAchievement.progress}%
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div
        className={`
          ${sizeClasses[size]}
          ${rarityColors[rarity]}
          ${isUnlocked ? 'opacity-100' : 'opacity-40 grayscale'}
          rounded-full border-2 flex items-center justify-center
          transition-all duration-200 hover:scale-110 cursor-pointer
          ${className}
        `}
      >
        <span className="text-slate-800">
          {achievement.badgeIcon || '🏆'}
        </span>
        
        {isUnlocked && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        )}
      </div>
    </Tooltip>
  );
}