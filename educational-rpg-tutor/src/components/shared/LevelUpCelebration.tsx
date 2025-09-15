import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleSystem } from './ParticleSystem';

interface LevelUpCelebrationProps {
  isVisible: boolean;
  newLevel: number;
  onComplete?: () => void;
  duration?: number;
}

export function LevelUpCelebration({
  isVisible,
  newLevel,
  onComplete,
  duration = 4000
}: LevelUpCelebrationProps) {
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowParticles(true);
      
      const timer = setTimeout(() => {
        setShowParticles(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Particle Effects */}
          <ParticleSystem
            isActive={showParticles}
            particleCount={30}
            duration={duration}
            colors={['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#3b82f6', '#8b5cf6']}
            types={['star', 'sparkle', 'diamond']}
          />

          {/* Main Celebration Modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                duration: 0.8 
              }}
              className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-8 rounded-2xl shadow-2xl text-center max-w-md mx-4"
            >
              {/* Level Up Icon */}
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl mb-4"
              >
                🌟
              </motion.div>

              {/* Level Up Text */}
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-rpg text-white mb-2 drop-shadow-lg"
              >
                LEVEL UP!
              </motion.h2>

              {/* New Level */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.5,
                  type: "spring",
                  stiffness: 300
                }}
                className="text-6xl font-rpg text-white mb-4 drop-shadow-lg"
              >
                {newLevel}
              </motion.div>

              {/* Congratulations Text */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-lg text-white/90 mb-4"
              >
                Congratulations! You've reached a new level!
              </motion.p>

              {/* Rewards Text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="bg-white/20 backdrop-blur-sm rounded-lg p-4"
              >
                <p className="text-white font-medium mb-2">🎁 Level Rewards:</p>
                <div className="flex justify-center gap-4 text-sm text-white/90">
                  <span>+3 Stat Points</span>
                  <span>•</span>
                  <span>New Abilities</span>
                  <span>•</span>
                  <span>Bonus XP</span>
                </div>
              </motion.div>

              {/* Animated Border */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-4 border-white/30"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(255,255,255,0.3)",
                    "0 0 40px rgba(255,255,255,0.6)",
                    "0 0 20px rgba(255,255,255,0.3)"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}