import React from 'react';
import { CharacterStats } from '../character/CharacterStats';
import { XPBar } from '../gamification/XPBar';
import { Tooltip } from '../shared/Tooltip';
import type { Character } from '../../types/character';
import type { LearningStreak } from '../../types/quest';

interface DashboardStatsProps {
  character: Character;
  xpForNextLevel: number;
  effectiveStats?: Character['stats'];
  learningStreak?: LearningStreak;
  className?: string;
}

export function DashboardStats({
  character,
  xpForNextLevel,
  effectiveStats,
  learningStreak,
  className = ''
}: DashboardStatsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* XP and Level Progress */}
      <div className="rpg-card">
        <h3 className="text-xl font-rpg text-slate-200 mb-4 flex items-center gap-2">
          <span>⚡</span>
          Experience & Level
        </h3>
        <XPBar
          currentXP={character.currentXP}
          xpForNextLevel={xpForNextLevel}
          level={character.level}
          totalXP={character.totalXP}
          showTotal={true}
          size="lg"
        />
      </div>

      {/* Learning Streak */}
      {learningStreak && (
        <div className="rpg-card">
          <h3 className="text-xl font-rpg text-slate-200 mb-4 flex items-center gap-2">
            <span>🔥</span>
            Learning Streak
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-orange-400">
                {learningStreak.currentStreak}
              </div>
              <div className="text-sm text-slate-400">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-slate-300">
                {learningStreak.longestStreak}
              </div>
              <div className="text-sm text-slate-400">Best Streak</div>
            </div>
            <Tooltip content="Keep learning daily to maintain your streak!">
              <div className="text-center">
                <div className="text-2xl">🎯</div>
                <div className="text-xs text-slate-400">Keep Going!</div>
              </div>
            </Tooltip>
          </div>

          {/* Streak Rewards */}
          {learningStreak.streakRewards.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-600">
              <div className="text-sm text-slate-400 mb-2">Upcoming Rewards:</div>
              <div className="flex gap-2 flex-wrap">
                {learningStreak.streakRewards
                  .filter(reward => !reward.claimed && reward.streakLength > learningStreak.currentStreak)
                  .slice(0, 3)
                  .map((reward, index) => (
                    <div
                      key={index}
                      className="bg-slate-700 px-2 py-1 rounded text-xs text-slate-300"
                    >
                      Day {reward.streakLength}: +{reward.rewardValue} 
                      {reward.rewardType === 'xp' && ' XP'}
                      {reward.rewardType === 'item' && ' Item'}
                      {reward.rewardType === 'badge' && ' Badge'}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Character Stats */}
      <div className="rpg-card">
        <h3 className="text-xl font-rpg text-slate-200 mb-4 flex items-center gap-2">
          <span>📊</span>
          Character Stats
        </h3>
        <CharacterStats
          stats={character.stats}
          effectiveStats={effectiveStats}
          showAvailablePoints={true}
        />
      </div>

      {/* Specialization Info */}
      {character.specialization && (
        <div className="rpg-card">
          <h3 className="text-xl font-rpg text-slate-200 mb-4 flex items-center gap-2">
            <span>🎭</span>
            Specialization
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-2xl">
              {getSpecializationIcon(character.specialization)}
            </div>
            <div>
              <div className="font-medium text-slate-200 capitalize">
                {character.specialization}
              </div>
              <div className="text-sm text-slate-400">
                {getSpecializationDescription(character.specialization)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getSpecializationIcon(specialization: string): string {
  const icons: Record<string, string> = {
    scholar: '📚',
    explorer: '🗺️',
    guardian: '🛡️',
    artist: '🎨',
    diplomat: '🤝',
    inventor: '⚙️',
  };
  return icons[specialization] || '⭐';
}

function getSpecializationDescription(specialization: string): string {
  const descriptions: Record<string, string> = {
    scholar: 'Bonus Intelligence and Wisdom growth',
    explorer: 'Balanced stat growth and discovery bonuses',
    guardian: 'Enhanced Vitality and protective abilities',
    artist: 'Creativity and Charisma specialization',
    diplomat: 'Social interaction and Charisma bonuses',
    inventor: 'Dexterity and Intelligence focus',
  };
  return descriptions[specialization] || 'Unique character build';
}