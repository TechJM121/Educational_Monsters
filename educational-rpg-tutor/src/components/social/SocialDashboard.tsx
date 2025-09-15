// Main social dashboard component that brings together all social features

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaderboard } from './Leaderboard';
import { LearningChallenges } from './LearningChallenges';
import { FriendsSystem } from './FriendsSystem';
import { TradingSystem } from './TradingSystem';
import { SocialAchievements } from './SocialAchievements';
import { ParentalControls } from './ParentalControls';
import { useSocialFeatures } from '../../hooks/useSocialFeatures';
import { CollectibleItem, Achievement } from '../../types';
import { AnimatedButton } from '../shared/AnimatedButton';

interface SocialDashboardProps {
  userId: string;
  classroomId?: string;
  userInventory: CollectibleItem[];
  earnedAchievements: Achievement[];
  isParent?: boolean;
  className?: string;
}

type SocialTab = 'overview' | 'friends' | 'challenges' | 'trading' | 'achievements' | 'controls';

export const SocialDashboard: React.FC<SocialDashboardProps> = ({
  userId,
  classroomId,
  userInventory,
  earnedAchievements,
  isParent = false,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<SocialTab>('overview');
  
  const {
    friends,
    leaderboard: _leaderboard,
    challenges,
    activities,
    error,
    clearError,
    refreshAll
  } = useSocialFeatures({ userId, classroomId });

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '🏠', description: 'Social activity summary' },
    { key: 'friends', label: 'Friends', icon: '👥', description: 'Manage friendships' },
    { key: 'challenges', label: 'Challenges', icon: '⚔️', description: 'Learning competitions' },
    { key: 'trading', label: 'Trading', icon: '🔄', description: 'Trade items with friends' },
    { key: 'achievements', label: 'Social Badges', icon: '🏆', description: 'Social achievements' },
    ...(isParent ? [{ key: 'controls', label: 'Parental Controls', icon: '🛡️', description: 'Safety settings' }] : [])
  ] as const;

  const handleRefresh = async () => {
    await refreshAll();
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🌟 Social Hub</h2>
            <p className="text-indigo-100 mt-1">Connect, compete, and learn together!</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Activity Indicator */}
            <div className="text-right">
              <div className="text-sm text-indigo-100">Active Friends</div>
              <div className="text-xl font-bold">{friends.filter(f => f.isOnline).length}</div>
            </div>
            
            {/* Refresh Button */}
            <AnimatedButton
              onClick={handleRefresh}
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              🔄 Refresh
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-400 mr-3">⚠️</div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as SocialTab)}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? 'text-indigo-600 border-indigo-600 bg-indigo-50'
                  : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={tab.description}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{friends.length}</div>
                  <div className="text-sm text-blue-700">Friends</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{challenges.length}</div>
                  <div className="text-sm text-green-700">Active Challenges</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {userInventory.filter(item => item.tradeable).length}
                  </div>
                  <div className="text-sm text-orange-700">Tradeable Items</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {earnedAchievements.filter(a => a.category === 'social').length}
                  </div>
                  <div className="text-sm text-purple-700">Social Badges</div>
                </div>
              </div>

              {/* Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Leaderboard
                  currentUserId={userId}
                  classroomId={classroomId}
                  limit={5}
                  className="h-fit"
                />
                <LearningChallenges
                  userId={userId}
                  className="h-fit"
                />
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Recent Activity</h3>
                {activities.length > 0 ? (
                  <div className="space-y-2">
                    {activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-3 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-700">{activity.description}</span>
                        <span className="text-slate-400 text-xs">
                          {new Date(activity.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm">No recent activity</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'friends' && (
            <FriendsSystem userId={userId} />
          )}

          {activeTab === 'challenges' && (
            <LearningChallenges userId={userId} />
          )}

          {activeTab === 'trading' && (
            <TradingSystem
              userId={userId}
              userInventory={userInventory}
            />
          )}

          {activeTab === 'achievements' && (
            <SocialAchievements
              userId={userId}
              earnedAchievements={earnedAchievements}
            />
          )}

          {activeTab === 'controls' && isParent && (
            <ParentalControls
              userId={userId}
              isParent={isParent}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};