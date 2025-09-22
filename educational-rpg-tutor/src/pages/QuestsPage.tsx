import React from 'react';
import { motion } from 'framer-motion';

export const QuestsPage: React.FC = () => {
  const quests = [
    {
      title: 'Master of Mathematics',
      description: 'Complete 10 math problems',
      progress: 3,
      total: 10,
      reward: '100 XP + Math Badge',
      difficulty: 'Easy',
      icon: '🔢'
    },
    {
      title: 'Science Explorer',
      description: 'Discover 5 scientific facts',
      progress: 1,
      total: 5,
      reward: '150 XP + Explorer Badge',
      difficulty: 'Medium',
      icon: '🧪'
    },
    {
      title: 'Reading Champion',
      description: 'Read for 30 minutes daily for a week',
      progress: 2,
      total: 7,
      reward: '200 XP + Reading Badge',
      difficulty: 'Hard',
      icon: '📚'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-slate-950 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-300 bg-clip-text text-transparent mb-4">
            ⚔️ Quest Journal
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl">
            Track your learning adventures and earn rewards
          </p>
        </div>

        <div className="space-y-6">
          {quests.map((quest, index) => (
            <motion.div
              key={quest.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-400 rounded-xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0">
                  {quest.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                    <h3 className="text-lg sm:text-2xl font-bold text-white truncate">{quest.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      quest.difficulty === 'Easy' ? 'bg-green-600 text-green-100' :
                      quest.difficulty === 'Medium' ? 'bg-yellow-600 text-yellow-100' :
                      'bg-red-600 text-red-100'
                    }`}>
                      {quest.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-slate-300 mb-4 text-sm sm:text-base">{quest.description}</p>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-bold">{quest.progress}/{quest.total}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-400 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-yellow-400 font-medium text-sm sm:text-base">
                      🏆 {quest.reward}
                    </div>
                    <button className="px-4 sm:px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg text-white font-medium hover:from-orange-500 hover:to-red-500 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto">
                      Continue Quest
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};