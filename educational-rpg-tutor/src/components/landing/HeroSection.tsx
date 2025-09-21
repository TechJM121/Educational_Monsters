import React from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onGetStarted: () => void;
  onWatchDemo?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onWatchDemo }) => {
  return (
    <section className="relative z-10 min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-6xl mx-auto text-center">
        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-rpg mb-8 leading-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              Learn
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Through
            </span>
            <br />
            <motion.span
              className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: 'linear' 
              }}
            >
              Adventure
            </motion.span>
          </motion.h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
        >
          Transform your education into an epic RPG quest. Level up your skills, unlock achievements, 
          and embark on personalized learning adventures powered by AI.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 20px 40px rgba(147, 51, 234, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white font-bold text-lg shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10">Start Your Quest</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: '-100%' }}
              whileHover={{ x: '0%' }}
              transition={{ duration: 0.3 }}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onWatchDemo}
            className="px-10 py-5 border-2 border-purple-500 rounded-full text-purple-400 font-bold text-lg hover:bg-purple-500/10 transition-all duration-300 backdrop-blur-sm"
          >
            Watch Demo
          </motion.button>
        </motion.div>

        {/* Hero visual elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="relative"
        >
          {/* Floating achievement badges */}
          <div className="flex justify-center items-center gap-8 flex-wrap">
            {[
              { icon: '🏆', label: 'Achievements', color: 'from-yellow-400 to-orange-500' },
              { icon: '⚔️', label: 'Quests', color: 'from-red-400 to-pink-500' },
              { icon: '🎯', label: 'Skills', color: 'from-blue-400 to-cyan-500' },
              { icon: '👥', label: 'Guilds', color: 'from-green-400 to-emerald-500' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 1.2 + index * 0.1,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  repeatDelay: 3
                }}
                whileHover={{ scale: 1.2, rotate: 360 }}
                className={`backdrop-blur-md bg-gradient-to-r ${item.color} rounded-2xl p-4 shadow-xl border border-white/20 cursor-pointer`}
              >
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-sm font-semibold text-white">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-purple-400 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-purple-400 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};