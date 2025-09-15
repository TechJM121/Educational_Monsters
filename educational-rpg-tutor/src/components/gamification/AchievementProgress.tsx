import React from 'react';
import { motion } from 'framer-motion';
import { AchievementBadge } from './AchievementBadge';
import type { Achievement, UserAchievement } from '../../types/achievement';

interface AchievementProgressProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  maxDisplay?: number;
  showProgress?: boolean;
  className?: string;
}

export function AchievementProgress({
  achievements,
  userAchievements,
  maxDisplay = 8,
  showProgress = true,
  className = ''
}: AchievementProgressProps) {
  const userAchievementMap = new Map(
    userAchievements.map(ua => [ua.achievementId, ua])
  );

  // Sort achievements: unlocked first (by unlock date), then by rarity
  const sortedAchievements = [...achievements].sort((a, b) => {
    const aUnlocked = userAchievementMap.has(a.id);
    const bUnlocked = userAchievementMap.has(b.id);

    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    
    if (aUnlocked && bUnlocked) {
      const aDate = userAchievementMap.get(a.id)!.unlockedAt.getTime();
      const bDate = userAchievementMap.get(b.id)!.unlockedAt.getTime();
      return bDate - aDate; // Most recent first
    }

    return a.rarityLevel - b.rarityLevel; // Lower rarity first for locked
  });

  const displayAchievements = sortedAchievements.slice(0, maxDisplay);
  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800">Achievements</h3>
        <div className="text-sm text-slate-600">
          {unlockedCount} / {totalCount}
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Progress</span>
            <span className="text-sm text-slate-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ["0%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* Achievement Grid */}
      {displayAchievements.length > 0 ? (
        <div className="grid grid-cols-4 gap-3">
          {displayAchievements.map((achievement, index) => {
            const userAchievement = userAchievementMap.get(achievement.id);
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-center"
              >
                <AchievementBadge
                  achievement={achievement}
                  userAchievement={userAchievement}
                  size="md"
                  showProgress={showProgress}
                />
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-slate-400">No achievements yet</div>
          <div className="text-sm text-slate-500 mt-1">
            Complete lessons to earn your first achievement!
          </div>
        </div>
      )}

      {/* Show More Indicator */}
      {achievements.length > maxDisplay && (
        <div className="mt-4 text-center">
          <div className="text-sm text-slate-500">
            +{achievements.length - maxDisplay} more achievements
          </div>
        </div>
      )}

      {/* Recent Achievement */}
      {userAchievements.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="text-sm text-slate-600 mb-2">Most Recent:</div>
          <div className="flex items-center space-x-3">
            {(() => {
              const mostRecent = userAchievements.reduce((latest, current) => 
                current.unlockedAt > latest.unlockedAt ? current : latest
              );
              const achievement = achievements.find(a => a.id === mostRecent.achievementId);
              
              return achievement ? (
                <>
                  <AchievementBadge
                    achievement={achievement}
                    userAchievement={mostRecent}
                    size="sm"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {achievement.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {mostRecent.unlockedAt.toLocaleDateString()}
                    </div>
                  </div>
                </>
              ) : null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}