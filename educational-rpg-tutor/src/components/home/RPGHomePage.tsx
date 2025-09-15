import React, { useState, useEffect } from 'react';
import { CharacterAvatar } from '../character/CharacterAvatar';
import { DashboardStats } from './DashboardStats';
import { QuickActions } from './QuickActions';
import { AchievementBadge } from '../gamification/AchievementBadge';
import { QuestTracker } from '../gamification/QuestTracker';
import { InventoryGrid } from '../gamification/InventoryGrid';
import { useXPSystem } from '../../hooks/useXPSystem';
import type { Character } from '../../types/character';
import type { Achievement, UserAchievement, CollectibleItem, UserInventory } from '../../types/achievement';
import type { Quest, UserQuest, LearningStreak } from '../../types/quest';

interface RPGHomePageProps {
  character: Character;
  achievements?: Achievement[];
  userAchievements?: UserAchievement[];
  quests?: Array<{ quest: Quest; userQuest: UserQuest }>;
  inventory?: Array<{ item: CollectibleItem; inventory: UserInventory }>;
  learningStreak?: LearningStreak;
  onStartLearning?: () => void;
  onViewInventory?: () => void;
  onViewAchievements?: () => void;
  onCustomizeCharacter?: () => void;
  onViewLeaderboard?: () => void;
  className?: string;
}

export function RPGHomePage({
  character,
  achievements = [],
  userAchievements = [],
  quests = [],
  inventory = [],
  learningStreak,
  onStartLearning,
  onViewInventory,
  onViewAchievements,
  onCustomizeCharacter,
  onViewLeaderboard,
  className = ''
}: RPGHomePageProps) {
  const { calculateXPForNextLevel, calculateEffectiveStats } = useXPSystem();
  const [greeting, setGreeting] = useState('');

  // Calculate derived values
  const xpForNextLevel = calculateXPForNextLevel(character.level);
  const effectiveStats = calculateEffectiveStats(character.stats, character.specialization);

  // Set time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // Get recent achievements (last 5)
  const recentAchievements = userAchievements
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 5)
    .map(userAchievement => {
      const achievement = achievements.find(a => a.id === userAchievement.achievementId);
      return achievement ? { achievement, userAchievement } : null;
    })
    .filter(Boolean) as Array<{ achievement: Achievement; userAchievement: UserAchievement }>;

  // Get featured inventory items (rarest first)
  const featuredItems = inventory
    .sort((a, b) => {
      const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
      return rarityOrder[b.item.rarity] - rarityOrder[a.item.rarity];
    })
    .slice(0, 8);

  return (
    <div className={`min-h-screen bg-rpg-pattern ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="rpg-card mb-8">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            {/* Character Avatar */}
            <div className="flex-shrink-0">
              <CharacterAvatar
                character={character}
                size="xl"
                showLevel={true}
                showEquipment={true}
              />
            </div>

            {/* Character Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-rpg text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mb-2">
                {greeting}, {character.name}!
              </h1>
              <p className="text-xl text-slate-300 mb-4">
                Ready to continue your learning adventure?
              </p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-slate-300">Level {character.level}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-blue-400">💎</span>
                  <span className="text-slate-300">{character.totalXP.toLocaleString()} Total XP</span>
                </div>
                {learningStreak && (
                  <div className="flex items-center gap-1">
                    <span className="text-orange-400">🔥</span>
                    <span className="text-slate-300">{learningStreak.currentStreak} Day Streak</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-purple-400">🏆</span>
                  <span className="text-slate-300">{userAchievements.length} Achievements</span>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
              <div className="flex-shrink-0">
                <div className="text-center mb-2">
                  <div className="text-sm text-slate-400">Recent Achievements</div>
                </div>
                <div className="flex gap-2">
                  {recentAchievements.map(({ achievement, userAchievement }) => (
                    <AchievementBadge
                      key={userAchievement.id}
                      achievement={achievement}
                      userAchievement={userAchievement}
                      size="md"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Character Stats */}
          <div className="xl:col-span-1">
            <DashboardStats
              character={character}
              xpForNextLevel={xpForNextLevel}
              effectiveStats={effectiveStats}
              learningStreak={learningStreak}
            />
          </div>

          {/* Middle Column - Quests and Actions */}
          <div className="xl:col-span-1 space-y-6">
            {/* Active Quests */}
            <div className="rpg-card">
              <h3 className="text-xl font-rpg text-slate-200 mb-4 flex items-center gap-2">
                <span>🎯</span>
                Active Quests
              </h3>
              <QuestTracker
                quests={quests}
                maxDisplay={3}
                showCompleted={false}
              />
            </div>

            {/* Quick Actions */}
            <QuickActions
              onStartLearning={onStartLearning}
              onViewInventory={onViewInventory}
              onViewAchievements={onViewAchievements}
              onCustomizeCharacter={onCustomizeCharacter}
              onViewLeaderboard={onViewLeaderboard}
            />
          </div>

          {/* Right Column - Inventory and Achievements */}
          <div className="xl:col-span-1 space-y-6">
            {/* Featured Inventory */}
            <div className="rpg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-rpg text-slate-200 flex items-center gap-2">
                  <span>🎒</span>
                  Featured Items
                </h3>
                <button
                  onClick={onViewInventory}
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  View All
                </button>
              </div>
              <InventoryGrid
                items={featuredItems}
                maxDisplay={8}
                showQuantity={true}
                gridCols={4}
              />
            </div>

            {/* Achievement Showcase */}
            <div className="rpg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-rpg text-slate-200 flex items-center gap-2">
                  <span>🏆</span>
                  Achievements
                </h3>
                <button
                  onClick={onViewAchievements}
                  className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
                >
                  View All
                </button>
              </div>
              
              {recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {recentAchievements.slice(0, 3).map(({ achievement, userAchievement }) => (
                    <div key={userAchievement.id} className="flex items-center gap-3 p-2 bg-slate-700 rounded-lg">
                      <AchievementBadge
                        achievement={achievement}
                        userAchievement={userAchievement}
                        size="sm"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-200 truncate">
                          {achievement.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">🎯</div>
                  <div className="text-slate-400">No achievements yet</div>
                  <div className="text-sm text-slate-500 mt-1">
                    Start learning to earn your first badge!
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}