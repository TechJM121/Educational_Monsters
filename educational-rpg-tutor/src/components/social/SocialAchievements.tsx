// Social achievements component for tracking group activities and helping others

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SocialAchievement } from '../../types/social';
import { Achievement } from '../../types/achievement';
import { ProgressBar } from '../shared/ProgressBar';
import { Tooltip } from '../shared/Tooltip';

interface SocialAchievementsProps {
  userId: string;
  earnedAchievements: Achievement[];
  className?: string;
}

export const SocialAchievements: React.FC<SocialAchievementsProps> = ({
  userId,
  earnedAchievements,
  className = ''
}) => {
  const [socialAchievements, setSocialAchievements] = useState<SocialAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'helping' | 'trading' | 'competition' | 'friendship'>('all');

  useEffect(() => {
    loadSocialAchievements();
  }, []);

  const loadSocialAchievements = async () => {
    try {
      setLoading(true);
      
      // Mock social achievements data - in real implementation, this would come from the service
      const mockSocialAchievements: SocialAchievement[] = [
        {
          id: 'social_1',
          name: 'Helpful Friend',
          description: 'Help 5 friends with their learning challenges',
          badgeIcon: '🤝',
          category: 'helping',
          unlockCriteria: { type: 'help_friends', target: 5 },
          xpReward: 100,
          rarity: 'common'
        },
        {
          id: 'social_2',
          name: 'Master Mentor',
          description: 'Help 25 friends complete difficult lessons',
          badgeIcon: '👨‍🏫',
          category: 'helping',
          unlockCriteria: { type: 'help_friends', target: 25 },
          xpReward: 500,
          rarity: 'rare'
        },
        {
          id: 'social_3',
          name: 'Trading Novice',
          description: 'Complete your first successful trade',
          badgeIcon: '🔄',
          category: 'trading',
          unlockCriteria: { type: 'complete_trades', target: 1 },
          xpReward: 50,
          rarity: 'common'
        },
        {
          id: 'social_4',
          name: 'Merchant Master',
          description: 'Complete 50 successful trades',
          badgeIcon: '💰',
          category: 'trading',
          unlockCriteria: { type: 'complete_trades', target: 50 },
          xpReward: 1000,
          rarity: 'epic'
        },
        {
          id: 'social_5',
          name: 'Challenge Champion',
          description: 'Win 10 learning challenges',
          badgeIcon: '🏆',
          category: 'competition',
          unlockCriteria: { type: 'win_challenges', target: 10 },
          xpReward: 300,
          rarity: 'uncommon'
        },
        {
          id: 'social_6',
          name: 'Social Butterfly',
          description: 'Make 20 friends',
          badgeIcon: '🦋',
          category: 'friendship',
          unlockCriteria: { type: 'make_friends', target: 20 },
          xpReward: 200,
          rarity: 'uncommon'
        },
        {
          id: 'social_7',
          name: 'Legendary Helper',
          description: 'Help 100 friends with their studies',
          badgeIcon: '⭐',
          category: 'helping',
          unlockCriteria: { type: 'help_friends', target: 100 },
          xpReward: 2000,
          rarity: 'legendary'
        }
      ];

      setSocialAchievements(mockSocialAchievements);
    } catch (err) {
      console.error('Failed to load social achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-300 bg-gray-50 text-gray-700',
      uncommon: 'border-green-300 bg-green-50 text-green-700',
      rare: 'border-blue-300 bg-blue-50 text-blue-700',
      epic: 'border-purple-300 bg-purple-50 text-purple-700',
      legendary: 'border-yellow-300 bg-yellow-50 text-yellow-700'
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      helping: 'text-green-600 bg-green-100',
      trading: 'text-orange-600 bg-orange-100',
      competition: 'text-red-600 bg-red-100',
      friendship: 'text-blue-600 bg-blue-100'
    };
    return colors[category as keyof typeof colors] || 'text-slate-600 bg-slate-100';
  };

  const isAchievementEarned = (achievementId: string) => {
    return earnedAchievements.some(earned => earned.id === achievementId);
  };

  const getProgress = (achievement: SocialAchievement) => {
    // Mock progress data - in real implementation, this would come from user stats
    const mockProgress = {
      help_friends: 3,
      complete_trades: 0,
      win_challenges: 2,
      make_friends: 8
    };

    const current = mockProgress[achievement.unlockCriteria.type] || 0;
    return Math.min(current, achievement.unlockCriteria.target);
  };

  const filteredAchievements = socialAchievements.filter(achievement => 
    activeCategory === 'all' || achievement.category === activeCategory
  );

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">🤝 Social Achievements</h3>
            <p className="text-green-100 text-sm">Earn badges by helping friends and competing together</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100">Earned</div>
            <div className="text-lg font-bold">
              {earnedAchievements.filter(a => socialAchievements.some(sa => sa.id === a.id)).length}
              /{socialAchievements.length}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex overflow-x-auto border-b border-slate-200">
        {[
          { key: 'all', label: 'All', icon: '🏆' },
          { key: 'helping', label: 'Helping', icon: '🤝' },
          { key: 'trading', label: 'Trading', icon: '🔄' },
          { key: 'competition', label: 'Competition', icon: '⚔️' },
          { key: 'friendship', label: 'Friendship', icon: '👥' }
        ].map((category) => (
          <button
            key={category.key}
            onClick={() => setActiveCategory(category.key as any)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
              activeCategory === category.key
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Achievements List */}
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence>
          {filteredAchievements.map((achievement, index) => {
            const isEarned = isAchievementEarned(achievement.id);
            const progress = getProgress(achievement);
            const progressPercentage = (progress / achievement.unlockCriteria.target) * 100;

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border-b border-slate-100 transition-all ${
                  isEarned ? 'bg-green-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Badge Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 ${
                    isEarned 
                      ? 'border-green-400 bg-green-100' 
                      : `border-slate-300 bg-slate-100 ${progressPercentage > 0 ? 'opacity-75' : 'opacity-50'}`
                  }`}>
                    {achievement.badgeIcon}
                  </div>

                  {/* Achievement Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-bold ${isEarned ? 'text-green-900' : 'text-slate-900'}`}>
                        {achievement.name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(achievement.category)}`}>
                        {achievement.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                    </div>

                    <p className={`text-sm mb-2 ${isEarned ? 'text-green-700' : 'text-slate-600'}`}>
                      {achievement.description}
                    </p>

                    {/* Progress */}
                    {!isEarned && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>Progress: {progress}/{achievement.unlockCriteria.target}</span>
                          <span>{progressPercentage.toFixed(0)}%</span>
                        </div>
                        <ProgressBar
                          current={progress}
                          max={achievement.unlockCriteria.target}
                          color="success"
                          size="sm"
                          showLabel={false}
                        />
                      </div>
                    )}

                    {/* Earned Status */}
                    {isEarned && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <span>✅</span>
                        <span className="font-medium">Achievement Unlocked!</span>
                      </div>
                    )}
                  </div>

                  {/* XP Reward */}
                  <div className="text-right">
                    <Tooltip content="XP Reward">
                      <div className={`text-lg font-bold ${isEarned ? 'text-green-600' : 'text-slate-600'}`}>
                        +{achievement.xpReward}
                      </div>
                    </Tooltip>
                    <div className="text-xs text-slate-500">XP</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          <div className="text-4xl mb-2">🏆</div>
          <p className="text-sm">No achievements in this category</p>
          <p className="text-xs text-slate-400 mt-1">
            Try a different category to see more achievements.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="bg-slate-50 px-4 py-3 text-center">
        <p className="text-xs text-slate-500">
          Help friends, trade items, and compete in challenges to earn social achievements!
        </p>
      </div>
    </div>
  );
};