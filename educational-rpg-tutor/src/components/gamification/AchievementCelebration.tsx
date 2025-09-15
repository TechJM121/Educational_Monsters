import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AchievementBadge } from './AchievementBadge';
import type { Achievement } from '../../types/achievement';

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  onClose: () => void;
  autoCloseDelay?: number;
}

const rarityColors = {
  1: 'from-gray-400 to-gray-600', // Common
  2: 'from-green-400 to-green-600', // Uncommon
  3: 'from-blue-400 to-blue-600', // Rare
  4: 'from-purple-400 to-purple-600', // Epic
  5: 'from-yellow-400 to-yellow-600', // Legendary
};

const rarityNames = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Epic',
  5: 'Legendary',
};

export function AchievementCelebration({
  achievement,
  onClose,
  autoCloseDelay = 5000
}: AchievementCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (achievement) {
      // Generate particles for celebration effect
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5
      }));
      setParticles(newParticles);

      // Auto close after delay
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [achievement, onClose, autoCloseDelay]);

  if (!achievement) return null;

  const rarity = achievement.rarityLevel as keyof typeof rarityColors;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              opacity: 0, 
              scale: 0,
              x: '50vw',
              y: '50vh'
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: `${particle.x}vw`,
              y: `${particle.y}vh`
            }}
            transition={{
              duration: 2,
              delay: particle.delay,
              ease: "easeOut"
            }}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full pointer-events-none"
          />
        ))}

        {/* Main celebration modal */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 20,
            duration: 0.6
          }}
          className="relative bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${rarityColors[rarity]} opacity-20 blur-xl`} />
          
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative z-10"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              🎉 Achievement Unlocked! 🎉
            </h2>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${rarityColors[rarity]} mb-4`}>
              {rarityNames[rarity]} Achievement
            </div>
          </motion.div>

          {/* Achievement Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.4,
              type: "spring",
              stiffness: 300,
              damping: 15
            }}
            className="mb-6"
          >
            <div className="flex justify-center">
              <AchievementBadge
                achievement={achievement}
                userAchievement={{
                  id: 'temp',
                  userId: 'temp',
                  achievementId: achievement.id,
                  unlockedAt: new Date()
                }}
                size="lg"
                className="transform hover:scale-110 transition-transform"
              />
            </div>
          </motion.div>

          {/* Achievement Details */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="relative z-10"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {achievement.name}
            </h3>
            <p className="text-slate-600 mb-6">
              {achievement.description}
            </p>
          </motion.div>

          {/* Close Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={onClose}
            className="relative z-10 px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Awesome!
          </motion.button>

          {/* Sparkle effects */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute top-4 right-4 text-yellow-400 text-2xl"
          >
            ✨
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-4 left-4 text-yellow-400 text-xl"
          >
            ⭐
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}