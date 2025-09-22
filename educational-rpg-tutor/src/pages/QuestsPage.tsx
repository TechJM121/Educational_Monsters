import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, ResponsiveText, ResponsiveCard } from '../components/shared/ResponsiveContainer';
import { ResponsiveButton } from '../components/shared/ResponsiveButton';
import { useResponsive } from '../hooks/useResponsive';

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

  const { isMobile } = useResponsive();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-slate-950">
      <ResponsiveContainer maxWidth="lg" padding="md" animate>
        <div className="text-center mb-6 lg:mb-8">
          <ResponsiveText 
            as="h1" 
            size="3xl" 
            weight="bold" 
            className="bg-gradient-to-r from-orange-400 to-red-300 bg-clip-text text-transparent mb-4"
          >
            ⚔️ Quest Journal
          </ResponsiveText>
          <ResponsiveText size="lg" className="text-slate-300">
            Track your learning adventures and earn rewards
          </ResponsiveText>
        </div>

        <div className="space-y-4 lg:space-y-6">
          {quests.map((quest, index) => (
            <motion.div
              key={quest.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <ResponsiveCard padding="md">
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-orange-500 to-red-400 rounded-xl flex items-center justify-center text-2xl lg:text-3xl flex-shrink-0">
                    {quest.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-2 gap-2">
                      <ResponsiveText 
                        as="h3" 
                        size="lg" 
                        weight="bold" 
                        className="text-white truncate"
                      >
                        {quest.title}
                      </ResponsiveText>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${
                        quest.difficulty === 'Easy' ? 'bg-green-600 text-green-100' :
                        quest.difficulty === 'Medium' ? 'bg-yellow-600 text-yellow-100' :
                        'bg-red-600 text-red-100'
                      }`}>
                        {quest.difficulty}
                      </span>
                    </div>
                    
                    <ResponsiveText size="sm" className="text-slate-300 mb-4">
                      {quest.description}
                    </ResponsiveText>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <ResponsiveText size="sm" className="text-slate-400">
                          Progress
                        </ResponsiveText>
                        <ResponsiveText size="sm" weight="bold" className="text-white">
                          {quest.progress}/{quest.total}
                        </ResponsiveText>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-red-400 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                      <ResponsiveText size="sm" weight="medium" className="text-yellow-400">
                        🏆 {quest.reward}
                      </ResponsiveText>
                      <ResponsiveButton 
                        variant="primary" 
                        size="md" 
                        fullWidth={isMobile}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 border-orange-400"
                      >
                        Continue Quest
                      </ResponsiveButton>
                    </div>
                  </div>
                </div>
              </ResponsiveCard>
            </motion.div>
          ))}
        </div>
      </ResponsiveContainer>
    </div>
  );
};