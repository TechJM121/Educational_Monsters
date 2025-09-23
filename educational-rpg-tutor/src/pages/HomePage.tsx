import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveText, ResponsiveCard } from '../components/shared/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock guest character data
  const guestCharacter = {
    name: 'Guest Explorer',
    level: 1,
    xp: 0,
    maxXp: 100,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    gold: 0,
    streak: 0
  };

  const quickActions = [
    {
      title: 'Start Learning',
      description: 'Begin your educational quest',
      icon: '📚',
      color: 'from-blue-500 to-cyan-400',
      action: () => navigate('/app/learning')
    },
    {
      title: 'AI Tutor',
      description: 'Chat with your personal AI tutor',
      icon: '🤖',
      color: 'from-purple-500 to-pink-500',
      action: () => navigate('/app/ai-tutor')
    },
    {
      title: 'Character',
      description: 'Customize your avatar',
      icon: '🧙‍♂️',
      color: 'from-indigo-500 to-purple-400',
      action: () => navigate('/app/character')
    },
    {
      title: 'Quests',
      description: 'View available missions',
      icon: '⚔️',
      color: 'from-green-500 to-emerald-400',
      action: () => navigate('/app/quests')
    },
    {
      title: 'Achievements',
      description: 'See your progress',
      icon: '🏆',
      color: 'from-yellow-500 to-orange-400',
      action: () => navigate('/app/achievements')
    }
  ];

  const { isMobile, isTablet, screenWidth } = useResponsive();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: isMobile ? 8 : 15 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-blue-400/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.1, 0.6, 0.1],
              scale: [1, 2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <ResponsiveContainer maxWidth="xl" padding="md" className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 lg:mb-8 gap-4 lg:gap-0"
        >
          <div className="flex-1">
            <ResponsiveText 
              as="h1" 
              size="3xl" 
              weight="bold" 
              className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent"
            >
              Welcome back, {guestCharacter.name}!
            </ResponsiveText>
            <ResponsiveText 
              size="base" 
              className="text-slate-300 mt-2"
            >
              Ready for your next adventure?
            </ResponsiveText>
          </div>
          
          <div className="text-left lg:text-right">
            <ResponsiveText size="sm" className="text-slate-300">
              {currentTime.toLocaleDateString()}
            </ResponsiveText>
            <ResponsiveText size="base" className="text-blue-400 font-mono">
              {currentTime.toLocaleTimeString()}
            </ResponsiveText>
          </div>
        </motion.div>

        {/* Character Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6 lg:mb-8"
        >
          <ResponsiveGrid columns={isMobile ? 2 : 4} gap="md">
            <ResponsiveCard padding="md" className="stat-card">
              <div className="flex items-center gap-2 lg:gap-3 mb-2">
                <span className="text-xl lg:text-2xl">⭐</span>
                <ResponsiveText size="sm" className="text-slate-300">Level</ResponsiveText>
              </div>
              <ResponsiveText size="2xl" weight="bold" className="text-white">
                {guestCharacter.level}
              </ResponsiveText>
            </ResponsiveCard>

            <ResponsiveCard padding="md" className="stat-card">
              <div className="flex items-center gap-2 lg:gap-3 mb-2">
                <span className="text-xl lg:text-2xl">💎</span>
                <ResponsiveText size="sm" className="text-slate-300">XP</ResponsiveText>
              </div>
              <ResponsiveText size="2xl" weight="bold" className="text-white">
                {guestCharacter.xp}
              </ResponsiveText>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(guestCharacter.xp / guestCharacter.maxXp) * 100}%` }}
                />
              </div>
            </ResponsiveCard>

            <ResponsiveCard padding="md" className="stat-card">
              <div className="flex items-center gap-2 lg:gap-3 mb-2">
                <span className="text-xl lg:text-2xl">🪙</span>
                <ResponsiveText size="sm" className="text-slate-300">Gold</ResponsiveText>
              </div>
              <ResponsiveText size="2xl" weight="bold" className="text-white">
                {guestCharacter.gold}
              </ResponsiveText>
            </ResponsiveCard>

            <ResponsiveCard padding="md" className="stat-card">
              <div className="flex items-center gap-2 lg:gap-3 mb-2">
                <span className="text-xl lg:text-2xl">🔥</span>
                <ResponsiveText size="sm" className="text-slate-300">Streak</ResponsiveText>
              </div>
              <ResponsiveText size="2xl" weight="bold" className="text-white">
                {guestCharacter.streak} days
              </ResponsiveText>
            </ResponsiveCard>
          </ResponsiveGrid>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          <ResponsiveText as="h2" size="xl" weight="bold" className="text-white mb-4 lg:mb-6">
            Quick Actions
          </ResponsiveText>
          <ResponsiveGrid columns={isMobile ? 1 : isTablet ? 2 : 4} gap="md">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 lg:p-6 border border-white/20 hover:border-blue-400/30 transition-all duration-300 text-left group quick-action"
              >
                <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-xl lg:text-2xl mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <ResponsiveText 
                  as="h3" 
                  size="base" 
                  weight="semibold" 
                  className="text-white mb-2 group-hover:text-blue-300 transition-colors"
                >
                  {action.title}
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-slate-400">
                  {action.description}
                </ResponsiveText>
              </motion.button>
            ))}
          </ResponsiveGrid>
        </motion.div>

        {/* Guest Mode Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <ResponsiveCard padding="md" className="bg-yellow-900/20 border-yellow-600/30">
            <div className="flex items-start gap-3 lg:gap-4">
              <span className="text-2xl lg:text-3xl flex-shrink-0">👤</span>
              <div className="flex-1 min-w-0">
                <ResponsiveText 
                  as="h3" 
                  size="base" 
                  weight="semibold" 
                  className="text-yellow-300 mb-2"
                >
                  Guest Mode Active
                </ResponsiveText>
                <ResponsiveText size="sm" className="text-yellow-200 mb-4">
                  You're currently exploring LearnCraft as a guest. Your progress won't be saved, 
                  but you can try out all the features to see what makes learning magical!
                </ResponsiveText>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/auth')}
                  className="px-3 lg:px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors text-sm touch-target"
                >
                  <span className="hidden sm:inline">Create Account to Save Progress</span>
                  <span className="sm:hidden">Create Account</span>
                </motion.button>
              </div>
            </div>
          </ResponsiveCard>
        </motion.div>
      </ResponsiveContainer>
    </div>
  );
};