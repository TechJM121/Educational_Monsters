import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContextualSounds } from '../../hooks/useContextualSounds';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'levelUp' | 'questComplete' | 'skillUnlock' | 'badgeEarned' | 'streakBonus';
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward?: number;
}

interface AchievementNotificationProps {
  achievement: Achievement | null;
  onComplete?: () => void;
  duration?: number;
  enableSound?: boolean;
  enableCelebration?: boolean;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onComplete,
  duration = 4000,
  enableSound = true,
  enableCelebration = true
}) => {
  const { achievementSounds, playAchievementCelebration } = useContextualSounds();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      
      // Play achievement sound
      if (enableSound) {
        switch (achievement.type) {
          case 'levelUp':
            achievementSounds.levelUp();
            break;
          case 'questComplete':
            achievementSounds.questComplete();
            break;
          case 'skillUnlock':
            achievementSounds.skillUnlock();
            break;
          case 'badgeEarned':
            achievementSounds.badgeEarned();
            break;
          case 'streakBonus':
            achievementSounds.badgeEarned({ volume: 0.8 });
            break;
        }
      }

      // Play celebration sequence for major achievements
      if (enableCelebration && (achievement.type === 'levelUp' || achievement.rarity === 'legendary')) {
        setTimeout(() => {
          playAchievementCelebration(
            achievement.type === 'levelUp' ? 'levelUp' : 'majorAchievement'
          );
        }, 300);
      }

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onComplete?.();
        }, 500); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [achievement, enableSound, enableCelebration, duration, onComplete, achievementSounds, playAchievementCelebration]);

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-500'
  };

  const typeIcons = {
    levelUp: '⬆️',
    questComplete: '✅',
    skillUnlock: '🔓',
    badgeEarned: '🏆',
    streakBonus: '🔥'
  };

  const containerVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: -100,
      x: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -50,
      x: 100,
      transition: {
        duration: 0.3
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const glowVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.2, 1],
      opacity: [0, 0.8, 0.4],
      transition: {
        duration: 1,
        times: [0, 0.5, 1],
        ease: "easeOut"
      }
    }
  };

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            className="relative"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Glow effect for rare achievements */}
            {achievement.rarity && achievement.rarity !== 'common' && (
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${rarityColors[achievement.rarity]} blur-xl`}
                variants={glowVariants}
                initial="hidden"
                animate="visible"
              />
            )}
            
            {/* Main notification */}
            <motion.div
              className={`
                relative w-80 p-6 
                bg-white/10 backdrop-blur-md 
                border border-white/20 rounded-2xl 
                shadow-2xl overflow-hidden
              `}
              whileHover={{ scale: 1.02 }}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-white/20 to-transparent rounded-full transform translate-x-16 -translate-y-16" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <motion.div 
                  className="flex items-center gap-3 mb-3"
                  variants={childVariants}
                >
                  <div className="text-2xl">
                    {achievement.icon || typeIcons[achievement.type]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg leading-tight">
                      {achievement.title}
                    </h3>
                    {achievement.rarity && achievement.rarity !== 'common' && (
                      <span className={`
                        inline-block px-2 py-1 text-xs font-medium rounded-full
                        bg-gradient-to-r ${rarityColors[achievement.rarity]} text-white
                      `}>
                        {achievement.rarity.toUpperCase()}
                      </span>
                    )}
                  </div>
                </motion.div>
                
                {/* Description */}
                <motion.p 
                  className="text-white/80 text-sm mb-3"
                  variants={childVariants}
                >
                  {achievement.description}
                </motion.p>
                
                {/* XP Reward */}
                {achievement.xpReward && (
                  <motion.div 
                    className="flex items-center gap-2 text-yellow-300"
                    variants={childVariants}
                  >
                    <span className="text-sm">⭐</span>
                    <span className="text-sm font-medium">
                      +{achievement.xpReward} XP
                    </span>
                  </motion.div>
                )}
                
                {/* Progress bar */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                />
              </div>
              
              {/* Particle effects for legendary achievements */}
              {achievement.rarity === 'legendary' && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                      initial={{
                        x: Math.random() * 300,
                        y: Math.random() * 200,
                        opacity: 0
                      }}
                      animate={{
                        y: [null, -50],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};