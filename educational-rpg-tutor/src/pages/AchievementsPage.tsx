import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveText, ResponsiveCard } from '../components/shared/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

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

  const { isMobile, isTablet } = useResponsive();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-yellow-950 to-slate-950">
      <ResponsiveContainer maxWidth="xl" padding="md" animate>
        <div className="text-center mb-6 lg:mb-8">
          <ResponsiveText 
            as="h1" 
            size="3xl" 
            weight="bold" 
            className="bg-gradient-to-r from-yellow-400 to-orange-300 bg-clip-text text-transparent mb-4"
          >
            🏆 Achievement Hall
          </ResponsiveText>
          <ResponsiveText size="lg" className="text-slate-300">
            Celebrate your learning milestones and unlock new badges
          </ResponsiveText>
        </div>

        <ResponsiveGrid columns={isMobile ? 1 : isTablet ? 2 : 3} gap="md">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <ResponsiveCard 
                padding="md" 
                className={`text-center transition-all duration-300 ${
                  achievement.earned 
                    ? 'bg-white/15 border-yellow-400/30 shadow-lg shadow-yellow-400/20' 
                    : 'bg-white/5 border-white/10 opacity-60'
                }`}
              >
                <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r ${getRarityColor(achievement.rarity)} rounded-full flex items-center justify-center text-3xl lg:text-4xl mx-auto mb-4 ${
                  achievement.earned ? 'shadow-lg' : 'grayscale'
                }`}>
                  {achievement.icon}
                </div>
                
                <ResponsiveText 
                  as="h3" 
                  size="lg" 
                  weight="bold" 
                  className={`mb-2 ${achievement.earned ? 'text-white' : 'text-slate-400'}`}
                >
                  {achievement.title}
                </ResponsiveText>
                
                <ResponsiveText 
                  size="sm" 
                  className={`mb-4 ${achievement.earned ? 'text-slate-300' : 'text-slate-500'}`}
                >
                  {achievement.description}
                </ResponsiveText>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}>
                    {achievement.rarity}
                  </span>
                  
                  {achievement.earned ? (
                    <ResponsiveText size="sm" weight="medium" className="text-green-400 flex items-center gap-1">
                      ✅ Earned
                    </ResponsiveText>
                  ) : (
                    <ResponsiveText size="sm" weight="medium" className="text-slate-500 flex items-center gap-1">
                      🔒 Locked
                    </ResponsiveText>
                  )}
                </div>
              </ResponsiveCard>
            </motion.div>
          ))}
        </ResponsiveGrid>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 lg:mt-12"
        >
          <ResponsiveCard padding="md">
            <ResponsiveText as="h2" size="xl" weight="bold" className="text-white mb-6 text-center">
              Achievement Stats
            </ResponsiveText>
            <ResponsiveGrid columns={isMobile ? 2 : 4} gap="md">
              <div className="text-center">
                <ResponsiveText size="2xl" weight="bold" className="text-yellow-400">
                  2
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-slate-300">
                  Earned
                </ResponsiveText>
              </div>
              <div className="text-center">
                <ResponsiveText size="2xl" weight="bold" className="text-blue-400">
                  3
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-slate-300">
                  Remaining
                </ResponsiveText>
              </div>
              <div className="text-center">
                <ResponsiveText size="2xl" weight="bold" className="text-green-400">
                  40%
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-slate-300">
                  Completion
                </ResponsiveText>
              </div>
              <div className="text-center">
                <ResponsiveText size="2xl" weight="bold" className="text-purple-400">
                  250
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-slate-300">
                  Total XP
                </ResponsiveText>
              </div>
            </ResponsiveGrid>
          </ResponsiveCard>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
};