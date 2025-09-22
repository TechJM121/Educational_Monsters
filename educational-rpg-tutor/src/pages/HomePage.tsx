import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
      title: 'Character',
      description: 'Customize your avatar',
      icon: '🧙‍♂️',
      color: 'from-purple-500 to-pink-400',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 sm:p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }, (_, i) => (
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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0"
        >
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Welcome back, {guestCharacter.name}!
            </h1>
            <p className="text-slate-300 mt-2 text-sm sm:text-base">Ready for your next adventure?</p>
          </div>
          
          <div className="text-left sm:text-right">
            <div className="text-slate-300 text-xs sm:text-sm">
              {currentTime.toLocaleDateString()}
            </div>
            <div className="text-blue-400 font-mono text-sm sm:text-base">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </motion.div>

        {/* Character Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <span className="text-xl sm:text-2xl">⭐</span>
              <span className="text-slate-300 text-sm sm:text-base">Level</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{guestCharacter.level}</div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <span className="text-xl sm:text-2xl">💎</span>
              <span className="text-slate-300 text-sm sm:text-base">XP</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{guestCharacter.xp}</div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(guestCharacter.xp / guestCharacter.maxXp) * 100}%` }}
              />
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <span className="text-xl sm:text-2xl">🪙</span>
              <span className="text-slate-300 text-sm sm:text-base">Gold</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{guestCharacter.gold}</div>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <span className="text-xl sm:text-2xl">🔥</span>
              <span className="text-slate-300 text-sm sm:text-base">Streak</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{guestCharacter.streak} days</div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-blue-400/30 transition-all duration-300 text-left group"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <h3 className="text-white font-semibold mb-2 group-hover:text-blue-300 transition-colors text-sm sm:text-base">
                  {action.title}
                </h3>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {action.description}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Guest Mode Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="backdrop-blur-xl bg-yellow-900/20 border border-yellow-600/30 rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="text-2xl sm:text-3xl">👤</span>
            <div className="flex-1">
              <h3 className="text-yellow-300 font-semibold mb-2 text-sm sm:text-base">Guest Mode Active</h3>
              <p className="text-yellow-200 text-xs sm:text-sm mb-4">
                You're currently exploring LearnCraft as a guest. Your progress won't be saved, 
                but you can try out all the features to see what makes learning magical!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="px-3 sm:px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition-colors text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Create Account to Save Progress</span>
                <span className="sm:hidden">Create Account</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};