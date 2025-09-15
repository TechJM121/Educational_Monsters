import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { WorldsGrid } from './WorldsGrid';
import { QuestTracker } from '../quests/QuestTracker';
import { useWorlds } from '../../hooks/useWorlds';
import { useQuests } from '../../hooks/useQuests';
import { useAuth } from '../../hooks/useAuth';

export const WorldsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'worlds' | 'quests'>('worlds');
  const [recommendedWorldId, setRecommendedWorldId] = useState<string | null>(null);

  const {
    worlds,
    loading: worldsLoading,
    error: worldsError,
    refreshWorlds,
    unlockWorld,
    updateWorldProgress,
    getRecommendedWorld
  } = useWorlds(user?.id || null);

  const {
    dailyQuests,
    weeklyQuests,
    learningStreak,
    loading: questsLoading,
    error: questsError,
    refreshQuests,
    generateDailyQuests,
    generateWeeklyQuests,
    updateQuestProgress: _updateQuestProgress,
    completeQuest
  } = useQuests(user?.id || null);

  // Get recommended world on mount
  useEffect(() => {
    const loadRecommendedWorld = async () => {
      if (user?.id) {
        const recommended = await getRecommendedWorld();
        setRecommendedWorldId(recommended);
      }
    };
    loadRecommendedWorld();
  }, [user?.id, getRecommendedWorld]);

  const handleEnterWorld = async (worldId: string) => {
    if (!user?.id) return;

    // Update world progress (time spent will be tracked by the learning components)
    await updateWorldProgress(worldId, { timeSpent: 0 });
    
    // Navigate to world-specific learning interface
    // This would typically use React Router or similar navigation
    console.log(`Entering world: ${worldId}`);
    
    // For now, we'll show an alert
    const world = worlds.find(w => w.id === worldId);
    alert(`Welcome to ${world?.name}! Learning interface would open here.`);
  };

  const handleUnlockWorld = async (worldId: string) => {
    const success = await unlockWorld(worldId);
    if (success) {
      const world = worlds.find(w => w.id === worldId);
      alert(`🎉 ${world?.name} has been unlocked! You can now explore this learning world.`);
    } else {
      const world = worlds.find(w => w.id === worldId);
      alert(`You need to reach level ${world?.unlockRequirements.minimumLevel} to unlock ${world?.name}.`);
    }
  };

  const handleStartQuest = (questId: string) => {
    const quest = [...dailyQuests, ...weeklyQuests].find(q => q.id === questId);
    if (quest) {
      console.log(`Starting quest: ${quest.title}`);
      // Navigate to appropriate learning activity based on quest objectives
      alert(`Starting quest: ${quest.title}. Learning activity would begin here.`);
    }
  };

  const handleCompleteQuest = async (questId: string) => {
    await completeQuest(questId);
    const quest = [...dailyQuests, ...weeklyQuests].find(q => q.id === questId);
    if (quest) {
      alert(`🎉 Quest completed: ${quest.title}! Rewards have been added to your character.`);
    }
  };

  const handleGenerateQuests = async () => {
    await Promise.all([
      generateDailyQuests(),
      generateWeeklyQuests()
    ]);
  };

  const tabs = [
    { id: 'worlds', label: 'Learning Worlds', icon: '🌍' },
    { id: 'quests', label: 'Quests & Challenges', icon: '⚔️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Learning Adventure
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Explore worlds and complete quests to level up your character
              </p>
            </div>
            
            {/* Learning Streak Display */}
            {learningStreak && (
              <div className="flex items-center space-x-2 bg-orange-100 dark:bg-orange-900/30 px-3 py-2 rounded-lg">
                <span className="text-orange-600 dark:text-orange-400">🔥</span>
                <span className="text-sm font-medium text-orange-800 dark:text-orange-300">
                  {learningStreak.currentStreak} day streak
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'worlds' | 'quests')}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'worlds' ? (
            <WorldsGrid
              worlds={worlds}
              loading={worldsLoading}
              error={worldsError}
              onEnterWorld={handleEnterWorld}
              onUnlockWorld={handleUnlockWorld}
              recommendedWorldId={recommendedWorldId}
            />
          ) : (
            <QuestTracker
              dailyQuests={dailyQuests}
              weeklyQuests={weeklyQuests}
              learningStreak={learningStreak}
              loading={questsLoading}
              error={questsError}
              onStartQuest={handleStartQuest}
              onCompleteQuest={handleCompleteQuest}
              onGenerateQuests={handleGenerateQuests}
            />
          )}
        </motion.div>
      </div>

      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-6 right-6">
        <motion.button
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (activeTab === 'worlds') {
              refreshWorlds();
            } else {
              refreshQuests();
            }
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
};