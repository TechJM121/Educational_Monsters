import React from 'react';
import { motion } from 'framer-motion';

export const AchievementsPage: React.FC = () => {
  const achievements = [
    {
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: '👶',
      earned: true,
      rarity: 'Common'
    },
    {
      title: 'Quick Learner',
      description: 'Answer 10 questions correctly in a row',
      icon: '⚡',
      earned: true,
      rarity: 'Uncommon'
    },
    {
      title: 'Math Wizard',
      description: 'Master all basic math operations',
      icon: '🧙‍♂️',
      earned: false,
      rarity: 'Rare'
    },
    {
      title: 'Science Genius',
      description: 'Complete all science modules',
      icon: '🧠',
      earned: false,
      rarity: 'Epic'
    },
    {
      title: 'Ultimate Scholar',
      description: 'Achieve mastery in all subjects',
      icon: '👑',
      earned: false,
      rarity: 'Legendary'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'from-gray-500 to-gray-400';
      case 'Uncommon': return 'from-green-500 to-green-400';
      case 'Rare': return 'from-blue-500 to-blue-400';
      case 'Epic': return 'from-purple-500 to-purple-400';
      case 'Legendary': return 'from-yellow-500 to-orange-400';
      default: return 'from-gray-500 to-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-yellow-950 to-slate-950 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent mb-4">
            🏆 Achievement Hall
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl">
            Celebrate your learning milestones and unlock new badges
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`backdrop-blur-xl rounded-2xl p-4 sm:p-6 border transition-all duration-300 ${
                achievement.earned 
                  ? 'bg-white/15 border-yellow-400/30 shadow-lg shadow-yellow-400/20' 
                  : 'bg-white/5 border-white/10 opacity-60'
              }`}
            >
              <div className="text-center">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-full flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-4 ${
                  achievement.earned ? 'shadow-lg' : 'grayscale'
                }`}>
                  {achievement.icon}
                </div>
                
                <h3 className={`text-lg sm:text-xl font-bold mb-2 ${
                  achievement.earned ? 'text-white' : 'text-slate-400'
                }`}>
                  {achievement.title}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  achievement.earned ? 'text-slate-300' : 'text-slate-500'
                }`}>
                  {achievement.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}>
                    {achievement.rarity}
                  </span>
                  
                  {achievement.earned ? (
                    <span className="text-green-400 font-medium flex items-center gap-1">
                      ✅ Earned
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      🔒 Locked
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Achievement Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">2</div>
              <div className="text-slate-300">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">3</div>
              <div className="text-slate-300">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">40%</div>
              <div className="text-slate-300">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">250</div>
              <div className="text-slate-300">Total XP</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};